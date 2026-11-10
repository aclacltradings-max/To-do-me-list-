import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a form control with its label, optional hint and error message.
 * The error is rendered in an `aria-live` region so screen readers announce it.
 */
export function Field({ label, htmlFor, error, hint, required, children, className = '' }: FieldProps) {
  return (
    <div className={className}>
      <label className="label-text" htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-rose-500" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      <div aria-live="polite">
        {error && (
          <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
            <span aria-hidden="true">•</span>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
