# Quickstart: Using Consolidated Checklist Status Utilities

**Feature**: 001-consolidate-status-logic  
**For**: Developers working with checklist item statuses  
**Last Updated**: 2025-11-19

## Overview

The checklist utilities module (`@/utils/checklist`) provides pure functions for determining item completion and override states. Use these instead of writing inline status comparisons.

---

## Installation

No installation needed - this is part of the codebase.

**Import the utilities**:

```typescript
import { isItemComplete, isItemOverridden } from "@/utils/checklist";
```

---

## Quick Reference

### `isItemComplete(status)`

**Question**: "Is this item done?"

**Answer**: `true` if status is `"checked"`, `"overridden"`, or `"checked-overridden"`

```typescript
isItemComplete("checked"); // → true
isItemComplete("overridden"); // → true
isItemComplete("checked-overridden"); // → true
isItemComplete("unchecked"); // → false
isItemComplete(null); // → false (safe)
```

### `isItemOverridden(status)`

**Question**: "Was this item completed via override (cyan color)?"

**Answer**: `true` if status is `"overridden"` or `"checked-overridden"`

```typescript
isItemOverridden("overridden"); // → true
isItemOverridden("checked-overridden"); // → true
isItemOverridden("checked"); // → false (normal green)
isItemOverridden("unchecked"); // → false
isItemOverridden(null); // → false (safe)
```

---

## Common Use Cases

### 1. Check if All Items in Checklist Are Complete

**Scenario**: Show completion indicator, enable "NEXT" button

```typescript
import { isItemComplete } from "@/utils/checklist";

const allComplete = checklist.items.every((item) => {
  const status = itemStates[categoryId]?.[checklistId]?.[item.id];
  return isItemComplete(status);
});

if (allComplete) {
  // Show checkmark, enable navigation, etc.
}
```

**Before** (old way - DON'T DO THIS):

```typescript
// ❌ Duplicate logic, error-prone
const allComplete = checklist.items.every((item) => {
  const status = itemStates[categoryId]?.[checklistId]?.[item.id];
  return (
    status === "checked" ||
    status === "overridden" ||
    status === "checked-overridden"
  );
});
```

---

### 2. Find First Unchecked Item (Auto-Focus)

**Scenario**: Set `activeItemIndex` to first incomplete item

```typescript
import { isItemComplete } from "@/utils/checklist";

const firstUncheckedIndex = checklist.items.findIndex((item) => {
  const status = itemStates[categoryId]?.[checklistId]?.[item.id];
  return !isItemComplete(status); // Note the negation
});

// Returns -1 if all items complete, otherwise index of first incomplete
setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
```

---

### 3. Determine Status Banner Color (Green vs Cyan)

**Scenario**: Show cyan banner if all items are overridden, green if normally checked

```typescript
import { isItemComplete, isItemOverridden } from "@/utils/checklist";

const allComplete = items.every((item) => isItemComplete(item.status));
const allOverridden = items.every((item) => isItemOverridden(item.status));

// Use in component:
<ChecklistStatusBanner
  isComplete={allComplete}
  isOverridden={allOverridden}
/>
```

**Color Logic**:

- `allComplete && allOverridden` → Cyan banner (emergency completion)
- `allComplete && !allOverridden` → Green banner (normal completion)
- `!allComplete` → No completion banner

---

### 4. Menu Checkmark Display Logic

**Scenario**: Show checkmark next to completed checklists in menu

```typescript
import { isItemComplete, isItemOverridden } from "@/utils/checklist";

const isChecklistComplete = (category: ChecklistCategory): boolean => {
  const checklist = category.checklists[0];
  if (!checklist) return false;

  const checklistState = itemStates[category.id]?.[checklist.id];
  if (!checklistState) return false;

  return checklist.items.every((item) =>
    isItemComplete(checklistState[item.id])
  );
};

const isChecklistOverridden = (category: ChecklistCategory): boolean => {
  const checklist = category.checklists[0];
  if (!checklist) return false;

  const checklistState = itemStates[category.id]?.[checklist.id];
  if (!checklistState) return false;

  return checklist.items.every((item) =>
    isItemOverridden(checklistState[item.id])
  );
};

// In JSX:
{isComplete && !isOverridden && <CheckIcon />}
{isComplete && isOverridden && <CheckIcon className="text-(--text-cyan)" />}
```

---

### 5. Next Checklist Navigation Logic

**Scenario**: Determine if "NEXT" button should appear

```typescript
import { isItemComplete } from "@/utils/checklist";

// Component prop
const hasNextChecklist = /* ... determine if next checklist exists ... */;

// Current checklist completion
const allItemsChecked = items.every((item) => isItemComplete(item.status));

// Show NEXT button only if complete AND has next
const canGoNext = allItemsChecked && hasNextChecklist;

<button disabled={!canGoNext}>NEXT</button>
```

---

## Best Practices

### ✅ DO: Use utility functions

```typescript
import { isItemComplete } from "@/utils/checklist";

if (isItemComplete(item.status)) {
  // ✅ Clear, concise, centralized
}
```

### ❌ DON'T: Write inline comparisons

```typescript
// ❌ Avoid this - duplicates logic, maintenance burden
if (
  item.status === "checked" ||
  item.status === "overridden" ||
  item.status === "checked-overridden"
) {
  // ...
}
```

### ✅ DO: Handle null/undefined safely

```typescript
// ✅ Utility functions handle edge cases
const status = itemStates[categoryId]?.[checklistId]?.[item.id];
isItemComplete(status); // Safe even if status is undefined
```

### ❌ DON'T: Assume status is always defined

```typescript
// ❌ Crashes if status is undefined
if (status === "checked") {
  // May throw error
}
```

### ✅ DO: Use with `.every()` and `.some()`

```typescript
// ✅ Idiomatic JavaScript with functional patterns
const allComplete = items.every((item) => isItemComplete(item.status));
const anyComplete = items.some((item) => isItemComplete(item.status));
```

---

## Migration Patterns

### Pattern 1: Replace Inline Checks in Lambdas

**Before**:

```typescript
const isComplete = checklist.items.every((item) => {
  const status = checklistState[item.id];
  return (
    status === "checked" ||
    status === "overridden" ||
    status === "checked-overridden"
  );
});
```

**After**:

```typescript
import { isItemComplete } from "@/utils/checklist";

const isComplete = checklist.items.every((item) =>
  isItemComplete(checklistState[item.id])
);
```

### Pattern 2: Replace Variable Calculations

**Before**:

```typescript
const allItemsChecked =
  items.length > 0 &&
  items.every(
    (item) =>
      item.status === "checked" ||
      item.status === "overridden" ||
      item.status === "checked-overridden"
  );
```

**After**:

```typescript
import { isItemComplete } from "@/utils/checklist";

const allItemsChecked =
  items.length > 0 && items.every((item) => isItemComplete(item.status));
```

### Pattern 3: Replace Override Checks

**Before**:

```typescript
const allItemsOverridden =
  items.length > 0 &&
  items.every(
    (item) =>
      item.status === "overridden" || item.status === "checked-overridden"
  );
```

**After**:

```typescript
import { isItemOverridden } from "@/utils/checklist";

const allItemsOverridden =
  items.length > 0 && items.every((item) => isItemOverridden(item.status));
```

---

## Troubleshooting

### Issue: TypeScript Error "Cannot find module '@/utils/checklist'"

**Solution**: Ensure you're using the `@/` path alias (configured in `tsconfig.json`). Absolute imports work across the codebase.

```typescript
// ✅ Correct
import { isItemComplete } from "@/utils/checklist";

// ❌ Wrong
import { isItemComplete } from "../../utils/checklist";
```

### Issue: Utility Returns Unexpected `false`

**Diagnosis**: Check if status value is actually `ChecklistItemStatus` type.

```typescript
console.log("Status value:", status);
console.log("Is complete?", isItemComplete(status));

// Common causes:
// - status is undefined (returns false as expected)
// - status is null (returns false as expected)
// - status is misspelled (e.g., "check" instead of "checked")
```

### Issue: Need to Add New Status Type

**Solution**: Update type definition and utility function together.

1. Edit `src/types/checklist.ts`:

   ```typescript
   export type ChecklistItemStatus =
     | "unchecked"
     | "checked"
     | "overridden"
     | "checked-overridden"
     | "new-status"; // Add here
   ```

2. TypeScript will error in `src/utils/checklist.ts` - update function:

   ```typescript
   export function isItemComplete(
     status: ChecklistItemStatus | null | undefined
   ): boolean {
     if (!status) return false;
     return (
       status === "checked" ||
       status === "overridden" ||
       status === "checked-overridden" ||
       status === "new-status" // Decide if complete or not
     );
   }
   ```

3. Update `isItemOverridden` if relevant.

---

## Advanced: Extending the Utilities

### Adding Custom Status Predicates

```typescript
// src/utils/checklist.ts

/**
 * Check if item was completed normally (not via override)
 */
export function isItemNormallyChecked(
  status: ChecklistItemStatus | null | undefined
): boolean {
  return status === "checked";
}

/**
 * Check if item has override flag (regardless of check status)
 */
export function hasOverrideFlag(
  status: ChecklistItemStatus | null | undefined
): boolean {
  return isItemOverridden(status); // Alias for clarity
}
```

### Creating Helper Functions

```typescript
// src/utils/checklist.ts

/**
 * Count completed items in a list
 */
export function countCompleted(
  items: { id: string }[],
  getStatus: (id: string) => ChecklistItemStatus | null | undefined
): number {
  return items.filter((item) => isItemComplete(getStatus(item.id))).length;
}

// Usage:
const completedCount = countCompleted(
  checklist.items,
  (id) => itemStates[categoryId]?.[checklistId]?.[id]
);
```

---

## Reference Links

- **API Contract**: See `/specs/001-consolidate-status-logic/contracts/checklist-utils.md`
- **Type Definitions**: `src/types/checklist.ts`
- **Implementation**: `src/utils/checklist.ts`
- **Usage Examples**: `src/app/page.tsx`, `src/components/ChecklistMenu.tsx`, `src/components/ChecklistDisplay.tsx`

---

## Need Help?

- **Bug in utility function?** Check the API contract for expected behavior
- **New use case?** Follow existing patterns in components
- **Feature request?** Consider if it belongs in `utils/checklist.ts` or component logic
