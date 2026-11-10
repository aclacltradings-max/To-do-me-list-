# TaskFlow

A modern, stylish To-Do List app built with **React**, **TypeScript**, **Vite** and **Tailwind CSS**.

TaskFlow helps you plan your day with priorities, deadlines, categories, search, filters and a
progress dashboard — all saved automatically in your browser.

## Features

- **Add, edit and delete tasks** through a clean modal form.
- **Mark tasks as completed** with one click.
- **Priorities** (High / Medium / Low) with colour-coded chips.
- **Deadlines** with quick picks (Today, Tomorrow, Next week) and overdue highlighting.
- **Categories** — use the built-in ones or create your own with a colour of your choice.
- **Search and filter** by text, status, priority, category and sort order.
- **Dashboard** with completion rate, active / overdue / due-today counts and per-category progress bars.
- **localStorage persistence** — your tasks stay in your browser, no account needed.
- **Dark mode** that follows your system preference and remembers your choice.
- **Fully responsive** layout that works on phones, tablets and desktops.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL in your browser.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check and build for production into `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run the TypeScript type checker. |

## Project structure

```
src/
├── components/        UI building blocks
│   ├── CategoryManager.tsx
│   ├── ConfirmDialog.tsx
│   ├── Dashboard.tsx
│   ├── FilterBar.tsx
│   ├── Header.tsx
│   ├── Icons.tsx
│   ├── TaskForm.tsx
│   ├── TaskItem.tsx
│   └── TaskList.tsx
├── hooks/
│   ├── useLocalStorage.ts
│   ├── useTasks.ts
│   └── useTheme.ts
├── lib/
│   ├── taskUtils.ts   Filtering, sorting, stats and date helpers
│   └── theme.ts       Colour and priority tokens
├── App.tsx
├── index.css
├── main.tsx
└── types.ts
```

## Notes

- All data is stored under the `taskflow.*` keys in `localStorage`.
- Dates are handled in your local timezone, so "Today" always means today where you are.
- The app works offline once loaded.

## Tech stack

- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
