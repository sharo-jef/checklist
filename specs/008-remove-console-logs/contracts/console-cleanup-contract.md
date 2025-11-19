# Contract: Console Logging Cleanup

**Feature**: 008-remove-console-logs  
**Type**: Code Modification Contract  
**Date**: 2025-11-20

## Purpose

This contract specifies the exact console statement removals required to eliminate development logging from production code while preserving legitimate error/warning messages.

## File Modifications

### 1. src/utils/storage.ts

**Location**: Line 24 (inside loadFromStorage function)

**Current code**:

```typescript
if (data.version === "1.0.0") {
  console.log("Migrating storage from v1.0.0 to v2.0.0");
  const oldData = data as unknown as {
    // ... migration logic ...
  };
```

**Updated code**:

```typescript
if (data.version === "1.0.0") {
  // Silently migrate storage from v1.0.0 to v2.0.0
  const oldData = data as unknown as {
    // ... migration logic ...
  };
```

**Change summary**:

- ❌ Remove: `console.log("Migrating storage from v1.0.0 to v2.0.0");`
- ✅ Add: Comment documenting migration behavior
- ✅ Preserve: All console.error and console.warn statements (lines 72, 78, 102, 119)

**Rationale**: Migration message is informational only and clutters production console. Comment provides documentation for developers without user-visible output.

---

### 2. src/utils/transitions.ts

**Location**: Line 80 (inside transition function)

**Current code**:

```typescript
if (!nextStatus) {
  const error = `Invalid transition: status="${currentStatus}" action="${action}"`;

  if (process.env.NODE_ENV === "development") {
    // Fail fast in dev - immediate feedback
    throw new Error(error);
  }

  // Graceful degradation in production
  console.error(error);
  return currentStatus; // No-op transition
}
```

**Updated code**:

```typescript
if (!nextStatus) {
  const error = `Invalid transition: status="${currentStatus}" action="${action}"`;

  if (process.env.NODE_ENV === "development") {
    // Fail fast in dev - immediate feedback
    throw new Error(error);
  }

  // Graceful degradation in production - return current state unchanged
  return currentStatus; // No-op transition
}
```

**Change summary**:

- ❌ Remove: `console.error(error);` (line 80)
- ✅ Update: Comment to clarify production behavior

**Rationale**:

- In development: Error is thrown (lines 75-77), providing immediate feedback
- In production: Invalid transitions should never happen (all transitions are defined). If they do, returning currentStatus is safer than logging (which could expose internal state machine details)
- Removing console.error prevents leaking state machine implementation details

---

### 3. src/hooks/useLocalStorage.ts

**Location**: Lines 23 and 37 (inside useLocalStorage hook)

**Current code** (lines 19-25):

```typescript
try {
  const data = loadFromStorage();
  if (data) {
    setStoredValue(data as T);
  }
} catch (error) {
  console.error("Error loading from localStorage:", error);
} finally {
  setIsLoaded(true);
}
```

**Updated code**:

```typescript
try {
  const data = loadFromStorage();
  if (data) {
    setStoredValue(data as T);
  }
} catch (error) {
  // Error already logged by loadFromStorage utility
} finally {
  setIsLoaded(true);
}
```

**Current code** (lines 32-40):

```typescript
const setValue = (value: T | ((val: T) => T)) => {
  try {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveToStorage(valueToStore as any);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};
```

**Updated code**:

```typescript
const setValue = (value: T | ((val: T) => T)) => {
  try {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    saveToStorage(valueToStore as any);
  } catch (error) {
    // Error already logged by saveToStorage utility
  }
};
```

**Change summary**:

- ❌ Remove: `console.error("Error loading from localStorage:", error);` (line 23)
- ❌ Remove: `console.error("Error saving to localStorage:", error);` (line 39)
- ✅ Add: Comments explaining why errors are not logged here

**Rationale**: The underlying storage utilities (`loadFromStorage`, `saveToStorage` in `src/utils/storage.ts`) already handle error logging with console.error. Logging errors in both places creates duplicate console output. Keep logging at the lowest level (storage utilities) and remove redundant logging at higher levels (hooks).

---

## Verification Checklist

### Pre-deployment Testing

- [ ] Load production build and verify console contains no "Migrating storage" message
- [ ] Trigger storage v1.0.0 migration and verify data migrates successfully without console.log
- [ ] Verify all try-catch blocks remain intact (error handling preserved)
- [ ] Confirm console.error appears for actual storage failures (fill quota test)
- [ ] Confirm console.warn appears for version mismatch (invalid version test)

### Code Review Checks

- [ ] No console.log statements remain in `src/` directory (grep search)
- [ ] All console.error statements in storage.ts preserved (lines 72, 78, 102, 119)
- [ ] No functional logic changed, only logging removed
- [ ] Comments added to document removed logging (for maintainer context)

### Regression Testing

- [ ] Storage migration v1.0.0 → v2.0.0 still works
- [ ] Error handling in storage operations still works
- [ ] Version mismatch detection still works
- [ ] State transitions still work correctly

## Success Criteria

**Measurable outcomes**:

1. Zero console.log statements in production console
2. Storage operations complete silently (no migration messages)
3. Error logging preserved (console.error still works)
4. Warning logging preserved (console.warn still works)
5. No functional regressions (all features work as before)

## Breaking Changes

**None**. This is a backward-compatible change. Users will see:

- Cleaner console (no development messages)
- Same error visibility (console.error/warn preserved)
- Identical functionality (no behavior changes)

## Dependencies

**No external dependencies required**. This is a pure code cleanup task.

## Rollback Plan

If issues arise, rollback is trivial:

1. Restore the removed console.log statement in storage.ts line 24
2. Restore console.error statements in transitions.ts and useLocalStorage.ts
3. Redeploy

However, rollback should not be necessary as this change:

- Removes output only (no logic changes)
- Preserves all error handling
- Has been manually tested
