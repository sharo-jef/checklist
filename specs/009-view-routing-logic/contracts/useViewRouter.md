# Contract: useViewRouter Hook

**File**: `src/routing/useViewRouter.ts`  
**Feature**: View Routing Logic Simplification  
**Date**: 2025-11-20

This contract defines the `useViewRouter` custom hook that maps ViewState and AppState to the appropriate view component and props.

---

## Hook Signature

```typescript
import { ComponentType } from "react";
import { ViewState } from "@/types/routing";

interface ViewRouterResult<P = any> {
  ViewComponent: ComponentType<P>;
  viewProps: P;
}

/**
 * Maps ViewState and application state to the appropriate view component and props.
 *
 * This hook encapsulates all view routing logic, replacing nested conditional rendering
 * in page.tsx with a declarative lookup pattern.
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
): ViewRouterResult;
```

---

## AppState Interface

```typescript
import {
  ChecklistCategory,
  Checklist,
  ChecklistItem,
  ItemStates,
} from "@/types/checklist";

/**
 * Aggregated application state passed to useViewRouter for props generation.
 * Contains all handlers, data, and derived state needed by view components.
 */
export interface AppState {
  // Navigation handlers
  handleNormalButton: () => void;
  handleNonNormalButton: () => void;
  handleChecklistSelect: (categoryId: string) => void;
  handleExitMenu: () => void;

  // Checklist item handlers
  handleToggleItem: (index: number) => void;
  handleItemOverride: (index: number) => void;
  handleChecklistOverride: () => void;
  handleChecklistReset: () => void;
  handleNext: () => void;

  // Reset handlers
  handleResetNormal: () => void;
  handleResetNonNormal: () => void;
  handleResetAll: () => void;

  // Data
  checklistData: ChecklistCategory[];
  itemStates: ItemStates;
  currentChecklist: Checklist | null;
  currentItems: ChecklistItem[];

  // Derived state
  activeItemIndex: number;
  navigation: {
    hasNext: boolean;
    nextNormalChecklist: Checklist | null;
  };
}
```

---

## Internal Implementation Structure

The hook internally performs these operations:

### 1. ViewKey Generation

```typescript
const viewKey = useMemo(() => getViewKey(viewState), [viewState]);
```

Converts ViewState to ViewKey using the utility function from `types/routing.ts`.

### 2. Component Lookup

```typescript
const ViewComponent = VIEW_COMPONENTS[viewKey];

if (!ViewComponent) {
  console.error(`No component registered for view key: ${viewKey}`);
  return {
    ViewComponent: DefaultView,
    viewProps: {
      onNormalClick: appState.handleNormalButton,
      onNonNormalClick: appState.handleNonNormalButton,
    },
  };
}
```

Looks up component from registry. Includes defensive fallback to DefaultView.

### 3. Props Mapping

```typescript
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
        hasNextChecklist: false, // NON_NORMAL checklists don't have NEXT button
      };

    default:
      // Exhaustiveness check
      const _exhaustive: never = viewKey;
      throw new Error(`Unhandled view key: ${_exhaustive}`);
  }
}, [viewKey, appState]);
```

Maps AppState to component-specific props based on ViewKey.

---

## Usage Pattern

```typescript
// In page.tsx
export default function Home() {
  // Existing state and hooks
  const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const {
    activeCategory,
    setActiveCategory,
    updateItemStatus,
    getCurrentChecklist,
    getCurrentItems,
    resetAll,
    resetNormal,
    resetNonNormal,
    resetChecklist,
    overrideChecklist,
    itemStates,
  } = useChecklist({ categories: checklistData });

  const currentChecklist = getCurrentChecklist();
  const currentItems = getCurrentItems();

  const navigation = useMemo(() => ({
    hasNext: hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
    nextNormalChecklist: getNextIncompleteChecklist(
      MenuType.NORMAL,
      checklistData,
      itemStates
    ),
  }), [activeCategory, itemStates]);

  // All event handlers (existing)
  const handleNormalButton = () => { /* ... */ };
  const handleChecklistSelect = (categoryId: string) => { /* ... */ };
  // ... etc

  // Construct ViewState
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

  // Aggregate AppState
  const appState: AppState = useMemo(() => ({
    handleNormalButton,
    handleNonNormalButton,
    handleChecklistSelect,
    handleExitMenu,
    handleToggleItem,
    handleItemOverride,
    handleChecklistOverride,
    handleChecklistReset,
    handleNext,
    handleResetNormal,
    handleResetNonNormal,
    handleResetAll,
    checklistData,
    itemStates,
    currentChecklist,
    currentItems,
    activeItemIndex,
    navigation,
  }), [
    handleNormalButton,
    handleNonNormalButton,
    // ... all dependencies
  ]);

  // Use routing hook
  const { ViewComponent, viewProps } = useViewRouter(viewState, appState);

  // Render
  return (
    <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
      <TopMenu
        activeMenu={viewMode === "checklist" ? null : activeMenu}
        onMenuChange={handleMenuChange}
      />
      <ViewComponent {...viewProps} />
    </div>
  );
}
```

---

## Performance Considerations

### Memoization Requirements

1. **viewState**: Must be memoized to prevent unnecessary re-renders

   ```typescript
   const viewState = useMemo(() => {
     /* ... */
   }, [viewMode, activeMenu]);
   ```

2. **appState**: Must be memoized with all dependencies

   ```typescript
   const appState = useMemo(
     () => ({
       /* ... */
     }),
     [
       /* all deps */
     ]
   );
   ```

3. **Internal memoization**: Hook uses `useMemo` for viewKey and viewProps

### Dependency Arrays

Critical: AppState memoization must include ALL handlers and data. Missing dependencies will cause stale closures.

**Solution**: Use `useCallback` for all handlers in page.tsx to stabilize references.

```typescript
const handleNormalButton = useCallback(() => {
  setActiveMenu(MenuType.NORMAL);
  setViewMode("menu");
}, []);

const handleToggleItem = useCallback(
  (index: number) => {
    // ... implementation
  },
  [currentItems, updateItemStatus]
);
```

---

## Type Safety Guarantees

### Exhaustiveness Checking

The props mapping switch statement uses TypeScript's exhaustiveness checking:

```typescript
default:
  const _exhaustive: never = viewKey;
  throw new Error(`Unhandled view key: ${_exhaustive}`);
```

If a new ViewKey is added but not handled, TypeScript will error at compile time.

### Props Type Inference

Each case returns props matching the component's expected interface:

```typescript
case "menu-normal":
  // Return type is ChecklistMenuProps
  return {
    categories: ChecklistCategory[],
    onSelect: (categoryId: string) => void,
    itemStates: ItemStates,
    menuType: MenuType.NORMAL,
  };
```

TypeScript validates that returned props match the component's prop types.

---

## Error Handling

### Component Lookup Failure

```typescript
if (!ViewComponent) {
  console.error(`No component registered for view key: ${viewKey}`);
  return {
    ViewComponent: DefaultView,
    viewProps: getDefaultViewProps(appState),
  };
}
```

Defensive fallback prevents app crash if component is missing from registry.

### Invalid ViewKey

Should be impossible due to type system, but defensive error handling included:

```typescript
default:
  const _exhaustive: never = viewKey;
  throw new Error(`Unhandled view key: ${_exhaustive}`);
```

---

## Testing Checklist

When implementing, verify:

- [ ] All ViewKey cases have props mapping
- [ ] Props types match component interfaces
- [ ] Exhaustiveness checking passes TypeScript compilation
- [ ] Memoization prevents unnecessary re-renders
- [ ] Component lookup fallback works
- [ ] All AppState properties are used in at least one view
- [ ] Handler references are stable (useCallback)

---

## Differences from Current Implementation

### Before (Nested Conditionals)

```typescript
// page.tsx - 100+ lines of JSX conditionals
if (viewMode === "default") {
  return <div>{/* default buttons */}</div>;
}

if (activeMenu === MenuType.NORMAL) {
  if (viewMode === "menu") {
    return <ChecklistMenu {...normalMenuProps} />;
  }
  if (viewMode === "checklist") {
    return <ChecklistDisplay {...normalChecklistProps} />;
  }
}

// ... more nested if-else blocks
```

### After (Routing Hook)

```typescript
// page.tsx - clean, declarative rendering
const { ViewComponent, viewProps } = useViewRouter(viewState, appState);
return <ViewComponent {...viewProps} />;
```

**Benefits**:

- Single source of truth for view routing
- Type-safe exhaustiveness checking
- Testable routing logic (hook can be tested independently)
- Easy to add new views (update ViewState + props mapping)

---

## Summary

This contract defines:

- **useViewRouter**: Custom hook signature and implementation structure
- **AppState**: Interface for aggregated application state
- **ViewRouterResult**: Return type with component and props
- **Props mapping**: Logic for converting AppState to component-specific props
- **Error handling**: Defensive fallbacks for edge cases
- **Performance**: Memoization requirements and optimization strategies

The hook is the core of the routing system, encapsulating all view selection logic in a testable, type-safe manner.
