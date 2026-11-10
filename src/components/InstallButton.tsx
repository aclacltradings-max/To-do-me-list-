import { Button } from './ui/Button';
import { DownloadIcon } from './Icons';

interface InstallButtonProps {
  onClick: () => void;
  /** Compact icon-only rendering for narrow viewports. */
  compact?: boolean;
}

/** Prompts the user to install the app onto their device. */
export function InstallButton({ onClick, compact = false }: InstallButtonProps) {
  if (compact) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Install FinTrack"
        title="Install FinTrack"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-600 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
      >
        <DownloadIcon className="h-5 w-5" />
      </button>
    );
  }

  return (
    <Button
      variant="secondary"
      onClick={onClick}
      className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
    >
      <DownloadIcon className="h-4 w-4" />
      Install
    </Button>
  );
}
