import { MoonIcon, SparklesIcon, SunIcon } from './Icons';
import type { Theme } from '../hooks/useTheme';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onSeedSample: () => void;
  hasTasks: boolean;
}

export function Header({ theme, onToggleTheme, onSeedSample, hasTasks }: HeaderProps) {
  return (
    <header className="animate-fade-up mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3.5">
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30"
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
            <path
              d="M5 12.5 10 17.5 19.5 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Task<span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">Flow</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Plan it. Prioritise it. Get it done.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!hasTasks && (
          <button type="button" onClick={onSeedSample} className="btn-ghost">
            <SparklesIcon className="h-4 w-4" />
            <span>Try sample tasks</span>
          </button>
        )}
        <button
          type="button"
          onClick={onToggleTheme}
          className="btn-ghost !px-3"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
