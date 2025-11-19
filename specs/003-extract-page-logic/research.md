# Research: Extracting Business Logic from React Components

**Feature**: Extract Business Logic from Page Component  
**Branch**: `003-extract-page-logic`  
**Date**: 2025-11-20  
**Researcher**: GitHub Copilot  
**Context**: Next.js 16 + React 19 static export application

## Executive Summary

This research addresses best practices for extracting business logic from a 450-line `page.tsx` component into custom hooks and utilities. The analysis focuses on six critical decision points for React 19 applications with static export constraints and hydration safety requirements.

**Key Findings**:

- **Hook vs Utility decision**: Use hooks for React-lifecycle-dependent logic, utilities for pure computations
- **Navigation patterns**: Memoized derived state for navigation is optimal for this use case
- **Dependency injection**: Props/parameters pattern preferred over context for this scope
- **Testing**: React Testing Library with `renderHook` for isolated hook testing
- **Circular dependencies**: Avoided via layered architecture (data → utils → hooks → components)

---

## Research Question 1: Hook vs Utility Decision Criteria

### Decision/Recommendation

**Use custom hooks when**:

- Logic depends on React lifecycle (useState, useEffect, useContext)
- Logic manages component state or side effects
- Logic needs to subscribe to React updates
- Logic uses other React hooks

**Use pure utility functions when**:

- Logic is a pure computation with no side effects
- Logic operates only on arguments passed to it
- Logic doesn't depend on component lifecycle
- Logic can be tested without React Test Renderer

**For this codebase specifically**:

- `getFirstUncheckedIndex` → **Pure utility** (computes index from data and itemStates)
- `getNextIncompleteChecklist` → **Pure utility** (finds next checklist based on data)
- `hasNextChecklist` → **Derived computation** (could be either, see Question 3)
- Active item index management → **Custom hook** (manages state with setActiveItemIndex)

### Rationale

**Why this separation**:

1. **Testability**: Pure utilities can be tested without React Testing Library, with simple input/output assertions. This is faster and easier to maintain.

2. **Reusability**: Pure utilities can be used in non-React contexts (Node.js scripts, server components in future, web workers).

3. **Performance**: Pure functions are easily memoizable and don't trigger React re-renders.

4. **Predictability**: Pure functions have no hidden dependencies on React context, making them easier to reason about.

5. **Bundle size**: Utilities don't require React runtime code in their execution path.

**React 19 specific considerations**:

- React 19's automatic batching means hooks trigger fewer re-renders, but pure utilities still avoid render cycles entirely
- The React Compiler (enabled in this project) can optimize hooks better when they're simple and focused
- Static export constraint means no server components, so the hook/utility distinction is purely about lifecycle, not server/client boundaries

### Alternatives Considered

**Alternative 1: Everything in hooks**

- **Pros**: Consistent pattern, easier to refactor later if state is needed
- **Cons**: Unnecessary React overhead, harder to test, couples logic to React
- **Why rejected**: Violates separation of concerns; pure computations shouldn't require React

**Alternative 2: Everything as utilities, use them inside one navigation hook**

- **Pros**: Maximum testability, clear separation
- **Cons**: Hook becomes a thin wrapper, extra indirection
- **Why partially adopted**: Good for pure computations, but some logic genuinely needs React state

**Alternative 3: Class-based service pattern (non-React)**

- **Pros**: Familiar OOP pattern, testable
- **Cons**: Non-idiomatic in React, doesn't integrate with React's reactivity
- **Why rejected**: React 19 is moving away from classes; hooks are the standard

### Example Pattern

```typescript
// ✅ GOOD: Pure utility for computation
// src/utils/navigation.ts
export function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number {
  const category = checklistData.find((cat) => cat.id === categoryId);
  const checklist = category?.checklists[0];

  if (!checklist) return -1;

  return checklist.items.findIndex(
    (item) =>
      (itemStates[categoryId]?.[checklist.id]?.[item.id] ?? "unchecked") ===
      "unchecked"
  );
}

// ✅ GOOD: Custom hook for React state management
// src/hooks/useActiveItem.ts
export function useActiveItem(initialIndex: number = 0) {
  const [activeItemIndex, setActiveItemIndex] = useState(initialIndex);

  const resetToFirst = useCallback(() => {
    setActiveItemIndex(0);
  }, []);

  const updateActiveItem = useCallback((newIndex: number) => {
    setActiveItemIndex(newIndex >= 0 ? newIndex : -1);
  }, []);

  return {
    activeItemIndex,
    updateActiveItem,
    resetToFirst,
  };
}

// ✅ GOOD: Usage in component
function Page() {
  const { activeItemIndex, updateActiveItem } = useActiveItem();
  const { itemStates } = useChecklist({ categories: checklistData });

  const firstUnchecked = getFirstUncheckedIndex(
    activeCategory,
    checklistData,
    itemStates
  );

  useEffect(() => {
    updateActiveItem(firstUnchecked);
  }, [firstUnchecked, updateActiveItem]);
}
```

**Why this works**:

- `getFirstUncheckedIndex` is pure → easily testable, reusable, performant
- `useActiveItem` manages React state → integrates with component lifecycle
- Component orchestrates the two → separation of concerns

---

## Research Question 2: Navigation Hook Patterns

### Decision/Recommendation

**Recommended pattern: Memoized derived state with navigation utilities**

For this codebase, navigation logic should be split into:

1. **Pure utilities** for computing navigation data (next checklist, has next, first unchecked)
2. **useMemo** in the component for caching expensive computations
3. **Optional: Custom navigation hook** if multiple components need the same navigation logic

**Specific recommendation for this refactor**:

```typescript
// src/utils/navigation.ts - Pure utilities
export const NavigationUtils = {
  getFirstUncheckedIndex(categoryId, checklistData, itemStates),
  getNextIncompleteChecklist(menuType, checklistData, itemStates),
  hasNextChecklist(activeCategory, checklistData, menuType),
}

// src/app/page.tsx - Memoized consumption
const navigation = useMemo(() => ({
  firstUnchecked: NavigationUtils.getFirstUncheckedIndex(...),
  nextChecklist: NavigationUtils.getNextIncompleteChecklist(...),
  hasNext: NavigationUtils.hasNextChecklist(...),
}), [activeCategory, itemStates, checklistData]);
```

### Rationale

**Why memoized derived state**:

1. **React 19 optimization**: The React Compiler can detect and optimize these patterns automatically
2. **Predictable updates**: Navigation only recomputes when dependencies change (activeCategory, itemStates)
3. **No extra state**: Avoids synchronization bugs from storing derived data in state
4. **Performance**: useMemo prevents recalculation on every render
5. **Debuggability**: Easy to see what triggers navigation recalculation via dependency array

**Why NOT store navigation in separate state**:

- Synchronization risk: If itemStates updates but navigation state doesn't, UI is stale
- Double renders: Updating itemStates triggers navigation state update → two render cycles
- Memory overhead: Storing data that can be computed from existing state

**When to extract to a custom hook**:

- If 2+ components need identical navigation logic
- If navigation logic becomes complex (e.g., history tracking, undo/redo)
- If you want to unit test navigation logic in isolation with `renderHook`

### Alternatives Considered

**Alternative 1: Store navigation in component state**

```typescript
const [navigation, setNavigation] = useState({ hasNext: false, ... });

useEffect(() => {
  setNavigation({
    hasNext: hasNextChecklist(...),
    // ...
  });
}, [activeCategory, itemStates]);
```

- **Pros**: Explicit control, familiar pattern
- **Cons**: Extra state, synchronization bugs, double renders, more code
- **Why rejected**: Unnecessary complexity; derived data should be computed, not stored

**Alternative 2: Compute on-demand (no memoization)**

```typescript
// In component body
const hasNext = hasNextChecklist(...);
const firstUnchecked = getFirstUncheckedIndex(...);
```

- **Pros**: Simplest code, always fresh
- **Cons**: Recomputes every render, potential performance issue
- **Why conditionally rejected**: Acceptable for cheap computations, but `getNextIncompleteChecklist` iterates over all categories → should memoize

**Alternative 3: Custom hook with internal state**

```typescript
function useNavigation({ activeCategory, itemStates, checklistData }) {
  const [hasNext, setHasNext] = useState(false);
  // ... manage state
}
```

- **Pros**: Encapsulation, testable with renderHook
- **Cons**: Extra state management overhead, over-engineering for current needs
- **Why rejected**: Premature abstraction; extract only if reused elsewhere

### Example Pattern

```typescript
// ============================================================================
// OPTION A: Pure utilities + useMemo (RECOMMENDED for this refactor)
// ============================================================================

// src/utils/navigation.ts
export function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean {
  const categories = checklistData.filter((cat) => cat.menuType === menuType);
  const currentIndex = categories.findIndex((cat) => cat.id === activeCategory);
  return currentIndex >= 0 && currentIndex < categories.length - 1;
}

// src/app/page.tsx
function Page() {
  const { activeCategory, itemStates } = useChecklist({ categories: checklistData });

  // Memoize navigation to avoid recalculation every render
  const navigation = useMemo(() => {
    return {
      hasNext: hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
      firstUnchecked: getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
      nextChecklist: getNextIncompleteChecklist(MenuType.NORMAL, checklistData, itemStates),
    };
  }, [activeCategory, itemStates]); // Recompute only when these change

  return (
    <ChecklistDisplay
      hasNextChecklist={navigation.hasNext}
      onNext={() => {
        setActiveCategory(navigation.nextChecklist);
        setActiveItemIndex(navigation.firstUnchecked);
      }}
    />
  );
}

// ============================================================================
// OPTION B: Custom hook (if multiple components need navigation)
// ============================================================================

// src/hooks/useChecklistNavigation.ts
export function useChecklistNavigation({
  activeCategory,
  menuType,
  checklistData,
  itemStates,
}: {
  activeCategory: string;
  menuType: MenuType;
  checklistData: ChecklistCategory[];
  itemStates: ItemStatesMap;
}) {
  return useMemo(() => {
    const categories = checklistData.filter((cat) => cat.menuType === menuType);
    const currentIndex = categories.findIndex((cat) => cat.id === activeCategory);

    return {
      hasNext: currentIndex >= 0 && currentIndex < categories.length - 1,
      hasPrevious: currentIndex > 0,
      nextCategoryId: currentIndex < categories.length - 1
        ? categories[currentIndex + 1].id
        : null,
      previousCategoryId: currentIndex > 0
        ? categories[currentIndex - 1].id
        : null,
      currentIndex,
      totalCount: categories.length,
      firstUncheckedIndex: getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
    };
  }, [activeCategory, menuType, checklistData, itemStates]);
}

// Usage
const navigation = useChecklistNavigation({
  activeCategory,
  menuType: MenuType.NORMAL,
  checklistData,
  itemStates,
});
```

**React Compiler note**: With `babel-plugin-react-compiler` enabled in this project, the compiler can automatically memoize many of these patterns. However, explicit `useMemo` is still recommended for expensive computations to signal intent.

---

## Research Question 3: Derived State Patterns

### Decision/Recommendation

**Use computed-on-demand with useMemo for this codebase**

Navigation computations should be:

1. **Implemented as pure utility functions** (no side effects)
2. **Memoized with useMemo** when used in components (avoid recalculation)
3. **NOT stored in separate state** (avoid synchronization issues)

**Decision matrix**:

| Computation                    | Pattern             | Justification                                       |
| ------------------------------ | ------------------- | --------------------------------------------------- |
| `hasNextChecklist()`           | Pure util + useMemo | Simple predicate, fast, derived from activeCategory |
| `getNextIncompleteChecklist()` | Pure util + useMemo | Iterates categories, should memoize                 |
| `getFirstUncheckedIndex()`     | Pure util + useMemo | Iterates items, should memoize                      |
| Active item index              | useState            | Must persist across renders, not derived            |

### Rationale

**Why computed-on-demand + memoization**:

1. **Single source of truth**: Navigation is always derived from `itemStates` and `activeCategory`. No synchronization bugs.

2. **Automatic freshness**: When `itemStates` updates (user checks item), navigation automatically recalculates. No manual sync logic.

3. **Performance**: `useMemo` caches results until dependencies change. React 19's improved reconciliation + React Compiler makes this very efficient.

4. **Debuggability**: Easy to trace: "itemStates changed → useMemo recomputes → component re-renders with fresh navigation"

5. **Memory efficiency**: No duplicate storage of derived data. State only holds source data (`itemStates`, `activeCategory`).

**Why NOT store in state**:

```typescript
// ❌ ANTI-PATTERN: Storing derived data in state
const [hasNext, setHasNext] = useState(false);

useEffect(() => {
  // Problem: Must manually keep in sync with activeCategory
  const next = hasNextChecklist(activeCategory, ...);
  setHasNext(next);
}, [activeCategory]); // Easy to forget dependencies → stale state
```

**Problems**:

- Extra state management code (useState + useEffect)
- Synchronization bugs if dependencies are missed
- Double renders (state update triggers effect → state update)
- Testing complexity (must test state sync logic)

**When to store in state instead**:

- Value is **not derived** (e.g., user input, server response)
- Value must **persist across unmounts** (use localStorage + useState)
- Value updates **asynchronously** (e.g., debounced search, API call)

### Alternatives Considered

**Alternative 1: useReducer for complex navigation state**

```typescript
const [navState, dispatch] = useReducer(navigationReducer, initialState);
```

- **Pros**: Centralized state logic, good for complex state machines
- **Cons**: Overkill for simple derived computations, more boilerplate
- **Why rejected**: Navigation is derived, not complex state transitions

**Alternative 2: Reselect-style selectors (like Redux)**

```typescript
const selectHasNext = createSelector(
  [(state) => state.activeCategory, (state) => state.checklistData],
  (activeCategory, checklistData) =>
    hasNextChecklist(activeCategory, checklistData)
);
```

- **Pros**: Advanced memoization (structural sharing), familiar to Redux users
- **Cons**: Extra dependency, overkill for React-only app, useMemo is sufficient
- **Why rejected**: No Redux in this project, useMemo handles memoization needs

**Alternative 3: Store in ref (useRef)**

```typescript
const navigationRef = useRef({ hasNext: false, ... });
```

- **Pros**: No re-renders when updated, persistent across renders
- **Cons**: Updates don't trigger re-renders → UI won't update! Completely wrong for this use case
- **Why rejected**: Navigation changes must trigger re-renders to update UI

### Example Pattern

```typescript
// ============================================================================
// RECOMMENDED: Pure utilities + useMemo
// ============================================================================

// src/utils/navigation.ts
export function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean {
  const categories = checklistData.filter((cat) => cat.menuType === menuType);
  const currentIndex = categories.findIndex((cat) => cat.id === activeCategory);
  return currentIndex >= 0 && currentIndex < categories.length - 1;
}

export function getNextIncompleteChecklist(
  menuType: MenuType,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): string | null {
  const categories = checklistData.filter((cat) => cat.menuType === menuType);

  for (const category of categories) {
    const checklist = category.checklists[0];
    if (!checklist) continue;

    const checklistState = itemStates[category.id]?.[checklist.id];
    if (!checklistState) return category.id;

    const isComplete = checklist.items.every((item) => {
      const status = checklistState[item.id];
      return isItemComplete(status);
    });

    if (!isComplete) return category.id;
  }

  return categories[categories.length - 1]?.id ?? null;
}

// src/app/page.tsx
function Page() {
  const { activeCategory, itemStates } = useChecklist({ categories: checklistData });

  // Memoize expensive navigation computations
  const navigation = useMemo(() => {
    return {
      hasNext: hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
      nextChecklistId: getNextIncompleteChecklist(MenuType.NORMAL, checklistData, itemStates),
      firstUncheckedIndex: getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
    };
  }, [activeCategory, itemStates]);

  // Use navigation data in JSX
  return (
    <ChecklistDisplay
      hasNextChecklist={navigation.hasNext}
      onNext={() => {
        if (navigation.nextChecklistId) {
          setActiveCategory(navigation.nextChecklistId);
          setActiveItemIndex(navigation.firstUncheckedIndex);
        }
      }}
    />
  );
}
```

**Performance note**: The React Compiler (enabled in this project) can automatically optimize many patterns, but explicit `useMemo` is still valuable for signaling intent and guaranteeing memoization for expensive operations.

---

## Research Question 4: Hook Dependencies & Coupling

### Decision/Recommendation

**Use explicit parameter passing (dependency injection) for extracted hooks**

Hooks should accept all required data as parameters rather than importing global state or using React Context:

```typescript
// ✅ GOOD: Explicit dependencies
function useChecklistNavigation({
  activeCategory,
  menuType,
  checklistData,
  itemStates,
}: NavigationHookProps) {
  // ... logic using passed parameters
}

// ❌ AVOID: Implicit dependencies
function useChecklistNavigation() {
  const { activeCategory } = useActiveCategory(); // Hidden coupling
  const { itemStates } = useChecklist(); // Hidden coupling
  // ...
}
```

**Why this matters for this codebase**:

- `checklistData` is imported from `@/data/checklists` (immutable)
- `itemStates` comes from `useChecklist` hook (runtime state)
- `activeCategory` is managed in `page.tsx` (local state)

**Recommended approach**: Pass as parameters, not via context or imports.

### Rationale

**Why explicit parameter passing**:

1. **Testability**: Can test hook in isolation by passing mock data, no need to mock context providers or global imports

2. **Reusability**: Hook can be used with different data sources (e.g., different checklist sets, test fixtures)

3. **Predictability**: Hook's dependencies are visible in its signature, not hidden in implementation

4. **Type safety**: TypeScript ensures all required parameters are provided at call site

5. **Refactorability**: Changing data source (e.g., from local state to context) only requires updating call site, not hook internals

6. **React Compiler optimization**: Explicit dependencies help the compiler optimize re-renders

**React 19 context considerations**:

- React Context is for **cross-cutting concerns** (theme, auth, i18n) used by many components
- This checklist state is **localized** to one component tree
- Using Context would be over-engineering and add complexity

**When to use Context instead**:

- Data needed by 5+ components at different nesting levels
- Prop drilling becomes unwieldy (passing through 3+ intermediate components)
- Data represents global app state (auth, theme, feature flags)

**For this codebase**: Only `page.tsx` needs navigation logic currently. Context is unnecessary.

### Alternatives Considered

**Alternative 1: React Context for checklist state**

```typescript
const ChecklistContext = createContext();

function useChecklistNavigation() {
  const { activeCategory, itemStates } = useContext(ChecklistContext);
  // ... logic
}
```

- **Pros**: No prop passing, globally accessible
- **Cons**: Overkill for single-component usage, harder to test, hides dependencies
- **Why rejected**: Premature abstraction; only `page.tsx` uses this logic currently

**Alternative 2: Import checklistData directly in hooks**

```typescript
import { checklistData } from "@/data/checklists";

function useChecklistNavigation(activeCategory: string) {
  // Use imported checklistData directly
}
```

- **Pros**: Fewer parameters, simpler call site
- **Cons**: Couples hook to specific data source, can't test with different data
- **Why partially adopted**: Acceptable for immutable data like `checklistData`, but still prefer passing for testability

**Alternative 3: Singleton pattern (class instance)**

```typescript
class NavigationManager {
  constructor(private checklistData) {}
  hasNext(activeCategory) { ... }
}

const navigation = new NavigationManager(checklistData);
```

- **Pros**: OOP familiar, encapsulation
- **Cons**: Non-idiomatic in React, doesn't integrate with React's reactivity
- **Why rejected**: React hooks are the standard, better ecosystem support

### Example Pattern

```typescript
// ============================================================================
// RECOMMENDED: Explicit dependency injection
// ============================================================================

// src/hooks/useChecklistNavigation.ts
interface UseChecklistNavigationProps {
  activeCategory: string;
  menuType: MenuType;
  checklistData: ChecklistCategory[]; // Pass explicitly, even if imported elsewhere
  itemStates: ItemStatesMap;
}

export function useChecklistNavigation({
  activeCategory,
  menuType,
  checklistData,
  itemStates,
}: UseChecklistNavigationProps) {
  return useMemo(() => {
    const categories = checklistData.filter((cat) => cat.menuType === menuType);
    const currentIndex = categories.findIndex((cat) => cat.id === activeCategory);

    return {
      hasNext: currentIndex >= 0 && currentIndex < categories.length - 1,
      nextChecklistId: categories[currentIndex + 1]?.id ?? null,
      // ...
    };
  }, [activeCategory, menuType, checklistData, itemStates]);
}

// src/app/page.tsx
function Page() {
  const { activeCategory, itemStates } = useChecklist({ categories: checklistData });

  const navigation = useChecklistNavigation({
    activeCategory,
    menuType: MenuType.NORMAL,
    checklistData, // Pass explicitly
    itemStates,     // Pass from useChecklist
  });

  return <ChecklistDisplay hasNextChecklist={navigation.hasNext} />;
}

// ============================================================================
// TESTING: Easy to test with mock data
// ============================================================================

import { renderHook } from "@testing-library/react";

test("useChecklistNavigation - hasNext is true when not on last checklist", () => {
  const mockData = [
    { id: "cat1", menuType: MenuType.NORMAL, checklists: [...] },
    { id: "cat2", menuType: MenuType.NORMAL, checklists: [...] },
  ];

  const { result } = renderHook(() =>
    useChecklistNavigation({
      activeCategory: "cat1",
      menuType: MenuType.NORMAL,
      checklistData: mockData,
      itemStates: {},
    })
  );

  expect(result.current.hasNext).toBe(true);
});
```

**Dependency injection benefits**:

- Test passes mock data directly, no need to set up context providers
- Can test edge cases (empty data, single checklist, etc.) by passing different parameters
- No hidden dependencies on global imports or context

---

## Research Question 5: Testing Isolated Hooks

### Decision/Recommendation

**Use React Testing Library's `renderHook` for isolated hook testing**

For this codebase, extracted hooks should be tested with:

1. **Pure utilities**: Simple Jest tests with input/output assertions (no React needed)
2. **Custom hooks**: `renderHook` from `@testing-library/react` for lifecycle testing
3. **Integration tests**: Manual testing (existing pattern) for full component interactions

**Recommended testing structure**:

```
src/
├── utils/
│   ├── navigation.ts
│   └── navigation.test.ts          # Jest unit tests (pure functions)
├── hooks/
│   ├── useChecklistNavigation.ts
│   └── useChecklistNavigation.test.ts  # renderHook tests
└── app/
    ├── page.tsx
    └── page.test.tsx               # Component integration tests (if added later)
```

### Rationale

**Why React Testing Library + renderHook**:

1. **React 19 compatibility**: RTL is the recommended testing library for React 19, actively maintained

2. **Realistic environment**: Tests run in a real React environment with hooks lifecycle, not mocked

3. **Simple API**: `renderHook` provides a clean API for testing hooks in isolation

4. **Ecosystem support**: Most React libraries and hooks are tested with RTL, extensive documentation

5. **Future-proof**: Works with React Compiler, Server Components (if ever needed), Suspense

6. **Debugging**: RTL's error messages are clear, show actual React errors

**Why NOT older testing approaches**:

- **Enzyme**: Deprecated, doesn't support React 18+, shallow rendering is anti-pattern
- **react-hooks-testing-library**: Merged into RTL, `renderHook` is now built-in
- **Manual mock components**: Brittle, requires maintaining test harness components

**For this codebase specifically**:

- No automated tests currently (manual testing only)
- Adding hook tests is **optional** but recommended if hooks become complex
- Pure utilities should have tests (fast, easy, high value)

### Alternatives Considered

**Alternative 1: Test through component integration tests only**

```typescript
// Test hook behavior by testing the component that uses it
test("page shows next button when not on last checklist", () => {
  render(<Page />);
  expect(screen.getByText("NEXT")).toBeInTheDocument();
});
```

- **Pros**: Tests real usage, catches integration issues
- **Cons**: Slow, hard to test all hook edge cases, brittle (UI changes break tests)
- **Why supplementary**: Good for critical user flows, but not sufficient for unit testing logic

**Alternative 2: Extract logic to pure functions, test those instead of hooks**

```typescript
// Avoid hooks entirely, only test pure utilities
export function hasNextChecklist(...) { ... }

test("hasNextChecklist returns true when not on last", () => {
  expect(hasNextChecklist("cat1", mockData, MenuType.NORMAL)).toBe(true);
});
```

- **Pros**: Fastest tests, no React needed, simplest
- **Cons**: Can't test hooks that manage state (e.g., useActiveItem)
- **Why preferred for pure logic**: Recommended pattern for stateless computations

**Alternative 3: Create wrapper component for testing hooks**

```typescript
function TestWrapper({ hook, props }) {
  const result = hook(props);
  return <div>{JSON.stringify(result)}</div>;
}

test("useNavigation", () => {
  render(<TestWrapper hook={useNavigation} props={{ ... }} />);
  // ...
});
```

- **Pros**: No extra dependencies, full control
- **Cons**: Reinventing the wheel, `renderHook` does this better
- **Why rejected**: RTL's `renderHook` is standard, no need for custom solution

### Example Pattern

```typescript
// ============================================================================
// PURE UTILITIES: Simple Jest tests
// ============================================================================

// src/utils/navigation.test.ts
import { hasNextChecklist, getFirstUncheckedIndex } from "./navigation";
import { MenuType } from "@/types/checklist";

describe("navigation utilities", () => {
  const mockChecklistData = [
    { id: "cat1", menuType: MenuType.NORMAL, checklists: [...] },
    { id: "cat2", menuType: MenuType.NORMAL, checklists: [...] },
  ];

  describe("hasNextChecklist", () => {
    test("returns true when not on last checklist", () => {
      const result = hasNextChecklist("cat1", mockChecklistData, MenuType.NORMAL);
      expect(result).toBe(true);
    });

    test("returns false when on last checklist", () => {
      const result = hasNextChecklist("cat2", mockChecklistData, MenuType.NORMAL);
      expect(result).toBe(false);
    });

    test("returns false when category not found", () => {
      const result = hasNextChecklist("invalid", mockChecklistData, MenuType.NORMAL);
      expect(result).toBe(false);
    });
  });

  describe("getFirstUncheckedIndex", () => {
    test("returns 0 when no items are checked", () => {
      const result = getFirstUncheckedIndex("cat1", mockChecklistData, {});
      expect(result).toBe(0);
    });

    test("returns -1 when all items are checked", () => {
      const itemStates = {
        cat1: { checklist1: { item1: "checked", item2: "checked" } },
      };
      const result = getFirstUncheckedIndex("cat1", mockChecklistData, itemStates);
      expect(result).toBe(-1);
    });

    test("returns index of first unchecked item", () => {
      const itemStates = {
        cat1: { checklist1: { item1: "checked", item2: "unchecked" } },
      };
      const result = getFirstUncheckedIndex("cat1", mockChecklistData, itemStates);
      expect(result).toBe(1);
    });
  });
});

// ============================================================================
// CUSTOM HOOKS: renderHook tests
// ============================================================================

// src/hooks/useChecklistNavigation.test.ts
import { renderHook } from "@testing-library/react";
import { useChecklistNavigation } from "./useChecklistNavigation";
import { MenuType } from "@/types/checklist";

describe("useChecklistNavigation", () => {
  const mockChecklistData = [
    { id: "cat1", menuType: MenuType.NORMAL, checklists: [...] },
    { id: "cat2", menuType: MenuType.NORMAL, checklists: [...] },
  ];

  test("returns navigation data for current category", () => {
    const { result } = renderHook(() =>
      useChecklistNavigation({
        activeCategory: "cat1",
        menuType: MenuType.NORMAL,
        checklistData: mockChecklistData,
        itemStates: {},
      })
    );

    expect(result.current.hasNext).toBe(true);
    expect(result.current.nextChecklistId).toBe("cat2");
    expect(result.current.currentIndex).toBe(0);
  });

  test("updates when activeCategory changes", () => {
    const { result, rerender } = renderHook(
      ({ activeCategory }) =>
        useChecklistNavigation({
          activeCategory,
          menuType: MenuType.NORMAL,
          checklistData: mockChecklistData,
          itemStates: {},
        }),
      { initialProps: { activeCategory: "cat1" } }
    );

    expect(result.current.hasNext).toBe(true);

    // Change activeCategory
    rerender({ activeCategory: "cat2" });

    expect(result.current.hasNext).toBe(false);
    expect(result.current.nextChecklistId).toBe(null);
  });

  test("memoizes result when dependencies don't change", () => {
    const { result, rerender } = renderHook(() =>
      useChecklistNavigation({
        activeCategory: "cat1",
        menuType: MenuType.NORMAL,
        checklistData: mockChecklistData,
        itemStates: {},
      })
    );

    const firstResult = result.current;
    rerender(); // Re-render with same props

    expect(result.current).toBe(firstResult); // Same object reference (memoized)
  });
});

// ============================================================================
// STATEFUL HOOKS: Testing state updates
// ============================================================================

// src/hooks/useActiveItem.test.ts
import { renderHook, act } from "@testing-library/react";
import { useActiveItem } from "./useActiveItem";

describe("useActiveItem", () => {
  test("initializes with provided index", () => {
    const { result } = renderHook(() => useActiveItem(5));
    expect(result.current.activeItemIndex).toBe(5);
  });

  test("updates active item index", () => {
    const { result } = renderHook(() => useActiveItem(0));

    act(() => {
      result.current.updateActiveItem(3);
    });

    expect(result.current.activeItemIndex).toBe(3);
  });

  test("resets to first item", () => {
    const { result } = renderHook(() => useActiveItem(5));

    act(() => {
      result.current.resetToFirst();
    });

    expect(result.current.activeItemIndex).toBe(0);
  });

  test("clamps negative indices to -1", () => {
    const { result } = renderHook(() => useActiveItem(0));

    act(() => {
      result.current.updateActiveItem(-5);
    });

    expect(result.current.activeItemIndex).toBe(-1);
  });
});
```

**Key RTL patterns**:

- `renderHook(() => useHook(props))` - Render hook in test environment
- `result.current` - Access hook's return value
- `rerender(newProps)` - Test hook with updated props
- `act()` - Wrap state updates to flush effects
- Compare object references to verify memoization

**Setup (add to package.json if adding tests)**:

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

---

## Research Question 6: Avoiding Circular Dependencies

### Decision/Recommendation

**Use layered architecture with clear dependency direction**

Organize code into layers where dependencies only flow downward:

```
Components (page.tsx)
    ↓ depends on
Custom Hooks (useChecklistNavigation, useActiveItem)
    ↓ depends on
Pure Utilities (navigation.ts, checklist.ts, transitions.ts)
    ↓ depends on
Data/Types (checklists.ts, checklist.ts types)
```

**Rules**:

1. **Components** can import hooks and utilities
2. **Hooks** can import other hooks and utilities, but avoid deep hook chains
3. **Utilities** can only import types and other utilities, NEVER hooks
4. **Data/Types** have no dependencies on application code

### Rationale

**Why layered architecture prevents circular deps**:

1. **Clear dependency direction**: Code flows from data → utilities → hooks → components. Circular imports are structurally impossible.

2. **Predictable build order**: TypeScript/bundler can resolve dependencies in a single pass (data → utils → hooks → components).

3. **Testability**: Lower layers (utilities, data) have no dependencies, easy to test in isolation.

4. **Refactorability**: Changing a utility doesn't cascade to hooks or components (stable interfaces).

5. **Code splitting**: Bundlers can optimize tree shaking when dependency graph is acyclic.

**React-specific considerations**:

- **Hooks can depend on hooks**: React allows this (e.g., `useChecklistNavigation` can call `useChecklist`), but avoid deep chains (max 2-3 levels)
- **Utilities never use hooks**: Pure functions can't use hooks (React limitation), so this rule is enforced by React itself
- **Components orchestrate everything**: Page component is the "top" of the dependency tree

**For this codebase**:

```
page.tsx
  → useChecklist (state management)
  → useChecklistNavigation (navigation logic) ← NEW
      → useChecklist (if needed)
      → navigation utilities ← NEW
  → navigation utilities (pure functions) ← NEW
      → checklist.ts (isItemComplete, etc.)
      → types
```

### Alternatives Considered

**Alternative 1: Flat structure (all hooks/utils in one directory)**

```
hooks/
  ├── useChecklist.ts
  ├── useNavigation.ts
  ├── navigationUtils.ts
  └── checklistUtils.ts
```

- **Pros**: Simple, no nested directories
- **Cons**: Hard to distinguish pure utils from hooks, no clear boundaries
- **Why rejected**: Mixing hooks and utilities reduces clarity, increases circular dep risk

**Alternative 2: Feature-based structure**

```
features/
  ├── checklist/
  │   ├── hooks/
  │   ├── utils/
  │   └── components/
  └── navigation/
      ├── hooks/
      ├── utils/
      └── components/
```

- **Pros**: Clear feature boundaries, scales well for large apps
- **Cons**: Overkill for single-page app, more complex imports
- **Why rejected**: This project has one page, feature-based is premature

**Alternative 3: Barrel exports with re-exports**

```typescript
// hooks/index.ts
export { useChecklist } from "./useChecklist";
export { useNavigation } from "./useNavigation";
```

- **Pros**: Simpler imports (`import { useChecklist } from "@/hooks"`)
- **Cons**: Can hide circular deps, makes tree shaking harder
- **Why avoided**: Direct imports are more explicit, easier to debug

### Example Pattern

```typescript
// ============================================================================
// LAYER 1: Data & Types (no dependencies)
// ============================================================================

// src/types/checklist.ts
export type ChecklistItemStatus = "unchecked" | "checked" | "overridden" | "checked-overridden";
export interface ChecklistCategory { ... }
export enum MenuType { ... }

// src/data/checklists.ts
export const checklistData: ChecklistCategory[] = [...];

// ============================================================================
// LAYER 2: Pure Utilities (depend on types only)
// ============================================================================

// src/utils/checklist.ts
import { ChecklistItemStatus } from "@/types/checklist";

export function isItemComplete(status: ChecklistItemStatus): boolean { ... }
export function isItemOverridden(status: ChecklistItemStatus): boolean { ... }

// src/utils/navigation.ts
import { ChecklistCategory, MenuType } from "@/types/checklist";
import { isItemComplete } from "./checklist"; // ✅ Utils can import utils

export function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean {
  // Pure logic, no React hooks
}

export function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number {
  // Uses isItemComplete from checklist.ts
}

// ============================================================================
// LAYER 3: Custom Hooks (depend on utilities and other hooks)
// ============================================================================

// src/hooks/useChecklist.ts
import { useState, useCallback, useEffect } from "react";
import { ChecklistCategory } from "@/types/checklist";
import { isItemComplete } from "@/utils/checklist"; // ✅ Hooks can import utils

export function useChecklist({ categories }: { categories: ChecklistCategory[] }) {
  const [itemStates, setItemStates] = useState({});
  // ... state management logic
  return { itemStates, updateItemStatus, ... };
}

// src/hooks/useChecklistNavigation.ts
import { useMemo } from "react";
import { hasNextChecklist, getFirstUncheckedIndex } from "@/utils/navigation"; // ✅ Import utils
import { useChecklist } from "./useChecklist"; // ⚠️ Hooks can import hooks, but be cautious

export function useChecklistNavigation({ activeCategory, menuType, checklistData }) {
  // Could optionally call useChecklist here if needed:
  // const { itemStates } = useChecklist({ categories: checklistData });

  return useMemo(() => {
    return {
      hasNext: hasNextChecklist(activeCategory, checklistData, menuType),
      // ...
    };
  }, [activeCategory, menuType, checklistData]);
}

// ============================================================================
// LAYER 4: Components (depend on everything)
// ============================================================================

// src/app/page.tsx
import { useChecklist } from "@/hooks/useChecklist"; // ✅ Import hooks
import { useChecklistNavigation } from "@/hooks/useChecklistNavigation"; // ✅ Import hooks
import { getFirstUncheckedIndex } from "@/utils/navigation"; // ✅ Import utils
import { checklistData } from "@/data/checklists"; // ✅ Import data

export default function Page() {
  const { itemStates, updateItemStatus } = useChecklist({ categories: checklistData });

  const navigation = useChecklistNavigation({
    activeCategory,
    menuType: MenuType.NORMAL,
    checklistData,
  });

  return <div>...</div>;
}

// ============================================================================
// ❌ CIRCULAR DEPENDENCY EXAMPLE (what to avoid)
// ============================================================================

// hooks/useA.ts
import { useB } from "./useB"; // ❌ useA depends on useB
export function useA() { useB(); }

// hooks/useB.ts
import { useA } from "./useA"; // ❌ useB depends on useA → CIRCULAR!
export function useB() { useA(); }

// FIX: Extract shared logic to a utility:

// utils/shared.ts
export function sharedLogic() { ... }

// hooks/useA.ts
import { sharedLogic } from "@/utils/shared"; // ✅ Both depend on utility
export function useA() { sharedLogic(); }

// hooks/useB.ts
import { sharedLogic } from "@/utils/shared"; // ✅ No circular dependency
export function useB() { sharedLogic(); }
```

**Preventing circular deps checklist**:

- [ ] Utilities never import hooks ✅
- [ ] Hooks minimize imports from other hooks (prefer composition in components)
- [ ] Data/types are at the bottom of dependency graph ✅
- [ ] If two modules need each other, extract shared logic to a lower layer ✅
- [ ] Use TypeScript's `import type` for type-only imports (doesn't create runtime dependency)

**TypeScript trick to detect circular deps**:

```json
// tsconfig.json
{
  "compilerOptions": {
    "noEmit": true, // Check for errors without emitting
    "skipLibCheck": false // Check all files
  }
}
```

Run `npx tsc --noEmit` - circular deps will cause "Cannot find module" errors.

---

## Summary & Recommendations

### Recommended Extraction Plan

Based on the research, here's the optimal refactoring approach for this codebase:

**Phase 1: Extract Pure Utilities** (Low Risk, High Value)

```typescript
// src/utils/navigation.ts - NEW FILE
export function getFirstUncheckedIndex(
  categoryId,
  checklistData,
  itemStates
): number;
export function getNextIncompleteChecklist(
  menuType,
  checklistData,
  itemStates
): string | null;
export function hasNextChecklist(
  activeCategory,
  checklistData,
  menuType
): boolean;
```

**Phase 2: Add Memoization in Component** (No New Files)

```typescript
// src/app/page.tsx - MODIFY
const navigation = useMemo(
  () => ({
    firstUnchecked: getFirstUncheckedIndex(
      activeCategory,
      checklistData,
      itemStates
    ),
    nextChecklist: getNextIncompleteChecklist(
      MenuType.NORMAL,
      checklistData,
      itemStates
    ),
    hasNext: hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
  }),
  [activeCategory, itemStates]
);
```

**Phase 3 (Optional): Extract Custom Hook** (If Logic Reused)

```typescript
// src/hooks/useChecklistNavigation.ts - NEW FILE (only if needed elsewhere)
export function useChecklistNavigation({
  activeCategory,
  menuType,
  checklistData,
  itemStates,
});
```

### Decision Summary Table

| Question               | Recommendation                                                             | Pattern                                                 |
| ---------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| **Hook vs Utility**    | Pure utilities for stateless computations, hooks for React lifecycle logic | `getFirstUncheckedIndex` → util, `useActiveItem` → hook |
| **Navigation Pattern** | Pure utilities + useMemo in component                                      | Memoized derived state                                  |
| **Derived State**      | Compute on-demand with useMemo, don't store in separate state              | `useMemo(() => hasNext(...), [deps])`                   |
| **Dependencies**       | Explicit parameter passing (dependency injection)                          | Pass `itemStates` as parameter, not via context         |
| **Testing**            | RTL's `renderHook` for hooks, Jest for pure utilities                      | `renderHook(() => useHook(props))`                      |
| **Circular Deps**      | Layered architecture: data → utils → hooks → components                    | Never import hooks in utilities                         |

### Expected Impact

**Before Refactor**:

- `page.tsx`: 450 lines
- Navigation logic: Embedded in component
- Testability: Must test through full component
- Reusability: Copy-paste required

**After Refactor**:

- `page.tsx`: ~280 lines (38% reduction)
- Navigation logic: `src/utils/navigation.ts` (pure utilities)
- Testability: Unit tests for navigation utilities, integration tests for component
- Reusability: Import from `@/utils/navigation`

### Next Steps

1. **Research complete** ✅ (this document)
2. **Create data model** (define types for navigation utilities)
3. **Create contracts** (API signatures for new utilities/hooks)
4. **Implement utilities** (extract `navigation.ts`)
5. **Refactor component** (use utilities in `page.tsx`)
6. **Add tests** (optional but recommended)
7. **Verify no regressions** (manual testing)

---

## References

- [React 19 Documentation - Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [React 19 - useMemo API Reference](https://react.dev/reference/react/useMemo)
- [React Testing Library - Testing Hooks](https://testing-library.com/docs/react-testing-library/api#renderhook)
- [Kent C. Dodds - Application State Management with React](https://kentcdodds.com/blog/application-state-management-with-react)
- [Dan Abramov - Writing Resilient Components](https://overreacted.io/writing-resilient-components/)
- [React Compiler Documentation](https://react.dev/learn/react-compiler)
- [Next.js Static Export Best Practices](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [TypeScript Handbook - Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

---

**Document Status**: Complete  
**Reviewed By**: GitHub Copilot  
**Date**: 2025-11-20  
**Next Phase**: Data Model Design (`data-model.md`)
