import type { ReactNode } from 'react';
import type { Totals } from '../types';
import { formatCurrency } from '../utils/format';
import { ArrowDownIcon, ArrowUpIcon, ScaleIcon, TrendDownIcon, TrendUpIcon } from './Icons';

interface DashboardProps {
  totals: Totals;
  /** Totals for the same calendar month a year ago, used for the balance hint. */
  monthTotals: Totals;
  transactionCount: number;
  currency?: string;
}

export function Dashboard({ totals, monthTotals, transactionCount, currency = 'USD' }: DashboardProps) {
  const savingsRate = totals.income > 0 ? (totals.balance / totals.income) * 100 : 0;

  return (
    <section aria-label="Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total income"
        value={formatCurrency(totals.income, currency)}
        icon={<ArrowUpIcon className="h-5 w-5" />}
        accent="emerald"
        footer={
          <Hint>
            {transactionCount === 0
              ? 'No transactions yet'
              : `Across ${transactionCount} transaction${transactionCount === 1 ? '' : 's'}`}
          </Hint>
        }
      />

      <StatCard
        label="Total expenses"
        value={formatCurrency(totals.expenses, currency)}
        icon={<ArrowDownIcon className="h-5 w-5" />}
        accent="rose"
        footer={<Hint>Spent across all categories</Hint>}
      />

      <StatCard
        label="Available balance"
        value={formatCurrency(totals.balance, currency)}
        icon={<ScaleIcon className="h-5 w-5" />}
        accent={totals.balance >= 0 ? 'indigo' : 'amber'}
        footer={
          <Hint
            tone={savingsRate >= 0 ? 'up' : 'down'}
            icon={savingsRate >= 0 ? <TrendUpIcon className="h-3.5 w-3.5" /> : <TrendDownIcon className="h-3.5 w-3.5" />}
          >
            {totals.income > 0
              ? `${savingsRate >= 0 ? 'Saving' : 'Overspending'} ${Math.abs(savingsRate).toFixed(1)}% of income`
              : 'Add income to see your savings rate'}
          </Hint>
        }
        highlight
      />

      {/* Secondary row: this month vs. all time, useful context on wide screens. */}
      <div className="card col-span-1 p-5 sm:col-span-2 lg:col-span-3">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">This month</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
            <MiniStat label="Income" value={formatCurrency(monthTotals.income, currency)} tone="income" />
            <MiniStat label="Expenses" value={formatCurrency(monthTotals.expenses, currency)} tone="expense" />
            <MiniStat label="Net" value={formatCurrency(monthTotals.balance, currency)} tone="net" />
          </div>
        </div>
      </div>
    </section>
  );
}

const ACCENTS = {
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
} as const;

function StatCard({
  label,
  value,
  icon,
  accent,
  footer,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent: keyof typeof ACCENTS;
  footer: ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className={[
        'card animate-fade-in p-5',
        highlight ? 'ring-1 ring-indigo-500/20 dark:ring-indigo-400/20' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${ACCENTS[accent]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 tabular-nums sm:text-3xl dark:text-slate-50">
        {value}
      </p>
      <div className="mt-2">{footer}</div>
    </div>
  );
}

function Hint({
  children,
  tone = 'neutral',
  icon,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'up' | 'down';
  icon?: ReactNode;
}) {
  const toneClass =
    tone === 'up'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'down'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-slate-500 dark:text-slate-400';

  return (
    <p className={`flex items-center gap-1.5 text-xs font-medium ${toneClass}`}>
      {icon}
      {children}
    </p>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: 'income' | 'expense' | 'net' }) {
  const toneClass =
    tone === 'income'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'expense'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-slate-900 dark:text-slate-100';

  return (
    <div className="flex items-baseline gap-2">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${toneClass}`}>{value}</span>
    </div>
  );
}
