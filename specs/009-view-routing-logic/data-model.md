# Data Model: View Routing State

**Feature**: Simplify Conditional View Rendering  
**Date**: 2025-11-20  
**Context**: Refactoring view selection logic from nested conditionals to typed routing

This document defines the data structures used to represent view states, routing keys, and application state required for view rendering. All types leverage TypeScript discriminated unions for compile-time safety.

---

## Core Types

### ViewState (Discriminated Union)

The primary state representation for the current view. This discriminated union prevents impossible state combinations at compile time.

```typescript
type ViewState =
  | { view: "default" }
  | { view: "menu"; menu: MenuType }
  | { view: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL };
```

**Discriminator**: `view` property

**Valid Combinations**:

1. `{ view: "default" }` - Initial app state with NORMAL/NON-NORMAL buttons
2. `{ view: "menu", menu: MenuType.NORMAL }` - NORMAL checklist menu
3. `{ view: "menu", menu: MenuType.NON_NORMAL }` - NON-NORMAL checklist menu
4. `{ view: "menu", menu: MenuType.RESETS }` - RESETS menu
5. `{ view: "checklist", menu: MenuType.NORMAL }` - NORMAL checklist display
6. `{ view: "checklist", menu: MenuType.NON_NORMAL }` - NON-NORMAL checklist display

**Invalid Combinations** (prevented by type system):

- `{ view: "checklist", menu: MenuType.RESETS }` - RESETS has no checklist view
- `{ view: "menu" }` - Menu views require explicit menu type
- `{ view: "default", menu: ... }` - Default view has no menu type

**Relationship to Existing State**:

```typescript
// Current state in page.tsx
const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
const [viewMode, setViewMode] = useState<ViewMode>(
  "default" | "menu" | "checklist"
);

// Derived ViewState
const viewState: ViewState = useMemo(() => {
  if (viewMode === "default") return { view: "default" };
  if (viewMode === "menu" && activeMenu) {
    return { view: "menu", menu: activeMenu };
  }
  if (
    viewMode === "checklist" &&
    activeMenu &&
    activeMenu !== MenuType.RESETS
  ) {
    return { view: "checklist", menu: activeMenu };
  }
  return { view: "default" }; // Fallback
}, [viewMode, activeMenu]);
```

---

## Routing Types

### ViewKey (String Literal Union)

Internal routing key used for component registry lookups. Composite key derived from ViewState.

```typescript
type ViewKey =
  | "default"
  | "menu-normal"
  | "menu-non-normal"
  | "menu-resets"
  | "checklist-normal"
  | "checklist-non-normal";
```

**Mapping Function**:

```typescript
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
```

**Examples**:

- `{ view: "default" }` → `"default"`
- `{ view: "menu", menu: MenuType.NORMAL }` → `"menu-normal"`
- `{ view: "checklist", menu: MenuType.NON_NORMAL }` → `"checklist-non-normal"`

---

### ViewRegistry (Component Map)

Type-safe registry mapping ViewKey to React component types.

```typescript
import { ComponentType } from "react";

interface ViewRegistry {
  default: ComponentType<DefaultViewProps>;
  "menu-normal": ComponentType<ChecklistMenuProps>;
  "menu-non-normal": ComponentType<ChecklistMenuProps>;
  "menu-resets": ComponentType<ResetsMenuProps>;
  "checklist-normal": ComponentType<ChecklistDisplayProps>;
  "checklist-non-normal": ComponentType<ChecklistDisplayProps>;
}
```

**Purpose**: Ensures type safety when looking up components. TypeScript enforces that each ViewKey maps to a valid component.

**Implementation** (in `routing/viewRegistry.ts`):

```typescript
import { DefaultView } from "@/components/DefaultView";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";

const VIEW_COMPONENTS: ViewRegistry = {
  default: DefaultView,
  "menu-normal": ChecklistMenu,
  "menu-non-normal": ChecklistMenu,
  "menu-resets": ResetsMenu,
  "checklist-normal": ChecklistDisplay,
  "checklist-non-normal": ChecklistDisplay,
};
```

---

## Application State Types

### AppState (Props Aggregation)

Aggregated application state passed to the view router for props mapping. Contains all handlers, data, and derived state needed by view components.

```typescript
interface AppState {
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

**Usage**: Passed to `useViewRouter` hook to generate view-specific props.

**Note**: This is a _view-layer aggregation_, not a global state object. It remains local to `page.tsx` and is constructed from existing hooks/state.

---

## Component Props Types (Reference)

These types are defined in component files but referenced here for completeness.

### DefaultViewProps

```typescript
interface DefaultViewProps {
  onNormalClick: () => void;
  onNonNormalClick: () => void;
}
```

### ChecklistMenuProps

```typescript
interface ChecklistMenuProps {
  categories: ChecklistCategory[];
  onSelect: (categoryId: string) => void;
  itemStates: ItemStates;
  menuType: MenuType;
}
```

### ChecklistDisplayProps

```typescript
interface ChecklistDisplayProps {
  checklist: Checklist | null;
  items: ChecklistItem[];
  activeItemIndex: number;
  onToggleItem: (index: number) => void;
  onItemOverride: (index: number) => void;
  onChecklistOverride: () => void;
  onChecklistReset: () => void;
  onNext?: () => void;
  showControls: boolean;
  hasNextChecklist: boolean;
}
```

### ResetsMenuProps

```typescript
interface ResetsMenuProps {
  onResetNormal: () => void;
  onResetNonNormal: () => void;
  onResetAll: () => void;
  onExitMenu: () => void;
}
```

---

## Type Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        page.tsx                              │
│                                                               │
│  activeMenu: MenuType | null                                 │
│  viewMode: "default" | "menu" | "checklist"                  │
│                                                               │
│                         ↓                                     │
│                                                               │
│  viewState: ViewState (discriminated union)                  │
│                                                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              useViewRouter(viewState, appState)              │
│                                                               │
│  getViewKey(viewState) → ViewKey                             │
│                                                               │
│  ViewKey → VIEW_COMPONENTS[ViewKey] → Component              │
│                                                               │
│  ViewKey + AppState → switch → ComponentProps                │
│                                                               │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────────┐
│             { ViewComponent, viewProps }                     │
│                                                               │
│  <ViewComponent {...viewProps} />                            │
└─────────────────────────────────────────────────────────────┘
```

---

## State Transitions

View state transitions are managed by existing event handlers in `page.tsx`. The routing layer is **read-only** - it maps current state to views but doesn't trigger state changes.

### Transition Map

| Current ViewState                         | Event                | Next ViewState                                |
| ----------------------------------------- | -------------------- | --------------------------------------------- |
| `{ view: "default" }`                     | Click NORMAL         | `{ view: "menu", menu: MenuType.NORMAL }`     |
| `{ view: "default" }`                     | Click NON-NORMAL     | `{ view: "menu", menu: MenuType.NON_NORMAL }` |
| `{ view: "menu", menu: NORMAL }`          | Select checklist     | `{ view: "checklist", menu: NORMAL }`         |
| `{ view: "menu", menu: NON_NORMAL }`      | Select checklist     | `{ view: "checklist", menu: NON_NORMAL }`     |
| `{ view: "menu", menu: RESETS }`          | (no transition)      | (stays in RESETS menu)                        |
| `{ view: "checklist", menu: NORMAL }`     | Click EXIT           | `{ view: "default" }`                         |
| `{ view: "checklist", menu: NON_NORMAL }` | Click EXIT           | `{ view: "default" }`                         |
| `{ view: "menu", menu: * }`               | Click EXIT           | `{ view: "default" }`                         |
| Any state                                 | Click TopMenu RESETS | `{ view: "menu", menu: MenuType.RESETS }`     |

**Implementation Note**: These transitions are handled by existing `handleNormalButton`, `handleChecklistSelect`, `handleExitMenu`, etc. The routing layer doesn't implement these - it only _renders_ the current state.

---

## Validation Rules

### Type-Level Validation (Compile-Time)

1. **ViewState Discriminator**: TypeScript enforces that `view` property narrows available `menu` values
2. **ViewKey Coverage**: All ViewKey values must exist in ViewRegistry interface
3. **Component Props**: Each component in ViewRegistry must match its declared props interface
4. **Exhaustiveness**: Switch statements on ViewState.view must handle all cases (enforced by `satisfies never`)

### Runtime Validation (Defensive)

```typescript
// In useViewRouter.ts
const ViewComponent = VIEW_COMPONENTS[viewKey];

if (!ViewComponent) {
  console.error(`No component registered for view key: ${viewKey}`);
  return { ViewComponent: DefaultView, viewProps: getDefaultProps(appState) };
}
```

**Fallback Strategy**: If an invalid ViewKey is encountered (should be impossible), fall back to DefaultView.

---

## Migration Notes

### Current State Management (Before)

```typescript
// page.tsx - nested conditionals
if (viewMode === "default") {
  return <div>/* default buttons JSX */</div>;
}

if (activeMenu === MenuType.NORMAL) {
  if (viewMode === "menu") {
    return <ChecklistMenu {...normalMenuProps} />;
  }
  if (viewMode === "checklist") {
    return <ChecklistDisplay {...normalChecklistProps} />;
  }
}

// ... more nested conditionals
```

### New State Management (After)

```typescript
// page.tsx - routing hook
const viewState: ViewState = constructViewState(activeMenu, viewMode);
const { ViewComponent, viewProps } = useViewRouter(viewState, appState);

return <ViewComponent {...viewProps} />;
```

**Key Change**: State derivation (`constructViewState`) and component selection (`useViewRouter`) are separated from rendering. The JSX becomes declarative.

---

## Type Safety Guarantees

### Impossible States Prevented

1. ❌ `{ view: "checklist", menu: MenuType.RESETS }` - Type error
2. ❌ `{ view: "menu" }` - Type error (missing menu property)
3. ❌ `{ view: "checklist", menu: "invalid" }` - Type error
4. ❌ ViewKey that doesn't exist in ViewRegistry - Type error

### Exhaustiveness Checking

```typescript
function getViewKey(state: ViewState): ViewKey {
  switch (state.view) {
    case "default":
      return "default";
    case "menu":
      return `menu-${state.menu}` as ViewKey;
    case "checklist":
      return `checklist-${state.menu}` as ViewKey;
    default:
      // TypeScript error if any ViewState.view case is unhandled
      const _exhaustive: never = state;
      throw new Error(`Unhandled view state: ${_exhaustive}`);
  }
}
```

If a new ViewState variant is added, TypeScript will error at the `default` case until it's handled.

---

## Summary

This data model defines:

- **ViewState**: Discriminated union representing all valid view configurations
- **ViewKey**: Internal routing key for component lookup
- **ViewRegistry**: Type-safe component map
- **AppState**: Aggregated application state for props generation
- **Type relationships**: How existing state derives ViewState and how ViewState maps to components

All types leverage TypeScript's type system to prevent impossible states and ensure exhaustive handling of all view combinations. The model maintains a clear separation between state management (in page.tsx) and view selection (in routing layer).
