/**
 * Checklist Utility Functions
 *
 * Pure utility functions for interpreting checklist item status values.
 * Consolidates duplicate status checking logic across components.
 */

import { ChecklistItemStatus } from "@/types/checklist";

/**
 * Determines whether a checklist item is considered "complete".
 *
 * An item is complete if it has been:
 * - Checked normally ("checked")
 * - Completed via override ("overridden")
 * - Both checked and overridden ("checked-overridden")
 *
 * @param status - The current status of the checklist item
 * @returns true if the item is complete, false otherwise
 *
 * @example
 * ```typescript
 * // Check if all items in a checklist are complete
 * const allComplete = checklist.items.every((item) =>
 *   isItemComplete(itemStates[categoryId]?.[checklistId]?.[item.id])
 * );
 * ```
 *
 * Edge cases:
 * - Returns false for null or undefined (fail-safe behavior)
 * - Returns false for "unchecked" status
 */
export function isItemComplete(
  status: ChecklistItemStatus | null | undefined
): boolean {
  if (!status) return false;

  return (
    status === "checked" ||
    status === "overridden" ||
    status === "checked-overridden"
  );
}

/**
 * Determines whether a checklist item has been marked as "overridden".
 *
 * Override indicates the item was completed via emergency/non-standard
 * procedures rather than normal checking. Overridden items display in
 * cyan color instead of green.
 *
 * @param status - The current status of the checklist item
 * @returns true if the item is overridden, false otherwise
 *
 * @example
 * ```typescript
 * // Check if all items in a checklist are overridden (for cyan color)
 * const allOverridden = checklist.items.every((item) =>
 *   isItemOverridden(itemStates[categoryId]?.[checklistId]?.[item.id])
 * );
 * ```
 *
 * Note:
 * - An overridden item is always complete (isItemComplete returns true)
 * - A complete item is not necessarily overridden (can be normally checked)
 *
 * Edge cases:
 * - Returns false for null or undefined
 * - Returns false for "checked" (normal completion, not overridden)
 * - Returns false for "unchecked" (incomplete)
 */
export function isItemOverridden(
  status: ChecklistItemStatus | null | undefined
): boolean {
  if (!status) return false;

  return status === "overridden" || status === "checked-overridden";
}
