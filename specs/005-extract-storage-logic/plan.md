# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extract all direct LocalStorage operations from the `useChecklist` hook into dedicated storage utility functions in `utils/storage.ts`. This refactoring separates business logic (state management, checklist navigation) from persistence concerns (data serialization, migration, storage access), enabling independent testing and evolution of each layer.

## Technical Context

**Language/Version**: TypeScript 5.x with strict mode enabled  
**Primary Dependencies**: React 19.2.0, Next.js 16.0.3 (static export)  
**Storage**: Browser LocalStorage (client-side only, key: "checklist-state")  
**Testing**: Manual testing only (no automated test suite currently)  
**Target Platform**: Modern browsers (ES2017+), primary use case is mobile devices  
**Project Type**: Web application (Next.js static site with client-only state)  
**Performance Goals**: <50ms for storage operations, <100ms for state hydration  
**Constraints**: Static export only (no server runtime), offline-capable, hydration-safe (server/client render match)  
**Scale/Scope**: Single-user application, ~10-20 checklists, ~200 total items, LocalStorage data <50KB

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ I. Static-First Architecture

**Status**: COMPLIANT

This refactoring maintains static export compatibility. All storage operations remain client-side using LocalStorage. No server components or API routes are introduced. The separation of storage utilities does not affect the static export model.

### ✅ II. Hydration Safety (NON-NEGOTIABLE)

**Status**: COMPLIANT

The current useChecklist hook already follows the hydration-safe pattern with `useEffect` + `queueMicrotask` for LocalStorage loading. This refactoring will preserve this pattern - storage utilities will be called from the same `useEffect` hook, maintaining exact server/client render matching.

**Critical preservation**: The `setItemStates({})` empty initial state and deferred loading via `useEffect` + `queueMicrotask` MUST remain unchanged in the hook.

### ✅ III. Immutable Data Definitions

**Status**: COMPLIANT

This feature does not modify checklist definitions in `checklists.ts`. It only refactors how runtime state (`itemStates`) is persisted to LocalStorage. The separation of storage utilities reinforces the boundary between immutable definitions and mutable runtime state.

### ✅ IV. LocalStorage Versioning & Migration

**Status**: COMPLIANT

Storage utilities already handle versioning (current: v2.0.0) and migration logic in `storage.ts`. This refactoring will consolidate migration responsibilities within storage utilities, making version management more explicit and testable.

**Enhancement opportunity**: Extracting storage logic enables easier testing of migration paths and version handling.

### ✅ V. Aviation-Inspired UX Consistency

**Status**: NOT APPLICABLE

This is a pure internal refactoring with no UI changes. All aviation UX patterns (colors, fonts, active item behavior, override functionality) remain untouched.

### ✅ VI. Type Safety & Path Aliases

**Status**: COMPLIANT

All storage utilities use TypeScript strict mode and proper type definitions from `@/types/checklist`. The refactoring will maintain type safety by using existing interfaces (`StoredData`, `ChecklistItemStatus`) and adding new utility function signatures with explicit types.

### Summary

**GATE STATUS**: ✅ PASS - No constitutional violations. This refactoring aligns with constitution principles by improving code organization without affecting core architectural constraints.

---

### Post-Design Re-evaluation

**Date**: 2025-11-20  
**Phase**: After Phase 1 design completion

All constitutional principles remain compliant after completing the design phase:

1. **New functions added**: `resetChecklistInStorage`, `resetCategoriesInStorage`, `resetAllStorage` - all pure functions returning boolean, no server dependencies
2. **API contracts defined**: All functions use existing types from `@/types/checklist`, maintaining type safety
3. **Hydration pattern preserved**: Documentation in quickstart.md explicitly reinforces the `useEffect` + `queueMicrotask` pattern
4. **No new dependencies**: Research confirmed using only native browser APIs and existing TypeScript/React tooling
5. **Storage versioning maintained**: Migration logic remains in place, no schema changes in this feature

**FINAL GATE STATUS**: ✅ PASS - No constitutional violations detected in design. Safe to proceed to implementation phase.

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
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx           # Main checklist page (uses useChecklist hook)
├── components/
│   ├── CheckIcon.tsx
│   ├── ChecklistDisplay.tsx
│   ├── ChecklistItem.tsx
│   ├── ChecklistMenu.tsx
│   ├── ChecklistStatusBanner.tsx
│   ├── ResetsMenu.tsx
│   ├── TabButton.tsx
│   ├── TabNavigation.tsx
│   └── TopMenu.tsx
├── data/
│   └── checklists.ts      # Immutable checklist definitions
├── hooks/
│   ├── useChecklist.ts    # [REFACTOR TARGET] Business logic hook
│   └── useLocalStorage.ts
├── types/
│   └── checklist.ts       # TypeScript type definitions
└── utils/
    └── storage.ts         # [ENHANCEMENT TARGET] Storage utilities

tests/                     # Currently: manual testing only
```

**Structure Decision**: This is a Next.js single-project web application. The refactoring focuses on two files:

1. **`src/hooks/useChecklist.ts`**: Remove all direct `localStorage` API calls and replace with calls to storage utility functions
2. **`src/utils/storage.ts`**: Enhance existing utilities to handle all storage operations currently performed in useChecklist (reset operations, batch updates, category filtering)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. This section is intentionally empty.
