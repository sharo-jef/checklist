# Quickstart: Exit Menu Button Component

**Feature**: Extract Exit Menu button into reusable component  
**Branch**: `004-exit-menu-component`  
**Estimated Time**: 15-20 minutes

## Overview

This guide walks you through implementing the ExitMenuButton component, a simple refactoring that consolidates three duplicate button instances into a single reusable component.

## Prerequisites

- Node.js and npm installed
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with React and TypeScript
- Branch `004-exit-menu-component` checked out

## Quick Reference

**Files to Create**: 1  
**Files to Modify**: 3  
**Tests to Write**: 0 (manual testing only)  
**Estimated LOC**: +30 lines, -45 lines (net -15 lines)

## Implementation Steps

### Step 1: Create Component File (5 minutes)

Create `src/components/ExitMenuButton.tsx`:

```tsx
interface ExitMenuButtonProps {
  onClick: () => void;
}

export function ExitMenuButton({ onClick }: ExitMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Exit Menu"
      className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
    >
      {"EXIT\nMENU"}
    </button>
  );
}
```

**Key Points**:

- Props interface defines only `onClick` (minimal API)
- Copy exact `className` string from existing buttons (ensure no drift)
- Add `aria-label` for accessibility improvement
- Hardcode text content (all instances use same text)

**Common Mistakes**:

- ❌ Don't add unnecessary props (text, className, disabled)
- ❌ Don't modify className string (must match exactly)
- ❌ Don't forget `aria-label` attribute

### Step 2: Update page.tsx - NORMAL Menu (3 minutes)

**Location**: Line ~340 (NORMAL menu Exit button)

**Find**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <button
    onClick={handleExitMenu}
    className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
  >
    {"EXIT\nMENU"}
  </button>
</div>
```

**Replace with**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <ExitMenuButton onClick={handleExitMenu} />
</div>
```

**Don't forget**: Add import at top of file:

```tsx
import { ExitMenuButton } from "@/components/ExitMenuButton";
```

### Step 3: Update page.tsx - RESETS Menu (3 minutes)

**Location**: Line ~363 (RESETS menu Exit button)

**Find**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <button
    onClick={handleExitMenu}
    className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
  >
    {"EXIT\nMENU"}
  </button>
</div>
```

**Replace with**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <ExitMenuButton onClick={handleExitMenu} />
</div>
```

### Step 4: Update page.tsx - NON-NORMAL Menu (3 minutes)

**Location**: Line ~378 (NON-NORMAL menu Exit button)

**Find**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <button
    onClick={handleExitMenu}
    className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
  >
    {"EXIT\nMENU"}
  </button>
</div>
```

**Replace with**:

```tsx
<div className="flex justify-end gap-3 p-3 bg-[#09090C]">
  <ExitMenuButton onClick={handleExitMenu} />
</div>
```

**Result**: page.tsx should now import and use ExitMenuButton in three places instead of inline buttons.

### Step 5: Manual Testing (5-10 minutes)

Run the development server:

```bash
npm run dev
```

Open http://localhost:3000/checklist

**Test Checklist**:

1. **NORMAL Menu Exit**
   - [ ] Click "NORMAL" button on main screen
   - [ ] Verify Exit Menu button appears (bottom right)
   - [ ] Verify button displays "EXIT" on first line, "MENU" on second line
   - [ ] Hover over button → white border should appear
   - [ ] Click Exit Menu → returns to main screen
   - [ ] Tab to button → focus indicator visible
   - [ ] Press Enter while focused → returns to main screen

2. **NON-NORMAL Menu Exit**
   - [ ] Click "NON-NORMAL" button on main screen
   - [ ] Verify Exit Menu button appears (bottom right)
   - [ ] Verify identical styling to NORMAL menu button
   - [ ] Click Exit Menu → returns to main screen

3. **RESETS Menu Exit**
   - [ ] Click "RESETS" in top menu
   - [ ] Verify Exit Menu button appears (bottom right)
   - [ ] Verify identical styling to other buttons
   - [ ] Click Exit Menu → returns to main screen

4. **Accessibility**
   - [ ] Tab through UI → button is in tab order
   - [ ] (Optional) Test with screen reader → announces "Exit Menu, button"

5. **Build Verification**
   ```bash
   npm run lint
   npm run build
   ```

   - [ ] No lint errors
   - [ ] Build succeeds
   - [ ] Check `out/` directory contains static files

**If any test fails**: Review component code and integration. Ensure className matches exactly.

### Step 6: Commit Changes (2 minutes)

```bash
git add src/components/ExitMenuButton.tsx
git add src/app/page.tsx
git commit -m "feat: extract Exit Menu button into reusable component

- Created ExitMenuButton component in src/components/
- Replaced 3 duplicate inline buttons with component usage
- Added aria-label for improved accessibility
- Maintained 100% visual and functional parity

Closes #004-exit-menu-component"
```

## Verification

### Before/After Comparison

**Before**:

- 3 identical button blocks in page.tsx
- Total: ~15 lines × 3 = 45 lines of duplicate code
- Styling changes require 3 edits

**After**:

- 1 component definition: 15 lines
- 3 component usages: 1 line each = 3 lines
- Total: 18 lines
- Styling changes require 1 edit

**Reduction**: 45 lines → 18 lines (40% fewer lines)

### Success Criteria Verification

| Criterion                             | How to Verify                                                    | Status |
| ------------------------------------- | ---------------------------------------------------------------- | ------ |
| SC-001: 3 instances → 1 component     | Count: 1 file in components/, 3 imports in page.tsx              | ✅     |
| SC-002: Styling updates in 1 location | Modify ExitMenuButton.tsx className, verify all 3 buttons change | ✅     |
| SC-003: Identical rendering           | Visual inspection of all 3 contexts                              | ✅     |
| SC-004: Reduced review time           | Compare old page.tsx vs new page.tsx                             | ✅     |
| SC-005: Zero regressions              | Manual testing checklist above                                   | ✅     |
| SC-006: Consistent accessibility      | aria-label in component, Tab navigation works                    | ✅     |

## Troubleshooting

### Issue: Button styling looks different

**Symptom**: Exit Menu button has different colors, spacing, or hover effect  
**Cause**: className string doesn't match original exactly  
**Fix**: Copy className from git history (`git show HEAD~1:src/app/page.tsx`) and verify exact match

### Issue: TypeScript errors on onClick prop

**Symptom**: `Type '() => void' is not assignable to type 'never'`  
**Cause**: Props interface missing or incorrect  
**Fix**: Ensure ExitMenuButtonProps interface is defined and onClick is typed as `() => void`

### Issue: Button doesn't appear

**Symptom**: No Exit Menu button visible in menu views  
**Cause**: Import missing or component name typo  
**Fix**: Verify import statement at top of page.tsx matches component export name exactly

### Issue: Click doesn't work

**Symptom**: Clicking button does nothing  
**Cause**: onClick prop not wired correctly  
**Fix**: Verify `<ExitMenuButton onClick={handleExitMenu} />` passes handler correctly

### Issue: Build fails with "Module not found"

**Symptom**: `npm run build` fails with import error  
**Cause**: Incorrect import path or missing file  
**Fix**: Ensure file is at `src/components/ExitMenuButton.tsx` and import uses `@/components/ExitMenuButton`

## Next Steps

After implementing this feature:

1. **Create PR**: Push branch and open pull request
2. **Request review**: Tag reviewer familiar with component patterns
3. **Deploy**: Merge to master triggers GitHub Pages deploy
4. **Monitor**: Check for any user reports of button issues

## Reference Documentation

- **Feature Spec**: `specs/004-exit-menu-component/spec.md`
- **Implementation Plan**: `specs/004-exit-menu-component/plan.md`
- **Component Contract**: `specs/004-exit-menu-component/contracts/ExitMenuButton.md`
- **Research Notes**: `specs/004-exit-menu-component/research.md`
- **Data Model**: `specs/004-exit-menu-component/data-model.md`

## Tips for Success

1. **Copy, don't recreate**: Copy the exact className string to avoid subtle differences
2. **Test all three contexts**: Don't assume if one works, all work
3. **Use git diff**: Compare your changes to ensure only necessary lines changed
4. **Run lint early**: Catch TypeScript errors before manual testing
5. **Check build output**: Ensure static export still works (critical for deployment)

## Time Estimates by Experience Level

- **Experienced React developer**: 15 minutes
- **Intermediate developer**: 20-30 minutes
- **Junior developer**: 30-45 minutes (including learning time)

## Common Questions

**Q: Why not make text content configurable?**  
A: All Exit Menu buttons use identical text. Hardcoding prevents inconsistency.

**Q: Should I add a disabled prop for future use?**  
A: No. YAGNI principle - add only when needed. Easy to add later (backward compatible).

**Q: Can I improve the styling while I'm here?**  
A: No. Feature spec requires 100% functional parity. Styling changes are out of scope.

**Q: Do I need to write tests?**  
A: No. Project uses manual testing only (per constitution). Follow Step 5 checklist.

**Q: What if I want to use this button outside menu contexts?**  
A: Component is generic enough. Just pass appropriate onClick handler.

---

**Last Updated**: 2025-11-20  
**Status**: Ready for implementation
