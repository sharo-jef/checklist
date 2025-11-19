---
description: "Task list for Replace Magic Values with Named Constants feature"
---

# Tasks: Replace Magic Values with Named Constants

**Input**: Design documents from `/specs/006-eliminate-magic-values/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not requested in feature specification - manual verification only

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create constants module for shared UI values

- [x] T001 Create directory `src/constants/` for shared constants module
- [x] T002 Create file `src/constants/ui.ts` with JSDoc comments and exports structure

---

## Phase 2: User Story 1 - Understanding Value Purpose (Priority: P1) 🎯 MVP

**Goal**: Replace magic values with descriptive constants so developers immediately understand their purpose

**Independent Test**: Code reviewers can understand constant purposes without additional context. All magic values have semantic names.

### Implementation for User Story 1

- [x] T003 [P] [US1] Define `DOTTED_SEPARATOR_REPEATS = 400 as const` in `src/constants/ui.ts` with JSDoc explaining aviation checklist aesthetic
- [x] T004 [P] [US1] Define `RESET_MENU_EXIT_DELAY_MS = 1000 as const` in `src/constants/ui.ts` with JSDoc explaining user feedback duration
- [x] T005 [US1] Add import statement for `DOTTED_SEPARATOR_REPEATS` in `src/components/ChecklistItem.tsx`
- [x] T006 [US1] Replace `". ".repeat(400)` with `". ".repeat(DOTTED_SEPARATOR_REPEATS)` in `src/components/ChecklistItem.tsx` (around line 63)
- [x] T007 [US1] Add import statement for `RESET_MENU_EXIT_DELAY_MS` in `src/components/ResetsMenu.tsx`
- [x] T008 [US1] Replace `setTimeout(..., 1000)` with `setTimeout(..., RESET_MENU_EXIT_DELAY_MS)` in `src/components/ResetsMenu.tsx` (around line 38)

**Verification**:

```bash
npm run lint  # Should pass with 0 errors
npm run dev   # Verify dotted separator looks identical
# Test reset menu - should still exit after ~1 second
```

**Checkpoint**: Constants module created and used in 2 components. Code is now self-documenting.

---

## Phase 3: User Story 2 - Changing Shared Values Consistently (Priority: P2)

**Goal**: Centralize shared values so changing them requires updating only one location

**Independent Test**: Modify a constant value and verify all usages reflect the change without individual edits

### Implementation for User Story 2

- [x] T009 [US2] Replace first `setTimeout(() => { ... }, 0)` with `queueMicrotask(() => { ... })` in `handleItemToggle` function in `src/app/page.tsx` (around line 227)
- [x] T010 [US2] Replace second `setTimeout(() => { ... }, 0)` with `queueMicrotask(() => { ... })` in `handleItemOverride` function in `src/app/page.tsx` (around line 269)

**Verification**:

```bash
npm run lint  # Should pass
npm run dev
# Test checkbox toggle - border should still advance to next unchecked item
# Test ITEM OVRD button - border should still advance correctly
```

**Checkpoint**: All timing patterns consistent with existing `useChecklist.ts` hydration-safe pattern. No direct setTimeout(..., 0) calls remain.

---

## Phase 4: User Story 3 - Code Review and Maintenance (Priority: P3)

**Goal**: Make code changes self-documenting through semantic constant names

**Independent Test**: Code diffs involving constants are understandable without additional clarification

### Implementation for User Story 3

- [x] T011 [US3] Run full build verification with `npm run build` to ensure static export succeeds
- [ ] T012 [US3] Perform comprehensive manual testing per `quickstart.md` verification checklist
- [ ] T013 [US3] Update `.github/copilot-instructions.md` to reference new constants module pattern (optional documentation improvement)

**Verification**:

```bash
npm run build  # Should complete successfully
# Manual test all checklist flows:
# - PRE-DRIVE checklist item toggling
# - ITEM OVRD and CHKL OVRD buttons
# - NORMAL and NON-NORMAL menu navigation
# - RESETS menu (all 3 options)
# - Verify no visual regressions
# - Check browser console for errors
```

**Checkpoint**: All user stories complete. Zero regressions. Code is more maintainable and self-documenting.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup (Phase 1) completion
- **User Story 2 (Phase 3)**: Can start after Setup - independent of US1 (different files)
- **User Story 3 (Phase 4)**: Depends on US1 and US2 completion (verification phase)

### User Story Dependencies

- **User Story 1 (P1)**: Creates constants module and replaces magic values in 2 components
  - T003-T004 can run in parallel (both add to same file but different constants)
  - T005-T006 must be sequential (import before use in ChecklistItem)
  - T007-T008 must be sequential (import before use in ResetsMenu)
  - T005-T008 can run after T003-T004 are complete
- **User Story 2 (P2)**: Refactors timing pattern in page.tsx
  - Independent of US1 (different file)
  - T009-T010 are in same file but different functions - can be done sequentially or as single commit
- **User Story 3 (P3)**: Verification and documentation
  - Depends on US1 and US2 completion
  - T011-T013 should run sequentially (build → test → document)

### Parallel Opportunities

```bash
# After Phase 1 (Setup) completes:

# Parallel Stream 1 (US1 - Constants):
Task T003: Define DOTTED_SEPARATOR_REPEATS
Task T004: Define RESET_MENU_EXIT_DELAY_MS
↓
Task T005-T006: Update ChecklistItem.tsx
Task T007-T008: Update ResetsMenu.tsx

# Parallel Stream 2 (US2 - Timing):
Task T009-T010: Refactor page.tsx timing
```

If you have multiple developers:

- Developer A: Phase 1 → US1 (T001-T008)
- Developer B: Phase 1 → US2 (T009-T010) - can start immediately after Phase 1
- Both merge, then either tackles US3 verification

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: User Story 1 (T003-T008)
3. **STOP and VALIDATE**:
   - Run `npm run lint`
   - Run `npm run dev` and test dotted separator
   - Test reset menu timing
4. Deploy/commit if satisfied with US1

**Deliverable**: Constants module introduced, 2 magic values replaced with semantic names

### Incremental Delivery

1. Phase 1 (Setup) → Constants module structure ready
2. Phase 2 (US1) → Test independently → Commit ("feat: add constants module with UI values")
3. Phase 3 (US2) → Test independently → Commit ("refactor: standardize timing with queueMicrotask")
4. Phase 4 (US3) → Full verification → Commit ("docs: update instructions for constants pattern")

Each phase adds value and can be committed independently.

### Full Feature Strategy

Complete all phases sequentially:

1. T001-T002 (Setup)
2. T003-T008 (US1 - Constants)
3. T009-T010 (US2 - Timing)
4. T011-T013 (US3 - Verification)
5. Single PR with all changes

**Estimated Total Time**: 30 minutes (per quickstart.md)

---

## Task Summary

**Total Tasks**: 13  
**By User Story**:

- Setup: 2 tasks
- User Story 1 (P1): 6 tasks
- User Story 2 (P2): 2 tasks
- User Story 3 (P3): 3 tasks

**Parallel Opportunities**: 2 tasks can run in parallel (T003-T004)

**Independent Test Criteria**:

- US1: Constants are self-documenting (code reviewers understand purpose)
- US2: Single-location updates propagate everywhere (change constant, all usages update)
- US3: Diffs involving constants are clear without clarification

**MVP Scope**: Phase 1 + Phase 2 (User Story 1) = 8 tasks, ~15-20 minutes

---

## Verification Checklist

After completing all tasks:

### Type Safety ✅

```bash
npm run lint  # Must pass with 0 errors
```

### Build Verification ✅

```bash
npm run build  # Must complete successfully
# Check out/ directory exists with static export
```

### Manual Testing ✅

- [ ] Dotted separator line looks identical in all checklist items
- [ ] Reset menu still exits after ~1 second
- [ ] Active item border still highlights first unchecked item
- [ ] Checkbox toggle advances border correctly
- [ ] ITEM OVRD button advances border correctly
- [ ] CHKL OVRD overrides all items correctly
- [ ] NORMAL ↔ NON-NORMAL menu switching works
- [ ] No console errors in browser DevTools

### Success Criteria Validation ✅

- [ ] **SC-001**: All `". ".repeat(400)` replaced with `DOTTED_SEPARATOR_REPEATS` ✅
- [ ] **SC-002**: All `setTimeout(..., 0)` replaced with `queueMicrotask()` ✅
- [ ] **SC-003**: Constant names are self-documenting ✅
- [ ] **SC-005**: Zero regressions in application behavior ✅
- [ ] **SC-006**: Shared values centralized in single location ✅

---

## Notes

- All tasks are low-risk refactoring operations
- No new features added - purely code quality improvement
- 100% functional parity required (zero visual/behavioral changes)
- Each constant MUST have JSDoc explaining its purpose
- Use `@/constants/ui` import path (not relative paths)
- Commit after each user story phase for clean git history
- If issues arise, rollback is simple (revert commits, no data migration)
