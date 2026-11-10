/** A transaction is either money coming in (income) or going out (expense). */
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Always a positive number. The `type` field decides the sign. */
  amount: number;
  categoryId: string;
  description: string;
  /** ISO date string in `YYYY-MM-DD` form (no time component). */
  date: string;
  createdAt: number;
  updatedAt: number;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  /** Tailwind colour token used for chips and charts. */
  color: ColorToken;
}

/** A curated palette so categories always look consistent and readable. */
export type ColorToken =
  | 'indigo'
  | 'sky'
  | 'emerald'
  | 'teal'
  | 'amber'
  | 'orange'
  | 'rose'
  | 'pink'
  | 'violet'
  | 'cyan'
  | 'lime'
  | 'slate';

/** The shape the transaction form works with, before validation. */
export interface TransactionDraft {
  type: TransactionType;
  amount: string;
  categoryId: string;
  description: string;
  date: string;
}

export type FieldErrors = Partial<Record<keyof TransactionDraft, string>>;

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  categoryId: string | 'all';
  from: string;
  to: string;
}

export interface MonthlySummaryRow {
  /** `YYYY-MM` */
  month: string;
  label: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
}

export interface CategoryBreakdownRow {
  categoryId: string;
  name: string;
  color: ColorToken;
  value: number;
  percent: number;
}

export interface Totals {
  income: number;
  expenses: number;
  balance: number;
}
