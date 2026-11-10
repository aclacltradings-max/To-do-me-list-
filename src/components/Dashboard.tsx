import type { Stats } from '../types';
import { colorTokens } from '../lib/theme';
import { ChartIcon } from './Icons';

interface DashboardProps {
  stats: Stats;
}

interface StatCardProps {
  label: string;
  value: number | string;
  hint: string;
  accent: string;
}

function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div className="card-surface animate-pop relative overflow-hidden p-4">
      <span className={`absolute inset-x-0 top-0 h-1 ${accent}`} aria-hidden="true" />
      <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-extrabold text-slate-900 tabular-nums dark:text-white">
        {value}
      </p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
    </div>
  );
}

function ProgressRing({ percent }: { percent: number }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative grid h-32 w-32 shrink-0 place-items-center">
      <svg viewBox="0 0 100 100" className="h-32 w-32 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="10"
          className="stroke-slate-200 dark:stroke-white/10"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-indigo-500 transition-[stroke-dashoffset] duration-700 ease-out dark:stroke-indigo-400"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-2xl font-extrabold text-slate-900 tabular-nums dark:text-white">
          {percent}%
        </p>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">complete</p>
      </div>
    </div>
  );
}

export function Dashboard({ stats }: DashboardProps) {
  const visibleCategories = stats.byCategory.filter((entry) => entry.total > 0);

  return (
    <section aria-label="Task progress dashboard" className="card-surface animate-fade-up p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <ChartIcon className="h-5 w-5 text-indigo-500" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Dashboard</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-center">
        <div className="flex items-center justify-center gap-5 sm:justify-start">
          <ProgressRing percent={stats.completionRate} />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {stats.completed} of {stats.total} done
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {stats.active === 0 && stats.total > 0
                ? 'All clear — nice work! 🎉'
                : `${stats.active} task${stats.active === 1 ? '' : 's'} remaining`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Total"
            value={stats.total}
            hint="All tasks"
            accent="bg-gradient-to-r from-indigo-500 to-violet-500"
          />
          <StatCard
            label="Active"
            value={stats.active}
            hint="Still to do"
            accent="bg-gradient-to-r from-sky-500 to-cyan-500"
          />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            hint="Past the deadline"
            accent="bg-gradient-to-r from-rose-500 to-red-500"
          />
          <StatCard
            label="Due today"
            value={stats.dueToday}
            hint="Needs attention"
            accent="bg-gradient-to-r from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {visibleCategories.length > 0 && (
        <div className="mt-6 border-t border-slate-200/70 pt-5 dark:border-white/10">
          <p className="mb-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
            Progress by category
          </p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {visibleCategories.map(({ category, total, completed }) => {
              const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
              const tokens = colorTokens(category.color);
              return (
                <li key={category.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                      <span className={`h-2.5 w-2.5 rounded-full ${tokens.solid}`} aria-hidden="true" />
                      {category.name}
                    </span>
                    <span className="text-slate-500 tabular-nums dark:text-slate-400">
                      {completed}/{total} · {percent}%
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10"
                    role="progressbar"
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${category.name} progress`}
                  >
                    <div
                      className={`h-full rounded-full ${tokens.solid} transition-[width] duration-700 ease-out`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}
