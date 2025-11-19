# Tasks: Remove Unused Type Fields

**Feature Branch**: `007-cleanup-types`  
**Input**: Design documents from `/specs/007-cleanup-types/`  
**Prerequisites**: ✅ plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated tests (manual testing only per project constraints)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are absolute from repository root

---

## Phase 1: Setup & Verification

**Purpose**: Pre-implementation verification and baseline establishment

- [ ] T001 Create feature branch `007-cleanup-types` and ensure it's current
- [ ] T002 Verify TypeScript compilation succeeds at baseline: `npm run build`
- [ ] T003 [P] Verify grep search confirms completed field usage in src/types/checklist.ts and src/data/checklists.ts only

**Checkpoint**: Baseline verified - ready for implementation

---

## Phase 2: User Story 1 - Accurate Type Definitions (Priority: P1) 🎯 MVP

**Goal**: Remove obsolete `completed` field from ChecklistItem type so developers see only actually-used fields

**Independent Test**: TypeScript compilation succeeds with zero errors after field removal

**Acceptance Criteria**:

- ✅ SC-001: ChecklistItem type has no `completed` field
- ✅ SC-002: `npm run build` exits 0 with no type errors
- ✅ SC-004: Grep for `\.completed\b` returns 0 matches in runtime code

### Implementation for User Story 1

- [ ] T004 [US1] Remove `completed: boolean` field from ChecklistItem interface in src/types/checklist.ts
- [ ] T005 [US1] Update ChecklistItem JSDoc comment to note status tracking via itemStates in src/types/checklist.ts
- [ ] T006 [US1] Verify TypeScript compilation: `npm run build` (must succeed with 0 errors)
- [ ] T007 [US1] Verify ESLint passes: `npm run lint`
- [ ] T008 [US1] Grep verification: confirm no `\.completed\b` matches in src/hooks/ and src/components/

**Checkpoint**: Type definition cleaned up, compilation succeeds. User Story 1 complete and independently testable.

---

## Phase 3: User Story 2 - Code Comprehension (Priority: P2)

**Goal**: Remove obsolete initialization values so developers understand status-based completion model

**Independent Test**: Examine checklists.ts and verify no `completed: false` values remain

**Acceptance Criteria**:

- ✅ SC-001: All item definitions in checklists.ts have no `completed` field
- ✅ SC-003: Type definition clearly shows status-based approach
- ✅ SC-004: Code searches return zero `completed:` in data definitions

### Implementation for User Story 2

- [ ] T009 [US2] Remove all `completed: false` lines from predrive category items in src/data/checklists.ts
- [ ] T010 [US2] Remove all `completed: false` lines from before-start category items in src/data/checklists.ts
- [ ] T011 [US2] Remove all `completed: false` lines from before-departure category items in src/data/checklists.ts
- [ ] T012 [US2] Remove all `completed: false` lines from parking category items in src/data/checklists.ts
- [ ] T013 [US2] Remove all `completed: false` lines from secure category items in src/data/checklists.ts
- [ ] T014 [US2] Remove all `completed: false` lines from accident category items in src/data/checklists.ts
- [ ] T015 [US2] Verify TypeScript compilation: `npm run build` (must succeed)
- [ ] T016 [US2] Verify data structure correctness: all items have id, item, value, required fields

**Checkpoint**: Data definitions cleaned up. User Stories 1 AND 2 complete and independently verifiable.

---

## Phase 4: User Story 3 - Type Safety and Refactoring (Priority: P3)

**Goal**: Ensure type definitions accurately reflect implementation for confident future refactoring

**Independent Test**: Attempt to access `item.completed` in new code and verify TypeScript prevents it

**Acceptance Criteria**:

- ✅ SC-002: TypeScript type checking enforces clean contract
- ✅ SC-005: Zero functional regressions
- ✅ SC-006: Type serves as accurate documentation

### Implementation for User Story 3

- [ ] T017 [US3] Manual runtime testing: Load app at http://localhost:3000/checklist
- [ ] T018 [US3] Manual test: Navigate through all checklist categories (predrive, before-start, etc.)
- [ ] T019 [US3] Manual test: Check and uncheck items in NORMAL checklists
- [ ] T020 [US3] Manual test: Use override functionality (ITEM OVRD, CHKL OVRD buttons)
- [ ] T021 [US3] Manual test: Test all reset functions (RESET ALL, RESET NORMAL, RESET NON-NORMAL)
- [ ] T022 [US3] Manual test: Verify state persistence - reload page and confirm state retained
- [ ] T023 [US3] Manual test: Clear LocalStorage and verify app initializes correctly
- [ ] T024 [US3] Manual test: Check all NON-NORMAL checklists work correctly
- [ ] T025 [US3] Verify no console errors or warnings during manual testing

**Checkpoint**: All user stories complete. Full application tested and functional.

---

## Phase 5: Polish & Documentation

**Purpose**: Final cleanup and documentation updates

- [ ] T026 [P] Review and update quickstart.md examples to ensure accuracy post-cleanup
- [ ] T027 [P] Verify all JSDoc comments in src/types/checklist.ts are accurate
- [ ] T028 Grep search verification: `grep -r "completed" src/` should only show Progress.completed
- [ ] T029 Final build verification: `npm run build` produces clean static export
- [ ] T030 Code review: Verify changes align with research.md recommendations
- [ ] T031 Update copilot-instructions.md if needed to reflect cleaned type model

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **User Story 1 (Phase 2)**: Depends on Setup - Type definition changes
- **User Story 2 (Phase 3)**: Depends on US1 completion - Data initialization changes depend on type being updated first
- **User Story 3 (Phase 4)**: Depends on US2 completion - Testing verifies complete implementation
- **Polish (Phase 5)**: Depends on US3 completion - Final verification and cleanup

### Within Each User Story

**User Story 1**:

- T004 (remove field) → T005 (update comment) → T006-T008 (verification)
- Must be sequential

**User Story 2**:

- T009-T014 can be done sequentially (same file, minimize conflicts)
- T015-T016 verification after all removals complete

**User Story 3**:

- T017-T025 manual tests should be done sequentially to catch issues systematically

**Polish**:

- T026, T027, T031 can run in parallel (different files)
- T028-T030 verification should be sequential

### Parallel Opportunities

Limited parallel opportunities due to:

- Small number of files (2 primary: checklist.ts and checklists.ts)
- Sequential nature of type change → data change → testing
- Single developer workflow expected

Possible parallelism:

- T026, T027, T031 in Phase 5 (different documentation files)

---

## Implementation Strategy

### Recommended Approach: Sequential User Stories

Given the type-first nature and small scope:

1. **Phase 1: Setup** (5 min)
   - Verify baseline, confirm branch

2. **Phase 2: User Story 1** (10 min)
   - T004-T008: Update type definition and verify compilation
   - **VALIDATE**: TypeScript compilation succeeds
   - **COMMIT**: "feat(types): remove unused completed field from ChecklistItem"

3. **Phase 3: User Story 2** (15 min)
   - T009-T016: Remove all `completed: false` from data definitions
   - **VALIDATE**: Compilation still succeeds, data structure correct
   - **COMMIT**: "refactor(data): remove completed initialization from checklist items"

4. **Phase 4: User Story 3** (20 min)
   - T017-T025: Comprehensive manual testing
   - **VALIDATE**: All functionality works, no regressions
   - **COMMIT**: None (verification only)

5. **Phase 5: Polish** (10 min)
   - T026-T031: Documentation updates and final verification
   - **VALIDATE**: Clean build, accurate docs
   - **COMMIT**: "docs: update documentation for status-based completion model"

**Total Estimated Time**: ~60 minutes

### MVP Definition

**Minimum Viable Product = User Story 1 only**

- Type definition cleaned
- Compilation succeeds
- Developers see accurate type contract

**Full Feature = All 3 User Stories**

- Type cleaned (US1)
- Data cleaned (US2)
- Verified working (US3)
- Documented (Polish)

---

## Verification Checklist

Before considering feature complete:

- [ ] TypeScript compilation: `npm run build` exits 0
- [ ] ESLint: `npm run lint` passes
- [ ] Static export builds: `out/` directory generated
- [ ] Grep verification: `grep -r "\.completed\b" src/` returns 0 runtime matches
- [ ] Manual testing: All checklist operations functional
- [ ] State persistence: LocalStorage working correctly
- [ ] No console errors in browser DevTools
- [ ] Documentation accurate: quickstart.md reflects changes

---

## Success Metrics (from spec.md)

Upon completion, verify:

- ✅ **SC-001**: ChecklistItem type has zero unused fields
- ✅ **SC-002**: TypeScript compilation succeeds (zero errors)
- ✅ **SC-003**: Type definition clearly shows status-based model
- ✅ **SC-004**: Code searches for `completed` return zero results in active code
- ✅ **SC-005**: Zero regressions in functionality
- ✅ **SC-006**: Type definition serves as accurate documentation

---

## Notes

- **No [P] markers in US2** (T009-T014): All modify same file (checklists.ts) - avoid conflicts by working sequentially
- **Manual testing required**: Project has no automated test suite (per constitution)
- **Type-first approach**: Must update type (US1) before data (US2) to avoid compilation errors
- **Constitution compliant**: All changes are type/data definition only, no runtime logic changes
- **Rollback plan**: Single `git revert` if issues found - changes are isolated and reversible
- **Low risk**: Extensive verification in research.md confirms zero actual usage of field
