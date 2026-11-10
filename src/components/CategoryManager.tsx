import { useState } from 'react';
import type { Category, ColorKey } from '../types';
import { COLOR_KEYS, colorTokens } from '../lib/theme';
import { CloseIcon, PlusIcon, TagIcon } from './Icons';

interface CategoryManagerProps {
  categories: Category[];
  taskCountByCategory: Record<string, number>;
  onAdd: (name: string, color: ColorKey) => void;
  onDelete: (id: string) => void;
}

export function CategoryManager({
  categories,
  taskCountByCategory,
  onAdd,
  onDelete,
}: CategoryManagerProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<ColorKey>('violet');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed, color);
    setName('');
  }

  return (
    <section aria-label="Categories" className="card-surface animate-fade-up p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <TagIcon className="h-5 w-5 text-indigo-500" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Categories</h2>
      </div>

      <ul className="mb-4 flex flex-wrap gap-1.5">
        {categories.map((category) => {
          const tokens = colorTokens(category.color);
          const count = taskCountByCategory[category.id] ?? 0;
          const canDelete = categories.length > 1;
          return (
            <li
              key={category.id}
              className={`chip group ${tokens.chip} ${tokens.ring} pr-1.5 focus-within:ring-4`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${tokens.solid}`} aria-hidden="true" />
              <span>{category.name}</span>
              <span className="text-[10px] opacity-70 tabular-nums">{count}</span>
              {canDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(category.id)}
                  aria-label={`Delete ${category.name} category`}
                  title={`Delete ${category.name}`}
                  className="ml-0.5 grid h-4 w-4 place-items-center rounded-full transition hover:bg-black/10 dark:hover:bg-white/15"
                >
                  <CloseIcon className="h-3 w-3" />
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <input
            className="field"
            placeholder="New category name…"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="New category name"
            maxLength={24}
          />
          <button type="submit" className="btn-primary shrink-0 !px-3" aria-label="Add category">
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {COLOR_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setColor(key)}
              aria-label={`Use ${key} colour`}
              aria-pressed={color === key}
              className={`h-6 w-6 rounded-full transition ${colorTokens(key).solid} ${
                color === key
                  ? 'ring-2 ring-slate-900 ring-offset-2 ring-offset-white dark:ring-white dark:ring-offset-slate-900'
                  : 'opacity-60 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </form>
    </section>
  );
}
