# Quickstart: Storage Logic Extraction

**Feature**: Extract LocalStorage Operations to Storage Utilities  
**Date**: 2025-11-20  
**Branch**: `005-extract-storage-logic`

This guide explains the refactored storage architecture for developers working on the Vehicle Digital Checklist application.

---

## Overview

The storage layer has been refactored to separate **business logic** (state management, checklist navigation) from **persistence logic** (LocalStorage access, serialization, migration). This separation improves testability, maintainability, and clarity.

### Before Refactoring

```typescript
// useChecklist.ts - Mixed concerns
const resetAll = useCallback(() => {
  setItemStates({});
  if (typeof window !== "undefined") {
    localStorage.removeItem("checklist-state"); // Direct storage access
  }
}, []);
```

### After Refactoring

```typescript
// useChecklist.ts - Delegated storage
import { resetAllStorage } from "@/utils/storage";

const resetAll = useCallback(() => {
  if (resetAllStorage()) {
    setItemStates({});
  }
}, []);
```

---

## Architecture

### Layers

```
┌─────────────────────────────────────┐
│ Components (ChecklistDisplay, etc) │
└───────────────┬─────────────────────┘
                │ uses
                ▼
┌─────────────────────────────────────┐
│ Hook (useChecklist)                 │
│ - Manages React state               │
│ - Handles UI interactions           │
│ - Delegates persistence             │
└───────────────┬─────────────────────┘
                │ calls
                ▼
┌─────────────────────────────────────┐
│ Storage Utilities (storage.ts)     │
│ - LocalStorage access               │
│ - Serialization/deserialization     │
│ - Version migration                 │
└───────────────┬─────────────────────┘
                │ reads/writes
                ▼
┌─────────────────────────────────────┐
│ LocalStorage (browser API)          │
│ Key: "checklist-state"              │
└─────────────────────────────────────┘
```

### Responsibilities

| Layer            | Responsibilities                                           | Does NOT Handle                                |
| ---------------- | ---------------------------------------------------------- | ---------------------------------------------- |
| **useChecklist** | React state (`itemStates`), UI callbacks, navigation logic | Direct localStorage access, JSON serialization |
| **storage.ts**   | LocalStorage read/write, data migration, error handling    | React state updates, UI logic                  |
| **LocalStorage** | Browser persistence                                        | Data structure, validation                     |

---

## Storage Utilities API

### Reading State

```typescript
import { loadFromStorage, getItemStatus } from "@/utils/storage";

// Load complete state
const data = loadFromStorage();
if (data?.itemStates) {
  setItemStates(data.itemStates);
}

// Get single item status
const status = getItemStatus("pre-drive", "exterior-check", "ext-1");
// Returns: "unchecked" | "checked" | "overridden" | "checked-overridden"
```

### Writing State

```typescript
import { saveToStorage, setItemStatus } from "@/utils/storage";

// Save complete state
const success = saveToStorage({ itemStates: newItemStates });

// Update single item
const success = setItemStatus(
  "pre-drive",
  "exterior-check",
  "ext-1",
  "checked"
);
```

### Resetting State

```typescript
import {
  resetAllStorage,
  resetChecklistInStorage,
  resetCategoriesInStorage,
} from "@/utils/storage";

// Reset everything
if (resetAllStorage()) {
  setItemStates({});
}

// Reset specific checklist
if (resetChecklistInStorage("pre-drive", "exterior-check")) {
  const data = loadFromStorage();
  setItemStates(data?.itemStates || {});
}

// Reset multiple categories
const normalIds = categories
  .filter((cat) => cat.menuType === "normal")
  .map((cat) => cat.id);

if (resetCategoriesInStorage(normalIds)) {
  const data = loadFromStorage();
  setItemStates(data?.itemStates || {});
}
```

---

## Common Patterns

### Pattern 1: Initialize State on Mount

**When**: Component first renders  
**Why**: Load persisted state from LocalStorage

```typescript
const [itemStates, setItemStates] = useState({});

useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => {
      setItemStates(stored.itemStates);
    });
  }
}, []);
```

**Key points**:

- Start with empty object `{}` for hydration safety
- Use `queueMicrotask` to defer state update
- Check for null before accessing `itemStates`

### Pattern 2: Update Item Status

**When**: User checks/unchecks an item  
**Why**: Persist individual item changes

```typescript
const updateItemStatus = useCallback(
  (
    categoryId: string,
    checklistId: string,
    itemId: string,
    newStatus: ChecklistItemStatus
  ) => {
    setItemStates((prev) => {
      // Persist to storage
      setItemStatus(categoryId, checklistId, itemId, newStatus);

      // Update React state
      return {
        ...prev,
        [categoryId]: {
          ...prev[categoryId],
          [checklistId]: {
            ...prev[categoryId]?.[checklistId],
            [itemId]: newStatus,
          },
        },
      };
    });
  },
  []
);
```

**Key points**:

- Storage update happens inside state setter
- React state update and storage write are synchronous
- Storage handles creating missing category/checklist objects

### Pattern 3: Reset Operations

**When**: User clicks reset button  
**Why**: Clear completed items

```typescript
const resetChecklist = useCallback(
  (categoryId: string, checklistId: string) => {
    // Delegate to storage utility
    if (resetChecklistInStorage(categoryId, checklistId)) {
      // Reload from storage to get fresh state
      const data = loadFromStorage();
      setItemStates(data?.itemStates || {});
    }
  },
  []
);
```

**Key points**:

- Check return value to ensure success
- Reload from storage after reset (single source of truth)
- Fallback to empty object if load fails

### Pattern 4: Error Handling

**When**: Storage operation might fail  
**Why**: Gracefully handle quota exceeded or permission denied

```typescript
const handleSave = useCallback(() => {
  const success = saveToStorage({ itemStates: currentStates });

  if (!success) {
    // Option 1: Log warning (current approach)
    console.warn("Failed to save checklist state");

    // Option 2: Show user notification (future enhancement)
    // showNotification("Unable to save progress", "error");
  }
}, [currentStates]);
```

**Key points**:

- All write operations return `boolean`
- Read operations return `T | null`
- User sees graceful degradation (state preserved in memory)

---

## Testing Guide

### Manual Testing Checklist

Since the project uses manual testing, follow these steps after implementing storage changes:

#### 1. Basic Operations

- [ ] Check an item → verify green color and localStorage update
- [ ] Uncheck an item → verify white color and localStorage update
- [ ] Override an item → verify cyan color
- [ ] Refresh page → verify all states persist

#### 2. Reset Operations

- [ ] Complete some items in NORMAL and NON-NORMAL checklists
- [ ] Click "RESETS" → "RESET ALL" → verify all items unchecked
- [ ] Complete items again
- [ ] Click "RESETS" → "RESET NORMAL" → verify only NORMAL cleared
- [ ] Click "RESETS" → "RESET NON-NORMAL" → verify only NON-NORMAL cleared

#### 3. Checklist Override

- [ ] Partially complete a checklist
- [ ] Click "CHKL OVRD" → verify all items marked cyan
- [ ] Verify checked items show "checked-overridden" status

#### 4. Storage Verification

- [ ] Open browser DevTools → Application → LocalStorage
- [ ] Verify key `checklist-state` exists
- [ ] Verify JSON structure matches `StoredData` schema
- [ ] Verify `version` field is `"2.0.0"`

#### 5. Error Scenarios

- [ ] Fill LocalStorage to quota (simulate with other data)
- [ ] Perform save operation → verify graceful failure
- [ ] Clear LocalStorage manually → refresh → verify fresh start

### Debugging Tips

```typescript
// Log storage contents
console.log("Storage:", loadFromStorage());

// Check specific item
console.log(
  "Item status:",
  getItemStatus("pre-drive", "exterior-check", "ext-1")
);

// Verify itemStates structure
const data = loadFromStorage();
console.log("ItemStates:", JSON.stringify(data?.itemStates, null, 2));
```

---

## Migration Notes

### Storage Version History

- **v1.0.0** (deprecated): Separate `checklistStates` and `overriddenStates` booleans
- **v2.0.0** (current): Unified `itemStates` with `ChecklistItemStatus` enum

### Handling Legacy Data

The `loadFromStorage()` function automatically migrates v1.0.0 data to v2.0.0 on first load. No manual intervention required.

If users report data loss after deployment:

1. Check console for migration warnings
2. Verify `localStorage["checklist-state"]` contains valid JSON
3. Test migration logic with sample v1.0.0 data
4. Consider adding migration telemetry (future enhancement)

---

## Code Organization

### File Structure

```
src/
├── hooks/
│   └── useChecklist.ts       # Business logic, no direct localStorage
└── utils/
    └── storage.ts            # All LocalStorage operations
```

### Import Convention

```typescript
// ✅ Good: Import from storage utilities
import { loadFromStorage, setItemStatus, resetAllStorage } from '@/utils/storage';

// ❌ Bad: Direct localStorage access
if (typeof window !== "undefined") {
  localStorage.setItem("checklist-state", ...);
}
```

### Type Imports

```typescript
// Import types from central location
import type { StoredData, ChecklistItemStatus } from "@/types/checklist";
```

---

## Performance Considerations

### Storage Operation Costs

| Operation                   | Typical Time | Notes                  |
| --------------------------- | ------------ | ---------------------- |
| `loadFromStorage()`         | <5ms         | JSON.parse of ~10KB    |
| `saveToStorage()`           | <10ms        | JSON.stringify + write |
| `setItemStatus()`           | <10ms        | Single item update     |
| `resetChecklistInStorage()` | <15ms        | Load + modify + save   |

### Optimization Tips

1. **Batch updates**: Use `resetCategoriesInStorage(ids)` instead of multiple `resetChecklistInStorage()` calls
2. **Debounce saves**: For rapid item updates, consider debouncing (future enhancement)
3. **Lazy loading**: Only load state in `useEffect`, not during render

---

## Troubleshooting

### Issue: State doesn't persist after refresh

**Symptoms**: Items reset to unchecked after page reload

**Causes**:

- Private browsing mode (localStorage disabled)
- Storage quota exceeded
- Incorrect storage key

**Debug**:

```typescript
// Check if localStorage is available
console.log("localStorage available:", typeof window !== "undefined");

// Check storage contents
console.log("Raw storage:", localStorage.getItem("checklist-state"));

// Check for errors
const data = loadFromStorage();
console.log("Loaded data:", data);
```

### Issue: Hydration mismatch errors

**Symptoms**: React warning about server/client mismatch

**Cause**: Loading storage during render instead of `useEffect`

**Fix**:

```typescript
// ❌ Wrong: Loads during render
const [itemStates] = useState(loadFromStorage()?.itemStates || {});

// ✅ Correct: Loads after hydration
const [itemStates, setItemStates] = useState({});
useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => setItemStates(stored.itemStates));
  }
}, []);
```

### Issue: Reset operations don't work

**Symptoms**: Items remain checked after reset

**Cause**: Not reloading state from storage after reset

**Fix**:

```typescript
// ❌ Wrong: Only updates storage, not React state
const resetChecklist = () => {
  resetChecklistInStorage(categoryId, checklistId);
};

// ✅ Correct: Reloads state after storage update
const resetChecklist = () => {
  if (resetChecklistInStorage(categoryId, checklistId)) {
    const data = loadFromStorage();
    setItemStates(data?.itemStates || {});
  }
};
```

---

## Next Steps

### For Developers

1. **Read** `contracts/storage-api.md` for detailed API documentation
2. **Review** `data-model.md` for storage schema details
3. **Test** changes using the manual testing checklist above
4. **Follow** the import conventions and patterns documented here

### Future Enhancements

Potential improvements (not in current scope):

- Add automated unit tests for storage utilities
- Implement storage event listener for multi-tab sync
- Add telemetry for migration success/failure rates
- Consider IndexedDB migration for larger data sets
- Add storage compression for quota optimization

---

## Summary

The refactored storage architecture provides:

- ✅ **Clear separation**: Business logic in hooks, persistence in utilities
- ✅ **Type safety**: All operations use TypeScript strict mode
- ✅ **Error handling**: Boolean returns and null checks throughout
- ✅ **Testability**: Pure functions can be tested without React
- ✅ **Maintainability**: Single source of truth for storage operations
- ✅ **Compatibility**: Automatic migration from v1.0.0 to v2.0.0

Follow the patterns in this guide to maintain consistency across the codebase.
