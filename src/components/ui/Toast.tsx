import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from '../Icons';

interface ToastProps {
  open: boolean;
  onClose: () => void;
  icon?: ReactNode;
  children: ReactNode;
  /** Auto-dismiss after this many milliseconds. */
  duration?: number;
}

/** A transient message pinned to the bottom of the viewport. */
export function Toast({ open, onClose, icon, children, duration = 6000 }: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(id);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="animate-fade-in fixed bottom-5 left-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm -translate-x-1/2"
    >
      <div className="flex items-start gap-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-slate-800">
        {icon && <span className="mt-0.5 shrink-0 text-emerald-400">{icon}</span>}
        <p className="flex-1">{children}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
