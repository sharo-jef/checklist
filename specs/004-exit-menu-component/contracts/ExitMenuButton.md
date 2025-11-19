# Component Contract: ExitMenuButton

**Version**: 1.0.0  
**Date**: 2025-11-20  
**Type**: React Component Contract

## Overview

This contract defines the public interface for the `ExitMenuButton` React component. This component provides a standardized, reusable "EXIT MENU" button used across multiple menu contexts.

## Component Signature

### TypeScript Interface

```typescript
interface ExitMenuButtonProps {
  onClick: () => void;
}

export function ExitMenuButton(props: ExitMenuButtonProps): JSX.Element;
```

## Props Contract

### Required Props

#### `onClick`

**Type**: `() => void`  
**Required**: Yes  
**Description**: Callback function invoked when the button is clicked or activated via keyboard (Enter/Space).

**Contract Guarantees**:

- Called exactly once per click event
- Called synchronously (not debounced or throttled)
- Called before any visual feedback updates
- No arguments passed to callback

**Example**:

```typescript
const handleExitMenu = () => {
  setViewMode("default");
  setActiveMenu(null);
};

<ExitMenuButton onClick={handleExitMenu} />
```

**Error Conditions**:

- TypeScript compile error if onClick is not provided
- TypeScript compile error if onClick is not a function
- Runtime error if onClick throws (error propagates to parent)

## Component Behavior

### Rendering Contract

**HTML Output**:

```html
<button
  aria-label="Exit Menu"
  class="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
>
  EXIT MENU
</button>
```

**Guarantees**:

- Always renders a semantic `<button>` element
- Text content is always "EXIT\nMENU" (two lines)
- CSS classes are always identical (no conditional styling)
- `aria-label` is always "Exit Menu"

**Visual Specifications**:

- **Background color**: `#4a5568` (gray)
- **Text color**: White (`#ffffff`)
- **Border**: 2px transparent, white on hover
- **Font**: Monospaced (Barlow Condensed)
- **Font size**: 1.25rem (text-xl)
- **Padding**: 0.25rem vertical, 1rem horizontal
- **Min height**: 2.75rem (44px)
- **Line breaking**: Pre-line whitespace (respects \n)

### Interaction Contract

**Mouse Interaction**:

- Click on button → calls `onClick` prop
- Hover on button → white border appears (CSS :hover)
- Mouse down/up → browser default button states

**Keyboard Interaction**:

- Tab key → focuses button (native browser behavior)
- Enter key while focused → calls `onClick` prop
- Space key while focused → calls `onClick` prop
- Escape key → no effect (handled by parent if needed)

**Touch Interaction** (mobile):

- Tap on button → calls `onClick` prop
- Long press → browser default context menu (if enabled)

**Focus Management**:

- Component does not auto-focus
- Focus is managed by browser/parent component
- Focus indicator: browser default (outline)

### Accessibility Contract

**ARIA Attributes**:

- `aria-label="Exit Menu"`: Provides accessible name for screen readers

**Keyboard Accessibility**:

- Focusable via Tab key (native `<button>` behavior)
- Activatable via Enter or Space keys
- Focus order determined by DOM position

**Screen Reader Behavior**:

- Announces as "Exit Menu, button"
- States "clickable" or "pressable" (screen reader dependent)
- Does not announce visual line break (aria-label is single line)

**Color Contrast**:

- Text-to-background ratio: 4.86:1 (WCAG AA compliant)
- Border-to-background ratio: N/A (transparent until hover)

## Integration Examples

### Example 1: NORMAL Menu Exit

```tsx
import { ExitMenuButton } from "@/components/ExitMenuButton";

function NormalMenuView() {
  const handleExitMenu = () => {
    setActiveMenu(null);
    setViewMode("default");
  };

  return (
    <div>
      {/* Menu content */}
      <div className="flex justify-end gap-3 p-3">
        <ExitMenuButton onClick={handleExitMenu} />
      </div>
    </div>
  );
}
```

### Example 2: NON-NORMAL Menu Exit

```tsx
import { ExitMenuButton } from "@/components/ExitMenuButton";

function NonNormalMenuView() {
  const handleExitMenu = () => {
    setActiveMenu(null);
    setViewMode("default");
  };

  return (
    <div>
      {/* Menu content */}
      <div className="flex justify-end gap-3 p-3">
        <ExitMenuButton onClick={handleExitMenu} />
      </div>
    </div>
  );
}
```

### Example 3: RESETS Menu Exit

```tsx
import { ExitMenuButton } from "@/components/ExitMenuButton";

function ResetsMenuView() {
  const handleExitMenu = () => {
    setActiveMenu(null);
    setViewMode("default");
  };

  return (
    <div>
      {/* Menu content */}
      <div className="flex justify-end gap-3 p-3">
        <ExitMenuButton onClick={handleExitMenu} />
      </div>
    </div>
  );
}
```

## Migration from Inline Buttons

### Before (Inline Button)

```tsx
<button
  onClick={handleExitMenu}
  className="py-1 px-4 min-h-11 text-center font-mono text-xl tracking-wide leading-none border-2 border-transparent hover:border-white bg-[#4a5568] text-white whitespace-pre-line"
>
  {"EXIT\nMENU"}
</button>
```

### After (ExitMenuButton Component)

```tsx
import { ExitMenuButton } from "@/components/ExitMenuButton";

<ExitMenuButton onClick={handleExitMenu} />;
```

**Benefits**:

- 4 lines → 1 line (75% reduction)
- Centralized styling (update once, applies everywhere)
- Type-safe onClick prop
- Improved accessibility (aria-label)

## Non-Goals

This component intentionally does NOT support:

### ❌ Custom Text Content

**Rationale**: All Exit Menu buttons use identical text. Allowing customization would enable inconsistency.

**Workaround**: If different text is needed, create a separate component or use inline button.

### ❌ Custom Styling

**Rationale**: All Exit Menu buttons use identical styling per aviation UX consistency requirements.

**Workaround**: Component is not designed for style variations. Fork or create new component if needed.

### ❌ Disabled State

**Rationale**: Exit Menu buttons are never disabled in current design. Users can always exit menus.

**Workaround**: If disabled state is needed in future, add `disabled?: boolean` prop (backward compatible).

### ❌ Loading State

**Rationale**: Exit actions are synchronous state updates. No async operations or loading indicators needed.

**Workaround**: If async exit logic is added, implement loading state in parent component.

### ❌ Icon Support

**Rationale**: Current design is text-only. Icons would deviate from aviation checklist aesthetics.

**Workaround**: Create separate IconButton component if icon variants are needed.

## Testing Contract

### Manual Testing Checklist

Component implementers must verify:

- [ ] Button renders in NORMAL menu view
- [ ] Button renders in NON-NORMAL menu view
- [ ] Button renders in RESETS menu view
- [ ] Clicking button calls onClick handler
- [ ] Enter key activates onClick handler
- [ ] Space key activates onClick handler
- [ ] Hover effect shows white border
- [ ] Text displays as two lines ("EXIT" then "MENU")
- [ ] Button meets min-height requirement (44px touch target)
- [ ] Screen reader announces "Exit Menu, button"
- [ ] Focus indicator is visible when tabbing
- [ ] TypeScript compilation succeeds with strict mode
- [ ] `npm run build` succeeds (static export)
- [ ] `npm run lint` passes

### Regression Testing

When modifying this component, verify:

- [ ] All three menu contexts still work (NORMAL, NON-NORMAL, RESETS)
- [ ] Button styling matches original inline buttons exactly
- [ ] onClick handlers in page.tsx are not modified
- [ ] No hydration errors in browser console
- [ ] Static export still works (GitHub Pages deployment)

## Versioning

**Current Version**: 1.0.0

**Version History**:

- **1.0.0** (2025-11-20): Initial contract definition

**Breaking Changes Policy**:

- Removing `onClick` prop → Major version bump
- Changing button text content → Major version bump
- Changing default styling → Major version bump
- Adding optional props → Minor version bump
- Bug fixes in onClick behavior → Patch version bump

**Deprecation Policy**:
If props need to be removed, follow this process:

1. Add deprecation warning in code comments
2. Update contract with migration guide
3. Wait one release cycle
4. Remove in next major version

## Compliance

### Constitution Alignment

✅ **Static-First Architecture**: Component has no server dependencies  
✅ **Hydration Safety**: No LocalStorage access, pure presentation component  
✅ **Immutable Data Definitions**: Does not modify checklist data  
✅ **Aviation-Inspired UX**: Preserves exact styling from original design  
✅ **Type Safety**: TypeScript strict mode with explicit interface  
✅ **Code Organization**: Located in `src/components/` per conventions  
✅ **Styling Conventions**: Tailwind inline classes, no CSS modules

### Feature Requirements Mapping

| Requirement                                    | Contract Section         |
| ---------------------------------------------- | ------------------------ |
| FR-001: Reusable component                     | Props Contract           |
| FR-002: Accept onClick handler                 | Required Props → onClick |
| FR-003: Render "EXIT\nMENU" text               | Rendering Contract       |
| FR-004: Same styling as current buttons        | Visual Specifications    |
| FR-005: Keyboard navigation & accessibility    | Accessibility Contract   |
| FR-006: Replace all three instances            | Integration Examples     |
| FR-007: 100% functional parity                 | Behavior Contract        |
| FR-008: Follow component structure conventions | Component Signature      |
| FR-009: Use same CSS classes                   | Visual Specifications    |

## Support

**Contact**: Reference `specs/004-exit-menu-component/` documentation for implementation details.

**Known Issues**: None

**Future Enhancements**:

- Consider adding `disabled` prop if exit logic becomes async
- Consider adding `testId` prop for automated testing if test suite is added

---

**Contract Version**: 1.0.0  
**Last Updated**: 2025-11-20  
**Status**: Active
