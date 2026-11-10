import { useEffect, useMemo, useState } from 'react';
import type { Category, ColorToken, Transaction, TransactionDraft, FieldErrors, TransactionType } from '../types';
import { validateDraft, hasErrors, validateCategoryName } from '../utils/finance';
import { COLOR_TOKENS, colorStyle } from '../utils/colors';
import { formatCurrency, todayISO } from '../utils/format';
import { Button } from './ui/Button';
import { Field } from './ui/Field';
import { ArrowDownIcon, ArrowUpIcon, CheckIcon, PlusIcon, TagIcon } from './Icons';

interface TransactionFormProps {
  /** Present when editing, absent when adding. */
  transaction?: Transaction | null;
  categories: Category[];
  draft: TransactionDraft;
  onChange: (draft: TransactionDraft) => void;
  onSubmit: (draft: TransactionDraft) => void;
  onCancel: () => void;
  onAddCategory: (name: string, type: TransactionType, color: ColorToken) => Category;
}

export function TransactionForm({
  transaction,
  categories,
  draft,
  onChange,
  onSubmit,
  onCancel,
  onAddCategory,
}: TransactionFormProps) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Category-creation sub-form state.
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<ColorToken>('indigo');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const isEditing = Boolean(transaction);
  const availableCategories = useMemo(
    () => categories.filter((c) => c.type === draft.type),
    [categories, draft.type],
  );

  // Re-validate live once the user has attempted a submit, so errors clear as they fix them.
  useEffect(() => {
    if (submitted) setErrors(validateDraft(draft, categories));
  }, [draft, categories, submitted]);

  const set = <K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  const handleTypeChange = (type: TransactionType) => {
    // A category from the other type can't stay selected.
    const stillValid = categories.some((c) => c.id === draft.categoryId && c.type === type);
    onChange({ ...draft, type, categoryId: stillValid ? draft.categoryId : '' });
    setShowNewCategory(false);
    setCategoryError(null);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    const nextErrors = validateDraft(draft, categories);
    setErrors(nextErrors);
    if (hasErrors(nextErrors)) return;
    onSubmit(draft);
  };

  const handleCreateCategory = () => {
    const error = validateCategoryName(newCategoryName, draft.type, categories);
    if (error) {
      setCategoryError(error);
      return;
    }
    const created = onAddCategory(newCategoryName, draft.type, newCategoryColor);
    set('categoryId', created.id);
    setNewCategoryName('');
    setNewCategoryColor('indigo');
    setCategoryError(null);
    setShowNewCategory(false);
  };

  const amountValue = Number(draft.amount);
  const previewValid = draft.amount.trim() !== '' && Number.isFinite(amountValue) && amountValue > 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Type toggle */}
      <fieldset>
        <legend className="label-text">Type</legend>
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <TypeButton
            active={draft.type === 'income'}
            onClick={() => handleTypeChange('income')}
            tone="income"
            icon={<ArrowUpIcon className="h-4 w-4" />}
            label="Income"
          />
          <TypeButton
            active={draft.type === 'expense'}
            onClick={() => handleTypeChange('expense')}
            tone="expense"
            icon={<ArrowDownIcon className="h-4 w-4" />}
            label="Expense"
          />
        </div>
      </fieldset>

      <Field label="Amount" htmlFor="amount" error={errors.amount} required>
        <div className="relative">
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-sm font-medium text-slate-400">
            $
          </span>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            autoComplete="off"
            placeholder="0.00"
            value={draft.amount}
            onChange={(e) => set('amount', e.target.value)}
            aria-invalid={Boolean(errors.amount)}
            aria-describedby={errors.amount ? 'amount-error' : undefined}
            className={`field pl-8 text-base font-semibold tabular-nums ${errors.amount ? 'field-error' : ''}`}
          />
        </div>
      </Field>

      {/* Category */}
      <Field label="Category" error={errors.categoryId} required>
        <div className="flex gap-2">
          <select
            id="category"
            name="category"
            value={draft.categoryId}
            onChange={(e) => set('categoryId', e.target.value)}
            aria-invalid={Boolean(errors.categoryId)}
            className={`field flex-1 ${errors.categoryId ? 'field-error' : ''}`}
          >
            <option value="">Select a {draft.type} category…</option>
            {availableCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setShowNewCategory((v) => !v);
              setCategoryError(null);
            }}
            aria-expanded={showNewCategory}
            title="Create a new category"
            className="shrink-0 px-3"
          >
            <TagIcon className="h-4 w-4" />
            <span className="sr-only">Create category</span>
          </Button>
        </div>
        {availableCategories.length === 0 && (
          <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
            No {draft.type} categories yet — create one below.
          </p>
        )}
      </Field>

      {showNewCategory && (
        <div className="animate-fade-in rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-700 dark:bg-slate-800/50">
          <p className="mb-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200">
            New {draft.type} category
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => {
                setNewCategoryName(e.target.value);
                setCategoryError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateCategory();
                }
              }}
              placeholder="e.g. Subscriptions"
              aria-label="New category name"
              aria-invalid={Boolean(categoryError)}
              className={`field sm:flex-1 ${categoryError ? 'field-error' : ''}`}
            />
            <Button type="button" onClick={handleCreateCategory} className="shrink-0">
              <PlusIcon className="h-4 w-4" />
              Add
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {COLOR_TOKENS.map((token) => (
              <button
                key={token}
                type="button"
                onClick={() => setNewCategoryColor(token)}
                aria-label={`Use ${token} colour`}
                aria-pressed={newCategoryColor === token}
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 transition ring-offset-slate-50 dark:ring-offset-slate-800',
                  colorStyle(token).bg,
                  newCategoryColor === token ? 'ring-2 ring-slate-900 dark:ring-white' : 'hover:scale-110',
                ].join(' ')}
              >
                {newCategoryColor === token && <CheckIcon className="h-4 w-4 text-white" />}
              </button>
            ))}
          </div>
          {categoryError && (
            <p className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400" aria-live="polite">
              {categoryError}
            </p>
          )}
        </div>
      )}

      <Field
        label="Description"
        htmlFor="description"
        error={errors.description}
        hint={!errors.description ? 'What was this for? e.g. "Weekly groceries"' : undefined}
        required
      >
        <input
          id="description"
          name="description"
          type="text"
          autoComplete="off"
          maxLength={140}
          placeholder="Weekly groceries"
          value={draft.description}
          onChange={(e) => set('description', e.target.value)}
          aria-invalid={Boolean(errors.description)}
          className={`field ${errors.description ? 'field-error' : ''}`}
        />
      </Field>

      <Field label="Date" htmlFor="date" error={errors.date} required>
        <input
          id="date"
          name="date"
          type="date"
          value={draft.date}
          onChange={(e) => set('date', e.target.value)}
          aria-invalid={Boolean(errors.date)}
          className={`field ${errors.date ? 'field-error' : ''}`}
        />
        <div className="mt-2 flex flex-wrap gap-2">
          <QuickDate label="Today" onClick={() => set('date', todayISO())} active={draft.date === todayISO()} />
          <QuickDate
            label="Yesterday"
            onClick={() => set('date', shiftDays(-1))}
            active={draft.date === shiftDays(-1)}
          />
          <QuickDate label="A week ago" onClick={() => set('date', shiftDays(-7))} active={draft.date === shiftDays(-7)} />
        </div>
      </Field>

      {/* Live preview of what will be saved */}
      {previewValid && (
        <div className="rounded-xl bg-slate-50 px-3.5 py-3 text-sm dark:bg-slate-800/50">
          <span className="text-slate-500 dark:text-slate-400">Preview: </span>
          <span
            className={`font-semibold tabular-nums ${
              draft.type === 'income'
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {draft.type === 'income' ? '+' : '−'}
            {formatCurrency(amountValue)}
          </span>
          <span className="text-slate-500 dark:text-slate-400">
            {' '}
            {draft.type === 'income' ? 'added to' : 'taken from'} your balance
          </span>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} block className="sm:w-auto">
          Cancel
        </Button>
        <Button type="submit" block className="sm:w-auto">
          {isEditing ? 'Save changes' : 'Add transaction'}
        </Button>
      </div>
    </form>
  );
}

function TypeButton({
  active,
  onClick,
  tone,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  tone: 'income' | 'expense';
  icon: React.ReactNode;
  label: string;
}) {
  const activeClass =
    tone === 'income'
      ? 'bg-white text-emerald-700 shadow-sm dark:bg-slate-900 dark:text-emerald-400'
      : 'bg-white text-rose-700 shadow-sm dark:bg-slate-900 dark:text-rose-400';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        'flex h-10 items-center justify-center gap-2 rounded-lg text-sm font-semibold transition',
        active ? activeClass : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  );
}

function QuickDate({ label, onClick, active }: { label: string; onClick: () => void; active: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg border px-2.5 py-1 text-xs font-medium transition',
        active
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400/50 dark:bg-indigo-500/10 dark:text-indigo-300'
          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
      ].join(' ')}
    >
      {label}
    </button>
  );
}

/** Local helper: ISO date N days from today. */
function shiftDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}
