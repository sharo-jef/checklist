# Tasks: Exit Menu Button Component

**Feature Branch**: `004-exit-menu-component`  
**Input**: Design documents from `specs/004-exit-menu-component/`  
**Prerequisites**: ✅ plan.md, ✅ spec.md, ✅ research.md, ✅ data-model.md, ✅ contracts/ExitMenuButton.md, ✅ quickstart.md

**Tests**: Not requested - manual testing only per project constitution

**Organization**: Tasks grouped by user story for independent implementation

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verify development environment and branch status

- [x] T001 Verify branch `004-exit-menu-component` is checked out and clean
- [x] T002 Run `npm install` to ensure all dependencies are current
- [x] T003 Run `npm run lint` to establish baseline (should pass)

**Checkpoint**: Development environment ready

---

## Phase 2: Foundational

**Purpose**: No foundational work needed - feature is pure refactoring of existing UI

**Status**: ✅ SKIPPED - All required infrastructure already exists

**Rationale**:

- React/TypeScript/Tailwind setup already complete
- Component patterns established (TabButton.tsx exists as reference)
- No new dependencies, no schema changes, no shared services needed

**Checkpoint**: Ready to implement user stories (no blocking work)

---

## Phase 3: User Story 1 - Consistent Button Styling (Priority: P1) 🎯 MVP

**Goal**: Create reusable ExitMenuButton component so styling changes apply to all instances automatically

**Independent Test**: Modify component styling and verify all 3 menu contexts (NORMAL, NON-NORMAL, RESETS) display updated style consistently

### Implementation for User Story 1

- [x] T004 [US1] Create ExitMenuButton component in src/components/ExitMenuButton.tsx
- [x] T005 [US1] Replace Exit Menu button in NORMAL menu view in src/app/page.tsx (line ~340)
- [x] T006 [US1] Replace Exit Menu button in RESETS menu view in src/app/page.tsx (line ~363)
- [x] T007 [US1] Replace Exit Menu button in NON-NORMAL menu view in src/app/page.tsx (line ~378)
- [x] T008 [US1] Run `npm run lint` to verify TypeScript compilation
- [ ] T009 [US1] Run `npm run dev` and manually test NORMAL menu Exit button (click, hover, keyboard)
- [ ] T010 [US1] Manually test NON-NORMAL menu Exit button (click, hover, keyboard)
- [ ] T011 [US1] Manually test RESETS menu Exit button (click, hover, keyboard)
- [ ] T012 [US1] Verify styling consistency across all three contexts (visual inspection)

**Checkpoint**: Exit Menu button component created and all instances replaced. Styling updates now require only 1 edit. ✅ SC-001, SC-002, SC-003

---

## Phase 4: User Story 2 - Simplified Maintenance (Priority: P2)

**Goal**: Bug fixes and improvements in Exit Menu button require changing only one file

**Independent Test**: Introduce deliberate bug in component, verify all instances show bug, fix it, confirm all instances corrected

**Note**: This story is COMPLETED by User Story 1 implementation (same deliverable). Including verification tasks only.

### Verification for User Story 2

- [ ] T013 [US2] Count Exit Menu button code locations: should be 1 component + 3 usages (down from 3 duplicate blocks)
- [ ] T014 [US2] Verify all button-related code is in src/components/ExitMenuButton.tsx (single source of truth)
- [ ] T015 [US2] Test bug fix workflow: modify aria-label, verify change appears in all 3 contexts
- [ ] T016 [US2] Test accessibility improvement workflow: verify screen reader announces "Exit Menu, button" consistently

**Checkpoint**: Component consolidation verified. Maintenance now requires single-location edits. ✅ SC-002, SC-005

---

## Phase 5: User Story 3 - Code Review Efficiency (Priority: P3)

**Goal**: Code reviews show single component definition instead of 3 duplicate button blocks

**Independent Test**: Measure button definition locations before (3) and after (1) refactoring

**Note**: This story is COMPLETED by User Story 1 implementation (same deliverable). Including verification tasks only.

### Verification for User Story 3

- [ ] T017 [US3] Run `git diff master src/app/page.tsx` to verify duplicate button blocks removed
- [ ] T018 [US3] Count lines changed: should show ~45 lines removed (3×15 line button blocks), ~3 lines added (component usages)
- [ ] T019 [US3] Verify page.tsx imports ExitMenuButton from @/components/ExitMenuButton
- [ ] T020 [US3] Review component file structure: ExitMenuButtonProps interface + component function (~15 lines total)

**Checkpoint**: Code review improvement verified. Button code reduced from 3 locations to 1. ✅ SC-001, SC-004

---

## Phase 6: Final Verification & Polish

**Purpose**: Ensure all success criteria met and no regressions introduced

- [ ] T021 Run complete manual testing checklist from quickstart.md (all 3 menu contexts)
- [ ] T022 Test keyboard accessibility: Tab navigation, Enter/Space activation in all contexts
- [ ] T023 Verify no hydration errors in browser console during development
- [x] T024 Run `npm run build` to verify static export succeeds
- [ ] T025 Check build output in out/ directory for proper static files
- [ ] T026 Verify no ESLint errors or TypeScript compilation issues
- [ ] T027 Test hover effect (white border) appears consistently in all menu contexts
- [ ] T028 Verify button text displays as two lines ("EXIT" / "MENU") in all contexts
- [ ] T029 Confirm button meets 44px minimum touch target height (min-h-11)
- [ ] T030 (Optional) Test with screen reader to verify aria-label announcement

**Checkpoint**: All success criteria verified. Zero regressions. Ready for PR.

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← SKIPPED, no blocking work
    ↓
Phase 3 (US1) ← IMPLEMENTS all three user stories (same deliverable)
    ↓
Phase 4 (US2) ← Verification only (completed by US1)
    ↓
Phase 5 (US3) ← Verification only (completed by US1)
    ↓
Phase 6 (Final Verification)
```

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies - implements component and all replacements
- **User Story 2 (P2)**: Delivered by US1 - shares same component extraction deliverable
- **User Story 3 (P3)**: Delivered by US1 - shares same component extraction deliverable

**Rationale for Shared Deliverable**: All three user stories describe different benefits of the SAME refactoring action (extracting duplicate buttons into a component). They cannot be delivered independently because they're three perspectives on one change.

### Task Execution Flow

**Sequential (Recommended)**:

```
T001-T003 (Setup)
  ↓
T004 (Create component)
  ↓
T005-T007 (Replace 3 instances - can be done sequentially)
  ↓
T008-T012 (User Story 1 verification)
  ↓
T013-T016 (User Story 2 verification)
  ↓
T017-T020 (User Story 3 verification)
  ↓
T021-T030 (Final verification)
```

**Parallel Opportunities**: None in this feature

- All tasks modify the same files (page.tsx for T005-T007)
- Component creation (T004) blocks all replacement tasks
- Sequential execution ensures clean git commits per step

### Within Each Phase

**Phase 3 (User Story 1 - Core Implementation)**:

1. T004: Create component first (blocks all other tasks)
2. T005-T007: Replace instances sequentially (same file, avoid conflicts)
3. T008: Lint after all code changes
4. T009-T012: Manual testing after implementation complete

**Phase 4 & 5 (Verification Phases)**:

- Tasks verify what US1 already delivered
- Can be done sequentially or spot-checked

**Phase 6 (Final Verification)**:

- Comprehensive checklist before PR
- T021-T030 should be done sequentially in order listed

---

## Implementation Strategy

### MVP First (User Story 1 = Complete Feature)

This is a unique case where the MVP IS the complete feature:

1. **Phase 1**: Setup (T001-T003) - 2 minutes
2. **Phase 3**: Implement US1 (T004-T012) - 15 minutes
   - Create component
   - Replace all 3 instances
   - Verify functionality
3. **Phase 6**: Final checks (T021-T030) - 5 minutes

**Total Estimated Time**: 20-25 minutes for complete feature

**Why US1 = Complete Feature**:

- All user stories benefit from the SAME code change
- US2 (maintenance) and US3 (code review) are different benefits of US1's deliverable
- Cannot deliver US2 without US1, cannot deliver US1 without also delivering US2/US3

### Incremental Delivery (Not Applicable)

This feature cannot be delivered incrementally because:

- Either the component is extracted (all benefits realized) OR it isn't (zero benefits)
- No meaningful intermediate states between "3 duplicate buttons" and "1 reusable component"

### Single Developer Approach (Recommended)

Given the small scope (20-25 minutes, single file changes):

1. Complete T001-T003 (setup)
2. Create branch checkpoint: `git commit -am "chore: setup for exit menu button extraction"`
3. Execute T004-T007 (implementation): Create component + replace all instances
4. Commit: `git commit -am "feat: extract Exit Menu button into reusable component"`
5. Execute T008-T012 (US1 verification)
6. Execute T013-T020 (US2/US3 verification) - spot check
7. Execute T021-T030 (final verification)
8. Open PR

**Commit Strategy**: Single feature commit or 2 commits (setup + implementation)

---

## Task Details & File Paths

### T004: Create ExitMenuButton component

**File**: `src/components/ExitMenuButton.tsx` (NEW FILE)

**Content**:

```typescript
interface ExitMenuButtonProps {
  onClick: () => void;
}

export function ExitMenuButton({ onClick }: ExitMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Exit Menu"
      className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
    >
      {"EXIT\nMENU"}
    </button>
  );
}
```

**Reference**: See contracts/ExitMenuButton.md for complete component contract

---

### T005: Replace Exit Menu button in NORMAL menu view

**File**: `src/app/page.tsx`  
**Location**: Line ~340 (in NORMAL menu view conditional)

**Find**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <button
    onClick={handleExitMenu}
    className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
  >
    {"EXIT\nMENU"}
  </button>
</div>
```

**Replace with**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <ExitMenuButton onClick={handleExitMenu} />
</div>
```

**Don't forget**: Add import at top of file:

```tsx
import { ExitMenuButton } from "@/components/ExitMenuButton";
```

---

### T006: Replace Exit Menu button in RESETS menu view

**File**: `src/app/page.tsx`  
**Location**: Line ~363 (in RESETS menu view conditional)

**Find**: Same button JSX as T005  
**Replace with**: Same component usage as T005

---

### T007: Replace Exit Menu button in NON-NORMAL menu view

**File**: `src/app/page.tsx`  
**Location**: Line ~378 (in NON-NORMAL menu view conditional)

**Find**: Same button JSX as T005  
**Replace with**: Same component usage as T005

---

## Manual Testing Checklist (T021)

**Reference**: quickstart.md Step 5 for detailed checklist

### NORMAL Menu Exit Button

- [ ] Button appears (bottom right) after clicking NORMAL
- [ ] Text displays as "EXIT" (line 1) and "MENU" (line 2)
- [ ] Hover shows white border
- [ ] Click returns to main screen
- [ ] Tab key focuses button
- [ ] Enter key while focused returns to main screen

### NON-NORMAL Menu Exit Button

- [ ] Button appears (bottom right) after clicking NON-NORMAL
- [ ] Styling matches NORMAL menu button exactly
- [ ] Click returns to main screen
- [ ] All interactions match NORMAL menu behavior

### RESETS Menu Exit Button

- [ ] Button appears (bottom right) after clicking RESETS in top menu
- [ ] Styling matches other buttons exactly
- [ ] Click returns to main screen
- [ ] All interactions match other contexts

---

## Success Criteria Mapping

| Success Criterion                         | Verified By      | Status        |
| ----------------------------------------- | ---------------- | ------------- |
| SC-001: 3 instances → 1 component         | T013, T017       | After Phase 4 |
| SC-002: Styling updates in 1 location     | T012, T015       | After Phase 3 |
| SC-003: Identical rendering in 3 contexts | T012, T027       | After Phase 3 |
| SC-004: 60% reduced review time           | T017-T018        | After Phase 5 |
| SC-005: Zero regressions                  | T021, T024       | After Phase 6 |
| SC-006: Consistent accessibility          | T016, T022, T030 | After Phase 6 |

---

## Troubleshooting Guide

### Issue: TypeScript errors on onClick prop

**Task**: T008  
**Symptom**: `Type '() => void' is not assignable to type 'never'`  
**Cause**: Props interface missing or incorrect  
**Fix**: Ensure ExitMenuButtonProps interface is defined in T004

### Issue: Button styling looks different

**Task**: T012, T027  
**Symptom**: Colors, spacing, or hover effect don't match original  
**Cause**: className string doesn't match exactly  
**Fix**: Copy className from git history: `git show master:src/app/page.tsx | grep -A 5 "EXIT"`

### Issue: Build fails with module not found

**Task**: T024  
**Symptom**: `Cannot find module '@/components/ExitMenuButton'`  
**Cause**: File not at correct path or import path wrong  
**Fix**: Verify file is at `src/components/ExitMenuButton.tsx`, import uses `@/` alias

---

## Completion Checklist

Before marking feature complete:

- [ ] All tasks T001-T030 completed
- [ ] All 6 success criteria verified (SC-001 through SC-006)
- [ ] `npm run lint` passes with zero errors
- [ ] `npm run build` succeeds (static export works)
- [ ] Manual testing completed for all 3 menu contexts
- [ ] No hydration errors in browser console
- [ ] Git commit messages follow convention
- [ ] Ready to open pull request

---

## Time Estimates

**By Phase**:

- Phase 1 (Setup): 2 minutes
- Phase 2 (Foundational): 0 minutes (skipped)
- Phase 3 (US1 Implementation): 15 minutes
- Phase 4 (US2 Verification): 3 minutes
- Phase 5 (US3 Verification): 2 minutes
- Phase 6 (Final Verification): 5 minutes

**Total**: 20-25 minutes

**By Experience Level**:

- Senior React developer: 15-20 minutes
- Mid-level developer: 20-30 minutes
- Junior developer: 30-45 minutes (includes learning component patterns)

---

## Reference Documentation

- **Feature Spec**: `specs/004-exit-menu-component/spec.md`
- **Implementation Plan**: `specs/004-exit-menu-component/plan.md`
- **Component Contract**: `specs/004-exit-menu-component/contracts/ExitMenuButton.md`
- **Research Notes**: `specs/004-exit-menu-component/research.md`
- **Data Model**: `specs/004-exit-menu-component/data-model.md`
- **Quick Start Guide**: `specs/004-exit-menu-component/quickstart.md`

---

**Last Updated**: 2025-11-20  
**Status**: Ready for implementation  
**Estimated Completion**: 20-25 minutes
