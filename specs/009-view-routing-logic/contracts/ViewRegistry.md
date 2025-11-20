# Contract: View Component Registry

**File**: `src/routing/viewRegistry.ts`  
**Feature**: View Routing Logic Simplification  
**Date**: 2025-11-20

This contract defines the component registry that maps ViewKey strings to React components.

---

## Registry Interface

```typescript
import { ComponentType } from "react";
import {
  DefaultViewProps,
  ChecklistMenuProps,
  ChecklistDisplayProps,
  ResetsMenuProps,
} from "@/types/routing";

/**
 * Type-safe registry mapping ViewKey to React component types.
 *
 * Each ViewKey must map to a component with the correct props interface.
 * TypeScript enforces that the component type matches the expected props.
 */
export interface ViewRegistry {
  default: ComponentType<DefaultViewProps>;
  "menu-normal": ComponentType<ChecklistMenuProps>;
  "menu-non-normal": ComponentType<ChecklistMenuProps>;
  "menu-resets": ComponentType<ResetsMenuProps>;
  "checklist-normal": ComponentType<ChecklistDisplayProps>;
  "checklist-non-normal": ComponentType<ChecklistDisplayProps>;
}
```

---

## Registry Implementation

```typescript
import { DefaultView } from "@/components/DefaultView";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";

/**
 * Component registry for view routing.
 *
 * Maps ViewKey strings to their corresponding React components.
 * Used by useViewRouter for component lookup.
 */
export const VIEW_COMPONENTS: ViewRegistry = {
  default: DefaultView,
  "menu-normal": ChecklistMenu,
  "menu-non-normal": ChecklistMenu,
  "menu-resets": ResetsMenu,
  "checklist-normal": ChecklistDisplay,
  "checklist-non-normal": ChecklistDisplay,
};
```

---

## Component Reuse

Notice that some components are used for multiple ViewKeys:

- **ChecklistMenu**: Used for both `"menu-normal"` and `"menu-non-normal"`
  - Props differentiation: `menuType` prop distinguishes behavior
- **ChecklistDisplay**: Used for both `"checklist-normal"` and `"checklist-non-normal"`
  - Props differentiation: `hasNextChecklist` prop (true for NORMAL, false for NON_NORMAL)

This is intentional - the same component can handle multiple view states with different props.

---

## Type Safety Enforcement

The registry interface ensures type safety:

```typescript
// ✅ Valid - DefaultView accepts DefaultViewProps
const valid1: ViewRegistry = {
  default: DefaultView,
  // ... other entries
};

// ❌ Type error - string doesn't satisfy ComponentType<DefaultViewProps>
const invalid1: ViewRegistry = {
  default: "NotAComponent", // Error!
  // ...
};

// ❌ Type error - Component with wrong props
const InvalidComponent: ComponentType<{ wrong: string }> = () => null;
const invalid2: ViewRegistry = {
  default: InvalidComponent, // Error! Props don't match DefaultViewProps
  // ...
};

// ❌ Type error - Missing required ViewKey
const invalid3: ViewRegistry = {
  default: DefaultView,
  // Error! Missing other required keys
};
```

---

## Adding New Views

To add a new view to the registry:

### Step 1: Add ViewKey to type

```typescript
// In types/routing.ts
export type ViewKey =
  | "default"
  | "menu-normal"
  | "menu-non-normal"
  | "menu-resets"
  | "checklist-normal"
  | "checklist-non-normal"
  | "new-view"; // ← Add new key
```

### Step 2: Update ViewRegistry interface

```typescript
// In routing/viewRegistry.ts
export interface ViewRegistry {
  default: ComponentType<DefaultViewProps>;
  "menu-normal": ComponentType<ChecklistMenuProps>;
  "menu-non-normal": ComponentType<ChecklistMenuProps>;
  "menu-resets": ComponentType<ResetsMenuProps>;
  "checklist-normal": ComponentType<ChecklistDisplayProps>;
  "checklist-non-normal": ComponentType<ChecklistDisplayProps>;
  "new-view": ComponentType<NewViewProps>; // ← Add new entry
}
```

### Step 3: Add component to registry

```typescript
import { NewView } from "@/components/NewView";

export const VIEW_COMPONENTS: ViewRegistry = {
  default: DefaultView,
  "menu-normal": ChecklistMenu,
  "menu-non-normal": ChecklistMenu,
  "menu-resets": ResetsMenu,
  "checklist-normal": ChecklistDisplay,
  "checklist-non-normal": ChecklistDisplay,
  "new-view": NewView, // ← Add component mapping
};
```

### Step 4: Update ViewState (if needed)

If the new view requires a new ViewState variant:

```typescript
// In types/routing.ts
export type ViewState =
  | { view: "default" }
  | { view: "menu"; menu: MenuType }
  | { view: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL }
  | { view: "new-view" /* add properties */ }; // ← Add new variant
```

### Step 5: Update getViewKey and props mapping

Update the routing logic in `useViewRouter.ts` to handle the new ViewKey.

---

## Component Props Interfaces

For reference, the props interfaces used by the registry:

### DefaultViewProps

```typescript
export interface DefaultViewProps {
  onNormalClick: () => void;
  onNonNormalClick: () => void;
}
```

**Component**: `DefaultView`  
**Purpose**: Initial app state with NORMAL/NON-NORMAL buttons

---

### ChecklistMenuProps

```typescript
export interface ChecklistMenuProps {
  categories: ChecklistCategory[];
  onSelect: (categoryId: string) => void;
  itemStates: ItemStates;
  menuType: MenuType;
}
```

**Component**: `ChecklistMenu`  
**Purpose**: Display checklist category menu (NORMAL, NON-NORMAL, or RESETS)

---

### ChecklistDisplayProps

```typescript
export interface ChecklistDisplayProps {
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

**Component**: `ChecklistDisplay`  
**Purpose**: Display individual checklist items with controls

---

### ResetsMenuProps

```typescript
export interface ResetsMenuProps {
  onResetNormal: () => void;
  onResetNonNormal: () => void;
  onResetAll: () => void;
  onExitMenu: () => void;
}
```

**Component**: `ResetsMenu`  
**Purpose**: Reset menu with three reset options

---

## Lazy Loading (Not Implemented)

The current implementation uses static imports. For future optimization, consider lazy loading:

```typescript
import { lazy, ComponentType } from "react";

const DefaultView = lazy(() => import("@/components/DefaultView"));
const ChecklistMenu = lazy(() => import("@/components/ChecklistMenu"));
const ChecklistDisplay = lazy(() => import("@/components/ChecklistDisplay"));
const ResetsMenu = lazy(() => import("@/components/ResetsMenu"));

export const VIEW_COMPONENTS: ViewRegistry = {
  "default": DefaultView as ComponentType<DefaultViewProps>,
  "menu-normal": ChecklistMenu as ComponentType<ChecklistMenuProps>,
  // ...
};

// Wrap in Suspense in page.tsx
<Suspense fallback={<LoadingView />}>
  <ViewComponent {...viewProps} />
</Suspense>
```

**Not implemented initially** - adds complexity without clear benefit for this small app.

---

## Registry Validation (Runtime)

Optional runtime validation for development:

```typescript
/**
 * Validates that all ViewKey values have a corresponding component in the registry.
 * Should be called once during app initialization in development mode.
 */
export function validateRegistry() {
  if (process.env.NODE_ENV !== "development") return;

  const expectedKeys: ViewKey[] = [
    "default",
    "menu-normal",
    "menu-non-normal",
    "menu-resets",
    "checklist-normal",
    "checklist-non-normal",
  ];

  const registryKeys = Object.keys(VIEW_COMPONENTS) as ViewKey[];

  const missing = expectedKeys.filter((key) => !(key in VIEW_COMPONENTS));
  const extra = registryKeys.filter((key) => !expectedKeys.includes(key));

  if (missing.length > 0) {
    console.error("Missing components in registry:", missing);
  }

  if (extra.length > 0) {
    console.warn("Extra components in registry:", extra);
  }
}

// In page.tsx or layout.tsx (development only)
useEffect(() => {
  validateRegistry();
}, []);
```

**Optional**: Can be added for additional safety during development.

---

## Testing Checklist

When implementing, verify:

- [ ] All ViewKey values have entries in ViewRegistry interface
- [ ] All ViewKey values have entries in VIEW_COMPONENTS constant
- [ ] Component types match their declared props interfaces
- [ ] Importing all components doesn't cause circular dependencies
- [ ] TypeScript compilation passes with no errors
- [ ] All components export ComponentType-compatible functions

---

## Differences from Current Implementation

### Before

Components were directly referenced in nested JSX conditionals:

```typescript
// page.tsx
if (activeMenu === MenuType.NORMAL) {
  if (viewMode === "menu") {
    return <ChecklistMenu {...normalMenuProps} />;
  }
  if (viewMode === "checklist") {
    return <ChecklistDisplay {...normalChecklistProps} />;
  }
}
```

**Problem**: Component selection logic scattered across many conditional blocks.

### After

Components centralized in registry:

```typescript
// viewRegistry.ts
export const VIEW_COMPONENTS: ViewRegistry = {
  "menu-normal": ChecklistMenu,
  "checklist-normal": ChecklistDisplay,
  // ...
};

// page.tsx
const ViewComponent = VIEW_COMPONENTS[viewKey];
return <ViewComponent {...viewProps} />;
```

**Benefits**:

- Single source of truth for component mapping
- Easy to see all available views at a glance
- Type-safe component lookup
- Easier to add/remove views

---

## Summary

This contract defines:

- **ViewRegistry**: Type-safe interface for component mapping
- **VIEW_COMPONENTS**: Constant registry implementation
- **Component reuse pattern**: Same component for multiple ViewKeys with different props
- **Type safety**: TypeScript enforcement of component prop interfaces
- **Extension pattern**: How to add new views to the registry
- **Optional validation**: Runtime registry validation for development

The registry is a simple, type-safe lookup table that replaces scattered component references with a centralized mapping structure.
