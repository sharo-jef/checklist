# Data Model: Remove Development Logging from Production Code

**Feature**: 008-remove-console-logs  
**Phase**: 1 (Design & Contracts)  
**Date**: 2025-11-20

## Overview

This feature does not introduce new data entities or modify existing data structures. It is a code cleanup task that removes development logging statements from the codebase without affecting runtime behavior or data models.

## Affected Components

### Console Logging Categories

#### Development Logging (TO REMOVE)

- **Type**: `console.log`
- **Purpose**: Development debugging and informational messages
- **Visibility**: Visible to users in browser console (undesirable)
- **Examples**:
  - Migration progress messages
  - Debug trace statements

#### Error Logging (TO PRESERVE)

- **Type**: `console.error`
- **Purpose**: Critical runtime failures
- **Visibility**: Visible to users in browser console (acceptable - indicates real problems)
- **Examples**:
  - Storage operation failures
  - Invalid state transitions (should never happen)
  - Data corruption errors

#### Warning Logging (TO PRESERVE)

- **Type**: `console.warn`
- **Purpose**: Recoverable issues requiring attention
- **Visibility**: Visible to users in browser console (acceptable - user should know)
- **Examples**:
  - Storage version mismatches
  - Data reset notifications

## Code Locations

### Files with Console Statements

#### src/utils/storage.ts

**Lines to modify**:

- Line 24: `console.log("Migrating storage from v1.0.0 to v2.0.0");` → **REMOVE**

**Lines to preserve**:

- Line 72: `console.warn("Storage version mismatch. Resetting data.");` → **KEEP**
- Line 78: `console.error("Failed to load from storage:", error);` → **KEEP**
- Line 102: `console.error("Failed to save to storage:", error);` → **KEEP**
- Line 119: `console.error("Failed to clear storage:", error);` → **KEEP**

#### src/utils/transitions.ts

**Lines to modify**:

- Line 80: `console.error(error);` → **REMOVE** (redundant - error already thrown in dev mode)

**Rationale**: The transition function already throws an error in development mode (lines 75-77), making the console.error on line 80 redundant. In production, gracefully returning currentStatus (line 81) is sufficient - users don't need to see internal state machine errors.

#### src/hooks/useLocalStorage.ts

**Lines to modify**:

- Line 23: `console.error("Error loading from localStorage:", error);` → **REMOVE**
- Line 37: `console.error("Error saving to localStorage:", error);` → **REMOVE**

**Rationale**: The underlying storage functions (`loadFromStorage`, `saveToStorage`) already have error logging. Double-logging the same error adds noise without value.

## State Transitions

No state transitions affected. This is a purely cosmetic/maintenance change.

## Validation Rules

### Pre-removal validation

- ✅ Verify no essential error information is lost
- ✅ Confirm preserved console.error/warn statements cover all critical paths
- ✅ Check that migration logic functions correctly without logging

### Post-removal validation

- ✅ Production console should show zero development messages
- ✅ Error handling should still function (try-catch blocks intact)
- ✅ Storage operations should complete silently on success
- ✅ Legitimate errors should still be logged (console.error/warn preserved)

## Relationships

### Between Logging and Error Handling

```
Storage Operation
    ├─ Try Block
    │   ├─ localStorage API call
    │   └─ return success
    └─ Catch Block
        ├─ console.error (PRESERVED)  ← Critical for production debugging
        └─ return failure
```

### Between Logging Layers

```
High-level hook (useLocalStorage)
    ├─ console.error (REMOVE - redundant)
    └─ calls storage utility
            ├─ console.error (PRESERVE - source of truth)
            └─ actual localStorage operation
```

**Design principle**: Keep logging at the lowest level (storage utilities), remove redundant logging at higher levels (hooks).

## No Schema Changes

- No LocalStorage schema changes
- No TypeScript type changes
- No API contract changes
- Storage version remains 2.0.0

## Migration Path

Not applicable - this is a code cleanup task, not a data migration.

## Performance Impact

**Before**:

- Migration console.log allocates string and calls browser API on every v1.0.0 migration
- Hook-level console.error creates redundant log entries

**After**:

- Zero console.log overhead
- Single error log per failure (no duplication)
- Minimal but measurable performance improvement

## Testing Implications

### Manual Test Scenarios

1. **Clean console on load**:
   - Action: Load production build
   - Expected: No development messages in console
2. **Migration still works**:
   - Action: Load app with v1.0.0 LocalStorage data
   - Expected: Data migrates silently to v2.0.0, no errors, no console.log
3. **Error logging preserved**:
   - Action: Trigger storage failure (fill LocalStorage quota)
   - Expected: console.error shows "Failed to save to storage"
4. **Warning logging preserved**:
   - Action: Manually set invalid storage version in LocalStorage
   - Expected: console.warn shows "Storage version mismatch. Resetting data."

### No Automated Tests Required

Manual testing sufficient because:

- No logic changes, only logging removal
- Behavior preservation verified through manual scenarios
- No new edge cases introduced

## Summary

This data model documents the **absence of data changes**. The feature removes development logging without affecting:

- Data structures
- State management
- Error handling logic
- User-facing behavior

All changes are cosmetic (code cleanup) with minor performance benefits.
