# Tasks: Remove Development Logging from Production Code

**Input**: Design documents from `/specs/008-remove-console-logs/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No automated tests required - manual testing only per quickstart.md

**Organization**: Tasks organized by user story to enable independent verification of each improvement.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No setup required - this is a code cleanup task on existing codebase

**Status**: ✅ Complete (feature branch `008-remove-console-logs` already exists)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify current console statement locations before removal

- [x] T001 Audit all console.log statements in src/ directory using grep search
- [x] T002 Audit all console.error statements in src/ directory to verify preservation strategy
- [x] T003 Audit all console.warn statements in src/ directory to verify preservation strategy

**Audit Results**:

- console.log: 1 instance (storage.ts:24) ✅ TO REMOVE
- console.error: 6 instances (3 in storage.ts to PRESERVE, 1 in transitions.ts to REMOVE, 2 in useLocalStorage.ts to REMOVE)
- console.warn: 1 instance (storage.ts:72) ✅ TO PRESERVE

**Checkpoint**: ✅ Console statement inventory complete - ready for targeted removal

---

## Phase 3: User Story 1 - Clean Production Console (Priority: P1) 🎯 MVP

**Goal**: Remove all development logging (console.log) so production console is clean and professional

**Independent Test**: Load production build and verify browser console contains no migration messages or development logging

### Implementation for User Story 1

- [x] T004 [US1] Remove console.log from migration code in src/utils/storage.ts line 24
- [x] T005 [US1] Add explanatory comment documenting silent migration in src/utils/storage.ts line 24
- [x] T006 [US1] Verify console.warn preserved in src/utils/storage.ts line 72 (version mismatch warning)
- [x] T007 [US1] Verify console.error preserved in src/utils/storage.ts lines 78, 102, 119 (error handlers)
- [x] T008 [US1] Test migration still works: Load v1.0.0 data and verify silent migration to v2.0.0
- [x] T009 [US1] Test production console: Verify no "Migrating storage" message appears
- [x] T010 [US1] Build production bundle and verify no console.log in output

**Checkpoint**: ✅ Production console is clean - no development messages visible to users

---

## Phase 4: User Story 2 - Security and Information Disclosure (Priority: P2)

**Goal**: Remove console statements that could leak internal implementation details to attackers

**Independent Test**: Security review of production console to ensure no sensitive state machine or storage details are disclosed

### Implementation for User Story 2

- [x] T011 [P] [US2] Remove redundant console.error from src/utils/transitions.ts line 80
- [x] T012 [US2] Update comment in src/utils/transitions.ts to clarify graceful degradation behavior
- [x] T013 [US2] Verify error throwing in development mode still works (src/utils/transitions.ts lines 75-77)
- [x] T014 [US2] Test state transitions: Verify all transitions work correctly without console output
- [x] T015 [US2] Security review: Confirm no state machine details leaked in production console

**Checkpoint**: ✅ Internal implementation details are protected - no console messages reveal system architecture

---

## Phase 5: User Story 3 - Performance Optimization (Priority: P3)

**Goal**: Eliminate redundant error logging overhead in hooks layer

**Independent Test**: Verify errors still appear in console exactly once (from storage utilities), not duplicated

### Implementation for User Story 3

- [x] T016 [P] [US3] Remove duplicate console.error from src/hooks/useLocalStorage.ts line 23 (load error handler)
- [x] T017 [P] [US3] Add comment explaining error already logged by loadFromStorage utility
- [x] T018 [P] [US3] Remove duplicate console.error from src/hooks/useLocalStorage.ts line 37 (save error handler)
- [x] T019 [US3] Add comment explaining error already logged by saveToStorage utility
- [x] T020 [US3] Test error logging: Trigger storage failure and verify single console.error (not duplicate)
- [x] T021 [US3] Verify error handling behavior unchanged (try-catch blocks intact)

**Checkpoint**: ✅ Error logging is deduplicated - single source of truth in storage utilities

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and validation

- [x] T022 [P] Run grep search to verify zero console.log statements remain in src/
- [x] T023 [P] Verify all console.error statements in storage.ts preserved (3 instances)
- [x] T024 [P] Verify console.warn statement in storage.ts preserved (1 instance)
- [x] T025 Run full manual test suite from quickstart.md (5 test scenarios)
- [x] T026 Run production build and verify no console warnings or errors
- [x] T027 Update documentation if needed (verify quickstart.md accuracy)

**Verification Results**:

- ✅ Zero console.log statements in src/
- ✅ Three console.error statements preserved in storage.ts (lines 78, 102, 119)
- ✅ One console.warn statement preserved in storage.ts (line 72)
- ✅ Production build succeeded with no errors
- ✅ All manual tests passed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: ✅ Complete - feature branch exists
- **Foundational (Phase 2)**: Audit tasks (T001-T003) - can run in parallel, must complete before implementation
- **User Stories (Phase 3-5)**: All depend on Foundational audit completion
  - User Story 1 (P1): Can start immediately after audit
  - User Story 2 (P2): Can start in parallel with US1 (different file: transitions.ts)
  - User Story 3 (P3): Can start in parallel with US1 and US2 (different file: useLocalStorage.ts)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - can start after audit
- **User Story 2 (P2)**: No dependencies on US1 - different file (transitions.ts)
- **User Story 3 (P3)**: No dependencies on US1 or US2 - different file (useLocalStorage.ts)

**All three user stories are independent and can be implemented in parallel**

### Within Each User Story

- Code removal before testing
- Comments added immediately after removal
- Verification tasks after implementation
- Story-specific testing before moving to next priority

### Parallel Opportunities

**Audit Phase (Phase 2)**:

```bash
# All audit tasks can run simultaneously:
T001: Audit console.log statements
T002: Audit console.error statements
T003: Audit console.warn statements
```

**Implementation Phase (Phases 3-5)**:

```bash
# All user stories can be implemented in parallel (different files):
US1: src/utils/storage.ts (T004-T010)
US2: src/utils/transitions.ts (T011-T015)
US3: src/hooks/useLocalStorage.ts (T016-T021)
```

**Polish Phase (Phase 6)**:

```bash
# Verification tasks can run in parallel:
T022: Grep search for console.log
T023: Verify console.error preserved
T024: Verify console.warn preserved
```

---

## Parallel Example: All User Stories

Since each user story modifies a different file, all can proceed simultaneously:

```bash
# Developer A (or same developer in sequence):
Task T004-T010: User Story 1 (storage.ts)

# Developer B (or same developer in sequence):
Task T011-T015: User Story 2 (transitions.ts)

# Developer C (or same developer in sequence):
Task T016-T021: User Story 3 (useLocalStorage.ts)

# All three can work independently without conflicts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational audit (T001-T003)
2. Complete Phase 3: User Story 1 (T004-T010)
3. **STOP and VALIDATE**: Test that production console is clean
4. Run grep to verify console.log removed
5. Test migration still works
6. **Deploy if satisfied with US1 only**

### Incremental Delivery (Recommended)

1. Complete Foundational audit → Know what to change
2. Add User Story 1 → Test independently → Clean production console achieved ✅
3. Add User Story 2 → Test independently → No information disclosure ✅
4. Add User Story 3 → Test independently → No duplicate logging ✅
5. Run Polish tasks → Final validation ✅

### Parallel Team Strategy (Maximum Speed)

With multiple developers or aggressive single-developer approach:

1. Complete audit together (T001-T003) - 2 minutes
2. Once audit done, split work:
   - Developer A: US1 (storage.ts) - 5 minutes
   - Developer B: US2 (transitions.ts) - 3 minutes
   - Developer C: US3 (useLocalStorage.ts) - 4 minutes
3. All converge for Phase 6 polish and validation - 5 minutes
4. **Total time with parallel execution: ~15 minutes**

### Single Developer Sequential (Safest)

1. Audit (T001-T003) - 2 minutes
2. US1 complete + test (T004-T010) - 5 minutes
3. US2 complete + test (T011-T015) - 3 minutes
4. US3 complete + test (T016-T021) - 4 minutes
5. Polish and final validation (T022-T027) - 5 minutes
6. **Total time: ~19 minutes**

---

## Success Criteria Checklist

After all tasks complete, verify:

- [ ] **SC-001**: Production console contains zero development logging messages ✅
- [ ] **SC-002**: Storage migration operations complete without console output ✅
- [ ] **SC-003**: Application performance improved (no console.log overhead) ✅
- [ ] **SC-004**: No sensitive implementation details disclosed through console ✅
- [ ] **SC-005**: Zero regressions in functionality after removing logging ✅
- [ ] **SC-006**: Essential error handling intact (console.error/warn preserved) ✅

---

## Notes

- **Low complexity**: Only removing logging, no logic changes
- **Low risk**: Error handling preserved, behavior unchanged
- **High parallelization**: All 3 user stories can run simultaneously (different files)
- **Quick validation**: Each user story has independent test criteria
- **No automated tests**: Manual testing per quickstart.md is sufficient
- Commit after each user story completion
- Stop at any checkpoint to validate independently
- See quickstart.md for detailed step-by-step implementation guide
- See contracts/console-cleanup-contract.md for exact code changes
