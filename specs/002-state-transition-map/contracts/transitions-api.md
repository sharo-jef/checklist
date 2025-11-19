# Contract: State Transition API

**Module**: `src/utils/transitions.ts` (new file)  
**Date**: 2025-11-19  
**Version**: 1.0.0

## Overview

This contract defines the public API for the state transition module. The module provides a declarative, type-safe way to compute next states for checklist items based on current status and user action.

## Type Definitions

### Action

```typescript
/**
 * User actions that trigger state transitions.
 */
type Action = "toggle" | "override";
```

**Values**:

- `'toggle'`: User clicked/tapped on the checklist item
- `'override'`: User clicked/tapped the "ITEM OVRD" button

**Constraints**:

- Must be one of the two literal string values
- Case-sensitive
- No other actions are supported

---

### TransitionMap

```typescript
/**
 * Complete mapping of (status, action) → next status.
 *
 * TypeScript ensures exhaustiveness: all ChecklistItemStatus values
 * must be present as keys, and each must define both actions.
 */
type TransitionMap = {
  [K in ChecklistItemStatus]: {
    [A in Action]: ChecklistItemStatus;
  };
};
```

**Structure**:

- Outer keys: All values from `ChecklistItemStatus` type
- Inner keys: All values from `Action` type
- Values: Valid `ChecklistItemStatus` strings

**Invariants**:

- All 4 checklist statuses must be present
- Each status must define both `toggle` and `override` actions
- TypeScript enforces this at compile time

---

## Public API

### transition(currentStatus, action)

**Signature**:

```typescript
function transition(
  currentStatus: ChecklistItemStatus,
  action: Action
): ChecklistItemStatus;
```

**Parameters**:

- `currentStatus` (`ChecklistItemStatus`): The item's current status before the action
- `action` (`Action`): The user action triggering the transition

**Returns**:

- `ChecklistItemStatus`: The new status after applying the action

**Behavior**:

1. Look up the transition in the internal `TRANSITIONS` map
2. If found, return the next status
3. If not found (should never happen with correct types):
   - **Development mode** (`process.env.NODE_ENV === 'development'`): Throw `Error` with descriptive message
   - **Production mode**: Log error to console and return `currentStatus` (no-op)

**Error Handling**:

```typescript
// Development
throw new Error(
  `Invalid transition: status="${currentStatus}" action="${action}"`
);

// Production
console.error(
  `Invalid transition: status="${currentStatus}" action="${action}"`
);
return currentStatus; // Graceful fallback
```

**Examples**:

```typescript
transition("unchecked", "toggle"); // → 'checked'
transition("checked", "override"); // → 'checked-overridden'
transition("overridden", "toggle"); // → 'unchecked'
```

**Time Complexity**: O(1) - two object property lookups  
**Side Effects**: None (pure function)  
**Thread Safety**: N/A (JavaScript single-threaded)

---

### toggleStatus(currentStatus)

**Signature**:

```typescript
function toggleStatus(currentStatus: ChecklistItemStatus): ChecklistItemStatus;
```

**Parameters**:

- `currentStatus` (`ChecklistItemStatus`): The item's current status

**Returns**:

- `ChecklistItemStatus`: The new status after applying the `'toggle'` action

**Behavior**:

- Convenience wrapper for `transition(currentStatus, 'toggle')`
- Equivalent to clicking/tapping the checklist item

**Examples**:

```typescript
toggleStatus("unchecked"); // → 'checked'
toggleStatus("checked"); // → 'unchecked'
toggleStatus("overridden"); // → 'unchecked'
toggleStatus("checked-overridden"); // → 'unchecked'
```

**Use Case**: Simplifies handler code when action is always `'toggle'`

---

### overrideStatus(currentStatus)

**Signature**:

```typescript
function overrideStatus(
  currentStatus: ChecklistItemStatus
): ChecklistItemStatus;
```

**Parameters**:

- `currentStatus` (`ChecklistItemStatus`): The item's current status

**Returns**:

- `ChecklistItemStatus`: The new status after applying the `'override'` action

**Behavior**:

- Convenience wrapper for `transition(currentStatus, 'override')`
- Equivalent to clicking/tapping the "ITEM OVRD" button

**Examples**:

```typescript
overrideStatus("unchecked"); // → 'overridden'
overrideStatus("checked"); // → 'checked-overridden'
overrideStatus("overridden"); // → 'unchecked'
overrideStatus("checked-overridden"); // → 'unchecked'
```

**Use Case**: Simplifies handler code when action is always `'override'`

---

## Complete Transition Table

| Current Status       | Action     | Next Status          | Function Call                          |
| -------------------- | ---------- | -------------------- | -------------------------------------- |
| `unchecked`          | `toggle`   | `checked`            | `toggleStatus('unchecked')`            |
| `unchecked`          | `override` | `overridden`         | `overrideStatus('unchecked')`          |
| `checked`            | `toggle`   | `unchecked`          | `toggleStatus('checked')`              |
| `checked`            | `override` | `checked-overridden` | `overrideStatus('checked')`            |
| `overridden`         | `toggle`   | `unchecked`          | `toggleStatus('overridden')`           |
| `overridden`         | `override` | `unchecked`          | `overrideStatus('overridden')`         |
| `checked-overridden` | `toggle`   | `unchecked`          | `toggleStatus('checked-overridden')`   |
| `checked-overridden` | `override` | `unchecked`          | `overrideStatus('checked-overridden')` |

---

## Usage Examples

### Basic Usage in Handlers

```typescript
import { toggleStatus, overrideStatus } from "@/utils/transitions";

const handleToggleItem = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);
  const newStatus = toggleStatus(currentItem.status);

  updateItemStatus(activeCategory, checklistId, itemId, newStatus);
};

const handleItemOverride = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);
  const newStatus = overrideStatus(currentItem.status);

  updateItemStatus(activeCategory, checklistId, itemId, newStatus);
};
```

### Using Generic transition() Function

```typescript
import { transition } from "@/utils/transitions";

const applyAction = (itemId: string, action: Action) => {
  const currentItem = getCurrentItem(itemId);
  const newStatus = transition(currentItem.status, action);

  updateItemStatus(activeCategory, checklistId, itemId, newStatus);
};
```

### Bulk Operations

```typescript
import { toggleStatus } from "@/utils/transitions";

const checkAllItems = (items: ChecklistItem[]) => {
  items.forEach((item) => {
    if (item.status === "unchecked") {
      const newStatus = toggleStatus(item.status); // 'checked'
      updateItemStatus(categoryId, checklistId, item.id, newStatus);
    }
  });
};
```

---

## Dependencies

**Import Requirements**:

```typescript
import { ChecklistItemStatus } from "@/types/checklist";
```

**Runtime Dependencies**: None  
**Build Dependencies**: TypeScript 5.x  
**Browser Compatibility**: ES2017+ (no polyfills needed)

---

## Type Safety Guarantees

### Compile-Time Checks

1. **Exhaustive status coverage**: TypeScript enforces that all `ChecklistItemStatus` values have entries in the map
2. **Exhaustive action coverage**: Each status must define both `toggle` and `override`
3. **Valid return types**: Map values must be valid `ChecklistItemStatus` strings
4. **Type inference**: Function return types are automatically inferred as `ChecklistItemStatus`

### Runtime Validation

```typescript
// Development: Fail fast on invalid transitions
if (!nextStatus && process.env.NODE_ENV === "development") {
  throw new Error(
    `Invalid transition: status="${currentStatus}" action="${action}"`
  );
}

// Production: Graceful fallback
if (!nextStatus) {
  console.error(
    `Invalid transition: status="${currentStatus}" action="${action}"`
  );
  return currentStatus;
}
```

---

## Testing Contract

### Unit Tests Required

Every function must have test coverage:

```typescript
describe("transition()", () => {
  test.each([
    ["unchecked", "toggle", "checked"],
    ["unchecked", "override", "overridden"],
    ["checked", "toggle", "unchecked"],
    ["checked", "override", "checked-overridden"],
    ["overridden", "toggle", "unchecked"],
    ["overridden", "override", "unchecked"],
    ["checked-overridden", "toggle", "unchecked"],
    ["checked-overridden", "override", "unchecked"],
  ])("transition(%s, %s) should return %s", (status, action, expected) => {
    expect(transition(status, action)).toBe(expected);
  });
});

describe("toggleStatus()", () => {
  test.each([
    ["unchecked", "checked"],
    ["checked", "unchecked"],
    ["overridden", "unchecked"],
    ["checked-overridden", "unchecked"],
  ])("toggleStatus(%s) should return %s", (status, expected) => {
    expect(toggleStatus(status)).toBe(expected);
  });
});

describe("overrideStatus()", () => {
  test.each([
    ["unchecked", "overridden"],
    ["checked", "checked-overridden"],
    ["overridden", "unchecked"],
    ["checked-overridden", "unchecked"],
  ])("overrideStatus(%s) should return %s", (status, expected) => {
    expect(overrideStatus(status)).toBe(expected);
  });
});
```

### Property Tests Required

Invariants to validate:

```typescript
test("all transitions return valid ChecklistItemStatus", () => {
  const validStatuses: ChecklistItemStatus[] = [
    "unchecked",
    "checked",
    "overridden",
    "checked-overridden",
  ];
  const actions: Action[] = ["toggle", "override"];

  validStatuses.forEach((status) => {
    actions.forEach((action) => {
      const result = transition(status, action);
      expect(validStatuses).toContain(result);
    });
  });
});

test("transition map has no missing entries", () => {
  const statuses: ChecklistItemStatus[] = [
    "unchecked",
    "checked",
    "overridden",
    "checked-overridden",
  ];
  const actions: Action[] = ["toggle", "override"];

  statuses.forEach((status) => {
    actions.forEach((action) => {
      expect(() => transition(status, action)).not.toThrow();
    });
  });
});
```

---

## Backward Compatibility

**Version**: 1.0.0 (initial implementation)

**Breaking Changes**: None (new module)

**Migration Path**: N/A - new functionality replacing internal implementation

**Deprecations**: None

---

## Performance Characteristics

| Operation          | Time Complexity | Space Complexity | Notes                         |
| ------------------ | --------------- | ---------------- | ----------------------------- |
| `transition()`     | O(1)            | O(1)             | Two object property lookups   |
| `toggleStatus()`   | O(1)            | O(1)             | Wrapper around `transition()` |
| `overrideStatus()` | O(1)            | O(1)             | Wrapper around `transition()` |
| Map initialization | O(1)            | O(1)             | Static constant, loaded once  |

**Memory Footprint**:

- Transition map: 8 entries × 2 string keys × 1 string value ≈ 256 bytes
- Function definitions: ~1KB (minified)
- **Total**: ~1.5KB (negligible)

**Execution Time** (typical):

- `transition()`: <0.1ms
- Handler overhead: <1ms total (including function call + state update)

---

## Extension Points

### Adding New Actions

To add a new action type (e.g., `'clear'`):

1. Update the `Action` type:

   ```typescript
   type Action = "toggle" | "override" | "clear";
   ```

2. TypeScript will error on the `TransitionMap` type - add the new action to all statuses:

   ```typescript
   const TRANSITIONS: TransitionMap = {
     unchecked: {
       toggle: "checked",
       override: "overridden",
       clear: "unchecked", // New action
     },
     // ... add 'clear' to all other statuses
   };
   ```

3. (Optional) Add convenience helper:
   ```typescript
   export const clearStatus = (status: ChecklistItemStatus) =>
     transition(status, "clear");
   ```

### Adding New Statuses

To add a new status (e.g., `'skipped'`):

1. Update `ChecklistItemStatus` in `src/types/checklist.ts`:

   ```typescript
   type ChecklistItemStatus =
     | "unchecked"
     | "checked"
     | "overridden"
     | "checked-overridden"
     | "skipped"; // New status
   ```

2. TypeScript will error on the `TransitionMap` - add transitions for the new status:

   ```typescript
   const TRANSITIONS: TransitionMap = {
     // ... existing statuses
     skipped: {
       toggle: "checked",
       override: "unchecked",
     },
   };
   ```

3. Update color mappings in components (UI concern, outside this module)

---

## Security Considerations

**Input Validation**:

- TypeScript enforces type safety at compile time
- Runtime checks prevent invalid transitions from crashing the app

**Injection Risks**: None - no eval(), no dynamic code generation

**State Tampering**:

- LocalStorage can be modified by user - this is acceptable for a client-only checklist app
- No server-side state means no CSRF/XSS concerns in this module

**Error Information Disclosure**:

- Development errors include full status/action details (acceptable - local dev only)
- Production errors are logged but don't expose sensitive data

---

## Change Log

### v1.0.0 (2025-11-19)

- Initial contract definition
- Defined `transition()`, `toggleStatus()`, `overrideStatus()` functions
- Established 4×2 transition table
- TypeScript type safety with exhaustiveness checking
