# FinTrack — Personal Finance Tracker

A clean, modern, offline-first web app for tracking income and expenses. Built with
**React 19**, **TypeScript**, **Vite** and **Tailwind CSS v4**. No backend, no API keys,
no accounts — everything lives in your browser's `localStorage`.

![Stack](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)

## Features

- **Dashboard** — total income, total expenses and available balance (income − expenses),
  plus a savings-rate indicator and a "this month" breakdown.
- **Add transactions** — income or expense, amount, category, description and date
  (defaults to today, with Today / Yesterday / A week ago shortcuts).
- **Edit** any transaction from the history list.
- **Delete** any transaction, behind a confirmation dialog.
- **Categories** — separate income and expense categories, with create, rename and delete,
  plus a colour picker. Deleting a category warns you how many transactions it affects.
- **Transaction history** — newest first, grouped by day with per-day net totals, and a
  clear visual distinction between income (green, ↑) and expenses (red, ↓).
- **Search & filter** — search descriptions, filter by type, category and a date range,
  with a live match count.
- **Monthly summary** — income, expenses and net per month, with comparison bars.
- **Charts** — a 6-month income vs. expenses bar chart and a category breakdown donut
  (toggle between expenses and income), powered by [Recharts](https://recharts.org/).
- **Validation** — every field is validated with clear, inline error messages that clear
  as you fix them.
- **Persistence** — transactions, categories and theme are saved to `localStorage`.
- **Responsive** — mobile-first, with a floating action button on small screens and a
  multi-column layout on desktop.
- **Dark mode** — follows your OS by default, with a manual toggle that is remembered.

## Getting started

Requires Node.js 20+ and npm.

```bash
npm install     # install dependencies
npm run dev     # start the dev server (http://localhost:5173)
npm run build   # type-check and build for production into dist/
npm run preview # preview the production build locally
npm run lint    # type-check only (tsc --noEmit)
```

## Project structure

```
.
├── index.html
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── charts/
│   │   │   └── ChartsPanel.tsx     # Recharts bar + donut, lazy-loaded
│   │   ├── ui/                     # Reusable primitives
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Field.tsx           # Label + hint + error wrapper
│   │   │   └── Modal.tsx           # Focus-trapping, scroll-locking dialog
│   │   ├── CategoryManager.tsx     # Add / rename / delete categories
│   │   ├── Dashboard.tsx           # Income, expenses, balance cards
│   │   ├── FilterBar.tsx           # Search, type, category, date range
│   │   ├── Header.tsx              # Branding, theme toggle, add button
│   │   ├── Icons.tsx               # Inline SVG icon set (no icon library)
│   │   ├── MonthlySummary.tsx      # Totals per month
│   │   ├── TransactionForm.tsx     # Add/edit form with validation
│   │   ├── TransactionItem.tsx     # One row in the history list
│   │   └── TransactionList.tsx     # Grouped, sorted history list
│   ├── hooks/
│   │   ├── useFinance.ts           # Transactions + categories store, CRUD, seeds
│   │   ├── useLocalStorage.ts      # Generic persisted state
│   │   └── useTheme.ts             # Dark mode with OS fallback
│   ├── utils/
│   │   ├── colors.ts               # Category colour palette (class + hex)
│   │   ├── finance.ts              # Totals, filtering, summaries, validation
│   │   └── format.ts               # Currency / date formatting helpers
│   ├── App.tsx                     # Layout and wiring
│   ├── index.css                   # Tailwind entry + theme tokens
│   ├── main.tsx                    # React entry point
│   ├── types.ts                    # Transaction, Category, filters, summaries
│   └── vite-env.d.ts
├── tsconfig.json                   # References app + node configs
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## How it works

### Data model

Two TypeScript interfaces drive everything (`src/types.ts`):

```ts
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;        // always positive; `type` decides the sign
  categoryId: string;
  description: string;
  date: string;          // 'YYYY-MM-DD', local timezone
  createdAt: number;
  updatedAt: number;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: ColorToken;
}
```

Amounts are stored as positive numbers with the direction carried by `type`, which keeps
summing simple and avoids sign errors. Dates are stored as plain `YYYY-MM-DD` strings
rather than `Date` objects so they survive JSON round-trips and never shift across
timezones.

### State and persistence

`useFinance` is the single source of truth. It holds two arrays — transactions and
categories — each backed by `useLocalStorage`, which reads once on mount and writes on
every change under the keys `fintrack.transactions.v1`, `fintrack.categories.v1` and
`fintrack.theme.v1`. Corrupt or missing values fall back to sensible defaults, so a bad
entry can never crash the app.

All mutations are plain functions exposed by the hook: `addTransaction`,
`updateTransaction`, `deleteTransaction`, `addCategory`, `renameCategory`,
`deleteCategory`, `loadSampleData` and `clearAllTransactions`.

### Derived data

Nothing derived is stored. `src/utils/finance.ts` computes everything on the fly with
`useMemo`:

| Function | Purpose |
| --- | --- |
| `computeTotals` | Income, expenses and balance |
| `filterTransactions` | Applies search, type, category and date range |
| `sortByDateDesc` | Newest first, ties broken by creation time |
| `buildMonthlySummary` | Totals per month |
| `buildBreakdown` | Per-category totals with share percentages |
| `buildTrendData` | Chart-ready rows for the last 6 months |
| `validateDraft` | Field-level validation for the form |

Because the list, the monthly summary and both charts all read from the same filtered
array, applying a filter updates the whole page consistently.

### Validation

`validateDraft` returns a `FieldErrors` object. The form validates on submit, then
re-validates on every keystroke so errors disappear as soon as they are fixed. Errors are
rendered inside an `aria-live` region and wired to inputs via `aria-invalid`, so they are
announced by screen readers. Rules cover: amount is a positive number with at most two
decimals, the category exists and matches the transaction type, description is 2–120
characters, and the date is a real calendar date.

### Accessibility and UX

- Modals trap focus, close on Escape or backdrop click, lock background scroll, and
  restore focus to the element that opened them.
- Income and expenses are distinguished by colour **and** icon **and** sign, never colour
  alone.
- Charts are lazy-loaded so Recharts stays out of the initial bundle.

## Notes

- Data is per-browser and per-origin. Clearing site data or switching browsers starts you
  fresh. There is no sync and no server.
- "Load sample data" fills the app with a few months of example transactions — handy for
  seeing the charts, and available only while you have no transactions of your own.
