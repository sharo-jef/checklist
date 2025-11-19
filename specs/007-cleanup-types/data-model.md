# Data Model: ChecklistItem Type Cleanup

**Feature**: Remove Unused Type Fields  
**Date**: 2025-11-20  
**Status**: Design Complete

## Overview

This document describes the data model changes for removing the obsolete `completed` boolean field from the `ChecklistItem` TypeScript interface. The field was part of the original design but was superseded by the status-based completion tracking system in v2.0.0.

## Current State (Before Changes)

### Type Definitions

```typescript
// src/types/checklist.ts

/**
 * チェックリスト項目のステータス
 */
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";

/**
 * チェックリスト項目
 */
export interface ChecklistItem {
  /** 一意識別子 */
  id: string;
  /** 項目名（左側） */
  item: string;
  /** ステータス/値（右側） */
  value: string;
  /** 完了状態（後方互換性のため残す） */
  completed: boolean; // ← OBSOLETE FIELD
  /** 必須項目フラグ */
  required?: boolean;
  /** 補足メモ */
  notes?: string;
}

/**
 * 進捗情報
 */
export interface Progress {
  /** 完了数 */
  completed: number; // ← DIFFERENT USAGE (count of completed items)
  /** 総数 */
  total: number;
  /** 完了率（0-100） */
  percentage: number;
}

/**
 * LocalStorage保存用データ
 */
export interface StoredData {
  /** データバージョン */
  version: string;
  /** 最終更新日時 */
  lastUpdated: number;
  /** チェックリスト状態（カテゴリID -> チェックリストID -> アイテムID -> status） */
  itemStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus; // ← Uses status enum, not boolean
      };
    };
  };
}
```

### Data Initialization

```typescript
// src/data/checklists.ts (sample - repeated for all 50+ items)

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
          {
            id: "pd-1",
            item: "Parking brake",
            value: "Set",
            completed: false, // ← Always initialized to false (never used)
            required: true,
          },
          {
            id: "pd-2",
            item: "Gears",
            value: "N",
            completed: false, // ← Always initialized to false (never used)
            required: true,
          },
          // ... 50+ more items, all with completed: false
        ],
      },
    ],
  },
  // ... more categories
];
```

### Runtime State Management

```typescript
// src/hooks/useChecklist.ts (relevant excerpt)

// Runtime state uses itemStates mapping, NOT item.completed
const [itemStates, setItemStates] = useState<{
  [categoryId: string]: {
    [checklistId: string]: {
      [itemId: string]: ChecklistItemStatus;
    };
  };
}>({});

// Get completion status from itemStates, not from item.completed
const getItemStatus = (itemId: string): ChecklistItemStatus => {
  return (
    itemStates[currentCategory]?.[currentChecklist]?.[itemId] ?? "unchecked"
  );
};

// Progress calculation uses itemStates, not item.completed
const getProgress = (): Progress => {
  const completed = checklist.items.filter((item) => {
    const status = getItemStatus(item.id); // ← Uses status from itemStates
    return status === "checked" || status === "checked-overridden";
  }).length;

  return {
    completed, // Count of completed items
    total,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};
```

### Problems with Current State

1. **Type Confusion**: Developers see `completed: boolean` in the interface and might assume it's used for completion tracking
2. **Dead Initialization**: All items in `checklists.ts` set `completed: false`, but this value is never read
3. **Misleading Documentation**: JSDoc comment says "後方互換性のため残す" (kept for backward compatibility), but there's no actual compatibility requirement since it was never persisted
4. **Inconsistent Model**: Type definition suggests boolean completion, but actual implementation uses 4-state status enum
5. **Maintenance Burden**: Extra field in 50+ item definitions adds noise and maintenance overhead

## Target State (After Changes)

### Type Definitions

```typescript
// src/types/checklist.ts

/**
 * チェックリスト項目のステータス
 */
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";

/**
 * チェックリスト項目
 */
export interface ChecklistItem {
  /** 一意識別子 */
  id: string;
  /** 項目名（左側） */
  item: string;
  /** ステータス/値（右側） */
  value: string;
  /** 必須項目フラグ */
  required?: boolean;
  /** 補足メモ */
  notes?: string;
  // completed field REMOVED - status tracked via itemStates mapping
}

/**
 * 進捗情報
 * Note: `completed` here refers to count of completed items, not ChecklistItem field
 */
export interface Progress {
  /** 完了数 */
  completed: number;
  /** 総数 */
  total: number;
  /** 完了率（0-100） */
  percentage: number;
}

/**
 * LocalStorage保存用データ
 */
export interface StoredData {
  /** データバージョン */
  version: string;
  /** 最終更新日時 */
  lastUpdated: number;
  /** チェックリスト状態（カテゴリID -> チェックリストID -> アイテムID -> status） */
  itemStates: {
    [categoryId: string]: {
      [checklistId: string]: {
        [itemId: string]: ChecklistItemStatus;
      };
    };
  };
}
```

### Data Initialization

```typescript
// src/data/checklists.ts (sample)

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
          {
            id: "pd-1",
            item: "Parking brake",
            value: "Set",
            required: true,
            // completed: false REMOVED
          },
          {
            id: "pd-2",
            item: "Gears",
            value: "N",
            required: true,
            // completed: false REMOVED
          },
          // ... all 50+ items cleaned up
        ],
      },
    ],
  },
  // ... more categories
];
```

### Runtime State Management (Unchanged)

```typescript
// src/hooks/useChecklist.ts - No changes needed

// Runtime state already uses itemStates mapping
const [itemStates, setItemStates] = useState<{
  [categoryId: string]: {
    [checklistId: string]: {
      [itemId: string]: ChecklistItemStatus;
    };
  };
}>({});

// All completion logic already uses itemStates, not item.completed
const getItemStatus = (itemId: string): ChecklistItemStatus => {
  return (
    itemStates[currentCategory]?.[currentChecklist]?.[itemId] ?? "unchecked"
  );
};
```

### Benefits of Target State

1. **Clear Type Contract**: Type definition accurately reflects runtime usage
2. **Reduced Noise**: Data definitions are 1 line shorter per item (50+ lines total reduction)
3. **Improved Comprehension**: Developers immediately understand status-based model
4. **Type Safety**: TypeScript prevents accidental use of non-existent field
5. **Consistency**: Type definition and implementation are aligned

## Data Flow Diagram

### Current State (With Obsolete Field)

```
┌─────────────────────────────────────────────────────────────┐
│ ChecklistItem Type Definition                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ id: string                                              │ │
│ │ item: string                                            │ │
│ │ value: string                                           │ │
│ │ completed: boolean  ← DEFINED BUT NEVER USED            │ │
│ │ required?: boolean                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Static Data Initialization (checklists.ts)                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ {                                                       │ │
│ │   id: "pd-1",                                           │ │
│ │   item: "Parking brake",                                │ │
│ │   value: "Set",                                         │ │
│ │   completed: false,  ← ALWAYS FALSE, NEVER READ         │ │
│ │   required: true                                        │ │
│ │ }                                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        ↓
        ╔═══════════════════════════════════════╗
        ║ Runtime State (useChecklist hook)    ║
        ║                                       ║
        ║  itemStates: {                        ║
        ║    [categoryId]: {                    ║
        ║      [checklistId]: {                 ║
        ║        [itemId]: ChecklistItemStatus  ║ ← ACTUAL STATE
        ║      }                                 ║
        ║    }                                   ║
        ║  }                                     ║
        ╚═══════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ LocalStorage Persistence (StoredData)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ {                                                       │ │
│ │   version: "2.0.0",                                     │ │
│ │   itemStates: {                                         │ │
│ │     [categoryId]: {                                     │ │
│ │       [checklistId]: {                                  │ │
│ │         [itemId]: ChecklistItemStatus                   │ │
│ │       }                                                 │ │
│ │     }                                                   │ │
│ │   }                                                     │ │
│ │ }                                                       │ │
│ │ ← Note: No "completed" field ever stored               │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Target State (After Cleanup)

```
┌─────────────────────────────────────────────────────────────┐
│ ChecklistItem Type Definition                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ id: string                                              │ │
│ │ item: string                                            │ │
│ │ value: string                                           │ │
│ │ required?: boolean                                      │ │
│ │ // completed field REMOVED                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ Static Data Initialization (checklists.ts)                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ {                                                       │ │
│ │   id: "pd-1",                                           │ │
│ │   item: "Parking brake",                                │ │
│ │   value: "Set",                                         │ │
│ │   required: true                                        │ │
│ │   // completed: false REMOVED                           │ │
│ │ }                                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                        ↓
        ╔═══════════════════════════════════════╗
        ║ Runtime State (useChecklist hook)    ║
        ║                                       ║
        ║  itemStates: {                        ║
        ║    [categoryId]: {                    ║
        ║      [checklistId]: {                 ║
        ║        [itemId]: ChecklistItemStatus  ║ ← ONLY SOURCE OF TRUTH
        ║      }                                 ║
        ║    }                                   ║
        ║  }                                     ║
        ╚═══════════════════════════════════════╝
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ LocalStorage Persistence (StoredData)                       │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ {                                                       │ │
│ │   version: "2.0.0",                                     │ │
│ │   itemStates: {                                         │ │
│ │     [categoryId]: {                                     │ │
│ │       [checklistId]: {                                  │ │
│ │         [itemId]: ChecklistItemStatus                   │ │
│ │       }                                                 │ │
│ │     }                                                   │ │
│ │   }                                                     │ │
│ │ }                                                       │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Entity Relationships

### ChecklistItem (After Cleanup)

**Entity**: ChecklistItem  
**Purpose**: Defines the template/definition of a single checklist item  
**Lifecycle**: Immutable - defined in code, never modified at runtime

| Field      | Type    | Required | Purpose                                   | Validation                      |
| ---------- | ------- | -------- | ----------------------------------------- | ------------------------------- |
| `id`       | string  | Yes      | Unique identifier for the item            | Must be unique within checklist |
| `item`     | string  | Yes      | Item name displayed on left side          | Non-empty string                |
| `value`    | string  | Yes      | Expected state/value displayed on right   | Non-empty string                |
| `required` | boolean | No       | Whether item must be checked (affects UI) | Defaults to false if omitted    |
| `notes`    | string  | No       | Additional notes or comments              | Optional supplementary info     |

**Relationships**:

- Belongs to one `Checklist` (many-to-one)
- Has zero or one status entry in `itemStates` runtime mapping (one-to-zero-or-one)

### ChecklistItemStatus (Unchanged)

**Entity**: ChecklistItemStatus  
**Purpose**: Tracks the runtime completion state of a checklist item  
**Lifecycle**: Mutable - changes as user interacts with checklists

| Value                | Meaning                               | UI Display Color | User Action                         |
| -------------------- | ------------------------------------- | ---------------- | ----------------------------------- |
| `unchecked`          | Item not yet completed                | White            | Initial state                       |
| `checked`            | Item completed normally               | Green            | User checked the item               |
| `overridden`         | Item skipped (emergency/non-standard) | Cyan             | User clicked ITEM OVRD or CHKL OVRD |
| `checked-overridden` | Item both checked AND overridden      | Cyan             | Both actions performed              |

**Storage**: Lives in `itemStates` mapping, persisted to LocalStorage as part of `StoredData`

## Migration Strategy

### Schema Version Impact

**Current Version**: 2.0.0  
**After Changes**: 2.0.0 (no version bump needed)

**Rationale**: The `completed` field was never part of the `StoredData` schema, so removing it from the type definition doesn't affect storage format.

### Data Migration

**Required**: ❌ No migration needed

**Verification**:

1. ✅ `StoredData` interface has no `completed` field
2. ✅ Migration logic in `storage.ts` doesn't reference `completed` field
3. ✅ LocalStorage key `checklist-state` never stored this field
4. ✅ Historical v1.0.0 → v2.0.0 migration used `checklistStates` boolean maps, not item-level `completed`

### Backward Compatibility

**Impact on Existing Users**: Zero

**Scenarios**:

- **User with v2.0.0 data**: No changes to storage schema, existing data loads normally
- **User with v1.0.0 data**: Existing migration logic in `storage.ts` continues to work (doesn't use `completed` field)
- **Fresh user**: Initializes with empty `itemStates` object, no issues

## Validation Rules

### Type-Level Validation

**Before Changes**:

```typescript
// TypeScript requires 'completed' in object literals
const item: ChecklistItem = {
  id: "test",
  item: "Test item",
  value: "OK",
  completed: false, // Required by type
  required: true,
};
```

**After Changes**:

```typescript
// TypeScript does NOT require 'completed'
const item: ChecklistItem = {
  id: "test",
  item: "Test item",
  value: "OK",
  required: true,
  // completed field removed from type, no longer allowed
};

// Extra properties are still allowed in TypeScript (structural typing)
const itemWithExtra: ChecklistItem = {
  id: "test",
  item: "Test item",
  value: "OK",
  completed: false, // TypeScript allows this (extra property)
  required: true,
};
// But TypeScript won't suggest 'completed' in autocomplete
```

### Runtime Validation

**No validation changes needed**:

- Runtime code already uses `itemStates` for completion tracking
- No code accesses `item.completed` property
- Data initialization values are load-time only, never validated at runtime

## State Transitions

### Item Status Transitions (Unchanged)

```
┌─────────────┐
│  unchecked  │ ← Initial state (default)
└──────┬──────┘
       │
       ├─── User clicks item ────────────────────┐
       │                                          │
       ↓                                          ↓
┌─────────────┐                          ┌──────────────────┐
│   checked   │                          │   overridden     │
└──────┬──────┘                          └────────┬─────────┘
       │                                          │
       └─── User clicks ITEM OVRD ───────────────┘
                                                  │
                                                  ↓
                                    ┌───────────────────────┐
                                    │  checked-overridden   │
                                    └───────────────────────┘
```

**Note**: This state machine is unaffected by removing the `completed` field. State is tracked in `itemStates`, not in the `ChecklistItem` definition.

## Documentation Updates

### JSDoc Comments to Update

**In `src/types/checklist.ts`**:

Remove or update this comment:

```typescript
// BEFORE
/** 完了状態（後方互換性のため残す） */
completed: boolean;

// AFTER (field removed entirely, no comment needed)
```

Add comment clarifying status model:

```typescript
/**
 * チェックリスト項目
 * Note: 完了状態は itemStates マッピングで管理され、この型には含まれません
 */
export interface ChecklistItem {
  // ...
}
```

### README Updates (if applicable)

If README.md or other documentation references the `completed` field, update to reflect status-based model.

## Summary of Changes

| File                        | Change Type            | Lines Changed | Impact                          |
| --------------------------- | ---------------------- | ------------- | ------------------------------- |
| `src/types/checklist.ts`    | Remove field           | -2 lines      | Type definition cleanup         |
| `src/data/checklists.ts`    | Remove initializations | -50+ lines    | Data definition cleanup         |
| `src/hooks/useChecklist.ts` | No changes             | 0             | Already uses itemStates         |
| `src/utils/storage.ts`      | No changes             | 0             | Never used completed field      |
| `src/components/*.tsx`      | No changes             | 0             | Components use status from hook |

**Total**: ~52 lines removed, 0 new lines added, 0 files with runtime logic changes

## Risk Assessment

| Risk                              | Likelihood | Impact | Mitigation                                       |
| --------------------------------- | ---------- | ------ | ------------------------------------------------ |
| Missed usage of `completed` field | Very Low   | Medium | Multi-layer verification (grep + compiler + IDE) |
| Breaking change for tests         | N/A        | N/A    | No automated tests currently                     |
| LocalStorage compatibility        | None       | None   | Field never persisted                            |
| Regression in completion tracking | Very Low   | High   | Manual testing of all checklist operations       |

**Overall Risk**: **Very Low**

- Extensive verification confirms zero usage
- Changes are delete-only (no new logic)
- Easy rollback via git revert
- No user data migration required
