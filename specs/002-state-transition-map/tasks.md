# Tasks: Simplify State Transition Logic with Transition Map

**Input**: Design documents from `/specs/002-state-transition-map/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No automated tests requested - manual testing only (per plan.md: "Manual testing (no automated test suite currently)")

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Note that User Story 1 (P1) is the primary refactoring work - User Stories 2 and 3 are verified outcomes of the refactoring, not separate implementations.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task serves (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and prerequisites before refactoring

- [x] T001 Verify branch `002-state-transition-map` is checked out and up to date
- [x] T002 Run `npm run lint` to establish baseline (should pass with no errors)
- [x] T003 Run `npm run build` to verify static export works before changes
- [ ] T004 Document current behavior: manually test all 8 state transitions (unchecked/checked/overridden/checked-overridden × toggle/override)

---

## Phase 2: Foundational (Core Refactoring Infrastructure)

**Purpose**: Create the state transition map module that ALL user stories depend on

**⚠️ CRITICAL**: This phase MUST be complete before any user story validation can occur

- [x] T005 Create `src/utils/transitions.ts` with `Action` type definition ('toggle' | 'override')
- [x] T006 Define `TransitionMap` type using mapped types for exhaustiveness checking in `src/utils/transitions.ts`
- [x] T007 Implement `TRANSITIONS` constant with all 8 state transitions per data-model.md in `src/utils/transitions.ts`
- [x] T008 Implement `transition(currentStatus, action)` function with development/production error handling in `src/utils/transitions.ts`
- [x] T009 [P] Implement `toggleStatus(currentStatus)` helper function in `src/utils/transitions.ts`
- [x] T010 [P] Implement `overrideStatus(currentStatus)` helper function in `src/utils/transitions.ts`
- [x] T011 Add JSDoc comments to all exported functions per contracts/transitions-api.md in `src/utils/transitions.ts`
- [x] T012 Run `npm run lint` to verify `src/utils/transitions.ts` has no TypeScript errors

**Checkpoint**: Foundation ready - transition map module is complete and type-safe

---

## Phase 3: User Story 1 - Developer Adds New Status Type (Priority: P1) 🎯 MVP

**Goal**: Refactor handlers to use the transition map, enabling easy addition of new status types without modifying handler logic (FR-010, SC-003)

**Independent Test**: After refactoring, verify all 8 transitions work identically. Then simulate adding a new status type to the map and confirm handlers don't need changes.

### Implementation for User Story 1

- [x] T013 [US1] Add import statement for `toggleStatus` and `overrideStatus` at top of `src/app/page.tsx`
- [x] T014 [US1] Refactor `handleToggleItem` function in `src/app/page.tsx` to use `toggleStatus()` instead of nested conditionals (reduce from ~38 lines to ~15 lines)
- [x] T015 [US1] Refactor `handleItemOverride` function in `src/app/page.tsx` to use `overrideStatus()` instead of nested conditionals (reduce from ~36 lines to ~15 lines)
- [x] T016 [US1] Remove obsolete Japanese comments from handlers (e.g., "overriddenの項目の場合は...", "unchecked <-> checked をトグル") in `src/app/page.tsx`
- [x] T017 [US1] Add function-level JSDoc comments to `handleToggleItem` and `handleItemOverride` explaining they use the transition map in `src/app/page.tsx`
- [x] T018 [US1] Run `npm run format` to apply Prettier formatting to modified files
- [x] T019 [US1] Run `npm run lint` to verify no TypeScript errors in `src/app/page.tsx`

### Manual Testing for User Story 1

- [ ] T020 [US1] Start dev server (`npm run dev`) and navigate to NORMAL → BEFORE START checklist
- [ ] T021 [US1] Test transition: unchecked + toggle → checked (verify green color)
- [ ] T022 [US1] Test transition: checked + toggle → unchecked (verify white color)
- [ ] T023 [US1] Test transition: unchecked + override → overridden (verify cyan color)
- [ ] T024 [US1] Test transition: checked + override → checked-overridden (verify cyan color)
- [ ] T025 [US1] Test transition: overridden + toggle → unchecked (verify white color)
- [ ] T026 [US1] Test transition: overridden + override → unchecked (verify white color)
- [ ] T027 [US1] Test transition: checked-overridden + toggle → unchecked (verify white color)
- [ ] T028 [US1] Test transition: checked-overridden + override → unchecked (verify white color)
- [ ] T029 [US1] Verify active item index (magenta border) updates correctly after toggle/override
- [ ] T030 [US1] Verify "CHKL OVRD" button still works (overrides entire checklist)
- [ ] T031 [US1] Verify "NEXT" button appears when all items complete in NORMAL flow
- [ ] T032 [US1] Verify LocalStorage persistence: make changes, reload page, confirm state persists
- [ ] T033 [US1] Test on mobile viewport (resize browser or use responsive mode)

**Checkpoint US1**: At this point, User Story 1 is complete - handlers use transition map, all behavior preserved (100% functional parity per FR-009, SC-002)

---

## Phase 4: User Story 2 - Bug Fix in State Transition (Priority: P2)

**Goal**: Demonstrate that fixing state transition bugs now requires changing only the transition map, not handler logic (FR-006, SC-001)

**Independent Test**: Intentionally introduce an incorrect transition in the map, verify buggy behavior, correct it, and confirm fix applies to both handlers without touching handler code.

### Validation for User Story 2

- [ ] T034 [US2] Simulate a bug: Change `overridden: { toggle: 'unchecked' }` to `overridden: { toggle: 'checked' }` in `src/utils/transitions.ts`
- [ ] T035 [US2] Test buggy behavior: verify overridden + toggle now incorrectly goes to checked instead of unchecked
- [ ] T036 [US2] Fix the bug: Restore `overridden: { toggle: 'unchecked' }` in `src/utils/transitions.ts` (single value change)
- [ ] T037 [US2] Verify fix: confirm overridden + toggle correctly goes to unchecked again
- [ ] T038 [US2] Confirm fix applies to BOTH toggle and override handlers without modifying handler functions in `src/app/page.tsx`
- [ ] T039 [US2] Document the test result: Verify that only `src/utils/transitions.ts` was modified, not `src/app/page.tsx`

**Checkpoint US2**: At this point, User Story 2 is validated - state transition bugs can be fixed by changing only the transition map (SC-003, single-point-of-change)

---

## Phase 5: User Story 3 - Code Review for State Logic (Priority: P3)

**Goal**: Demonstrate improved code reviewability - all transitions visible in one place, comprehensible in under 2 minutes (SC-004, SC-005)

**Independent Test**: Time how long it takes a reviewer to understand all 8 possible state transitions by reading the transition map vs. the old conditional logic.

### Validation for User Story 3

- [ ] T040 [US3] Open `src/utils/transitions.ts` and time how long it takes to understand all 8 transitions from the `TRANSITIONS` constant
- [ ] T041 [US3] Verify all transitions are visible in a single screen (no scrolling needed for the map itself)
- [ ] T042 [US3] Compare: Review the old handler logic (saved in git history) and estimate comprehension time
- [ ] T043 [US3] Measure LOC reduction: Count lines in new handlers vs. old handlers (target: 70+ lines → <20 lines per SC-001)
- [ ] T044 [US3] Document finding: Confirm transition map can be comprehended in <2 minutes (SC-005)
- [ ] T045 [US3] Document finding: Confirm LOC reduced by ~75% (target: 70+ → <20 lines per SC-001)

**Checkpoint US3**: At this point, User Story 3 is validated - code reviewability significantly improved (SC-004, SC-005)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across all user stories

- [ ] T046 Run final `npm run lint` to ensure all TypeScript and ESLint rules pass
- [ ] T047 Run final `npm run build` to verify static export builds successfully
- [ ] T048 Verify output in `out/` directory contains all expected static files
- [ ] T049 Test LocalStorage migration: Clear LocalStorage, reload, verify no errors with fresh state
- [ ] T050 Visual regression check: Compare UI screenshots before/after refactoring (colors, layout, borders)
- [ ] T051 Verify edge case: Empty transition map entry (should never happen with TypeScript, but test error handling)
- [ ] T052 [P] Update `.github/copilot-instructions.md` to document the state transition pattern (already done by update-agent-context.ps1)
- [ ] T053 Validate against quickstart.md: Confirm all steps in quickstart guide match actual implementation
- [ ] T054 Final success criteria check: Verify all 6 success criteria (SC-001 through SC-006) are met

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Primary implementation - must complete first
  - User Story 2 (P2): Validation task - depends on US1 completion
  - User Story 3 (P3): Validation task - depends on US1 completion
- **Polish (Phase 6)**: Depends on all user stories being validated

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - This is the actual refactoring work
- **User Story 2 (P2)**: Depends on User Story 1 completion - Validates single-point-of-change for bug fixes
- **User Story 3 (P3)**: Depends on User Story 1 completion - Validates code reviewability improvements

### Within Each Phase

**Phase 2 (Foundational)**:

- T005-T007: Sequential (type → map type → constant)
- T008: Depends on T007 (needs TRANSITIONS constant)
- T009-T010: Can run in parallel (marked [P]) - both are independent helper functions
- T011-T012: Sequential cleanup (depends on all functions being written)

**Phase 3 (User Story 1)**:

- T013: Must be first (import statement)
- T014-T015: Can run sequentially or in parallel (different functions in same file, but small enough to do together)
- T016-T017: Sequential cleanup (depends on T014-T015)
- T018-T019: Final validation
- T020-T033: Manual testing can be done in any order, but recommended to follow the test matrix sequence

**Phase 4-5 (User Story 2-3)**:

- Linear sequence within each phase (validation steps build on each other)

### Parallel Opportunities

Limited parallelization in this refactoring (mostly sequential due to single file editing):

```bash
# Phase 2: Foundational - Parallel helpers
Task T009: "Implement toggleStatus helper" (src/utils/transitions.ts)
Task T010: "Implement overrideStatus helper" (src/utils/transitions.ts)

# Phase 6: Polish - Parallel documentation
Task T052: "Update copilot-instructions.md" (already done)
```

Most tasks are sequential because they edit the same files (`src/app/page.tsx`, `src/utils/transitions.ts`).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify baseline)
2. Complete Phase 2: Foundational (create transition map module)
3. Complete Phase 3: User Story 1 (refactor handlers + test)
4. **STOP and VALIDATE**: Test all 8 transitions manually, verify 100% functional parity
5. Deploy/demo if ready - this is the complete refactoring

### Full Validation (All User Stories)

1. Complete Setup + Foundational + User Story 1 (the actual work)
2. Run User Story 2 validation (prove single-point-of-change)
3. Run User Story 3 validation (prove reviewability improvement)
4. Complete Polish phase
5. Merge to master

### Single Developer Strategy

Recommended order:

1. Phase 1: Setup (~15 min)
2. Phase 2: Foundational (~30 min)
3. Phase 3: User Story 1 Implementation (~30 min)
4. Phase 3: User Story 1 Testing (~45 min)
5. Phase 4: User Story 2 Validation (~15 min)
6. Phase 5: User Story 3 Validation (~15 min)
7. Phase 6: Polish (~20 min)

**Total estimated time**: 2.5-3 hours (matches quickstart.md estimate)

---

## Parallel Example: Foundational Phase

```bash
# Only meaningful parallelization in this feature:
# After T008 completes, T009 and T010 can run together:

Task T009: "Implement toggleStatus helper in src/utils/transitions.ts"
Task T010: "Implement overrideStatus helper in src/utils/transitions.ts"

# These are independent wrapper functions
```

---

## Task Summary

| Phase                 | Task Count | Estimated Time   | Key Deliverable                     |
| --------------------- | ---------- | ---------------- | ----------------------------------- |
| Phase 1: Setup        | 4          | 15 min           | Baseline verification               |
| Phase 2: Foundational | 8          | 30 min           | `src/utils/transitions.ts` module   |
| Phase 3: User Story 1 | 21         | 75 min           | Refactored handlers + manual tests  |
| Phase 4: User Story 2 | 6          | 15 min           | Single-point-of-change validation   |
| Phase 5: User Story 3 | 6          | 15 min           | Reviewability validation            |
| Phase 6: Polish       | 9          | 20 min           | Final validation + success criteria |
| **Total**             | **54**     | **~2.5-3 hours** | Complete refactoring                |

---

## Success Criteria Validation

After completing all tasks, verify:

- [ ] **SC-001**: State transition logic reduced from 70+ lines to <20 lines ✅ (Validated in T043-T045)
- [ ] **SC-002**: All item status behaviors work identically (100% parity) ✅ (Validated in T021-T033)
- [ ] **SC-003**: Adding new status = change map only, zero handler changes ✅ (Validated in T034-T039)
- [ ] **SC-004**: Code review time reduced by 50% (improved clarity) ✅ (Validated in T040-T042)
- [ ] **SC-005**: All transitions comprehensible in <2 minutes ✅ (Validated in T040-T044)
- [ ] **SC-006**: Zero regressions in toggle/override functionality ✅ (Validated in T021-T033, T050)

---

## Notes

- This is a **refactoring feature** - User Story 1 is the implementation, User Stories 2-3 are validation of benefits
- No automated tests (per plan.md) - all testing is manual
- Single file editing for most tasks - limited parallelization opportunities
- Focus on maintaining 100% functional parity (FR-009) throughout
- Reference quickstart.md for detailed implementation guidance
- All TypeScript types must pass strict mode compilation
- Aviation UX semantics must be preserved (colors, override behavior)
