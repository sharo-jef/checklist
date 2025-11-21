import { ComponentType } from "react";
import { MenuType, ChecklistItemStatus } from "./checklist";
import type { ChecklistCategory, Checklist, ItemStatesMap } from "./checklist";

/**
 * Discriminated union representing all valid view states in the application.
 *
 * The discriminator is the `view` property, which narrows the available
 * `menu` property values based on the view type.
 *
 * @example Default view
 * const state: ViewState = { view: "default" };
 *
 * @example Menu view
 * const state: ViewState = { view: "menu", menu: MenuType.NORMAL };
 *
 * @example Checklist view (RESETS not allowed)
 * const state: ViewState = { view: "checklist", menu: MenuType.NORMAL };
 */
export type ViewState =
  | { view: "default" }
  | { view: "menu"; menu: MenuType }
  | { view: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL };

/**
 * String literal union for ViewKey - used internally by routing system.
 * Composite key derived from ViewState for component lookup.
 */
export type ViewKey =
  | "default"
  | "menu-normal"
  | "menu-non-normal"
  | "menu-resets"
  | "checklist-normal"
  | "checklist-non-normal";

/**
 * Aggregated application state for view routing.
 * Contains all handlers, data, and derived state needed by view components.
 */
export interface AppState {
  // Navigation handlers
  handleNormalButton: () => void;
  handleNonNormalButton: () => void;
  handleChecklistSelect: (categoryId: string) => void;
  handleExitMenu: () => void;

  // Checklist item handlers
  handleToggleItem: (itemId: string) => void;
  handleItemOverride: (itemId: string) => void;
  handleChecklistOverride: () => void;
  handleChecklistReset: () => void;
  handleNext: () => void;

  // Reset handlers
  handleResetNormal: () => void;
  handleResetNonNormal: () => void;
  handleResetAll: () => void;

  // Data
  checklistData: ChecklistCategory[];
  itemStates: ItemStatesMap;
  currentChecklist: Checklist | undefined;
  currentItems: Array<{
    id: string;
    item: string;
    value: string;
    status: ChecklistItemStatus;
    required?: boolean;
  }>;

  // Derived state
  activeItemIndex: number;
  navigation: {
    hasNext: boolean;
    nextNormalChecklist: string | null;
    nextNonNormalChecklist: string | null;
  };
}

/**
 * Component props interfaces for registry type safety.
 */
export interface DefaultViewProps {
  onNormalClick: () => void;
  onNonNormalClick: () => void;
}

export interface ChecklistMenuProps {
  categories: ChecklistCategory[];
  onSelect: (categoryId: string) => void;
  itemStates: ItemStatesMap;
  menuType: MenuType;
}

export interface ChecklistDisplayProps {
  checklist: Checklist | undefined;
  items: Array<{
    id: string;
    item: string;
    value: string;
    status: ChecklistItemStatus;
    required?: boolean;
  }>;
  activeItemIndex: number;
  onToggleItem: (itemId: string) => void;
  onItemOverride?: (itemId: string) => void;
  onChecklistOverride?: () => void;
  onChecklistReset?: () => void;
  onNext?: () => void;
  showControls?: boolean;
  hasNextChecklist?: boolean;
}

export interface ResetsMenuProps {
  onResetNormal: () => void;
  onResetNonNormal: () => void;
  onResetAll: () => void;
  onExitMenu: () => void;
}

/**
 * Maps each ViewKey to its corresponding component props type.
 * This type and ViewRegistry provide compile-time type safety for the view registry.
 * Type assertions are NOT needed in the routing logic; the mapping ensures correct types.
 */
export type ViewPropsMap = {
  default: DefaultViewProps;
  "menu-normal": ChecklistMenuProps;
  "menu-non-normal": ChecklistMenuProps;
  "menu-resets": ResetsMenuProps;
  "checklist-normal": ChecklistDisplayProps;
  "checklist-non-normal": ChecklistDisplayProps;
};

/**
 * View component registry interface.
 * Maps ViewKey strings to their corresponding React component types.
 */
export interface ViewRegistry {
  default: ComponentType<DefaultViewProps>;
  "menu-normal": ComponentType<ChecklistMenuProps>;
  "menu-non-normal": ComponentType<ChecklistMenuProps>;
  "menu-resets": ComponentType<ResetsMenuProps>;
  "checklist-normal": ComponentType<ChecklistDisplayProps>;
  "checklist-non-normal": ComponentType<ChecklistDisplayProps>;
}

/**
 * Converts a ViewState to a ViewKey for component lookup.
 *
 * @param state - The current view state
 * @returns ViewKey string for component registry lookup
 */
export function getViewKey(state: ViewState): ViewKey {
  switch (state.view) {
    case "default":
      return "default";

    case "menu":
      return `menu-${state.menu}` as ViewKey;

    case "checklist":
      return `checklist-${state.menu}` as ViewKey;

    default:
      // Exhaustiveness check - TypeScript error if case missing
      const _exhaustive: never = state;
      throw new Error(`Unhandled view state: ${_exhaustive}`);
  }
}
