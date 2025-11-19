/**
 * UI Constants Module
 *
 * Centralized repository for UI-related magic values extracted from components.
 * All constants are immutable compile-time values with literal type inference.
 */

/**
 * Number of dot-space pairs in the checklist item separator line.
 *
 * This value creates visual overflow for the dotted line between item name
 * and expected value, mimicking aviation checklist aesthetics. The high
 * repeat count ensures the separator extends beyond the visible area,
 * creating an ellipsis effect that adapts to different screen sizes.
 *
 * @example
 * ```tsx
 * <span>{". ".repeat(DOTTED_SEPARATOR_REPEATS)}</span>
 * // Renders: ". . . . . . . . . . . . . . . . . . . . . ..."
 * ```
 */
export const DOTTED_SEPARATOR_REPEATS = 400 as const;

/**
 * Milliseconds to display reset confirmation before auto-exiting the menu.
 *
 * This delay provides visual feedback that the reset action completed
 * successfully before returning to the default view. The 1-second duration
 * gives users sufficient time to register the green confirmation state
 * without feeling like the UI is sluggish.
 *
 * @example
 * ```typescript
 * setTimeout(() => {
 *   onExitMenu();
 * }, RESET_MENU_EXIT_DELAY_MS);
 * ```
 */
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const;
