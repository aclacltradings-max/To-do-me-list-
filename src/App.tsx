import { useCallback, useMemo, useState } from 'react';
import type { Filters, Task, TaskDraft } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { FilterBar } from './components/FilterBar';
import { TaskList } from './components/TaskList';
import { TaskForm } from './components/TaskForm';
import { CategoryManager } from './components/CategoryManager';
import { ConfirmDialog } from './components/ConfirmDialog';
import { PlusIcon, TrashIcon } from './components/Icons';
import { useTasks } from './hooks/useTasks';
import { useTheme } from './hooks/useTheme';
import {
  ALL_CATEGORY_ID,
  DEFAULT_CATEGORY_ID,
  DEFAULT_FILTERS,
  applyFilters,
  computeStats,
} from './lib/taskUtils';

type DialogState =
  | { kind: 'none' }
  | { kind: 'form'; task: Task | null }
  | { kind: 'delete'; task: Task }
  | { kind: 'clear-completed' };

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const {
    tasks,
    categories,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    clearCompleted,
    addCategory,
    deleteCategory,
    seedSampleData,
  } = useTasks();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [dialog, setDialog] = useState<DialogState>({ kind: 'none' });

  const stats = useMemo(() => computeStats(tasks, categories), [tasks, categories]);
  const visibleTasks = useMemo(() => applyFilters(tasks, filters), [tasks, filters]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      active: tasks.filter((task) => !task.completed).length,
      completed: tasks.filter((task) => task.completed).length,
    }),
    [tasks],
  );

  const taskCountByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    for (const task of tasks) {
      map[task.categoryId] = (map[task.categoryId] ?? 0) + 1;
    }
    return map;
  }, [tasks]);

  const patchFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((current) => ({ ...current, ...patch }));
  }, []);

  const resetFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const openAddForm = useCallback(() => setDialog({ kind: 'form', task: null }), []);
  const openEditForm = useCallback((task: Task) => setDialog({ kind: 'form', task }), []);
  const closeDialog = useCallback(() => setDialog({ kind: 'none' }), []);

  const handleSubmit = useCallback(
    (draft: TaskDraft) => {
      if (dialog.kind === 'form' && dialog.task) {
        updateTask(dialog.task.id, draft);
      } else {
        addTask(draft);
      }
      closeDialog();
    },
    [addTask, closeDialog, dialog, updateTask],
  );

  const handleDelete = useCallback(() => {
    if (dialog.kind === 'delete') deleteTask(dialog.task.id);
    closeDialog();
  }, [closeDialog, deleteTask, dialog]);

  const handleClearCompleted = useCallback(() => {
    clearCompleted();
    closeDialog();
  }, [clearCompleted, closeDialog]);

  const defaultCategoryId = useMemo(() => {
    if (
      filters.categoryId !== ALL_CATEGORY_ID &&
      categories.some((category) => category.id === filters.categoryId)
    ) {
      return filters.categoryId;
    }
    return categories.some((category) => category.id === DEFAULT_CATEGORY_ID)
      ? DEFAULT_CATEGORY_ID
      : (categories[0]?.id ?? DEFAULT_CATEGORY_ID);
  }, [categories, filters.categoryId]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onSeedSample={seedSampleData}
        hasTasks={tasks.length > 0}
      />

      <div className="grid gap-5">
        <Dashboard stats={stats} />

        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          <div className="space-y-5">
            <FilterBar
              filters={filters}
              categories={categories}
              counts={counts}
              onChange={patchFilters}
              onReset={resetFilters}
            />

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                {counts.all === 0
                  ? 'Tasks'
                  : `Showing ${visibleTasks.length} of ${counts.all} task${counts.all === 1 ? '' : 's'}`}
              </h2>
              <div className="flex items-center gap-2">
                {counts.completed > 0 && (
                  <button
                    type="button"
                    onClick={() => setDialog({ kind: 'clear-completed' })}
                    className="btn-ghost !px-3 !py-2 text-xs"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Clear completed
                  </button>
                )}
                <button type="button" onClick={openAddForm} className="btn-primary">
                  <PlusIcon className="h-4 w-4" />
                  Add task
                </button>
              </div>
            </div>

            <TaskList
              tasks={visibleTasks}
              categories={categories}
              hasAnyTasks={counts.all > 0}
              onToggle={toggleTask}
              onEdit={openEditForm}
              onDelete={(task) => setDialog({ kind: 'delete', task })}
              onAdd={openAddForm}
              onClearFilters={resetFilters}
            />
          </div>

          <aside className="space-y-5 lg:sticky lg:top-8 lg:self-start">
            <CategoryManager
              categories={categories}
              taskCountByCategory={taskCountByCategory}
              onAdd={addCategory}
              onDelete={deleteCategory}
            />

            <section className="card-surface animate-fade-up p-4 text-xs text-slate-500 sm:p-5 dark:text-slate-400">
              <h2 className="mb-2 text-sm font-bold text-slate-900 dark:text-white">Tips</h2>
              <ul className="space-y-1.5">
                <li>• Click a task to edit its details.</li>
                <li>• Tick the circle to mark it complete.</li>
                <li>• Tasks are saved in your browser automatically.</li>
              </ul>
            </section>
          </aside>
        </div>
      </div>

      <footer className="mt-10 text-center text-xs text-slate-400 dark:text-slate-500">
        Built with React, TypeScript, Vite &amp; Tailwind CSS · Your data stays in this browser.
      </footer>

      {dialog.kind === 'form' && (
        <TaskForm
          key={dialog.task?.id ?? 'new'}
          task={dialog.task}
          categories={categories}
          defaultCategoryId={defaultCategoryId}
          onSubmit={handleSubmit}
          onCancel={closeDialog}
        />
      )}

      {dialog.kind === 'delete' && (
        <ConfirmDialog
          title="Delete task?"
          message={`“${dialog.task.title}” will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete task"
          onConfirm={handleDelete}
          onCancel={closeDialog}
        />
      )}

      {dialog.kind === 'clear-completed' && (
        <ConfirmDialog
          title="Clear completed tasks?"
          message={`This will remove ${counts.completed} completed task${
            counts.completed === 1 ? '' : 's'
          } from your list.`}
          confirmLabel="Clear completed"
          onConfirm={handleClearCompleted}
          onCancel={closeDialog}
        />
      )}
    </div>
  );
}
