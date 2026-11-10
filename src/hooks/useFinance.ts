import { useCallback, useMemo } from 'react';
import type { Category, Transaction, TransactionDraft, TransactionType } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { todayISO } from '../utils/format';

export const TASKS_STORAGE_KEY = 'fintrack.transactions.v1';
export const CATEGORIES_STORAGE_KEY = 'fintrack.categories.v1';

const INCOME_SEED: Category[] = [
  { id: 'inc-salary', name: 'Salary', type: 'income', color: 'emerald' },
  { id: 'inc-freelance', name: 'Freelance', type: 'income', color: 'teal' },
  { id: 'inc-investments', name: 'Investments', type: 'income', color: 'lime' },
  { id: 'inc-gifts', name: 'Gifts', type: 'income', color: 'cyan' },
];

const EXPENSE_SEED: Category[] = [
  { id: 'exp-housing', name: 'Housing', type: 'expense', color: 'indigo' },
  { id: 'exp-groceries', name: 'Groceries', type: 'expense', color: 'amber' },
  { id: 'exp-transport', name: 'Transport', type: 'expense', color: 'sky' },
  { id: 'exp-dining', name: 'Dining out', type: 'expense', color: 'orange' },
  { id: 'exp-utilities', name: 'Utilities', type: 'expense', color: 'violet' },
  { id: 'exp-health', name: 'Health', type: 'expense', color: 'rose' },
  { id: 'exp-entertainment', name: 'Entertainment', type: 'expense', color: 'pink' },
];

export const DEFAULT_CATEGORIES: Category[] = [...INCOME_SEED, ...EXPENSE_SEED];

/** Short, collision-resistant id — no dependency needed. */
function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function useFinance() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>(TASKS_STORAGE_KEY, []);
  const [categories, setCategories] = useLocalStorage<Category[]>(
    CATEGORIES_STORAGE_KEY,
    DEFAULT_CATEGORIES,
  );

  /** Categories split by type, kept in insertion order. */
  const categoriesByType = useMemo(
    () => ({
      income: categories.filter((c) => c.type === 'income'),
      expense: categories.filter((c) => c.type === 'expense'),
    }),
    [categories],
  );

  const addTransaction = useCallback(
    (draft: TransactionDraft) => {
      const now = Date.now();
      const transaction: Transaction = {
        id: createId('txn'),
        type: draft.type,
        amount: Number(draft.amount),
        categoryId: draft.categoryId,
        description: draft.description.trim(),
        date: draft.date,
        createdAt: now,
        updatedAt: now,
      };
      setTransactions((current) => [transaction, ...current]);
      return transaction;
    },
    [setTransactions],
  );

  const updateTransaction = useCallback(
    (id: string, draft: TransactionDraft) => {
      setTransactions((current) =>
        current.map((t) =>
          t.id === id
            ? {
                ...t,
                type: draft.type,
                amount: Number(draft.amount),
                categoryId: draft.categoryId,
                description: draft.description.trim(),
                date: draft.date,
                updatedAt: Date.now(),
              }
            : t,
        ),
      );
    },
    [setTransactions],
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions((current) => current.filter((t) => t.id !== id));
    },
    [setTransactions],
  );

  const clearAllTransactions = useCallback(() => setTransactions([]), [setTransactions]);

  const addCategory = useCallback(
    (name: string, type: TransactionType, color: Category['color']) => {
      const category: Category = { id: createId('cat'), name: name.trim(), type, color };
      setCategories((current) => [...current, category]);
      return category;
    },
    [setCategories],
  );

  const renameCategory = useCallback(
    (id: string, name: string) => {
      setCategories((current) =>
        current.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)),
      );
    },
    [setCategories],
  );

  /** Removes a category and any transactions that used it. */
  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((current) => current.filter((c) => c.id !== id));
      setTransactions((current) => current.filter((t) => t.categoryId !== id));
    },
    [setCategories, setTransactions],
  );

  const restoreDefaultCategories = useCallback(() => {
    setCategories(DEFAULT_CATEGORIES);
  }, [setCategories]);

  /** Replaces everything with a small demo dataset, handy for a first look. */
  const loadSampleData = useCallback(() => {
    const now = new Date();
    const iso = (monthsAgo: number, day: number) => {
      const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, day);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    };
    const stamp = Date.now();
    const make = (
      type: TransactionType,
      amount: number,
      categoryId: string,
      description: string,
      date: string,
      offset: number,
    ): Transaction => ({
      id: `txn_sample_${offset}`,
      type,
      amount,
      categoryId,
      description,
      date,
      createdAt: stamp - offset * 1000,
      updatedAt: stamp - offset * 1000,
    });

    setCategories(DEFAULT_CATEGORIES);
    setTransactions([
      make('income', 5200, 'inc-salary', 'Monthly salary', iso(0, 1), 1),
      make('expense', 1450, 'exp-housing', 'Rent', iso(0, 2), 2),
      make('expense', 320.5, 'exp-groceries', 'Weekly groceries', iso(0, 5), 3),
      make('expense', 96.4, 'exp-transport', 'Fuel and transit pass', iso(0, 8), 4),
      make('expense', 78.25, 'exp-dining', 'Dinner with friends', iso(0, 12), 5),
      make('expense', 140, 'exp-utilities', 'Electricity and water', iso(0, 14), 6),
      make('income', 850, 'inc-freelance', 'Landing page project', iso(0, 18), 7),
      make('expense', 60, 'exp-entertainment', 'Streaming subscriptions', iso(0, 20), 8),
      make('income', 5200, 'inc-salary', 'Monthly salary', iso(1, 1), 9),
      make('expense', 1450, 'exp-housing', 'Rent', iso(1, 2), 10),
      make('expense', 410.75, 'exp-groceries', 'Groceries', iso(1, 9), 11),
      make('expense', 210, 'exp-health', 'Dentist visit', iso(1, 16), 12),
      make('income', 5200, 'inc-salary', 'Monthly salary', iso(2, 1), 13),
      make('expense', 1450, 'exp-housing', 'Rent', iso(2, 2), 14),
      make('expense', 355.2, 'exp-groceries', 'Groceries', iso(2, 11), 15),
      make('income', 1200, 'inc-investments', 'Dividend payout', iso(2, 22), 16),
    ]);
  }, [setCategories, setTransactions]);

  /** An empty draft for the "add" flow, dated today. */
  const emptyDraft = useCallback(
    (type: TransactionType = 'expense'): TransactionDraft => ({
      type,
      amount: '',
      categoryId: '',
      description: '',
      date: todayISO(),
    }),
    [],
  );

  const draftFrom = useCallback(
    (transaction: Transaction): TransactionDraft => ({
      type: transaction.type,
      amount: String(transaction.amount),
      categoryId: transaction.categoryId,
      description: transaction.description,
      date: transaction.date,
    }),
    [],
  );

  return {
    transactions,
    categories,
    categoriesByType,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    clearAllTransactions,
    addCategory,
    renameCategory,
    deleteCategory,
    restoreDefaultCategories,
    loadSampleData,
    emptyDraft,
    draftFrom,
  };
}

export type FinanceStore = ReturnType<typeof useFinance>;
