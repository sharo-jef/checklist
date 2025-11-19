# API Contracts: Extracted Navigation Utilities

**Feature**: Extract Business Logic from Page Component  
**Date**: 2025-11-20  
**Status**: Phase 1 Design  
**Version**: 1.0.0

## Overview

This document defines the public API contracts for the extracted navigation utilities and optional custom hook. These contracts serve as the interface specification between `page.tsx` and the extracted logic modules.

---

## Module: `@/utils/navigation`

### Public API Surface

```typescript
export function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number;

export function getNextIncompleteChecklist(
  menuType: MenuType,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): string | null;

export function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean;
```

---

## Function Contract: `getFirstUncheckedIndex`

### Signature

```typescript
function getFirstUncheckedIndex(
  categoryId: string,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): number;
```

### Purpose

Finds the array index of the first unchecked item in a category's first checklist.

### Parameters

| Parameter       | Type                  | Required | Description                                  |
| --------------- | --------------------- | -------- | -------------------------------------------- |
| `categoryId`    | `string`              | Yes      | ID of the category to search within          |
| `checklistData` | `ChecklistCategory[]` | Yes      | Array of all checklist category definitions  |
| `itemStates`    | `ItemStatesMap`       | Yes      | Current runtime state of all checklist items |

### Returns

| Type     | Description                                                                           |
| -------- | ------------------------------------------------------------------------------------- |
| `number` | Index (0-based) of first unchecked item, or `-1` if all checked or category not found |

### Behavior Specification

#### Normal Cases

**Case 1: Some items checked, some unchecked**

- **Given**: Category with items [checked, unchecked, unchecked]
- **When**: `getFirstUncheckedIndex("cat1", data, states)` called
- **Then**: Returns `1` (index of first unchecked)

**Case 2: No items checked yet**

- **Given**: Category with items, but no itemStates entries
- **When**: `getFirstUncheckedIndex("cat1", data, {})` called
- **Then**: Returns `0` (first item is unchecked by default)

#### Edge Cases

**Edge 1: All items checked**

- **Given**: Category with all items in "checked" or "overridden" status
- **When**: `getFirstUncheckedIndex("cat1", data, states)` called
- **Then**: Returns `-1`

**Edge 2: Category not found**

- **Given**: `categoryId` doesn't exist in `checklistData`
- **When**: `getFirstUncheckedIndex("invalid", data, states)` called
- **Then**: Returns `-1`

**Edge 3: Category has no checklists**

- **Given**: Category exists but `checklists` array is empty
- **When**: `getFirstUncheckedIndex("cat1", data, states)` called
- **Then**: Returns `-1`

**Edge 4: Empty checklist**

- **Given**: Category's first checklist has empty `items` array
- **When**: `getFirstUncheckedIndex("cat1", data, states)` called
- **Then**: Returns `-1`

### Side Effects

**None** - Pure function with no side effects

### Dependencies

- `ChecklistCategory` type from `@/types/checklist`
- `ItemStatesMap` type from `@/hooks/useChecklist`

### Performance

- **Time Complexity**: O(n) where n = number of items in checklist (typically 5-10)
- **Space Complexity**: O(1) - no allocations
- **Expected Runtime**: < 1ms for typical checklist sizes

### Examples

```typescript
import { getFirstUncheckedIndex } from "@/utils/navigation";

// Example 1: Find first unchecked in pre-drive checklist
const itemStates = {
  "pre-drive": {
    "checklist-1": {
      mirrors: "checked",
      seatbelt: "unchecked",
      fuel: "unchecked",
    },
  },
};

const index = getFirstUncheckedIndex("pre-drive", checklistData, itemStates);
console.log(index); // 1 (seatbelt is first unchecked)

// Example 2: All items checked
const allChecked = {
  "pre-drive": {
    "checklist-1": {
      mirrors: "checked",
      seatbelt: "checked",
      fuel: "overridden",
    },
  },
};

const noIndex = getFirstUncheckedIndex("pre-drive", checklistData, allChecked);
console.log(noIndex); // -1 (all complete)

// Example 3: Category not found
const invalid = getFirstUncheckedIndex(
  "invalid-cat",
  checklistData,
  itemStates
);
console.log(invalid); // -1 (category doesn't exist)
```

### Error Handling

**No exceptions thrown** - Returns `-1` for all error conditions

### Testing Contract

**Unit tests must verify**:

- ✅ Returns correct index when first item is unchecked
- ✅ Returns correct index when middle item is first unchecked
- ✅ Returns 0 when no itemStates exist (all unchecked by default)
- ✅ Returns -1 when all items checked
- ✅ Returns -1 when category not found
- ✅ Returns -1 when category has no checklists
- ✅ Handles mixed statuses (checked, overridden, checked-overridden)

---

## Function Contract: `getNextIncompleteChecklist`

### Signature

```typescript
function getNextIncompleteChecklist(
  menuType: MenuType,
  checklistData: ChecklistCategory[],
  itemStates: ItemStatesMap
): string | null;
```

### Purpose

Finds the category ID of the next incomplete checklist for a given menu type. If all checklists are complete, returns the last category in the menu type.

### Parameters

| Parameter       | Type                  | Required | Description                                       |
| --------------- | --------------------- | -------- | ------------------------------------------------- |
| `menuType`      | `MenuType`            | Yes      | Menu type to search within (NORMAL or NON_NORMAL) |
| `checklistData` | `ChecklistCategory[]` | Yes      | Array of all checklist category definitions       |
| `itemStates`    | `ItemStatesMap`       | Yes      | Current runtime state of all checklist items      |

### Returns

| Type             | Description                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------- |
| `string \| null` | Category ID of next incomplete checklist, last category if all complete, or `null` if no categories |

### Behavior Specification

#### Normal Cases

**Case 1: First checklist incomplete**

- **Given**: Menu type with 3 checklists, first one has unchecked items
- **When**: `getNextIncompleteChecklist(MenuType.NORMAL, data, states)` called
- **Then**: Returns ID of first category

**Case 2: Middle checklist incomplete**

- **Given**: Menu type with 3 checklists [complete, incomplete, not started]
- **When**: `getNextIncompleteChecklist(MenuType.NORMAL, data, states)` called
- **Then**: Returns ID of second category (first incomplete)

#### Edge Cases

**Edge 1: All checklists complete**

- **Given**: All checklists in menu type have all items checked
- **When**: `getNextIncompleteChecklist(MenuType.NORMAL, data, states)` called
- **Then**: Returns ID of **last category** in menu type (allows review)

**Edge 2: No checklists for menu type**

- **Given**: `checklistData` has no categories matching `menuType`
- **When**: `getNextIncompleteChecklist(MenuType.NORMAL, data, states)` called
- **Then**: Returns `null`

**Edge 3: No itemStates (fresh start)**

- **Given**: `itemStates` is empty object `{}`
- **When**: `getNextIncompleteChecklist(MenuType.NORMAL, data, {})` called
- **Then**: Returns ID of first category (nothing checked yet)

**Edge 4: Category has no checklist**

- **Given**: Category in menu type has empty `checklists` array
- **When**: Processing encounters this category
- **Then**: Skips to next category, doesn't return this one

### Side Effects

**None** - Pure function with no side effects

### Dependencies

- `MenuType` enum from `@/types/checklist`
- `ChecklistCategory` type from `@/types/checklist`
- `ItemStatesMap` type from `@/hooks/useChecklist`
- `isItemComplete` function from `@/utils/checklist`

### Performance

- **Time Complexity**: O(m × n) where m = categories in menu type (~3-5), n = items per checklist (~5-10)
- **Space Complexity**: O(1) - no allocations
- **Expected Runtime**: < 2ms for typical data sizes

### Examples

```typescript
import { getNextIncompleteChecklist } from "@/utils/navigation";
import { MenuType } from "@/types/checklist";

// Example 1: First checklist incomplete
const partialStates = {
  "pre-drive": {
    "checklist-1": {
      mirrors: "checked",
      seatbelt: "unchecked", // Incomplete
    },
  },
  driving: {
    /* not started */
  },
};

const next = getNextIncompleteChecklist(
  MenuType.NORMAL,
  checklistData,
  partialStates
);
console.log(next); // "pre-drive" (first incomplete)

// Example 2: All complete
const allComplete = {
  "pre-drive": { "checklist-1": { mirrors: "checked", seatbelt: "checked" } },
  driving: { "checklist-2": { speed: "checked" } },
  parking: { "checklist-3": { brake: "overridden" } },
};

const last = getNextIncompleteChecklist(
  MenuType.NORMAL,
  checklistData,
  allComplete
);
console.log(last); // "parking" (last category, all complete)

// Example 3: No categories for menu type
const none = getNextIncompleteChecklist(
  MenuType.RESETS,
  checklistData,
  partialStates
);
console.log(none); // null (RESETS menu has no checklist categories)
```

### Error Handling

**No exceptions thrown** - Returns `null` when no categories exist for menu type

### Testing Contract

**Unit tests must verify**:

- ✅ Returns first category when no itemStates exist
- ✅ Returns first incomplete category when some are complete
- ✅ Returns last category when all are complete
- ✅ Returns null when no categories match menu type
- ✅ Skips categories with empty checklists
- ✅ Uses `isItemComplete` correctly (handles all status types)
- ✅ Works for both MenuType.NORMAL and MenuType.NON_NORMAL

---

## Function Contract: `hasNextChecklist`

### Signature

```typescript
function hasNextChecklist(
  activeCategory: string,
  checklistData: ChecklistCategory[],
  menuType: MenuType
): boolean;
```

### Purpose

Determines whether there is a next checklist after the current one within a specific menu type. Used to show/hide the "NEXT" button in the UI.

### Parameters

| Parameter        | Type                  | Required | Description                                  |
| ---------------- | --------------------- | -------- | -------------------------------------------- |
| `activeCategory` | `string`              | Yes      | ID of the currently active category          |
| `checklistData`  | `ChecklistCategory[]` | Yes      | Array of all checklist category definitions  |
| `menuType`       | `MenuType`            | Yes      | Menu type to check within (typically NORMAL) |

### Returns

| Type      | Description                                                                  |
| --------- | ---------------------------------------------------------------------------- |
| `boolean` | `true` if there's a next checklist, `false` if on last or category not found |

### Behavior Specification

#### Normal Cases

**Case 1: On first checklist**

- **Given**: Menu type has 3 checklists, active is first one
- **When**: `hasNextChecklist("cat1", data, MenuType.NORMAL)` called
- **Then**: Returns `true`

**Case 2: On middle checklist**

- **Given**: Menu type has 3 checklists, active is second one
- **When**: `hasNextChecklist("cat2", data, MenuType.NORMAL)` called
- **Then**: Returns `true`

#### Edge Cases

**Edge 1: On last checklist**

- **Given**: Menu type has 3 checklists, active is third (last) one
- **When**: `hasNextChecklist("cat3", data, MenuType.NORMAL)` called
- **Then**: Returns `false`

**Edge 2: Category not found**

- **Given**: `activeCategory` doesn't exist in `checklistData`
- **When**: `hasNextChecklist("invalid", data, MenuType.NORMAL)` called
- **Then**: Returns `false`

**Edge 3: Only one checklist in menu type**

- **Given**: Menu type has only 1 category
- **When**: `hasNextChecklist("cat1", data, MenuType.NORMAL)` called
- **Then**: Returns `false`

**Edge 4: No categories for menu type**

- **Given**: No categories match the specified `menuType`
- **When**: `hasNextChecklist("cat1", data, MenuType.RESETS)` called
- **Then**: Returns `false`

### Side Effects

**None** - Pure function with no side effects

### Dependencies

- `MenuType` enum from `@/types/checklist`
- `ChecklistCategory` type from `@/types/checklist`

### Performance

- **Time Complexity**: O(m) where m = categories in menu type (~3-5)
- **Space Complexity**: O(1) - no allocations
- **Expected Runtime**: < 0.5ms (very fast predicate)

### Examples

```typescript
import { hasNextChecklist } from "@/utils/navigation";
import { MenuType } from "@/types/checklist";

// Example 1: First checklist has next
const hasNext1 = hasNextChecklist("pre-drive", checklistData, MenuType.NORMAL);
console.log(hasNext1); // true (driving and parking come after)

// Example 2: Last checklist has no next
const hasNext2 = hasNextChecklist("parking", checklistData, MenuType.NORMAL);
console.log(hasNext2); // false (last checklist in NORMAL menu)

// Example 3: NON-NORMAL menu (only one checklist)
const hasNext3 = hasNextChecklist(
  "emergency",
  checklistData,
  MenuType.NON_NORMAL
);
console.log(hasNext3); // false (only one NON-NORMAL checklist)

// Example 4: Category not found
const hasNext4 = hasNextChecklist(
  "invalid-cat",
  checklistData,
  MenuType.NORMAL
);
console.log(hasNext4); // false (category doesn't exist)
```

### Error Handling

**No exceptions thrown** - Returns `false` for all error conditions

### Testing Contract

**Unit tests must verify**:

- ✅ Returns true when not on last checklist
- ✅ Returns false when on last checklist
- ✅ Returns false when category not found
- ✅ Returns false when only one category in menu type
- ✅ Returns false when no categories match menu type
- ✅ Filters by menuType correctly (ignores other menu types)

---

## Optional Module: `@/hooks/useChecklistNavigation`

**Status**: Deferred to future implementation

This custom hook is **optional** and should only be extracted if:

1. Navigation logic is reused in multiple components (not just `page.tsx`)
2. Active item index management becomes complex enough to warrant lifecycle encapsulation
3. Unit testing navigation in isolation with `renderHook` is desired

### Proposed Signature (If Implemented)

```typescript
function useChecklistNavigation({
  activeCategory,
  menuType,
  checklistData,
  itemStates,
}: UseChecklistNavigationProps): NavigationState;

interface UseChecklistNavigationProps {
  activeCategory: string;
  menuType: MenuType;
  checklistData: ChecklistCategory[];
  itemStates: ItemStatesMap;
}

interface NavigationState {
  hasNext: boolean;
  hasPrevious: boolean;
  nextChecklistId: string | null;
  previousChecklistId: string | null;
  currentIndex: number;
  totalCount: number;
  firstUncheckedIndex: number;
}
```

**Recommendation**: Use pure utilities + `useMemo` in `page.tsx` for now. Extract to hook only if proven necessary.

---

## Integration Contract: Usage in `page.tsx`

### Import Pattern

```typescript
import {
  getFirstUncheckedIndex,
  getNextIncompleteChecklist,
  hasNextChecklist,
} from "@/utils/navigation";
```

### Usage Pattern with useMemo

```typescript
function Page() {
  const { activeCategory, itemStates } = useChecklist({ categories: checklistData });

  // Memoize navigation computations
  const navigation = useMemo(() => {
    const currentCategory = activeCategory;
    const currentStates = itemStates;

    return {
      firstUnchecked: getFirstUncheckedIndex(
        currentCategory,
        checklistData,
        currentStates
      ),
      nextChecklistId: getNextIncompleteChecklist(
        MenuType.NORMAL,
        checklistData,
        currentStates
      ),
      hasNext: hasNextChecklist(
        currentCategory,
        checklistData,
        MenuType.NORMAL
      ),
    };
  }, [activeCategory, itemStates]);

  // Use in JSX
  return (
    <ChecklistDisplay
      activeItemIndex={navigation.firstUnchecked}
      onNext={() => {
        if (navigation.nextChecklistId) {
          setActiveCategory(navigation.nextChecklistId);
        }
      }}
      hasNextChecklist={navigation.hasNext}
    />
  );
}
```

### Memoization Contract

**Dependencies** for `useMemo`:

- `activeCategory` - Changes when user navigates to different checklist
- `itemStates` - Changes when user checks/unchecks items

**Do NOT include in dependencies**:

- `checklistData` - Immutable data, never changes at runtime
- `MenuType.NORMAL` - Constant enum value

**Expected Re-computation Triggers**:

- User clicks an item (itemStates changes)
- User navigates to different checklist (activeCategory changes)

**Expected Stability**:

- Navigation object reference remains stable when dependencies don't change
- React Compiler may optimize this further automatically

---

## Versioning & Compatibility

### API Version: 1.0.0

**Semantic Versioning Contract**:

- **MAJOR** (1.x.x → 2.x.x): Breaking changes (parameter order, return type changes)
- **MINOR** (x.1.x → x.2.x): New functions added, backward-compatible
- **PATCH** (x.x.1 → x.x.2): Bug fixes, no API changes

### Backward Compatibility Guarantees

**Guaranteed Stable** (won't change in minor/patch versions):

- Function names
- Parameter order
- Parameter types
- Return types
- Null/undefined behavior

**May Change in Minor Versions** (backward-compatible additions):

- New optional parameters (with defaults)
- New utility functions added to module
- JSDoc documentation improvements

### Breaking Change Examples (Require Major Version)

**❌ Breaking**: Changing return type

```typescript
// Before
function hasNextChecklist(...): boolean

// After (BREAKING)
function hasNextChecklist(...): { hasNext: boolean; reason: string }
```

**❌ Breaking**: Changing parameter order

```typescript
// Before
function getFirstUncheckedIndex(categoryId, checklistData, itemStates);

// After (BREAKING)
function getFirstUncheckedIndex(checklistData, categoryId, itemStates);
```

**✅ Non-Breaking**: Adding optional parameter

```typescript
// Before
function hasNextChecklist(activeCategory, checklistData, menuType);

// After (OK if default provided)
function hasNextChecklist(
  activeCategory,
  checklistData,
  menuType,
  options = { skipIncomplete: false }
);
```

---

## Security Considerations

### Input Validation

**No validation required** for these utilities because:

- All inputs come from trusted internal sources (not user input)
- TypeScript enforces type safety at compile time
- `checklistData` is immutable and defined in codebase
- `itemStates` comes from `useChecklist` hook (controlled)

**Edge cases are handled gracefully** (return safe defaults, no exceptions)

### Mutation Safety

**All parameters are read-only**:

- Functions never mutate `checklistData` (immutable data)
- Functions never mutate `itemStates` (read-only access)
- All returns are primitive types or null (no mutable objects returned)

### Memory Safety

**No memory leaks**:

- No closures that capture large objects
- No event listeners registered
- No timers or intervals created
- All functions are stateless (no internal state)

---

## Performance Benchmarks (Expected)

| Function                     | Input Size              | Expected Runtime |
| ---------------------------- | ----------------------- | ---------------- |
| `getFirstUncheckedIndex`     | 10 items                | < 0.1ms          |
| `getNextIncompleteChecklist` | 5 categories × 10 items | < 1ms            |
| `hasNextChecklist`           | 5 categories            | < 0.05ms         |

**Optimization Note**: React's useMemo will cache results, so these functions are called infrequently (only when dependencies change).

---

## Documentation Requirements

### JSDoc Comments (Required)

Each exported function **must** include:

- [x] `@param` tags for all parameters (with types and descriptions)
- [x] `@returns` tag (with type and description)
- [x] `@example` with at least one usage example
- [x] Brief description (1-2 sentences)
- [x] Edge case documentation (if non-obvious behavior)

### Example Template

````typescript
/**
 * Brief description of what the function does.
 *
 * Longer explanation if needed. Mention important edge cases.
 *
 * @param paramName - Description of parameter
 * @param anotherParam - Description of another parameter
 * @returns Description of return value
 *
 * @example
 * ```typescript
 * const result = myFunction("value", data);
 * console.log(result); // Expected output
 * ```
 *
 * Edge cases:
 * - Case 1: What happens
 * - Case 2: What happens
 */
export function myFunction(paramName: string, anotherParam: Data): ReturnType {
  // Implementation
}
````

---

## Deprecation Policy

**If a function needs to be deprecated**:

1. Mark as `@deprecated` in JSDoc with migration path
2. Keep function working for at least one major version
3. Log console warning in development mode
4. Remove in next major version

**Example**:

```typescript
/**
 * @deprecated Use getFirstUncheckedIndex instead. Will be removed in v2.0.0.
 *
 * @example
 * // Before
 * const index = getFirstUnchecked(categoryId, data);
 *
 * // After (migration)
 * const index = getFirstUncheckedIndex(categoryId, data, itemStates);
 */
export function getFirstUnchecked(categoryId: string, data: any): number {
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "getFirstUnchecked is deprecated. Use getFirstUncheckedIndex instead."
    );
  }
  // Keep working for backward compatibility
}
```

---

## Change Log

### Version 1.0.0 (2025-11-20)

**Initial release**

- Added `getFirstUncheckedIndex` utility
- Added `getNextIncompleteChecklist` utility
- Added `hasNextChecklist` utility
- Defined integration contract for `page.tsx`

---

## Approval & Sign-off

**API Contract Status**: ✅ Approved for implementation

**Reviewed By**: GitHub Copilot  
**Date**: 2025-11-20  
**Next Step**: Generate `quickstart.md` developer guide
