import type { Category, Filters, PriorityFilter, SortKey, StatusFilter } from '../types';
import { ALL_CATEGORY_ID } from '../lib/taskUtils';
import { colorTokens } from '../lib/theme';
import { SearchIcon } from './Icons';

interface FilterBarProps {
  filters: Filters;
  categories: Category[];
  counts: { all: number; active: number; completed: number };
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
}

const STATUS_TABS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

const PRIORITY_OPTIONS: Array<{ key: PriorityFilter; label: string }> = [
  { key: 'all', label: 'Any priority' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'due', label: 'Due date' },
  { key: 'priority', label: 'Priority' },
  { key: 'created', label: 'Newest' },
  { key: 'alpha', label: 'A → Z' },
];

export function FilterBar({ filters, categories, counts, onChange, onReset }: FilterBarProps) {
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.categoryId !== ALL_CATEGORY_ID ||
    filters.sort !== 'due';

  return (
    <section aria-label="Search and filters" className="card-surface animate-fade-up space-y-4 p-4 sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search tasks by title or notes…"
            aria-label="Search tasks"
            className="field pl-9"
          />
        </div>

        <div className="flex gap-2">
          <select
            className="field"
            value={filters.priority}
            onChange={(event) => onChange({ priority: event.target.value as PriorityFilter })}
            aria-label="Filter by priority"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            className="field"
            value={filters.sort}
            onChange={(event) => onChange({ sort: event.target.value as SortKey })}
            aria-label="Sort tasks"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex rounded-xl border border-slate-200 bg-white/70 p-1 dark:border-white/10 dark:bg-white/5"
          role="tablist"
          aria-label="Task status"
        >
          {STATUS_TABS.map((tab) => {
            const active = filters.status === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange({ status: tab.key })}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 tabular-nums ${active ? 'opacity-80' : 'opacity-60'}`}>
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ categoryId: ALL_CATEGORY_ID })}
            className={`chip transition ${
              filters.categoryId === ALL_CATEGORY_ID
                ? 'border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'border-slate-200 bg-white/70 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
            }`}
          >
            All categories
          </button>
          {categories.map((category) => {
            const active = filters.categoryId === category.id;
            const tokens = colorTokens(category.color);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onChange({ categoryId: category.id })}
                className={`chip transition ${
                  active
                    ? 'border-transparent bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : `${tokens.chip} hover:brightness-105`
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-current' : tokens.solid}`}
                  aria-hidden="true"
                />
                {category.name}
              </button>
            );
          })}
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="ml-auto text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-300"
          >
            Reset filters
          </button>
        )}
      </div>
    </section>
  );
}
