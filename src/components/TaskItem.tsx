import type { Category, Task } from '../types';
import { PRIORITIES, colorTokens } from '../lib/theme';
import { dueState, formatDueDate, relativeCreated } from '../lib/taskUtils';
import { CalendarIcon, CheckIcon, PencilIcon, TrashIcon } from './Icons';

interface TaskItemProps {
  task: Task;
  category?: Category;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const DUE_STYLES: Record<string, string> = {
  overdue: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-400/30',
  today: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300 dark:border-amber-400/30',
  tomorrow: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-300 dark:border-sky-400/30',
  soon: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/30',
  later: 'bg-slate-500/10 text-slate-600 border-slate-500/20 dark:text-slate-300 dark:border-white/10',
};

export function TaskItem({ task, category, onToggle, onEdit, onDelete }: TaskItemProps) {
  const tokens = category ? colorTokens(category.color) : colorTokens('violet');
  const state = dueState(task);
  const priority = PRIORITIES[task.priority];

  return (
    <li
      className={`group card-surface animate-fade-up flex items-start gap-3 border-l-4 p-3.5 transition hover:-translate-y-0.5 hover:shadow-md sm:p-4 ${tokens.accent} ${
        task.completed ? 'opacity-70' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        aria-pressed={task.completed}
        aria-label={task.completed ? `Mark "${task.title}" as active` : `Mark "${task.title}" as complete`}
        className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition ${
          task.completed
            ? 'border-transparent bg-gradient-to-br from-indigo-500 to-violet-500 text-white'
            : 'border-slate-300 text-transparent hover:border-indigo-400 hover:text-indigo-400 dark:border-white/20'
        }`}
      >
        <CheckIcon className="h-3.5 w-3.5" />
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="min-w-0 flex-1 text-left"
            aria-label={`Edit "${task.title}"`}
          >
            <h3
              className={`truncate text-sm font-semibold text-slate-800 dark:text-slate-100 ${
                task.completed ? 'line-through decoration-2 opacity-70' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.notes && (
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                {task.notes}
              </p>
            )}
          </button>

          <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label={`Edit "${task.title}"`}
              title="Edit"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task)}
              className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300"
              aria-label={`Delete "${task.title}"`}
              title="Delete"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className={`chip ${priority.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} aria-hidden="true" />
            {priority.label}
          </span>

          <span className={`chip ${tokens.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${tokens.solid}`} aria-hidden="true" />
            {category?.name ?? 'Uncategorised'}
          </span>

          {task.dueDate && (
            <span className={`chip ${DUE_STYLES[state] ?? DUE_STYLES.later}`}>
              <CalendarIcon className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
              {state === 'overdue' && ' · overdue'}
            </span>
          )}

          <span className="ml-auto hidden text-[11px] text-slate-400 sm:block dark:text-slate-500">
            {task.completed ? 'Completed' : 'Added'} {relativeCreated(task.completed ? (task.completedAt ?? task.updatedAt) : task.createdAt)}
          </span>
        </div>
      </div>
    </li>
  );
}
