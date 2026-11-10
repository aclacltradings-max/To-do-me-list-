import type { Category, Task } from '../types';
import { TaskItem } from './TaskItem';
import { InboxIcon, PlusIcon } from './Icons';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  hasAnyTasks: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAdd: () => void;
  onClearFilters: () => void;
}

export function TaskList({
  tasks,
  categories,
  hasAnyTasks,
  onToggle,
  onEdit,
  onDelete,
  onAdd,
  onClearFilters,
}: TaskListProps) {
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  if (tasks.length === 0) {
    const empty = !hasAnyTasks;
    return (
      <div className="card-surface animate-fade-up flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-violet-500/15 text-indigo-500">
          <InboxIcon className="h-7 w-7" />
        </span>
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
          {empty ? 'Your task list is empty' : 'No tasks match your filters'}
        </h3>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {empty
            ? 'Add your first task to start tracking progress on your dashboard.'
            : 'Try a different search term, priority or category — or reset the filters.'}
        </p>
        <div className="mt-1">
          {empty ? (
            <button type="button" onClick={onAdd} className="btn-primary">
              <PlusIcon className="h-4 w-4" />
              Add your first task
            </button>
          ) : (
            <button type="button" onClick={onClearFilters} className="btn-ghost">
              Reset filters
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          category={categoryMap.get(task.categoryId)}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
