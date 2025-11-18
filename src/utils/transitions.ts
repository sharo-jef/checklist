import { ChecklistItemStatus } from "@/types/checklist";

/**
 * User actions that trigger state transitions.
 */
type Action = "toggle" | "override";

/**
 * Complete mapping of (status, action) → next status.
 *
 * TypeScript ensures exhaustiveness: all ChecklistItemStatus values
 * must be present as keys, and each must define both actions.
 */
type TransitionMap = {
  [K in ChecklistItemStatus]: {
    [A in Action]: ChecklistItemStatus;
  };
};

/**
 * State transition map for checklist item status changes.
 *
 * This declarative map replaces 70+ lines of nested conditionals,
 * making all possible state transitions visible and maintainable.
 *
 * Aviation checklist semantics:
 * - toggle: User clicked/tapped the item itself
 * - override: User clicked/tapped "ITEM OVRD" button (emergency bypass)
 */
const TRANSITIONS: TransitionMap = {
  unchecked: {
    toggle: "checked",
    override: "overridden",
  },
  checked: {
    toggle: "unchecked",
    override: "checked-overridden",
  },
  overridden: {
    toggle: "unchecked",
    override: "unchecked",
  },
  "checked-overridden": {
    toggle: "unchecked",
    override: "unchecked",
  },
} as const;

/**
 * Get the next status given current status and action.
 *
 * @param currentStatus - The item's current status before the action
 * @param action - The user action triggering the transition
 * @returns The new status after applying the action
 * @throws {Error} In development if transition is undefined (should never happen)
 */
export function transition(
  currentStatus: ChecklistItemStatus,
  action: Action
): ChecklistItemStatus {
  const nextStatus = TRANSITIONS[currentStatus]?.[action];

  if (!nextStatus) {
    const error = `Invalid transition: status="${currentStatus}" action="${action}"`;

    if (process.env.NODE_ENV === "development") {
      // Fail fast in dev - immediate feedback
      throw new Error(error);
    }

    // Graceful degradation in production
    console.error(error);
    return currentStatus; // No-op transition
  }

  return nextStatus;
}

/**
 * Convenience helper: Apply the 'toggle' action.
 *
 * @param currentStatus - The item's current status
 * @returns The new status after toggling
 */
export function toggleStatus(
  currentStatus: ChecklistItemStatus
): ChecklistItemStatus {
  return transition(currentStatus, "toggle");
}

/**
 * Convenience helper: Apply the 'override' action.
 *
 * @param currentStatus - The item's current status
 * @returns The new status after overriding
 */
export function overrideStatus(
  currentStatus: ChecklistItemStatus
): ChecklistItemStatus {
  return transition(currentStatus, "override");
}
