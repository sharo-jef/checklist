# Research: Simplifying Complex Conditional View Rendering in React

**Date**: November 20, 2025  
**Context**: React 19.2.0 + Next.js 16.0.3 static export  
**Current Problem**: Nested conditionals (activeMenu × viewMode) creating 10+ view combinations  
**Constraints**: Client-side only, no external routing libraries, TypeScript strict mode

---

## Executive Summary

After researching patterns for conditional view rendering in React applications, the **Component Map with Discriminated Union Keys** pattern emerges as the optimal solution for this project. This pattern provides:

- **Type safety**: Full TypeScript inference with discriminated unions
- **Declarative configuration**: Single source of truth for view routing
- **Zero runtime overhead**: Simple object lookup, no library dependencies
- **Excellent maintainability**: New views require only map updates, not JSX changes
- **React 19 compatible**: Uses standard patterns, no breaking changes

**Recommended Implementation**: Pattern #2 (Component Map with Typed Keys)

---

## Pattern 1: Object/Map-Based View Selection with Composite Keys

### Description

Create a routing map that uses composite keys (e.g., `"normal-menu"` or `"normal-checklist"`) to directly map view states to components.

### Code Example

```typescript
// types/routing.ts
import { ComponentType } from "react";

type ViewMode = "default" | "menu" | "checklist";
type ActiveMenu = "normal" | "non-normal" | "resets" | null;

// Create composite key type
type ViewStateKey =
  | "default"
  | "normal-menu"
  | "normal-checklist"
  | "non-normal-menu"
  | "non-normal-checklist"
  | "resets-menu";

interface ViewConfig<P = any> {
  component: ComponentType<P>;
  props?: (state: AppViewState) => P;
}

// View state structure
interface AppViewState {
  activeMenu: ActiveMenu;
  viewMode: ViewMode;
  // ... other state
}

// routing/viewMap.ts
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";
import { DefaultView } from "@/components/DefaultView";

const VIEW_MAP: Record<ViewStateKey, ViewConfig> = {
  "default": {
    component: DefaultView,
    props: (state) => ({
      onNormalClick: state.handleNormalButton,
      onNonNormalClick: state.handleNonNormalButton,
    }),
  },
  "normal-menu": {
    component: ChecklistMenu,
    props: (state) => ({
      categories: state.normalCategories,
      onSelect: state.handleChecklistSelect,
      itemStates: state.itemStates,
      menuType: MenuType.NORMAL,
    }),
  },
  "normal-checklist": {
    component: ChecklistDisplay,
    props: (state) => ({
      checklist: state.currentChecklist,
      items: state.currentItems,
      activeItemIndex: state.activeItemIndex,
      onToggleItem: state.handleToggleItem,
      onItemOverride: state.handleItemOverride,
      onChecklistOverride: state.handleChecklistOverride,
      onChecklistReset: state.handleChecklistReset,
      onNext: state.handleNext,
      showControls: true,
      hasNextChecklist: state.navigation.hasNext,
    }),
  },
  "non-normal-menu": {
    component: ChecklistMenu,
    props: (state) => ({
      categories: state.nonNormalCategories,
      onSelect: state.handleChecklistSelect,
      itemStates: state.itemStates,
      menuType: MenuType.NON_NORMAL,
    }),
  },
  "non-normal-checklist": {
    component: ChecklistDisplay,
    props: (state) => ({
      checklist: state.currentChecklist,
      items: state.currentItems,
      activeItemIndex: state.activeItemIndex,
      onToggleItem: state.handleToggleItem,
      onItemOverride: state.handleItemOverride,
      onChecklistOverride: state.handleChecklistOverride,
      onChecklistReset: state.handleChecklistReset,
      showControls: true,
      hasNextChecklist: false,
    }),
  },
  "resets-menu": {
    component: ResetsMenu,
    props: (state) => ({
      onResetNormal: state.handleResetNormal,
      onResetNonNormal: state.handleResetNonNormal,
      onResetAll: state.handleResetAll,
      onExitMenu: state.handleExitMenu,
    }),
  },
};

// Utility to generate composite key
function getViewKey(activeMenu: ActiveMenu, viewMode: ViewMode): ViewStateKey {
  if (viewMode === "default") return "default";
  if (activeMenu === null) return "default";

  const menuStr = activeMenu.toLowerCase().replace("_", "-");
  return `${menuStr}-${viewMode}` as ViewStateKey;
}

// Usage in page.tsx
export default function Home() {
  // ... all state setup

  const viewKey = getViewKey(activeMenu, viewMode);
  const viewConfig = VIEW_MAP[viewKey];

  if (!viewConfig) {
    console.error(`No view configured for: ${viewKey}`);
    return <DefaultView />;
  }

  const ViewComponent = viewConfig.component;
  const viewProps = viewConfig.props?.({
    activeMenu,
    viewMode,
    // ... all other state
  }) || {};

  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      <ViewComponent {...viewProps} />
      {shouldShowExitButton(viewKey) && (
        <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
          <ExitMenuButton onClick={handleExitMenu} />
        </div>
      )}
    </div>
  );
}
```

### Pros

- ✅ **Simple lookup**: O(1) component resolution
- ✅ **Declarative**: All view configurations in one place
- ✅ **Type-safe keys**: `ViewStateKey` union prevents typos
- ✅ **No external dependencies**: Plain TypeScript objects
- ✅ **Easy to extend**: Add new view by adding map entry
- ✅ **Clear separation**: View config separate from render logic

### Cons

- ⚠️ **Composite key generation**: Requires utility function to build keys
- ⚠️ **Props type safety**: Need careful typing of props function return values
- ⚠️ **State passing**: Large state object passed to props functions
- ⚠️ **Runtime validation**: Need fallback for undefined keys

### TypeScript Support

**9/10** - Excellent with discriminated unions for keys. Props require explicit typing but can leverage ComponentType generics.

### Performance

**10/10** - Simple object property access. No iteration, no complex conditionals. Can memoize view key calculation.

### Best Use Case

Applications with 5-15 distinct view states where each view has significantly different props and components.

### Recommendation for This Project

**Highly Recommended** - Perfect fit for the 6 current view states (default, normal-menu, normal-checklist, non-normal-menu, non-normal-checklist, resets-menu). Clean separation of routing logic from rendering.

---

## Pattern 2: Component Map with Discriminated Union Keys

### Description

Use TypeScript discriminated unions to create type-safe routing without string manipulation. The routing key is a structured object rather than a composite string.

### Code Example

```typescript
// types/routing.ts
import { ComponentType } from "react";
import { MenuType } from "./checklist";

// Discriminated union for view states
type ViewState =
  | { view: "default" }
  | { view: "menu"; menu: MenuType }
  | { view: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL };

// View component registry
interface ViewRegistry {
  "default": ComponentType<DefaultViewProps>;
  "menu-normal": ComponentType<ChecklistMenuProps>;
  "menu-non-normal": ComponentType<ChecklistMenuProps>;
  "menu-resets": ComponentType<ResetsMenuProps>;
  "checklist-normal": ComponentType<ChecklistDisplayProps>;
  "checklist-non-normal": ComponentType<ChecklistDisplayProps>;
}

type ViewKey = keyof ViewRegistry;

// routing/useViewRouter.ts
function getViewKey(state: ViewState): ViewKey {
  switch (state.view) {
    case "default":
      return "default";
    case "menu":
      return `menu-${state.menu}` as ViewKey;
    case "checklist":
      return `checklist-${state.menu}` as ViewKey;
  }
}

function useViewRouter(viewState: ViewState, appState: AppState) {
  const viewKey = useMemo(() => getViewKey(viewState), [viewState]);

  const viewProps = useMemo(() => {
    switch (viewKey) {
      case "default":
        return {
          onNormalClick: appState.handleNormalButton,
          onNonNormalClick: appState.handleNonNormalButton,
        };
      case "menu-normal":
        return {
          categories: appState.normalCategories,
          onSelect: appState.handleChecklistSelect,
          itemStates: appState.itemStates,
          menuType: MenuType.NORMAL,
        };
      case "menu-non-normal":
        return {
          categories: appState.nonNormalCategories,
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
        throw new Error(`Unhandled view key: ${viewKey satisfies never}`);
    }
  }, [viewKey, appState]);

  const ViewComponent = VIEW_COMPONENTS[viewKey];

  return { ViewComponent, viewProps };
}

const VIEW_COMPONENTS: ViewRegistry = {
  "default": DefaultView,
  "menu-normal": ChecklistMenu,
  "menu-non-normal": ChecklistMenu,
  "menu-resets": ResetsMenu,
  "checklist-normal": ChecklistDisplay,
  "checklist-non-normal": ChecklistDisplay,
};

// Usage in page.tsx
export default function Home() {
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("default");

  // ... all other state setup

  // Construct view state
  const viewState: ViewState = useMemo(() => {
    if (viewMode === "default") return { view: "default" };
    if (viewMode === "menu" && activeMenu) {
      return { view: "menu", menu: activeMenu };
    }
    if (viewMode === "checklist" && activeMenu && activeMenu !== MenuType.RESETS) {
      return { view: "checklist", menu: activeMenu };
    }
    return { view: "default" };
  }, [viewMode, activeMenu]);

  const { ViewComponent, viewProps } = useViewRouter(viewState, {
    // ... pass all app state
  });

  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      <ViewComponent {...viewProps} />
    </div>
  );
}
```

### Pros

- ✅ **Superior type safety**: Discriminated unions catch impossible states at compile time
- ✅ **Exhaustiveness checking**: `satisfies never` ensures all cases handled
- ✅ **Self-documenting**: ViewState type clearly shows all valid view combinations
- ✅ **Refactoring confidence**: TypeScript errors guide you through changes
- ✅ **No string concatenation**: Reduced risk of runtime bugs
- ✅ **Clean separation**: View logic extracted to custom hook

### Cons

- ⚠️ **More boilerplate**: Switch statements in both key generation and props mapping
- ⚠️ **Hook complexity**: useViewRouter bundles both component and props logic
- ⚠️ **ViewState construction**: Requires careful construction from existing state
- ⚠️ **Props duplication**: Similar views (checklist-normal vs checklist-non-normal) have duplicated prop code

### TypeScript Support

**10/10** - Best-in-class type safety with discriminated unions. Full compiler support for exhaustiveness checking.

### Performance

**9/10** - Slightly more overhead than Pattern 1 due to useMemo hooks, but still excellent. Switch statements compile to jump tables in modern JS engines.

### Best Use Case

Complex applications requiring maximum type safety where impossible view states must be prevented at compile time. Ideal when view state has hierarchical relationships.

### Recommendation for This Project

**Highly Recommended** - Best type safety for the codebase. The discriminated union prevents impossible combinations like `{ view: "checklist", menu: MenuType.RESETS }` which shouldn't exist in the app logic.

---

## Pattern 3: Switch Statement with Early Returns

### Description

Replace nested conditionals with a single switch statement on a composite key or enum. Each case returns the appropriate JSX directly.

### Code Example

```typescript
// types/routing.ts
enum ViewStateEnum {
  DEFAULT = "DEFAULT",
  NORMAL_MENU = "NORMAL_MENU",
  NORMAL_CHECKLIST = "NORMAL_CHECKLIST",
  NON_NORMAL_MENU = "NON_NORMAL_MENU",
  NON_NORMAL_CHECKLIST = "NON_NORMAL_CHECKLIST",
  RESETS_MENU = "RESETS_MENU",
}

// utils/routing.ts
function getViewState(
  activeMenu: MenuType | null,
  viewMode: ViewMode
): ViewStateEnum {
  if (viewMode === "default") return ViewStateEnum.DEFAULT;

  if (activeMenu === MenuType.NORMAL) {
    return viewMode === "menu"
      ? ViewStateEnum.NORMAL_MENU
      : ViewStateEnum.NORMAL_CHECKLIST;
  }

  if (activeMenu === MenuType.NON_NORMAL) {
    return viewMode === "menu"
      ? ViewStateEnum.NON_NORMAL_MENU
      : ViewStateEnum.NON_NORMAL_CHECKLIST;
  }

  if (activeMenu === MenuType.RESETS) {
    return ViewStateEnum.RESETS_MENU;
  }

  return ViewStateEnum.DEFAULT;
}

// page.tsx
export default function Home() {
  // ... all state setup

  const viewState = getViewState(activeMenu, viewMode);

  const renderView = () => {
    switch (viewState) {
      case ViewStateEnum.DEFAULT:
        return (
          <div className="flex-1 bg-[#09090C] flex flex-col">
            <div className="flex-1"></div>
            <div className="flex justify-between gap-3 p-3">
              <button
                onClick={handleNormalButton}
                className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white"
              >
                NORMAL
              </button>
              <button
                onClick={handleNonNormalButton}
                className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-yellow-400 whitespace-pre-line"
              >
                {"NON-\nNORMAL"}
              </button>
            </div>
          </div>
        );

      case ViewStateEnum.NORMAL_MENU:
        return (
          <>
            <ChecklistMenu
              categories={checklistData.filter(
                (cat) => cat.menuType === MenuType.NORMAL
              )}
              onSelect={handleChecklistSelect}
              itemStates={itemStates}
              menuType={MenuType.NORMAL}
            />
            <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
              <ExitMenuButton onClick={handleExitMenu} />
            </div>
          </>
        );

      case ViewStateEnum.NORMAL_CHECKLIST:
        return (
          <ChecklistDisplay
            checklist={currentChecklist}
            items={currentItems}
            activeItemIndex={activeItemIndex}
            onToggleItem={handleToggleItem}
            onItemOverride={handleItemOverride}
            onChecklistOverride={handleChecklistOverride}
            onChecklistReset={handleChecklistReset}
            onNext={handleNext}
            showControls={true}
            hasNextChecklist={navigation.hasNext}
          />
        );

      case ViewStateEnum.NON_NORMAL_MENU:
        return (
          <>
            <ChecklistMenu
              categories={checklistData.filter(
                (cat) => cat.menuType === MenuType.NON_NORMAL
              )}
              onSelect={handleChecklistSelect}
              itemStates={itemStates}
              menuType={MenuType.NON_NORMAL}
            />
            <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
              <ExitMenuButton onClick={handleExitMenu} />
            </div>
          </>
        );

      case ViewStateEnum.NON_NORMAL_CHECKLIST:
        return (
          <ChecklistDisplay
            checklist={currentChecklist}
            items={currentItems}
            activeItemIndex={activeItemIndex}
            onToggleItem={handleToggleItem}
            onItemOverride={handleItemOverride}
            onChecklistOverride={handleChecklistOverride}
            onChecklistReset={handleChecklistReset}
            showControls={true}
            hasNextChecklist={false}
          />
        );

      case ViewStateEnum.RESETS_MENU:
        return (
          <>
            <ResetsMenu
              onResetNormal={handleResetNormal}
              onResetNonNormal={handleResetNonNormal}
              onResetAll={handleResetAll}
              onExitMenu={handleExitMenu}
            />
            <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
              <ExitMenuButton onClick={handleExitMenu} />
            </div>
          </>
        );

      default:
        // Exhaustiveness check
        const _exhaustive: never = viewState;
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      {renderView()}
    </div>
  );
}
```

### Pros

- ✅ **Familiar pattern**: Traditional switch statement, easy to understand
- ✅ **Exhaustiveness checking**: TypeScript validates all enum cases handled
- ✅ **Explicit JSX**: Each view's JSX is visible in the switch case
- ✅ **No abstraction overhead**: Direct JSX rendering, no component lookup
- ✅ **Easy debugging**: Can set breakpoints in specific cases

### Cons

- ❌ **JSX duplication**: Each case contains full JSX structure
- ❌ **Large file**: All view JSX lives in page.tsx
- ❌ **Mixed concerns**: Routing logic mixed with view rendering
- ❌ **Hard to test**: Can't easily test routing logic in isolation
- ❌ **Repetitive code**: Similar views (menus, checklists) have similar JSX structure

### TypeScript Support

**8/10** - Good exhaustiveness checking with enums. Type narrowing works well in switch statements.

### Performance

**10/10** - Direct JSX rendering, no indirection or lookups. Minimal overhead.

### Best Use Case

Small applications (3-5 views) where JSX simplicity is valued over abstraction. When each view is significantly different.

### Recommendation for This Project

**Not Recommended** - While simple, this pattern doesn't significantly improve over the current nested conditionals. Adds enum overhead without gaining abstraction benefits. The file would still be large and hard to maintain.

---

## Pattern 4: Render Props with View Factory

### Description

Use a factory function that returns render prop functions for each view state. Separates view construction logic from component tree.

### Code Example

```typescript
// routing/viewFactory.ts
import { ReactNode } from "react";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";

interface ViewFactoryParams {
  activeMenu: MenuType | null;
  viewMode: ViewMode;
  appState: AppState;
}

interface ViewRenderer {
  render: () => ReactNode;
  showExitButton: boolean;
  showFooterControls: boolean;
}

export function createViewRenderer(params: ViewFactoryParams): ViewRenderer {
  const { activeMenu, viewMode, appState } = params;

  // Default view
  if (viewMode === "default") {
    return {
      render: () => (
        <div className="flex-1 bg-[#09090C] flex flex-col">
          <div className="flex-1"></div>
          <div className="flex justify-between gap-3 p-3">
            <button
              onClick={appState.handleNormalButton}
              className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white"
            >
              NORMAL
            </button>
            <button
              onClick={appState.handleNonNormalButton}
              className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-yellow-400 whitespace-pre-line"
            >
              {"NON-\nNORMAL"}
            </button>
          </div>
        </div>
      ),
      showExitButton: false,
      showFooterControls: false,
    };
  }

  // Menu views
  if (viewMode === "menu") {
    if (activeMenu === MenuType.NORMAL || activeMenu === MenuType.NON_NORMAL) {
      return {
        render: () => (
          <ChecklistMenu
            categories={appState.checklistData.filter(
              (cat) => cat.menuType === activeMenu
            )}
            onSelect={appState.handleChecklistSelect}
            itemStates={appState.itemStates}
            menuType={activeMenu}
          />
        ),
        showExitButton: true,
        showFooterControls: true,
      };
    }

    if (activeMenu === MenuType.RESETS) {
      return {
        render: () => (
          <ResetsMenu
            onResetNormal={appState.handleResetNormal}
            onResetNonNormal={appState.handleResetNonNormal}
            onResetAll={appState.handleResetAll}
            onExitMenu={appState.handleExitMenu}
          />
        ),
        showExitButton: true,
        showFooterControls: true,
      };
    }
  }

  // Checklist views
  if (viewMode === "checklist") {
    const hasNext = activeMenu === MenuType.NORMAL
      ? appState.navigation.hasNext
      : false;

    return {
      render: () => (
        <ChecklistDisplay
          checklist={appState.currentChecklist}
          items={appState.currentItems}
          activeItemIndex={appState.activeItemIndex}
          onToggleItem={appState.handleToggleItem}
          onItemOverride={appState.handleItemOverride}
          onChecklistOverride={appState.handleChecklistOverride}
          onChecklistReset={appState.handleChecklistReset}
          onNext={appState.handleNext}
          showControls={true}
          hasNextChecklist={hasNext}
        />
      ),
      showExitButton: false,
      showFooterControls: false,
    };
  }

  // Fallback
  return {
    render: () => null,
    showExitButton: false,
    showFooterControls: false,
  };
}

// page.tsx
export default function Home() {
  // ... all state setup

  const viewRenderer = useMemo(
    () => createViewRenderer({
      activeMenu,
      viewMode,
      appState: {
        handleNormalButton,
        handleNonNormalButton,
        handleChecklistSelect,
        handleResetNormal,
        handleResetNonNormal,
        handleResetAll,
        handleExitMenu,
        handleToggleItem,
        handleItemOverride,
        handleChecklistOverride,
        handleChecklistReset,
        handleNext,
        checklistData,
        itemStates,
        currentChecklist,
        currentItems,
        activeItemIndex,
        navigation,
      },
    }),
    [activeMenu, viewMode, /* ... all dependencies */]
  );

  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      {viewRenderer.render()}
      {viewRenderer.showFooterControls && (
        <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
          {viewRenderer.showExitButton && (
            <ExitMenuButton onClick={handleExitMenu} />
          )}
        </div>
      )}
    </div>
  );
}
```

### Pros

- ✅ **Metadata support**: Can return additional view metadata (showExitButton, etc.)
- ✅ **Testable**: Factory function can be unit tested independently
- ✅ **Flexible**: Can add view-specific configuration easily
- ✅ **Colocated logic**: View construction and metadata together

### Cons

- ❌ **Render prop overhead**: Function calls on every render
- ❌ **Complex memoization**: Large dependency array for useMemo
- ❌ **Type safety challenges**: AppState type must include all handlers
- ❌ **Abstraction complexity**: Harder to understand than direct rendering
- ❌ **Still has conditionals**: Factory function contains nested if statements

### TypeScript Support

**7/10** - Requires careful typing of AppState and ViewRenderer. Return type inference works well.

### Performance

**7/10** - useMemo helps, but large dependency arrays can cause unnecessary recalculations. Render function calls add overhead.

### Best Use Case

Applications where views need significant metadata or configuration beyond just component + props. When view-specific layouts or wrappers vary.

### Recommendation for This Project

**Not Recommended** - Adds unnecessary complexity for this use case. The metadata (showExitButton) could be handled more simply. Doesn't improve significantly over current approach.

---

## Pattern 5: Higher-Order Component (HOC) with View Registry

### Description

Create HOCs that wrap view components with routing logic and state injection. Use a registry to map view states to wrapped components.

### Code Example

```typescript
// routing/withViewState.tsx
import { ComponentType } from "react";

interface ViewStateInjectedProps {
  appState: AppState;
  navigation: Navigation;
}

function withViewState<P extends ViewStateInjectedProps>(
  Component: ComponentType<P>,
  propsMapper: (injected: ViewStateInjectedProps) => Omit<P, keyof ViewStateInjectedProps>
) {
  return function ViewStateWrapper(injected: ViewStateInjectedProps) {
    const props = propsMapper(injected) as P;
    return <Component {...props} />;
  };
}

// routing/viewRegistry.tsx
const NormalMenuView = withViewState(
  ChecklistMenu,
  ({ appState }) => ({
    categories: appState.checklistData.filter(
      (cat) => cat.menuType === MenuType.NORMAL
    ),
    onSelect: appState.handleChecklistSelect,
    itemStates: appState.itemStates,
    menuType: MenuType.NORMAL,
  })
);

const NormalChecklistView = withViewState(
  ChecklistDisplay,
  ({ appState, navigation }) => ({
    checklist: appState.currentChecklist,
    items: appState.currentItems,
    activeItemIndex: appState.activeItemIndex,
    onToggleItem: appState.handleToggleItem,
    onItemOverride: appState.handleItemOverride,
    onChecklistOverride: appState.handleChecklistOverride,
    onChecklistReset: appState.handleChecklistReset,
    onNext: appState.handleNext,
    showControls: true,
    hasNextChecklist: navigation.hasNext,
  })
);

// ... other views

const VIEW_REGISTRY = {
  default: DefaultView,
  "normal-menu": NormalMenuView,
  "normal-checklist": NormalChecklistView,
  "non-normal-menu": NonNormalMenuView,
  "non-normal-checklist": NonNormalChecklistView,
  "resets-menu": ResetsMenuView,
} as const;

// page.tsx
export default function Home() {
  // ... all state setup

  const viewKey = getViewKey(activeMenu, viewMode);
  const ViewComponent = VIEW_REGISTRY[viewKey];

  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={isInChecklist ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      <ViewComponent
        appState={{ /* ... all state */ }}
        navigation={navigation}
      />
    </div>
  );
}
```

### Pros

- ✅ **Props transformation**: Clean separation of state injection and view rendering
- ✅ **Reusable HOC**: Can apply withViewState to any component
- ✅ **Testable views**: Each wrapped view can be tested with mock appState
- ✅ **Declarative registry**: Clear mapping of view keys to components

### Cons

- ❌ **HOC complexity**: Additional abstraction layer to understand
- ❌ **Props drilling**: Large appState object passed through HOC
- ❌ **Debugging difficulty**: React DevTools shows wrapped components
- ❌ **Type gymnastics**: Complex generic types for HOC
- ❌ **React 19 anti-pattern**: HOCs are considered legacy pattern (hooks preferred)

### TypeScript Support

**6/10** - HOC generics are notoriously difficult to type correctly. Props inference often breaks.

### Performance

**8/10** - HOCs add component wrapper overhead but no significant performance impact for this scale.

### Best Use Case

Legacy codebases migrating from class components. Applications with many shared view behaviors.

### Recommendation for This Project

**Not Recommended** - HOCs are considered legacy in React 19. Custom hooks (Pattern 2) provide better ergonomics and type safety. Adds unnecessary wrapper components.

---

## Pattern 6: State Machine with XState-Like Pattern (No Library)

### Description

Implement a lightweight state machine pattern that explicitly models view transitions without external dependencies.

### Code Example

```typescript
// routing/viewStateMachine.ts
type ViewState =
  | { type: "default" }
  | { type: "menu"; menu: MenuType }
  | { type: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL };

type ViewEvent =
  | { type: "SHOW_NORMAL_MENU" }
  | { type: "SHOW_NON_NORMAL_MENU" }
  | { type: "SHOW_RESETS_MENU" }
  | { type: "SELECT_CHECKLIST"; menu: MenuType }
  | { type: "EXIT_TO_DEFAULT" };

interface ViewTransition {
  target: ViewState;
  action?: (context: AppContext) => void;
}

type ViewTransitionMap = {
  [K in ViewState["type"]]: {
    [E in ViewEvent["type"]]?: (
      state: Extract<ViewState, { type: K }>,
      event: Extract<ViewEvent, { type: E }>,
      context: AppContext
    ) => ViewTransition | null;
  };
};

const viewTransitions: ViewTransitionMap = {
  default: {
    SHOW_NORMAL_MENU: () => ({
      target: { type: "menu", menu: MenuType.NORMAL },
    }),
    SHOW_NON_NORMAL_MENU: () => ({
      target: { type: "menu", menu: MenuType.NON_NORMAL },
    }),
    SHOW_RESETS_MENU: () => ({
      target: { type: "menu", menu: MenuType.RESETS },
    }),
  },
  menu: {
    SELECT_CHECKLIST: (state, event, context) => {
      if (state.menu === MenuType.RESETS) return null;
      return {
        target: { type: "checklist", menu: state.menu },
        action: (ctx) => {
          ctx.setActiveCategory(ctx.getNextChecklistCategory(state.menu));
        },
      };
    },
    EXIT_TO_DEFAULT: () => ({
      target: { type: "default" },
    }),
  },
  checklist: {
    EXIT_TO_DEFAULT: () => ({
      target: { type: "default" },
    }),
  },
};

function useViewStateMachine(initialState: ViewState) {
  const [state, setState] = useState<ViewState>(initialState);

  const send = useCallback(
    (event: ViewEvent, context: AppContext) => {
      const stateTransitions = viewTransitions[state.type];
      const transition = stateTransitions[event.type];

      if (!transition) {
        console.warn(`No transition for ${state.type} + ${event.type}`);
        return;
      }

      const result = transition(state as any, event as any, context);
      if (!result) return;

      result.action?.(context);
      setState(result.target);
    },
    [state]
  );

  return { state, send };
}

// Usage in page.tsx
export default function Home() {
  const { state: viewState, send } = useViewStateMachine({ type: "default" });

  // ... all other state setup

  const context: AppContext = {
    setActiveCategory,
    getNextChecklistCategory: (menu) => {
      // ... navigation logic
    },
    // ... other context
  };

  const handleNormalButton = () => {
    send({ type: "SHOW_NORMAL_MENU" }, context);
  };

  const handleChecklistSelect = (categoryId: string) => {
    send({ type: "SELECT_CHECKLIST", menu: viewState.menu }, context);
  };

  // ... render based on viewState.type
}
```

### Pros

- ✅ **Explicit transitions**: All state changes are defined and documented
- ✅ **Type-safe events**: Event types are discriminated unions
- ✅ **Testable logic**: State machine can be tested independently
- ✅ **Side effect management**: Actions clearly separate from transitions
- ✅ **Prevents invalid states**: Impossible to reach undefined combinations
- ✅ **No dependencies**: Pure TypeScript implementation

### Cons

- ❌ **High complexity**: Significant boilerplate for transition definitions
- ❌ **Learning curve**: Team needs to understand state machine concepts
- ❌ **Overkill**: This app's view transitions are simple, don't need full state machine
- ❌ **Verbose**: Much more code than simple routing map
- ❌ **Over-engineered**: Adds abstraction where conditional logic would suffice

### TypeScript Support

**9/10** - Excellent type safety with discriminated unions for states and events. Complex but powerful.

### Performance

**9/10** - Lightweight implementation with minimal overhead. State transitions are efficient.

### Best Use Case

Complex applications with intricate state transition rules, side effects, and guards. When you need to prevent invalid state combinations and document all possible transitions.

### Recommendation for This Project

**Not Recommended** - Massive overkill for this use case. The view transitions are simple (menu → checklist → default) and don't require the complexity of a full state machine. Better suited for complex workflows like multi-step forms or game state management.

---

## React 19 Specific Patterns

### New in React 19: use() Hook with Promises

React 19 introduced the `use()` hook for unwrapping promises. However, this doesn't apply to view routing patterns as it's designed for async data fetching, not synchronous component selection.

**Not applicable** to this project's routing needs.

### React 19: Automatic Batching Improvements

React 19 improved automatic batching for state updates. This means multiple setState calls in event handlers are automatically batched, reducing re-renders.

**Benefit for routing**: When transitioning views (e.g., `setActiveMenu` + `setViewMode` + `setActiveCategory`), these updates are batched, making any routing pattern more efficient.

**Recommendation**: No special consideration needed - automatic batching benefits all patterns equally.

### React 19: use(Context) Optimization

React 19 optimized context subscriptions. If routing state were moved to context, components would re-render more efficiently.

**Not recommended** for this project - single page component doesn't benefit from context optimization.

---

## Performance Comparison Matrix

| Pattern                        | Lookup Cost | Render Cost | Memory | Memoization Needs  |
| ------------------------------ | ----------- | ----------- | ------ | ------------------ |
| Pattern 1: Object Map          | O(1)        | Low         | Low    | Optional (key gen) |
| Pattern 2: Discriminated Union | O(1)        | Low         | Medium | Recommended        |
| Pattern 3: Switch Statement    | O(1)        | Lowest      | Lowest | None               |
| Pattern 4: Render Props        | O(1)        | Medium      | Medium | Required           |
| Pattern 5: HOC                 | O(1)        | Medium      | Medium | Optional           |
| Pattern 6: State Machine       | O(1)        | Low         | High   | Optional           |

**Winner**: Pattern 1 and Pattern 3 (tied) - minimal performance overhead

---

## Type Safety Comparison Matrix

| Pattern                        | Compile-Time Safety | Exhaustiveness         | Props Type Inference | Impossible State Prevention |
| ------------------------------ | ------------------- | ---------------------- | -------------------- | --------------------------- |
| Pattern 1: Object Map          | ⭐⭐⭐⭐            | ✅ (with union keys)   | ⭐⭐⭐               | ⭐⭐⭐                      |
| Pattern 2: Discriminated Union | ⭐⭐⭐⭐⭐          | ✅✅ (satisfies never) | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐                  |
| Pattern 3: Switch Statement    | ⭐⭐⭐⭐            | ✅ (enum exhaustion)   | ⭐⭐⭐⭐             | ⭐⭐⭐                      |
| Pattern 4: Render Props        | ⭐⭐⭐              | ❌                     | ⭐⭐                 | ⭐⭐                        |
| Pattern 5: HOC                 | ⭐⭐                | ❌                     | ⭐                   | ⭐⭐                        |
| Pattern 6: State Machine       | ⭐⭐⭐⭐⭐          | ✅✅                   | ⭐⭐⭐⭐             | ⭐⭐⭐⭐⭐                  |

**Winner**: Pattern 2 and Pattern 6 (tied) - best compile-time guarantees

---

## Maintainability Comparison Matrix

| Pattern                        | Code Clarity | Extensibility | Testing    | Refactoring Ease | Team Familiarity |
| ------------------------------ | ------------ | ------------- | ---------- | ---------------- | ---------------- |
| Pattern 1: Object Map          | ⭐⭐⭐⭐     | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐   | ⭐⭐⭐⭐         | ⭐⭐⭐⭐         |
| Pattern 2: Discriminated Union | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐         |
| Pattern 3: Switch Statement    | ⭐⭐⭐       | ⭐⭐          | ⭐⭐       | ⭐⭐             | ⭐⭐⭐⭐⭐       |
| Pattern 4: Render Props        | ⭐⭐         | ⭐⭐⭐        | ⭐⭐⭐⭐   | ⭐⭐⭐           | ⭐⭐             |
| Pattern 5: HOC                 | ⭐⭐         | ⭐⭐⭐        | ⭐⭐⭐     | ⭐⭐             | ⭐⭐             |
| Pattern 6: State Machine       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐         | ⭐               |

**Winner**: Pattern 2 - excellent balance of clarity, extensibility, and testability with strong team familiarity

---

## Final Recommendation

### 🏆 Primary Recommendation: Pattern 2 (Component Map with Discriminated Union Keys)

**Rationale**:

1. **Superior Type Safety**: Discriminated unions prevent impossible state combinations at compile time
2. **Excellent Maintainability**: Clear separation between view state, routing logic, and rendering
3. **Extensibility**: Adding new views requires only updating the ViewState union and routing hook
4. **React 19 Compatible**: Uses modern hooks pattern, no legacy HOCs or class components
5. **Testability**: View routing logic can be extracted and tested independently
6. **Performance**: Minimal overhead with proper memoization

**Best for**:

- Applications with 5-15 view states ✅
- TypeScript strict mode requirements ✅
- Client-side static export ✅
- Team familiar with discriminated unions ✅
- Long-term maintenance concerns ✅

### 🥈 Alternative Recommendation: Pattern 1 (Object Map with Composite Keys)

**When to use instead**:

- Team prefers simpler string-based keys over discriminated unions
- Faster initial implementation needed
- Less emphasis on preventing impossible states
- Slightly simpler mental model

**Trade-off**: Loses some compile-time safety for simpler implementation

---

## Implementation Roadmap for This Project

### Phase 1: Extract View Components (Day 1)

1. Create `DefaultView` component for default button layout
2. Extract footer with ExitMenuButton to separate component
3. Verify all components accept necessary props

### Phase 2: Define View State Types (Day 1)

1. Create `types/routing.ts` with ViewState discriminated union
2. Define ViewRegistry interface
3. Create ViewKey type

### Phase 3: Implement View Router Hook (Day 2)

1. Create `routing/useViewRouter.ts`
2. Implement `getViewKey` function with ViewState input
3. Build props mapping logic in switch statement
4. Add VIEW_COMPONENTS registry

### Phase 4: Refactor page.tsx (Day 2)

1. Construct ViewState from activeMenu + viewMode
2. Call useViewRouter with ViewState and app state
3. Replace nested conditionals with ViewComponent render
4. Test all navigation flows

### Phase 5: Add Tests (Day 3)

1. Unit test getViewKey with all state combinations
2. Test props mapping for each view
3. Integration test view transitions

### Estimated Implementation Time: 2-3 days

---

## Additional Resources

### TypeScript Patterns

- [TypeScript Handbook: Discriminated Unions](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes-func.html#discriminated-unions)
- [Exhaustiveness Checking with never](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking)

### React Patterns

- [React Docs: Conditional Rendering](https://react.dev/learn/conditional-rendering)
- [React Docs: Describing the UI](https://react.dev/learn/describing-the-ui)

### State Management

- [You Might Not Need a State Management Library](https://kentcdodds.com/blog/application-state-management-with-react)
- [React State Machines](https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript)

---

## Conclusion

For this project's specific requirements (React 19 + Next.js static export, 6-10 view states, TypeScript strict mode, client-side only), **Pattern 2 (Component Map with Discriminated Union Keys)** provides the optimal balance of:

- **Type Safety**: Prevents impossible state combinations
- **Maintainability**: Clear, testable routing logic
- **Performance**: Negligible overhead with memoization
- **Extensibility**: Easy to add new views
- **React 19 Alignment**: Uses modern hooks, no legacy patterns

The pattern eliminates nested conditionals, provides a single source of truth for view routing, and leverages TypeScript's advanced type system for compile-time safety - all critical requirements for long-term maintenance of this aviation-inspired checklist application.

**Next Step**: Review this research with the team and proceed with implementation using the phased roadmap above.
