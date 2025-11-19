# Data Model: Exit Menu Button Component

**Feature**: Extract Exit Menu button into reusable component  
**Date**: 2025-11-20

## Overview

This document defines the data structures and entities for the Exit Menu Button component. Since this is a simple UI component refactoring, the data model is minimal and consists primarily of the component's props interface.

## Entities

### 1. ExitMenuButton Component

**Description**: A reusable React presentation component that renders a standardized "EXIT MENU" button with configurable click behavior.

**Type**: UI Component (Presentation)

**Properties**:

| Property  | Type         | Required | Default | Description                                      |
| --------- | ------------ | -------- | ------- | ------------------------------------------------ |
| `onClick` | `() => void` | Yes      | N/A     | Callback function invoked when button is clicked |

**Validation Rules**:

- `onClick` must be a function (enforced by TypeScript)
- No runtime validation needed (type safety via TypeScript strict mode)

**State**: None (stateless component)

**Lifecycle**: Standard React component lifecycle (mount, render, unmount)

**Example Usage**:

```tsx
<ExitMenuButton onClick={handleExitMenu} />
```

### 2. ExitMenuButtonProps Interface

**Description**: TypeScript interface defining the component's props contract.

**Definition**:

```typescript
interface ExitMenuButtonProps {
  onClick: () => void;
}
```

**Purpose**: Type safety and developer documentation

**Location**: `src/components/ExitMenuButton.tsx` (co-located with component)

## Data Flow

### Component Data Flow

```
User Interaction (click/keyboard)
  ↓
ExitMenuButton component
  ↓
onClick prop function (provided by parent)
  ↓
Parent component state update (setViewMode, setActiveMenu in page.tsx)
  ↓
Re-render with new view state
```

**Key Points**:

- **Unidirectional data flow**: Parent passes onClick handler down as prop
- **No internal state**: Component is purely controlled by parent
- **Event delegation**: Button click events bubble up via onClick callback
- **Rendering**: Component renders identically regardless of context (NORMAL/NON-NORMAL/RESETS menus)

### Integration Points

| Integration Point            | Type     | Description                                     |
| ---------------------------- | -------- | ----------------------------------------------- |
| `page.tsx` (NORMAL menu)     | Consumer | Uses ExitMenuButton with handleExitMenu handler |
| `page.tsx` (RESETS menu)     | Consumer | Uses ExitMenuButton with handleExitMenu handler |
| `page.tsx` (NON-NORMAL menu) | Consumer | Uses ExitMenuButton with handleExitMenu handler |

**Note**: All three integration points use the same `handleExitMenu` callback, which sets `viewMode` to "default" and `activeMenu` to null.

## Relationships

### Component Hierarchy

```
page.tsx (Smart Component)
  ├─ TopMenu
  ├─ ChecklistMenu
  ├─ ChecklistDisplay
  ├─ ResetsMenu
  └─ ExitMenuButton (NEW - used in 3 different conditional render branches)
```

**Relationship Type**: Parent-Child composition

**Cardinality**:

- Parent (page.tsx): 1
- Child (ExitMenuButton): 0-1 (rendered conditionally based on viewMode)

### Component Dependencies

```
ExitMenuButton.tsx
  └─ No dependencies (pure React component)
```

**External Dependencies**: None  
**Internal Dependencies**: None (no imports from other components, hooks, or utils)

## State Transitions

### Component State Machine

Since ExitMenuButton is stateless, there are no internal state transitions. However, the component participates in the parent's view mode state machine:

```
Current State       →  User Action         →  New State
─────────────────────────────────────────────────────────
viewMode: "menu"    →  Click Exit Button   →  viewMode: "default"
activeMenu: NORMAL  →  (via onClick prop)  →  activeMenu: null

viewMode: "menu"    →  Click Exit Button   →  viewMode: "default"
activeMenu: RESETS  →  (via onClick prop)  →  activeMenu: null

viewMode: "menu"    →  Click Exit Button   →  viewMode: "default"
activeMenu: NON_NORMAL → (via onClick prop) → activeMenu: null
```

**Trigger**: User clicks button or presses Enter/Space while focused  
**Effect**: Parent's `handleExitMenu` function updates parent state  
**Result**: View transitions back to default (main menu with NORMAL/NON-NORMAL buttons)

## Type Definitions

### Complete TypeScript Definitions

```typescript
/**
 * Props for the ExitMenuButton component.
 *
 * This component renders a standardized "EXIT MENU" button
 * used across multiple menu contexts (NORMAL, NON-NORMAL, RESETS).
 */
interface ExitMenuButtonProps {
  /**
   * Callback function invoked when the button is clicked.
   * Typically used to transition from menu view back to default view.
   */
  onClick: () => void;
}
```

### No New Global Types

The `ExitMenuButtonProps` interface is component-scoped and does not need to be added to `src/types/checklist.ts`. It follows the pattern of `TabButton.tsx`, which also defines its props interface locally.

## Data Validation

### Input Validation

**Props Validation**:

- **onClick**: TypeScript enforces function type at compile time
- **Runtime validation**: None needed (TypeScript strict mode provides type safety)

**Invalid Inputs**:

- Passing non-function to onClick: TypeScript compile error
- Passing undefined/null: TypeScript compile error (onClick is required)
- Passing function with wrong signature: TypeScript compile error

### Output Validation

**Rendered Output**:

- Always renders valid HTML `<button>` element
- Text content hardcoded: "EXIT\nMENU"
- CSS classes static: No dynamic class generation

**Accessibility**:

- Native `<button>` element ensures keyboard accessibility
- `aria-label="Exit Menu"` provides screen reader context
- `whitespace-pre-line` enables line breaking for visual clarity

## Persistence

**Not Applicable**: Component has no persistent state. All state lives in parent component (page.tsx) and is managed via existing LocalStorage mechanisms (unrelated to this component).

## Performance Considerations

### Rendering Optimization

**Memoization**: Not needed

- Component is trivial (single button element)
- No expensive computations
- Re-render cost is negligible

**Props Stability**:

- `onClick` handler (`handleExitMenu`) is defined once in page.tsx
- Could be wrapped in `useCallback` if needed, but current implementation doesn't cause performance issues

### Bundle Size Impact

**Estimated Impact**: < 0.5 KB (minified + gzipped)

- Simple component with minimal JSX
- No new dependencies
- Reduces bundle size by eliminating duplicate code (net negative impact)

## Migration Plan

### Data Migration

**Not Applicable**: No data schema changes. Component extraction is purely a code refactoring.

### Backward Compatibility

**Not Applicable**: Feature doesn't affect stored data or external APIs. All changes are internal implementation details.

## Summary

The data model for ExitMenuButton is intentionally minimal:

1. **Single entity**: ExitMenuButton component
2. **Single interface**: ExitMenuButtonProps with one property (onClick)
3. **No state**: Stateless presentation component
4. **No persistence**: No data storage or retrieval
5. **Clear data flow**: Parent → onClick prop → component → user interaction → onClick callback → parent state update

This simplicity aligns with the feature's goal: reduce duplication without changing functionality.

**Next Steps**: Define component props contract in `contracts/` directory.
