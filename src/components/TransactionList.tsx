import { useMemo } from 'react';
import type { Category, Transaction } from '../types';
import { sortByDateDesc } from '../utils/finance';
import { formatCurrency, relativeDayLabel } from '../utils/format';
import { TransactionItem } from './TransactionItem';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { InboxIcon, SearchIcon } from './Icons';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  /** True when filters are narrowing the list, which changes the empty state. */
  filtered: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
  onAdd: () => void;
  onResetFilters: () => void;
  onLoadSample: () => void;
}

export function TransactionList({
  transactions,
  categories,
  filtered,
  onEdit,
  onDelete,
  onAdd,
  onResetFilters,
  onLoadSample,
}: TransactionListProps) {
  const sorted = useMemo(() => sortByDateDesc(transactions), [transactions]);

  /**
   * Group by date so the list reads like a statement. Because `sorted` is already
   * newest-first, the groups come out in the right order too.
   */
  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const t of sorted) {
      const list = map.get(t.date);
      if (list) list.push(t);
      else map.set(t.date, [t]);
    }
    return [...map.entries()];
  }, [sorted]);

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const netTotal = useMemo(
    () =>
      sorted.reduce((sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount), 0),
    [sorted],
  );

  if (sorted.length === 0) {
    return (
      <section className="card overflow-hidden">
        {filtered ? (
          <EmptyState
            icon={<SearchIcon className="h-6 w-6" />}
            title="No matching transactions"
            message="Try a different search term, widen the date range, or clear the filters to see everything."
            action={
              <Button variant="secondary" onClick={onResetFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<InboxIcon className="h-6 w-6" />}
            title="No transactions yet"
            message="Add your first income or expense to start tracking your balance. Everything stays in your browser."
            action={
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={onAdd}>Add your first transaction</Button>
                <Button variant="secondary" onClick={onLoadSample}>
                  Load sample data
                </Button>
              </div>
            }
          />
        )}
      </section>
    );
  }

  return (
    <section className="card overflow-hidden" aria-label="Transaction history">
      <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3.5 sm:px-5 dark:border-slate-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Transaction history
        </h2>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Net of shown</p>
          <p
            className={[
              'text-sm font-bold tabular-nums',
              netTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
            ].join(' ')}
          >
            {netTotal >= 0 ? '+' : '−'}
            {formatCurrency(Math.abs(netTotal))}
          </p>
        </div>
      </header>

      <ul className="divide-y divide-slate-100 dark:divide-slate-800">
        {groups.map(([date, items]) => {
          const dayNet = items.reduce(
            (sum, t) => (t.type === 'income' ? sum + t.amount : sum - t.amount),
            0,
          );
          const relative = relativeDayLabel(date);

          return (
            <li key={date} className="list-none">
              <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-2 sm:px-5 dark:bg-slate-800/40">
                <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                  {relative ?? new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span
                  className={[
                    'text-xs font-semibold tabular-nums',
                    dayNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
                  ].join(' ')}
                >
                  {dayNet >= 0 ? '+' : '−'}
                  {formatCurrency(Math.abs(dayNet))}
                </span>
              </div>
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((transaction) => (
                  <TransactionItem
                    key={transaction.id}
                    transaction={transaction}
                    category={categoryById.get(transaction.categoryId)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
