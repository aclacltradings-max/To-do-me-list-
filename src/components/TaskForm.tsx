import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category, Priority, Task, TaskDraft } from '../types';
import { PRIORITY_ORDER, PRIORITIES } from '../lib/theme';
import { addDaysISO, todayISO } from '../lib/taskUtils';
import { CalendarIcon, CheckIcon, CloseIcon, FlagIcon, TagIcon } from './Icons';

interface TaskFormProps {
  /** When provided the form edits that task, otherwise it creates a new one. */
  task?: Task | null;
  categories: Category[];
  defaultCategoryId: string;
  onSubmit: (draft: TaskDraft) => void;
  onCancel: () => void;
}

const QUICK_DATES: Array<{ label: string; value: () => string }> = [
  { label: 'Today', value: () => todayISO() },
  { label: 'Tomorrow', value: () => addDaysISO(todayISO(), 1) },
  { label: 'Next week', value: () => addDaysISO(todayISO(), 7) },
];

export function TaskForm({
  task,
  categories,
  defaultCategoryId,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const isEditing = Boolean(task);
  const [title, setTitle] = useState(task?.title ?? '');
  const [notes, setNotes] = useState(task?.notes ?? '');
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState<string>(task?.dueDate ?? '');
  const [categoryId, setCategoryId] = useState<string>(
    task?.categoryId ?? defaultCategoryId ?? categories[0]?.id ?? '',
  );
  const [error, setError] = useState('');
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  const activeCategoryId = useMemo(() => {
    if (categories.some((category) => category.id === categoryId)) return categoryId;
    return categories[0]?.id ?? '';
  }, [categories, categoryId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError('Please give your task a title.');
      titleRef.current?.focus();
      return;
    }
    setError('');
    onSubmit({
      title,
      notes,
      priority,
      dueDate: dueDate || null,
      categoryId: activeCategoryId,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Edit task' : 'Add task'}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="card-surface animate-pop my-auto w-full max-w-lg p-5 sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit task' : 'New task'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isEditing
                ? 'Update the details and save your changes.'
                : 'Capture what needs to be done and when.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="btn-ghost !rounded-full !p-2"
            aria-label="Close dialog"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="task-title"
              className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="task-title"
              ref={titleRef}
              className="field"
              placeholder="e.g. Write the project proposal"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              aria-invalid={Boolean(error)}
            />
            {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
          </div>

          <div>
            <label
              htmlFor="task-notes"
              className="mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300"
            >
              Notes
            </label>
            <textarea
              id="task-notes"
              className="field min-h-20 resize-y"
              placeholder="Add extra detail, links or checklists…"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>

          <div>
            <span className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <FlagIcon className="h-3.5 w-3.5" /> Priority
            </span>
            <div className="grid grid-cols-3 gap-2">
              {PRIORITY_ORDER.map((key) => {
                const active = priority === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPriority(key)}
                    aria-pressed={active}
                    className={`btn !px-3 ${
                      active
                        ? 'border border-transparent bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                        : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300'
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${PRIORITIES[key].dot}`} aria-hidden="true" />
                    {PRIORITIES[key].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="task-due"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <CalendarIcon className="h-3.5 w-3.5" /> Deadline
              </label>
              <input
                id="task-due"
                type="date"
                className="field"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {QUICK_DATES.map((quick) => (
                  <button
                    key={quick.label}
                    type="button"
                    onClick={() => setDueDate(quick.value())}
                    className="rounded-full border border-slate-200 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition hover:bg-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                  >
                    {quick.label}
                  </button>
                ))}
                {dueDate && (
                  <button
                    type="button"
                    onClick={() => setDueDate('')}
                    className="rounded-full border border-transparent px-2.5 py-1 text-[11px] font-semibold text-rose-500 transition hover:bg-rose-500/10"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="task-category"
                className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <TagIcon className="h-3.5 w-3.5" /> Category
              </label>
              <select
                id="task-category"
                className="field"
                value={activeCategoryId}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            <CheckIcon className="h-4 w-4" />
            {isEditing ? 'Save changes' : 'Add task'}
          </button>
        </div>
      </form>
    </div>
  );
}
