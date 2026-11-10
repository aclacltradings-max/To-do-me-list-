import { useState } from 'react';
import type { Category, CategoryBreakdownRow, Transaction } from '../../types';
import { buildBreakdown, buildTrendData, computeTotals } from '../../utils/finance';
import { colorStyle } from '../../utils/colors';
import { formatCompact, formatCurrency } from '../../utils/format';
import { EmptyState } from '../ui/EmptyState';
import { ChartIcon } from '../Icons';

interface ChartsPanelProps {
  transactions: Transaction[];
  categories: Category[];
}

type BreakdownMode = 'expense' | 'income';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function ChartsPanel({ transactions, categories }: ChartsPanelProps) {
  const [mode, setMode] = useState<BreakdownMode>('expense');

  const totals = computeTotals(transactions);
  const breakdown = buildBreakdown(transactions, categories, mode);
  const trend = buildTrendData(transactions, 6);

  const hasTrendData = trend.some((row) => row.income > 0 || row.expenses > 0);
  const hasBreakdown = breakdown.length > 0;

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2" aria-label="Charts">
      {/* Monthly trend */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Monthly trend
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Income vs expenses, last 6 months
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" aria-hidden="true" />
              Income
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-sm bg-rose-500" aria-hidden="true" />
              Expenses
            </span>
          </div>
        </div>

        <div className="mt-4 h-64 w-full">
          {hasTrendData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-slate-800" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-slate-500"
                />
                <YAxis
                  tickFormatter={(value: number) => formatCompact(value)}
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  className="text-slate-500"
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'currentColor', className: 'text-slate-100 dark:text-slate-800', opacity: 0.4 }} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={38} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState
              icon={<ChartIcon className="h-6 w-6" />}
              title="No data to chart"
              message="Add a few transactions across different months and the trend will appear here."
            />
          )}
        </div>
      </div>

      {/* Category breakdown */}
      <div className="card p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Breakdown by category
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {mode === 'expense' ? 'Where your money goes' : 'Where your money comes from'}
            </p>
          </div>
          <div
            role="group"
            aria-label="Choose breakdown type"
            className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800"
          >
            {(['expense', 'income'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setMode(option)}
                aria-pressed={mode === option}
                className={[
                  'rounded-md px-3.5 py-1.5 text-xs font-semibold capitalize transition pointer-coarse:py-3.5',
                  mode === option
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
                ].join(' ')}
              >
                {option === 'expense' ? 'Expenses' : 'Income'}
              </button>
            ))}
          </div>
        </div>

        {hasBreakdown ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={breakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="55%"
                    outerRadius="85%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {breakdown.map((row) => (
                      <Cell key={row.categoryId} fill={colorStyle(row.color).hex} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip showPercent />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <ul className="space-y-2.5 self-center">
              {breakdown.slice(0, 7).map((row) => (
                <BreakdownRow key={row.categoryId} row={row} total={mode === 'expense' ? totals.expenses : totals.income} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState
              icon={<ChartIcon className="h-6 w-6" />}
              title={`No ${mode === 'expense' ? 'expenses' : 'income'} yet`}
              message={`Add ${mode === 'expense' ? 'an expense' : 'some income'} to see this breakdown.`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function BreakdownRow({ row, total }: { row: CategoryBreakdownRow; total: number }) {
  const style = colorStyle(row.color);
  const percent = total > 0 ? (row.value / total) * 100 : 0;

  return (
    <li>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.bg}`} aria-hidden="true" />
          <span className="truncate font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
        </span>
        <span className="shrink-0 font-semibold text-slate-900 tabular-nums dark:text-slate-100">
          {formatCurrency(row.value)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full ${style.bg}`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <span className="w-10 shrink-0 text-right text-xs font-medium text-slate-500 tabular-nums dark:text-slate-400">
          {percent.toFixed(0)}%
        </span>
      </div>
    </li>
  );
}

/** Shared tooltip so both charts format currency consistently. */
function ChartTooltip({
  active,
  payload,
  label,
  showPercent = false,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; payload?: { percent?: number; name?: string } }>;
  label?: string | number;
  showPercent?: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-900">
      {label !== undefined && (
        <p className="mb-1 font-semibold text-slate-900 dark:text-slate-100">{label}</p>
      )}
      {payload.map((entry, index) => {
        const name = entry.payload?.name ?? entry.name ?? '';
        const percent = entry.payload?.percent;
        return (
          <p key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className="font-medium">{name}</span>
            <span className="font-semibold text-slate-900 tabular-nums dark:text-slate-100">
              {formatCurrency(entry.value ?? 0)}
            </span>
            {showPercent && typeof percent === 'number' && (
              <span className="text-slate-500 dark:text-slate-400">({percent.toFixed(0)}%)</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

