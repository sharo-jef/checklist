# Implementation Plan: Extract Business Logic from Page Component

**Branch**: `003-extract-page-logic` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-extract-page-logic/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the 450-line `page.tsx` component by extracting business logic into custom hooks and pure utility functions. This improves code organization, testability, and reusability while maintaining 100% functional parity with existing checklist behaviors. Target reduction: 30%+ LOC in page component.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19.2.0  
**Primary Dependencies**: Next.js 16.0.3, React 19.2.0, Tailwind CSS 4.x  
**Storage**: LocalStorage (client-side only, version 2.0.0 schema)  
**Testing**: Manual testing (no automated test suite currently)  
**Target Platform**: Static export for GitHub Pages, mobile-first (iOS/Android browsers)  
**Project Type**: Web application (Next.js static site)  
**Performance Goals**: Instant UI responses (<16ms for 60fps), sub-100ms state updates  
**Constraints**: Static-only export, hydration-safe state management, offline-capable  
**Scale/Scope**: Single-page app, ~450 LOC in page.tsx (target: <300), 3-5 extractable logic pieces

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Static-First Architecture ✅ PASS

**Rule**: The application MUST be deployable as a static export with no server-side runtime dependencies.

**Assessment**: This refactoring maintains static export compatibility. All extracted logic will remain client-side only with no server components or API routes.

**Impact**: None - purely client-side code reorganization.

### II. Hydration Safety (NON-NEGOTIABLE) ✅ PASS

**Rule**: Server-rendered HTML and initial client render MUST match exactly to prevent hydration mismatches.

**Assessment**: Extracted hooks will maintain existing hydration patterns from `useChecklist.ts`. State initialization will remain empty with `useEffect` + `queueMicrotask` for LocalStorage loading.

**Impact**: None - refactoring preserves existing hydration-safe patterns.

### III. Immutable Data Definitions ✅ PASS

**Rule**: Checklist definitions in `src/data/checklists.ts` MUST remain immutable at runtime.

**Assessment**: Extracted utilities will operate on runtime state (`itemStates`), not definition data. No mutations to `checklists.ts`.

**Impact**: None - logic already separates definition from state.

### IV. LocalStorage Versioning & Migration ✅ PASS

**Rule**: All LocalStorage schema changes MUST include version increments and migration logic.

**Assessment**: No schema changes required. This is pure code reorganization with identical state management.

**Impact**: None - no storage schema modifications.

### V. Aviation-Inspired UX Consistency ✅ PASS

**Rule**: UI patterns MUST maintain aviation digital checklist aesthetics and interaction paradigms.

**Assessment**: Refactoring is internal only. No UI changes, color changes, or interaction changes.

**Impact**: None - 100% functional parity required.

### VI. Type Safety & Path Aliases ✅ PASS

**Rule**: All code MUST use TypeScript strict mode with `@/` path aliases.

**Assessment**: Extracted hooks and utilities will use strict TypeScript with proper types from `@/types/checklist`. All imports will use `@/` aliases.

**Impact**: None - existing patterns maintained.

### Summary: ALL GATES PASSED ✅

No constitution violations. This is a safe refactoring that improves code organization while maintaining all architectural principles.

## Project Structure

### Documentation (this feature)

```text
specs/003-extract-page-logic/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── extracted-api.md # API contracts for new hooks and utilities
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── page.tsx                    # MODIFIED: Reduced from 450 to <300 LOC
│   └── ...                         # (other app files unchanged)
├── components/                      # (unchanged)
├── data/                            # (unchanged)
├── hooks/
│   ├── useChecklist.ts             # (unchanged - already extracts state logic)
│   ├── useChecklistNavigation.ts   # NEW: Navigation logic (next/hasNext/firstUnchecked)
│   └── useLocalStorage.ts          # (unchanged)
├── types/
│   └── checklist.ts                # (unchanged)
└── utils/
    ├── checklist.ts                # (unchanged - pure status utilities)
    ├── navigation.ts               # NEW: Pure navigation utilities
    ├── storage.ts                  # (unchanged)
    └── transitions.ts              # (unchanged)
```

**Structure Decision**: Next.js web application (Option 2 frontend-only). Extracted logic will be placed in:

- **Custom hooks** (`hooks/`) for stateful logic tied to React lifecycle
- **Pure utilities** (`utils/`) for stateless computations

This follows existing project conventions where `useChecklist` manages state and `checklist.ts` provides pure utilities.

## Complexity Tracking

> **No violations to track** - All Constitution gates passed. This refactoring introduces no new complexity.

---

## Phase 0: Research & Outline ✅ COMPLETE

**Output**: [research.md](./research.md)

**Key Findings**:

- Hook vs Utility decision criteria established
- Navigation patterns researched (memoized derived state recommended)
- Dependency injection pattern selected
- Testing strategies documented
- Circular dependency prevention via layered architecture

**Status**: All unknowns resolved. No NEEDS CLARIFICATION markers remain.

---

## Phase 1: Design & Contracts ✅ COMPLETE

**Outputs**:

- [data-model.md](./data-model.md) - Type definitions and data structures
- [contracts/extracted-api.md](./contracts/extracted-api.md) - API contracts for utilities
- [quickstart.md](./quickstart.md) - Developer guide for usage
- Agent context updated (Copilot instructions)

**Design Decisions**:

1. **Create `src/utils/navigation.ts`** with 3 pure utilities:
   - `getFirstUncheckedIndex()` - Find first unchecked item
   - `getNextIncompleteChecklist()` - Find next incomplete checklist
   - `hasNextChecklist()` - Check if next checklist exists

2. **Optional: `src/hooks/useChecklistNavigation.ts`**
   - Deferred - only extract if logic is reused elsewhere
   - Current approach: pure utilities + `useMemo` in component

3. **Modify `src/app/page.tsx`**
   - Replace inline functions with utility calls
   - Add `useMemo` for navigation computations
   - Target: Reduce from 450 to <300 LOC (33%+ reduction)

### Post-Design Constitution Re-Check ✅

**Re-evaluated all gates after design phase:**

#### I. Static-First Architecture ✅ PASS

- No server-side dependencies introduced
- All utilities are pure client-side functions
- Static export compatibility maintained

#### II. Hydration Safety ✅ PASS

- Utilities are stateless (no hydration concerns)
- `useMemo` usage follows existing patterns
- No LocalStorage access during render (handled by useChecklist)

#### III. Immutable Data Definitions ✅ PASS

- All utilities read from `checklistData` without mutations
- `itemStates` is read-only in utilities
- Separation of definition and runtime state maintained

#### IV. LocalStorage Versioning & Migration ✅ PASS

- No schema changes in design
- Storage management remains in `useChecklist` and `utils/storage.ts`
- No new storage keys or data structures

#### V. Aviation-Inspired UX Consistency ✅ PASS

- No UI changes in design
- 100% functional parity guaranteed by design
- Color semantics, interaction patterns unchanged

#### VI. Type Safety & Path Aliases ✅ PASS

- All utilities strictly typed (no `any` types)
- Return types explicit (`number`, `string | null`, `boolean`)
- All imports use `@/` path aliases
- Edge cases return type-safe defaults

**Final Verdict**: All constitution gates pass after design. Safe to proceed to implementation.

---

## Phase 2: Planning Complete - Ready for Implementation

**Command completes here** - The `/speckit.plan` command generates planning artifacts, not implementation.

**Next Steps (separate command)**:

- Run `/speckit.tasks` to generate implementation task breakdown
- Execute tasks to implement the design
- Verify 100% functional parity via manual testing
- Measure LOC reduction (target: 30%+)

**Artifacts Generated**:

- ✅ research.md (Phase 0)
- ✅ data-model.md (Phase 1)
- ✅ contracts/extracted-api.md (Phase 1)
- ✅ quickstart.md (Phase 1)
- ✅ plan.md (this file - complete)
- ⏸️ tasks.md (Phase 2 - generate with `/speckit.tasks`)

**Branch Status**: `003-extract-page-logic`  
**Implementation Plan Path**: `C:\Users\sharo\ghq\github.com\sharo-jef\checklist\specs\003-extract-page-logic\plan.md`

---

## Summary

**Feature**: Extract Business Logic from Page Component  
**Approach**: Pure utility functions + memoized consumption in component  
**Impact**: 30%+ LOC reduction, improved testability and reusability  
**Risk**: Low - pure code reorganization with no architectural changes  
**Constitution Compliance**: 100% - all gates passed pre and post design

**Planning Phase Complete** ✅
