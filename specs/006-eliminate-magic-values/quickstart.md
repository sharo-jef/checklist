# Quickstart: Replace Magic Values with Named Constants

**Feature**: 006-eliminate-magic-values  
**Date**: 2025-11-20  
**Estimated Time**: 30 minutes

## Prerequisites

- [x] Feature branch `006-eliminate-magic-values` checked out
- [x] Development server can start (`npm run dev`)
- [x] Familiarity with TypeScript const assertions
- [x] Understanding of React component imports

## Implementation Steps

### Step 1: Create Constants Module (5 min)

Create `src/constants/ui.ts` with two constants:

```typescript
/**
 * UI Constants Module
 *
 * Centralized repository for UI-related magic values.
 */

/**
 * Number of dot-space pairs in the checklist item separator line.
 *
 * This value creates visual overflow for the dotted line between item name
 * and expected value, mimicking aviation checklist aesthetics.
 */
export const DOTTED_SEPARATOR_REPEATS = 400 as const;

/**
 * Milliseconds to display reset confirmation before auto-exiting the menu.
 *
 * This delay provides visual feedback that the reset action completed
 * successfully before returning to the default view.
 */
export const RESET_MENU_EXIT_DELAY_MS = 1000 as const;
```

**Verification**:

```bash
# Should compile without errors
npm run lint
```

---

### Step 2: Update ChecklistItem Component (5 min)

**File**: `src/components/ChecklistItem.tsx`

**Change 1: Add Import**

```typescript
import { CheckIcon } from "./CheckIcon";
import { ChecklistItemStatus } from "@/types/checklist";
import { DOTTED_SEPARATOR_REPEATS } from "@/constants/ui"; // ADD THIS LINE
```

**Change 2: Replace Magic Value**

Find this line (around line 63):

```typescript
{
  ". ".repeat(400);
}
```

Replace with:

```typescript
{
  ". ".repeat(DOTTED_SEPARATOR_REPEATS);
}
```

**Verification**:

```bash
# Component should re-render without visual changes
npm run dev
# Navigate to http://localhost:3000/checklist
# Verify dotted separator line looks identical
```

---

### Step 3: Update ResetsMenu Component (5 min)

**File**: `src/components/ResetsMenu.tsx`

**Change 1: Add Import**

```typescript
import { useState, useEffect, useRef } from "react";
import { RESET_MENU_EXIT_DELAY_MS } from "@/constants/ui"; // ADD THIS LINE
```

**Change 2: Replace Magic Value**

Find this line (around line 38):

```typescript
timeoutRef.current = setTimeout(() => {
  setClickedButton(null);
  onExitMenu();
  timeoutRef.current = null;
}, 1000);
```

Replace with:

```typescript
timeoutRef.current = setTimeout(() => {
  setClickedButton(null);
  onExitMenu();
  timeoutRef.current = null;
}, RESET_MENU_EXIT_DELAY_MS);
```

**Verification**:

```bash
# Test reset menu timing
npm run dev
# 1. Open menu
# 2. Select "RESETS"
# 3. Click any reset button
# 4. Verify green confirmation appears for ~1 second before auto-exit
```

---

### Step 4: Refactor page.tsx to queueMicrotask (10 min)

**File**: `src/app/page.tsx`

**Change: Replace 2 Occurrences of setTimeout**

**Location 1: handleItemToggle (around line 227)**

Find:

```typescript
setTimeout(() => {
  const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
    if (idx === itemIndex) {
      return newStatus === "unchecked";
    }
    return item.status === "unchecked";
  });
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
}, 0);
```

Replace with:

```typescript
queueMicrotask(() => {
  const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
    if (idx === itemIndex) {
      return newStatus === "unchecked";
    }
    return item.status === "unchecked";
  });
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
});
```

**Location 2: handleItemOverride (around line 269)**

Find:

```typescript
setTimeout(() => {
  const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
    if (idx === itemIndex) {
      return newStatus === "unchecked";
    }
    return item.status === "unchecked";
  });
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
}, 0);
```

Replace with:

```typescript
queueMicrotask(() => {
  const firstUncheckedIndex = currentItems.findIndex((item, idx) => {
    if (idx === itemIndex) {
      return newStatus === "unchecked";
    }
    return item.status === "unchecked";
  });
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
});
```

**Verification**:

```bash
npm run dev
# Test active item advancement:
# 1. Open a checklist
# 2. Toggle first item checkbox
# 3. Verify magenta border moves to next unchecked item
# 4. Test "ITEM OVRD" button - border should also advance
```

---

### Step 5: Full Regression Testing (5 min)

Run comprehensive tests to ensure no regressions:

#### Type Safety

```bash
npm run lint
# Should pass with 0 errors
```

#### Build Verification

```bash
npm run build
# Should complete successfully
# Verify out/ directory contains static export
```

#### Manual Testing Checklist

- [ ] **Dotted separator**: Looks identical in all checklist items
- [ ] **Reset menu timing**: Still exits after ~1 second
- [ ] **Active item border**: Still highlights first unchecked item
- [ ] **Checkbox toggle**: Border advances correctly
- [ ] **Override button**: Border advances correctly
- [ ] **CHKL OVRD**: Overrides all items correctly
- [ ] **Navigation**: NORMAL ↔ NON-NORMAL menu switching works
- [ ] **No console errors**: Check browser DevTools console

---

## Verification Commands

### Quick Verification

```bash
# Type check
npm run lint

# Build check
npm run build
```

### Full Testing Flow

```bash
# Start dev server
npm run dev

# In browser (http://localhost:3000/checklist):
# 1. Open PRE-DRIVE checklist
# 2. Toggle items - verify border advances
# 3. Click "ITEM OVRD" - verify override styling (cyan)
# 4. Open menu → RESETS → RESET ALL
# 5. Verify green confirmation → auto-exit after 1s
# 6. Repeat for NON-NORMAL checklists
```

---

## Troubleshooting

### Issue: TypeScript Error "Cannot find module '@/constants/ui'"

**Solution**: Ensure `tsconfig.json` has path alias configured:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Then restart TypeScript server in VSCode: `Cmd+Shift+P` → "TypeScript: Restart TS Server"

---

### Issue: Dotted Separator Too Short/Long

**Diagnosis**: Constant value mismatch

**Solution**: Verify `DOTTED_SEPARATOR_REPEATS = 400 as const` (not 40 or 4000)

---

### Issue: Reset Menu Exits Immediately

**Diagnosis**: Constant not imported or wrong value

**Solution**:

1. Check import: `import { RESET_MENU_EXIT_DELAY_MS } from "@/constants/ui";`
2. Verify value: `RESET_MENU_EXIT_DELAY_MS = 1000 as const` (milliseconds, not seconds)

---

### Issue: Active Item Border Doesn't Move

**Diagnosis**: queueMicrotask not called correctly

**Solution**: Ensure exact replacement (no trailing semicolons inside microtask, etc.)

**Debug**:

```typescript
// Add temporary logging
queueMicrotask(() => {
  console.log("Microtask executing");
  const firstUncheckedIndex = currentItems.findIndex(...);
  console.log("First unchecked index:", firstUncheckedIndex);
  setActiveItemIndex(firstUncheckedIndex >= 0 ? firstUncheckedIndex : -1);
});
```

---

## Rollback Procedure

If critical issues arise:

```bash
# Revert all changes
git checkout src/constants/ui.ts
git checkout src/components/ChecklistItem.tsx
git checkout src/components/ResetsMenu.tsx
git checkout src/app/page.tsx

# Or discard entire feature
git reset --hard origin/master
```

---

## Success Criteria

✅ **Step 1**: `src/constants/ui.ts` created with 2 constants  
✅ **Step 2**: `ChecklistItem.tsx` imports and uses `DOTTED_SEPARATOR_REPEATS`  
✅ **Step 3**: `ResetsMenu.tsx` imports and uses `RESET_MENU_EXIT_DELAY_MS`  
✅ **Step 4**: `page.tsx` uses `queueMicrotask()` (2 locations)  
✅ **Step 5**: All tests pass, no visual regressions

---

## Next Steps

After completing this quickstart:

1. **Commit changes**:

   ```bash
   git add src/constants/ui.ts src/components/ src/app/page.tsx
   git commit -m "feat: replace magic values with named constants"
   ```

2. **Update documentation** (if needed):
   - Update `.github/copilot-instructions.md` to reference new constants module

3. **Create pull request**:
   - Link to spec: `specs/006-eliminate-magic-values/spec.md`
   - Link to plan: `specs/006-eliminate-magic-values/plan.md`
   - Include before/after screenshots (should be identical)

---

## Additional Resources

- [TypeScript const assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)
- [queueMicrotask MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/queueMicrotask)
- [Feature spec](./spec.md)
- [Data model](./data-model.md)
- [Module contract](./contracts/ui-constants.md)

---

**Estimated Total Time**: 30 minutes  
**Difficulty**: Beginner  
**Risk Level**: Low (refactoring only, no functional changes)
