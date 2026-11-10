import type {
  Category,
  CategoryBreakdownRow,
  MonthlySummaryRow,
  Transaction,
  TransactionType,
  TransactionDraft,
  FieldErrors,
  TransactionFilters,
  Totals,
} from '../types';
import { monthKey, parseISODate, relativeMonthLabel } from './format';

/** Sum income, expenses and the resulting balance. */
export function computeTotals(transactions: Transaction[]): Totals {
  let income = 0;
  let expenses = 0;
  for (const t of transactions) {
    if (t.type === 'income') income += t.amount;
    else expenses += t.amount;
  }
  return { income, expenses, balance: income - expenses };
}

/**
 * Newest first. Ties are broken by creation time so freshly added items
 * always land on top, even when several share the same date.
 */
export function sortByDateDesc(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return b.createdAt - a.createdAt;
  });
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  const search = filters.search.trim().toLowerCase();

  return transactions.filter((t) => {
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.categoryId !== 'all' && t.categoryId !== filters.categoryId) return false;
    if (filters.from && t.date < filters.from) return false;
    if (filters.to && t.date > filters.to) return false;
    if (search) {
      const haystack = `${t.description} ${t.categoryId}`.toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.search.trim() !== '' ||
    filters.type !== 'all' ||
    filters.categoryId !== 'all' ||
    filters.from !== '' ||
    filters.to !== ''
  );
}

/** Group transactions into per-month totals, newest month first. */
export function buildMonthlySummary(transactions: Transaction[]): MonthlySummaryRow[] {
  const buckets = new Map<string, MonthlySummaryRow>();

  for (const t of transactions) {
    const key = monthKey(t.date);
    let row = buckets.get(key);
    if (!row) {
      row = { month: key, label: relativeMonthLabel(key), income: 0, expenses: 0, net: 0, count: 0 };
      buckets.set(key, row);
    }
    if (t.type === 'income') row.income += t.amount;
    else row.expenses += t.amount;
    row.count += 1;
  }

  const rows = [...buckets.values()];
  for (const row of rows) row.net = row.income - row.expenses;
  return rows.sort((a, b) => (a.month < b.month ? 1 : -1));
}

/** Totals per category for a given transaction type, largest first, with a share percentage. */
export function buildBreakdown(
  transactions: Transaction[],
  categories: Category[],
  type: TransactionType,
): CategoryBreakdownRow[] {
  const relevant = transactions.filter((t) => t.type === type);
  const total = relevant.reduce((sum, t) => sum + t.amount, 0);
  const buckets = new Map<string, number>();

  for (const t of relevant) {
    buckets.set(t.categoryId, (buckets.get(t.categoryId) ?? 0) + t.amount);
  }

  return [...buckets.entries()]
    .map(([categoryId, value]) => {
      const category = categories.find((c) => c.id === categoryId);
      return {
        categoryId,
        name: category?.name ?? 'Uncategorised',
        color: category?.color ?? 'slate',
        value,
        percent: total > 0 ? (value / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

/** Chart-ready rows for the monthly income vs expense trend. */
export function buildTrendData(transactions: Transaction[], months = 6) {
  const summary = buildMonthlySummary(transactions).slice(0, months).reverse();
  return summary.map((row) => ({
    month: row.month,
    label: row.label === 'This month' ? 'This month' : shortMonth(row.month),
    income: round2(row.income),
    expenses: round2(row.expenses),
    net: round2(row.net),
  }));
}

function shortMonth(month: string): string {
  const [y, m] = month.split('-').map(Number);
  if (!y || !m) return month;
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Validation for the add/edit form. Returns an empty object when valid. */
export function validateDraft(draft: TransactionDraft, categories: Category[]): FieldErrors {
  const errors: FieldErrors = {};

  const raw = draft.amount.trim();
  if (!raw) {
    errors.amount = 'Amount is required.';
  } else if (!/^\d+(\.\d{1,2})?$/.test(raw)) {
    errors.amount = 'Enter a positive number with up to 2 decimal places.';
  } else {
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      errors.amount = 'Amount must be greater than 0.';
    } else if (value > 1_000_000_000) {
      errors.amount = 'Amount is unrealistically large.';
    }
  }

  if (!draft.categoryId) {
    errors.categoryId = 'Please choose a category.';
  } else if (!categories.some((c) => c.id === draft.categoryId && c.type === draft.type)) {
    errors.categoryId = `Pick a ${draft.type} category.`;
  }

  const description = draft.description.trim();
  if (!description) {
    errors.description = 'Description is required.';
  } else if (description.length < 2) {
    errors.description = 'Description must be at least 2 characters.';
  } else if (description.length > 120) {
    errors.description = 'Description must be 120 characters or fewer.';
  }

  if (!draft.date) {
    errors.date = 'Date is required.';
  } else if (!parseISODate(draft.date)) {
    errors.date = 'Enter a valid date.';
  }

  return errors;
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Validate a new category name against existing ones. */
export function validateCategoryName(
  name: string,
  type: Category['type'],
  categories: Category[],
): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Category name is required.';
  if (trimmed.length < 2) return 'Use at least 2 characters.';
  if (trimmed.length > 24) return 'Keep it to 24 characters or fewer.';
  const clash = categories.some(
    (c) => c.type === type && c.name.toLowerCase() === trimmed.toLowerCase(),
  );
  if (clash) return `A ${type} category called “${trimmed}” already exists.`;
  return null;
}
