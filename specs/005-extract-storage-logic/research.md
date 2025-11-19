# Research: Storage Logic Extraction

**Feature**: Extract LocalStorage Operations to Storage Utilities  
**Date**: 2025-11-20  
**Branch**: `005-extract-storage-logic`

## Research Questions & Findings

### Q1: How should storage utilities handle errors?

**Decision**: Return boolean success/failure for write operations, return null for failed reads

**Rationale**:

- Existing `storage.ts` already follows this pattern (e.g., `saveToStorage(): boolean`, `loadFromStorage(): StoredData | null`)
- Boolean returns are sufficient for LocalStorage operations which have limited failure modes (quota exceeded, permissions denied, serialization errors)
- Avoids introducing exception-based error handling which would require try-catch blocks throughout the hook
- Maintains consistency with current codebase patterns
- For read operations, `null` return allows hooks to use nullish coalescing (`??`) for default values

**Alternatives considered**:

- **Throwing exceptions**: Rejected because it changes the calling pattern significantly and requires error boundaries
- **Result<T, E> pattern**: Rejected as over-engineering for simple LocalStorage operations
- **Error callbacks**: Rejected because it complicates the API for minimal benefit

**Implementation pattern**:

```typescript
// Write operations return boolean
function resetChecklist(categoryId: string, checklistId: string): boolean {
  try {
    // perform operation
    return saveToStorage(newData);
  } catch (error) {
    console.error("Failed to reset checklist:", error);
    return false;
  }
}

// Read operations return T | null
function loadFromStorage(): StoredData | null {
  try {
    // perform operation
    return data;
  } catch (error) {
    console.error("Failed to load:", error);
    return null;
  }
}
```

---

### Q2: What storage operations need to be extracted from useChecklist?

**Decision**: Extract 5 new utility functions beyond existing ones

**Current state analysis** (from `useChecklist.ts`):

1. **Direct localStorage.removeItem()** in `resetAll()` - Line ~143
2. **Direct localStorage.setItem() + loadFromStorage()** in `resetChecklist()` - Lines ~151-159
3. **Direct localStorage.setItem() + loadFromStorage()** in `resetNormal()` - Lines ~210-217
4. **Direct localStorage.setItem() + loadFromStorage()** in `resetNonNormal()` - Lines ~227-234

**Existing utilities** (from `storage.ts`):

- ✅ `loadFromStorage()` - Already used in useEffect
- ✅ `saveToStorage()` - Could be used but isn't
- ✅ `clearStorage()` - Exists but not used in useChecklist
- ✅ `getItemStatus()` - Exists but not used
- ✅ `setItemStatus()` - Already used in updateItemStatus

**New utilities needed**:

1. `resetChecklistInStorage(categoryId, checklistId): boolean` - Replace logic in resetChecklist
2. `resetCategoriesInStorage(categoryIds): boolean` - Replace logic in resetNormal/resetNonNormal
3. `resetAllStorage(): boolean` - Wrapper for clearStorage() with consistent naming

**Rationale**:

- Each reset operation currently duplicates the pattern: modify state → load from storage → update itemStates → save to storage
- Extracting these operations eliminates code duplication
- Makes reset operations testable without React
- Maintains single source of truth for storage format

**Alternatives considered**:

- **Keep reset logic in hook**: Rejected because it violates the separation of concerns principle
- **Create generic updateStorage() function**: Rejected because specific functions are more type-safe and easier to test

---

### Q3: How should storage utilities interact with React state?

**Decision**: Storage utilities are pure functions that return data; hooks remain responsible for calling setState

**Rationale**:

- **Separation of concerns**: Storage utilities handle persistence, hooks handle React state management
- **Testability**: Pure functions can be tested without mocking React hooks
- **Flexibility**: Different components could use the same storage utilities with different state management approaches
- **Hydration safety**: Hook maintains control over when state updates occur (critical for SSR/client hydration matching)

**Architecture pattern**:

```typescript
// Storage utility (pure function)
export function resetChecklistInStorage(
  categoryId: string,
  checklistId: string
): boolean {
  const data = loadFromStorage();
  if (!data) return false;

  const newItemStates = { ...data.itemStates };
  newItemStates[categoryId] = {
    ...newItemStates[categoryId],
    [checklistId]: {},
  };

  return saveToStorage({ itemStates: newItemStates });
}

// Hook (React state management)
const resetChecklist = useCallback(
  (categoryId: string, checklistId: string) => {
    const success = resetChecklistInStorage(categoryId, checklistId);
    if (success) {
      const data = loadFromStorage();
      setItemStates(data?.itemStates || {});
    }
  },
  []
);
```

**Alternatives considered**:

- **Pass setState to utilities**: Rejected because it couples utilities to React and prevents testing
- **Return state updater functions**: Rejected as it leaks React-specific patterns into pure utilities
- **Utilities call setState directly**: Rejected because it violates separation of concerns and requires passing setState everywhere

---

### Q4: What is the best practice for batch storage operations?

**Decision**: Implement atomic batch operations that perform all updates in a single storage write

**Rationale**:

- LocalStorage writes are synchronous I/O operations that can be expensive
- Multiple sequential writes (read → modify → write → read → modify → write) are inefficient
- Batch operations ensure consistency - either all updates succeed or none do
- Reduces the number of storage events triggered in other tabs (if multi-tab support is added)

**Implementation approach**:

```typescript
export function resetCategoriesInStorage(categoryIds: string[]): boolean {
  const data = loadFromStorage();
  if (!data) return false;

  const newItemStates = { ...data.itemStates };

  // Batch delete - all modifications before single write
  categoryIds.forEach((categoryId) => {
    delete newItemStates[categoryId];
  });

  // Single atomic write
  return saveToStorage({ itemStates: newItemStates });
}
```

**Alternatives considered**:

- **Sequential operations**: Rejected due to performance and consistency issues
- **Transaction API**: Rejected because LocalStorage doesn't support transactions
- **Debounced writes**: Rejected because reset operations should be immediate

---

### Q5: How should type safety be maintained across the refactoring?

**Decision**: Use existing TypeScript types from `@/types/checklist` and add explicit function signatures for all new utilities

**Rationale**:

- Existing types (`StoredData`, `ChecklistItemStatus`) already define the storage schema
- TypeScript strict mode is enabled project-wide
- Explicit return types prevent accidental type widening
- Generic constraints aren't needed for this simple storage layer

**Type safety checklist**:

- ✅ All utility functions have explicit return type annotations
- ✅ All parameters use existing types from `@/types/checklist`
- ✅ No `any` types introduced
- ✅ Maintain strict null checks (use `| null` where appropriate)

**Example signatures**:

```typescript
export function resetChecklistInStorage(
  categoryId: string,
  checklistId: string
): boolean;

export function resetCategoriesInStorage(categoryIds: string[]): boolean;

export function getAllItemStates(): StoredData["itemStates"] | null;
```

**Alternatives considered**:

- **Runtime validation with zod**: Rejected as over-engineering for internal utilities
- **Generic storage layer**: Rejected because this is purpose-built for checklist storage
- **Interface segregation**: Rejected because the storage utility API is already minimal

---

### Q6: How should the refactoring maintain 100% functional parity?

**Decision**: Implement utilities first, then replace hook logic piece by piece, using manual testing to verify each step

**Rationale**:

- No automated test suite exists currently
- Manual testing workflow already established
- Incremental replacement reduces risk of introducing bugs
- Each replacement can be verified independently

**Testing strategy**:

1. **Before refactoring**: Document current behavior through manual testing
   - Test reset all, reset normal, reset non-normal
   - Test checklist override
   - Test item status updates
   - Verify LocalStorage contents before/after operations
2. **During refactoring**: Test after each utility addition
   - Add utility function
   - Replace hook logic
   - Verify identical behavior
3. **After refactoring**: Full regression test
   - All acceptance scenarios from spec.md
   - Edge cases (quota exceeded simulation if possible)

**Manual test cases**:

```
TC1: Reset All
- Given: Multiple checklists with checked items
- When: User clicks "RESETS" → "RESET ALL"
- Then: All items return to unchecked, localStorage cleared

TC2: Reset Normal Only
- Given: Both NORMAL and NON-NORMAL checklists have checked items
- When: User clicks "RESETS" → "RESET NORMAL"
- Then: Only NORMAL items cleared, NON-NORMAL preserved

TC3: Reset Single Checklist
- Given: Checklist has some checked items
- When: User completes checklist and it auto-resets
- Then: Only that checklist's items cleared

TC4: Override Checklist
- Given: Checklist partially completed
- When: User clicks "CHKL OVRD"
- Then: All unchecked items marked overridden (cyan)
```

**Alternatives considered**:

- **Big bang replacement**: Rejected due to high risk
- **Add automated tests first**: Rejected because it's out of scope for this feature
- **Feature flags**: Rejected as over-engineering for a single-developer project

---

## Technology Decisions

### Storage Abstraction Pattern: Utility Functions (Not Repository Pattern)

**Decision**: Use plain utility functions in `utils/storage.ts` rather than class-based repository pattern

**Rationale**:

- Aligns with existing codebase conventions (no classes used anywhere)
- Simpler for single storage backend (LocalStorage)
- Pure functions are easier to test
- No need for dependency injection or interface abstractions
- React hooks work naturally with function imports

**Code example**:

```typescript
// ✅ Chosen approach: Utility functions
import { resetChecklistInStorage } from '@/utils/storage';

const resetChecklist = useCallback((categoryId, checklistId) => {
  if (resetChecklistInStorage(categoryId, checklistId)) {
    // update React state
  }
}, []);

// ❌ Rejected: Repository pattern
class ChecklistStorageRepository implements IStorageRepository {
  resetChecklist(categoryId: string, checklistId: string): boolean { ... }
}
```

### Error Handling: Boolean Returns (Not Exceptions)

**Decision**: Documented in Q1 above - use boolean returns for write operations, null for failed reads

### State Synchronization: Load After Write Pattern

**Decision**: After successful storage writes, reload data and update React state

**Rationale**:

- Ensures React state matches storage (single source of truth)
- Handles migration logic automatically (if storage version changes)
- Prevents state/storage drift
- Simple to reason about

**Pattern**:

```typescript
const resetChecklist = useCallback((categoryId, checklistId) => {
  if (resetChecklistInStorage(categoryId, checklistId)) {
    const data = loadFromStorage();
    setItemStates(data?.itemStates || {});
  }
}, []);
```

**Alternatives considered**:

- **Optimistic updates**: Rejected because storage writes are fast and failures are rare
- **Separate state and storage**: Rejected because it creates consistency problems

---

## Dependencies

### No New Dependencies Required

**Decision**: Use only existing dependencies (React, TypeScript, Next.js)

**Rationale**:

- LocalStorage API is browser-native
- Type definitions already exist
- No external storage libraries needed
- Maintains minimal dependency footprint per constitution

**Rejected dependencies**:

- ❌ `localforage`: Over-engineered for simple LocalStorage use case
- ❌ `idb-keyval`: Not needed, project uses LocalStorage not IndexedDB
- ❌ `zustand`: Violates constitution's "no external state management" rule

---

## Summary

This research phase identified all necessary patterns for extracting storage logic:

1. **Error Handling**: Boolean returns for writes, null for failed reads
2. **New Utilities**: 3 reset functions to eliminate code duplication in hook
3. **State Management**: Pure storage functions + hook-based state updates
4. **Batch Operations**: Atomic multi-category resets in single write
5. **Type Safety**: Explicit signatures using existing types
6. **Testing**: Manual incremental testing during refactoring
7. **Architecture**: Utility functions (not classes/repositories)
8. **No new dependencies**: Use native APIs and existing tooling

All technical context questions from plan.md are now resolved. Ready to proceed to Phase 1 (design).
