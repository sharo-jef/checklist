# Data Model: Consolidate Item Status Checking Logic

**Feature**: 001-consolidate-status-logic  
**Date**: 2025-11-19  
**Status**: Complete

## Overview

This feature does not introduce new data entities or modify existing data structures. It refactors status checking logic into utility functions operating on existing types.

## Existing Entities (Unchanged)

### ChecklistItemStatus (Type Alias)

**Definition**: `src/types/checklist.ts`

```typescript
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";
```

**Purpose**: Represents the current state of a checklist item

**Fields** (union members):

- `"unchecked"`: Default state, item not yet completed
- `"checked"`: Item completed through normal user action (tap/click)
- `"overridden"`: Item marked complete via override (emergency/non-standard procedure), no normal check
- `"checked-overridden"`: Item both checked normally AND overridden (can occur through specific interaction sequences)

**Validation Rules**:

- Must be one of the four literal string values
- TypeScript enforces exhaustive handling via union type
- Runtime validation not performed (TypeScript compilation enforces correctness)

**Relationships**:

- Referenced by `StoredData.itemStates` mapping (categoryId → checklistId → itemId → status)
- Used in component state and utility functions for status determination

### Derived Concepts

#### Item Completion (Derived Boolean)

**Definition**: An item is considered "complete" if its status is one of:

- `"checked"`
- `"overridden"`
- `"checked-overridden"`

**Not complete**: `"unchecked"`

**Derived By**: New utility function `isItemComplete(status: ChecklistItemStatus): boolean`

**Business Rules**:

- **Rule 1**: Checked items are complete (normal completion path)
- **Rule 2**: Overridden items are complete (emergency/non-standard completion path)
- **Rule 3**: Combined checked-overridden items are complete (both paths applied)
- **Rule 4**: Unchecked items are incomplete (default state)
- **Rule 5**: Null/undefined status defaults to incomplete (fail-safe behavior)

**State Transitions** (existing behavior, unchanged):

```
unchecked → checked              (user taps item)
unchecked → overridden           (user taps ITEM OVRD button on unchecked item)
checked → unchecked              (user taps checked item to uncheck)
overridden → unchecked           (user taps ITEM OVRD button on overridden item)
checked → checked-overridden     (user taps ITEM OVRD button on checked item)
checked-overridden → checked     (user taps ITEM OVRD button on checked-overridden item)
```

**Note**: The new utility functions do not modify state transitions; they only interpret status values.

#### Item Override Status (Derived Boolean)

**Definition**: An item is considered "overridden" if its status is one of:

- `"overridden"`
- `"checked-overridden"`

**Not overridden**:

- `"unchecked"`
- `"checked"`

**Derived By**: New utility function `isItemOverridden(status: ChecklistItemStatus): boolean`

**Business Rules**:

- **Rule 1**: Pure overridden items are overridden
- **Rule 2**: Combined checked-overridden items are overridden (retain override flag)
- **Rule 3**: Checked-only items are NOT overridden (normal completion)
- **Rule 4**: Unchecked items are NOT overridden
- **Rule 5**: Null/undefined status defaults to not overridden

**UI Implications** (existing behavior):

- Overridden items display in cyan (`--text-cyan`) instead of green
- Checklist status banner shows cyan color when all items are overridden
- Menu items show checkmark in cyan when category is overridden

## Entity Relationships (Unchanged)

```
ChecklistCategory (1) ───> (*) Checklist
Checklist (1) ───> (*) ChecklistItem
ChecklistItem (1) ───> (1) ChecklistItemStatus [runtime state]

StoredData.itemStates:
  {
    [categoryId]: {
      [checklistId]: {
        [itemId]: ChecklistItemStatus
      }
    }
  }
```

**No changes to relationships** - utility functions operate on leaf-level status values.

## Data Immutability Guarantees

**Existing Pattern** (from Constitution Principle III):

- Checklist definitions in `checklists.ts` are immutable at runtime
- Runtime status lives separately in `itemStates` (LocalStorage-backed)
- Utility functions are **pure** - they read status and return boolean, never mutate state

**Enforcement**:

- Utility functions accept status as `const` parameter
- No side effects in utility functions
- Components continue to own state mutation through existing hooks (`useChecklist`)

## Validation Logic

### Compile-Time Validation (TypeScript)

```typescript
// Example: TypeScript prevents invalid status values
const status: ChecklistItemStatus = "invalid"; // ❌ Compilation error

// Valid usage
const status: ChecklistItemStatus = "checked"; // ✅
if (isItemComplete(status)) {
  // ✅ Type-safe function call
  // ...
}
```

### Runtime Validation (Defensive)

**Edge Cases Handled**:

1. **Null status**: `isItemComplete(null)` → `false`
2. **Undefined status**: `isItemComplete(undefined)` → `false`
3. **Unknown string** (requires type casting workaround): Defaults to `false`

**Rationale**: Defensive programming for LocalStorage data corruption or migration issues. TypeScript should prevent these cases in normal flow.

## Impact on Existing Data Structures

**No schema changes**:

- ✅ `ChecklistItemStatus` type unchanged
- ✅ `StoredData` interface unchanged
- ✅ No new LocalStorage fields
- ✅ No migration required
- ✅ LocalStorage version remains `2.0.0`

**Code-only refactoring**: Logic consolidation without data model modifications.

## Future Extensibility

**Adding New Status Types** (hypothetical example):

If a new status like `"skipped"` were added:

1. Update type definition:

   ```typescript
   export type ChecklistItemStatus =
     | "unchecked"
     | "checked"
     | "overridden"
     | "checked-overridden"
     | "skipped"; // NEW
   ```

2. TypeScript error would occur in utility function:

   ```typescript
   export function isItemComplete(status: ChecklistItemStatus): boolean {
     // TypeScript exhaustiveness check would flag missing "skipped" case
     return (
       status === "checked" ||
       status === "overridden" ||
       status === "checked-overridden"
       // Need to decide: is "skipped" complete or incomplete?
     );
   }
   ```

3. Developer must explicitly handle new case in ONE location (instead of 3+ locations in current code)

**This is the core value**: Centralized logic forces explicit handling of new states.

## Data Access Patterns

**Before** (current duplicate logic):

```typescript
// In page.tsx
const isComplete = checklist.items.every((item) => {
  const status = checklistState[item.id];
  return (
    status === "checked" ||
    status === "overridden" ||
    status === "checked-overridden"
  );
});

// In ChecklistMenu.tsx
const isChecklistComplete = (category: ChecklistCategory): boolean => {
  // ... duplicate logic ...
};

// In ChecklistDisplay.tsx
const allItemsChecked = items.every(
  (item) =>
    item.status === "checked" ||
    item.status === "overridden" ||
    item.status === "checked-overridden"
);
```

**After** (consolidated):

```typescript
// In utils/checklist.ts (NEW)
export function isItemComplete(
  status: ChecklistItemStatus | null | undefined
): boolean {
  if (!status) return false;
  return (
    status === "checked" ||
    status === "overridden" ||
    status === "checked-overridden"
  );
}

// In page.tsx
import { isItemComplete } from "@/utils/checklist";
const isComplete = checklist.items.every((item) =>
  isItemComplete(checklistState[item.id])
);

// In ChecklistMenu.tsx
import { isItemComplete } from "@/utils/checklist";
const isChecklistComplete = (category: ChecklistCategory): boolean => {
  return checklist.items.every((item) =>
    isItemComplete(checklistState[item.id])
  );
};

// In ChecklistDisplay.tsx
import { isItemComplete } from "@/utils/checklist";
const allItemsChecked = items.every((item) => isItemComplete(item.status));
```

**Access pattern unchanged**: Still reading status from state, but interpretation is centralized.

## Conclusion

**Data model impact**: None (pure refactoring)  
**New entities**: None  
**Modified entities**: None  
**New fields**: None  
**Migration required**: None

This feature exemplifies **behavior consolidation without schema changes**.
