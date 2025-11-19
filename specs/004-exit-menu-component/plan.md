# Implementation Plan: Extract Exit Menu Button Component

**Branch**: `004-exit-menu-component` | **Date**: 2025-11-20 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-exit-menu-component/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Extract the duplicate Exit Menu button into a reusable component to eliminate code duplication across three menu contexts (NORMAL, NON-NORMAL, RESETS). This is a simple refactoring task that consolidates identical button JSX into a single component with configurable onClick behavior, following existing component patterns like TabButton.tsx.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.3, React 19.2.0  
**Primary Dependencies**: Next.js (static export), React, Tailwind CSS 4.x  
**Storage**: LocalStorage (not relevant to this feature)  
**Testing**: Manual testing (no automated test suite currently)  
**Target Platform**: Web (GitHub Pages static export), mobile-first design
**Project Type**: Web application (single Next.js project with static export)  
**Performance Goals**: 60 fps UI interactions, instant button responsiveness  
**Constraints**: Static export only, no server components, client-side rendering, offline-capable  
**Scale/Scope**: Small component extraction (3 duplicate instances → 1 reusable component)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Static-First Architecture

**Status**: PASS  
**Rationale**: This is a pure UI component refactoring. No server-side dependencies introduced. Component will be client-side only, following existing patterns (TabButton.tsx).

### ✅ Hydration Safety

**Status**: PASS  
**Rationale**: Exit Menu button is rendered conditionally based on viewMode state, which is already hydration-safe. No LocalStorage access in the component itself. No risk of hydration mismatch.

### ✅ Immutable Data Definitions

**Status**: PASS (Not Applicable)  
**Rationale**: Feature does not touch checklist data definitions. Only refactors UI button rendering.

### ✅ LocalStorage Versioning & Migration

**Status**: PASS (Not Applicable)  
**Rationale**: Feature does not modify storage schema or access LocalStorage.

### ✅ Aviation-Inspired UX Consistency

**Status**: PASS  
**Rationale**: Component preserves existing button styling (gray background, white text, "EXIT\nMENU" line breaking, hover border effect). No UX changes, only code structure improvement.

### ✅ Type Safety & Path Aliases

**Status**: PASS  
**Rationale**: Component will use TypeScript with strict mode, follow existing component patterns (props interface, @/ path alias), and match TabButton.tsx structure.

### ✅ Code Organization

**Status**: PASS  
**Rationale**: Component will be placed in `src/components/` directory following established patterns. Presentation component with onClick prop, no internal state.

### ✅ Styling Conventions

**Status**: PASS  
**Rationale**: Component will use Tailwind inline classes matching existing button styles. No new CSS variables or modules needed.

**Overall Gate Status**: ✅ PASS - No violations. Feature aligns with all constitution principles.

---

### Post-Phase 1 Re-Evaluation (2025-11-20)

**Design Review Status**: ✅ APPROVED

All constitution principles remain satisfied after completing Phase 1 design:

- **Component Contract** (contracts/ExitMenuButton.md): Confirms minimal props interface (onClick only), preserves exact styling, maintains type safety
- **Data Model** (data-model.md): Documents stateless component with no persistence layer, aligning with Static-First Architecture
- **Research Findings** (research.md): All design decisions explicitly reference constitution principles (aviation UX, type safety, styling conventions)
- **Implementation Plan** (quickstart.md): Step-by-step guide maintains 100% functional parity, no constitution deviations

**New Risks Identified**: None

**Mitigation Applied**:

- Hardcoded button text prevents UX inconsistency (Aviation-Inspired UX principle)
- aria-label addition improves accessibility without visual changes
- Component structure mirrors existing TabButton.tsx pattern (Code Organization principle)

**Final Gate Decision**: ✅ PROCEED TO IMPLEMENTATION (Phase 2)

## Project Structure

### Documentation (this feature)

```text
specs/004-exit-menu-component/
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
├── components/
│   ├── ExitMenuButton.tsx     # NEW: Extracted reusable button component
│   └── TabButton.tsx           # Existing: Reference pattern for component structure
├── app/
│   └── page.tsx                # Modified: Uses ExitMenuButton (removed 3 duplicate buttons)
└── types/
    └── checklist.ts            # Existing: Type definitions (no changes needed)

specs/004-exit-menu-component/
├── plan.md                     # This file
├── research.md                 # Phase 0 output
├── data-model.md               # Phase 1 output
├── quickstart.md               # Phase 1 output
└── contracts/                  # Phase 1 output (component props interface)
```

**Structure Decision**: Single Next.js project structure. New component in `src/components/` following existing patterns. Only `page.tsx` is modified to use the new component, with 3 instances replaced.

## Complexity Tracking

> **Not Applicable**: Constitution Check passed with no violations. No complexity justifications needed.
