# Implementation Plan: Simplify Conditional View Rendering

**Branch**: `009-view-routing-logic` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-view-routing-logic/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Replace nested conditional JSX view rendering with a declarative routing pattern using discriminated unions and component maps. This refactoring simplifies the `page.tsx` component's view logic from complex nested if-else blocks to a type-safe routing lookup, improving maintainability and extensibility. The chosen approach (Pattern 2: Component Map with Discriminated Union Keys from research.md) provides superior type safety, prevents impossible state combinations at compile time, and aligns with React 19 best practices.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React 19.2.0, Next.js 16.0.3  
**Primary Dependencies**: React hooks (useState, useMemo, useCallback), Next.js static export  
**Storage**: LocalStorage (client-side only, via existing storage utilities)  
**Testing**: Manual testing (no automated test framework currently)  
**Target Platform**: Modern browsers (static site on GitHub Pages)  
**Project Type**: Single-page web application (client-side only, static export)  
**Performance Goals**: <16ms render time (60fps), instant view transitions, zero layout shift  
**Constraints**: Static export only (no SSR), client-side state management only, hydration-safe patterns required  
**Scale/Scope**: 6 distinct view states (default, normal-menu, normal-checklist, non-normal-menu, non-normal-checklist, resets-menu), single page component refactor

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### ✅ Static-First Architecture

- **Status**: PASS
- **Verification**: This refactoring operates entirely on client-side JSX rendering logic. No server components, no API routes. Static export compatibility maintained.
- **Impact**: None - purely structural refactoring of existing client-side code

### ✅ Hydration Safety

- **Status**: PASS
- **Verification**: View routing operates post-hydration. The discriminated union approach doesn't introduce any new LocalStorage access or conditional rendering that would affect SSR/client matching.
- **Impact**: None - view selection happens after hydration completes

### ✅ Immutable Data Definitions

- **Status**: PASS
- **Verification**: Refactoring touches only view routing logic, not checklist data definitions. The separation of `checklists.ts` and `itemStates` remains unchanged.
- **Impact**: None - data model untouched

### ✅ LocalStorage Versioning & Migration

- **Status**: PASS
- **Verification**: No changes to storage schema. This is a pure view layer refactoring.
- **Impact**: None - storage utilities unchanged

### ✅ Aviation-Inspired UX Consistency

- **Status**: PASS
- **Verification**: All existing view components (ChecklistMenu, ChecklistDisplay, ResetsMenu, default buttons) remain visually identical. Only the _selection_ of which component to render changes.
- **Impact**: None - UI appearance preserved 100%

### ✅ Type Safety & Path Aliases

- **Status**: PASS (Enhanced)
- **Verification**: The discriminated union approach _strengthens_ type safety by preventing impossible view state combinations (e.g., `{ view: "checklist", menu: MenuType.RESETS }` is compile-time invalid).
- **Impact**: Positive - improved type safety beyond current implementation

### Post-Phase 1 Recheck: ✅ PASS

- After creating `types/routing.ts` and `routing/useViewRouter.ts`, verified:
  - ✅ No new dependencies added (zero package.json changes)
  - ✅ All view transitions maintain functional parity (routing layer is read-only)
  - ✅ TypeScript strict mode compatible (discriminated unions, no any types)
  - ✅ Enhanced type safety (impossible states prevented at compile time)
  - ✅ Static export compatibility maintained (client-side routing only)

## Project Structure

### Documentation (this feature)

```text
specs/009-view-routing-logic/
├── plan.md              # This file (/speckit.plan command output) ✅
├── research.md          # Phase 0 output ✅ COMPLETE
├── data-model.md        # Phase 1 output ✅ COMPLETE
├── quickstart.md        # Phase 1 output ✅ COMPLETE
├── contracts/           # Phase 1 output ✅ COMPLETE
│   ├── ViewState.md     # Discriminated union type definitions ✅
│   ├── useViewRouter.md # View router hook contract ✅
│   └── ViewRegistry.md  # Component registry contract ✅
├── checklists/
│   └── requirements.md  # Specification quality checklist ✅ COMPLETE
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx          # PRIMARY REFACTOR TARGET (view routing logic)
├── components/
│   ├── CheckIcon.tsx
│   ├── ChecklistDisplay.tsx
│   ├── ChecklistItem.tsx
│   ├── ChecklistMenu.tsx
│   ├── ChecklistStatusBanner.tsx
│   ├── ExitMenuButton.tsx
│   ├── ResetsMenu.tsx
│   ├── TabButton.tsx
│   ├── TabNavigation.tsx
│   ├── TopMenu.tsx
│   └── DefaultView.tsx   # NEW: Extract default button layout
├── constants/
│   └── ui.ts
├── data/
│   └── checklists.ts
├── hooks/
│   ├── useChecklist.ts
│   └── useLocalStorage.ts
├── types/
│   ├── checklist.ts
│   └── routing.ts        # NEW: ViewState, ViewKey, AppState types
├── utils/
│   ├── checklist.ts
│   ├── navigation.ts
│   ├── storage.ts
│   └── transitions.ts
└── routing/              # NEW DIRECTORY
    ├── useViewRouter.ts  # NEW: View router hook (primary routing logic)
    └── viewRegistry.ts   # NEW: Component registry map
```

**Structure Decision**: Single-page web application structure with Next.js App Router conventions. This feature adds:

1. **New directory**: `src/routing/` - Centralizes view routing logic, keeping it separate from generic utilities
2. **New component**: `src/components/DefaultView.tsx` - Extracts default button layout from page.tsx
3. **New types file**: `src/types/routing.ts` - View-specific type definitions (discriminated unions)
4. **Modified file**: `src/app/page.tsx` - Replace nested conditionals with useViewRouter hook call

The routing directory is preferred over utils/ because this is domain-specific application logic, not generic helper functions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitutional violations. This refactoring fully complies with all established principles:

- Static-first architecture maintained
- Hydration safety preserved
- Type safety enhanced
- No new dependencies
- Aviation UX consistency unchanged
