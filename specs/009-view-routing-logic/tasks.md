# Tasks: Simplify Conditional View Rendering

**Input**: Design documents from `/specs/009-view-routing-logic/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No automated tests (manual testing only per project constraints)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create new directory structure and extract default view component

- [ ] T001 Create `src/routing/` directory for view routing logic
- [ ] T002 [P] Extract default view JSX to `src/components/DefaultView.tsx` with DefaultViewProps interface

**Checkpoint**: New directory exists, DefaultView component renders in page.tsx

---

## Phase 2: Foundational (Type Definitions & Registry)

**Purpose**: Core type system and component registry that ALL view routing depends on

**⚠️ CRITICAL**: No view router implementation can begin until this phase is complete

- [ ] T003 [P] Define ViewState discriminated union in `src/types/routing.ts`
- [ ] T004 [P] Define ViewKey string literal union in `src/types/routing.ts`
- [ ] T005 [P] Define AppState interface in `src/types/routing.ts`
- [ ] T006 [P] Define component props interfaces (DefaultViewProps, ChecklistMenuProps, ChecklistDisplayProps, ResetsMenuProps) in `src/types/routing.ts`
- [ ] T007 [P] Define ViewRegistry interface in `src/types/routing.ts`
- [ ] T008 Implement getViewKey() function with exhaustiveness checking in `src/types/routing.ts`
- [ ] T009 Create VIEW_COMPONENTS registry constant in `src/routing/viewRegistry.ts`

**Checkpoint**: All types compile, ViewRegistry maps all 6 view keys to components

---

## Phase 3: User Story 1 - Understanding View Transitions (Priority: P1) 🎯 MVP

**Goal**: Create view routing map that makes it easy to understand which component renders for any (activeMenu, viewMode) combination

**Independent Test**: Review ViewState type and VIEW_COMPONENTS registry - all current view combinations should be represented and immediately understandable

### Implementation for User Story 1

- [ ] T010 [US1] Implement useViewRouter hook signature and ViewComponent lookup in `src/routing/useViewRouter.ts`
- [ ] T011 [US1] Implement viewKey generation using getViewKey in `src/routing/useViewRouter.ts`
- [ ] T012 [US1] Add defensive fallback to DefaultView for missing components in `src/routing/useViewRouter.ts`
- [ ] T013 [US1] Implement props mapping switch statement for "default" case in `src/routing/useViewRouter.ts`
- [ ] T014 [US1] Implement props mapping for "menu-normal" case in `src/routing/useViewRouter.ts`
- [ ] T015 [US1] Implement props mapping for "menu-non-normal" case in `src/routing/useViewRouter.ts`
- [ ] T016 [US1] Implement props mapping for "menu-resets" case in `src/routing/useViewRouter.ts`
- [ ] T017 [US1] Implement props mapping for "checklist-normal" case in `src/routing/useViewRouter.ts`
- [ ] T018 [US1] Implement props mapping for "checklist-non-normal" case in `src/routing/useViewRouter.ts`
- [ ] T019 [US1] Add exhaustiveness checking to props mapping default case in `src/routing/useViewRouter.ts`
- [ ] T020 [US1] Wrap viewKey and viewProps in useMemo for performance in `src/routing/useViewRouter.ts`

**Checkpoint**: useViewRouter hook compiles and returns correct component + props for all ViewState combinations

---

## Phase 4: User Story 2 - Adding New Views (Priority: P2)

**Goal**: Refactor page.tsx to use routing pattern, making future view additions require only routing config updates

**Independent Test**: Add a hypothetical new view to ViewState and ViewRegistry - verify TypeScript errors guide you to update only routing structures, not JSX conditionals

### Implementation for User Story 2

- [x] T021 [US2] Wrap all event handlers in useCallback with correct dependencies in `src/app/page.tsx`
- [x] T022 [US2] Add ViewState and AppState type imports in `src/app/page.tsx`
- [x] T023 [US2] Construct ViewState from activeMenu and viewMode using useMemo in `src/app/page.tsx`
- [x] T024 [US2] Construct AppState object with all handlers and data using useMemo in `src/app/page.tsx`
- [x] T025 [US2] Call useViewRouter hook with viewState and appState in `src/app/page.tsx`
- [x] T026 [US2] Replace all nested conditional JSX blocks with single ViewComponent render in `src/app/page.tsx`
- [x] T027 [US2] Remove unused imports from deleted conditional rendering code in `src/app/page.tsx`
- [x] T028 [US2] Verify TopMenu activeMenu prop logic remains correct in `src/app/page.tsx`

**Checkpoint**: page.tsx uses routing hook, all views render identically to before, no nested conditionals remain

---

## Phase 5: User Story 3 - Code Review and Maintenance (Priority: P3)

**Goal**: Ensure routing changes are clear, documented, and easy to review

**Independent Test**: Compare git diff of page.tsx - routing map updates should be more readable than nested conditional changes

### Implementation for User Story 3

- [x] T029 [P] [US3] Add JSDoc comments to ViewState type in `src/types/routing.ts`
- [x] T030 [P] [US3] Add JSDoc comments to useViewRouter hook in `src/routing/useViewRouter.ts`
- [x] T031 [P] [US3] Add JSDoc comments to VIEW_COMPONENTS registry in `src/routing/viewRegistry.ts`
- [x] T032 [P] [US3] Add JSDoc comment to Home component explaining routing pattern in `src/app/page.tsx`
- [x] T033 [US3] Remove any commented-out old conditional code in `src/app/page.tsx`
- [x] T034 [US3] Format all modified files using `npm run format`
- [x] T035 [US3] Run ESLint and fix any warnings in modified files using `npm run lint`

**Checkpoint**: All code is documented, formatted, linted, and ready for review

---

## Phase 6: Polish & Validation

**Purpose**: Final testing, verification, and documentation

- [ ] T036 [P] Manual test: Default view displays NORMAL/NON-NORMAL buttons correctly
- [ ] T037 [P] Manual test: NORMAL menu flow (default → menu → checklist → NEXT → exit)
- [ ] T038 [P] Manual test: NON-NORMAL menu flow (default → menu → checklist → exit, no NEXT)
- [ ] T039 [P] Manual test: RESETS menu flow (TopMenu → RESETS → reset buttons → exit)
- [ ] T040 [P] Manual test: All item interactions (toggle, override, checklist override, reset)
- [x] T041 Verify TypeScript compilation passes with zero errors using `npm run build`
- [x] T042 Verify production build works using `npm run build` and test in `out/` directory
- [ ] T043 Check for hydration errors in browser console during navigation
- [ ] T044 Verify LocalStorage persistence across page reloads
- [ ] T045 Run through quickstart.md validation checklist
- [ ] T046 Update Copilot agent context if needed using update-agent-context.ps1

**Checkpoint**: All functionality preserved, zero regressions, ready to merge

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion - BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 3 completion (needs working useViewRouter)
- **Phase 5 (US3)**: Depends on Phase 4 completion (needs refactored page.tsx)
- **Phase 6 (Polish)**: Depends on Phase 5 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Implements the routing hook
- **User Story 2 (P2)**: Depends on US1 completion - Uses the routing hook in page.tsx
- **User Story 3 (P3)**: Depends on US2 completion - Documents the refactored code

**Note**: User stories are sequential in this feature because US2 depends on US1's routing hook, and US3 documents US2's refactored code. They cannot be parallelized.

### Within Each Phase

**Phase 1 (Setup)**:

- T001 and T002 can run in parallel (different directories/files)

**Phase 2 (Foundational)**:

- T003-T007 (type definitions) can all run in parallel - different type exports in same file
- T008 must wait for T003-T004 (needs ViewState and ViewKey types)
- T009 must wait for T007 (needs ViewRegistry interface)

**Phase 3 (US1)**:

- T010-T012 (hook structure) must be sequential
- T013-T018 (props mapping cases) can run sequentially or in small parallel batches
- T019 (exhaustiveness check) must be after all cases
- T020 (memoization) must be last

**Phase 4 (US2)**:

- T021 (useCallback wrappers) can be done first
- T022-T025 (state construction) must be sequential
- T026-T028 (JSX replacement) must be sequential

**Phase 5 (US3)**:

- T029-T032 (JSDoc comments) can all run in parallel - different files
- T033-T035 (cleanup) must be sequential

**Phase 6 (Polish)**:

- T036-T040 (manual tests) can run in parallel
- T041-T046 (verification) should be sequential

### Parallel Opportunities

```bash
# Phase 1: Both tasks can run simultaneously
Task: "Create src/routing/ directory"
Task: "Extract DefaultView component"

# Phase 2: All type definitions can run in parallel
Task: "Define ViewState in src/types/routing.ts"
Task: "Define ViewKey in src/types/routing.ts"
Task: "Define AppState in src/types/routing.ts"
Task: "Define component props interfaces in src/types/routing.ts"
Task: "Define ViewRegistry interface in src/types/routing.ts"

# Phase 5: All documentation can run in parallel
Task: "Add JSDoc to ViewState"
Task: "Add JSDoc to useViewRouter"
Task: "Add JSDoc to VIEW_COMPONENTS"
Task: "Add JSDoc to Home component"

# Phase 6: All manual tests can run in parallel
Task: "Test default view"
Task: "Test NORMAL flow"
Task: "Test NON-NORMAL flow"
Task: "Test RESETS flow"
Task: "Test item interactions"
```

---

## Implementation Strategy

### Sequential Implementation (Recommended)

This feature's user stories are inherently sequential:

1. **Phase 1: Setup** (30 min)
   - Create directory structure
   - Extract DefaultView component

2. **Phase 2: Foundational** (45 min)
   - Define all types and interfaces
   - Create component registry

3. **Phase 3: User Story 1** (60 min)
   - Implement useViewRouter hook
   - Verify all view combinations map correctly

4. **Phase 4: User Story 2** (45 min)
   - Refactor page.tsx to use routing
   - Replace nested conditionals

5. **Phase 5: User Story 3** (15 min)
   - Add documentation
   - Clean up code

6. **Phase 6: Polish** (30 min)
   - Comprehensive testing
   - Final validation

**Total Estimated Time**: 3 hours 45 minutes

### Validation Points

After each phase, verify:

- **Phase 1**: DefaultView component renders correctly
- **Phase 2**: All types compile without errors
- **Phase 3**: useViewRouter returns correct components for all states
- **Phase 4**: All navigation flows work identically to before
- **Phase 5**: Code is clean, documented, and lint-free
- **Phase 6**: Zero regressions, ready for production

---

## Success Criteria Mapping

Each user story maps to success criteria from spec.md:

### User Story 1 → SC-004

- **SC-004**: Developer comprehension improved (under 3 minutes to understand all views)
- **Delivered by**: T003-T009 (type definitions), T010-T020 (routing hook)
- **Verification**: Review ViewState type and VIEW_COMPONENTS - all combinations clear

### User Story 2 → SC-001, SC-003

- **SC-001**: Conditional rendering reduced to single routing lookup
- **SC-003**: Adding new view requires only routing config updates
- **Delivered by**: T021-T028 (page.tsx refactor)
- **Verification**: Zero nested conditionals in page.tsx, all views in registry

### User Story 3 → SC-006

- **SC-006**: Code review time reduced by 40%
- **Delivered by**: T029-T035 (documentation and cleanup)
- **Verification**: Git diff shows declarative routing changes vs conditional chaos

### All Stories → SC-002, SC-005

- **SC-002**: All views render identically
- **SC-005**: Zero regressions
- **Delivered by**: T036-T046 (comprehensive testing)
- **Verification**: Manual testing checklist passes completely

---

## Notes

- [P] tasks = different files or independent sections, can run in parallel
- [US1/US2/US3] labels map tasks to user stories for traceability
- No automated tests per project constraints (manual testing workflow established)
- TypeScript exhaustiveness checking provides compile-time verification
- Each checkpoint provides a validation point before proceeding
- Commit after completing each phase for clear git history
- Reference quickstart.md for detailed implementation guidance
