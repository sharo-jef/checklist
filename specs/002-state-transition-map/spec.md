# Feature Specification: Simplify State Transition Logic with Transition Map

**Feature Branch**: `002-state-transition-map`  
**Created**: 2025-11-19  
**Status**: Draft  
**Input**: User description: "handleToggleItem と handleItemOverride の複雑な状態遷移をシンプル化 - Simplify complex state transition logic in handleToggleItem and handleItemOverride using a state transition map pattern"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Developer Adds New Status Type (Priority: P1)

When the system needs to support a new item status (e.g., "skipped", "deferred"), the developer should be able to add it to a declarative state transition map without rewriting complex conditional logic in multiple handler functions.

**Why this priority**: Extensibility is critical for long-term maintainability. The current 70+ lines of nested conditionals make adding status types error-prone.

**Independent Test**: Can be fully tested by adding a new status type to the transition map and verifying toggle/override behaviors work correctly without modifying handler function logic.

**Acceptance Scenarios**:

1. **Given** a new status type needs to be added, **When** a developer updates the state transition map, **Then** toggle and override operations automatically handle the new status without requiring changes to handler logic
2. **Given** the transition map is updated, **When** a developer reviews the code, **Then** all possible state transitions are visible in a single, readable data structure

---

### User Story 2 - Bug Fix in State Transition (Priority: P2)

When a bug is found in how item status transitions work (e.g., `checked-overridden` should transition to `checked` instead of `unchecked` when toggled), the developer should be able to fix it by changing a single value in the transition map.

**Why this priority**: Bugs in state transitions are currently buried in nested conditionals, making them hard to locate and fix confidently.

**Independent Test**: Can be tested by intentionally introducing an incorrect transition in the map, verifying the buggy behavior, then correcting the map entry and confirming the fix.

**Acceptance Scenarios**:

1. **Given** a state transition behaves incorrectly, **When** the developer locates the transition in the map, **Then** they can correct it by changing a single value without parsing complex conditional logic
2. **Given** a transition is corrected in the map, **When** the application is tested, **Then** the corrected behavior applies to both toggle and override operations where applicable

---

### User Story 3 - Code Review for State Logic (Priority: P3)

When a code reviewer examines state transition logic, they should be able to understand all possible state transitions by reading a declarative map rather than tracing through nested if-else blocks.

**Why this priority**: The current 70+ line conditional blocks are difficult to review thoroughly, increasing the risk of bugs slipping through.

**Independent Test**: Can be tested by timing how long it takes a reviewer to understand all possible state transitions with the current vs. refactored approach.

**Acceptance Scenarios**:

1. **Given** a code reviewer examines state transition logic, **When** they open the transition map, **Then** they can see all possible transitions in under 1 minute
2. **Given** the reviewer wants to verify a specific transition, **When** they look up the source and target states, **Then** they find the expected outcome immediately without tracing execution paths

---

### Edge Cases

- What happens when the transition map doesn't have an entry for a specific status/action combination?
- How does the system handle an unexpected status value not defined in the map?
- What if the transition map is accidentally malformed or contains circular transitions?
- How are transitions validated during development to ensure correctness?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST define all item status transitions in a declarative data structure (map/table format)
- **FR-002**: The transition map MUST cover all current status types: `unchecked`, `checked`, `overridden`, `checked-overridden`
- **FR-003**: The transition map MUST define transitions for two action types: `toggle` and `override`
- **FR-004**: Toggle transitions MUST maintain existing behavior:
  - `unchecked` → `checked`
  - `checked` → `unchecked`
  - `overridden` → `unchecked`
  - `checked-overridden` → `unchecked`
- **FR-005**: Override transitions MUST maintain existing behavior:
  - `unchecked` → `overridden`
  - `checked` → `checked-overridden`
  - `overridden` → `unchecked`
  - `checked-overridden` → `unchecked`
- **FR-006**: Handler functions MUST use the transition map instead of nested conditional logic
- **FR-007**: System MUST handle missing transition map entries gracefully with a documented fallback behavior
- **FR-008**: The transition map MUST be colocated with related status logic for easy discovery
- **FR-009**: System MUST maintain 100% functional parity with existing toggle and override behaviors
- **FR-010**: The transition logic MUST support easy addition of new status types without modifying handler functions

### Key Entities

- **Action Type**: The user action being performed (`toggle` for item click, `override` for override button)
- **State Transition**: A mapping from (current status, action type) → new status
- **Transition Map**: A complete specification of all valid state transitions in the system

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: State transition logic is reduced from 70+ lines of conditionals to under 20 lines using a declarative map
- **SC-002**: All current item status behaviors continue to work identically (100% functional parity)
- **SC-003**: Adding a new status type requires changing only the transition map, not handler functions (zero handler modifications for new status types)
- **SC-004**: Code review time for state transition logic is reduced by 50% due to improved clarity
- **SC-005**: Developer comprehension of all possible state transitions can be achieved in under 2 minutes by examining the transition map
- **SC-006**: Zero regressions in toggle and override functionality after refactoring
