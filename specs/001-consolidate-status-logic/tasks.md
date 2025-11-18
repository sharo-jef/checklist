# Tasks: Consolidate Item Status Checking Logic

**Feature**: 001-consolidate-status-logic  
**Branch**: `001-consolidate-status-logic`  
**Generated**: 2025-11-19

**Input**: Design documents from `/specs/001-consolidate-status-logic/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/, ✅ quickstart.md

**Tests**: This feature does NOT include automated tests (manual testing workflow per project standards).

**Organization**: Tasks organized by user story to enable independent implementation and verification.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: Create new utility module file

- [x] T001 Create new file `src/utils/checklist.ts` with module header and imports

---

## Phase 2: Foundational

**Purpose**: Core utility functions that all refactoring depends on

**⚠️ CRITICAL**: No component refactoring can begin until utility functions are implemented and verified

- [x] T002 Implement `isItemComplete()` function in `src/utils/checklist.ts` per contract specification
- [x] T003 Implement `isItemOverridden()` function in `src/utils/checklist.ts` per contract specification
- [x] T004 Add JSDoc comments documenting behavior for all status types in `src/utils/checklist.ts`
- [x] T005 Export both utility functions from `src/utils/checklist.ts`

**Checkpoint**: ✅ Utility functions ready - component refactoring can now begin in parallel

---

## Phase 3: User Story 1 - Developer Modifies Status Checking Logic (Priority: P1) 🎯 MVP

**Goal**: Consolidate duplicate logic so status checking behavior can be changed in one location

**Independent Test**: Modify completion criteria in `isItemComplete()` (e.g., comment out `"overridden"` case) and verify all three components (page, menu, display) reflect the change without requiring individual updates. Then restore original logic.

### Implementation for User Story 1

- [x] T006 [P] [US1] Import utility functions in `src/app/page.tsx` from `@/utils/checklist`
- [x] T007 [P] [US1] Import utility functions in `src/components/ChecklistMenu.tsx` from `@/utils/checklist`
- [x] T008 [P] [US1] Import utility functions in `src/components/ChecklistDisplay.tsx` from `@/utils/checklist`
- [x] T009 [US1] Replace inline status checking logic in `src/app/page.tsx` line 78-84 (isComplete lambda) with `isItemComplete()` call
- [x] T010 [US1] Replace inline status checking logic in `src/app/page.tsx` line 137-142 (allChecked check) with `isItemComplete()` call
- [x] T011 [US1] Replace inline status checking logic in `src/components/ChecklistMenu.tsx` line 35-41 (isChecklistComplete function) with `isItemComplete()` call
- [x] T012 [US1] Replace inline status checking logic in `src/components/ChecklistDisplay.tsx` line 36-43 (allItemsChecked calculation) with `isItemComplete()` call
- [ ] T013 [US1] Manual regression test: Verify all checklists show correct completion state after refactor
- [ ] T014 [US1] Manual regression test: Verify menu checkmarks appear/disappear correctly
- [ ] T015 [US1] Manual regression test: Verify "NEXT" button appears when checklist is complete
- [ ] T016 [US1] Manual regression test: Verify first unchecked item auto-focus works correctly

**Checkpoint**: ✅ User Story 1 complete - status checking logic is now centralized, all existing functionality preserved

---

## Phase 4: User Story 2 - Bug Fix Propagation (Priority: P2)

**Goal**: Ensure bug fixes in status checking logic automatically apply to all components

**Independent Test**: Introduce deliberate bug in `isItemComplete()` (e.g., return `false` for all statuses) and verify all three components exhibit incorrect behavior. Fix bug and verify all components are corrected.

### Implementation for User Story 2

- [x] T017 [P] [US2] Replace override checking logic in `src/components/ChecklistMenu.tsx` line 53-54 (isChecklistOverridden function) with `isItemOverridden()` call
- [x] T018 [US2] Replace override checking logic in `src/components/ChecklistDisplay.tsx` line 44-49 (allItemsOverridden calculation) with `isItemOverridden()` call
- [ ] T019 [US2] Manual regression test: Verify status banner colors (green vs cyan) display correctly
- [ ] T020 [US2] Manual regression test: Override item and verify cyan color appears
- [ ] T021 [US2] Manual regression test: Complete checklist via override and verify menu shows cyan checkmark

**Checkpoint**: ✅ User Story 2 complete - override checking is also centralized, bug fixes now propagate automatically

---

## Phase 5: User Story 3 - Code Review and Comprehension (Priority: P3)

**Goal**: Improve code readability by having single, clearly documented utility function

**Independent Test**: Ask developer unfamiliar with codebase to locate and explain item completion logic within 2 minutes (should find `isItemComplete()` function with comprehensive JSDoc).

### Implementation for User Story 3

- [x] T022 [US3] Verify JSDoc comments in `src/utils/checklist.ts` document all four status types and their completion semantics
- [x] T023 [US3] Verify JSDoc comments in `src/utils/checklist.ts` document edge case handling (null, undefined)
- [x] T024 [US3] Add code example in JSDoc showing typical usage pattern with `.every()`
- [x] T025 [US3] Verify `quickstart.md` is up-to-date with implemented function signatures and examples
- [ ] T026 [US3] Manual test: Code review simulation - locate status logic definition in under 2 minutes

**Checkpoint**: ✅ User Story 3 complete - code is now well-documented and easy to understand

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [ ] T027 Remove unused inline status checking code comments if any remain
- [x] T028 Run `npm run lint` and fix any linting errors
- [x] T029 Run `npm run build` to verify static export still works
- [ ] T030 Verify no console warnings during development build
- [ ] T031 Final manual test: Complete full checklist workflow (pre-drive → during-drive → parking)
- [ ] T032 Update `.github/copilot-instructions.md` manual section if needed to reference new utility module

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - Can proceed in parallel if desired (different components)
  - Recommended: Sequential in priority order (P1 → P2 → P3) for clearer testing
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (utility functions exist) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on Phase 2 (utility functions exist) - Can run independently of US1, but recommended after US1 for testing clarity
- **User Story 3 (P3)**: Depends on Phase 2 (utility functions exist) - Can run independently, but recommended after US1/US2 since it's documentation-focused

### Within Each User Story

**User Story 1 Flow**:

1. T006-T008: Import utilities (can run in parallel - different files)
2. T009-T012: Replace inline logic (sequential - verify each file works before moving to next)
3. T013-T016: Manual testing (sequential validation)

**User Story 2 Flow**:

1. T017-T018: Replace override logic (can run in parallel - different files)
2. T019-T021: Manual testing (sequential validation)

**User Story 3 Flow**:

1. T022-T024: Documentation improvements (sequential - building on each other)
2. T025: Verify quickstart
3. T026: Manual validation

### Parallel Opportunities

**Phase 2 (Foundational)**: All tasks (T002-T005) can be done together in one editing session (same file)

**User Story 1 Import Phase**:

```bash
# Can run in parallel (different files):
T006: Import in src/app/page.tsx
T007: Import in src/components/ChecklistMenu.tsx
T008: Import in src/components/ChecklistDisplay.tsx
```

**User Story 2 Override Refactoring**:

```bash
# Can run in parallel (different files):
T017: Replace logic in src/components/ChecklistMenu.tsx
T018: Replace logic in src/components/ChecklistDisplay.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Recommended)

**Fastest path to value**:

1. ✅ Complete Phase 1: Setup (T001) - Create file
2. ✅ Complete Phase 2: Foundational (T002-T005) - Implement utilities
3. ✅ Complete Phase 3: User Story 1 (T006-T016) - Refactor completion logic
4. **STOP and VALIDATE**: Run all manual tests for US1
5. **CHECKPOINT**: Core consolidation complete - can deploy/commit

**Result**: Status checking logic consolidated, main use case satisfied.

**Optional continuation**:

- Add User Story 2 (override logic consolidation)
- Add User Story 3 (documentation polish)

### Complete Feature (All User Stories)

**Full implementation**:

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational → Foundation ready
3. Complete Phase 3: User Story 1 → Test independently → Checkpoint
4. Complete Phase 4: User Story 2 → Test independently → Checkpoint
5. Complete Phase 5: User Story 3 → Test independently → Checkpoint
6. Complete Phase 6: Polish → Final validation

**Result**: All duplicate logic eliminated, comprehensive documentation, production-ready.

### Parallel Team Strategy

With 2 developers (after Phase 2 completes):

- **Developer A**: User Story 1 (T006-T016) - Core completion logic
- **Developer B**: User Story 2 (T017-T021) - Override logic

Once both complete independently:

- **Either Developer**: User Story 3 (T022-T026) - Documentation
- **Both**: Phase 6 (T027-T032) - Final polish together

---

## Estimated Effort

**Time estimates** (for experienced developer familiar with codebase):

- **Phase 1 (Setup)**: 2 minutes
- **Phase 2 (Foundational)**: 15 minutes (write functions + JSDoc)
- **Phase 3 (User Story 1)**: 30 minutes (refactor 3 files + manual testing)
- **Phase 4 (User Story 2)**: 15 minutes (refactor 2 files + manual testing)
- **Phase 5 (User Story 3)**: 10 minutes (documentation review)
- **Phase 6 (Polish)**: 10 minutes (lint, build, final tests)

**Total**: ~80 minutes (~1.5 hours) for complete implementation

**MVP Only** (Phase 1-3): ~45 minutes

---

## Success Criteria Validation

Map tasks to success criteria from spec.md:

| Success Criteria                             | Validated By Tasks                                                                                  |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| SC-001: Logic exists in exactly one location | T002-T005 (create utilities), T009-T012 (remove duplicates), T017-T018 (remove override duplicates) |
| SC-002: 100% functional parity               | T013-T016, T019-T021 (manual regression tests)                                                      |
| SC-003: Changes in under 5 minutes           | T013 independent test (modify function, verify all components change)                               |
| SC-004: 60% code review time reduction       | T022-T026 (documentation + comprehension test)                                                      |
| SC-005: Zero regressions                     | All manual test tasks (T013-T016, T019-T021, T031)                                                  |

---

## Notes

- **No [P] markers on refactoring tasks**: Editing same sections of files sequentially is safer to avoid merge conflicts
- **[P] only on imports**: Different files, truly independent
- **Manual testing required**: No automated test suite in project currently
- **Hydration safety**: Utility functions are pure, no hydration concerns
- **Type safety**: TypeScript will catch any missed refactoring locations at compile time
- **Aviation UX**: All color semantics (green/cyan) preserved through refactoring
- **Constitution compliance**: All tasks verified against constitutional principles in plan.md

---

## Risk Mitigation

**Risk**: Breaking existing checklist functionality during refactoring  
**Mitigation**: Manual regression tests after each user story (T013-T016, T019-T021)

**Risk**: Missing a duplicate logic location  
**Mitigation**: TypeScript compilation + grep search verification before Phase 6

**Risk**: Performance regression from function call overhead  
**Mitigation**: React Compiler optimization enabled, plus inherent O(1) operations

**Risk**: Incomplete documentation  
**Mitigation**: User Story 3 dedicated to documentation quality (T022-T026)

---

## Quickstart Integration

After implementation, developers should:

1. Read `quickstart.md` for usage examples
2. Import utilities: `import { isItemComplete, isItemOverridden } from "@/utils/checklist";`
3. Replace inline comparisons with function calls
4. Let TypeScript guide refactoring with type errors

See `/specs/001-consolidate-status-logic/quickstart.md` for detailed patterns and examples.
