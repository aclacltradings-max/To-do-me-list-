import type { Category, TransactionFilters } from '../types';
import { hasActiveFilters } from '../utils/finance';
import { Button } from './ui/Button';
import { CloseIcon, FilterIcon, SearchIcon } from './Icons';

interface FilterBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  onReset: () => void;
  categories: Category[];
  /** Number of rows currently matching, shown as feedback. */
  resultCount: number;
  totalCount: number;
}

export function FilterBar({
  filters,
  onChange,
  onReset,
  categories,
  resultCount,
  totalCount,
}: FilterBarProps) {
  const active = hasActiveFilters(filters);

  const set = <K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) =>
    onChange({ ...filters, [key]: value });

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FilterIcon className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Search &amp; filter</h2>
        </div>
        {active && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <CloseIcon className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      <div className="mt-3.5 space-y-3">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
            placeholder="Search descriptions…"
            aria-label="Search transactions by description"
            className="field pl-10"
          />
        </div>

        {/* Type + category */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="filter-type">
              Type
            </label>
            <select
              id="filter-type"
              value={filters.type}
              onChange={(e) => set('type', e.target.value as TransactionFilters['type'])}
              className="field"
            >
              <option value="all">All types</option>
              <option value="income">Income only</option>
              <option value="expense">Expenses only</option>
            </select>
          </div>

          <div>
            <label className="label-text" htmlFor="filter-category">
              Category
            </label>
            <select
              id="filter-category"
              value={filters.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              className="field"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label-text" htmlFor="filter-from">
              From date
            </label>
            <input
              id="filter-from"
              type="date"
              value={filters.from}
              max={filters.to || undefined}
              onChange={(e) => set('from', e.target.value)}
              className="field"
            />
          </div>
          <div>
            <label className="label-text" htmlFor="filter-to">
              To date
            </label>
            <input
              id="filter-to"
              type="date"
              value={filters.to}
              min={filters.from || undefined}
              onChange={(e) => set('to', e.target.value)}
              className="field"
            />
          </div>
        </div>

        {filters.from && filters.to && filters.from > filters.to && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400" aria-live="polite">
            The start date is after the end date, so no results will match.
          </p>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-200">{resultCount}</span> of{' '}
          {totalCount} transaction{totalCount === 1 ? '' : 's'}
        </p>
      </div>
    </div>
  );
}
