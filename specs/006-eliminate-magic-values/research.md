# Research: Replace Magic Values with Named Constants

**Feature**: 006-eliminate-magic-values  
**Date**: 2025-11-20  
**Status**: Complete

## Overview

This document captures research findings and design decisions for extracting magic values into named constants.

## Research Questions & Findings

### 1. Constants Organization Strategy

**Question**: Where should constants be defined - single shared file vs. colocated with usage?

**Decision**: Hybrid approach with `src/constants/ui.ts` for shared UI constants

**Rationale**:

- **Shared constants file** (`src/constants/ui.ts`) for values used across multiple components (e.g., `DOTTED_SEPARATOR_REPEATS`)
- **Component-local constants** for truly single-use values that are component-specific
- Aligns with existing project structure: modular `src/` directories (`types/`, `utils/`, `hooks/`)
- TypeScript path alias `@/constants/ui` provides clean imports
- Enables future expansion with additional constant modules (e.g., `@/constants/storage`, `@/constants/timing`)

**Alternatives Considered**:

1. **All constants in component files**: Rejected because `DOTTED_SEPARATOR_REPEATS` might be reused if new checklist UI components are added
2. **Constants in `utils/`**: Rejected because constants are not utility functions; they deserve their own namespace
3. **Multiple granular constant files**: Deferred until proven necessary (YAGNI principle)

---

### 2. Naming Conventions for Constants

**Question**: What naming pattern should be used for different types of constants?

**Decision**: `SCREAMING_SNAKE_CASE` with semantic suffixes

**Rationale**:

- **Industry standard**: TypeScript/JavaScript convention for immutable module-level constants
- **Semantic suffixes** improve clarity:
  - `_REPEATS` for iteration counts (e.g., `DOTTED_SEPARATOR_REPEATS`)
  - `_DELAY_MS` for timing values in milliseconds (e.g., `RESET_MENU_EXIT_DELAY_MS`)
  - No suffix for dimensionless constants or semantic names self-explanatory
- **Type safety**: Constants exported with `as const` assertion or readonly modifier

**Alternatives Considered**:

1. **camelCase**: Rejected because less visually distinct from variables
2. **PascalCase**: Rejected because reserved for type/class names in TypeScript
3. **No suffixes**: Rejected because `RESET_MENU_EXIT_DELAY = 1000` doesn't clarify units (ms? seconds?)

---

### 3. setTimeout vs. queueMicrotask

**Question**: Should `setTimeout(..., 0)` be replaced with `queueMicrotask()` or kept as-is with a named constant?

**Decision**: Replace with `queueMicrotask()` for consistency

**Rationale**:

- **Existing codebase pattern**: `useChecklist.ts` already uses `queueMicrotask()` for hydration-safe state updates
- **Semantic correctness**: `setTimeout(..., 0)` doesn't guarantee execution before next render; it schedules a macrotask. `queueMicrotask()` executes before the next microtask checkpoint (more predictable)
- **Consistency**: Using same async pattern across the app reduces cognitive load
- **Constitution alignment**: Hydration Safety principle (II) prefers patterns that defer state updates predictably

**Implementation**:

```typescript
// BEFORE
setTimeout(() => {
  setActiveItemIndex(...);
}, 0);

// AFTER
queueMicrotask(() => {
  setActiveItemIndex(...);
});
```

**Alternatives Considered**:

1. **Keep `setTimeout` with named constant**: Rejected because it doesn't address the semantic mismatch and introduces two patterns for the same intent
2. **Use `requestAnimationFrame`**: Rejected because it's for visual updates, not state synchronization

---

### 4. TypeScript Const Assertions vs. Readonly

**Question**: Should constants use `as const` assertions or `readonly` modifiers?

**Decision**: Use `as const` for exported module constants

**Rationale**:

- **Literal type inference**: `as const` makes TypeScript infer exact literal types instead of widening to primitive types
  ```typescript
  export const DOTTED_SEPARATOR_REPEATS = 400 as const; // type: 400
  // vs.
  export const DOTTED_SEPARATOR_REPEATS = 400; // type: number
  ```
- **Immutability**: `as const` prevents reassignment and makes the value deeply readonly
- **No runtime overhead**: Compile-time only feature
- **TypeScript best practice**: Recommended for module-level constants in TS documentation

**Alternatives Considered**:

1. **`readonly` modifier**: Only works on class properties, not module-level constants
2. **`Object.freeze()`**: Runtime overhead for simple primitives; unnecessary
3. **No assertion**: Rejected because doesn't prevent accidental reassignment

---

### 5. Edge Case: Single-Use Constants

**Question**: Should values used in only one location be extracted to constants?

**Decision**: Extract if semantic meaning is non-obvious; keep inline with comments if arbitrary

**Rationale**:

- **Threshold test**: "Can a reviewer understand this value's purpose without context?"
  - `400` in `". ".repeat(400)` → **Extract** (non-obvious why 400 dots)
  - `1000` in `setTimeout(..., 1000)` → **Extract** (non-obvious why 1 second)
  - `0` in array index operations → **Keep inline** (obvious meaning)
- **Documentation benefit**: Constant names serve as inline documentation even for single-use values
- **Changeability**: If a value might need adjustment based on UX feedback, extract it

**Examples**:

```typescript
// EXTRACT: Non-obvious semantic meaning
export const DOTTED_SEPARATOR_REPEATS = 400 as const; // Visual overflow for ellipsis effect
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const; // User feedback duration

// KEEP INLINE: Obvious meaning
const firstItem = items[0]; // Not "FIRST_INDEX = 0"
```

**Alternatives Considered**:

1. **Extract everything**: Rejected as over-engineering (creates noise)
2. **Extract nothing**: Rejected because existing magic values obscure intent

---

## Technology-Specific Patterns

### React/Next.js Timing Patterns

**Best Practice**: Prefer microtask scheduling for state updates to avoid hydration issues

**Pattern**:

```typescript
// ✅ Recommended: Microtask (executes before next render)
queueMicrotask(() => {
  setState(newValue);
});

// ❌ Avoid: Macrotask (unpredictable timing)
setTimeout(() => {
  setState(newValue);
}, 0);
```

**Source**: React 19 concurrent rendering model, Next.js hydration guidelines

---

### TypeScript Module Constants

**Best Practice**: Export constants with `as const` assertions for type narrowing

**Pattern**:

```typescript
// src/constants/ui.ts
export const DOTTED_SEPARATOR_REPEATS = 400 as const;
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const;

// Usage in components
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui";
". ".repeat(DOTTED_SEPARATOR_REPEATS); // TypeScript knows it's exactly 400
```

**Source**: TypeScript Handbook - Literal Types, const assertions

---

## Migration Strategy

### Phase 1: Create Constants Module

1. Create `src/constants/ui.ts` with exported constants
2. Add JSDoc comments explaining each value's purpose
3. Use `as const` assertions for type safety

### Phase 2: Replace Magic Values

1. **ChecklistItem.tsx**: Replace `". ".repeat(400)` with `DOTTED_SEPARATOR_REPEATS`
2. **ResetsMenu.tsx**: Replace `setTimeout(..., 1000)` with named constant `RESET_MENU_EXIT_DELAY_MS`
3. **page.tsx**: Replace `setTimeout(..., 0)` with `queueMicrotask()`

### Phase 3: Verification

1. Run `npm run lint` - ensure no type errors
2. Run `npm run build` - verify static export succeeds
3. Manual test all checklist flows (NORMAL, NON-NORMAL, RESETS)
4. Verify no visual changes (pixel-perfect comparison)

---

## Open Questions (Resolved)

~~1. Should timing constants use milliseconds or seconds?~~  
**Resolved**: Milliseconds with `_MS` suffix (aligns with `setTimeout` API)

~~2. Should constants be frozen at runtime?~~  
**Resolved**: No - `as const` provides compile-time immutability without runtime overhead

~~3. Should we extract CSS-related magic values (colors, sizes)?~~  
**Deferred**: Not in scope for this feature. CSS variables in `globals.css` already handle colors. Sizes are Tailwind classes (e.g., `w-6`, `h-6`) which are self-documenting.

---

## References

- [TypeScript Handbook - const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- [React 19 - queueMicrotask for state updates](https://react.dev/reference/react/experimental_queueMicrotask)
- [Next.js - Hydration errors and how to avoid them](https://nextjs.org/docs/messages/react-hydration-error)
- Project constitution: `.specify/memory/constitution.md`
- Feature spec: `specs/006-eliminate-magic-values/spec.md`

---

**Status**: Research complete ✅  
**Next Phase**: Generate data-model.md and contracts/
