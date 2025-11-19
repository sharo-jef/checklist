# Feature Specification: Replace Magic Values with Named Constants

**Feature Branch**: `006-eliminate-magic-values`  
**Created**: 2025-11-19  
**Status**: Draft  
**Input**: User description: "Replace magic numbers with named constants"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Understanding Value Purpose (Priority: P1)

When a developer encounters a numeric value or repeated string in the code (e.g., `". ".repeat(400)`), they should immediately understand its purpose through a descriptive constant name rather than guessing or searching for comments.

**Why this priority**: Magic values obscure intent. Named constants serve as inline documentation explaining why specific values are used.

**Independent Test**: Can be fully tested by replacing one magic value with a named constant and verifying code reviewers can understand its purpose without additional context.

**Acceptance Scenarios**:

1. **Given** magic values are replaced with constants, **When** a developer reads the code, **Then** they understand the purpose of each value through its constant name
2. **Given** a constant like `CHECKLIST_ITEM_DOTTED_LINE_LENGTH`, **When** a developer sees it in use, **Then** they immediately know it controls the separator line length

---

### User Story 2 - Changing Shared Values Consistently (Priority: P2)

When a value is used in multiple locations (e.g., timing delays or UI dimensions), changing it should require updating a single constant definition rather than hunting through code for all occurrences.

**Why this priority**: Duplicate magic values create inconsistency risk when updated. Centralized constants ensure coordinated changes.

**Independent Test**: Can be tested by changing a constant value and verifying all usages reflect the change without individual modifications.

**Acceptance Scenarios**:

1. **Given** a value is used in multiple places, **When** a developer updates the constant, **Then** all locations using that constant reflect the change automatically
2. **Given** a UI dimension needs adjustment, **When** the constant is modified, **Then** all components using it update consistently

---

### User Story 3 - Code Review and Maintenance (Priority: P3)

When reviewing code changes involving numeric values, reviewers should see semantic constant names that indicate whether values are arbitrary, calculated, or have specific meaning.

**Why this priority**: Magic numbers in diffs are cryptic. Named constants make code changes self-documenting.

**Independent Test**: Can be tested by comparing code review time for changes using magic values vs. named constants.

**Acceptance Scenarios**:

1. **Given** code uses named constants, **When** a reviewer examines a change, **Then** they understand value semantics without asking for clarification
2. **Given** a constant is changed in a pull request, **When** reviewers see the diff, **Then** the constant name explains the change's impact

---

### Edge Cases

- What happens if a constant is used in only one location - should it still be extracted?
- How are constants organized (single file vs. colocated with usage)?
- What if values need to be computed or derived from other constants?
- How are timing-related values (`setTimeout(..., 0)`) handled consistently?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST replace `". ".repeat(400)` with a named constant (e.g., `CHECKLIST_ITEM_DOTTED_LINE_LENGTH` or `DOTTED_SEPARATOR_REPEATS`)
- **FR-002**: System MUST replace `setTimeout(..., 0)` with `queueMicrotask()` for consistency with existing codebase patterns
- **FR-003**: All timing delays (including `setTimeout` calls) MUST use named constants to explain their purpose
- **FR-004**: Constants MUST be defined in appropriate locations (component-level for local use, shared constants file for global use)
- **FR-005**: Constant names MUST be descriptive and indicate the value's purpose (e.g., `ACTIVE_ITEM_UPDATE_DELAY` instead of `TIMEOUT_DELAY`)
- **FR-006**: System MUST maintain 100% functional parity - replacing values with constants must not change application behavior
- **FR-007**: Constants MUST use TypeScript const assertions or readonly where applicable to prevent accidental modification
- **FR-008**: Numeric values with clear semantic meaning MUST be extracted to constants; arbitrary single-use values MAY remain inline with explanatory comments

### Key Entities

- **Named Constant**: A semantically meaningful identifier for a value used in the application
- **Magic Value**: A numeric or string literal whose purpose is not immediately clear from context

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All instances of repeated string `". ".repeat(400)` are replaced with a single named constant
- **SC-002**: All `setTimeout(..., 0)` calls are replaced with `queueMicrotask()` for consistency
- **SC-003**: Developer comprehension of value purposes is improved - reviewers can understand value semantics without asking questions
- **SC-004**: Code review time for value-related changes is reduced by 30% due to self-documenting constant names
- **SC-005**: Zero regressions in application behavior after replacing magic values with constants
- **SC-006**: Future changes to shared values require modifications in only one location (the constant definition)
