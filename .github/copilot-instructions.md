# Copilot Instructions for Vehicle Digital Checklist

## Project Overview

This is a Next.js 16 static site (static export) inspired by Boeing 747-8i digital checklist systems, adapted for personal vehicle use. The app manages pre-drive, during-drive, and parking checklists with professional aviation-style workflows.

**Key characteristics:**

- Static export deployed to GitHub Pages at `/checklist` base path
- Client-only state management (no server components for data)
- LocalStorage persistence with version migration support
- React 19 with experimental React Compiler enabled
- Japanese primary audience (UI in English, docs in Japanese)

## Architecture & Data Flow

### State Management Pattern

The app uses **unidirectional data flow** with hooks:

1. **Single source of truth**: `src/data/checklists.ts` contains immutable checklist definitions
2. **Runtime state**: `useChecklist` hook manages item status via LocalStorage-backed state
3. **Component hierarchy**: `page.tsx` → `ChecklistDisplay` → `ChecklistItem` with prop drilling

**Critical**: Never modify `checklists.ts` data directly at runtime. Item completion state lives in `itemStates` (categoryId → checklistId → itemId → status), separate from the definition data.

### Checklist Item Status Model

Items have 4 states (see `types/checklist.ts`):

- `unchecked`: Default state
- `checked`: User completed the item
- `overridden`: Item marked complete without checking (cyan color)
- `checked-overridden`: Both checked AND overridden (cyan color)

**Override behavior**: Allows pilots to skip items in emergency/non-standard situations, mirroring real aviation checklists. Overridden items display in cyan (`--text-cyan`) vs. green (`--text-green`) for normal checks.

### LocalStorage Schema & Migration

Storage key: `checklist-state`
Current version: `2.0.0`

The app includes migration logic in `utils/storage.ts` from v1.0.0 (separate `checklistStates` + `overriddenStates`) to v2.0.0 (unified `itemStates`). When adding features, maintain migration compatibility or increment version.

## Development Workflows

### Running the App

```bash
npm run dev       # Development server at localhost:3000/checklist
npm run build     # Static export to out/ directory
npm run lint      # ESLint check
npm run format    # Prettier formatting
```

**Important**: Because of `basePath: "/checklist"` in `next.config.ts`, always access dev server at `http://localhost:3000/checklist`, not root.

### Adding New Checklists

1. Define in `src/data/checklists.ts` following the `ChecklistCategory` type
2. Set `menuType` to `MenuType.NORMAL` or `MenuType.NON_NORMAL`
3. Each item needs: `id` (unique), `item`, `value`, `completed: false`, `required: true/false`
4. The `required` field controls the gray background indicator (false = auto-check eligible)

Example pattern from existing code:

```typescript
{
  id: "new-category",
  title: "NEW CATEGORY",
  menuType: MenuType.NORMAL,
  checklists: [{
    id: "new-checklist",
    name: "NEW CHECKLIST",
    items: [
      { id: "nc-1", item: "Item name", value: "EXPECTED STATE", completed: false, required: true }
    ]
  }]
}
```

## UI/UX Patterns

### Aviation-Inspired Design

- **Monospaced font**: Barlow Condensed for all UI (mimics cockpit displays)
- **Color coding**:
  - White: Default/unchecked items
  - Green (`--text-green`): Successfully checked items
  - Cyan (`--text-cyan`): Overridden items
  - Yellow: NON-NORMAL menu button text
  - Magenta (`--highlight-magenta`): Active item border

### Component Conventions

- **ChecklistItem dotted line**: Uses `". ".repeat(400)` for the separator line between item and value (aviation checklist aesthetic)
- **Active item tracking**: The `activeItemIndex` always points to the first unchecked item, automatically advancing as items are checked
- **View mode state machine**: `default` → `menu` → `checklist` transitions managed in `page.tsx`

### Styling Approach

Uses Tailwind CSS v4 with custom CSS variables defined in `globals.css`. Prefer inline Tailwind classes over separate CSS modules. Note the custom color syntax: `text-(--text-green)` for CSS var references.

## TypeScript & Type Safety

- **Strict mode enabled**: All components must be properly typed
- **Path aliases**: Use `@/` for `src/` imports (configured in `tsconfig.json`)
- **No client-side rendering**: Mark data-fetching components with `"use client"` (already done in `page.tsx`)
- **Enums for constants**: Use `MenuType` enum instead of string literals

## Hydration Handling

**Critical pattern**: The app carefully manages SSR/client hydration:

```typescript
// In useChecklist.ts - avoid hydration mismatch
const [itemStates, setItemStates] = useState({}); // Start with empty object

useEffect(() => {
  const stored = loadFromStorage();
  if (stored?.itemStates) {
    queueMicrotask(() => setItemStates(stored.itemStates)); // Defer to next microtask
  }
}, []);
```

Always ensure server-rendered output matches initial client render before hydrating with LocalStorage data.

## Testing & Debugging

No automated tests currently. Manual testing workflow:

1. Test both NORMAL and NON-NORMAL flows
2. Verify LocalStorage persistence across page reloads
3. Check override functionality (ITEM OVRD, CHKL OVRD buttons)
4. Test RESETS menu (reset all, reset normal, reset non-normal)
5. Validate `basePath` works in production build (`npm run build` → check `out/` directory)

## Common Pitfalls

- **Don't use `&&` in PowerShell commands**: Use `;` to chain commands in `package.json` scripts
- **Static export limitations**: No ISR, no server-side APIs. Everything must work client-side
- **Mobile viewport**: `viewport.userScalable: false` is intentional for full-screen checklist UX
- **Next button logic**: Only appears when all items are checked AND there's a next checklist in the NORMAL sequence

## External Dependencies

Minimal dependency footprint:

- `next` 16.0.3 (with React 19)
- `tailwindcss` 4.x
- `babel-plugin-react-compiler` for React Compiler optimization

No state management libraries (Redux, Zustand) - intentionally kept simple with React hooks.
