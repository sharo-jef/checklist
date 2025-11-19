# checklist Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-19

## Active Technologies
- TypeScript 5.x with strict mode enabled + React 19.2.0, Next.js 16.0.3 (static export) (005-extract-storage-logic)
- Browser LocalStorage (client-side only, key: "checklist-state") (005-extract-storage-logic)

- TypeScript 5.x with React 19.2.0 + Next.js 16.0.3, React 19.2.0, Tailwind CSS 4.x (003-extract-page-logic)
- LocalStorage (client-side only, version 2.0.0 schema) (003-extract-page-logic)

- TypeScript 5.x with React 19.2.0 and Next.js 16.0.3 + Next.js (static export), React 19, Tailwind CSS 4.x, React Compiler (001-consolidate-status-logic)

## Project Structure

```text
src/
  app/
  components/
  data/
  hooks/
  types/
  utils/
public/
next.config.js
tailwind.config.js
tsconfig.json
package.json
```

## Commands

npm run dev # Development server at localhost:3000/checklist
npm run build # Static export to out/ directory
npm run lint # ESLint check
npm run format # Prettier formatting

## Code Style

TypeScript 5.x with React 19.2.0 and Next.js 16.0.3: Follow standard conventions

## Recent Changes
- 005-extract-storage-logic: Added TypeScript 5.x with strict mode enabled + React 19.2.0, Next.js 16.0.3 (static export)

- 003-extract-page-logic: Added TypeScript 5.x with React 19.2.0 + Next.js 16.0.3, React 19.2.0, Tailwind CSS 4.x

- 001-consolidate-status-logic: Added TypeScript 5.x with React 19.2.0 and Next.js 16.0.3 + Next.js (static export), React 19, Tailwind CSS 4.x, React Compiler

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
