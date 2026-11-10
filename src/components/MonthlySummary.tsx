import { useMemo } from 'react';
import type { MonthlySummaryRow } from '../types';
import { buildMonthlySummary } from '../utils/finance';
import { formatCurrency } from '../utils/format';
import { EmptyState } from './ui/EmptyState';
import { CalendarIcon } from './Icons';

interface MonthlySummaryProps {
  /** Already filtered, so the summary follows the active search/filters. */
  transactions: Parameters<typeof buildMonthlySummary>[0];
}

export function MonthlySummary({ transactions }: MonthlySummaryProps) {
  const rows = useMemo(() => buildMonthlySummary(transactions), [transactions]);
  const maxValue = useMemo(
    () => rows.reduce((max, row) => Math.max(max, row.income, row.expenses), 0),
    [rows],
  );

  return (
    <section className="card overflow-hidden" aria-label="Monthly summary">
      <header className="border-b border-slate-200 px-5 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Monthly summary</h2>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Totals per month, newest first
        </p>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="h-6 w-6" />}
          title="No months to summarise"
          message="Once you add transactions, each month's totals will be listed here."
        />
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {rows.map((row) => (
            <MonthRow key={row.month} row={row} maxValue={maxValue} />
          ))}
        </ul>
      )}
    </section>
  );
}

function MonthRow({ row, maxValue }: { row: MonthlySummaryRow; maxValue: number }) {
  const incomeWidth = maxValue > 0 ? (row.income / maxValue) * 100 : 0;
  const expenseWidth = maxValue > 0 ? (row.expenses / maxValue) * 100 : 0;

  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{row.label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {row.count} transaction{row.count === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xs text-slate-500 dark:text-slate-400">Net</span>
          <span
            className={[
              'text-sm font-bold tabular-nums',
              row.net >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
            ].join(' ')}
          >
            {row.net >= 0 ? '+' : '−'}
            {formatCurrency(Math.abs(row.net))}
          </span>
        </div>
      </div>

      {/* Paired bars give an at-a-glance comparison across months. */}
      <div className="mt-2.5 space-y-1.5">
        <Bar label="Income" value={row.income} width={incomeWidth} className="bg-emerald-500" />
        <Bar label="Expenses" value={row.expenses} width={expenseWidth} className="bg-rose-500" />
      </div>
    </li>
  );
}

function Bar({
  label,
  value,
  width,
  className,
}: {
  label: string;
  value: number;
  width: number;
  className: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${className} transition-all duration-500`}
          style={{ width: `${Math.max(width, value > 0 ? 2 : 0)}%` }}
        />
      </div>
      <span className="w-24 shrink-0 text-right text-xs font-semibold text-slate-700 tabular-nums dark:text-slate-200">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
