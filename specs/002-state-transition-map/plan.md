# Implementation Plan: Simplify State Transition Logic with Transition Map

**Branch**: `002-state-transition-map` | **Date**: 2025-11-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-state-transition-map/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor complex state transition logic in `handleToggleItem` and `handleItemOverride` functions (currently 70+ lines of nested conditionals) into a declarative state transition map pattern. This will improve code maintainability, enable easy addition of new status types, and reduce cognitive load for code reviewers by centralizing all state transitions in a single, readable data structure.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.3 and React 19.2.0  
**Primary Dependencies**: Next.js (static export), React (hooks-based state management), Tailwind CSS 4.x  
**Storage**: Client-side LocalStorage with versioned schema (current: v2.0.0)  
**Testing**: Manual testing (no automated test suite currently)  
**Target Platform**: Static web app deployed to GitHub Pages, mobile-first design  
**Project Type**: Single-page web application with static export (`output: "export"`)  
**Performance Goals**: Instant client-side state transitions, no perceivable lag on toggle/override operations  
**Constraints**: Static-only deployment (no server runtime), hydration-safe LocalStorage access, aviation UX consistency  
**Scale/Scope**: 4 status types, 2 action types, ~20-30 checklist items per checklist, single-user client-side app

**Current State Transition Logic Location**:

- `src/app/page.tsx` - `handleToggleItem` (lines 174-211) and `handleItemOverride` (lines 213-248)
- Combined: 70+ lines of nested if-else conditionals managing 4 status types × 2 actions

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ I. Static-First Architecture

**Status**: COMPLIANT  
**Rationale**: This refactoring is purely client-side logic reorganization. No server components or runtime dependencies are introduced. The transition map will be a static TypeScript object/Map colocated with the handlers.

### ✅ II. Hydration Safety (NON-NEGOTIABLE)

**Status**: COMPLIANT  
**Rationale**: This refactoring does not touch LocalStorage access patterns or component initialization. The transition map is a compile-time constant, not runtime-loaded data. No hydration concerns.

### ✅ III. Immutable Data Definitions

**Status**: COMPLIANT  
**Rationale**: The transition map will be a static constant defining behavior, not runtime state. It follows the same pattern as `src/data/checklists.ts` - immutable definitions separate from runtime state in `itemStates`.

### ✅ IV. LocalStorage Versioning & Migration

**Status**: COMPLIANT  
**Rationale**: No LocalStorage schema changes required. This refactoring only changes how status transitions are computed, not how they are stored. Storage format remains unchanged.

### ✅ V. Aviation-Inspired UX Consistency

**Status**: COMPLIANT  
**Rationale**: FR-009 explicitly requires 100% functional parity with existing behavior. All override semantics and status color meanings remain unchanged.

### ✅ VI. Type Safety & Path Aliases

**Status**: COMPLIANT  
**Rationale**: The transition map will use strict TypeScript types (e.g., `Record<ChecklistItemStatus, Record<ActionType, ChecklistItemStatus>>`). All imports use `@/` aliases per existing codebase standards.

**Overall Gate Status**: ✅ PASS - All constitution principles compliant, no violations to justify.

### Post-Phase 1 Re-Evaluation

After completing Phase 1 design (research.md, data-model.md, contracts/, quickstart.md), the constitution compliance remains unchanged:

- ✅ **Static-First**: Transition map is a static TypeScript constant, no runtime dependencies
- ✅ **Hydration Safety**: No LocalStorage access patterns changed, transition logic is pure
- ✅ **Immutable Definitions**: Transition map follows same pattern as `checklists.ts` - static constants
- ✅ **LocalStorage Versioning**: No schema changes - storage format unchanged
- ✅ **Aviation UX**: 100% functional parity maintained per FR-009
- ✅ **Type Safety**: Enhanced with mapped types and exhaustiveness checking

**Re-evaluation Status**: ✅ PASS - Design phase confirms architecture compliance.

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
│   └── page.tsx              # Contains handleToggleItem & handleItemOverride to refactor
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
│   └── checklists.ts         # Immutable checklist definitions
├── hooks/
│   ├── useChecklist.ts       # State management hook
│   └── useLocalStorage.ts
├── types/
│   └── checklist.ts          # Type definitions including ChecklistItemStatus
└── utils/
    └── storage.ts            # LocalStorage versioning & migration

# New file to create during implementation:
src/utils/
└── stateTransitions.ts       # NEW: State transition map (Phase 1 output)
```

**Structure Decision**: Single-page web application (Option 1 pattern). All code lives under `src/` with clear separation: `app/` (pages), `components/` (UI), `data/` (definitions), `hooks/` (state logic), `types/` (TypeScript), `utils/` (pure functions). The state transition map will be added to `utils/` as it's a pure function/data structure used by the page handlers.

## Complexity Tracking

**No violations to justify** - This refactoring maintains all existing architecture patterns and introduces no new complexity.
