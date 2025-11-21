# Contract: ViewState Type Definition

**File**: `src/types/routing.ts`  
**Feature**: View Routing Logic Simplification  
**Date**: 2025-11-20

This contract defines the TypeScript type structure for `ViewState`, the discriminated union that represents all valid view configurations in the application.

---

## Type Definition

```typescript
import { MenuType } from "./checklist";

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
```

---

## Supporting Types

```typescript
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
```

---

## Type Narrowing Examples

TypeScript's discriminated union support allows type narrowing based on the `view` property:

```typescript
function handleViewState(state: ViewState) {
  switch (state.view) {
    case "default":
      // state is { view: "default" }
      // state.menu is a type error (property doesn't exist)
      console.log("Default view");
      break;

    case "menu":
      // state is { view: "menu"; menu: MenuType }
      console.log(`Menu: ${state.menu}`); // ✅ menu is accessible
      break;

    case "checklist":
      // state is { view: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL }
      console.log(`Checklist: ${state.menu}`); // ✅ menu is accessible
      // state.menu is guaranteed to NOT be MenuType.RESETS
      break;

    default:
      // Exhaustiveness check - TypeScript error if case missing
      const _exhaustive: never = state;
      throw new Error(`Unhandled view: ${_exhaustive}`);
  }
}
```

---

## Impossible States (Type Errors)

The following states are **compile-time errors** thanks to the discriminated union:

```typescript
// ❌ Type error: menu property not allowed on default view
const invalid1: ViewState = { view: "default", menu: MenuType.NORMAL };

// ❌ Type error: menu property required on menu view
const invalid2: ViewState = { view: "menu" };

// ❌ Type error: RESETS not allowed in checklist view
const invalid3: ViewState = { view: "checklist", menu: MenuType.RESETS };

// ❌ Type error: invalid menu value
const invalid4: ViewState = { view: "menu", menu: "INVALID" };
```

---

## Construction Pattern

ViewState should be constructed from existing `activeMenu` and `viewMode` state:

```typescript
// In page.tsx
const [activeMenu, setActiveMenu] = useState<MenuType | null>(null);
const [viewMode, setViewMode] = useState<"default" | "menu" | "checklist">(
  "default"
);

// Derive ViewState
const viewState: ViewState = useMemo(() => {
  if (viewMode === "default") {
    return { view: "default" };
  }

  if (viewMode === "menu" && activeMenu) {
    return { view: "menu", menu: activeMenu };
  }

  if (
    viewMode === "checklist" &&
    activeMenu &&
    activeMenu !== MenuType.RESETS
  ) {
    return {
      view: "checklist",
      menu: activeMenu as MenuType.NORMAL | MenuType.NON_NORMAL,
    };
  }

  // Fallback to default
  return { view: "default" };
}, [viewMode, activeMenu]);
```

---

## ViewKey Derivation

ViewKey is derived from ViewState for internal routing:

```typescript
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
      // Converts MenuType enum to kebab-case string
      // MenuType.NORMAL → "normal", MenuType.NON_NORMAL → "non-normal"
      return `menu-${state.menu.toLowerCase().replace("_", "-")}` as ViewKey;

    case "checklist":
      return `checklist-${state.menu.toLowerCase().replace("_", "-")}` as ViewKey;

    default:
      const _exhaustive: never = state;
      throw new Error(`Unhandled view state: ${_exhaustive}`);
  }
}
```

---

## Type Guards

Optional type guards for runtime checks:

```typescript
export function isDefaultView(state: ViewState): state is { view: "default" } {
  return state.view === "default";
}

export function isMenuView(
  state: ViewState
): state is { view: "menu"; menu: MenuType } {
  return state.view === "menu";
}

export function isChecklistView(
  state: ViewState
): state is { view: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL } {
  return state.view === "checklist";
}
```

---

## Integration with Existing Types

ViewState imports from `@/types/checklist`:

```typescript
// From checklist.ts (existing)
export enum MenuType {
  NORMAL = "normal",
  NON_NORMAL = "non_normal",
  RESETS = "resets",
}
```

No changes required to existing types. ViewState is additive.

---

## Testing Checklist

When implementing, verify:

- [ ] All ViewState variants can be constructed
- [ ] Impossible states cause TypeScript errors
- [ ] Type narrowing works in switch statements
- [ ] `getViewKey` handles all ViewState cases
- [ ] Exhaustiveness checking catches missing cases
- [ ] ViewKey values match component registry keys

---

## Summary

This contract defines:

- **ViewState**: Discriminated union for all valid view configurations
- **ViewKey**: Internal routing key type
- **getViewKey**: Conversion function from ViewState to ViewKey
- **Type guards**: Optional runtime type checking utilities

The ViewState type is the foundation of the routing system, providing compile-time guarantees that impossible view combinations cannot be represented.
