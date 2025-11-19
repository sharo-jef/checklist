# Checklist Utility Functions API Contract

**Module**: `src/utils/checklist.ts`  
**Feature**: 001-consolidate-status-logic  
**Date**: 2025-11-19  
**Version**: 1.0.0

## Overview

This module provides pure utility functions for interpreting checklist item status values. All functions are stateless, side-effect-free, and type-safe.

---

## Function: `isItemComplete`

### Signature

```typescript
function isItemComplete(
  status: ChecklistItemStatus | null | undefined
): boolean;
```

### Purpose

Determines whether a checklist item is considered "complete" based on its status value.

### Parameters

| Parameter | Type                                       | Required | Description                              |
| --------- | ------------------------------------------ | -------- | ---------------------------------------- |
| `status`  | `ChecklistItemStatus \| null \| undefined` | Yes      | The current status of the checklist item |

### Return Value

| Type      | Description                                   |
| --------- | --------------------------------------------- |
| `boolean` | `true` if item is complete, `false` otherwise |

### Behavior

**Returns `true` when**:

- `status === "checked"` (normal completion)
- `status === "overridden"` (override completion)
- `status === "checked-overridden"` (combined completion)

**Returns `false` when**:

- `status === "unchecked"` (default incomplete state)
- `status === null` (edge case: missing data)
- `status === undefined` (edge case: missing data)
- `status` is any other unexpected value (defensive programming)

### Complexity

- **Time**: O(1) - Constant time comparison
- **Space**: O(1) - No allocations

### Examples

```typescript
import { isItemComplete } from "@/utils/checklist";

// Normal completion
isItemComplete("checked"); // → true

// Override completion
isItemComplete("overridden"); // → true

// Combined completion
isItemComplete("checked-overridden"); // → true

// Incomplete
isItemComplete("unchecked"); // → false

// Edge cases
isItemComplete(null); // → false
isItemComplete(undefined); // → false
```

### Typical Usage Patterns

**Pattern 1: Check if all items in a checklist are complete**

```typescript
const allComplete = checklist.items.every((item) => {
  const status = itemStates[categoryId]?.[checklistId]?.[item.id];
  return isItemComplete(status);
});
```

**Pattern 2: Find first incomplete item**

```typescript
const firstIncomplete = checklist.items.findIndex((item) => {
  const status = itemStates[categoryId]?.[checklistId]?.[item.id];
  return !isItemComplete(status);
});
```

**Pattern 3: Component rendering logic**

```typescript
const allItemsChecked = items.every((item) => isItemComplete(item.status));
if (allItemsChecked) {
  // Show completion indicator
}
```

### Edge Cases

| Input                      | Output  | Rationale                              |
| -------------------------- | ------- | -------------------------------------- |
| `null`                     | `false` | Fail-safe: missing status = incomplete |
| `undefined`                | `false` | Fail-safe: missing status = incomplete |
| `""` (empty string)        | `false` | Invalid status = incomplete            |
| Type cast to unknown value | `false` | Defensive: unknown = incomplete        |

### Guarantees

- ✅ **Pure function**: No side effects, same input always produces same output
- ✅ **Type-safe**: TypeScript enforces valid status types at compile time
- ✅ **Null-safe**: Handles `null`/`undefined` gracefully without throwing
- ✅ **Idempotent**: Multiple calls with same input produce same result

### Non-Guarantees (Not Provided)

- ❌ Does NOT mutate item status
- ❌ Does NOT validate item data structure
- ❌ Does NOT persist state changes
- ❌ Does NOT log or report status

---

## Function: `isItemOverridden`

### Signature

```typescript
function isItemOverridden(
  status: ChecklistItemStatus | null | undefined
): boolean;
```

### Purpose

Determines whether a checklist item has been marked as "overridden" (emergency/non-standard completion).

### Parameters

| Parameter | Type                                       | Required | Description                              |
| --------- | ------------------------------------------ | -------- | ---------------------------------------- |
| `status`  | `ChecklistItemStatus \| null \| undefined` | Yes      | The current status of the checklist item |

### Return Value

| Type      | Description                                     |
| --------- | ----------------------------------------------- |
| `boolean` | `true` if item is overridden, `false` otherwise |

### Behavior

**Returns `true` when**:

- `status === "overridden"` (pure override, no normal check)
- `status === "checked-overridden"` (override applied to checked item)

**Returns `false` when**:

- `status === "checked"` (normal completion, no override)
- `status === "unchecked"` (default state, no override)
- `status === null` (edge case: missing data)
- `status === undefined` (edge case: missing data)
- `status` is any other unexpected value

### Complexity

- **Time**: O(1) - Constant time comparison
- **Space**: O(1) - No allocations

### Examples

```typescript
import { isItemOverridden } from "@/utils/checklist";

// Override scenarios
isItemOverridden("overridden"); // → true
isItemOverridden("checked-overridden"); // → true

// Non-override scenarios
isItemOverridden("checked"); // → false (normal completion)
isItemOverridden("unchecked"); // → false (not complete)

// Edge cases
isItemOverridden(null); // → false
isItemOverridden(undefined); // → false
```

### Typical Usage Patterns

**Pattern 1: Check if entire checklist is overridden (for cyan color display)**

```typescript
const allOverridden = checklist.items.every((item) => {
  const status = itemStates[categoryId]?.[checklistId]?.[item.id];
  return isItemOverridden(status);
});
```

**Pattern 2: Determine status banner color**

```typescript
const showCyanColor = items.every((item) => isItemOverridden(item.status));
```

**Pattern 3: Menu checkmark styling**

```typescript
const isChecklistOverridden = (category: ChecklistCategory): boolean => {
  const checklist = category.checklists[0];
  const checklistState = itemStates[category.id]?.[checklist.id];

  return checklist.items.every((item) =>
    isItemOverridden(checklistState?.[item.id])
  );
};
```

### UI Implications

**When `isItemOverridden()` returns `true` for all items**:

- Status text displays in cyan (`--text-cyan`) instead of green
- Menu checkmark displays in cyan
- Indicates non-standard completion path (emergency procedures)

### Edge Cases

| Input         | Output  | Rationale                             |
| ------------- | ------- | ------------------------------------- |
| `null`        | `false` | No override applied to missing status |
| `undefined`   | `false` | No override applied to missing status |
| `"checked"`   | `false` | Normal completion, NOT overridden     |
| `"unchecked"` | `false` | Incomplete, NOT overridden            |

### Guarantees

- ✅ **Pure function**: No side effects
- ✅ **Type-safe**: TypeScript enforces valid status types
- ✅ **Null-safe**: Handles `null`/`undefined` gracefully
- ✅ **Consistent with `isItemComplete`**: An overridden item is also complete

### Relationship with `isItemComplete`

**Logical Relationship**:

```typescript
// Override implies completion (but not vice versa)
if (isItemOverridden(status)) {
  assert(isItemComplete(status) === true);
}

// Completion does NOT imply override
if (isItemComplete(status)) {
  // isItemOverridden(status) might be true or false
}
```

**Truth Table**:
| Status | `isItemComplete()` | `isItemOverridden()` |
|--------|-------------------|---------------------|
| `"unchecked"` | `false` | `false` |
| `"checked"` | `true` | `false` |
| `"overridden"` | `true` | `true` |
| `"checked-overridden"` | `true` | `true` |

---

## Module Metadata

### Exports

```typescript
export { isItemComplete, isItemOverridden };
```

### Dependencies

**Internal**:

- `@/types/checklist` - `ChecklistItemStatus` type

**External**: None (pure TypeScript, no runtime dependencies)

### File Location

`src/utils/checklist.ts` (NEW FILE)

### Import Path

```typescript
import { isItemComplete, isItemOverridden } from "@/utils/checklist";
```

---

## Breaking Changes Policy

**Version**: 1.0.0 (initial release)

**Future changes that would require major version bump**:

- Changing function signature (adding required parameters)
- Changing return type
- Changing completion/override determination logic in non-backward-compatible way
- Removing functions

**Acceptable minor/patch changes**:

- Adding new utility functions to module
- Adding optional parameters with defaults
- Improving documentation
- Performance optimizations preserving behavior
- Bug fixes that correct unintended behavior

---

## Testing Contract

### Unit Test Requirements (Future)

**Minimum test coverage**:

```typescript
describe("isItemComplete", () => {
  it("returns true for checked status", () => {
    expect(isItemComplete("checked")).toBe(true);
  });

  it("returns true for overridden status", () => {
    expect(isItemComplete("overridden")).toBe(true);
  });

  it("returns true for checked-overridden status", () => {
    expect(isItemComplete("checked-overridden")).toBe(true);
  });

  it("returns false for unchecked status", () => {
    expect(isItemComplete("unchecked")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isItemComplete(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isItemComplete(undefined)).toBe(false);
  });
});

describe("isItemOverridden", () => {
  it("returns true for overridden status", () => {
    expect(isItemOverridden("overridden")).toBe(true);
  });

  it("returns true for checked-overridden status", () => {
    expect(isItemOverridden("checked-overridden")).toBe(true);
  });

  it("returns false for checked status", () => {
    expect(isItemOverridden("checked")).toBe(false);
  });

  it("returns false for unchecked status", () => {
    expect(isItemOverridden("unchecked")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isItemOverridden(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isItemOverridden(undefined)).toBe(false);
  });
});
```

### Integration Test Requirements

**Manual regression tests** (current testing approach):

1. Verify all checklists show correct completion state after refactor
2. Verify menu checkmarks appear/disappear correctly
3. Verify status banner colors (green vs cyan) display correctly
4. Verify "NEXT" button appears when checklist is complete
5. Verify first unchecked item auto-focus works correctly

---

## Migration Guide

### For Component Developers

**Before** (old inline logic):

```typescript
const isComplete =
  item.status === "checked" ||
  item.status === "overridden" ||
  item.status === "checked-overridden";
```

**After** (new utility function):

```typescript
import { isItemComplete } from "@/utils/checklist";
const isComplete = isItemComplete(item.status);
```

**Benefits**:

- Shorter, more readable code
- Type-safe null handling
- Centralized logic updates
- Auto-completion in IDE

---

## Appendix: Type Definitions

```typescript
/**
 * Checklist item status values
 */
export type ChecklistItemStatus =
  | "unchecked" // Default incomplete state
  | "checked" // Normal completion
  | "overridden" // Override completion (emergency)
  | "checked-overridden"; // Both checked AND overridden
```
