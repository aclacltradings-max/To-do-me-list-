import { useState } from 'react';
import type { Category, ColorToken, Transaction, TransactionType } from '../types';
import { colorStyle, COLOR_TOKENS } from '../utils/colors';
import { validateCategoryName } from '../utils/finance';
import { formatCurrency } from '../utils/format';
import { Button } from './ui/Button';
import { PlusIcon, TagIcon, TrashIcon, PencilIcon, CheckIcon, CloseIcon } from './Icons';

interface CategoryManagerProps {
  categories: Category[];
  categoriesByType: { income: Category[]; expense: Category[] };
  transactions: Transaction[];
  onAdd: (name: string, type: TransactionType, color: ColorToken) => Category;
  onRename: (id: string, name: string) => void;
  onDelete: (category: Category) => void;
}

export function CategoryManager({
  categories,
  categoriesByType,
  transactions,
  onAdd,
  onRename,
  onDelete,
}: CategoryManagerProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [name, setName] = useState('');
  const [color, setColor] = useState<ColorToken>('indigo');
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const usage = (categoryId: string) => transactions.filter((t) => t.categoryId === categoryId).length;
  const totalFor = (categoryId: string) =>
    transactions.filter((t) => t.categoryId === categoryId).reduce((sum, t) => sum + t.amount, 0);

  const handleAdd = (event: React.FormEvent) => {
    event.preventDefault();
    const message = validateCategoryName(name, type, categories);
    if (message) {
      setError(message);
      return;
    }
    onAdd(name, type, color);
    setName('');
    setColor('indigo');
    setError(null);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditValue(category.name);
    setError(null);
  };

  const commitEdit = (category: Category) => {
    const message = validateCategoryName(
      editValue,
      category.type,
      categories.filter((c) => c.id !== category.id),
    );
    if (message) {
      setError(message);
      return;
    }
    onRename(category.id, editValue);
    setEditingId(null);
    setError(null);
  };

  return (
    <section className="card p-5" aria-label="Categories">
      <div className="flex items-center gap-2">
        <TagIcon className="h-4 w-4 text-slate-400" />
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Categories</h2>
      </div>

      {/* Add a category */}
      <form onSubmit={handleAdd} className="mt-3.5 space-y-3">
        <div className="flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-800">
          {(['expense', 'income'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setType(option);
                setError(null);
              }}
              aria-pressed={type === option}
              className={[
                'flex-1 rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition pointer-coarse:py-3.5',
                type === option
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            placeholder={`New ${type} category…`}
            aria-label="New category name"
            aria-invalid={Boolean(error)}
            className={`field ${error ? 'field-error' : ''}`}
          />
          <Button type="submit" aria-label="Add category" className="shrink-0 px-3">
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {COLOR_TOKENS.map((token) => (
            <button
              key={token}
              type="button"
              onClick={() => setColor(token)}
              aria-label={`Use ${token} colour`}
              aria-pressed={color === token}
              className={[
                'flex h-6 w-6 items-center justify-center rounded-full ring-offset-2 transition ring-offset-white pointer-coarse:h-11 pointer-coarse:w-11 dark:ring-offset-slate-900',
                colorStyle(token).bg,
                color === token ? 'ring-2 ring-slate-900 dark:ring-white' : 'hover:scale-110',
              ].join(' ')}
            >
              {color === token && <CheckIcon className="h-3.5 w-3.5 text-white" />}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-xs font-medium text-rose-600 dark:text-rose-400" aria-live="polite">
            {error}
          </p>
        )}
      </form>

      {/* Existing categories, grouped by type */}
      <div className="mt-5 space-y-4">
        {(['expense', 'income'] as const).map((group) => (
          <div key={group}>
            <p className="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase dark:text-slate-500">
              {group === 'expense' ? 'Expense categories' : 'Income categories'}
            </p>
            <ul className="space-y-1.5">
              {categoriesByType[group].map((category) => {
                const style = colorStyle(category.color);
                const count = usage(category.id);
                const isEditing = editingId === category.id;

                return (
                  <li
                    key={category.id}
                    className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${style.bg}`} aria-hidden="true" />

                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={editValue}
                          autoFocus
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitEdit(category);
                            } else if (e.key === 'Escape') {
                              setEditingId(null);
                              setError(null);
                            }
                          }}
                          aria-label={`Rename ${category.name}`}
                          className="field h-9 flex-1 py-0 text-sm pointer-coarse:h-11"
                        />
                        <button
                          type="button"
                          onClick={() => commitEdit(category)}
                          aria-label="Save name"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 pointer-coarse:h-11 pointer-coarse:w-11 dark:hover:bg-emerald-500/10"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(null);
                            setError(null);
                          }}
                          aria-label="Cancel rename"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 pointer-coarse:h-11 pointer-coarse:w-11 dark:hover:bg-slate-700"
                        >
                          <CloseIcon className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                          {category.name}
                        </span>
                        <span className="shrink-0 text-xs text-slate-400 tabular-nums dark:text-slate-500">
                          {count > 0 ? formatCurrency(totalFor(category.id)) : '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(category)}
                          aria-label={`Rename ${category.name}`}
                          title="Rename"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 pointer-coarse:h-11 pointer-coarse:w-11 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                        >
                          <PencilIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(category)}
                          aria-label={`Delete ${category.name}`}
                          title="Delete"
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 pointer-coarse:h-11 pointer-coarse:w-11 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                        >
                          <TrashIcon className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
              {categoriesByType[group].length === 0 && (
                <li className="px-2 py-1.5 text-xs text-slate-400 dark:text-slate-500">
                  No {group} categories yet.
                </li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
