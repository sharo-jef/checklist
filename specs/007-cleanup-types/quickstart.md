# Developer Quickstart: Working with Cleaned ChecklistItem Types

**Feature**: Remove Unused Type Fields  
**Date**: 2025-11-20  
**Audience**: Developers working with checklist data structures

## Overview

This guide helps developers understand how to work with the updated `ChecklistItem` type after removing the obsolete `completed` boolean field. The completion state is now tracked exclusively via the `itemStates` mapping with `ChecklistItemStatus` enum values.

## Quick Reference

### ✅ Correct: Using Status-Based Model

```typescript
import { ChecklistItem, ChecklistItemStatus } from "@/types/checklist";

// ✅ Creating checklist items (in checklists.ts)
const item: ChecklistItem = {
  id: "pd-1",
  item: "Parking brake",
  value: "Set",
  required: true,
  // No completed field needed
};

// ✅ Tracking completion state (in hooks/components)
const [itemStates, setItemStates] = useState<{
  [categoryId: string]: {
    [checklistId: string]: {
      [itemId: string]: ChecklistItemStatus;
    };
  };
}>({});

// ✅ Getting item status
const status = itemStates[categoryId]?.[checklistId]?.[itemId] ?? "unchecked";

// ✅ Setting item status
setItemStates((prev) => ({
  ...prev,
  [categoryId]: {
    ...prev[categoryId],
    [checklistId]: {
      ...prev[categoryId]?.[checklistId],
      [itemId]: "checked",
    },
  },
}));

// ✅ Checking if item is complete
const isComplete = status === "checked" || status === "checked-overridden";
```

### ❌ Incorrect: Using Obsolete completed Field

```typescript
// ❌ DON'T: Try to access completed field
const isComplete = item.completed; // TypeScript error!

// ❌ DON'T: Try to set completed field
item.completed = true; // TypeScript error!

// ❌ DON'T: Include completed in new items
const item: ChecklistItem = {
  id: "test",
  item: "Test",
  value: "OK",
  completed: false, // TypeScript error in object literals!
  required: true,
};
```

## Understanding the Data Model

### Separation of Concerns

**Item Definition** (immutable, in `checklists.ts`):

```typescript
{
  id: "pd-1",           // What the item is
  item: "Parking brake",
  value: "Set",
  required: true
}
```

**Item State** (mutable, in `itemStates`):

```typescript
itemStates["predrive"]["predrive-check"]["pd-1"] = "checked"; // Current status
```

**Why Separate?**

- Definitions are version-controlled and shared
- State is user-specific and stored in LocalStorage
- Multiple users can have different states for the same definition
- State can be reset without affecting definitions

### Status Values

| Status                 | Meaning                     | When It Occurs                     | UI Color |
| ---------------------- | --------------------------- | ---------------------------------- | -------- |
| `"unchecked"`          | Not completed               | Default state                      | White    |
| `"checked"`            | Completed normally          | User clicks item                   | Green    |
| `"overridden"`         | Skipped in emergency        | User clicks ITEM OVRD or CHKL OVRD | Cyan     |
| `"checked-overridden"` | Both checked and overridden | User performs both actions         | Cyan     |

## Common Tasks

### Adding a New Checklist Item

**Location**: `src/data/checklists.ts`

```typescript
import { ChecklistCategory, MenuType } from "@/types/checklist";

export const checklistData: ChecklistCategory[] = [
  {
    id: "predrive",
    title: "PREDRIVE",
    menuType: MenuType.NORMAL,
    checklists: [
      {
        id: "predrive-check",
        name: "PREDRIVE",
        items: [
          // Existing items...

          // ✅ Add new item like this:
          {
            id: "pd-new", // Unique ID
            item: "New check item", // Display name
            value: "EXPECTED STATE", // Expected value
            required: true, // or false
          },
        ],
      },
    ],
  },
];
```

**Key Points**:

- ✅ No `completed` field needed
- ✅ `id` must be unique within the checklist
- ✅ `required: true` means item must be checked (gray background in UI)
- ✅ `required: false` means auto-check eligible (no gray background)

### Checking Item Completion Status

**Location**: Components or hooks

```typescript
import { ChecklistItemStatus } from "@/types/checklist";

// Get status from itemStates
const getItemStatus = (
  itemId: string,
  categoryId: string,
  checklistId: string,
  itemStates: Record<
    string,
    Record<string, Record<string, ChecklistItemStatus>>
  >
): ChecklistItemStatus => {
  return itemStates[categoryId]?.[checklistId]?.[itemId] ?? "unchecked";
};

// Check if item is complete (any completion state)
const isItemComplete = (status: ChecklistItemStatus): boolean => {
  return status === "checked" || status === "checked-overridden";
};

// Check if item is overridden (any override state)
const isItemOverridden = (status: ChecklistItemStatus): boolean => {
  return status === "overridden" || status === "checked-overridden";
};
```

### Calculating Progress

**Location**: `src/hooks/useChecklist.ts` (reference)

```typescript
import {
  ChecklistItem,
  ChecklistItemStatus,
  Progress,
} from "@/types/checklist";

const calculateProgress = (
  items: ChecklistItem[],
  itemStates: Record<string, ChecklistItemStatus>
): Progress => {
  const total = items.length;

  const completed = items.filter((item) => {
    const status = itemStates[item.id] ?? "unchecked";
    return status === "checked" || status === "checked-overridden";
  }).length;

  return {
    completed,
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};
```

**Note**: `Progress.completed` is a number (count), not related to the removed `ChecklistItem.completed` boolean.

### Updating Item Status

**Location**: Components or hooks

```typescript
import { ChecklistItemStatus } from "@/types/checklist";

// Toggle item check state
const toggleItemCheck = (
  itemId: string,
  categoryId: string,
  checklistId: string,
  currentStates: Record<
    string,
    Record<string, Record<string, ChecklistItemStatus>>
  >
) => {
  const currentStatus =
    currentStates[categoryId]?.[checklistId]?.[itemId] ?? "unchecked";

  let newStatus: ChecklistItemStatus;

  if (currentStatus === "unchecked" || currentStatus === "overridden") {
    newStatus =
      currentStatus === "overridden" ? "checked-overridden" : "checked";
  } else {
    newStatus =
      currentStatus === "checked-overridden" ? "overridden" : "unchecked";
  }

  return {
    ...currentStates,
    [categoryId]: {
      ...currentStates[categoryId],
      [checklistId]: {
        ...currentStates[categoryId]?.[checklistId],
        [itemId]: newStatus,
      },
    },
  };
};

// Override item (emergency skip)
const overrideItem = (
  itemId: string,
  categoryId: string,
  checklistId: string,
  currentStates: Record<
    string,
    Record<string, Record<string, ChecklistItemStatus>>
  >
) => {
  const currentStatus =
    currentStates[categoryId]?.[checklistId]?.[itemId] ?? "unchecked";

  const newStatus: ChecklistItemStatus =
    currentStatus === "checked" ? "checked-overridden" : "overridden";

  return {
    ...currentStates,
    [categoryId]: {
      ...currentStates[categoryId],
      [checklistId]: {
        ...currentStates[categoryId]?.[checklistId],
        [itemId]: newStatus,
      },
    },
  };
};
```

## Persistence Model

### LocalStorage Schema

**Storage Key**: `checklist-state`  
**Version**: `2.0.0`

```typescript
interface StoredData {
  version: string; // "2.0.0"
  lastUpdated: number; // Timestamp
  itemStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus;
      };
    };
  };
}
```

**Example**:

```json
{
  "version": "2.0.0",
  "lastUpdated": 1700000000000,
  "itemStates": {
    "predrive": {
      "predrive-check": {
        "pd-1": "checked",
        "pd-2": "unchecked",
        "pd-3": "overridden"
      }
    }
  }
}
```

**Key Points**:

- ✅ Only `ChecklistItemStatus` values are stored
- ✅ Item definitions are NOT stored (they live in code)
- ✅ No `completed` field in storage (never was)

### Loading State from LocalStorage

**Location**: `src/utils/storage.ts` or hooks

```typescript
import { loadFromStorage } from "@/utils/storage";

// Load state on component mount
useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => setItemStates(stored.itemStates));
  }
}, []);
```

**Important**: Use `queueMicrotask` to avoid hydration mismatches (see Constitution Principle II).

### Saving State to LocalStorage

```typescript
import { saveToStorage } from "@/utils/storage";

// Save state after updates
useEffect(() => {
  if (Object.keys(itemStates).length > 0) {
    saveToStorage({ itemStates });
  }
}, [itemStates]);
```

## Type-Safe Patterns

### Working with Optional Fields

```typescript
import { ChecklistItem } from "@/types/checklist";

// ✅ Accessing optional field safely
const item: ChecklistItem = {
  id: "test",
  item: "Test",
  value: "OK",
};

const isRequired = item.required ?? false; // Default to false if undefined
const notes = item.notes ?? ""; // Default to empty string

// ✅ Type guard for required items
const isRequiredItem = (item: ChecklistItem): boolean => {
  return item.required === true;
};

// ✅ Filter required items
const requiredItems = items.filter((item) => item.required === true);
```

### Type Assertions (Use Sparingly)

```typescript
// ⚠️ Avoid if possible, but sometimes needed for data from external sources
const itemFromApi = apiResponse as ChecklistItem;

// ✅ Better: Validate structure first
const validateChecklistItem = (data: unknown): data is ChecklistItem => {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof (data as any).id === "string" &&
    typeof (data as any).item === "string" &&
    typeof (data as any).value === "string"
  );
};

if (validateChecklistItem(apiResponse)) {
  // TypeScript knows apiResponse is ChecklistItem
  const item = apiResponse;
}
```

## Migration from Old Code

### If You Have Old Code Using completed

**Replace this**:

```typescript
// ❌ OLD: Accessing completed field
if (item.completed) {
  // Item is complete
}

// ❌ OLD: Setting completed field
item.completed = true;
```

**With this**:

```typescript
// ✅ NEW: Using status from itemStates
const status = itemStates[categoryId]?.[checklistId]?.[item.id] ?? "unchecked";
if (status === "checked" || status === "checked-overridden") {
  // Item is complete
}

// ✅ NEW: Setting status in itemStates
setItemStates((prev) => ({
  ...prev,
  [categoryId]: {
    ...prev[categoryId],
    [checklistId]: {
      ...prev[categoryId]?.[checklistId],
      [item.id]: "checked",
    },
  },
}));
```

### Updating Data Definitions

**Replace this**:

```typescript
// ❌ OLD: Item with completed field
{
  id: "pd-1",
  item: "Parking brake",
  value: "Set",
  completed: false,  // Remove this
  required: true,
}
```

**With this**:

```typescript
// ✅ NEW: Item without completed field
{
  id: "pd-1",
  item: "Parking brake",
  value: "Set",
  required: true,
}
```

## Troubleshooting

### TypeScript Error: Property 'completed' does not exist

**Error**:

```
Property 'completed' does not exist on type 'ChecklistItem'.
```

**Solution**: Replace `item.completed` with status lookup from `itemStates`:

```typescript
const status = itemStates[categoryId]?.[checklistId]?.[item.id] ?? "unchecked";
const isComplete = status === "checked" || status === "checked-overridden";
```

### TypeScript Error: Object literal may only specify known properties

**Error**:

```
Object literal may only specify known properties, and 'completed' does not exist in type 'ChecklistItem'.
```

**Solution**: Remove `completed: false` from item definition in `checklists.ts`.

### Runtime: Item status not persisting

**Problem**: Item status resets on page reload.

**Solution**: Ensure `itemStates` is being saved to LocalStorage:

```typescript
import { saveToStorage } from "@/utils/storage";

useEffect(() => {
  saveToStorage({ itemStates });
}, [itemStates]);
```

### Hydration Mismatch Warning

**Problem**: React hydration warning about server/client mismatch.

**Solution**: Use `queueMicrotask` when loading from LocalStorage:

```typescript
useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => setItemStates(stored.itemStates)); // Defer to avoid hydration mismatch
  }
}, []);
```

## Best Practices

### ✅ Do

- Use `ChecklistItemStatus` enum for all completion tracking
- Store state separately from definitions
- Initialize `itemStates` as empty object, load from storage in `useEffect`
- Use TypeScript strict mode to catch type errors
- Leverage optional chaining for safe access: `itemStates[cat]?.[list]?.[id]`

### ❌ Don't

- Try to access `item.completed` (field removed)
- Mutate checklist definitions at runtime (keep immutable)
- Store item definitions in LocalStorage (only store `itemStates`)
- Use boolean flags for completion (use 4-state enum instead)
- Load LocalStorage during initial render (causes hydration issues)

## Examples from Codebase

### useChecklist Hook (Reference Implementation)

**File**: `src/hooks/useChecklist.ts`

```typescript
export const useChecklist = (categoryId: string, checklistId: string) => {
  // State initialization (empty)
  const [itemStates, setItemStates] = useState<{
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus;
      };
    };
  }>({});

  // Load from storage after mount
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored?.itemStates) {
      queueMicrotask(() => setItemStates(stored.itemStates));
    }
  }, []);

  // Get item status
  const getItemStatus = (itemId: string): ChecklistItemStatus => {
    return itemStates[categoryId]?.[checklistId]?.[itemId] ?? "unchecked";
  };

  // Check if item is complete
  const isItemComplete = (itemId: string): boolean => {
    const status = getItemStatus(itemId);
    return status === "checked" || status === "checked-overridden";
  };

  // Calculate progress
  const getProgress = (): Progress => {
    const total = checklist.items.length;
    const completed = checklist.items.filter((item) => {
      const status = getItemStatus(item.id);
      return status === "checked" || status === "checked-overridden";
    }).length;

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  };

  return {
    itemStates,
    getItemStatus,
    isItemComplete,
    getProgress,
    // ... other methods
  };
};
```

## Further Reading

- **Type Definitions**: `src/types/checklist.ts` - All TypeScript interfaces
- **Data Definitions**: `src/data/checklists.ts` - Checklist item definitions
- **Storage Utils**: `src/utils/storage.ts` - LocalStorage persistence
- **Research Document**: `specs/007-cleanup-types/research.md` - Detailed analysis
- **Data Model**: `specs/007-cleanup-types/data-model.md` - Entity relationships
- **Copilot Instructions**: `.github/copilot-instructions.md` - Architecture guidelines

## Questions?

If you encounter issues or have questions:

1. Check TypeScript compiler errors: `npm run build`
2. Review this quickstart guide
3. Examine existing code in `useChecklist.ts` for patterns
4. Refer to the research and data model documents for detailed analysis
