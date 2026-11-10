# FinTrack — Personal Finance Tracker

A clean, modern, offline-first app for tracking income and expenses. Built with
**React 19**, **TypeScript**, **Vite** and **Tailwind CSS v4**. No backend, no API keys,
no accounts — everything lives in local storage on your own device.

It runs **three ways from one codebase**:

| Platform | How it ships |
| --- | --- |
| **Web / PWA** | Installable from the browser — own window, works offline |
| **Android** | A real installable APK (Capacitor) |
| **Desktop** | Native app for Linux (AppImage / `.deb`) and Windows (Electron) |

![Stack](https://img.shields.io/badge/React-19-61dafb) ![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8) ![PWA](https://img.shields.io/badge/PWA-installable-5a0fc8) ![Android](https://img.shields.io/badge/Android-APK-3ddc84) ![Electron](https://img.shields.io/badge/Desktop-Electron-47848f)

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
- **Installable (PWA)** — an Install button in the header (or the browser's own install
  control) adds it to your home screen or desktop. A service worker caches the app so it
  opens and works with no network connection.
- **Offline-aware** — a banner appears when you lose connectivity, reassuring you that
  changes are still being saved locally.

## Downloads

Prebuilt installers are attached to the [**v1.0.0 release**](https://github.com/aclacltradings-max/To-do-me-list-/releases/tag/v1.0.0):

| Platform | File | Install |
| --- | --- | --- |
| Android | `FinTrack-1.0.0-debug.apk` | Open the file on your phone and allow installs from your browser/file manager. |
| Linux (portable) | `FinTrack-1.0.0.AppImage` | `chmod +x` the file, then run it. No install needed. |
| Linux (Debian/Ubuntu) | `fintrack_1.0.0_amd64.deb` | `sudo apt install ./fintrack_1.0.0_amd64.deb` |
| Windows | `FinTrack-Setup-1.0.0.exe` | Run the installer. Unsigned, so SmartScreen may ask you to confirm. |

The Android and Windows builds are unsigned/debug and meant for personal use. macOS
builds must be produced on macOS (`npm run electron:build:mac`).

## Installing the app

FinTrack ships as a PWA and as native apps for Android and desktop. All three use the
same code and the same local-storage data model; pick whichever suits your device.

### Web / PWA

Once installed it launches in its own window, appears in your app list, and works offline.

| Platform | How to install |
| --- | --- |
| **Chrome / Edge / Android** | Click the **Install** button in the header, or the install icon in the address bar. |
| **iOS Safari** | Tap **Share** → **Add to Home Screen**. (The in-app dialog shows these steps.) |
| **Desktop browser** | Use the install icon in the address bar, or the browser menu → *Install FinTrack*. |

Installation requires the app to be served over **HTTPS** (or `localhost`). The dev server
serves over HTTP, so the service worker only registers in a production build:

```bash
npm run build
npm run preview   # then open the printed URL
```

### Android

A Capacitor project wraps the same web build into a normal Android app.

```bash
npm run android:apk      # debug APK → android/app/build/outputs/apk/debug/app-debug.apk
npm run android:release  # unsigned release APK (sign it before distributing)
```

Install the debug build on a connected device or emulator:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

Requirements: **JDK 17 or newer** and the **Android SDK** (platform 35, build-tools
35.0.0). Point Gradle at your SDK with `android/local.properties`:

```properties
sdk.dir=/path/to/Android/Sdk
```

### Desktop

An Electron shell runs the same web build in a native window, served over a loopback HTTP
origin so local storage and code-splitting behave exactly as they do on the web.

```bash
npm run electron:dev          # build and launch the desktop app
npm run electron:build:linux  # AppImage + .deb → release/
npm run electron:build:win    # NSIS installer → release/ (build on Windows, or with wine)
npm run electron:build:mac    # DMG → release/ (must be built on macOS)
```

Output lands in the git-ignored `release/` directory.

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
├── index.html                      # Meta tags, manifest link, theme colour
├── capacitor.config.ts             # Android packaging config
├── electron/
│   └── main.cjs                    # Desktop main process + loopback static server
├── scripts/
│   └── generate-icons.py           # Regenerates app icons and Android splashes
├── build/
│   └── icon.png                    # Source icon for the desktop installers
├── android/                        # Generated Capacitor Android project
├── public/
│   ├── manifest.webmanifest        # PWA metadata (name, icons, display)
│   ├── sw.js                       # Service worker — offline caching
│   ├── favicon.svg
│   ├── favicon-48.png
│   ├── icon-192.png                # PWA icons (any purpose)
│   ├── icon-512.png
│   ├── icon-maskable-192.png       # PWA icons (maskable / Android adaptive)
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png        # iOS home-screen icon
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
│   │   │   ├── Modal.tsx           # Focus-trapping, scroll-locking dialog
│   │   │   └── Toast.tsx           # Transient bottom-of-screen message
│   │   ├── CategoryManager.tsx     # Add / rename / delete categories
│   │   ├── Dashboard.tsx           # Income, expenses, balance cards
│   │   ├── FilterBar.tsx           # Search, type, category, date range
│   │   ├── Header.tsx              # Branding, install, theme toggle, add button
│   │   ├── Icons.tsx               # Inline SVG icon set (no icon library)
│   │   ├── InstallButton.tsx       # Triggers the install prompt
│   │   ├── InstallDialog.tsx       # Platform-aware install instructions
│   │   ├── MonthlySummary.tsx      # Totals per month
│   │   ├── OfflineBanner.tsx       # Shown when connectivity is lost
│   │   ├── TransactionForm.tsx     # Add/edit form with validation
│   │   ├── TransactionItem.tsx     # One row in the history list
│   │   └── TransactionList.tsx     # Grouped, sorted history list
│   ├── hooks/
│   │   ├── useFinance.ts           # Transactions + categories store, CRUD, seeds
│   │   ├── useInstallPrompt.ts     # beforeinstallprompt handling
│   │   ├── useLocalStorage.ts      # Generic persisted state
│   │   ├── useOnlineStatus.ts      # Connectivity tracking
│   │   └── useTheme.ts             # Dark mode with OS fallback
│   ├── utils/
│   │   ├── colors.ts               # Category colour palette (class + hex)
│   │   ├── finance.ts              # Totals, filtering, summaries, validation
│   │   └── format.ts               # Currency / date formatting helpers
│   ├── App.tsx                     # Layout and wiring
│   ├── index.css                   # Tailwind entry + theme tokens
│   ├── main.tsx                    # React entry point + service worker
│   ├── pwa.ts                      # Service worker registration
│   ├── types.ts                    # Transaction, Category, filters, summaries
│   └── vite-env.d.ts
├── tsconfig.json                   # References app + node configs
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Packaging for Android and desktop

The web build in `dist/` is the single artifact that all three targets consume, so there
is no platform-specific application code to keep in sync.

### Android (Capacitor)

`capacitor.config.ts` points Capacitor at `dist/`. `npm run android:apk` builds the web
app, copies `dist/` into the Android project, and runs Gradle to produce an APK. Capacitor
serves the files from a local `https://` origin inside the WebView, which means the app
gets a secure origin (so local storage and other secure-context APIs behave normally) and
needs no service worker to work offline.

The launcher icons and splash screens are generated by `scripts/generate-icons.py` — edit
that script and re-run it rather than hand-editing the many PNGs.

### Desktop (Electron)

`electron/main.cjs` starts a small HTTP server bound to `127.0.0.1` on a random free port
and loads the app from there. Serving over HTTP rather than `file://` gives the page a
real origin, so `localStorage` and the lazy-loaded charts chunk work identically to the
web build. The server only ever reads from `dist/` and falls back to `index.html` for
unknown paths, so it behaves like a normal single-page-app host.

`electron-builder` (configured under the `build` key in `package.json`) turns that into an
AppImage and a `.deb` on Linux, an NSIS installer on Windows, and a DMG on macOS.

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

### Installability and offline support

The PWA layer has three parts.

**The manifest** (`public/manifest.webmanifest`) declares the app name, colours and icons.
Two icon sets are shipped: regular icons for browsers, and **maskable** icons with the
artwork inside the safe zone so Android can crop them to any shape without clipping.

**The service worker** (`public/sw.js`) caches the app so it works offline. It uses a
different strategy per request type:

| Request | Strategy | Why |
| --- | --- | --- |
| Page navigations | Network first, fall back to the cached shell | Users get fresh content when online, and the app still opens when offline |
| `/assets/*` | Cache first | Vite fingerprints these filenames, so a cached file can never be stale |
| Everything else | Stale-while-revalidate | Fast responses, refreshed in the background |

Cached entries live under `fintrack-v1`. Bumping `CACHE_VERSION` in `sw.js` retires the old
cache on the next activation. The worker is registered from `src/pwa.ts`, and **only in
production builds** — caching Vite's dev modules would break hot reloading.

**The install UI** (`useInstallPrompt`, `InstallButton`, `InstallDialog`) handles the
platform differences:

- Chrome, Edge and Android fire `beforeinstallprompt`, so the header shows an **Install**
  button that opens the browser's native prompt.
- That event fires before React mounts, so it is captured at module load and buffered for
  the hook to consume.
- iOS Safari never fires it, so the dialog shows step-by-step "Add to Home Screen"
  instructions instead.
- A prompt event is single-use; the hook guards against calling `prompt()` twice, which
  would throw.
- If the app is already running standalone, the button is hidden.

## Notes

- Data is per-browser and per-origin. Clearing site data or switching browsers starts you
  fresh. There is no sync and no server.
- "Load sample data" fills the app with a few months of example transactions — handy for
  seeing the charts, and available only while you have no transactions of your own.
