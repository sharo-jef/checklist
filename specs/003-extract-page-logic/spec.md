# Feature Specification: Extract Business Logic from Page Component

**Feature Branch**: `003-extract-page-logic`  
**Created**: 2025-11-19  
**Status**: Draft  
**Input**: User description: "page.tsx bloat reduction - Extract business logic from 450-line page.tsx into custom hooks and utilities"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Component Logic Reusability (Priority: P1)

When developers need to reuse checklist navigation logic, active item tracking, or next checklist determination in other components or features, they should be able to import well-defined hooks or utilities instead of duplicating code from the page component.

**Why this priority**: The current monolithic structure makes logic reuse impossible, forcing code duplication if similar functionality is needed elsewhere.

**Independent Test**: Can be fully tested by extracting one piece of logic (e.g., `getFirstUncheckedIndex`) into a hook and verifying it can be imported and used in a different component.

**Acceptance Scenarios**:

1. **Given** checklist navigation logic is extracted to a custom hook, **When** a new component needs to determine the active item, **Then** it can import and use the hook without accessing page.tsx
2. **Given** utility functions are extracted for common operations, **When** a developer needs to find the next incomplete checklist, **Then** they can import a single utility function instead of copying 20+ lines from page.tsx

---

### User Story 2 - Component Testing and Isolation (Priority: P2)

When developers need to test specific pieces of checklist logic (e.g., "does next checklist detection work correctly?"), they should be able to test the isolated logic without mounting the entire 450-line page component.

**Why this priority**: Large components are difficult to test thoroughly. Extracting logic enables focused unit testing of individual behaviors.

**Independent Test**: Can be tested by creating unit tests for extracted hooks/utilities that run in under 100ms without requiring full component rendering.

**Acceptance Scenarios**:

1. **Given** logic is extracted into testable units, **When** a developer writes tests for next checklist detection, **Then** they can test it in isolation without mocking the entire page component
2. **Given** a bug is found in active item tracking, **When** the developer fixes it, **Then** they can verify the fix with a focused test on the extracted hook

---

### User Story 3 - Code Review and Comprehension (Priority: P3)

When a developer reviews the page component, they should see primarily UI composition and event wiring, with business logic delegated to clearly named hooks and utilities.

**Why this priority**: A 450-line component mixing UI, state, and logic is cognitively overwhelming and slows down code review.

**Independent Test**: Can be tested by measuring the lines of code in page.tsx before and after extraction, targeting a 40%+ reduction.

**Acceptance Scenarios**:

1. **Given** business logic is extracted, **When** a reviewer examines page.tsx, **Then** they see primarily JSX structure and event handlers, with logic calls to clearly named hooks
2. **Given** the component is refactored, **When** a new developer reads it, **Then** they can understand the component's responsibilities in under 5 minutes

---

### User Story 4 - Modification Safety (Priority: P3)

When a developer needs to change how the next checklist is determined, they should be able to make that change in a dedicated utility file without risking accidental modification of unrelated UI or state management logic.

**Why this priority**: Large files increase the risk of accidental changes to unrelated code during modifications.

**Independent Test**: Can be tested by modifying next checklist logic and verifying no unintended side effects in UI rendering or state management.

**Acceptance Scenarios**:

1. **Given** logic is separated from UI, **When** a developer modifies next checklist logic, **Then** the change is confined to a single utility function file
2. **Given** the modification is made, **When** the application is tested, **Then** only next checklist behavior is affected, not unrelated features

---

### Edge Cases

- What happens if extracted hooks are called outside their intended context (e.g., without required dependencies)?
- How are circular dependencies between hooks prevented during extraction?
- What if the extracted logic needs access to state that's only available in the page component?
- How is the separation of concerns maintained over time as new features are added?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST extract `getFirstUncheckedIndex` logic into a reusable custom hook or utility function
- **FR-002**: System MUST extract `getNextIncompleteChecklist` logic into a utility function accessible from multiple components
- **FR-003**: System MUST extract `hasNextChecklist` logic into a custom hook or derived state computation
- **FR-004**: Extracted hooks MUST accept necessary dependencies as parameters rather than accessing global state
- **FR-005**: Extracted utilities MUST be pure functions when possible, with no side effects
- **FR-006**: The page component MUST delegate business logic to extracted hooks and utilities, retaining only UI composition and event handling
- **FR-007**: System MUST maintain 100% functional parity - all user-facing behaviors must work identically after extraction
- **FR-008**: Extracted logic MUST be colocated in appropriate directories (hooks in `hooks/`, utilities in `utils/` or `data/`)
- **FR-009**: Each extracted piece of logic MUST have a clear, descriptive name indicating its purpose
- **FR-010**: The page component size MUST be reduced by at least 30% in lines of code
- **FR-011**: Extracted hooks MUST follow React hooks conventions (use prefix, handle dependencies correctly)

### Key Entities

- **Custom Hook**: A reusable React hook that encapsulates stateful logic (e.g., active item tracking, next checklist detection)
- **Utility Function**: A pure function that performs a specific calculation or transformation (e.g., finding first unchecked index)
- **Page Component**: The main UI component that orchestrates hooks and utilities to render the checklist interface

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Page component size is reduced from 450+ lines to under 300 lines (33%+ reduction)
- **SC-002**: At least 3 pieces of business logic are extracted into reusable hooks or utilities
- **SC-003**: Extracted logic can be imported and used in other components without accessing page.tsx
- **SC-004**: Code review time for page.tsx is reduced by 40% due to improved clarity and separation of concerns
- **SC-005**: Unit test coverage for checklist logic can be increased with focused tests on extracted utilities (testable in isolation)
- **SC-006**: Zero regressions in checklist functionality after refactoring (100% functional parity)
- **SC-007**: Developers can locate and understand specific business logic (e.g., next checklist detection) in under 2 minutes
