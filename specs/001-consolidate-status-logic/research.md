# Research: Consolidate Item Status Checking Logic

**Feature**: 001-consolidate-status-logic  
**Date**: 2025-11-19  
**Status**: Complete

## Overview

This document captures research findings and design decisions for consolidating duplicate item completion checking logic into a single utility function.

## Key Decisions

### Decision 1: Function Location

**Decision**: Create new file `src/utils/checklist.ts` for the utility function

**Rationale**:

- Separates checklist-specific utilities from storage operations
- `storage.ts` is focused on LocalStorage CRUD operations; item status logic is a different concern
- Enables future expansion of checklist-specific utilities without bloating storage module
- Follows single-responsibility principle

**Alternatives Considered**:

- **Add to `storage.ts`**: Rejected because it conflates storage operations with business logic (status interpretation)
- **Add to `types/checklist.ts`**: Rejected because TypeScript convention keeps type definitions separate from runtime logic
- **Add to `data/checklists.ts`**: Rejected because it violates immutable data principle (definitions should not contain runtime logic)

### Decision 2: Function Name

**Decision**: Use `isItemComplete(status: ChecklistItemStatus): boolean`

**Rationale**:

- Clear intent: predicate function (returns boolean)
- Follows TypeScript/JavaScript convention (`is*` prefix for boolean predicates)
- Concise yet descriptive
- Aligns with aviation checklist terminology ("complete" vs "incomplete")
- Domain-specific: "complete" matches the `completed` field semantics in `ChecklistItem` interface

**Alternatives Considered**:

- **`checkItemStatus`**: Rejected - ambiguous whether it returns boolean or performs mutation
- **`isItemChecked`**: Rejected - misleading, as "checked" is only one of the complete states; doesn't capture overridden items
- **`isItemDone`**: Rejected - too informal for aviation-themed application
- **`hasItemCompleted`**: Rejected - grammatically awkward, less conventional

### Decision 3: Edge Case Handling

**Decision**: Handle `null`, `undefined`, and unknown values by returning `false` (incomplete)

**Rationale**:

- **Fail-safe behavior**: Unknown status should prevent false completion
- Matches current implicit behavior (items without explicit status default to "unchecked")
- TypeScript strict mode + proper typing should prevent these cases in normal flow
- Defensive programming for robustness during migrations or data corruption

**Implementation Pattern**:

```typescript
export function isItemComplete(
  status: ChecklistItemStatus | null | undefined
): boolean {
  if (!status) return false; // null, undefined, empty string

  return (
    status === "checked" ||
    status === "overridden" ||
    status === "checked-overridden"
  );
}
```

**Alternatives Considered**:

- **Throw error on unknown status**: Rejected - too aggressive, would crash UI for data issues
- **Return `true` for safety**: Rejected - could hide incomplete checklists, dangerous in vehicle safety context
- **Log warning**: Considered but postponed - would require logging infrastructure not currently in project

### Decision 4: Additional Helper Functions

**Decision**: Add complementary function `isItemOverridden(status: ChecklistItemStatus): boolean`

**Rationale**:

- `ChecklistMenu.tsx` has separate logic for override checking (lines 44-56)
- `ChecklistDisplay.tsx` has `allItemsOverridden` logic (lines 44-49)
- Same consolidation benefits apply
- Symmetry with `isItemComplete` improves API consistency

**Implementation**:

```typescript
export function isItemOverridden(
  status: ChecklistItemStatus | null | undefined
): boolean {
  if (!status) return false;

  return status === "overridden" || status === "checked-overridden";
}
```

**Alternatives Considered**:

- **Only consolidate completion logic**: Rejected - misses opportunity to eliminate `allItemsOverridden` duplication

## Research Findings

### Current Duplicate Logic Locations

**Location 1: `src/app/page.tsx`**

- **Lines 78-84**: Lambda function checking if checklist is complete for next category logic
- **Lines 137-142**: Lambda function checking if all items are checked for next button
- **Pattern**: `status === "checked" || status === "overridden" || status === "checked-overridden"`

**Location 2: `src/components/ChecklistMenu.tsx`**

- **Lines 35-41**: `isChecklistComplete` function checking if category shows checkmark
- **Pattern**: Same triple OR condition
- **Additional**: Lines 53-54 check for override status separately

**Location 3: `src/components/ChecklistDisplay.tsx`**

- **Lines 36-43**: `allItemsChecked` variable using `.every()` with same condition
- **Lines 44-49**: `allItemsOverridden` checking override states
- **Pattern**: Same triple OR condition for completion, dual OR for overrides

### TypeScript Type System Integration

**Current Type Definition** (`src/types/checklist.ts`):

```typescript
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";
```

**Implications**:

- Union type ensures exhaustive status values at compile time
- New utility function should accept this type + nullable variants
- Future status additions would trigger TypeScript errors in utility function, forcing explicit handling
- Enables type-safe refactoring across all components

### Performance Considerations

**Current Performance**: Each status check is an inline triple-OR comparison (~3 equality checks)

**Refactored Performance**: Function call overhead + same triple-OR logic

**Analysis**:

- **Negligible impact**: Status checks are not in tight loops
- **React Compiler optimization**: With `reactCompiler: true`, JIT may inline the utility function
- **Readability vs. performance trade-off**: Maintenance benefits far outweigh microsecond overhead
- **Mobile target**: Client-side status checks are CPU-bound, not I/O bound; modern mobile CPUs handle this trivially

**Measurement**: Current codebase has ~400 LOC in page.tsx. Status checks occur on:

- Item check action (user interaction, <100ms budget)
- Checklist rendering (React render cycle, <16ms budget for 60fps)
- Menu state calculations (once per category selection)

**Verdict**: Performance impact is immeasurable and irrelevant for this use case.

### Testing Strategy

**Current State**: No automated tests

**Manual Test Plan** (for implementation phase):

1. **Regression Test**: Verify all three components (page, menu, display) behave identically after refactor
   - Check item → verify green color
   - Override item → verify cyan color
   - Complete checklist → verify menu checkmark appears
   - Complete all normal checklists → verify "NEXT" button appears
2. **Edge Case Test**: Manually test with modified LocalStorage data
   - Set status to `null` → should show unchecked
   - Set status to `undefined` → should show unchecked
   - Set status to unknown value (e.g., `"invalid"`) → should show unchecked (requires TypeScript workaround)
3. **Type Safety Test**: Attempt to pass invalid status to utility function → should fail TypeScript compilation

**Future Consideration**: Feature could serve as foundation for future unit test addition (test `isItemComplete` function in isolation).

## Dependencies Analysis

**No new dependencies required**. Feature uses only:

- TypeScript type system (already in project)
- ES2017 runtime (target in tsconfig.json)
- No external libraries needed

## Migration Plan

**Code Migration Steps**:

1. Create `src/utils/checklist.ts` with utility functions
2. Add unit-style JSDoc comments documenting behavior
3. Update `page.tsx` to import and use utility functions (2 locations)
4. Update `ChecklistMenu.tsx` to import and use utility functions (1 location)
5. Update `ChecklistDisplay.tsx` to import and use utility functions (2 locations)
6. Manual regression test
7. Remove unused inline logic

**No LocalStorage migration needed** - this is pure refactoring.

**Rollback Plan**: If issues discovered, revert changes to restore inline logic (Git revert).

## Documentation Needs

- **JSDoc comments** on utility functions explaining behavior for each status type
- **Quickstart guide** for developers showing how to use the functions
- **Update copilot-instructions.md** to reference the new utility module (handled by agent context update script)

## Open Questions

None - all research complete.

## References

- Feature Spec: `/specs/001-consolidate-status-logic/spec.md`
- Current Implementation: `page.tsx` (lines 78-84, 137-142), `ChecklistMenu.tsx` (lines 35-41, 53-54), `ChecklistDisplay.tsx` (lines 36-43, 44-49)
- Type Definitions: `src/types/checklist.ts`
- Constitution: `.specify/memory/constitution.md` (Principle III: Immutable Data Definitions, Principle VI: Type Safety)
