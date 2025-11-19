# Refactoring Contract: setTimeout to queueMicrotask

**Feature**: 006-eliminate-magic-values  
**Contract Version**: 1.0.0

## Overview

This contract documents the replacement of `setTimeout(..., 0)` with `queueMicrotask()` for consistency with existing codebase patterns.

## Motivation

### Current State (Before)

`app/page.tsx` uses `setTimeout(..., 0)` to defer active item index updates:

```typescript
// 2 occurrences in page.tsx
setTimeout(() => {
  const firstUncheckedIndex = currentItems.findIndex(...);
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
}, 0);
```

### Problem

- **Inconsistency**: `useChecklist.ts` already uses `queueMicrotask()` for similar deferred state updates
- **Semantic mismatch**: `setTimeout(..., 0)` schedules a macrotask, not a microtask
- **Timing unpredictability**: Macrotasks execute after rendering, microtasks execute before next render

### Target State (After)

```typescript
queueMicrotask(() => {
  const firstUncheckedIndex = currentItems.findIndex(...);
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
});
```

---

## Technical Specification

### Function Signature Comparison

```typescript
// setTimeout (macrotask)
setTimeout(callback: () => void, delay?: number): NodeJS.Timeout

// queueMicrotask (microtask)
queueMicrotask(callback: () => void): void
```

### Key Differences

| Aspect               | setTimeout(..., 0)          | queueMicrotask()                      |
| -------------------- | --------------------------- | ------------------------------------- |
| **Task Type**        | Macrotask                   | Microtask                             |
| **Execution Timing** | After render cycle          | Before next microtask checkpoint      |
| **Guarantee**        | "Eventually runs"           | Runs before next render               |
| **Return Value**     | Timeout ID (cleanup needed) | void (no cleanup)                     |
| **Browser Support**  | Universal                   | Chrome 71+, Firefox 69+, Safari 12.1+ |

### Execution Order Example

```typescript
console.log("1. Synchronous");

queueMicrotask(() => console.log("2. Microtask"));

setTimeout(() => console.log("4. Macrotask"), 0);

console.log("3. Synchronous");

// Output:
// 1. Synchronous
// 3. Synchronous
// 2. Microtask (runs before setTimeout!)
// 4. Macrotask
```

---

## Migration Pattern

### Location 1: handleItemToggle (page.tsx)

**Before**:

```typescript
const handleItemToggle = (itemId: string) => {
  // ... toggle logic ...

  setTimeout(() => {
    const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
      if (idx === itemIndex) {
        return newStatus === "unchecked";
      }
      return item.status === "unchecked";
    });
    setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
  }, 0);
};
```

**After**:

```typescript
const handleItemToggle = (itemId: string) => {
  // ... toggle logic ...

  queueMicrotask(() => {
    const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
      if (idx === itemIndex) {
        return newStatus === "unchecked";
      }
      return item.status === "unchecked";
    });
    setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
  });
};
```

---

### Location 2: handleItemOverride (page.tsx)

**Before**:

```typescript
const handleItemOverride = (itemId: string) => {
  // ... override logic ...

  setTimeout(() => {
    const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
      if (idx === itemIndex) {
        return newStatus === "unchecked";
      }
      return item.status === "unchecked";
    });
    setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
  }, 0);
};
```

**After**:

```typescript
const handleItemOverride = (itemId: string) => {
  // ... override logic ...

  queueMicrotask(() => {
    const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
      if (idx === itemIndex) {
        return newStatus === "unchecked";
      }
      return item.status === "unchecked";
    });
    setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
  });
};
```

---

## Behavioral Contract

### Guarantees (What MUST NOT Change)

1. **Active item advance timing**: Still defers until after current render cycle
2. **User interaction responsiveness**: No perceptible delay changes
3. **Visual output**: Border highlight still updates correctly
4. **State consistency**: `activeItemIndex` still reflects first unchecked item

### Improvements (What DOES Change)

1. **Consistency**: Aligns with `useChecklist.ts` pattern
2. **Predictability**: Microtasks execute in deterministic order
3. **Hydration safety**: Better compatibility with React 19 concurrent rendering

---

## Constitution Alignment

### Hydration Safety (Principle II)

**Quote from constitution**:

> ```typescript
> useEffect(() => {
>   const stored = loadFromStorage();
>   if (stored?.itemStates) {
>     queueMicrotask(() => setItemStates(stored.itemStates)); // Defer hydration
>   }
> }, []);
> ```

**Analysis**: This migration brings `page.tsx` into alignment with the existing hydration-safe pattern established in `useChecklist.ts`.

### Static-First Architecture (Principle I)

**Impact**: None. Both `setTimeout` and `queueMicrotask` are client-side browser APIs. Static export compatibility unchanged.

---

## Testing Contract

### Visual Regression Tests

- [ ] Active item border (magenta) still highlights first unchecked item
- [ ] Border moves to next unchecked item after checkbox toggle
- [ ] Override button interaction updates active item correctly

### Functional Tests

- [ ] Checking item advances active item to next unchecked
- [ ] Overriding item advances active item to next unchecked
- [ ] No console errors or warnings during interactions
- [ ] Build succeeds (`npm run build`)

### Edge Cases

| Scenario                 | Expected Behavior                   |
| ------------------------ | ----------------------------------- |
| All items checked        | Active index becomes -1 (no border) |
| Toggle last item         | Active index recalculates correctly |
| Rapid successive toggles | Each microtask executes in order    |

---

## Rollback Plan

If unexpected issues arise, revert to `setTimeout(..., 0)`:

```typescript
// Fallback pattern (not recommended)
setTimeout(() => {
  const firstUncheckedIndex = currentItems.findIndex(...);
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
}, 0);
```

**Rollback Risk**: Low. Behavior difference is minimal for this use case.

---

## Browser Compatibility

### Target Browsers

- **Chrome**: 71+ (queueMicrotask added in Chrome 71)
- **Firefox**: 69+ (queueMicrotask added in Firefox 69)
- **Safari**: 12.1+ (queueMicrotask added in Safari 12.1)
- **Edge**: 79+ (Chromium-based Edge)

### Fallback (Not Needed)

No polyfill required - GitHub Pages deployment targets modern browsers. Next.js static export assumes ES2017+ environment.

---

## References

- [MDN: queueMicrotask](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)
- [Jake Archibald: Tasks, microtasks, queues and schedules](https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/)
- [React Docs: queueMicrotask for state updates](https://react.dev/reference/react/experimental_queueMicrotask)
- Constitution: `.specify/memory/constitution.md` (Hydration Safety principle)

---

**Contract Status**: Draft  
**Last Updated**: 2025-11-20  
**Impact**: Low (timing behavior functionally equivalent)  
**Risk**: Low (microtask execution is more predictable than macrotask)
