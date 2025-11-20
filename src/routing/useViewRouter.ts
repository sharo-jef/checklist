import { useMemo, ComponentType } from "react";
import { ViewState, AppState, getViewKey } from "@/types/routing";
import { VIEW_COMPONENTS } from "./viewRegistry";
import { MenuType } from "@/types/checklist";
import { DefaultView } from "@/components/DefaultView";

/**
 * Type-safe result from the view router.
 * 
 * The component and props types are guaranteed to match at runtime through
 * the ViewPropsMap type mapping (defined in routing.ts), but TypeScript
 * cannot express this correlation between a runtime ViewKey value and
 * compile-time types.
 * 
 * We use `Record<string, unknown>` as a constraint - safer than `any` because
 * it ensures props is an object, while still allowing the spread operator.
 * The actual runtime types are guaranteed through the exhaustive switch statement and ViewRegistry lookup.
 * ViewPropsMap documents the expected type correlations for maintainers.
 */
interface ViewRouterResult {
  ViewComponent: ComponentType<Record<string, unknown>>;
  viewProps: Record<string, unknown>;
}

/**
 * Maps ViewState and AppState to appropriate view component and props.
 *
 * This hook encapsulates all view routing logic, replacing nested conditional
 * rendering in page.tsx with a declarative lookup pattern.
 *
 * @param viewState - Current view state (discriminated union)
 * @param appState - Aggregated application state containing all handlers and data
 * @returns Object with ViewComponent and viewProps ready to render
 *
 * @example
 * const { ViewComponent, viewProps } = useViewRouter(viewState, appState);
 * return <ViewComponent {...viewProps} />;
 */
export function useViewRouter(
  viewState: ViewState,
  appState: AppState
): ViewRouterResult {
  // Convert ViewState to ViewKey
  const viewKey = useMemo(() => getViewKey(viewState), [viewState]);

  // Look up component (with defensive fallback)
  const ViewComponent = VIEW_COMPONENTS[viewKey] || DefaultView;

  // Map AppState to component-specific props
  const viewProps = useMemo(() => {
    switch (viewKey) {
      case "default":
        return {
          onNormalClick: appState.handleNormalButton,
          onNonNormalClick: appState.handleNonNormalButton,
        };

      case "menu-normal":
        return {
          categories: appState.checklistData.filter(
            (cat) => cat.menuType === MenuType.NORMAL
          ),
          onSelect: appState.handleChecklistSelect,
          itemStates: appState.itemStates,
          menuType: MenuType.NORMAL,
        };

      case "menu-non-normal":
        return {
          categories: appState.checklistData.filter(
            (cat) => cat.menuType === MenuType.NON_NORMAL
          ),
          onSelect: appState.handleChecklistSelect,
          itemStates: appState.itemStates,
          menuType: MenuType.NON_NORMAL,
        };

      case "menu-resets":
        return {
          onResetNormal: appState.handleResetNormal,
          onResetNonNormal: appState.handleResetNonNormal,
          onResetAll: appState.handleResetAll,
          onExitMenu: appState.handleExitMenu,
        };

      case "checklist-normal":
        return {
          checklist: appState.currentChecklist,
          items: appState.currentItems,
          activeItemIndex: appState.activeItemIndex,
          onToggleItem: appState.handleToggleItem,
          onItemOverride: appState.handleItemOverride,
          onChecklistOverride: appState.handleChecklistOverride,
          onChecklistReset: appState.handleChecklistReset,
          onNext: appState.handleNext,
          showControls: true,
          hasNextChecklist: appState.navigation.hasNext,
        };

      case "checklist-non-normal":
        return {
          checklist: appState.currentChecklist,
          items: appState.currentItems,
          activeItemIndex: appState.activeItemIndex,
          onToggleItem: appState.handleToggleItem,
          onItemOverride: appState.handleItemOverride,
          onChecklistOverride: appState.handleChecklistOverride,
          onChecklistReset: appState.handleChecklistReset,
          showControls: true,
          hasNextChecklist: false,
        };

      default:
        // Exhaustiveness check
        const _exhaustive: never = viewKey;
        throw new Error(`Unhandled view key: ${_exhaustive}`);
    }
  }, [viewKey, appState]);

  // Type assertion is necessary because TypeScript cannot correlate the runtime
  // ViewKey with its corresponding component and props types from ViewPropsMap.
  // The types are guaranteed to match through the switch statement above.
  return {
    ViewComponent: ViewComponent as unknown as ComponentType<
      Record<string, unknown>
    >,
    viewProps: viewProps as Record<string, unknown>,
  };
}
