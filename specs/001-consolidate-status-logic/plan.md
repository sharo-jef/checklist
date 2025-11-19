# Implementation Plan: Consolidate Item Status Checking Logic

**Branch**: `001-consolidate-status-logic` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)  
**Status**: ✅ Complete - Ready for Implementation

**Planning Phases**:

- ✅ Phase 0: Research (research.md)
- ✅ Phase 1: Design (data-model.md, contracts/, quickstart.md)
- ✅ Phase 2: Task Breakdown (tasks.md)

**Next Step**: Begin implementation following [tasks.md](./tasks.md)

## Summary

Consolidate duplicate item completion checking logic scattered across `page.tsx`, `ChecklistMenu.tsx`, and `ChecklistDisplay.tsx` into a single utility function. The duplicate logic checks if an item status is `checked`, `overridden`, or `checked-overridden` to determine completion. This refactoring improves maintainability by creating a single source of truth for completion status determination, reducing code duplication from 3+ locations to 1 centralized function in the data utilities layer.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19.2.0 and Next.js 16.0.3  
**Primary Dependencies**: Next.js (static export), React 19, Tailwind CSS 4.x, React Compiler  
**Storage**: Client-side LocalStorage only (no backend/database)  
**Testing**: Manual testing workflow (no automated test suite currently)  
**Target Platform**: Static web export for GitHub Pages deployment at `/checklist` basePath, optimized for mobile browsers  
**Project Type**: Web application (single-page, client-only, static export)  
**Performance Goals**: Instant client-side status checks (<1ms), no network latency dependencies  
**Constraints**: Static-first architecture (no server runtime), hydration safety required, must work offline, mobile-optimized touch interface  
**Scale/Scope**: Small codebase (~400 LOC in page.tsx), 3 components with duplicate logic, 4 status types, single-user local state management

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ I. Static-First Architecture

**Status**: COMPLIANT  
**Verification**: Feature only adds utility functions for client-side status checking. No server dependencies introduced. Static export compatibility maintained.

### ✅ II. Hydration Safety

**Status**: COMPLIANT  
**Verification**: Refactoring pure logic functions does not affect hydration flow. Status checking occurs after LocalStorage data is loaded in `useEffect`. No SSR/client mismatch risk.

### ✅ III. Immutable Data Definitions

**Status**: COMPLIANT  
**Verification**: Feature operates on runtime `itemStates` only. Checklist definitions in `checklists.ts` remain untouched. Separation of definition and state preserved.

### ✅ IV. LocalStorage Versioning & Migration

**Status**: COMPLIANT  
**Verification**: No LocalStorage schema changes required. Feature refactors read logic only, no new storage fields or version bump needed.

### ✅ V. Aviation-Inspired UX Consistency

**Status**: COMPLIANT  
**Verification**: Refactoring internal logic does not affect UI presentation. Color coding, status semantics (green for checked, cyan for overridden) remain unchanged.

### ✅ VI. Type Safety & Path Aliases

**Status**: COMPLIANT  
**Verification**: New utility function will use strict TypeScript types (`ChecklistItemStatus`). Will be placed in `utils/` directory and imported via `@/` alias.

### 🔍 Additional Considerations

- **Function Location**: Utility function should be placed in `src/utils/checklist.ts` (new file) or `src/utils/storage.ts` (existing). Decision needed in Phase 0.
- **Function Naming**: Must follow aviation checklist terminology and clear intent (e.g., `isItemComplete`, `checkItemCompleted`).
- **Edge Case Handling**: Must document behavior for `null`, `undefined`, and unknown status values.

**GATE RESULT**: ✅ **PASS** - No constitutional violations. Feature aligns with all core principles.

---

## Post-Design Constitution Re-Evaluation

_Performed after Phase 1 completion (2025-11-19)_

### ✅ I. Static-First Architecture

**Status**: VERIFIED COMPLIANT  
**Evidence**: Design creates pure utility functions in `utils/checklist.ts` with no server dependencies. Functions are stateless and work entirely client-side.

### ✅ II. Hydration Safety

**Status**: VERIFIED COMPLIANT  
**Evidence**: Pure functions have no effect on hydration cycle. Components continue to load LocalStorage data in `useEffect` as before. No SSR/client rendering differences introduced.

### ✅ III. Immutable Data Definitions

**Status**: VERIFIED COMPLIANT  
**Evidence**: Utility functions accept status as input, return boolean. No mutations of checklist definitions or state. Data model document confirms no schema changes.

### ✅ IV. LocalStorage Versioning & Migration

**Status**: VERIFIED COMPLIANT  
**Evidence**: No LocalStorage schema changes. Storage version remains `2.0.0`. No migration code needed.

### ✅ V. Aviation-Inspired UX Consistency

**Status**: VERIFIED COMPLIANT  
**Evidence**: Refactoring preserves all UI behaviors. Green/cyan color semantics maintained. Function names use aviation terminology ("complete" not "done").

### ✅ VI. Type Safety & Path Aliases

**Status**: VERIFIED COMPLIANT  
**Evidence**: Contract specifies strict TypeScript types. Functions use `ChecklistItemStatus` type. Import via `@/utils/checklist` path alias. Handles null/undefined safely.

**FINAL GATE RESULT**: ✅ **PASS** - Design maintains full constitutional compliance. Ready for implementation.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/                  # Next.js pages and layouts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx         # Main checklist orchestrator (REFACTOR TARGET)
├── components/           # React components
│   ├── CheckIcon.tsx
│   ├── ChecklistDisplay.tsx   # Display component (REFACTOR TARGET)
│   ├── ChecklistItem.tsx
│   ├── ChecklistMenu.tsx      # Menu component (REFACTOR TARGET)
│   ├── ChecklistStatusBanner.tsx
│   ├── ResetsMenu.tsx
│   ├── TabButton.tsx
│   ├── TabNavigation.tsx
│   └── TopMenu.tsx
├── data/                 # Static checklist definitions
│   └── checklists.ts    # Immutable checklist data
├── hooks/                # Custom React hooks
│   ├── useChecklist.ts  # State management hook
│   └── useLocalStorage.ts
├── types/                # TypeScript type definitions
│   └── checklist.ts     # ChecklistItemStatus type definition
└── utils/                # Pure utility functions
    └── storage.ts       # LocalStorage operations (POTENTIAL NEW FUNCTION LOCATION)
```

**Structure Decision**: This is a single web application using Next.js with static export. The feature will add a new utility function to the `utils/` directory (either in a new `utils/checklist.ts` file or added to existing `utils/storage.ts`). The three refactor targets are:

1. `src/app/page.tsx` - Uses duplicate status checking in `isComplete` lambda (lines 78-84) and next checklist logic (lines 137-142)
2. `src/components/ChecklistMenu.tsx` - Uses duplicate logic in `isChecklistComplete` function (lines 35-41)
3. `src/components/ChecklistDisplay.tsx` - Uses duplicate logic in `allItemsChecked` calculation (lines 36-43)

## Complexity Tracking

**No violations to justify** - This feature is fully compliant with all constitutional principles.
