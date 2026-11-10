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
  components/ui/      Button, Field, Modal, ConfirmDialog, Badge, EmptyState, Toast
  components/charts/  ChartsPanel (Recharts; lazy-loaded from App.tsx)
  components/         Header, Dashboard, FilterBar, TransactionList/Item,
                      TransactionForm, MonthlySummary, CategoryManager, Icons,
                      InstallButton, InstallDialog, OfflineBanner
  hooks/              useFinance (store + CRUD), useLocalStorage, useTheme,
                      useInstallPrompt, useOnlineStatus
  utils/              finance.ts (calc/validation), format.ts, colors.ts
  pwa.ts              service worker registration (production only)
  types.ts            Transaction, Category, filters, summaries
```

`ChartsPanel` is dynamically imported so Recharts stays out of the main bundle.
Keep it that way — it is ~400 kB.

## PWA / installability

The app is installable. Four moving parts, and they must stay consistent:

- `public/manifest.webmanifest` — name, colours, icons. `display: standalone`.
- `public/sw.js` — the offline cache. `CACHE_VERSION` at the top must be bumped whenever
  the caching behaviour changes, otherwise returning users keep the old cache.
- `src/pwa.ts` — registers the worker. **Guarded by `import.meta.env.PROD` on purpose**:
  in dev, Vite serves modules on demand and caching them breaks hot reload. So the service
  worker cannot be tested with `npm run dev` — use `npm run build && npm run preview`.
- `src/hooks/useInstallPrompt.ts` — captures `beforeinstallprompt`.

Icons are committed as PNGs in `public/`. They were generated once by a throwaway script
(pure-Python PNG writer, no image libraries available in the sandbox). If you need to
change the logo, either regenerate them with any image tool or hand-edit; don't expect
`favicon.svg` and the PNGs to update each other.

Installing requires HTTPS or `localhost`. The sandbox proxy host is HTTPS, so the install
button appears there.

### Install prompt gotchas

- `beforeinstallprompt` fires before React mounts, so it is captured in a module-level
  variable at import time and buffered. Don't move that listener inside the hook.
- The event is single-use. `prompt()` called twice throws, so the hook has an
  `awaitingChoice` guard. React StrictMode will happily double-invoke effects — keep the
  guard.
- iOS Safari never fires the event, so `showInstall` also returns true on iOS and the
  dialog falls back to manual instructions.

## localStorage keys

- `fintrack.transactions.v1`
- `fintrack.categories.v1`
- `fintrack.theme.v1`

## Gotchas

- `npm install` may warn that esbuild's postinstall script is not approved. If the build
  then fails, run `npm install-scripts approve esbuild`.
- Vite config pins `server`/`preview` to port 12000 with `host: true` and
  `allowedHosts: true` so the sandbox proxy hosts work. Don't remove these.
