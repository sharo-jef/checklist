# Vehicle Digital Checklist Constitution

<!--
Sync Impact Report - Constitution v1.0.0
=========================================
Version Change: NEW → 1.0.0 (Initial ratification)
Modified Principles: N/A (Initial creation)
Added Sections: All sections (initial document)
Removed Sections: None

Templates Status:
✅ plan-template.md - Reviewed, compatible (generic template)
✅ spec-template.md - Reviewed, compatible (generic template)
✅ tasks-template.md - Reviewed, compatible (generic template)

Follow-up TODOs: None
-->

## Core Principles

### I. Static-First Architecture

**Rule**: The application MUST be deployable as a static export with no server-side runtime dependencies.

**Rationale**: This project targets GitHub Pages deployment with a `/checklist` basePath. All functionality must work purely client-side using LocalStorage for persistence. No server components, no API routes, no ISR. This ensures:

- Zero hosting costs
- Maximum reliability (no server downtime)
- Offline capability potential
- Simple deployment workflow

**Implementation Requirements**:

- `output: "export"` in `next.config.ts` MUST remain enforced
- All state management MUST be client-side only
- Data persistence MUST use LocalStorage exclusively
- Images MUST be unoptimized for static compatibility
- `"use client"` directive MUST be present on pages using hooks/state

### II. Hydration Safety (NON-NEGOTIABLE)

**Rule**: Server-rendered HTML and initial client render MUST match exactly to prevent hydration mismatches.

**Rationale**: Next.js performs SSR even for static exports. Loading LocalStorage data during initial render causes hydration errors because server has no access to LocalStorage. This principle is critical for React stability.

**Implementation Pattern** (from `useChecklist.ts`):

```typescript
const [itemStates, setItemStates] = useState({}); // Empty initial state

useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => setItemStates(stored.itemStates)); // Defer hydration
  }
}, []);
```

**Violations**: Direct LocalStorage access during component initialization, conditional rendering based on LocalStorage before hydration.

### III. Immutable Data Definitions

**Rule**: Checklist definitions in `src/data/checklists.ts` MUST remain immutable at runtime. Runtime state lives separately in `itemStates`.

**Rationale**: Separating definition from state enables:

- Version-controlled checklist templates
- Clean state resets without data corruption
- Migration between state schema versions
- Multiple checklist instances from same definition

**Architecture**:

- **Definitions**: `checklists.ts` exports `ChecklistCategory[]` with `completed: false` defaults
- **Runtime State**: `itemStates` object maps categoryId → checklistId → itemId → ChecklistItemStatus
- **Status Types**: `unchecked | checked | overridden | checked-overridden`

**Violations**: Mutating checklist definition objects, storing completion state in definition data, mixing definition and runtime state.

### IV. LocalStorage Versioning & Migration

**Rule**: All LocalStorage schema changes MUST include version increments and backward-compatible migration logic.

**Current Version**: `2.0.0` (unified `itemStates` model)
**Storage Key**: `checklist-state`

**Migration Requirements**:

- Version field MUST be present in stored data
- Migration code MUST handle all previous versions
- Migration MUST be transparent to users (no data loss)
- Version bump follows semantic versioning:
  - **MAJOR**: Incompatible schema changes requiring data transformation
  - **MINOR**: New fields with backward-compatible defaults
  - **PATCH**: Schema-preserving bug fixes

**Example** (from `storage.ts`): v1.0.0 → v2.0.0 migrated from separate `checklistStates` + `overriddenStates` to unified `itemStates`.

**Violations**: Schema changes without version bump, missing migration paths, data loss during migration.

### V. Aviation-Inspired UX Consistency

**Rule**: UI patterns MUST maintain aviation digital checklist aesthetics and interaction paradigms.

**Core Patterns**:

- **Monospaced typography**: Barlow Condensed for cockpit display feel
- **Color semantics**:
  - White: Unchecked items
  - Green (`--text-green`): Checked items
  - Cyan (`--text-cyan`): Overridden items (emergency skip)
  - Yellow: NON-NORMAL menu text (alert state)
  - Magenta (`--highlight-magenta`): Active item border
- **Dotted separator**: `. `.repeat(400) between item name and expected value
- **Active item auto-advance**: Focus moves to first unchecked item automatically
- **Override capability**: ITEM OVRD and CHKL OVRD buttons for non-standard operations

**Rationale**: Users expect professional aviation workflows. Consistency with Boeing 747-8i digital checklists builds trust and reduces cognitive load for pilots/operators.

**Violations**: Non-monospaced fonts, arbitrary color meanings, removing override functionality, changing semantic color roles.

### VI. Type Safety & Path Aliases

**Rule**: All code MUST use TypeScript strict mode with proper type definitions. Import paths MUST use `@/` alias for `src/` directory.

**Configuration** (`tsconfig.json`):

- `strict: true` enforced
- Path alias: `"@/*": ["./src/*"]`
- Target: ES2017 for modern browser compatibility
- JSX: `react-jsx` (React 19 automatic runtime)

**Type Definitions** (`src/types/checklist.ts`):

- All interfaces/types centralized in types directory
- Enums for constants (e.g., `MenuType`, `ChecklistItemStatus`)
- No `any` types without explicit justification

**Rationale**: Type safety prevents runtime errors in static-only app where debugging is harder. Path aliases improve readability and refactoring safety.

**Violations**: Using relative imports over `@/` alias, `any` types without justification, relaxing strict mode.

## Development Constraints

### Technology Stack (Fixed)

- **Framework**: Next.js 16.0.3 with React 19.2.0
- **Build**: Static export only (`output: "export"`)
- **Styling**: Tailwind CSS 4.x with CSS variables in `globals.css`
- **Optimization**: React Compiler enabled (`reactCompiler: true`)
- **Testing**: Manual testing only (no automated test suite currently)
- **Deployment**: GitHub Pages at `/checklist` basePath

**Rationale**: Minimal dependencies reduce attack surface and maintenance burden. React Compiler optimization improves performance without runtime overhead.

### Dependency Policy

**Rule**: New dependencies require explicit justification. State management MUST use React hooks, not external libraries.

**Prohibited Without Justification**:

- State management libraries (Redux, Zustand, MobX)
- Runtime API libraries (Axios, fetch wrappers beyond native)
- CSS-in-JS libraries (styled-components, emotion)

**Allowed**:

- Development tools (linters, formatters, compilers)
- Build-time optimizations
- Tailwind CSS ecosystem plugins

**Rationale**: Static export model doesn't benefit from complex state management. Native APIs (fetch, useState, useEffect) suffice for client-only app.

### Mobile-First Constraints

**Rule**: Application MUST work on mobile devices with full-screen checklist experience.

**Configuration** (`layout.tsx`):

- `viewport.userScalable: false` for fixed checklist layout
- Touch-optimized button sizes
- Responsive design using Tailwind breakpoints

**Rationale**: Primary use case is in-vehicle mobile phone usage during pre-drive checks. Desktop support is secondary.

## Quality Standards

### Code Organization

**Directory Structure**:

```
src/
├── app/          # Next.js pages and layouts
├── components/   # React components (single responsibility)
├── data/         # Static checklist definitions
├── hooks/        # Custom React hooks
├── types/        # TypeScript type definitions
└── utils/        # Pure functions (storage, calculations)
```

**Component Patterns**:

- **Smart components**: `page.tsx` manages state and orchestrates
- **Presentation components**: Stateless, props-driven (e.g., `ChecklistItem`)
- **Hooks**: Encapsulate state logic (e.g., `useChecklist`, `useLocalStorage`)

**Rationale**: Clear separation of concerns enables easier testing and parallel development.

### Styling Conventions

**Rule**: Use Tailwind inline classes with custom CSS variables for theming. Avoid separate CSS modules.

**Custom Variables** (`globals.css`):

```css
--text-green: #00ff00 --text-cyan: #00ffff --highlight-magenta: #ff00ff;
```

**Usage**: `text-(--text-green)` for CSS var references in Tailwind 4.x

**Rationale**: Inline Tailwind classes keep styles co-located with components. CSS variables enable theme consistency without prop drilling.

### PowerShell Command Syntax

**Rule**: `package.json` scripts MUST use `;` for command chaining, never `&&`.

**Correct**: `"build": "next lint; next build"`
**Incorrect**: `"build": "next lint && next build"` (fails in PowerShell)

**Rationale**: Default shell is PowerShell on Windows. `&&` is not recognized.

## Governance

### Amendment Process

1. **Proposal**: Document change with rationale and impact analysis
2. **Version Determination**:
   - MAJOR: Backward-incompatible principle removals/redefinitions
   - MINOR: New principles or materially expanded guidance
   - PATCH: Clarifications, wording fixes, non-semantic refinements
3. **Sync Check**: Update dependent templates and documentation
4. **Approval**: Commit with sync impact report
5. **Migration**: If code changes required, create migration plan

### Compliance Verification

**All PRs/feature work MUST**:

- Verify static export compatibility (`npm run build` succeeds)
- Check hydration safety (no console warnings)
- Maintain type safety (pass `npm run lint`)
- Follow directory structure conventions
- Document any new LocalStorage schema changes with migration

**Complexity Justification**: Any deviation from principles requires documented justification in implementation plan.

### Runtime Guidance

For development patterns and agent-specific instructions, see `.github/copilot-instructions.md`. Constitution defines WHAT rules exist; copilot-instructions defines HOW to apply them.

**Version**: 1.0.0 | **Ratified**: 2025-11-19 | **Last Amended**: 2025-11-19
