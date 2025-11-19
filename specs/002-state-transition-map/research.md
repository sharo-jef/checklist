# Research: State Transition Map Patterns

**Feature**: Simplify State Transition Logic with Transition Map  
**Date**: 2025-11-19  
**Purpose**: Research best practices for implementing declarative state transition maps in TypeScript/React to replace 70+ lines of nested conditionals.

## Research Questions

1. What are the most common approaches for implementing declarative state transitions in TypeScript?
2. How to ensure compile-time type safety that all state/action combinations are covered?
3. What are best practices for error handling in map-based state transitions?
4. How do state transition maps integrate with React hooks?
5. What testing strategies validate state transition correctness?

## Findings

### 1. State Machine Pattern Selection

**Decision**: Use simple nested `Record` objects (no state machine library)

**Rationale**:

- **Scale-appropriate**: Our 4 states × 2 actions = 8 transitions fit on one screen
- **Zero dependencies**: No library overhead (XState is 50KB, overkill for simple transitions)
- **TypeScript native**: Full type safety without external tooling
- **Readability**: Transitions are self-documenting in table format
- **Testability**: Easy to test every transition systematically

**Alternatives considered**:

- **XState**: Excellent for complex workflows with guards, hierarchical states, and side effects. Rejected due to 50KB bundle size and learning curve for a simple 4-state machine.
- **robot3**: Lightweight (1KB) functional state machine. Rejected because it doesn't add significant value over plain objects for our use case and has weaker TypeScript support.
- **Custom class-based state machine**: More boilerplate than needed for a simple transition map.

### 2. TypeScript Type Safety Strategy

**Decision**: Use mapped types with exhaustiveness checking

**Pattern**:

```typescript
type Action = "toggle" | "override";

type TransitionMap = {
  [K in ChecklistItemStatus]: {
    [A in Action]: ChecklistItemStatus;
  };
};

const TRANSITIONS: TransitionMap = {
  unchecked: { toggle: "checked", override: "overridden" },
  checked: { toggle: "unchecked", override: "checked-overridden" },
  overridden: { toggle: "unchecked", override: "unchecked" },
  "checked-overridden": { toggle: "unchecked", override: "unchecked" },
};
```

**Rationale**:

- Mapped types (`[K in Status]`) force TypeScript to ensure all statuses have entries
- Nested structure ensures every action is defined for every status
- Compile-time error if any status is missing from the map
- No runtime enumeration needed - type system enforces completeness

**Alternatives considered**:

- Flat map with composite keys (`'unchecked:toggle'`): Less type-safe, requires manual key construction, more error-prone
- Branded types for runtime validation: Unnecessary complexity for a closed set of known statuses

### 3. Error Handling Approach

**Decision**: Fail-fast in development, graceful fallback in production

**Pattern**:

```typescript
export function transition(
  currentStatus: ChecklistItemStatus,
  action: Action
): ChecklistItemStatus {
  const nextStatus = TRANSITIONS[currentStatus]?.[action];

  if (!nextStatus) {
    const error = `Invalid transition: status="${currentStatus}" action="${action}"`;

    if (process.env.NODE_ENV === "development") {
      throw new Error(error); // Immediate feedback
    }

    console.error(error);
    return currentStatus; // No-op transition in production
  }

  return nextStatus;
}
```

**Rationale**:

- Development errors surface immediately during testing
- Production failures don't break the UI - item stays in current state
- Logged errors provide debugging context
- TypeScript exhaustiveness checking should prevent this branch from executing

**Alternatives considered**:

- Always throw: Too aggressive for production - minor bugs shouldn't crash the app
- Always silent fallback: Hides bugs during development

### 4. React Integration Pattern

**Decision**: Separate pure transition logic from React state updates

**Pattern**:

```typescript
// Pure function - no React dependencies
export function transition(status: Status, action: Action): Status { ... }

// React handler uses the pure function
const handleToggleItem = (itemId: string) => {
  const currentItem = getCurrentItem(itemId);
  const newStatus = transition(currentItem.status, 'toggle');

  updateItemStatus(categoryId, checklistId, itemId, newStatus);
  updateActiveItemIndex(itemId, newStatus); // UI logic separate
};
```

**Rationale**:

- Pure functions are trivial to test (no mocking needed)
- Transition logic has zero React dependencies
- Easy to reuse in different contexts (e.g., bulk operations)
- Active item index logic (UI concern) stays separate from state transitions (domain logic)

**Alternatives considered**:

- Custom hook `useTransition(status, action)`: Overengineered - no state is stored in the hook, it's just a function call
- Class-based state machine: Doesn't integrate as cleanly with functional React components

### 5. Testing Strategy

**Decision**: Transition table testing with exhaustive coverage check

**Pattern**:

```typescript
describe("Status Transitions", () => {
  const testCases: Array<[Status, Action, Status]> = [
    ["unchecked", "toggle", "checked"],
    ["unchecked", "override", "overridden"],
    ["checked", "toggle", "unchecked"],
    ["checked", "override", "checked-overridden"],
    ["overridden", "toggle", "unchecked"],
    ["overridden", "override", "unchecked"],
    ["checked-overridden", "toggle", "unchecked"],
    ["checked-overridden", "override", "unchecked"],
  ];

  test.each(testCases)(
    "transition from %s via %s should result in %s",
    (from, action, expected) => {
      expect(transition(from, action)).toBe(expected);
    }
  );
});

describe("Coverage", () => {
  test("all status/action combinations are defined", () => {
    const statuses: Status[] = [
      "unchecked",
      "checked",
      "overridden",
      "checked-overridden",
    ];
    const actions: Action[] = ["toggle", "override"];

    statuses.forEach((status) => {
      actions.forEach((action) => {
        expect(TRANSITIONS[status][action]).toBeDefined();
      });
    });
  });
});
```

**Rationale**:

- Table-driven tests document all transitions explicitly
- Coverage test ensures no gaps in the map
- Easy to add new test cases when adding statuses
- No complex mocking - testing pure functions

**Alternatives considered**:

- Property-based testing (fast-check): Overkill for a finite, fully-known state space
- Integration tests only: Misses edge cases in the transition logic itself

## Implementation Recommendations

### File Structure

Create `src/utils/transitions.ts` with:

1. Action type definition (`'toggle' | 'override'`)
2. TransitionMap type (mapped type ensuring exhaustiveness)
3. TRANSITIONS constant (the actual map)
4. `transition(status, action)` function (with error handling)
5. Convenience helpers: `toggleStatus(status)`, `overrideStatus(status)`

### Migration Path

1. **Create `transitions.ts`** with the map and helper functions
2. **Refactor `handleToggleItem`** to use `toggleStatus()`
3. **Refactor `handleItemOverride`** to use `overrideStatus()`
4. **Preserve active index logic** unchanged (UI concern, separate from state transitions)
5. **Add transition tests** to validate all 8 transitions
6. **Verify functional parity** through manual testing

### Key Gotchas

1. **Active item index logic**: Keep this separate from transition logic - it's UI state, not domain state
2. **setTimeout in handlers**: Current code uses `setTimeout(..., 0)` for active index updates - preserve this timing behavior
3. **LocalStorage compatibility**: Transition map doesn't affect storage format - `itemStates` structure unchanged
4. **Testing gap**: Currently no automated tests - add transition tests first for regression safety
5. **Future extensibility**: If conditional transitions are needed later (e.g., "can't override required items"), upgrade to function-based map

### Expected Outcomes

- **LOC reduction**: 70+ lines of conditionals → ~15 lines using the map (75% reduction)
- **Type safety**: Compile-time guarantees all transitions are defined
- **Maintainability**: New status types = update map only, zero handler changes
- **Readability**: All transitions visible in a single table
- **Testability**: Every transition independently testable

## References

- TypeScript Handbook: Mapped Types - https://www.typescriptlang.org/docs/handbook/2/mapped-types.html
- XState documentation (for comparison) - https://xstate.js.org/
- State pattern (Gang of Four) - classical OOP state machine approach
- Finite State Machines in React - https://kentcdodds.com/blog/implementing-a-simple-state-machine-library-in-javascript

## Conclusion

For this feature's small, well-defined state space (4 statuses × 2 actions), a simple TypeScript `Record`-based transition map provides the optimal balance of:

- **Simplicity**: No external dependencies, minimal code
- **Type safety**: Compile-time exhaustiveness checking
- **Maintainability**: Declarative, self-documenting transitions
- **Testability**: Pure functions, easy to validate

This approach aligns with the project's constitution principles (static-first, type safety, minimal dependencies) while achieving the feature's success criteria (70+ lines → <20 lines, easy extensibility, improved clarity).
