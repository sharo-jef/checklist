# Implementation Plan: Remove Unused Type Fields

**Branch**: `007-cleanup-types` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-cleanup-types/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature removes the obsolete `completed: boolean` field from the `ChecklistItem` TypeScript interface. The application migrated from boolean-based completion tracking to a status-based system (`ChecklistItemStatus` type with 4 states: unchecked, checked, overridden, checked-overridden) in v2.0.0, but the old boolean field remains in the type definition causing developer confusion. This cleanup ensures type definitions accurately reflect the current implementation, improving code comprehension and type safety.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.3, React 19.2.0  
**Primary Dependencies**: Next.js (static export), React 19, Tailwind CSS 4.x  
**Storage**: LocalStorage (client-side only, version 2.0.0 schema)  
**Testing**: Manual testing (no automated test suite currently)  
**Target Platform**: Static web app deployed to GitHub Pages at `/checklist` basePath  
**Project Type**: Single web application (Next.js static export)  
**Performance Goals**: Instant client-side type checking, zero runtime overhead from type cleanup  
**Constraints**: Static export only (no server runtime), strict TypeScript mode, hydration safety required  
**Scale/Scope**: Small-scale personal vehicle checklist (~50 checklist items across 6 categories)

**Current State**:

- ChecklistItem type has `completed: boolean` field that is no longer used
- Runtime state uses `itemStates` mapping to `ChecklistItemStatus` (4-state enum)
- Data definitions in `checklists.ts` initialize all items with `completed: false` (obsolete)
- Migration logic in `storage.ts` only handles v1.0.0 → v2.0.0, doesn't reference `completed` field

**Target State**:

- ChecklistItem type has no `completed` field
- Data definitions initialize items without `completed: false`
- All type references are clean and accurate
- Documentation updated to reflect status-based model only

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Principle I: Static-First Architecture

✅ **PASS** - This is a type-only cleanup. No changes to static export configuration or runtime dependencies.

### Principle II: Hydration Safety

✅ **PASS** - Type changes don't affect hydration. No component rendering logic modified.

### Principle III: Immutable Data Definitions

✅ **PASS** - Removes obsolete initialization values (`completed: false`) from data definitions. The definition data remains immutable at runtime; only the type contract is cleaned up.

### Principle IV: LocalStorage Versioning & Migration

✅ **PASS** - No storage schema changes required. The `completed` field was never part of the v2.0.0 storage schema (`StoredData`). Existing migration logic from v1.0.0 → v2.0.0 is unaffected as it never references the `completed` field in ChecklistItem type.

### Principle V: Aviation-Inspired UX Consistency

✅ **PASS** - No UI changes. This is a type definition cleanup only.

### Principle VI: Type Safety & Path Aliases

✅ **PASS** - **This feature directly supports this principle.** Removing unused type fields improves type accuracy and safety. All code will be verified to compile with strict mode after changes.

**Overall Assessment**: ✅ **ALL GATES PASS** - Feature is fully compliant with constitution. No complexity justification needed.

---

### Post-Design Re-Evaluation (Phase 1 Complete)

**Date**: 2025-11-20

After completing Phase 0 (research) and Phase 1 (design):

✅ **All principles remain compliant** - No design decisions violate constitution  
✅ **Type safety enhanced** - Cleaned type definitions improve developer experience  
✅ **No migration complexity** - Confirmed field was never persisted  
✅ **Zero runtime impact** - All changes are compile-time only  
✅ **Documentation complete** - Research, data model, contracts, and quickstart all generated

**Ready for implementation** (Phase 2: Tasks generation via `/speckit.tasks` command)

## Project Structure

### Documentation (this feature)

```text
specs/007-cleanup-types/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── contracts/           # Phase 1 output (/speckit.plan command)
    └── type-definitions.md  # TypeScript interface contracts
```

### Source Code (repository root)

```text
src/
├── types/
│   └── checklist.ts     # MODIFIED: Remove completed field from ChecklistItem
├── data/
│   └── checklists.ts    # MODIFIED: Remove completed: false from all item definitions
├── hooks/
│   └── useChecklist.ts  # REVIEW: Verify no references to completed field
├── components/          # REVIEW: Verify no component uses completed field
└── utils/
    └── storage.ts       # REVIEW: Verify migration logic unaffected
```

**Structure Decision**: This is a single Next.js web application project. All source code lives under `src/` with clear separation between types, data definitions, hooks, components, and utilities. The type cleanup affects primarily `src/types/checklist.ts` and `src/data/checklists.ts`, with verification needed across hooks and components.

## Complexity Tracking

**N/A** - No constitution violations. All principles pass, no complexity justification needed.
