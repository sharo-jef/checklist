# Feature Specification: Simplify Conditional View Rendering

**Feature Branch**: `009-view-routing-logic`  
**Created**: 2025-11-19  
**Status**: Draft  
**Input**: User description: "Simplify view rendering with routing pattern"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Understanding View Transitions (Priority: P1)

When a developer needs to understand which view is shown for a given combination of `activeMenu` and `viewMode`, they should be able to consult a simple mapping structure rather than tracing through nested conditionals in JSX.

**Why this priority**: Complex conditional rendering (activeMenu × viewMode combinations) makes it difficult to understand application flow and which view renders when.

**Independent Test**: Can be fully tested by creating a view routing map and verifying all current view combinations are represented correctly.

**Acceptance Scenarios**:

1. **Given** a view routing map is created, **When** a developer looks up a (activeMenu, viewMode) combination, **Then** they immediately see which component/view renders
2. **Given** the routing is simplified, **When** a developer traces user navigation flow, **Then** they can follow view transitions through the routing map instead of parsing JSX conditionals

---

### User Story 2 - Adding New Views (Priority: P2)

When a new menu type or view mode is added to the application, the developer should be able to add it by updating a routing configuration rather than adding more nested conditional blocks to the JSX.

**Why this priority**: Nested conditionals grow increasingly complex with each new view, making additions error-prone.

**Independent Test**: Can be tested by adding a hypothetical new menu type and verifying it only requires updating the routing structure, not adding JSX conditionals.

**Acceptance Scenarios**:

1. **Given** a routing pattern is in place, **When** a new menu type is added, **Then** the developer updates only the routing map, not multiple conditional blocks
2. **Given** the system is extended, **When** views are rendered, **Then** the routing logic automatically handles the new menu without additional conditional complexity

---

### User Story 3 - Code Review and Maintenance (Priority: P3)

When reviewing view-related changes, reviewers should see updates to a declarative routing structure rather than modifications to deeply nested conditional JSX.

**Why this priority**: Conditional rendering buried in JSX is hard to review and verify for correctness.

**Independent Test**: Can be tested by comparing code review clarity before (nested JSX conditionals) and after (routing map updates).

**Acceptance Scenarios**:

1. **Given** view routing is centralized, **When** a reviewer examines view changes, **Then** they can verify routing logic without parsing complex JSX structures
2. **Given** a view is modified, **When** the change is reviewed, **Then** the impact is clear from routing map updates

---

### Edge Cases

- What happens when activeMenu and viewMode combinations don't have a defined view?
- How are default fallback views handled?
- What if certain views need special props or context that others don't?
- How is the routing pattern tested to ensure all menu/mode combinations are handled?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST define a mapping from (activeMenu, viewMode) combinations to their corresponding view components
- **FR-002**: The routing pattern MUST handle all current view combinations: default view, menu views (NORMAL, NON-NORMAL, RESETS), and checklist display views
- **FR-003**: The routing logic MUST replace nested conditional JSX with a lookup-based approach or component mapping pattern
- **FR-004**: The system MUST provide a default/fallback view for undefined combinations
- **FR-005**: View components MUST receive appropriate props based on the routing configuration
- **FR-006**: System MUST maintain 100% functional parity - all current views must render identically after refactoring
- **FR-007**: The routing structure MUST be easily extensible for new menu types or view modes without modifying render logic
- **FR-008**: The routing pattern MUST be colocated with the page component or extracted to a configuration file for easy discovery

### Key Entities

- **View Routing Map**: A data structure or pattern that maps (activeMenu, viewMode) combinations to view components
- **View State**: The combination of activeMenu and viewMode that determines which view is displayed
- **View Component**: The UI component rendered for a specific view state (e.g., ChecklistMenu, ChecklistDisplay, default view)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Conditional view rendering logic is reduced from nested if-else JSX blocks to a single routing lookup/mapping pattern
- **SC-002**: All current view combinations (default, NORMAL menu, NORMAL checklist, NON-NORMAL menu, NON-NORMAL checklist, RESETS menu) render identically
- **SC-003**: Adding a new menu type or view mode requires updating only the routing configuration, not JSX render logic (zero JSX conditional additions)
- **SC-004**: Developer comprehension of view transitions is improved - understanding all possible views takes under 3 minutes
- **SC-005**: Zero regressions in view rendering, navigation, or transitions
- **SC-006**: Code review time for view-related changes is reduced by 40% due to simplified structure
