# Storage Utilities API Contract

**Feature**: Extract LocalStorage Operations to Storage Utilities  
**Date**: 2025-11-20  
**Module**: `src/utils/storage.ts`

This document defines the TypeScript function signatures for all storage utility functions. These contracts specify the public API that hooks and components will use to interact with LocalStorage.

---

## Core Storage Functions (Existing)

These functions already exist in `storage.ts` and will remain unchanged.

### loadFromStorage

Loads the complete checklist state from LocalStorage.

```typescript
function loadFromStorage(): StoredData | null;
```

**Parameters**: None

**Returns**:

- `StoredData` - Successfully loaded and validated data
- `null` - Storage is empty, read failed, or version is incompatible

**Side Effects**:

- Performs schema migration if needed (v1.0.0 → v2.0.0)
- Writes migrated data back to storage
- Logs errors to console

**Error Handling**:

- SSR context (`typeof window === "undefined"`): Returns `null`
- JSON parse error: Returns `null`, logs error
- Version mismatch (no migration path): Returns `null`, logs warning

**Example**:

```typescript
const data = loadFromStorage();
if (data?.itemStates) {
  setItemStates(data.itemStates);
}
```

---

### saveToStorage

Saves checklist state to LocalStorage with version metadata.

```typescript
function saveToStorage(data: Partial<StoredData>): boolean;
```

**Parameters**:

- `data.itemStates` (optional) - The item states to save. If omitted, preserves current itemStates

**Returns**:

- `true` - Data successfully saved
- `false` - Save operation failed

**Side Effects**:

- Updates `localStorage["checklist-state"]`
- Sets `version` to current `STORAGE_VERSION`
- Sets `lastUpdated` to `Date.now()`

**Error Handling**:

- SSR context: Returns `false`
- Quota exceeded: Returns `false`, logs error
- Serialization error: Returns `false`, logs error

**Example**:

```typescript
const success = saveToStorage({ itemStates: newItemStates });
if (!success) {
  console.warn("Failed to save checklist state");
}
```

---

### clearStorage

Removes all checklist state from LocalStorage.

```typescript
function clearStorage(): boolean;
```

**Parameters**: None

**Returns**:

- `true` - Storage successfully cleared
- `false` - Clear operation failed

**Side Effects**:

- Removes `localStorage["checklist-state"]`

**Error Handling**:

- SSR context: Returns `false`
- Storage access denied: Returns `false`, logs error

**Example**:

```typescript
if (clearStorage()) {
  setItemStates({});
}
```

---

### getItemStatus

Retrieves the status of a single checklist item.

```typescript
function getItemStatus(
  categoryId: string,
  checklistId: string,
  itemId: string
): ChecklistItemStatus;
```

**Parameters**:

- `categoryId` - Category containing the item
- `checklistId` - Checklist containing the item
- `itemId` - Unique identifier of the item

**Returns**:

- `ChecklistItemStatus` - The item's current status
- Defaults to `"unchecked"` if item not found in storage

**Side Effects**: None (read-only)

**Error Handling**:

- Storage load fails: Returns `"unchecked"`
- Missing keys in hierarchy: Returns `"unchecked"`

**Example**:

```typescript
const status = getItemStatus("pre-drive", "exterior-check", "ext-1");
// status: "checked" | "unchecked" | "overridden" | "checked-overridden"
```

---

### setItemStatus

Sets the status of a single checklist item.

```typescript
function setItemStatus(
  categoryId: string,
  checklistId: string,
  itemId: string,
  status: ChecklistItemStatus
): boolean;
```

**Parameters**:

- `categoryId` - Category containing the item
- `checklistId` - Checklist containing the item
- `itemId` - Unique identifier of the item
- `status` - New status to set

**Returns**:

- `true` - Status successfully saved
- `false` - Save operation failed

**Side Effects**:

- Creates category/checklist objects in itemStates if missing
- Updates `localStorage["checklist-state"]`

**Error Handling**:

- Delegates to `saveToStorage()` for error handling

**Example**:

```typescript
const success = setItemStatus(
  "pre-drive",
  "exterior-check",
  "ext-1",
  "checked"
);
if (!success) {
  console.error("Failed to update item status");
}
```

---

## New Storage Functions (To Be Implemented)

These functions will be added to eliminate direct localStorage access from `useChecklist.ts`.

### resetChecklistInStorage

Resets all items in a specific checklist to unchecked state.

```typescript
function resetChecklistInStorage(
  categoryId: string,
  checklistId: string
): boolean;
```

**Parameters**:

- `categoryId` - Category containing the checklist
- `checklistId` - Checklist to reset

**Returns**:

- `true` - Checklist successfully reset
- `false` - Reset operation failed (storage load/save failed)

**Side Effects**:

- Replaces `itemStates[categoryId][checklistId]` with empty object `{}`
- Updates `localStorage["checklist-state"]`

**Implementation Notes**:

- Preserves other checklists in the same category
- Preserves other categories
- Loads current state, modifies, then saves atomically

**Example**:

```typescript
if (resetChecklistInStorage("pre-drive", "exterior-check")) {
  const data = loadFromStorage();
  setItemStates(data?.itemStates || {});
}
```

**Replaces** (in useChecklist.ts):

```typescript
// OLD: Direct localStorage manipulation
const stored = loadFromStorage();
if (stored) {
  stored.itemStates = newStates;
  localStorage.setItem("checklist-state", JSON.stringify(stored));
}

// NEW: Utility function call
resetChecklistInStorage(categoryId, checklistId);
```

---

### resetCategoriesInStorage

Resets all items in multiple categories.

```typescript
function resetCategoriesInStorage(categoryIds: string[]): boolean;
```

**Parameters**:

- `categoryIds` - Array of category IDs to reset (e.g., `["pre-drive", "during-drive"]`)

**Returns**:

- `true` - All categories successfully reset
- `false` - Reset operation failed

**Side Effects**:

- Removes all specified categories from `itemStates`
- Updates `localStorage["checklist-state"]`

**Implementation Notes**:

- Batch operation - performs all deletions before single write
- Atomic: all categories removed or none (if save fails)
- Empty array is valid (no-op, returns true)

**Example**:

```typescript
// Reset all NORMAL categories
const normalIds = categories
  .filter((cat) => cat.menuType === "normal")
  .map((cat) => cat.id);

if (resetCategoriesInStorage(normalIds)) {
  const data = loadFromStorage();
  setItemStates(data?.itemStates || {});
}
```

**Replaces** (in useChecklist.ts):

```typescript
// OLD: resetNormal() and resetNonNormal() duplicate this pattern
const newStates = { ...prev };
categories
  .filter((cat) => cat.menuType === "normal")
  .forEach((cat) => {
    delete newStates[cat.id];
  });
localStorage.setItem("checklist-state", JSON.stringify(stored));

// NEW: Single utility call
const ids = categories
  .filter((cat) => cat.menuType === "normal")
  .map((cat) => cat.id);
resetCategoriesInStorage(ids);
```

---

### resetAllStorage

Resets all checklist state (wrapper for clearStorage with consistent naming).

```typescript
function resetAllStorage(): boolean;
```

**Parameters**: None

**Returns**:

- `true` - All data successfully cleared
- `false` - Clear operation failed

**Side Effects**:

- Removes `localStorage["checklist-state"]` entirely

**Implementation Notes**:

- Alias/wrapper for `clearStorage()` for semantic clarity
- May be implemented as `export const resetAllStorage = clearStorage;`

**Example**:

```typescript
if (resetAllStorage()) {
  setItemStates({});
}
```

**Replaces** (in useChecklist.ts):

```typescript
// OLD: Direct localStorage access
localStorage.removeItem("checklist-state");

// NEW: Utility function
resetAllStorage();
```

---

## Type Definitions

All functions use existing types from `@/types/checklist.ts`:

```typescript
// From checklist.ts
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";

export interface StoredData {
  version: string;
  lastUpdated: number;
  itemStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus;
      };
    };
  };
}
```

No new types need to be defined for this feature.

---

## Usage Patterns

### Pattern 1: Load State on Mount (Existing)

```typescript
// In useChecklist.ts
useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => {
      setItemStates(stored.itemStates);
    });
  }
}, []);
```

### Pattern 2: Update Single Item (Existing)

```typescript
const updateItemStatus = useCallback(
  (categoryId, checklistId, itemId, newStatus) => {
    setItemStates((prev) => {
      setItemStatus(categoryId, checklistId, itemId, newStatus); // Storage utility
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

### Pattern 3: Reset Checklist (New)

```typescript
const resetChecklist = useCallback((categoryId, checklistId) => {
  if (resetChecklistInStorage(categoryId, checklistId)) {
    const data = loadFromStorage();
    setItemStates(data?.itemStates || {});
  }
}, []);
```

### Pattern 4: Reset Category Group (New)

```typescript
const resetNormal = useCallback(() => {
  const normalIds = categories
    .filter((cat) => cat.menuType === "normal")
    .map((cat) => cat.id);

  if (resetCategoriesInStorage(normalIds)) {
    const data = loadFromStorage();
    setItemStates(data?.itemStates || {});
  }
}, [categories]);
```

### Pattern 5: Reset All (New)

```typescript
const resetAll = useCallback(() => {
  if (resetAllStorage()) {
    setItemStates({});
  }
}, []);
```

---

## Error Handling Contract

All write operations follow this contract:

```typescript
// Returns boolean success indicator
const success = storageFunction(...args);

if (success) {
  // Update React state to match storage
  const data = loadFromStorage();
  setItemStates(data?.itemStates || {});
} else {
  // Optional: Show error to user
  console.warn("Storage operation failed, state unchanged");
}
```

All read operations follow this contract:

```typescript
// Returns data or null
const data = loadFromStorage();

// Safe access with defaults
const itemStates = data?.itemStates || {};
const status = getItemStatus(catId, clId, itemId); // Never undefined
```

---

## Testing Contract

Each function must be testable without React:

```typescript
// Example test cases (manual testing, no framework)

// Test: saveToStorage creates valid JSON
const success = saveToStorage({ itemStates: testData });
const raw = localStorage.getItem("checklist-state");
const parsed = JSON.parse(raw);
assert(parsed.version === "2.0.0");

// Test: resetChecklistInStorage preserves other checklists
saveToStorage({
  itemStates: {
    cat1: { cl1: { item1: "checked" }, cl2: { item2: "checked" } },
  },
});
resetChecklistInStorage("cat1", "cl1");
const data = loadFromStorage();
assert(data.itemStates.cat1.cl1 === {});
assert(data.itemStates.cat1.cl2.item2 === "checked");

// Test: resetCategoriesInStorage handles empty array
const result = resetCategoriesInStorage([]);
assert(result === true);
```

---

## Summary

This API contract defines:

- **5 existing functions** to be kept as-is
- **3 new functions** to be implemented (`resetChecklistInStorage`, `resetCategoriesInStorage`, `resetAllStorage`)
- **Consistent error handling** (boolean returns, null for failures)
- **Type safety** using existing types from `checklist.ts`
- **Clear usage patterns** for hooks to follow
- **Testability** requirements (pure functions, no React dependencies)

After implementation, `useChecklist.ts` will contain zero direct `localStorage` API calls (success criteria SC-001).
