import type { ReactNode } from 'react';

/** A small pill used for categories, transaction types and counts. */
export function Badge({
  children,
  className = '',
  dot,
}: {
  children: ReactNode;
  className?: string;
  dot?: string;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap',
        className,
      ].join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />}
      {children}
    </span>
  );
}
