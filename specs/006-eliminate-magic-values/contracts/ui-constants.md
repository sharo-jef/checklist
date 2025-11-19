# Module Contract: UI Constants

**Module**: `@/constants/ui`  
**Feature**: 006-eliminate-magic-values  
**Contract Version**: 1.0.0

## Module Interface

### TypeScript Declaration

````typescript
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
 * and expected value, mimicking aviation checklist aesthetics.
 *
 * @example
 * ```tsx
 * <span>{". ".repeat(DOTTED_SEPARATOR_REPEATS)}</span>
 * // Renders: ". . . . . . . . . . . . . . . . . . . . . ..."
 * ```
 */
export const DOTTED_SEPARATOR_REPEATS: 400;

/**
 * Milliseconds to display reset confirmation before auto-exiting the menu.
 *
 * This delay provides visual feedback that the reset action completed
 * successfully before returning to the default view.
 *
 * @example
 * ```typescript
 * setTimeout(() => {
 *   onExitMenu();
 * }, RESET_MENU_EXIT_DELAY_MS);
 * ```
 */
export const RESET_MENU_EXIT_DELAY_MS: 1000;
````

---

## Import Patterns

### Standard Import (Recommended)

```typescript
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui";
import { RESET_MENU_EXIT_DELAY_MS } from "@/constants/ui";
```

### Namespace Import (Discouraged)

```typescript
// Avoid this pattern - reduces tree-shaking effectiveness
import * as UIConstants from "@/constants/ui";
UIConstants.DOTTED_SEPARATOR_REPEATS;
```

---

## Usage Contracts

### ChecklistItem Component

**Requires**: `DOTTED_SEPARATOR_REPEATS`

```typescript
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui";

export function ChecklistItem({ item, value, ... }: ChecklistItemProps) {
  return (
    <div>
      <span>{item}</span>
      <span>{". ".repeat(DOTTED_SEPARATOR_REPEATS)}</span>
      <span>{value}</span>
    </div>
  );
}
```

**Contract Guarantee**:

- Value MUST be a positive integer
- Visual output MUST be identical to previous `". ".repeat(400)`
- Type MUST be literal `400`, not widened to `number`

---

### ResetsMenu Component

**Requires**: `RESET_MENU_EXIT_DELAY_MS`

```typescript
import { RESET_MENU_EXIT_DELAY_MS } from "@/constants/ui";

export function ResetsMenu({ onExitMenu, ... }: ResetsMenuProps) {
  const handleReset = (callback: () => void) => {
    callback();
    setTimeout(() => {
      onExitMenu();
    }, RESET_MENU_EXIT_DELAY_MS);
  };
  // ...
}
```

**Contract Guarantee**:

- Value MUST be in milliseconds
- Delay MUST be exactly 1000ms (1 second)
- Type MUST be literal `1000`, not widened to `number`

---

## Type Safety Guarantees

### Const Assertion

All exports MUST use `as const` to prevent type widening:

```typescript
// ✅ Correct: Literal type inference
export const DOTTED_SEPARATOR_REPEATS = 400 as const; // type: 400

// ❌ Wrong: Type widening
export const DOTTED_SEPARATOR_REPEATS = 400; // type: number
```

### Immutability

Constants MUST be:

- Declared with `const` keyword (no `let` or `var`)
- Exported at module level (not reassignable)
- Primitive values (no objects or arrays requiring deep freezing)

---

## Breaking Change Policy

### Semantic Versioning

This module follows semantic versioning for its "API surface":

- **MAJOR**: Changing constant values (e.g., `400` → `500`) - requires visual regression testing
- **MINOR**: Adding new constants - backward compatible
- **PATCH**: Documentation updates, comment improvements - no code impact

### Deprecation Process

If a constant needs removal:

1. Mark as `@deprecated` with migration path in JSDoc
2. Maintain for one minor version
3. Remove in next major version

**Example**:

```typescript
/**
 * @deprecated Use RESET_CONFIRMATION_DELAY_MS instead (renamed for clarity)
 * @see RESET_CONFIRMATION_DELAY_MS
 */
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const;
```

---

## Testing Contract

### Type Safety Tests

Consumers can verify literal types:

```typescript
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui";

// Type check: Ensure literal type is preserved
const value: 400 = DOTTED_SEPARATOR_REPEATS; // ✅ Should compile
const generic: number = DOTTED_SEPARATOR_REPEATS; // ✅ Also valid (widening allowed)
```

### Runtime Behavior Tests

No runtime tests needed - constants are compile-time values. Visual regression tests ensure UI parity.

---

## Extension Points

### Adding New Constants

To add a new UI constant:

1. Add export in `src/constants/ui.ts` with `as const`
2. Add JSDoc comment explaining purpose
3. Update this contract document with new constant
4. Increment contract minor version

**Example**:

```typescript
/**
 * Vertical padding in pixels for checklist menu items.
 */
export const MENU_ITEM_PADDING_Y_PX = 8 as const;
```

### Organizing Constants

If constants exceed 10 entries, consider splitting by domain:

- `@/constants/ui/layout` - Spacing, sizing constants
- `@/constants/ui/timing` - Animation/transition durations
- `@/constants/ui/colors` - Hardcoded color values (if any)

---

## Non-Functional Requirements

### Performance

- **Build impact**: Zero - constants are inlined by bundler
- **Runtime impact**: Zero - no runtime overhead vs. inline values
- **Bundle size impact**: Negligible (<100 bytes for module + exports)

### Compatibility

- **TypeScript**: Requires TS 3.4+ for `as const` support
- **Next.js**: Compatible with all Next.js 12+ versions
- **React**: Framework-agnostic (constants have no React dependency)

---

## Examples

### Complete Implementation Example

**File**: `src/constants/ui.ts`

```typescript
/**
 * UI Constants Module
 *
 * Centralized repository for UI-related magic values.
 */

/**
 * Number of dot-space pairs in checklist item separator line.
 */
export const DOTTED_SEPARATOR_REPEATS = 400 as const;

/**
 * Milliseconds to display reset confirmation before auto-exit.
 */
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const;
```

### Usage in ChecklistItem

```typescript
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui";

export function ChecklistItem({ item, value }: ChecklistItemProps) {
  return (
    <div className="flex items-center">
      <span className="shrink-0">{item}</span>
      <span className="flex-1 overflow-hidden whitespace-nowrap">
        {". ".repeat(DOTTED_SEPARATOR_REPEATS)}
      </span>
      <span className="shrink-0">{value}</span>
    </div>
  );
}
```

### Usage in ResetsMenu

```typescript
import { RESET_MENU_EXIT_DELAY_MS } from "@/constants/ui";
import { useRef } from "react";

export function ResetsMenu({ onExitMenu }: ResetsMenuProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleReset = (callback: () => void) => {
    callback();
    timeoutRef.current = setTimeout(() => {
      onExitMenu();
      timeoutRef.current = null;
    }, RESET_MENU_EXIT_DELAY_MS);
  };

  return (/* ... */);
}
```

---

## Contract Validation

### Automated Checks

```bash
# Type safety verification
npm run lint

# Build verification (constants inlined correctly)
npm run build
```

### Manual Checks

- [ ] Constants exported with `as const`
- [ ] JSDoc comments present for all exports
- [ ] Import paths use `@/constants/ui` alias
- [ ] No `any` types or type assertions in consumers
- [ ] Visual regression: Checklist looks identical
- [ ] Behavioral regression: Reset menu timing unchanged

---

**Contract Status**: Draft  
**Last Updated**: 2025-11-20  
**Maintainer**: Vehicle Digital Checklist Team
