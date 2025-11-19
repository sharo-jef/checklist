# Tasks: Extract LocalStorage Operations to Storage Utilities

**Feature Branch**: `005-extract-storage-logic`  
**Input**: Design documents from `specs/005-extract-storage-logic/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/storage-api.md, ✅ quickstart.md

**Tests**: No automated tests - manual testing only per project conventions

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths use `src/` prefix (Next.js single project structure)

---

## Phase 1: Setup

**Purpose**: Preparation and validation before implementation

- [x] T001 Review current `src/utils/storage.ts` and identify all existing functions (loadFromStorage, saveToStorage, clearStorage, getItemStatus, setItemStatus)
- [x] T002 Review current `src/hooks/useChecklist.ts` and identify all direct localStorage API calls (localStorage.removeItem, localStorage.setItem) - document line numbers
- [x] T003 Create backup/snapshot of current working state for rollback if needed

**Checkpoint**: Development environment ready, scope clearly identified ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add new storage utility functions that will be used by ALL user stories

**⚠️ CRITICAL**: These utilities must be complete and working before refactoring the hook

- [x] T004 [P] [US1] Implement `resetChecklistInStorage(categoryId, checklistId): boolean` in src/utils/storage.ts per contracts/storage-api.md
- [x] T005 [P] [US1] Implement `resetCategoriesInStorage(categoryIds): boolean` in src/utils/storage.ts per contracts/storage-api.md
- [x] T006 [P] [US1] Implement `resetAllStorage(): boolean` in src/utils/storage.ts (wrapper for clearStorage) per contracts/storage-api.md
- [ ] T007 [US1] Manually test all three new storage functions in browser console: verify resetChecklistInStorage preserves other checklists, resetCategoriesInStorage handles batch deletes, resetAllStorage clears everything
- [x] T008 [US1] Run ESLint and verify no type errors in src/utils/storage.ts

**Checkpoint**: All new storage utilities implemented, tested, and type-safe - ready to refactor hook ✅

---

## Phase 3: User Story 1 - Separation of Storage and Business Logic (Priority: P1) 🎯 MVP

**Goal**: Delegate all direct localStorage operations from useChecklist hook to storage utilities, achieving zero localStorage API calls in the hook

**Independent Test**: Count localStorage API calls in useChecklist.ts - verify count is zero after refactoring. Verify all checklist operations (check item, reset, override) still work identically.

### Implementation for User Story 1

- [x] T009 [US1] Refactor `resetAll()` in src/hooks/useChecklist.ts: replace `localStorage.removeItem("checklist-state")` with `resetAllStorage()` utility call (line ~143)
- [x] T010 [US1] Refactor `resetChecklist()` in src/hooks/useChecklist.ts: replace inline localStorage.setItem + loadFromStorage pattern with `resetChecklistInStorage()` utility call (lines ~151-159)
- [x] T011 [US1] Refactor `resetNormal()` in src/hooks/useChecklist.ts: replace inline category filtering + localStorage update with `resetCategoriesInStorage()` utility call (lines ~210-217)
- [x] T012 [US1] Refactor `resetNonNormal()` in src/hooks/useChecklist.ts: replace inline category filtering + localStorage update with `resetCategoriesInStorage()` utility call (lines ~227-234)
- [x] T013 [US1] Run ESLint on src/hooks/useChecklist.ts and verify no type errors
- [x] T014 [US1] Search src/hooks/useChecklist.ts for remaining direct localStorage API calls (localStorage.getItem, localStorage.setItem, localStorage.removeItem) - verify zero occurrences (SC-001)
- [ ] T015 [US1] Manual regression test: Execute all acceptance scenarios from spec.md User Story 1 - verify storage format changes don't require hook modifications

**Checkpoint**: useChecklist.ts contains zero localStorage API calls (Success Criteria SC-001 achieved) ✅

---

## Phase 4: User Story 2 - Storage Logic Testing (Priority: P2)

**Goal**: Verify storage utilities can be tested independently from React hook lifecycle

**Independent Test**: Open browser console, manually execute storage utility functions without mounting React components, verify operations work correctly

### Validation for User Story 2

- [ ] T016 [US2] Open browser DevTools console on running app
- [ ] T017 [US2] Test `resetChecklistInStorage()` independently: manually call function with test data, verify localStorage contents change correctly without React state updates
- [ ] T018 [US2] Test `resetCategoriesInStorage()` independently: manually call with array of category IDs, verify only specified categories cleared from localStorage
- [ ] T019 [US2] Test `resetAllStorage()` independently: manually call and verify localStorage["checklist-state"] removed entirely
- [ ] T020 [US2] Execute manual test cases from quickstart.md "Testing Guide" section - verify all test cases pass
- [ ] T021 [US2] Document test results: confirm storage utilities are testable without React rendering (SC-002)

**Checkpoint**: Storage utilities proven testable independently from React (Success Criteria SC-002 achieved)

---

## Phase 5: User Story 3 - Hook Clarity and Focus (Priority: P3)

**Goal**: Improve code readability by having useChecklist hook show only business logic with clear storage utility calls

**Independent Test**: Code review of useChecklist.ts - verify all localStorage operations are abstracted behind utility function calls with clear names

### Code Quality for User Story 3

- [ ] T022 [US3] Code review src/hooks/useChecklist.ts: verify all reset operations use descriptive utility function calls (resetChecklistInStorage, resetCategoriesInStorage, resetAllStorage) instead of inline localStorage code
- [ ] T023 [US3] Code review src/hooks/useChecklist.ts: verify business logic (state management, navigation, progress calculation) is clearly separated from persistence operations
- [ ] T024 [US3] Measure code clarity: count lines of localStorage-related code removed from useChecklist.ts (should be ~40 lines removed across resetAll, resetChecklist, resetNormal, resetNonNormal functions)
- [ ] T025 [US3] Developer comprehension test: have another developer trace item persistence flow and verify they can easily follow utility function calls to storage layer (SC-004)
- [ ] T026 [US3] Update inline code comments in useChecklist.ts if needed to clarify storage delegation pattern

**Checkpoint**: Hook code is cleaner and storage operations are clearly delegated (Success Criteria SC-004 achieved)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation

- [ ] T027 [P] Run full manual regression test suite from quickstart.md: verify all basic operations, reset operations, checklist override, storage verification, error scenarios
- [ ] T028 [P] Verify hydration safety: refresh page multiple times, verify no React hydration mismatch warnings in console
- [ ] T029 Verify functional parity (SC-005): test all acceptance scenarios from spec.md for all three user stories - confirm zero regressions
- [ ] T030 Performance verification: measure storage operation times in browser DevTools Performance tab - verify <50ms for operations, <100ms for hydration per Technical Context
- [ ] T031 [P] Code cleanup: remove any unused imports or dead code from refactoring
- [ ] T032 Verify success criteria SC-003: confirm storage utilities handle 100% of data persistence (serialization, migration, error handling)
- [ ] T033 Run `npm run lint` and verify no errors
- [ ] T034 Run `npm run build` and verify static export succeeds
- [ ] T035 Test built static site: serve from `out/` directory and verify all functionality works in production build
- [ ] T036 Document completion: add notes to quickstart.md if any implementation details differ from design

**Checkpoint**: Feature complete, tested, and production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
Phase 3 (US1: Storage/Business Separation) ← MVP delivery
    ↓
Phase 4 (US2: Testing Independence) ← Can validate in parallel with US3
    ↓
Phase 5 (US3: Code Clarity) ← Can validate in parallel with US2
    ↓
Phase 6 (Polish) ← Final validation
```

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2 (Foundational) - **No dependencies on other user stories** ✅
  - This is the core refactoring that enables US2 and US3
- **US2 (P2)**: Depends on US1 completion - validates extracted utilities are testable
- **US3 (P3)**: Depends on US1 completion - validates code quality improvement

### Within Each Phase

**Phase 2 (Foundational)**:

- T004, T005, T006 can run in parallel [P] (different functions)
- T007 depends on T004, T005, T006 completion (tests all three)
- T008 depends on all above

**Phase 3 (US1 Implementation)**:

- T009, T010, T011, T012 MUST run sequentially (all modify same file)
- T013, T014, T015 depend on T009-T012 completion

**Phase 4 (US2 Validation)**:

- T016-T021 MUST run sequentially (manual testing workflow)

**Phase 5 (US3 Validation)**:

- T022-T026 can run in any order (code review tasks)

**Phase 6 (Polish)**:

- T027, T028, T031, T033 can run in parallel [P] (independent checks)
- T034 depends on T033 (lint before build)
- T035 depends on T034 (test built artifacts)

### Parallel Opportunities

**Limited parallelization** in this refactoring due to:

- Single file modifications (useChecklist.ts)
- Sequential testing requirements
- Manual testing workflow

**Can parallelize**:

- Phase 2: T004, T005, T006 (implementing different utility functions)
- Phase 6: T027, T028, T031, T033 (independent validation tasks)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Implement all three new storage utilities in parallel:
Task T004: "Implement resetChecklistInStorage in src/utils/storage.ts"
Task T005: "Implement resetCategoriesInStorage in src/utils/storage.ts"
Task T006: "Implement resetAllStorage in src/utils/storage.ts"

# Then test them together:
Task T007: "Manually test all three functions"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

This refactoring is small enough that US1 alone delivers the MVP:

1. **Phase 1**: Setup (~15 min) - Review and document current state
2. **Phase 2**: Foundational (~45 min) - Implement 3 new utilities
3. **Phase 3**: US1 (~60 min) - Refactor hook to use utilities
4. **STOP and VALIDATE**: Test all checklist operations work identically
5. **Decision point**: Ship US1 only, or continue to US2/US3 for validation

**Estimated MVP Time**: ~2 hours for clean separation of concerns

### Incremental Delivery

1. **After US1**: Core refactoring complete, hook has zero localStorage calls
2. **After US2**: Testing independence validated (nice-to-have documentation)
3. **After US3**: Code clarity validated (nice-to-have documentation)
4. **After Polish**: Production-ready with full regression testing

### Single Developer Strategy

Recommended order:

1. Complete Phase 1 + 2 together (~1 hour)
2. Complete Phase 3 (US1) - **checkpoint: validate working** (~1 hour)
3. Complete Phase 4 (US2) - quick validation (~30 min)
4. Complete Phase 5 (US3) - code review (~30 min)
5. Complete Phase 6 (Polish) - final checks (~30 min)

**Total estimated time**: 3-4 hours for complete feature

---

## Manual Testing Checklist

After completing US1 (T015), verify these scenarios:

### Basic Operations

- [ ] Check an item → verify green color and localStorage update
- [ ] Uncheck an item → verify white color and localStorage update
- [ ] Override an item → verify cyan color
- [ ] Refresh page → verify all states persist

### Reset Operations

- [ ] Complete items in NORMAL and NON-NORMAL checklists
- [ ] Click "RESETS" → "RESET ALL" → verify all items unchecked
- [ ] Complete items again
- [ ] Click "RESETS" → "RESET NORMAL" → verify only NORMAL cleared
- [ ] Click "RESETS" → "RESET NON-NORMAL" → verify only NON-NORMAL cleared

### Checklist Override

- [ ] Partially complete a checklist
- [ ] Click "CHKL OVRD" → verify all items marked cyan
- [ ] Verify checked items show "checked-overridden" status

### Storage Verification

- [ ] Open browser DevTools → Application → LocalStorage
- [ ] Verify key `checklist-state` exists
- [ ] Verify JSON structure matches StoredData schema
- [ ] Verify version field is "2.0.0"

### Regression Tests

- [ ] All acceptance scenarios from spec.md User Story 1
- [ ] All acceptance scenarios from spec.md User Story 2
- [ ] All acceptance scenarios from spec.md User Story 3

---

## Success Criteria Validation

Map tasks to success criteria from spec.md:

- **SC-001** (Zero localStorage calls in hook): Validated by T014
- **SC-002** (Independent testing): Validated by T016-T021
- **SC-003** (100% persistence in utilities): Validated by T032
- **SC-004** (Developer comprehension): Validated by T025
- **SC-005** (Zero regressions): Validated by T029
- **SC-006** (Future flexibility): Implicitly validated by US1 architecture

---

## Notes

- This is an **internal refactoring** - no user-visible changes
- **No automated tests** per project conventions - use manual testing workflow
- **Hydration safety** is critical - preserve `useEffect` + `queueMicrotask` pattern
- **Type safety** enforced by TypeScript strict mode - verify no type errors
- All **localStorage operations** must move to utilities (SC-001)
- Estimated total effort: **3-4 hours** for single developer
- **MVP delivery**: User Story 1 alone is sufficient for core value
