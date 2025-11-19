# Research: Exit Menu Button Component

**Feature**: Extract Exit Menu button into reusable component  
**Date**: 2025-11-20

## Overview

This document captures the research and design decisions for extracting the duplicate Exit Menu button into a reusable React component.

## Research Tasks

### 1. Component Pattern Analysis

**Task**: Analyze existing component patterns in the codebase to determine the best structure for ExitMenuButton.

**Findings**:

- Reviewed `TabButton.tsx` as reference implementation
- Pattern uses TypeScript interface for props
- Presentation component with no internal state
- Uses Tailwind inline classes for styling
- Follows single responsibility principle

**Decision**: Model ExitMenuButton after TabButton.tsx pattern

- Props interface: `ExitMenuButtonProps` with `onClick: () => void`
- No internal state (pure presentation component)
- Tailwind classes inline
- Export as named export for consistency

**Rationale**: Consistency with existing codebase patterns reduces cognitive load and makes the component immediately familiar to developers working on this project.

**Alternatives Considered**:

- **Separate CSS module**: Rejected because project uses Tailwind inline classes exclusively (per constitution styling conventions)
- **Default export**: Rejected because existing components use named exports (TabButton, ChecklistMenu, etc.)
- **Styled component**: Rejected because project doesn't use CSS-in-JS libraries (per constitution dependency policy)

### 2. Button Styling Requirements

**Task**: Document exact styling requirements by examining all three Exit Menu button instances in page.tsx.

**Findings**:
From `page.tsx` analysis:

```tsx
className =
  "py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line";
```

**Styling breakdown**:

- **Padding**: `py-1 px-4` (vertical 0.25rem, horizontal 1rem)
- **Min height**: `min-h-11` (2.75rem)
- **Typography**: `text-center font-mono text-xl tracking-wide leading-none`
- **Border**: `border-2 border-transparent hover:border-white` (hover effect)
- **Background**: `bg-[#4a5568]` (gray background)
- **Text color**: `text-white`
- **Line breaking**: `whitespace-pre-line` (enables \n line breaks)

**Decision**: Component will replicate exact styling with no modifications.

**Rationale**: Feature spec FR-007 requires 100% functional parity. Any styling changes would violate constitution principle V (Aviation-Inspired UX Consistency) and introduce regression risk.

### 3. Props Design

**Task**: Determine minimal props interface needed for component reusability across three contexts.

**Findings**:
All three Exit Menu button instances:

1. In NORMAL menu view (page.tsx line ~340)
2. In RESETS menu view (page.tsx line ~363)
3. In NON-NORMAL menu view (page.tsx line ~378)

All share:

- Identical styling
- Same text content: `{"EXIT\nMENU"}`
- Same onClick handler: `handleExitMenu`

**Decision**: Minimal props interface

```typescript
interface ExitMenuButtonProps {
  onClick: () => void;
}
```

**Rationale**: Text content is constant ("EXIT\nMENU"), so hardcoding it in the component reduces API surface and prevents misuse. Only the click handler varies between contexts.

**Alternatives Considered**:

- **Include `text` prop**: Rejected because all instances use identical text. YAGNI principle - don't add flexibility that isn't needed.
- **Include `className` prop for style overrides**: Rejected because all instances use identical styling. Allowing overrides would violate consistency goals.
- **Include `disabled` prop**: Rejected because none of the current instances disable the button. Can be added later if needed (backward compatible).

### 4. Accessibility Considerations

**Task**: Ensure component maintains or improves accessibility compared to current implementation.

**Findings**:

- Current buttons use native `<button>` element (keyboard accessible by default)
- No aria-label or role attributes currently
- Whitespace-pre-line enables screen reader to announce "EXIT MENU" as two words

**Decision**: Add accessibility improvements

- Use semantic `<button>` element
- Add `aria-label="Exit Menu"` for clearer screen reader announcement
- Maintain `whitespace-pre-line` for visual line breaking

**Rationale**: Feature spec FR-005 requires keyboard navigation and accessibility features. Adding aria-label improves screen reader experience without visual changes (addresses User Story 2 acceptance criteria).

**Alternatives Considered**:

- **Use `<div>` with role="button"**: Rejected because native `<button>` provides better keyboard support and semantic meaning
- **Separate visual text from aria-label**: Rejected because `whitespace-pre-line` already produces acceptable screen reader behavior

### 5. File Location & Naming

**Task**: Determine appropriate file location and naming convention.

**Findings**:

- All components in `src/components/` directory
- Naming pattern: PascalCase, descriptive (TabButton, ChecklistMenu, ChecklistDisplay)
- File extension: `.tsx` (TypeScript + JSX)

**Decision**: Create `src/components/ExitMenuButton.tsx`

**Rationale**: Follows established naming conventions. "ExitMenuButton" clearly describes component purpose and matches existing pattern (TabButton, not Tab or Button).

**Alternatives Considered**:

- **Name: `MenuExitButton.tsx`**: Rejected because existing pattern puts action first (TabButton selects tabs, ExitMenuButton exits menus)
- **Location: `src/components/buttons/`**: Rejected because project doesn't use subdirectories in components/ (flat structure)

### 6. Testing Strategy

**Task**: Define manual testing approach given no automated test suite.

**Findings**:

- Project uses manual testing only (per Technical Context)
- Constitution requires testing all three menu contexts

**Decision**: Manual test checklist

1. Verify NORMAL menu Exit Menu button renders and functions
2. Verify NON-NORMAL menu Exit Menu button renders and functions
3. Verify RESETS menu Exit Menu button renders and functions
4. Test keyboard navigation (Tab key to focus, Enter/Space to activate)
5. Verify hover effect (border-white on hover)
6. Test screen reader announcement with NVDA/JAWS
7. Run `npm run build` to ensure static export succeeds
8. Run `npm run lint` to verify no TypeScript errors

**Rationale**: Covers all acceptance scenarios from User Stories 1-3. Manual testing sufficient for simple UI component.

**Alternatives Considered**:

- **Add Jest/React Testing Library**: Rejected because constitution states "Manual testing only" and adding test infrastructure is out of scope
- **Visual regression testing**: Rejected because no existing visual testing setup and overkill for this feature

## Technology Stack Decisions

### Primary Technology Choices

| Technology         | Decision                   | Rationale                               |
| ------------------ | -------------------------- | --------------------------------------- |
| **Component Type** | Presentation component     | No state needed, onClick passed as prop |
| **Styling**        | Tailwind inline classes    | Matches existing codebase patterns      |
| **Type System**    | TypeScript strict mode     | Required by constitution                |
| **Export Style**   | Named export               | Consistency with TabButton.tsx          |
| **Accessibility**  | Native button + aria-label | Best practices for semantic HTML        |

### Dependencies

**New Dependencies**: None  
**Modified Dependencies**: None

**Rationale**: Pure refactoring uses only existing technologies (React, TypeScript, Tailwind).

## Implementation Risks

### Risk Assessment

| Risk                     | Likelihood | Impact | Mitigation                                                 |
| ------------------------ | ---------- | ------ | ---------------------------------------------------------- |
| Styling regression       | Low        | Medium | Copy exact className string, manual visual testing         |
| onClick handler broken   | Low        | High   | Manual testing in all three menu contexts                  |
| Hydration mismatch       | Very Low   | High   | Component is purely presentational, no LocalStorage access |
| Build failure            | Very Low   | Medium | Run npm run build before PR                                |
| Accessibility regression | Low        | Medium | Test with screen reader, add aria-label                    |

### Risk Mitigation Strategy

1. **Copy, don't recreate**: Copy exact className string from existing buttons to avoid styling drift
2. **Test all contexts**: Manually test all three menu views before merging
3. **Lint before commit**: Run `npm run lint` to catch TypeScript errors early
4. **Build verification**: Run `npm run build` to ensure static export still works

## Open Questions

### Resolved Questions

**Q1**: Should the component accept a `className` prop for styling flexibility?  
**A1**: No. All instances use identical styling. Adding flexibility would violate consistency goals.

**Q2**: Should the text content be configurable via props?  
**A2**: No. All instances use "EXIT\nMENU". Hardcoding prevents misuse and simplifies API.

**Q3**: Do we need to update any existing tests?  
**A3**: No. Project has no automated test suite. Manual testing only.

**Q4**: Should we extract other duplicate buttons (NORMAL, NON-NORMAL)?  
**A4**: Out of scope. Feature spec only targets Exit Menu button. Other buttons may need different props (e.g., button text, color for NON-NORMAL).

### Unresolved Questions

None. All technical questions resolved during research phase.

## Summary

This is a straightforward component extraction following established patterns. No novel technical challenges. Key success factors:

1. Exact styling replication (copy className verbatim)
2. Minimal props interface (only onClick)
3. Accessibility improvement (aria-label)
4. Manual testing in all three contexts
5. Follow TabButton.tsx pattern

**Confidence Level**: High - Simple refactoring with clear patterns to follow.

**Next Steps**: Proceed to Phase 1 (data-model.md and contracts/).
