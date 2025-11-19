# Feature Specification: Consolidate Item Status Checking Logic

**Feature Branch**: `001-consolidate-status-logic`  
**Created**: 2025-11-19  
**Status**: Draft  
**Input**: User description: "重複した状態判定ロジックの統合 - Consolidate duplicate item completion checking logic scattered across page.tsx, ChecklistMenu.tsx, and ChecklistDisplay.tsx into a single utility function in checklist.ts"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Modifies Status Checking Logic (Priority: P1)

When a developer needs to change how item completion is determined (e.g., adding a new status type or changing the definition of "complete"), they should only need to update code in one location to ensure consistency across the entire application.

**Why this priority**: This is the core value proposition. Duplicate logic creates maintenance burden and risk of inconsistency when business rules change.

**Independent Test**: Can be fully tested by changing the completion check definition in a single function and verifying all three components (page, menu, display) reflect the change without requiring individual updates.

**Acceptance Scenarios**:

1. **Given** item completion logic exists in one central location, **When** a developer updates the completion criteria, **Then** all components automatically reflect the new logic without requiring changes to each component
2. **Given** a new status type is added to the system, **When** the developer updates the central status checking function, **Then** menus, displays, and page logic all correctly recognize the new status

---

### User Story 2 - Bug Fix Propagation (Priority: P2)

When a bug is discovered in status checking logic (e.g., certain status combinations not recognized as complete), the fix should automatically apply to all locations using that logic.

**Why this priority**: Duplicate code means bugs must be fixed in multiple places, increasing risk of incomplete fixes.

**Independent Test**: Can be tested by introducing a deliberate bug in the central function and verifying all three components exhibit the same incorrect behavior, then fixing it once and verifying all components are corrected.

**Acceptance Scenarios**:

1. **Given** a bug exists in status checking logic, **When** the developer fixes it in the central function, **Then** all components (checklist display, menu completion indicators, next checklist logic) immediately reflect the correct behavior

---

### User Story 3 - Code Review and Comprehension (Priority: P3)

When a new developer joins the project or reviews the code, they should be able to understand the item completion logic by examining a single, clearly named utility function rather than hunting through multiple components.

**Why this priority**: Improved code readability and maintainability reduces onboarding time and code review effort.

**Independent Test**: Can be tested by having a developer unfamiliar with the codebase locate and explain the item completion logic within 2 minutes.

**Acceptance Scenarios**:

1. **Given** a new developer reviews the codebase, **When** they search for item status logic, **Then** they find a single, clearly documented function that defines all completion criteria
2. **Given** a code reviewer examines a component using status checks, **When** they trace the logic, **Then** they are directed to a central utility function with comprehensive documentation

---

### Edge Cases

- What happens when a component receives an unexpected status value not covered by the utility function?
- How does the system handle null or undefined status values?
- What if future status types are added - does the utility function provide clear extension points?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a single, centralized function that determines whether a checklist item is complete
- **FR-002**: The centralized function MUST correctly identify all current status types (`checked`, `overridden`, `checked-overridden`) as complete
- **FR-003**: The centralized function MUST correctly identify `unchecked` status as incomplete
- **FR-004**: All components currently checking item status MUST use the centralized function instead of inline logic
- **FR-005**: The centralized function MUST handle edge cases (null, undefined, unknown status values) gracefully with documented fallback behavior
- **FR-006**: System MUST maintain existing application behavior - all checklist functionality (completion indicators, menu states, next button logic) must work identically after consolidation
- **FR-007**: The consolidated logic MUST be located in a data/utility module accessible to all components
- **FR-008**: The function MUST have a clear, descriptive name that indicates its purpose (e.g., `isItemCompleted`, `checkItemComplete`)

### Key Entities

- **ChecklistItemStatus**: Represents the current state of a checklist item with possible values: `unchecked`, `checked`, `overridden`, `checked-overridden`
- **Completion Status**: A derived boolean indicating whether an item is considered "done" based on its status value

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Item completion checking logic exists in exactly one location, reducing code duplication from 3+ locations to 1
- **SC-002**: All existing checklist functionality continues to work without behavior changes (100% functional parity)
- **SC-003**: Future changes to status checking logic can be made in under 5 minutes by modifying a single function
- **SC-004**: Code review time for status-related logic is reduced by 60% (reviewers only need to examine one function)
- **SC-005**: Zero regressions in checklist completion detection, menu state indicators, or navigation logic after consolidation
