import { WifiOffIcon } from './Icons';

/** Shown when the browser reports no connectivity. */
export function OfflineBanner() {
  return (
    <div
      role="status"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <span className="inline-flex items-center gap-2">
        <WifiOffIcon className="h-4 w-4" />
        You are offline — FinTrack still works, and your changes are saved locally.
      </span>
    </div>
  );
}
