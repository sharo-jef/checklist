# Data Model: Storage Logic Extraction

**Feature**: Extract LocalStorage Operations to Storage Utilities  
**Date**: 2025-11-20  
**Branch**: `005-extract-storage-logic`

## Overview

This document defines the data structures used for checklist state persistence. The storage layer manages runtime state (which items are checked/overridden) separately from immutable checklist definitions.

---

## Storage Schema

### StoredData (Root Object)

The top-level object stored in LocalStorage under the key `"checklist-state"`.

```typescript
interface StoredData {
  version: string; // Schema version (current: "2.0.0")
  lastUpdated: number; // Unix timestamp (milliseconds)
  itemStates: ItemStates; // Nested map of all item statuses
}
```

**Fields**:

- `version`: Semantic version string for schema migration support
  - Current: `"2.0.0"` (unified itemStates model)
  - Previous: `"1.0.0"` (separate checklistStates + overriddenStates)
- `lastUpdated`: Timestamp of last write operation (for debugging/sync)
- `itemStates`: The core runtime state mapping (see below)

**Example**:

```json
{
  "version": "2.0.0",
  "lastUpdated": 1732089600000,
  "itemStates": {
    "pre-drive": {
      "exterior-check": {
        "ext-1": "checked",
        "ext-2": "unchecked",
        "ext-3": "overridden"
      }
    }
  }
}
```

---

### ItemStates (Nested State Map)

A three-level nested map structure representing the status of every checklist item.

```typescript
type ItemStates = {
  [categoryId: string]: {
    [checklistId: string]: {
      [itemId: string]: ChecklistItemStatus;
    };
  };
};
```

**Hierarchy**:

1. **Level 1 - Category ID**: Top-level tabs (e.g., `"pre-drive"`, `"during-drive"`)
2. **Level 2 - Checklist ID**: Individual checklists within a category (e.g., `"exterior-check"`)
3. **Level 3 - Item ID**: Individual checklist items (e.g., `"ext-1"`, `"ext-2"`)

**Rationale for nested structure**:

- Enables efficient category-level resets (e.g., "reset all NORMAL")
- Aligns with navigation hierarchy (category → checklist → item)
- Allows missing keys to default to `"unchecked"` state
- Supports partial state (only checked/overridden items need storage)

---

### ChecklistItemStatus (Enum)

The possible states of a single checklist item.

```typescript
type ChecklistItemStatus =
  | "unchecked" // Default: item not yet completed
  | "checked" // User verified item (green)
  | "overridden" // Skipped via override button (cyan)
  | "checked-overridden"; // Checked then overridden (cyan)
```

**State Meanings**:

- `unchecked`: Default state, item needs verification
- `checked`: User completed the item normally (displayed in green)
- `overridden`: User skipped the item via ITEM OVRD or CHKL OVRD (displayed in cyan)
- `checked-overridden`: Item was checked, then checklist was overridden (displayed in cyan)

**Color Mapping** (from constitution):

- White: `unchecked`
- Green (`--text-green`): `checked`
- Cyan (`--text-cyan`): `overridden` or `checked-overridden`

**State Transitions**:

```
unchecked ──[user check]──> checked
    │                          │
    │                          │
    └──[item override]──> overridden
                             │
                             │
    checked ──[checklist override]──> checked-overridden
```

---

## Entity Relationships

```
ChecklistCategory (from checklists.ts - immutable)
  └─ has many Checklist
       └─ has many ChecklistItem
            └─ referenced by ItemStates[categoryId][checklistId][itemId]
```

**Key Separation**:

- **Definition Layer** (`src/data/checklists.ts`): Immutable checklist structure
- **Runtime Layer** (`ItemStates` in LocalStorage): Mutable completion state

This separation enables:

- Version-controlled checklist templates
- Clean state resets without corruption
- Multiple state versions (future: cloud sync)

---

## Storage Operations Data Flow

### Write Operations

```
User Action (e.g., check item)
    ↓
Hook calls storage utility (e.g., setItemStatus)
    ↓
Utility modifies itemStates structure
    ↓
Utility calls saveToStorage() with updated itemStates
    ↓
saveToStorage() creates StoredData with version + timestamp
    ↓
JSON.stringify() and write to localStorage["checklist-state"]
```

### Read Operations

```
Hook initialization (useEffect)
    ↓
Hook calls loadFromStorage()
    ↓
loadFromStorage() reads localStorage["checklist-state"]
    ↓
JSON.parse() to StoredData
    ↓
Version check + migration if needed
    ↓
Return StoredData (or null if failed)
    ↓
Hook updates state via queueMicrotask + setItemStates
```

### Reset Operations

```
User clicks reset button
    ↓
Hook calls reset utility (e.g., resetChecklistInStorage)
    ↓
Utility loads current StoredData
    ↓
Utility modifies itemStates (delete categories/checklists)
    ↓
Utility saves modified itemStates
    ↓
Hook reloads from storage and updates React state
```

---

## Validation Rules

### Schema Validation

**Version Field**:

- MUST be a semantic version string (e.g., `"2.0.0"`)
- MUST match `STORAGE_VERSION` constant or be a migratable older version
- Migration logic MUST handle all previous versions

**lastUpdated Field**:

- MUST be a Unix timestamp in milliseconds
- Generated via `Date.now()` on every write
- Used for debugging, not enforced

**itemStates Field**:

- MAY be an empty object `{}` (fresh install)
- Keys MUST correspond to valid category IDs from `checklists.ts`
- Nested checklist IDs MUST correspond to valid checklists
- Nested item IDs MUST correspond to valid items
- Invalid keys are ignored (forward compatibility)

**ChecklistItemStatus Values**:

- MUST be one of the four enum values
- Invalid values treated as `"unchecked"` with console warning

### Business Rules

**Completion Semantics**:

- An item is considered "complete" if its status is: `checked`, `overridden`, or `checked-overridden`
- An item is "incomplete" if its status is: `unchecked` or missing from itemStates

**Progress Calculation**:

```typescript
// From useChecklist.ts
const isComplete = (status: ChecklistItemStatus | undefined) =>
  status === "checked" ||
  status === "overridden" ||
  status === "checked-overridden";

const completed = items.filter((item) =>
  isComplete(itemStates[categoryId]?.[checklistId]?.[item.id])
).length;
```

**Reset Behavior**:

- `resetAll`: Removes entire StoredData from LocalStorage
- `resetChecklist`: Deletes `itemStates[categoryId][checklistId]`
- `resetNormal`: Deletes all categories with `menuType === "normal"`
- `resetNonNormal`: Deletes all categories with `menuType === "non-normal"`

---

## Migration Strategy

### Version History

**v1.0.0** (deprecated):

```typescript
{
  checklistStates: {
    [categoryId]: {
      [checklistId]: {
        [itemId]: boolean  // true = checked, false = unchecked
      }
    }
  },
  overriddenStates: {
    [categoryId]: {
      [checklistId]: {
        [itemId]: boolean  // true = overridden
      }
    }
  }
}
```

**v2.0.0** (current):

```typescript
{
  version: "2.0.0",
  lastUpdated: number,
  itemStates: {
    [categoryId]: {
      [checklistId]: {
        [itemId]: ChecklistItemStatus  // unified status enum
      }
    }
  }
}
```

### Migration Logic

**v1.0.0 → v2.0.0**:

```typescript
// Implemented in storage.ts loadFromStorage()
if (data.version === "1.0.0") {
  for each category in checklistStates:
    for each checklist in category:
      for each item in checklist:
        if overriddenStates[category][checklist][item]:
          itemStates[category][checklist][item] = "overridden"
        else if checklistStates[category][checklist][item]:
          itemStates[category][checklist][item] = "checked"
        else:
          itemStates[category][checklist][item] = "unchecked"

  save migrated data with version "2.0.0"
}
```

### Future Migration Considerations

If schema changes are needed:

1. Increment `STORAGE_VERSION` in `storage.ts`
2. Add migration case in `loadFromStorage()`
3. Ensure backward compatibility (no data loss)
4. Test migration with real v2.0.0 data
5. Document breaking changes in release notes

**Example future migration** (hypothetical v3.0.0):

```typescript
// If adding per-item timestamps
if (data.version === "2.0.0") {
  const newItemStates = {};
  for (const [categoryId, category] of Object.entries(data.itemStates)) {
    // Migrate to new structure with timestamps
    newItemStates[categoryId] = migrateCategory(category);
  }
  return { version: "3.0.0", itemStates: newItemStates };
}
```

---

## Storage Constraints

### Size Limits

**LocalStorage Quota**:

- Browser limit: ~5-10MB per origin (varies by browser)
- Current usage estimate: <10KB for typical checklist data
- Safety margin: 50KB maximum (per Technical Context in plan.md)

**Per-checklist estimate**:

- 10 checklists × 20 items each = 200 items
- Each item: ~50 bytes (category ID + checklist ID + item ID + status)
- Total: ~10KB + JSON overhead

**Mitigation**:

- No binary data stored
- Efficient nested structure (missing keys = unchecked)
- Only completed/overridden items need storage
- Reset operations reduce storage footprint

### Performance Constraints

**Read Performance**:

- Target: <50ms for `loadFromStorage()` (per Technical Context)
- Typical: <5ms for 10KB JSON parse
- Bottleneck: None expected for current data size

**Write Performance**:

- Target: <100ms for write + state update (per Technical Context)
- Typical: <10ms for 10KB stringify + localStorage.setItem
- Bottleneck: Multiple sequential writes (mitigated by batch operations)

**Hydration Performance**:

- Initial page load must match server render (empty state)
- Client hydration deferred to `useEffect` + `queueMicrotask`
- First meaningful paint not blocked by storage load

---

## Error Handling

### Storage Failures

**Possible failure modes**:

1. **Quota exceeded**: User storage full (unlikely with 10KB data)
2. **Permission denied**: Private browsing mode or browser policy
3. **Serialization error**: Malformed data (code bug)
4. **Missing localStorage**: Server-side rendering context

**Error handling pattern**:

```typescript
export function saveToStorage(data: Partial<StoredData>): boolean {
  if (typeof window === "undefined") {
    return false; // SSR context
  }

  try {
    const newData = {
      /* ... */
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    return true;
  } catch (error) {
    console.error("Failed to save to storage:", error);
    return false; // Hook decides how to handle failure
  }
}
```

**Hook response to failures**:

- Write failure: Keep current React state, user sees warning
- Read failure: Use empty state `{}`, treat as fresh install
- Migration failure: Reset to empty state with console warning

### Data Corruption

**Detection**:

- Version mismatch → trigger migration or reset
- Invalid JSON → caught by JSON.parse, return null
- Invalid status enum → treat as `"unchecked"` with warning

**Recovery**:

- All functions return safe defaults (`null`, `false`, `{}`)
- React state serves as temporary cache if storage fails
- User can manually reset via RESETS menu

---

## Summary

The storage data model is designed for:

- **Simplicity**: Three-level nested map with enum values
- **Efficiency**: Only completed items stored, missing keys default to unchecked
- **Safety**: Version-based migration, error handling returns safe defaults
- **Testability**: Pure data structures with predictable transformations
- **Forward compatibility**: Unknown keys ignored, migrations preserve data

This model supports the feature's goal of separating storage concerns from business logic while maintaining 100% functional parity with the current implementation.
