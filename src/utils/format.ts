/** Format a number as currency (USD by default). */
export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Compact form used on chart axes so labels never overflow. */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** `2026-11-10` -> `10 Nov 2026` */
export function formatDate(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** `2026-11-10` -> `Mon, 10 Nov` */
export function formatDateShort(iso: string): string {
  const date = parseISODate(iso);
  if (!date) return iso;
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

/** `2026-11` -> `November 2026` */
export function formatMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Today's date as `YYYY-MM-DD` in the user's local timezone. */
export function todayISO(): string {
  return toISODate(new Date());
}

/** Local-timezone `Date` -> `YYYY-MM-DD`. Avoids the UTC shift of toISOString(). */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parse `YYYY-MM-DD` into a local-timezone Date. Returns null when invalid. */
export function parseISODate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** `YYYY-MM-DD` -> `YYYY-MM` */
export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

/** Human-friendly relative label for a date, e.g. "Today". */
export function relativeDayLabel(iso: string): string | null {
  const today = todayISO();
  if (iso === today) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === toISODate(yesterday)) return 'Yesterday';
  return null;
}

/** A friendly label for a `YYYY-MM` month relative to now. */
export function relativeMonthLabel(month: string): string {
  const now = new Date();
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (month === current) return 'This month';
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previous = `${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`;
  if (month === previous) return 'Last month';
  return formatMonth(month);
}
