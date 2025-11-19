# Implementation Plan: Replace Magic Values with Named Constants

**Branch**: `006-eliminate-magic-values` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-eliminate-magic-values/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature eliminates magic numbers and strings by replacing them with descriptive named constants. Primary targets:

- `". ".repeat(400)` → `DOTTED_SEPARATOR_REPEATS` (aviation checklist dotted line aesthetic)
- `setTimeout(..., 0)` → `queueMicrotask()` (aligning with existing hydration-safe pattern)
- `setTimeout(..., 1000)` → `RESET_MENU_EXIT_DELAY_MS` (post-reset auto-exit timing)

**Technical Approach**: Create a new `src/constants/ui.ts` module for shared UI constants. Constants will use TypeScript const assertions (`as const`) for type safety. This is a refactoring-only change with zero functional or visual impact—purely improving code readability and maintainability.

## Technical Context

**Language/Version**: TypeScript 5.x with React 19.2.0  
**Primary Dependencies**: Next.js 16.0.3, Tailwind CSS 4.x, React Compiler 1.0.0  
**Storage**: LocalStorage (client-side only, no server-side persistence)  
**Testing**: Manual testing (no automated test framework currently)  
**Target Platform**: Static export for GitHub Pages deployment (mobile-first, browser-based)  
**Project Type**: Single web application with static export  
**Performance Goals**: 60fps UI interactions, instant client-side state updates  
**Constraints**: Static export only (no server runtime), hydration-safe (SSR compatible), offline-capable via LocalStorage  
**Scale/Scope**: Small application (~20 files), 3 checklist categories, mobile-first UX

**Magic Values Identified**:

- `". ".repeat(400)` in `ChecklistItem.tsx` - dotted separator line
- `setTimeout(..., 0)` in `page.tsx` (2 occurrences) - active item index updates
- `setTimeout(..., 1000)` in `ResetsMenu.tsx` - post-reset menu exit delay

**Existing Patterns**:

- `queueMicrotask()` used in `useChecklist.ts` for hydration safety
- CSS variables in `globals.css` for theming (`--text-green`, `--text-cyan`, etc.)
- Type-safe enums in `types/checklist.ts` for constants (`MenuType`, `ChecklistItemStatus`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### I. Static-First Architecture ✅

**Status**: PASS  
**Evaluation**: This feature only refactors existing code to use named constants instead of magic values. No server-side dependencies introduced. All changes are compile-time transformations that don't affect the static export model.

### II. Hydration Safety ✅

**Status**: PASS  
**Evaluation**: Feature improves hydration safety by standardizing on `queueMicrotask()` instead of `setTimeout(..., 0)`. Named constants don't affect hydration behavior. No LocalStorage access during initial render introduced.

### III. Immutable Data Definitions ✅

**Status**: PASS  
**Evaluation**: Constants are compile-time values that don't modify runtime state. Checklist definitions in `checklists.ts` remain immutable. No changes to `itemStates` separation pattern.

### IV. LocalStorage Versioning & Migration ✅

**Status**: PASS  
**Evaluation**: No LocalStorage schema changes required. This is a code quality improvement with zero data model impact. Storage version remains at 2.0.0.

### V. Aviation-Inspired UX Consistency ✅

**Status**: PASS  
**Evaluation**: Constants will document existing UX patterns (e.g., `DOTTED_SEPARATOR_REPEATS`, `RESET_MENU_EXIT_DELAY`). No visual or interaction changes. Preserves dotted separator aesthetic, color semantics, and timing behaviors exactly.

### VI. Type Safety & Path Aliases ✅

**Status**: PASS  
**Evaluation**: Constants will be defined with TypeScript const assertions or readonly modifiers. All imports will use `@/` path aliases. Strict mode enforcement continues unchanged.

### Overall Gate Status: **PASS** ✅

No constitution violations. Feature is a pure code quality improvement that strengthens maintainability without affecting architecture, UX, or data model.

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
├── constants/          # NEW: Shared constants module
│   └── ui.ts          # UI-related constants (separator, timing)
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx       # MODIFIED: Use constants for timing
├── components/
│   ├── ChecklistItem.tsx   # MODIFIED: Use separator constant
│   └── ResetsMenu.tsx      # MODIFIED: Use timing constant
├── data/
│   └── checklists.ts
├── hooks/
│   ├── useChecklist.ts
│   └── useLocalStorage.ts
├── types/
│   └── checklist.ts
└── utils/
    └── storage.ts
```

**Structure Decision**: Single web application structure (Option 1 from template). New `src/constants/` directory added for shared constants following the existing `src/` modular organization. Component-specific constants may be defined at the top of component files if they're truly local; widely-used values go in `constants/ui.ts`.

---

_Note: Complexity Tracking section omitted - no constitution violations present._
