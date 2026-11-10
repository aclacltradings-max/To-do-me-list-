# AGENTS.md

Repository memory for AI agents. Keep this current.

## Project

**FinTrack** — a client-side personal finance tracker (income/expense tracking).
No backend, no API keys. All data lives in `localStorage`.

Stack: React 19, TypeScript 5.9, Vite 7, Tailwind CSS v4 (`@tailwindcss/vite`),
Recharts 3.

This repo was originally a to-do list app ("TaskFlow") and was replaced wholesale.
Legacy `taskflow.*` localStorage keys may still exist in browsers from that era;
the app does not read them. Ignore them.

## Commands

```bash
npm install          # deps
npm run dev          # dev server, port 12000 (host: true, allowedHosts: true)
npm run build        # tsc -b && vite build
npm run lint         # tsc -b --noEmit  (type-check only)
npm run preview      # serve dist/ on port 12000
```

Always run `npm run build` before declaring work done — it type-checks and bundles.

## Conventions

- **Tailwind v4**: theme via `@theme` and `@utility` in `src/index.css`. Dark mode is
  class-based (`@custom-variant dark (&:where(.dark, .dark *))`) and toggled by adding
  `.dark` to `<html>`.
- **Shared class tokens** defined in `src/index.css`: `card`, `field`, `field-error`,
  `label-text`, `animate-fade-in`. Use these instead of re-typing long utility strings.
- **Derived data is never stored.** `src/utils/finance.ts` computes totals, filters,
  summaries and breakdowns; `App.tsx` memoises them.
- **Dates** are `YYYY-MM-DD` strings in local time, never `Date` objects in state.
  Use helpers in `src/utils/format.ts` (`todayISO`, `toISODate`, `parseISODate`) —
  avoid `toISOString()`, which shifts timezone.
- **Amounts** are always positive; direction comes from `Transaction.type`.
- **Type-only imports** required (`verbatimModuleSyntax` is on).
- `noUnusedLocals` / `noUnusedParameters` are on — dead code fails the build.
- **Accessibility**: don't convey meaning by colour alone (income/expense use colour +
  icon + sign). Errors go in `aria-live` regions.

## Layout

```
src/
  components/ui/      Button, Field, Modal, ConfirmDialog, Badge, EmptyState
  components/charts/  ChartsPanel (Recharts; lazy-loaded from App.tsx)
  components/         Header, Dashboard, FilterBar, TransactionList/Item,
                      TransactionForm, MonthlySummary, CategoryManager, Icons
  hooks/              useFinance (store + CRUD), useLocalStorage, useTheme
  utils/              finance.ts (calc/validation), format.ts, colors.ts
  types.ts            Transaction, Category, filters, summaries
```

`ChartsPanel` is dynamically imported so Recharts stays out of the main bundle.
Keep it that way — it is ~400 kB.

## localStorage keys

- `fintrack.transactions.v1`
- `fintrack.categories.v1`
- `fintrack.theme.v1`

## Gotchas

- `npm install` may warn that esbuild's postinstall script is not approved. If the build
  then fails, run `npm install-scripts approve esbuild`.
- Vite config pins `server`/`preview` to port 12000 with `host: true` and
  `allowedHosts: true` so the sandbox proxy hosts work. Don't remove these.
