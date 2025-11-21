# Quick Start: View Routing Refactor

**Feature**: Simplify Conditional View Rendering  
**Date**: 2025-11-20  
**Estimated Time**: 2-3 hours

This guide walks through implementing the view routing refactor from start to finish.

---

## Prerequisites

- [ ] Feature branch `009-view-routing-logic` checked out
- [ ] All previous specs (001-008) merged to master
- [ ] Development server working (`npm run dev`)
- [ ] TypeScript strict mode enabled

---

## Phase 1: Extract DefaultView Component (30 min)

### Step 1.1: Create DefaultView Component

**File**: `src/components/DefaultView.tsx`

```typescript
"use client";

interface DefaultViewProps {
  onNormalClick: () => void;
  onNonNormalClick: () => void;
}

export function DefaultView({ onNormalClick, onNonNormalClick }: DefaultViewProps) {
  return (
    <div className="flex-1 bg-[#09090C] flex flex-col">
      <div className="flex-1"></div>
      <div className="flex justify-between gap-3 p-3">
        <button
          onClick={onNormalClick}
          className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white"
        >
          NORMAL
        </button>
        <button
          onClick={onNonNormalClick}
          className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-yellow-400 whitespace-pre-line"
        >
          {"NON-\nNORMAL"}
        </button>
      </div>
    </div>
  );
}
```

**Action**: Extract this JSX from `page.tsx` where `viewMode === "default"` renders.

### Step 1.2: Verify Component Renders

Test the component:

```typescript
// In page.tsx temporarily
import { DefaultView } from "@/components/DefaultView";

// Replace default view JSX with:
<DefaultView
  onNormalClick={handleNormalButton}
  onNonNormalClick={handleNonNormalButton}
/>
```

**Verification**:

- [ ] Dev server reloads without errors
- [ ] Default view displays NORMAL/NON-NORMAL buttons
- [ ] Clicking buttons navigates to menus correctly

---

## Phase 2: Define Routing Types (45 min)

### Step 2.1: Create Routing Types File

**File**: `src/types/routing.ts`

```typescript
import { ComponentType } from "react";
import { MenuType } from "./checklist";
import type {
  ChecklistCategory,
  Checklist,
  ChecklistItem,
  ItemStates,
} from "./checklist";

/**
 * Discriminated union representing all valid view states.
 */
export type ViewState =
  | { view: "default" }
  | { view: "menu"; menu: MenuType }
  | { view: "checklist"; menu: MenuType.NORMAL | MenuType.NON_NORMAL };

/**
 * Internal routing key for component lookup.
 */
export type ViewKey =
  | "default"
  | "menu-normal"
  | "menu-non-normal"
  | "menu-resets"
  | "checklist-normal"
  | "checklist-non-normal";

/**
 * Aggregated application state for view routing.
 */
export interface AppState {
  // Navigation handlers
  handleNormalButton: () => void;
  handleNonNormalButton: () => void;
  handleChecklistSelect: (categoryId: string) => void;
  handleExitMenu: () => void;

  // Checklist item handlers
  handleToggleItem: (index: number) => void;
  handleItemOverride: (index: number) => void;
  handleChecklistOverride: () => void;
  handleChecklistReset: () => void;
  handleNext: () => void;

  // Reset handlers
  handleResetNormal: () => void;
  handleResetNonNormal: () => void;
  handleResetAll: () => void;

  // Data
  checklistData: ChecklistCategory[];
  itemStates: ItemStates;
  currentChecklist: Checklist | null;
  currentItems: ChecklistItem[];

  // Derived state
  activeItemIndex: number;
  navigation: {
    hasNext: boolean;
    nextNormalChecklist: Checklist | null;
  };
}

/**
 * Component props interfaces for registry type safety.
 */
export interface DefaultViewProps {
  onNormalClick: () => void;
  onNonNormalClick: () => void;
}

export interface ChecklistMenuProps {
  categories: ChecklistCategory[];
  onSelect: (categoryId: string) => void;
  itemStates: ItemStates;
  menuType: MenuType;
}

export interface ChecklistDisplayProps {
  checklist: Checklist | null;
  items: ChecklistItem[];
  activeItemIndex: number;
  onToggleItem: (index: number) => void;
  onItemOverride: (index: number) => void;
  onChecklistOverride: () => void;
  onChecklistReset: () => void;
  onNext?: () => void;
  showControls: boolean;
  hasNextChecklist: boolean;
}

export interface ResetsMenuProps {
  onResetNormal: () => void;
  onResetNonNormal: () => void;
  onResetAll: () => void;
  onExitMenu: () => void;
}

/**
 * View component registry interface.
 */
export interface ViewRegistry {
  default: ComponentType<DefaultViewProps>;
  "menu-normal": ComponentType<ChecklistMenuProps>;
  "menu-non-normal": ComponentType<ChecklistMenuProps>;
  "menu-resets": ComponentType<ResetsMenuProps>;
  "checklist-normal": ComponentType<ChecklistDisplayProps>;
  "checklist-non-normal": ComponentType<ChecklistDisplayProps>;
}

/**
 * Converts ViewState to ViewKey for component lookup.
 */
export function getViewKey(state: ViewState): ViewKey {
  switch (state.view) {
    case "default":
      return "default";

    case "menu":
      // Convert MenuType enum to ViewKey format
      const menuKey = state.menu.toLowerCase().replace("_", "-");
      return `menu-${menuKey}` as ViewKey;

    case "checklist":
      const checklistKey = state.menu.toLowerCase().replace("_", "-");
      return `checklist-${checklistKey}` as ViewKey;

    default:
      const _exhaustive: never = state;
      throw new Error(`Unhandled view state: ${_exhaustive}`);
  }
}
```

### Step 2.2: Verify Types Compile

```bash
npm run build
```

**Verification**:

- [ ] No TypeScript errors
- [ ] Types are exported correctly
- [ ] getViewKey function has exhaustiveness checking

---

## Phase 3: Create View Registry (30 min)

### Step 3.1: Create Registry Directory

```bash
mkdir src/routing
```

### Step 3.2: Create View Registry File

**File**: `src/routing/viewRegistry.ts`

```typescript
import { ViewRegistry } from "@/types/routing";
import { DefaultView } from "@/components/DefaultView";
import { ChecklistMenu } from "@/components/ChecklistMenu";
import { ChecklistDisplay } from "@/components/ChecklistDisplay";
import { ResetsMenu } from "@/components/ResetsMenu";

/**
 * Component registry for view routing.
 * Maps ViewKey strings to React components.
 */
export const VIEW_COMPONENTS: ViewRegistry = {
  default: DefaultView,
  "menu-normal": ChecklistMenu,
  "menu-non-normal": ChecklistMenu,
  "menu-resets": ResetsMenu,
  "checklist-normal": ChecklistDisplay,
  "checklist-non-normal": ChecklistDisplay,
};
```

### Step 3.3: Verify Registry Compiles

```bash
npm run build
```

**Verification**:

- [ ] No TypeScript errors
- [ ] All components import correctly
- [ ] Registry matches ViewRegistry interface

---

## Phase 4: Implement useViewRouter Hook (60 min)

### Step 4.1: Create Hook File

**File**: `src/routing/useViewRouter.ts`

```typescript
import { useMemo, ComponentType } from "react";
import { ViewState, AppState, ViewKey, getViewKey } from "@/types/routing";
import { VIEW_COMPONENTS } from "./viewRegistry";
import { MenuType } from "@/types/checklist";
import { DefaultView } from "@/components/DefaultView";

interface ViewRouterResult<P = any> {
  ViewComponent: ComponentType<P>;
  viewProps: P;
}

/**
 * Maps ViewState and AppState to appropriate view component and props.
 */
export function useViewRouter(
  viewState: ViewState,
  appState: AppState
): ViewRouterResult {
  // Convert ViewState to ViewKey
  const viewKey = useMemo(() => getViewKey(viewState), [viewState]);

  // Look up component (with defensive fallback)
  const ViewComponent = VIEW_COMPONENTS[viewKey] || DefaultView;

  // Map AppState to component-specific props
  const viewProps = useMemo(() => {
    switch (viewKey) {
      case "default":
        return {
          onNormalClick: appState.handleNormalButton,
          onNonNormalClick: appState.handleNonNormalButton,
        };

      case "menu-normal":
        return {
          categories: appState.checklistData.filter(
            (cat) => cat.menuType === MenuType.NORMAL
          ),
          onSelect: appState.handleChecklistSelect,
          itemStates: appState.itemStates,
          menuType: MenuType.NORMAL,
        };

      case "menu-non-normal":
        return {
          categories: appState.checklistData.filter(
            (cat) => cat.menuType === MenuType.NON_NORMAL
          ),
          onSelect: appState.handleChecklistSelect,
          itemStates: appState.itemStates,
          menuType: MenuType.NON_NORMAL,
        };

      case "menu-resets":
        return {
          onResetNormal: appState.handleResetNormal,
          onResetNonNormal: appState.handleResetNonNormal,
          onResetAll: appState.handleResetAll,
          onExitMenu: appState.handleExitMenu,
        };

      case "checklist-normal":
        return {
          checklist: appState.currentChecklist,
          items: appState.currentItems,
          activeItemIndex: appState.activeItemIndex,
          onToggleItem: appState.handleToggleItem,
          onItemOverride: appState.handleItemOverride,
          onChecklistOverride: appState.handleChecklistOverride,
          onChecklistReset: appState.handleChecklistReset,
          onNext: appState.handleNext,
          showControls: true,
          hasNextChecklist: appState.navigation.hasNext,
        };

      case "checklist-non-normal":
        return {
          checklist: appState.currentChecklist,
          items: appState.currentItems,
          activeItemIndex: appState.activeItemIndex,
          onToggleItem: appState.handleToggleItem,
          onItemOverride: appState.handleItemOverride,
          onChecklistOverride: appState.handleChecklistOverride,
          onChecklistReset: appState.handleChecklistReset,
          showControls: true,
          hasNextChecklist: false,
        };

      default:
        const _exhaustive: never = viewKey;
        throw new Error(`Unhandled view key: ${_exhaustive}`);
    }
  }, [viewKey, appState]);

  return { ViewComponent, viewProps };
}
```

### Step 4.2: Verify Hook Compiles

```bash
npm run build
```

**Verification**:

- [ ] No TypeScript errors
- [ ] Exhaustiveness checking works (try removing a case)
- [ ] Props types match component interfaces

---

## Phase 5: Refactor page.tsx (45 min)

### Step 5.1: Add Imports

At the top of `src/app/page.tsx`:

```typescript
import { useViewRouter } from "@/routing/useViewRouter";
import { ViewState, AppState } from "@/types/routing";
```

### Step 5.2: Wrap Handlers in useCallback

Ensure all handlers are stable:

```typescript
const handleNormalButton = useCallback(() => {
  setActiveMenu(MenuType.NORMAL);
  setViewMode("menu");
}, []);

const handleNonNormalButton = useCallback(() => {
  setActiveMenu(MenuType.NON_NORMAL);
  setViewMode("menu");
}, []);

// ... wrap all other handlers similarly
```

### Step 5.3: Construct ViewState

After all state declarations:

```typescript
const viewState: ViewState = useMemo(() => {
  if (viewMode === "default") {
    return { view: "default" };
  }

  if (viewMode === "menu" && activeMenu) {
    return { view: "menu", menu: activeMenu };
  }

  if (
    viewMode === "checklist" &&
    activeMenu &&
    activeMenu !== MenuType.RESETS
  ) {
    return { view: "checklist", menu: activeMenu };
  }

  return { view: "default" };
}, [viewMode, activeMenu]);
```

### Step 5.4: Construct AppState

```typescript
const appState: AppState = useMemo(
  () => ({
    handleNormalButton,
    handleNonNormalButton,
    handleChecklistSelect,
    handleExitMenu,
    handleToggleItem,
    handleItemOverride,
    handleChecklistOverride,
    handleChecklistReset,
    handleNext,
    handleResetNormal,
    handleResetNonNormal,
    handleResetAll,
    checklistData,
    itemStates,
    currentChecklist,
    currentItems,
    activeItemIndex,
    navigation,
  }),
  [
    handleNormalButton,
    handleNonNormalButton,
    handleChecklistSelect,
    handleExitMenu,
    handleToggleItem,
    handleItemOverride,
    handleChecklistOverride,
    handleChecklistReset,
    handleNext,
    handleResetNormal,
    handleResetNonNormal,
    handleResetAll,
    checklistData,
    itemStates,
    currentChecklist,
    currentItems,
    activeItemIndex,
    navigation,
  ]
);
```

### Step 5.5: Use Routing Hook

```typescript
const { ViewComponent, viewProps } = useViewRouter(viewState, appState);
```

### Step 5.6: Replace Render Logic

**Before** (delete all nested conditionals):

```typescript
// Delete this entire section
{viewMode === "default" && (
  <div className="flex-1 bg-[#09090C] flex flex-col">
    {/* ... */}
  </div>
)}

{activeMenu === MenuType.NORMAL && viewMode === "menu" && (
  {/* ... */}
)}

// ... all other conditional blocks
```

**After** (single line):

```typescript
return (
  <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
    <TopMenu
      activeMenu={viewMode === "checklist" ? null : activeMenu}
      onMenuChange={handleMenuChange}
    />
    <ViewComponent {...viewProps} />
  </div>
);
```

### Step 5.7: Handle Footer (if applicable)

If certain views need a footer with ExitMenuButton:

```typescript
// Determine if current view needs exit button
const showExitButton = useMemo(() => {
  return viewKey.startsWith("menu-");
}, [viewKey]);

return (
  <div className="h-screen w-full bg-[#09090C] flex flex-col overflow-hidden">
    <TopMenu
      activeMenu={viewMode === "checklist" ? null : activeMenu}
      onMenuChange={handleMenuChange}
    />
    <ViewComponent {...viewProps} />
    {showExitButton && (
      <div className="flex justify-end gap-3 p-3 bg-[#09090C]">
        <ExitMenuButton onClick={handleExitMenu} />
      </div>
    )}
  </div>
);
```

**Note**: Check current implementation - the ExitMenuButton logic may already be handled within menu components.

---

## Phase 6: Testing & Verification (30 min)

### Step 6.1: Visual Testing

Start dev server:

```bash
npm run dev
```

Navigate to `http://localhost:3000/checklist`

Test all navigation flows:

- [ ] Default view displays NORMAL/NON-NORMAL buttons
- [ ] Clicking NORMAL shows NORMAL menu
- [ ] Selecting checklist shows checklist display
- [ ] Clicking NEXT advances to next checklist (NORMAL only)
- [ ] ExitMenuButton returns to default view
- [ ] Clicking NON-NORMAL shows NON-NORMAL menu
- [ ] NON-NORMAL checklist doesn't show NEXT button
- [ ] RESETS menu from TopMenu works
- [ ] All three reset buttons function correctly

### Step 6.2: Type Checking

```bash
npm run build
```

**Verification**:

- [ ] Zero TypeScript errors
- [ ] Build completes successfully
- [ ] No warnings about unused variables

### Step 6.3: Lint Checking

```bash
npm run lint
```

**Verification**:

- [ ] No ESLint errors
- [ ] No missing dependencies in useCallback/useMemo

### Step 6.4: Production Build Test

```bash
npm run build
npx serve out
```

Navigate to served URL and repeat visual tests.

**Verification**:

- [ ] Static export works correctly
- [ ] All navigation flows work in production build
- [ ] No hydration errors in console

---

## Phase 7: Update Agent Context (15 min)

Run the agent context update script:

```bash
.\.specify\scripts\powershell\update-agent-context.ps1 -AgentType copilot
```

**Verification**:

- [ ] Copilot instructions updated with routing pattern
- [ ] New directories and files documented
- [ ] No manual context overwritten

---

## Phase 8: Cleanup & Documentation (15 min)

### Step 8.1: Remove Dead Code

Check for unused code in `page.tsx`:

- [ ] Old conditional rendering logic removed
- [ ] No unused imports
- [ ] No commented-out code

### Step 8.2: Update Comments

Add JSDoc comments where needed:

```typescript
/**
 * Main application page component.
 * Uses declarative view routing via useViewRouter hook.
 */
export default function Home() {
  // ...
}
```

### Step 8.3: Format Code

```bash
npm run format
```

---

## Success Checklist

- [ ] All view transitions work identically to before
- [ ] TypeScript compilation passes with zero errors
- [ ] ESLint passes with zero errors
- [ ] No hydration warnings in console
- [ ] Static export builds successfully
- [ ] All manual tests pass in dev and production
- [ ] Code is formatted and linted
- [ ] Agent context updated
- [ ] Zero regressions in functionality

---

## Troubleshooting

### Issue: "Cannot find module '@/routing/useViewRouter'"

**Solution**: Ensure TypeScript paths are configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue: Type errors in AppState useMemo dependencies

**Solution**: Ensure all handlers are wrapped in `useCallback` with correct dependencies.

### Issue: Views not rendering

**Solution**: Check ViewState construction - ensure it matches one of the discriminated union variants.

### Issue: Props type errors in useViewRouter

**Solution**: Verify component prop interfaces match ViewRegistry definitions exactly.

---

## Next Steps

After completing this refactor:

1. Commit changes: `git add . && git commit -m "feat: simplify view routing with discriminated unions"`
2. Push branch: `git push origin 009-view-routing-logic`
3. Create pull request
4. Request code review
5. Merge to master after approval

---

## Estimated Timeline

- Phase 1 (DefaultView): 30 min
- Phase 2 (Types): 45 min
- Phase 3 (Registry): 30 min
- Phase 4 (Hook): 60 min
- Phase 5 (Refactor page.tsx): 45 min
- Phase 6 (Testing): 30 min
- Phase 7 (Agent context): 15 min
- Phase 8 (Cleanup): 15 min

**Total: 4 hours 30 minutes**

With breaks and unexpected issues, allocate a full working day (6-8 hours).
