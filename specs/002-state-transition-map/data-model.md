# Data Model: State Transition Map

**Feature**: Simplify State Transition Logic with Transition Map  
**Date**: 2025-11-19

## Overview

This document defines the data model for the state transition map refactoring. The core change is introducing a declarative transition map to replace procedural if-else logic in item status handlers.

## Entities

### 1. ChecklistItemStatus (Existing)

**Source**: `src/types/checklist.ts`

```typescript
type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";
```

**Description**: Union type representing the four possible states of a checklist item.

**Semantics**:

- `unchecked`: Default state, item not yet completed
- `checked`: User clicked/tapped the item to mark it complete
- `overridden`: Item marked complete via override button (bypass check, aviation emergency procedure)
- `checked-overridden`: Item was checked, then overridden (both actions applied)

**Validation Rules**:

- Must be one of the four literal values
- Stored in LocalStorage as string
- No null/undefined - defaults to `"unchecked"` if missing

**State Relationships**:

- Visual presentation depends on status:
  - `unchecked`: White text, no background
  - `checked`: Green text (`--text-green`)
  - `overridden`: Cyan text (`--text-cyan`)
  - `checked-overridden`: Cyan text (`--text-cyan`)

---

### 2. Action (New)

**Source**: `src/utils/transitions.ts` (to be created)

```typescript
type Action = "toggle" | "override";
```

**Description**: Union type representing the two user actions that trigger state transitions.

**Semantics**:

- `toggle`: User clicked/tapped on the checklist item itself
- `override`: User clicked/tapped the "ITEM OVRD" button

**Validation Rules**:

- Must be one of the two literal values
- Used only at runtime (not stored)
- Determines which transition path to follow in the map

**Usage Context**:

- `toggle` action: Triggered by `handleToggleItem` in `page.tsx`
- `override` action: Triggered by `handleItemOverride` in `page.tsx`

---

### 3. TransitionMap (New)

**Source**: `src/utils/transitions.ts` (to be created)

```typescript
type TransitionMap = {
  [K in ChecklistItemStatus]: {
    [A in Action]: ChecklistItemStatus;
  };
};
```

**Description**: Mapped type defining all valid state transitions in the system.

**Structure**:

- Outer level: Current status (source state)
- Inner level: Action being performed
- Value: Next status (target state)

**Validation Rules**:

- TypeScript enforces exhaustiveness: All 4 statuses must have entries
- Each status must have both `toggle` and `override` entries
- Compile-time error if any combination is missing

**Invariants**:

- Total transitions: 4 statuses × 2 actions = 8 transitions
- Every transition must return a valid `ChecklistItemStatus`
- No circular dependencies (though cycles like `unchecked` → `checked` → `unchecked` are allowed)

---

## State Transitions

### Complete Transition Table

| Current Status       | Action     | Next Status          | Description                          |
| -------------------- | ---------- | -------------------- | ------------------------------------ |
| `unchecked`          | `toggle`   | `checked`            | Normal completion flow               |
| `unchecked`          | `override` | `overridden`         | Skip check, go straight to override  |
| `checked`            | `toggle`   | `unchecked`          | Uncheck a completed item             |
| `checked`            | `override` | `checked-overridden` | Add override to already-checked item |
| `overridden`         | `toggle`   | `unchecked`          | Clear override (return to unchecked) |
| `overridden`         | `override` | `unchecked`          | Toggle override off                  |
| `checked-overridden` | `toggle`   | `unchecked`          | Clear both states                    |
| `checked-overridden` | `override` | `unchecked`          | Clear both states                    |

### State Diagram

```
┌──────────────┐  toggle   ┌──────────────┐
│  unchecked   │ ────────> │   checked    │
│              │ <──────── │              │
└──────────────┘  toggle   └──────────────┘
      │ ▲                         │
      │ │                         │ override
      │ │ toggle                  │
      │ │                         ▼
      │ └─────────────────  ┌──────────────────────┐
      │                     │ checked-overridden   │
      │ override            │                      │
      │                     └──────────────────────┘
      ▼                              │
┌──────────────┐                     │
│  overridden  │                     │ toggle/override
│              │                     │
└──────────────┘ <───────────────────┘
      │ ▲
      │ │
      └─┘ toggle/override
```

### Transition Rules & Rationale

**Rule 1: Toggle is Idempotent for Unchecked/Checked**

- `unchecked ↔ checked` forms a simple toggle pair
- Rationale: Standard checkbox behavior users expect

**Rule 2: Override Clears Complex States**

- `overridden` + `override` → `unchecked`
- `checked-overridden` + `override` → `unchecked`
- Rationale: Override button acts as a "clear override" toggle when already in override state

**Rule 3: Toggle Resets to Unchecked from Override States**

- Both `overridden` and `checked-overridden` → `unchecked` on toggle
- Rationale: Clicking the item itself should remove special override status

**Rule 4: Checked + Override = Checked-Overridden**

- `checked` + `override` → `checked-overridden`
- Rationale: Aviation checklist semantics - item was verified AND bypassed (unusual but valid)

---

## Data Flow

### Current Implementation (Before Refactoring)

```typescript
// page.tsx - handleToggleItem (lines 174-211)
const handleToggleItem = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);

  // 38 lines of nested if-else logic
  if (currentItem.status === "overridden") {
    updateItemStatus(..., "unchecked");
  } else if (currentItem.status === "checked-overridden") {
    updateItemStatus(..., "unchecked");
  } else {
    const newStatus = currentItem.status === "checked" ? "unchecked" : "checked";
    updateItemStatus(..., newStatus);
  }

  // Active index update logic (15 lines)
  setTimeout(() => { ... }, 0);
};

// page.tsx - handleItemOverride (lines 213-248)
const handleItemOverride = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);
  let newStatus: ChecklistItemStatus;

  // 20 lines of if-else chains
  if (currentItem.status === "checked-overridden") {
    newStatus = "unchecked";
  } else if (currentItem.status === "checked") {
    newStatus = "checked-overridden";
  } else if (currentItem.status === "overridden") {
    newStatus = "unchecked";
  } else {
    newStatus = "overridden";
  }

  updateItemStatus(..., newStatus);

  // Active index update logic (15 lines)
  setTimeout(() => { ... }, 0);
};
```

**Issues**:

- Transition logic scattered across 70+ lines
- Duplicated patterns (both handlers reset to `unchecked`)
- Difficult to see all transitions at once
- Adding new status requires editing multiple functions

### Proposed Implementation (After Refactoring)

```typescript
// src/utils/transitions.ts (NEW FILE)
const TRANSITIONS: TransitionMap = {
  unchecked: { toggle: 'checked', override: 'overridden' },
  checked: { toggle: 'unchecked', override: 'checked-overridden' },
  overridden: { toggle: 'unchecked', override: 'unchecked' },
  'checked-overridden': { toggle: 'unchecked', override: 'unchecked' }
};

export function transition(status: ChecklistItemStatus, action: Action): ChecklistItemStatus {
  const next = TRANSITIONS[status]?.[action];
  if (!next) {
    // Error handling
  }
  return next;
}

// page.tsx - refactored handlers
const handleToggleItem = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);
  const newStatus = transition(currentItem.status, 'toggle');

  updateItemStatus(..., newStatus);

  // Active index update logic (unchanged)
  setTimeout(() => { ... }, 0);
};

const handleItemOverride = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);
  const newStatus = transition(currentItem.status, 'override');

  updateItemStatus(..., newStatus);

  // Active index update logic (unchanged)
  setTimeout(() => { ... }, 0);
};
```

**Benefits**:

- All 8 transitions visible in one table
- Transition logic reduced to 1 line per handler
- Adding new status = update map only, zero handler changes
- Type safety ensures completeness

---

## Storage Impact

**No changes to LocalStorage schema**

The state transition map is a refactoring of **computation logic**, not storage format. The `itemStates` structure remains unchanged:

```typescript
// LocalStorage format (UNCHANGED)
interface StoredData {
  version: string; // "2.0.0"
  lastUpdated: number;
  itemStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus; // Still stores status strings
      };
    };
  };
}
```

**Migration**: None required - this is a code-only refactor.

---

## Extensibility Patterns

### Adding a New Status Type

**Before** (current implementation):

1. Add to `ChecklistItemStatus` type
2. Update `handleToggleItem` if-else chain
3. Update `handleItemOverride` if-else chain
4. Update color mappings in CSS/components
5. Risk of missing a case → runtime bugs

**After** (with transition map):

1. Add to `ChecklistItemStatus` type
2. Add entries to `TRANSITIONS` map (TypeScript enforces adding all actions)
3. Update color mappings in CSS/components
4. Compile-time guarantee no cases are missed

### Adding a New Action Type

**Example**: Add `"clear"` action that always resets to `unchecked`

```typescript
type Action = "toggle" | "override" | "clear"; // Add to union

const TRANSITIONS: TransitionMap = {
  unchecked: {
    toggle: "checked",
    override: "overridden",
    clear: "unchecked", // TypeScript requires this now
  },
  // ... must add 'clear' to all statuses (compile error if missing)
};
```

**Handler**:

```typescript
const handleClearItem = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);
  const newStatus = transition(currentItem.status, 'clear');
  updateItemStatus(..., newStatus);
};
```

---

## Testing Considerations

### Unit Tests for Transitions

Each transition should have a dedicated test case:

```typescript
describe("State Transitions", () => {
  test("unchecked + toggle = checked", () => {
    expect(transition("unchecked", "toggle")).toBe("checked");
  });

  test("checked + toggle = unchecked", () => {
    expect(transition("checked", "toggle")).toBe("unchecked");
  });

  // ... 6 more tests for remaining transitions
});
```

### Property Tests

Invariant: Transitions always return valid statuses

```typescript
test("all transitions return valid ChecklistItemStatus", () => {
  const statuses: ChecklistItemStatus[] = [
    "unchecked",
    "checked",
    "overridden",
    "checked-overridden",
  ];
  const actions: Action[] = ["toggle", "override"];

  statuses.forEach((status) => {
    actions.forEach((action) => {
      const result = transition(status, action);
      expect(statuses).toContain(result);
    });
  });
});
```

### Integration Tests

Verify handlers use transition function correctly:

```typescript
test('handleToggleItem applies toggle action', () => {
  const { handleToggleItem } = renderPage();
  const item = createItem({ status: 'unchecked' });

  handleToggleItem(item.id);

  expect(updateItemStatus).toHaveBeenCalledWith(..., 'checked');
});
```

---

## Backward Compatibility

**100% functional parity required** (per FR-009)

All existing behavior must be preserved:

- ✅ Same state transitions for every status/action combination
- ✅ Same active item index update logic
- ✅ Same LocalStorage writes
- ✅ Same UI color presentation
- ✅ Same setTimeout timing for async state updates

**Verification**:

- Manual testing of all toggle/override combinations
- Visual regression testing (status colors)
- LocalStorage format validation (no schema changes)

---

## Performance Considerations

**Expected Performance Impact**: Negligible

- Map lookup is O(1) (object property access)
- No loops or complex computations
- Function call overhead < 1ms (pure function, no I/O)
- Transition logic is synchronous (no async overhead)

**Comparison**:

- Current: 10-20 conditional branches evaluated per handler call
- Proposed: 2 object property accesses per handler call
- Net improvement: Slightly faster (fewer branches)

---

## Summary

The state transition map refactoring introduces two new entities (`Action` type, `TransitionMap` type) and centralizes all transition logic in a single, declarative data structure. This reduces code complexity from 70+ lines of conditionals to a 4×2 transition table, improving maintainability and extensibility while preserving 100% functional parity with the existing implementation.

**Key Changes**:

- ✅ No storage schema changes
- ✅ No UI/UX changes
- ✅ No runtime dependencies added
- ✅ Type safety improved (compile-time exhaustiveness)
- ✅ Code complexity reduced (75% LOC reduction in handlers)
