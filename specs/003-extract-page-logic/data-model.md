# Data Model: Extracted Business Logic

**Feature**: Extract Business Logic from Page Component  
**Date**: 2025-11-20  
**Status**: Phase 1 Design

## Overview

This document defines the data structures, types, and interfaces for the extracted navigation utilities and hooks. All types follow strict TypeScript conventions and maintain compatibility with existing `@/types/checklist` definitions.

---

## Core Data Types (Existing)

### ChecklistItemStatus

```typescript
// Defined in: src/types/checklist.ts (unchanged)
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";
```

**Usage**: Represents the completion state of a checklist item.

### ItemStatesMap

```typescript
// Defined in: src/hooks/useChecklist.ts (unchanged)
type ItemStatesMap = {
  [categoryId: string]: {
    [checklistId: string]: {
      [itemId: string]: ChecklistItemStatus;
    };
  };
};
```

**Usage**: Runtime state mapping from category → checklist → item → status.

### ChecklistCategory

```typescript
// Defined in: src/types/checklist.ts (unchanged)
export interface ChecklistCategory {
  id: string;
  title: string;
  menuType: MenuType;
  checklists: Checklist[];
}
```

### Checklist

```typescript
// Defined in: src/types/checklist.ts (unchanged)
export interface Checklist {
  id: string;
  name: string;
  items: ChecklistItem[];
}
```

### ChecklistItem

```typescript
// Defined in: src/types/checklist.ts (unchanged)
export interface ChecklistItem {
  id: string;
  item: string;
  value: string;
  completed: boolean; // Always false in definitions (runtime state separate)
  required: boolean;
}
```

### MenuType

```typescript
// Defined in: src/types/checklist.ts (unchanged)
export enum MenuType {
  NORMAL = "normal",
  NON_NORMAL = "non-normal",
  RESETS = "resets",
}
```

---

## New Utility Functions (Pure)

### NavigationUtils Module

**File**: `src/utils/navigation.ts` (NEW)

All functions are **pure** (no side effects, no React dependencies):

#### 1. getFirstUncheckedIndex

```typescript
/**
 * Finds the index of the first unchecked item in a category's checklist.
 *
 * @param categoryId - The ID of the category containing the checklist
 * @param checklistData - Array of all checklist categories
 * @param itemStates - Current runtime state of all items
 * @returns Index of first unchecked item, or -1 if all checked or category not found
 *
 * @example
 * const index = getFirstUncheckedIndex("pre-drive", checklistData, itemStates);
 * if (index >= 0) setActiveItemIndex(index);
 */
export function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number;
```

**Implementation Logic**:

1. Find category by `categoryId` in `checklistData`
2. Get first checklist from category (`category.checklists[0]`)
3. Find first item where `itemStates[categoryId][checklistId][itemId] === "unchecked"`
4. Return index or -1 if none found

**Edge Cases**:

- Category not found → return -1
- Category has no checklists → return -1
- All items checked → return -1
- ItemStates not initialized for this checklist → return 0 (first item)

**Complexity**: O(n) where n = number of items in checklist (typically 5-10)

#### 2. getNextIncompleteChecklist

```typescript
/**
 * Finds the next incomplete checklist for a given menu type.
 *
 * @param menuType - The type of menu (NORMAL or NON_NORMAL)
 * @param checklistData - Array of all checklist categories
 * @param itemStates - Current runtime state of all items
 * @returns Category ID of next incomplete checklist, or last category ID if all complete
 *
 * @example
 * const nextCategoryId = getNextIncompleteChecklist(
 *   MenuType.NORMAL,
 *   checklistData,
 *   itemStates
 * );
 * setActiveCategory(nextCategoryId);
 */
export function getNextIncompleteChecklist(
  menuType: MenuType,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): string | null;
```

**Implementation Logic**:

1. Filter `checklistData` to only categories matching `menuType`
2. For each category:
   - Get first checklist
   - Check if all items are complete (using `isItemComplete` from `@/utils/checklist`)
   - If incomplete, return category ID
3. If all complete, return ID of last category in menu type
4. If no categories found, return null

**Edge Cases**:

- No categories for menu type → return null
- All checklists complete → return last category ID
- ItemStates empty (nothing checked yet) → return first category ID
- Category has no checklist → skip to next category

**Complexity**: O(m × n) where m = categories in menu type (~3-5), n = items per checklist (~5-10)

#### 3. hasNextChecklist

```typescript
/**
 * Determines if there is a next checklist after the current one in a menu type.
 *
 * @param activeCategory - Current category ID
 * @param checklistData - Array of all checklist categories
 * @param menuType - The type of menu to check within
 * @returns true if there's a next checklist, false if on last or category not found
 *
 * @example
 * const showNext = hasNextChecklist(
 *   activeCategory,
 *   checklistData,
 *   MenuType.NORMAL
 * );
 * return <NextButton visible={showNext} />;
 */
export function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean;
```

**Implementation Logic**:

1. Filter `checklistData` to only categories matching `menuType`
2. Find index of `activeCategory` in filtered list
3. Return `currentIndex >= 0 && currentIndex < categories.length - 1`

**Edge Cases**:

- Category not found → return false
- On last checklist → return false
- Only one checklist in menu type → return false

**Complexity**: O(m) where m = categories in menu type (~3-5)

---

## Optional: Custom Hook (if needed)

### useChecklistNavigation Hook

**File**: `src/hooks/useChecklistNavigation.ts` (NEW - optional)

**When to extract**: Only if navigation logic is reused in multiple components or becomes complex enough to warrant lifecycle management.

```typescript
/**
 * Custom hook for managing checklist navigation state and computations.
 *
 * @param props - Navigation configuration
 * @returns Navigation state and computed values
 *
 * @example
 * const navigation = useChecklistNavigation({
 *   activeCategory,
 *   menuType: MenuType.NORMAL,
 *   checklistData,
 *   itemStates,
 * });
 *
 * return (
 *   <NextButton
 *     visible={navigation.hasNext}
 *     onClick={() => setActiveCategory(navigation.nextChecklistId)}
 *   />
 * );
 */
export function useChecklistNavigation({
  activeCategory,
  menuType,
  checklistData,
  itemStates,
}: UseChecklistNavigationProps): NavigationState;
```

#### Props Interface

```typescript
interface UseChecklistNavigationProps {
  /** Current active category ID */
  activeCategory: string;

  /** Menu type to navigate within (NORMAL or NON_NORMAL) */
  menuType: MenuType;

  /** All checklist category definitions */
  checklistData: ChecklistCategory[];

  /** Runtime state of all checklist items */
  itemStates: ItemStatesMap;
}
```

#### Return Type

```typescript
interface NavigationState {
  /** Whether there is a next checklist in the current menu type */
  hasNext: boolean;

  /** Whether there is a previous checklist in the current menu type */
  hasPrevious: boolean;

  /** Category ID of the next checklist (null if on last) */
  nextChecklistId: string | null;

  /** Category ID of the previous checklist (null if on first) */
  previousChecklistId: string | null;

  /** Current position in the menu type (0-indexed) */
  currentIndex: number;

  /** Total number of checklists in the current menu type */
  totalCount: number;

  /** Index of the first unchecked item in current category */
  firstUncheckedIndex: number;
}
```

**Implementation Details**:

- Uses `useMemo` to memoize computed navigation state
- Dependencies: `[activeCategory, menuType, checklistData, itemStates]`
- Calls pure utility functions from `@/utils/navigation`
- Returns stable object reference when dependencies don't change

**Why Optional**:

- Currently only `page.tsx` needs navigation logic
- Pure utilities + `useMemo` in component is sufficient for now
- Extract to hook only if:
  - Multiple components need same navigation logic
  - Navigation becomes complex (history tracking, undo/redo)
  - Unit testing navigation in isolation is desired

---

## State Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Component (page.tsx)                      │
│                                                              │
│  State:                                                      │
│    - activeCategory: string                                  │
│    - itemStates: ItemStatesMap (from useChecklist)          │
│                                                              │
│  Derived (via useMemo):                                      │
│    - firstUnchecked = getFirstUncheckedIndex(...)            │
│    - nextChecklist = getNextIncompleteChecklist(...)         │
│    - hasNext = hasNextChecklist(...)                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ calls
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Pure Utilities (utils/navigation.ts)            │
│                                                              │
│  Functions:                                                  │
│    - getFirstUncheckedIndex(categoryId, data, states)        │
│    - getNextIncompleteChecklist(menuType, data, states)      │
│    - hasNextChecklist(activeCategory, data, menuType)        │
│                                                              │
│  Dependencies:                                               │
│    - checklistData (from @/data/checklists)                  │
│    - isItemComplete (from @/utils/checklist)                 │
│    - types (from @/types/checklist)                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ uses
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (immutable)                      │
│                                                              │
│  checklistData: ChecklistCategory[]                          │
│    - Pre-drive checklist                                     │
│    - Driving checklist                                       │
│    - Parking checklist                                       │
│    - etc.                                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Points**:

- **No state duplication**: Navigation is derived, not stored
- **Single source of truth**: `activeCategory` and `itemStates` drive everything
- **Memoization prevents recalculation**: `useMemo` caches results until dependencies change
- **Pure utilities are testable**: No React dependencies, simple input/output

---

## Type Definitions Export Structure

```typescript
// src/utils/navigation.ts
import { ChecklistCategory, MenuType } from "@/types/checklist";
import type { ItemStatesMap } from "@/hooks/useChecklist"; // Type-only import

export function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number {
  /* ... */
}

export function getNextIncompleteChecklist(
  menuType: MenuType,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): string | null {
  /* ... */
}

export function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean {
  /* ... */
}
```

**Import Pattern in Components**:

```typescript
// src/app/page.tsx
import { getFirstUncheckedIndex, hasNextChecklist } from "@/utils/navigation";

// Use with useMemo
const navigation = useMemo(
  () => ({
    firstUnchecked: getFirstUncheckedIndex(
      activeCategory,
      checklistData,
      itemStates
    ),
    hasNext: hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
  }),
  [activeCategory, itemStates]
);
```

---

## Validation Rules

### Type Safety

- [x] All function parameters are strictly typed
- [x] No `any` types used
- [x] Return types are explicit (not inferred)
- [x] Null safety enforced (use `| null` for nullable returns)

### Immutability

- [x] Pure functions don't mutate input parameters
- [x] checklistData is read-only (never modified)
- [x] itemStates is read-only (modifications via useChecklist hook only)

### Edge Case Handling

- [x] Category not found returns safe defaults (-1, null, false)
- [x] Empty checklists return safe defaults
- [x] Missing itemStates keys treated as "unchecked"

### Performance

- [x] All utilities are O(n) or better (cheap computations)
- [x] Memoization prevents unnecessary recalculations
- [x] No async operations (all synchronous)

---

## Migration Impact

### Existing Code Changes

**Before** (in page.tsx):

```typescript
const getFirstUncheckedIndex = (categoryId: string) => {
  const category = checklistData.find((cat) => cat.id === categoryId);
  const checklist = category?.checklists[0];
  if (!checklist) return -1;
  const firstUncheckedIndex = checklist.items.findIndex(
    (item) =>
      (itemStates[categoryId]?.[checklist.id]?.[item.id] ?? "unchecked") ===
      "unchecked"
  );
  return firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1;
};
```

**After** (extracted utility):

```typescript
import { getFirstUncheckedIndex } from "@/utils/navigation";

const firstUnchecked = getFirstUncheckedIndex(
  activeCategory,
  checklistData,
  itemStates
);
```

**Lines Saved**: ~8 lines per usage (4 usages in current code = ~32 lines)

### No Breaking Changes

- [x] Existing types unchanged
- [x] Existing components unchanged (except page.tsx)
- [x] Existing hooks unchanged (useChecklist remains as-is)
- [x] LocalStorage schema unchanged

---

## Testing Data Structures

### Mock Data for Tests

```typescript
// For utility tests
const mockChecklistData: ChecklistCategory[] = [
  {
    id: "cat1",
    title: "PRE-DRIVE",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "checklist1",
        name: "Pre-Drive Checklist",
        items: [
          {
            id: "item1",
            item: "Mirrors",
            value: "ADJUSTED",
            completed: false,
            required: true,
          },
          {
            id: "item2",
            item: "Seatbelt",
            value: "FASTENED",
            completed: false,
            required: true,
          },
        ],
      },
    ],
  },
  {
    id: "cat2",
    title: "DRIVING",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "checklist2",
        name: "Driving Checklist",
        items: [
          {
            id: "item3",
            item: "Speed",
            value: "WITHIN LIMIT",
            completed: false,
            required: true,
          },
        ],
      },
    ],
  },
];

const mockItemStates: ItemStatesMap = {
  cat1: {
    checklist1: {
      item1: "checked",
      item2: "unchecked", // First unchecked item
    },
  },
};

// Expected results:
// getFirstUncheckedIndex("cat1", mockChecklistData, mockItemStates) === 1
// getNextIncompleteChecklist(MenuType.NORMAL, mockChecklistData, mockItemStates) === "cat1"
// hasNextChecklist("cat1", mockChecklistData, MenuType.NORMAL) === true
```

---

## Summary

**New Files**:

- `src/utils/navigation.ts` - Pure navigation utilities (required)
- `src/hooks/useChecklistNavigation.ts` - Navigation hook (optional)

**Modified Files**:

- `src/app/page.tsx` - Use utilities instead of inline logic

**No Changes**:

- `src/types/checklist.ts` - All existing types sufficient
- `src/hooks/useChecklist.ts` - State management unchanged
- `src/utils/checklist.ts` - Existing utilities unchanged
- `src/data/checklists.ts` - Data definitions unchanged

**Type Safety**:

- All new code uses strict TypeScript
- No `any` types introduced
- All parameters and returns explicitly typed

**Performance**:

- All utilities are O(n) or better
- Memoization via `useMemo` prevents unnecessary recalculations
- No new re-render triggers introduced

---

**Data Model Complete** ✅  
**Next Step**: Define API contracts in `contracts/extracted-api.md`
