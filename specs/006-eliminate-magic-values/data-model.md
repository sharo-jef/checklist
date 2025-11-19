# Data Model: Replace Magic Values with Named Constants

**Feature**: 006-eliminate-magic-values  
**Date**: 2025-11-20

## Overview

This feature introduces a new constants module but does not modify any runtime data structures. All changes are compile-time transformations that improve code readability without altering application behavior.

## Entities

### UIConstants (New Module)

**Type**: Compile-time constant module  
**Location**: `src/constants/ui.ts`  
**Purpose**: Centralized repository for UI-related magic values

**Fields**:

| Name                       | Type                  | Value  | Purpose                                                             |
| -------------------------- | --------------------- | ------ | ------------------------------------------------------------------- |
| `DOTTED_SEPARATOR_REPEATS` | `400` (literal type)  | `400`  | Number of dot-space pairs in checklist item separator line          |
| `RESET_MENU_EXIT_DELAY_MS` | `1000` (literal type) | `1000` | Milliseconds to display reset confirmation before auto-exiting menu |

**Type Signature**:

```typescript
export const DOTTED_SEPARATOR_REPEATS = 400 as const;
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const;
```

**Validation Rules**:

- Values MUST be positive integers
- Values MUST use `as const` assertion for type narrowing
- Each constant MUST have JSDoc comment explaining its purpose

**Relationships**:

- **Consumed by**: `ChecklistItem` component (DOTTED_SEPARATOR_REPEATS)
- **Consumed by**: `ResetsMenu` component (RESET_MENU_EXIT_DELAY_MS)

**State Transitions**: N/A (immutable compile-time constants)

---

## Modified Components

### ChecklistItem Component

**Change**: Import and use `DOTTED_SEPARATOR_REPEATS` instead of inline `400`

**Before**:

```typescript
{
  ". ".repeat(400);
}
```

**After**:

```typescript
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui";
// ...
{
  ". ".repeat(DOTTED_SEPARATOR_REPEATS);
}
```

**Impact**: Zero runtime behavior change. Improves code readability.

---

### ResetsMenu Component

**Change**: Import and use `RESET_MENU_EXIT_DELAY_MS` instead of inline `1000`

**Before**:

```typescript
timeoutRef.current = setTimeout(() => {
  setClickedButton(null);
  onExitMenu();
  timeoutRef.current = null;
}, 1000);
```

**After**:

```typescript
import { RESET_MENU_EXIT_DELAY_MS } from "@/constants/ui";
// ...
timeoutRef.current = setTimeout(() => {
  setClickedButton(null);
  onExitMenu();
  timeoutRef.current = null;
}, RESET_MENU_EXIT_DELAY_MS);
```

**Impact**: Zero runtime behavior change. Delay remains 1000ms.

---

### Page Component (app/page.tsx)

**Change**: Replace `setTimeout(..., 0)` with `queueMicrotask()`

**Before**:

```typescript
setTimeout(() => {
  const firstUncheckedIndex = currentItems.findIndex(...);
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
}, 0);
```

**After**:

```typescript
queueMicrotask(() => {
  const firstUncheckedIndex = currentItems.findIndex(...);
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
});
```

**Impact**: Improved consistency with `useChecklist.ts` pattern. Timing behavior functionally equivalent (both defer to next microtask).

---

## Non-Functional Requirements

### Type Safety

- All constants MUST be exported with `as const` assertions
- TypeScript strict mode MUST pass without errors
- No type widening allowed (e.g., `400` literal type, not `number`)

### Immutability

- Constants MUST NOT be reassigned (enforced by `const` keyword)
- Values MUST be compile-time constants (no computed values)

### Import Patterns

- All imports MUST use `@/constants/ui` path alias (not relative paths)
- Destructured imports preferred: `import { CONSTANT_NAME } from "@/constants/ui"`

---

## Migration Impact

### Breaking Changes

**None**. This is a refactoring-only change with zero API surface modifications.

### Backward Compatibility

**Fully compatible**. No runtime behavior changes, no data model updates, no LocalStorage schema changes.

### Rollback Plan

If issues arise, revert commits to restore inline magic values. No data migration needed.

---

## Testing Considerations

### Verification Checklist

1. ✅ **Type check**: `npm run lint` passes without errors
2. ✅ **Build**: `npm run build` succeeds (static export works)
3. ✅ **Visual parity**: Dotted separator line looks identical
4. ✅ **Timing parity**: Reset menu auto-exit still takes 1 second
5. ✅ **Active item advance**: Still updates correctly after checkbox toggle

### Edge Cases

- **Zero or negative constants**: Not applicable (values are hardcoded positive integers)
- **Floating point precision**: Not applicable (all values are integers)
- **Concurrent updates**: Not applicable (constants are immutable)

---

## Future Extensibility

### Potential Additions

If more UI constants are identified in future features:

```typescript
// src/constants/ui.ts (future expansion example)
export const DOTTED_SEPARATOR_REPEATS = 400 as const;
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const;

// Potential future constants
export const CHECKLIST_ITEM_HEIGHT_PX = 56 as const; // If extracted from Tailwind
export const MENU_ANIMATION_DURATION_MS = 300 as const; // If animations added
```

### Other Constant Modules

If constants grow beyond UI domain:

- `src/constants/storage.ts` - LocalStorage keys, version numbers
- `src/constants/timing.ts` - Animation/transition durations
- `src/constants/config.ts` - App-level configuration values

**Recommendation**: Add new modules only when proven necessary (YAGNI principle).

---

## Summary

This data model documents the introduction of a minimal constants module with two values. No runtime data structures are modified. The change is purely a code organization improvement that enhances maintainability and self-documentation.

**Key Principle**: Constants are compile-time artifacts, not runtime data. They have no state, no lifecycle, and no persistence requirements.
