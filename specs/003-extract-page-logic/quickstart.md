# Quick Start Guide: Navigation Utilities

**Feature**: Extract Business Logic from Page Component  
**Date**: 2025-11-20  
**For**: Developers using extracted navigation utilities

## Overview

This guide shows how to use the extracted navigation utilities (`@/utils/navigation`) to manage checklist navigation logic in React components. These utilities replace inline navigation logic previously embedded in `page.tsx`.

---

## Installation (No Additional Setup Required)

The navigation utilities are part of the codebase:

```
src/
└── utils/
    └── navigation.ts  # New file with navigation utilities
```

**No npm packages to install** - pure TypeScript utilities using existing types.

---

## Quick Start: Replace Inline Logic with Utilities

### Before (Inline Logic in Component)

```typescript
// page.tsx - OLD APPROACH
const getFirstUncheckedIndex = (categoryId: string) => {
  const category = checklistData.find((cat) => cat.id === categoryId);
  const checklist = category?.checklists[0];

  if (!checklist) return -1;

  const firstUncheckedIndex = checklist.items.findIndex(
    (item) =>
      (itemStates[categoryId]?.[checklist.id]?.[item.id] ?? "unchecked") ===
      "unchecked"
  );
  return firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1;
};

// ... component uses inline function
const handleChecklistSelect = (categoryId: string) => {
  setActiveCategory(categoryId);
  setActiveItemIndex(getFirstUncheckedIndex(categoryId));
};
```

### After (Using Utilities)

```typescript
// page.tsx - NEW APPROACH
import { getFirstUncheckedIndex } from "@/utils/navigation";

// ... component uses imported utility
const handleChecklistSelect = (categoryId: string) => {
  setActiveCategory(categoryId);
  const firstUnchecked = getFirstUncheckedIndex(
    categoryId,
    checklistData,
    itemStates
  );
  setActiveItemIndex(firstUnchecked);
};
```

**Benefits**:

- ✅ 8 lines removed from component
- ✅ Logic is reusable across components
- ✅ Logic is testable in isolation
- ✅ Clear separation of concerns

---

## Common Use Cases

### Use Case 1: Find First Unchecked Item

**Scenario**: When user navigates to a checklist, set focus to the first unchecked item.

```typescript
import { getFirstUncheckedIndex } from "@/utils/navigation";
import { useChecklist } from "@/hooks/useChecklist";

function ChecklistPage() {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const { activeCategory, itemStates } = useChecklist({ categories: checklistData });

  // Update active item when category changes
  useEffect(() => {
    const firstUnchecked = getFirstUncheckedIndex(
      activeCategory,
      checklistData,
      itemStates
    );
    setActiveItemIndex(firstUnchecked >= 0 ? firstUnchecked : 0);
  }, [activeCategory, itemStates]);

  return <ChecklistDisplay activeItemIndex={activeItemIndex} />;
}
```

**Key Points**:

- Returns `-1` if all items checked (handle this case in your UI)
- Returns `0` if no items checked yet (defaults to first item)

---

### Use Case 2: Determine If "NEXT" Button Should Show

**Scenario**: Show "NEXT" button only if there's a next checklist in the sequence.

```typescript
import { hasNextChecklist } from "@/utils/navigation";
import { MenuType } from "@/types/checklist";

function ChecklistDisplay() {
  const { activeCategory } = useChecklist({ categories: checklistData });

  // Memoize to avoid recalculation on every render
  const showNextButton = useMemo(
    () => hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
    [activeCategory]
  );

  return (
    <div>
      {/* Checklist content */}
      {showNextButton && (
        <button onClick={handleNext}>NEXT</button>
      )}
    </div>
  );
}
```

**Key Points**:

- Returns `false` if on last checklist (hide button)
- Returns `false` if category not found (safe default)
- Use `useMemo` to cache result (cheap computation, but good practice)

---

### Use Case 3: Jump to Next Incomplete Checklist

**Scenario**: When user clicks "NORMAL" button, jump to the first incomplete checklist.

```typescript
import { getNextIncompleteChecklist, getFirstUncheckedIndex } from "@/utils/navigation";
import { MenuType } from "@/types/checklist";

function HomePage() {
  const { setActiveCategory, itemStates } = useChecklist({ categories: checklistData });
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  const handleNormalButton = () => {
    const nextCategoryId = getNextIncompleteChecklist(
      MenuType.NORMAL,
      checklistData,
      itemStates
    );

    if (nextCategoryId) {
      setActiveCategory(nextCategoryId);

      // Also jump to first unchecked item in that checklist
      const firstUnchecked = getFirstUncheckedIndex(
        nextCategoryId,
        checklistData,
        itemStates
      );
      setActiveItemIndex(firstUnchecked >= 0 ? firstUnchecked : 0);
    }
  };

  return (
    <button onClick={handleNormalButton}>NORMAL</button>
  );
}
```

**Key Points**:

- Returns first incomplete checklist (prioritizes unfinished work)
- Returns last checklist if all complete (allows review)
- Returns `null` if no checklists exist (handle this edge case)

---

## Performance Optimization: Using useMemo

### Problem: Avoid Unnecessary Recalculations

Navigation utilities are **pure functions** that always return the same result for the same inputs. To avoid recalculating on every render, use `useMemo`:

### Basic Memoization

```typescript
import { useMemo } from "react";
import { getFirstUncheckedIndex, hasNextChecklist } from "@/utils/navigation";

function ChecklistPage() {
  const { activeCategory, itemStates } = useChecklist({ categories: checklistData });

  // ❌ BAD: Recalculates every render
  const firstUnchecked = getFirstUncheckedIndex(activeCategory, checklistData, itemStates);
  const hasNext = hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL);

  // ✅ GOOD: Recalculates only when dependencies change
  const navigation = useMemo(() => ({
    firstUnchecked: getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
    hasNext: hasNextChecklist(activeCategory, checklistData, MenuType.NORMAL),
  }), [activeCategory, itemStates]); // checklistData is immutable, no need to include

  return <div>Active item: {navigation.firstUnchecked}</div>;
}
```

**Dependencies to Include**:

- ✅ `activeCategory` - Changes when user navigates
- ✅ `itemStates` - Changes when user checks/unchecks items
- ❌ `checklistData` - Immutable, never changes at runtime
- ❌ `MenuType.NORMAL` - Constant enum value

### Advanced: Memoizing Multiple Navigation Values

```typescript
const navigation = useMemo(() => {
  const currentCategory = activeCategory;
  const currentStates = itemStates;

  return {
    firstUnchecked: getFirstUncheckedIndex(currentCategory, checklistData, currentStates),
    nextChecklistId: getNextIncompleteChecklist(MenuType.NORMAL, checklistData, currentStates),
    hasNext: hasNextChecklist(currentCategory, checklistData, MenuType.NORMAL),
  };
}, [activeCategory, itemStates]);

// Use in JSX
return (
  <ChecklistDisplay
    activeItemIndex={navigation.firstUnchecked}
    hasNextChecklist={navigation.hasNext}
    onNext={() => {
      if (navigation.nextChecklistId) {
        setActiveCategory(navigation.nextChecklistId);
      }
    }}
  />
);
```

**Why This Approach**:

- Single memoization for all related navigation data
- Navigation object reference remains stable when dependencies don't change
- Cleaner than multiple `useMemo` calls

---

## Error Handling & Edge Cases

### Handling -1 Return Value

`getFirstUncheckedIndex` returns `-1` when all items are checked or category not found:

```typescript
const firstUnchecked = getFirstUncheckedIndex(
  categoryId,
  checklistData,
  itemStates
);

if (firstUnchecked === -1) {
  // All items checked - hide active item border
  setActiveItemIndex(-1);
} else {
  // Normal case - show active item border
  setActiveItemIndex(firstUnchecked);
}
```

### Handling null Return Value

`getNextIncompleteChecklist` returns `null` when no categories exist for menu type:

```typescript
const nextCategoryId = getNextIncompleteChecklist(
  MenuType.NORMAL,
  checklistData,
  itemStates
);

if (nextCategoryId) {
  setActiveCategory(nextCategoryId);
} else {
  console.warn("No checklists found for menu type");
  // Fallback behavior (e.g., stay on current category)
}
```

### Handling Invalid Category IDs

All utilities handle invalid category IDs gracefully:

```typescript
const invalidIndex = getFirstUncheckedIndex(
  "invalid-id",
  checklistData,
  itemStates
);
console.log(invalidIndex); // -1 (safe default)

const invalidHasNext = hasNextChecklist(
  "invalid-id",
  checklistData,
  MenuType.NORMAL
);
console.log(invalidHasNext); // false (safe default)
```

**No exceptions thrown** - always returns safe defaults.

---

## Integration with Existing Hooks

### Working with useChecklist

The navigation utilities are designed to work seamlessly with the existing `useChecklist` hook:

```typescript
import { useChecklist } from "@/hooks/useChecklist";
import { getFirstUncheckedIndex } from "@/utils/navigation";
import { checklistData } from "@/data/checklists";

function MyComponent() {
  // useChecklist provides activeCategory and itemStates
  const {
    activeCategory,
    itemStates,
    setActiveCategory,
    updateItemStatus
  } = useChecklist({ categories: checklistData });

  // Pass these to navigation utilities
  const firstUnchecked = useMemo(
    () => getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
    [activeCategory, itemStates]
  );

  return <div>First unchecked: {firstUnchecked}</div>;
}
```

**Data Flow**:

```
useChecklist
  ↓ provides
activeCategory, itemStates
  ↓ passed to
Navigation Utilities
  ↓ returns
Navigation Data (indices, booleans, IDs)
  ↓ used in
Component JSX
```

---

## Testing Utilities (Optional)

If you want to add unit tests for the utilities:

### Setup (Jest + TypeScript)

```bash
npm install --save-dev jest @types/jest ts-jest
```

### Example Test File

```typescript
// src/utils/navigation.test.ts
import { getFirstUncheckedIndex, hasNextChecklist } from "./navigation";
import { MenuType } from "@/types/checklist";

describe("getFirstUncheckedIndex", () => {
  const mockChecklistData = [
    {
      id: "cat1",
      title: "Category 1",
      menuType: MenuType.NORMAL,
      checklists: [
        {
          id: "checklist1",
          name: "Checklist 1",
          items: [
            {
              id: "item1",
              item: "Item 1",
              value: "VALUE",
              completed: false,
              required: true,
            },
            {
              id: "item2",
              item: "Item 2",
              value: "VALUE",
              completed: false,
              required: true,
            },
          ],
        },
      ],
    },
  ];

  test("returns 0 when no items checked", () => {
    const result = getFirstUncheckedIndex("cat1", mockChecklistData, {});
    expect(result).toBe(0);
  });

  test("returns 1 when first item is checked", () => {
    const itemStates = {
      cat1: { checklist1: { item1: "checked" } },
    };
    const result = getFirstUncheckedIndex(
      "cat1",
      mockChecklistData,
      itemStates
    );
    expect(result).toBe(1);
  });

  test("returns -1 when all items checked", () => {
    const itemStates = {
      cat1: { checklist1: { item1: "checked", item2: "checked" } },
    };
    const result = getFirstUncheckedIndex(
      "cat1",
      mockChecklistData,
      itemStates
    );
    expect(result).toBe(-1);
  });

  test("returns -1 when category not found", () => {
    const result = getFirstUncheckedIndex("invalid", mockChecklistData, {});
    expect(result).toBe(-1);
  });
});
```

**Run tests**:

```bash
npm test
```

---

## TypeScript Tips

### Type-Safe Imports

```typescript
import { getFirstUncheckedIndex } from "@/utils/navigation";
import { MenuType } from "@/types/checklist";
import type { ChecklistCategory } from "@/types/checklist"; // Type-only import
```

**Use `type` imports** when you only need the type, not the runtime value.

### Type Inference

TypeScript infers return types automatically:

```typescript
const firstUnchecked = getFirstUncheckedIndex(...); // Type: number
const hasNext = hasNextChecklist(...); // Type: boolean
const nextId = getNextIncompleteChecklist(...); // Type: string | null
```

### Strict Null Checks

Enable `strictNullChecks` in `tsconfig.json` to catch null/undefined errors:

```typescript
const nextId = getNextIncompleteChecklist(MenuType.NORMAL, data, states);

// ✅ TypeScript warns if you don't check for null
if (nextId) {
  setActiveCategory(nextId); // Safe: nextId is string here
}
```

---

## Common Mistakes & Solutions

### Mistake 1: Forgetting to Memoize

**Problem**: Utilities recalculate on every render, even when inputs don't change.

```typescript
// ❌ BAD: Recalculates every render
function MyComponent() {
  const firstUnchecked = getFirstUncheckedIndex(
    activeCategory,
    checklistData,
    itemStates
  );
  // ...
}
```

**Solution**: Use `useMemo`

```typescript
// ✅ GOOD: Recalculates only when dependencies change
function MyComponent() {
  const firstUnchecked = useMemo(
    () => getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
    [activeCategory, itemStates]
  );
  // ...
}
```

---

### Mistake 2: Including checklistData in Dependencies

**Problem**: `checklistData` is immutable, including it in `useMemo` deps is unnecessary.

```typescript
// ❌ UNNECESSARY: checklistData never changes
const firstUnchecked = useMemo(
  () => getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
  [activeCategory, itemStates, checklistData] // checklistData is immutable!
);
```

**Solution**: Only include values that can change

```typescript
// ✅ GOOD: Only include changing dependencies
const firstUnchecked = useMemo(
  () => getFirstUncheckedIndex(activeCategory, checklistData, itemStates),
  [activeCategory, itemStates] // checklistData omitted
);
```

---

### Mistake 3: Not Handling -1 or null Returns

**Problem**: Assuming utilities always return valid values.

```typescript
// ❌ BAD: What if firstUnchecked is -1?
const firstUnchecked = getFirstUncheckedIndex(categoryId, data, states);
setActiveItemIndex(firstUnchecked); // Sets activeItemIndex to -1!
```

**Solution**: Handle edge cases explicitly

```typescript
// ✅ GOOD: Handle -1 case
const firstUnchecked = getFirstUncheckedIndex(categoryId, data, states);
setActiveItemIndex(firstUnchecked >= 0 ? firstUnchecked : 0);

// Or use in conditional
if (firstUnchecked >= 0) {
  setActiveItemIndex(firstUnchecked);
} else {
  console.log("All items checked");
  setActiveItemIndex(-1); // Hide active item border
}
```

---

### Mistake 4: Passing Wrong Menu Type

**Problem**: Using the wrong `MenuType` enum value.

```typescript
// ❌ BAD: String literal instead of enum
const hasNext = hasNextChecklist(activeCategory, data, "normal");
// TypeScript error: Argument of type '"normal"' is not assignable to parameter of type 'MenuType'
```

**Solution**: Use enum values

```typescript
// ✅ GOOD: Use MenuType enum
import { MenuType } from "@/types/checklist";
const hasNext = hasNextChecklist(activeCategory, data, MenuType.NORMAL);
```

---

## Migration Checklist

If you're migrating from inline logic to utilities:

- [ ] Import utilities from `@/utils/navigation`
- [ ] Replace inline `getFirstUncheckedIndex` function with utility call
- [ ] Replace inline `getNextIncompleteChecklist` function with utility call
- [ ] Replace inline `hasNextChecklist` function with utility call
- [ ] Wrap utility calls in `useMemo` with correct dependencies
- [ ] Handle `-1` and `null` return values
- [ ] Remove old inline function definitions
- [ ] Test all navigation flows (NORMAL button, NEXT button, checklist selection)
- [ ] Verify no regressions (all user flows work identically)

---

## API Reference (Summary)

### getFirstUncheckedIndex

```typescript
function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number;
```

Returns index of first unchecked item, or `-1` if all checked.

---

### getNextIncompleteChecklist

```typescript
function getNextIncompleteChecklist(
  menuType: MenuType,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): string | null;
```

Returns category ID of next incomplete checklist, or `null` if none.

---

### hasNextChecklist

```typescript
function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean;
```

Returns `true` if there's a next checklist, `false` otherwise.

---

## Further Reading

- [Full API Contracts](./contracts/extracted-api.md) - Detailed API specifications
- [Data Model](./data-model.md) - Type definitions and data structures
- [Research](./research.md) - Design decisions and alternatives considered

---

## Support & Questions

**Need help?**

- Check [API Contracts](./contracts/extracted-api.md) for detailed behavior specs
- See [Research](./research.md) for design rationale
- Review existing usage in `src/app/page.tsx` for examples

---

**Quick Start Guide Complete** ✅  
**Next Step**: Update agent context with new patterns
