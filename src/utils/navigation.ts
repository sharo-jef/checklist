/**
 * Navigation Utilities for Checklist Management
 *
 * Pure utility functions for computing navigation state (first unchecked item,
 * next incomplete checklist, etc.). These functions are stateless and have no
 * side effects, making them easily testable and reusable across components.
 */

import { ChecklistCategory, MenuType, ItemStatesMap } from "@/types/checklist";
import { isItemComplete } from "@/utils/checklist";

/**
 * Finds the index of the first unchecked item in a category's first checklist.
 *
 * This function is used to determine where to place the active item border
 * when navigating to a new checklist.
 *
 * @param categoryId - The ID of the category containing the checklist
 * @param checklistData - Array of all checklist categories
 * @param itemStates - Current runtime state of all items
 * @returns Index of first unchecked item, or -1 if all checked or category not found
 *
 * @example
 * ```typescript
 * const index = getFirstUncheckedIndex("pre-drive", checklistData, itemStates);
 * if (index >= 0) {
 *   setActiveItemIndex(index);
 * } else {
 *   // All items checked - hide active border
 *   setActiveItemIndex(-1);
 * }
 * ```
 *
 * Edge cases:
 * - Category not found → returns -1
 * - Category has no checklists → returns -1
 * - All items checked → returns -1
 * - ItemStates not initialized → returns 0 (first item is unchecked by default)
 */
export function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number {
  const category = checklistData.find((cat) => cat.id === categoryId);
  const checklist = category?.checklists[0];

  if (!checklist) return -1;

  const firstUncheckedIndex = checklist.items.findIndex(
    (item) =>
      (itemStates[categoryId]?.[checklist.id]?.[item.id] ?? "unchecked") ===
      "unchecked"
  );

  return firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1;
}

/**
 * Finds the next incomplete checklist for a given menu type.
 *
 * Searches through checklists matching the specified menu type and returns
 * the first one with unchecked items. If all checklists are complete, returns
 * the last checklist (allows pilot to review completed checklists).
 *
 * @param menuType - The type of menu (NORMAL or NON_NORMAL)
 * @param checklistData - Array of all checklist categories
 * @param itemStates - Current runtime state of all items
 * @returns Category ID of next incomplete checklist, or last category ID if all complete, or null if no categories
 *
 * @example
 * ```typescript
 * const nextCategoryId = getNextIncompleteChecklist(
 *   MenuType.NORMAL,
 *   checklistData,
 *   itemStates
 * );
 *
 * if (nextCategoryId) {
 *   setActiveCategory(nextCategoryId);
 * }
 * ```
 *
 * Edge cases:
 * - No categories for menu type → returns null
 * - All checklists complete → returns last category ID
 * - ItemStates empty (nothing checked yet) → returns first category ID
 * - Category has no checklist → skips to next category
 */
export function getNextIncompleteChecklist(
  menuType: MenuType,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): string | null {
  const categories = checklistData.filter((cat) => cat.menuType === menuType);

  if (categories.length === 0) return null;

  // Find first incomplete checklist
  for (const category of categories) {
    const checklist = category.checklists[0];
    if (!checklist) continue;

    const checklistState = itemStates[category.id]?.[checklist.id];
    if (!checklistState) {
      // No items checked yet - this is the next incomplete checklist
      return category.id;
    }

    const isComplete = checklist.items.every((item) => {
      const status = checklistState[item.id];
      return isItemComplete(status);
    });

    if (!isComplete) {
      return category.id;
    }
  }

  // All complete - return last checklist (allows review)
  return categories[categories.length - 1].id;
}

/**
 * Determines if there is a next checklist after the current one in a menu type.
 *
 * Used to show/hide the "NEXT" button in the UI. The NEXT button should only
 * appear when the user is not on the last checklist in the sequence.
 *
 * @param activeCategory - Current category ID
 * @param checklistData - Array of all checklist categories
 * @param menuType - The type of menu to check within
 * @returns true if there's a next checklist, false if on last or category not found
 *
 * @example
 * ```typescript
 * const showNext = hasNextChecklist(
 *   activeCategory,
 *   checklistData,
 *   MenuType.NORMAL
 * );
 *
 * return (
 *   <ChecklistDisplay
 *     hasNextChecklist={showNext}
 *     onNext={handleNext}
 *   />
 * );
 * ```
 *
 * Edge cases:
 * - Category not found → returns false
 * - On last checklist → returns false
 * - Only one checklist in menu type → returns false
 * - No categories for menu type → returns false
 */
export function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean {
  const categories = checklistData.filter((cat) => cat.menuType === menuType);
  const currentIndex = categories.findIndex((cat) => cat.id === activeCategory);

  return currentIndex >= 0 && currentIndex < categories.length - 1;
}
