import { Button } from './ui/Button';
import { InstallButton } from './InstallButton';
import { MenuIcon, MoonIcon, PlusIcon, SunIcon, WalletIcon } from './Icons';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onAdd: () => void;
  onToggleMenu?: () => void;
  /** True when the app can be installed on this device. */
  canInstall?: boolean;
  onInstall?: () => void;
}

export function Header({
  isDark,
  onToggleTheme,
  onAdd,
  onToggleMenu,
  canInstall = false,
  onInstall,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 pt-[env(safe-area-inset-top)] backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        {onToggleMenu && (
          <button
            type="button"
            onClick={onToggleMenu}
            aria-label="Open menu"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-sm">
            <WalletIcon className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              FinTrack
            </p>
            <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">
              Personal finance tracker
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {canInstall && onInstall && (
            <>
              <span className="hidden sm:inline-flex">
                <InstallButton onClick={onInstall} />
              </span>
              <span className="sm:hidden">
                <InstallButton compact onClick={onInstall} />
              </span>
            </>
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </button>
          {/* The button's base `inline-flex` outranks the `hidden` utility in the
              compiled stylesheet, so hiding is done on a wrapper instead. */}
          <span className="hidden sm:inline-flex">
            <Button onClick={onAdd}>
              <PlusIcon className="h-4 w-4" />
              Add transaction
            </Button>
          </span>
        </div>
      </div>
    </header>
  );
}
