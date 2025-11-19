# Tasks: Extract Business Logic from Page Component

**Input**: Design documents from `/specs/003-extract-page-logic/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/extracted-api.md  
**Feature**: Refactor 450-line page.tsx by extracting navigation logic into utilities  
**Target**: 30%+ LOC reduction (450 → <300 lines)

**Tests**: No automated tests requested - manual testing only (per project standards)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

---

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Exact file paths included in descriptions

---

## Phase 1: Setup (No Prerequisites)

**Purpose**: Project structure validation - no new files needed for this refactoring

- [x] T001 Verify existing project structure matches plan.md (src/utils/, src/hooks/, src/app/)
- [x] T002 Confirm TypeScript strict mode enabled in tsconfig.json
- [x] T003 Validate React 19.2.0 and Next.js 16.0.3 dependencies in package.json

**Status**: ✅ All setup tasks complete (verified during planning phase)

---

## Phase 2: Foundational (No Blocking Prerequisites)

**Purpose**: This refactoring has NO foundational blockers - can proceed directly to user stories

**Note**: Unlike new features, this is internal refactoring of existing working code. No new infrastructure needed.

**Checkpoint**: ✅ Foundation ready - user story implementation can begin immediately

---

## Phase 3: User Story 1 - Component Logic Reusability (Priority: P1) 🎯 MVP

**Goal**: Extract navigation utilities so logic can be imported and reused in other components

**Independent Test**: Create utility file, import in page.tsx, verify page.tsx still works with no regressions

**Success Criteria**:

- ✅ `getFirstUncheckedIndex` utility exists and is importable
- ✅ `getNextIncompleteChecklist` utility exists and is importable
- ✅ `hasNextChecklist` utility exists and is importable
- ✅ All utilities have JSDoc comments with examples
- ✅ page.tsx imports and uses utilities instead of inline functions

### Implementation for User Story 1

- [x] T004 [P] [US1] Create src/utils/navigation.ts with TypeScript strict mode and `@/` imports
- [x] T005 [P] [US1] Implement `getFirstUncheckedIndex(categoryId, checklistData, itemStates): number` in src/utils/navigation.ts
- [x] T006 [P] [US1] Implement `getNextIncompleteChecklist(menuType, checklistData, itemStates): string | null` in src/utils/navigation.ts
- [x] T007 [P] [US1] Implement `hasNextChecklist(activeCategory, checklistData, menuType): boolean` in src/utils/navigation.ts
- [x] T008 [P] [US1] Add JSDoc comments with `@param`, `@returns`, `@example` to all utilities in src/utils/navigation.ts
- [x] T009 [US1] Import navigation utilities in src/app/page.tsx (add imports at top of file)
- [x] T010 [US1] Replace inline `getFirstUncheckedIndex` function in src/app/page.tsx with utility call
- [x] T011 [US1] Replace inline `getNextIncompleteChecklist` function in src/app/page.tsx with utility call
- [x] T012 [US1] Replace inline `hasNextChecklist` function in src/app/page.tsx with utility call
- [x] T013 [US1] Remove old inline function definitions from src/app/page.tsx
- [x] T014 [US1] Wrap navigation utility calls in `useMemo` with correct dependencies in src/app/page.tsx

**Manual Testing Checklist**:

- [ ] T015 [US1] Test NORMAL button navigates to first incomplete checklist
- [ ] T016 [US1] Test NON-NORMAL button navigates to first incomplete checklist
- [ ] T017 [US1] Test clicking checklist in menu jumps to first unchecked item
- [ ] T018 [US1] Test NEXT button appears when not on last checklist
- [ ] T019 [US1] Test NEXT button hidden when on last checklist
- [ ] T020 [US1] Test active item border jumps to first unchecked item on category change
- [ ] T021 [US1] Test all checklists complete → NORMAL button jumps to last checklist

**Checkpoint**: At this point, all navigation logic should be extracted and working identically to before

---

## Phase 4: User Story 2 - Component Testing and Isolation (Priority: P2)

**Goal**: Enable isolated testing by having logic in pure utility functions

**Independent Test**: Utilities exist as pure functions that can be tested with simple input/output assertions (if tests are added in future)

**Success Criteria**:

- ✅ All utilities are pure functions (no side effects)
- ✅ All utilities accept parameters explicitly (no global imports within functions)
- ✅ All utilities return type-safe values (number, string | null, boolean)
- ✅ Edge cases return safe defaults (-1, null, false)

### Implementation for User Story 2

- [ ] T022 [P] [US2] Verify `getFirstUncheckedIndex` is pure (no mutations, no side effects) in src/utils/navigation.ts
- [ ] T023 [P] [US2] Verify `getNextIncompleteChecklist` is pure (no mutations, no side effects) in src/utils/navigation.ts
- [ ] T024 [P] [US2] Verify `hasNextChecklist` is pure (no mutations, no side effects) in src/utils/navigation.ts
- [ ] T025 [US2] Add edge case handling for category not found in getFirstUncheckedIndex (return -1)
- [ ] T026 [US2] Add edge case handling for no checklists in getFirstUncheckedIndex (return -1)
- [ ] T027 [US2] Add edge case handling for no categories in getNextIncompleteChecklist (return null)
- [ ] T028 [US2] Add edge case handling for invalid category in hasNextChecklist (return false)
- [ ] T029 [US2] Document edge cases in JSDoc comments for each utility

**Manual Testing Checklist (Edge Cases)**:

- [ ] T030 [US2] Test getFirstUncheckedIndex with invalid category ID (should return -1)
- [ ] T031 [US2] Test getFirstUncheckedIndex with all items checked (should return -1)
- [ ] T032 [US2] Test getNextIncompleteChecklist with all complete (should return last category)
- [ ] T033 [US2] Test hasNextChecklist on last checklist (should return false)

**Checkpoint**: All utilities are now pure, testable functions with proper edge case handling

---

## Phase 5: User Story 3 - Code Review and Comprehension (Priority: P3)

**Goal**: Reduce page.tsx from 450+ lines to <300 lines for better comprehension

**Independent Test**: Measure LOC in page.tsx before and after, target 33%+ reduction

**Success Criteria**:

- ✅ page.tsx is under 300 lines (from 450+)
- ✅ page.tsx primarily contains JSX and event handlers
- ✅ Business logic delegated to utilities with clear names
- ✅ Component is easier to scan and understand

### Implementation for User Story 3

- [ ] T034 [US3] Measure initial LOC in src/app/page.tsx (baseline: ~450 lines)
- [ ] T035 [US3] Remove inline comments that explain logic now in utilities in src/app/page.tsx
- [ ] T036 [US3] Consolidate navigation memoization into single `useMemo` block in src/app/page.tsx
- [ ] T037 [US3] Simplify event handlers to use memoized navigation values in src/app/page.tsx
- [ ] T038 [US3] Remove unused variables and dead code paths in src/app/page.tsx
- [ ] T039 [US3] Format code with Prettier (`npm run format`)
- [ ] T040 [US3] Measure final LOC in src/app/page.tsx (target: <300 lines, 33%+ reduction)

**Manual Review Checklist**:

- [ ] T041 [US3] Verify page.tsx is primarily JSX composition
- [ ] T042 [US3] Verify event handlers are concise and delegate to utilities
- [ ] T043 [US3] Verify no business logic remains inline in component
- [ ] T044 [US3] Verify navigation logic is clearly named and imported

**Checkpoint**: page.tsx should now be significantly shorter and easier to comprehend

---

## Phase 6: User Story 4 - Modification Safety (Priority: P3)

**Goal**: Enable safe modifications by isolating logic in dedicated utility file

**Independent Test**: Modify navigation logic in src/utils/navigation.ts and verify no UI changes in page.tsx

**Success Criteria**:

- ✅ Navigation logic changes confined to src/utils/navigation.ts
- ✅ No risk of accidentally modifying UI while changing logic
- ✅ Clear separation between logic (utils) and presentation (page.tsx)

### Implementation for User Story 4

- [ ] T045 [US4] Verify no navigation logic remains in src/app/page.tsx (all delegated to utilities)
- [ ] T046 [US4] Verify src/utils/navigation.ts has no UI imports or JSX
- [ ] T047 [US4] Verify src/app/page.tsx has no inline navigation computations
- [ ] T048 [US4] Document separation of concerns in quickstart.md (already done in planning)

**Separation Verification**:

- [ ] T049 [US4] Confirm utilities only import types and other utilities (no React, no components)
- [ ] T050 [US4] Confirm page.tsx only imports utilities for logic (no inline navigation functions)
- [ ] T051 [US4] Confirm changes to navigation logic can be made in isolation in src/utils/navigation.ts

**Checkpoint**: Clear separation between logic and UI achieved - modifications are now safer

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation across all user stories

- [x] T052 Run ESLint to verify no type errors (`npm run lint`)
- [x] T053 Run Prettier to format all files (`npm run format`)
- [x] T054 Verify static export builds successfully (`npm run build`)
- [ ] T055 Test application in development mode (`npm run dev`)
- [ ] T056 [P] Review all JSDoc comments for accuracy and completeness
- [ ] T057 [P] Verify all imports use `@/` path aliases (not relative paths)
- [ ] T058 Verify no `any` types introduced in navigation.ts
- [ ] T059 Measure final page.tsx LOC and calculate reduction percentage
- [ ] T060 Verify no hydration warnings in browser console
- [ ] T061 Run full user flow testing per quickstart.md validation scenarios
- [ ] T062 Update .github/copilot-instructions.md if new patterns emerged (already done in planning)
- [ ] T063 Document final LOC metrics in commit message

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: ✅ Complete - no work needed
2. **Foundational (Phase 2)**: ✅ Complete - no blockers
3. **User Story 1 (Phase 3)**: Can start immediately - extracts utilities ⚡ **START HERE**
4. **User Story 2 (Phase 4)**: Depends on US1 (utilities must exist) - adds edge cases
5. **User Story 3 (Phase 5)**: Depends on US1 (utilities must be in use) - measures reduction
6. **User Story 4 (Phase 6)**: Depends on US1 (separation must be complete) - validates isolation
7. **Polish (Phase 7)**: Depends on all user stories - final validation

### User Story Dependencies

- **User Story 1 (P1)**: ✅ No dependencies - can start immediately
  - Extracts utilities and integrates into page.tsx
  - **CRITICAL**: All other stories depend on this completing
- **User Story 2 (P2)**: Depends on US1 complete
  - Adds edge case handling to utilities created in US1
  - Can start once T004-T014 complete
- **User Story 3 (P3)**: Depends on US1 complete
  - Measures LOC reduction achieved by US1
  - Can start once T009-T014 complete
- **User Story 4 (P3)**: Depends on US1 complete
  - Validates separation achieved by US1
  - Can start once T004-T014 complete

### Recommended Execution Order

**Sequential (Single Developer)**:

```
Phase 1 (Setup) → Phase 2 (Foundation) →
User Story 1 (T004-T021) →  [Test thoroughly before proceeding]
User Story 2 (T022-T033) →  [Add edge cases]
User Story 3 (T034-T044) →  [Measure reduction]
User Story 4 (T045-T051) →  [Validate separation]
Polish (T052-T063)        →  [Final validation]
```

**Parallel Opportunities Within User Story 1**:

```bash
# Can run in parallel (different responsibilities):
T005 (getFirstUncheckedIndex)  |
T006 (getNextIncompleteChecklist) | --> All writing to same file,
T007 (hasNextChecklist)           |     but different functions
T008 (JSDoc comments)             |

# Sequential (same file, logical dependencies):
T009 (import utilities) → T010-T012 (replace functions) → T013 (remove old) → T014 (memoize)
```

---

## Parallel Example: User Story 1 Core Implementation

```bash
# Launch utility implementations in parallel (same file, different functions):
Task T005: "Implement getFirstUncheckedIndex in src/utils/navigation.ts"
Task T006: "Implement getNextIncompleteChecklist in src/utils/navigation.ts"
Task T007: "Implement hasNextChecklist in src/utils/navigation.ts"
Task T008: "Add JSDoc comments to all utilities"

# Then sequentially update page.tsx:
Task T009: "Import utilities"
Task T010-T012: "Replace inline functions"
Task T013: "Remove old functions"
Task T014: "Add memoization"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

**Recommended approach** - Delivers reusability (highest priority):

1. Complete User Story 1 (T004-T021)
   - Extract utilities
   - Integrate into page.tsx
   - Test thoroughly for regressions
2. **STOP and VALIDATE**:
   - All navigation flows work identically
   - Utilities are importable elsewhere
   - No regressions in UI behavior
3. **SHIP IT**: Utilities are now reusable, merge to main

**Result**: Core goal achieved - logic is now reusable

### Incremental Delivery

**Full implementation** - All user stories:

1. User Story 1 → Test → Commit (reusability achieved)
2. User Story 2 → Test → Commit (testability improved)
3. User Story 3 → Test → Commit (comprehension improved)
4. User Story 4 → Test → Commit (modification safety achieved)
5. Polish → Test → Commit (production ready)

Each story builds on the previous, no story breaks the others.

### Time Estimates

| Phase                | Tasks                | Est. Time     | Priority          |
| -------------------- | -------------------- | ------------- | ----------------- |
| Setup (Phase 1)      | 0 tasks              | 0 min (done)  | -                 |
| Foundation (Phase 2) | 0 tasks              | 0 min (done)  | -                 |
| User Story 1         | T004-T021 (18 tasks) | 2-3 hours     | P1 - **Required** |
| User Story 2         | T022-T033 (12 tasks) | 1-2 hours     | P2 - Recommended  |
| User Story 3         | T034-T044 (11 tasks) | 1 hour        | P3 - Nice to have |
| User Story 4         | T045-T051 (7 tasks)  | 30 min        | P3 - Nice to have |
| Polish               | T052-T063 (12 tasks) | 1 hour        | Required          |
| **Total**            | **60 tasks**         | **5-7 hours** | Full feature      |
| **MVP**              | **18 tasks**         | **2-3 hours** | US1 only          |

---

## Success Metrics

### Code Quality

- [ ] **LOC Reduction**: page.tsx reduced from 450 to <300 lines (33%+ reduction)
- [ ] **Reusability**: 3 utilities extractable and importable elsewhere
- [ ] **Type Safety**: No `any` types, all parameters and returns explicitly typed
- [ ] **Documentation**: All utilities have JSDoc with examples
- [ ] **Edge Cases**: All edge cases handled with safe defaults

### Functional Parity

- [ ] **Zero Regressions**: All navigation flows work identically
- [ ] **NORMAL button**: Jumps to first incomplete checklist
- [ ] **NON-NORMAL button**: Jumps to first incomplete NON-NORMAL checklist
- [ ] **NEXT button**: Shows when not on last, hides when on last
- [ ] **Active item**: Jumps to first unchecked on category change
- [ ] **Menu navigation**: Clicking checklist goes to first unchecked item

### Developer Experience

- [ ] **Comprehension**: New developer can understand page.tsx structure in <5 min
- [ ] **Modification Safety**: Navigation logic changes isolated to src/utils/navigation.ts
- [ ] **Code Review**: page.tsx easier to review (primarily JSX, not logic)
- [ ] **Testability**: Utilities testable in isolation (if tests added in future)

---

## Validation Scenarios (Manual Testing)

### Critical User Flows

**Flow 1: NORMAL Checklist Progression**

1. Open app → Click NORMAL button
2. Verify: Jumps to first incomplete NORMAL checklist
3. Check all items in checklist
4. Verify: NEXT button appears
5. Click NEXT button
6. Verify: Jumps to next NORMAL checklist
7. Repeat until last checklist
8. Verify: NEXT button hidden on last checklist

**Flow 2: Menu Navigation**

1. Click NORMAL top menu button
2. See checklist menu
3. Click a checklist in menu
4. Verify: Active item border on first unchecked item
5. Check item
6. Verify: Active item border jumps to next unchecked item

**Flow 3: All Complete State**

1. Complete all NORMAL checklists
2. Click NORMAL button again
3. Verify: Jumps to last NORMAL checklist (allows review)

**Flow 4: NON-NORMAL Flow**

1. Click NON-NORMAL button
2. Verify: Jumps to first incomplete NON-NORMAL checklist
3. Complete all items
4. Verify: NEXT button does NOT appear (NON-NORMAL is single checklist)

### Edge Case Validation

**Edge 1: Empty itemStates (Fresh Start)**

- Open app with cleared LocalStorage
- Click NORMAL button
- Verify: Jumps to first checklist (pre-drive)
- Verify: Active item on index 0 (first item)

**Edge 2: Partial Completion**

- Check some items in first checklist (not all)
- Refresh page
- Click NORMAL button
- Verify: Returns to first incomplete checklist (not next)

**Edge 3: Override States**

- Use ITEM OVRD button
- Verify: getFirstUncheckedIndex handles overridden items correctly
- Verify: Overridden items count as "complete" for navigation

---

## Notes

- **[P] tasks**: Different functions in same file, can be written in parallel but merged carefully
- **[Story] label**: Maps task to specific user story for traceability
- **No tests**: Manual testing only (per project standards, no automated tests)
- **Commit strategy**: Commit after each user story phase completes
- **Rollback safety**: Each user story is independently testable, can rollback if issues
- **MVP delivery**: User Story 1 alone delivers core value (reusability)

---

## Task Checklist Format

Tasks use standard markdown checkboxes for tracking:

- `- [ ]` = Not started
- `- [x]` = Complete

Track progress by checking off tasks as completed. Update this file as work progresses.

---

**Total Tasks**: 60  
**MVP Tasks** (US1 only): 18  
**Current Status**: Ready for implementation  
**Next Step**: Begin T004 (Create src/utils/navigation.ts)
