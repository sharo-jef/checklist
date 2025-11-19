# Type Contracts: ChecklistItem Interface Cleanup

**Feature**: Remove Unused Type Fields  
**Date**: 2025-11-20  
**Version**: 2.0.0 → 2.0.0 (no version bump needed)

## Contract Changes

This document specifies the TypeScript interface changes for removing the obsolete `completed` boolean field from the `ChecklistItem` type.

## ChecklistItem Interface

### Before (Current)

```typescript
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
  completed: boolean;

  /** 必須項目フラグ */
  required?: boolean;

  /** 補足メモ */
  notes?: string;
}
```

### After (Target)

```typescript
/**
 * チェックリスト項目
 * Note: 完了状態は itemStates マッピングで管理され、この型には含まれません
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
}
```

### Change Summary

| Change                      | Type          | Breaking | Rationale                       |
| --------------------------- | ------------- | -------- | ------------------------------- |
| Remove `completed: boolean` | Field removal | No       | Field unused in runtime code    |
| Add explanatory JSDoc       | Documentation | No       | Clarifies status tracking model |

## Related Type Contracts

### ChecklistItemStatus (Unchanged)

The actual completion state is tracked using this enum type:

```typescript
/**
 * チェックリスト項目のステータス
 */
export type ChecklistItemStatus =
  | "unchecked"
  | "checked"
  | "overridden"
  | "checked-overridden";
```

**No changes to this type** - it remains the source of truth for item completion state.

### Progress Interface (Unchanged)

```typescript
/**
 * 進捗情報
 */
export interface Progress {
  /** 完了数 */
  completed: number; // ← Different usage: COUNT of completed items
  /** 総数 */
  total: number;
  /** 完了率（0-100） */
  percentage: number;
}
```

**Important**: The `completed` field here is unrelated to `ChecklistItem.completed`. This field represents the count of completed items (a number), not the completion state of individual items (which was a boolean).

**No changes to this interface**.

### StoredData Interface (Unchanged)

```typescript
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

**No changes to this interface** - the `completed` field was never part of the storage schema.

## Data Initialization Changes

### Before (Current)

```typescript
// src/data/checklists.ts
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
            completed: false, // ← To be removed
            required: true,
          },
          // ... 50+ more items with completed: false
        ],
      },
    ],
  },
];
```

### After (Target)

```typescript
// src/data/checklists.ts
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
            // completed: false removed
          },
          // ... all items cleaned up
        ],
      },
    ],
  },
];
```

## API Surface Changes

### Public Exports (from src/types/checklist.ts)

**Unchanged Exports**:

- ✅ `MenuType` enum
- ✅ `ChecklistItemStatus` type
- ✅ `Checklist` interface
- ✅ `ChecklistCategory` interface
- ✅ `AppState` interface
- ✅ `Progress` interface
- ✅ `StoredData` interface

**Changed Exports**:

- ⚠️ `ChecklistItem` interface - `completed` field removed

### Import Impact

**Code that imports `ChecklistItem`**:

```typescript
import { ChecklistItem } from "@/types/checklist";

// BEFORE: This was valid
const item: ChecklistItem = {
  id: "test",
  item: "Test",
  value: "OK",
  completed: false, // Required by old type
  required: true,
};

// AFTER: This is now an error
const item: ChecklistItem = {
  id: "test",
  item: "Test",
  value: "OK",
  completed: false, // ❌ TypeScript error: Object literal may only specify known properties
  required: true,
};

// AFTER: Correct usage
const item: ChecklistItem = {
  id: "test",
  item: "Test",
  value: "OK",
  required: true, // ✅ completed field not needed
};
```

**Verification**: Grep search confirms no code creates `ChecklistItem` objects outside of `checklists.ts`.

## Type Compatibility

### Structural Typing Implications

TypeScript uses structural typing, so:

**Before Change**:

```typescript
// Type with extra field is assignable to ChecklistItem
const itemWithExtra = {
  id: "1",
  item: "Test",
  value: "OK",
  completed: false,
  required: true,
  extraField: "extra", // Extra fields allowed
};

const item: ChecklistItem = itemWithExtra; // ✅ Valid
```

**After Change**:

```typescript
// Same behavior - extra fields still allowed in assignments
const itemWithCompleted = {
  id: "1",
  item: "Test",
  value: "OK",
  completed: false, // Extra field
  required: true,
};

const item: ChecklistItem = itemWithCompleted; // ✅ Still valid (structural typing)

// BUT: Object literal assignments are stricter
const item2: ChecklistItem = {
  id: "1",
  item: "Test",
  value: "OK",
  completed: false, // ❌ Error in object literals
  required: true,
};
```

**Impact**: Existing code that assigns objects with extra `completed` field remains valid, but new object literals cannot include it.

## Breaking Change Analysis

### Is This a Breaking Change?

**Answer**: No, for this codebase.

**Reasons**:

1. **No runtime code accesses the field**
   - Verified via grep: `\.completed\b` returns 0 matches
   - All completion tracking uses `itemStates` mapping

2. **TypeScript structural typing allows extra properties**
   - Existing objects with `completed` field can still be assigned
   - Only object literals (in `checklists.ts`) are affected

3. **No external consumers**
   - This is an internal Next.js app, not a published library
   - All code is in this repository

4. **Storage schema unaffected**
   - `StoredData` never included `completed` field
   - LocalStorage data format unchanged

### If This Were a Published Library

**Would be**: ✅ Breaking change (SemVer MAJOR bump required)

**Reason**: Removing a public interface field is a breaking change for external consumers who might depend on it, even if unused internally.

**Mitigation for libraries**:

1. Deprecation period (mark field as `@deprecated`)
2. Make field optional (`completed?: boolean`)
3. Major version bump when finally removed
4. Migration guide in CHANGELOG

**Not applicable here**: This is an internal application.

## Verification Contract

### Pre-Change Verification

- [x] TypeScript compilation succeeds (`npm run build`)
- [x] No grep matches for `\.completed\b` (property access pattern)
- [x] IDE "Find References" shows only type definition and data initialization
- [x] No runtime tests reference the field (no automated tests)

### Post-Change Verification

- [ ] TypeScript compilation succeeds with no errors
- [ ] ESLint passes (`npm run lint`)
- [ ] Data definitions in `checklists.ts` compile without `completed` field
- [ ] Application runtime behavior unchanged (manual testing)
- [ ] LocalStorage persistence works correctly
- [ ] All checklist operations function normally

### Acceptance Criteria

**Code Compilation**:

```bash
npm run build  # Must exit 0 with no errors
```

**Type Safety**:

```typescript
// This should cause a TypeScript error:
const item: ChecklistItem = {
  id: "test",
  item: "Test",
  value: "OK",
  completed: false, // ❌ Error expected
  required: true,
};
```

**Runtime Behavior**:

- Checklist items display correctly
- Checking/unchecking items updates state
- Override functionality works (ITEM OVRD, CHKL OVRD)
- Progress calculation accurate
- State persists across page reloads
- Reset functionality works

## Migration Guide (for Future Type Changes)

### For Developers Adding New Fields

**Do**:

- Add field to `ChecklistItem` interface with JSDoc
- Add to all item initializations in `checklists.ts`
- Update `StoredData` if field needs persistence
- Add migration logic in `storage.ts` if changing schema version

**Don't**:

- Add fields that duplicate information tracked elsewhere
- Create boolean fields when enums are more appropriate
- Add required fields without considering existing data

### For Developers Removing Fields

**Checklist**:

1. ✅ Verify zero usage with grep search
2. ✅ Check TypeScript compiler after removal
3. ✅ Review storage schema for persistence impact
4. ✅ Test runtime behavior thoroughly
5. ✅ Update documentation and comments
6. ✅ Consider migration if field was persisted

## Rollback Plan

### If Issues Discovered

**Rollback Command**:

```bash
git revert <commit-hash>
```

**Files to Restore**:

- `src/types/checklist.ts` - Re-add `completed: boolean` field
- `src/data/checklists.ts` - Re-add `completed: false` to all items

**Verification After Rollback**:

```bash
npm run build  # Should succeed
npm run lint   # Should pass
```

**Likelihood**: Very low - extensive verification confirms safe removal

## References

- Type Definitions: `src/types/checklist.ts`
- Data Definitions: `src/data/checklists.ts`
- Research Document: `specs/007-cleanup-types/research.md`
- Data Model: `specs/007-cleanup-types/data-model.md`
- TypeScript Handbook: [Interfaces](https://www.typescriptlang.org/docs/handbook/2/objects.html)

## Contract Approval

**Status**: ✅ Approved for implementation  
**Reviewed by**: Automated verification + constitution compliance check  
**Risk Level**: Low  
**Implementation Ready**: Yes
