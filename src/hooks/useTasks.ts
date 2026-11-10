import { useCallback, useMemo } from 'react';
import type { Category, ColorKey, Task, TaskDraft } from '../types';
import { useLocalStorage } from './useLocalStorage';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_CATEGORY_ID,
  STORAGE_KEYS,
  createId,
} from '../lib/taskUtils';

export interface UseTasksResult {
  tasks: Task[];
  categories: Category[];
  addTask: (draft: TaskDraft) => void;
  updateTask: (id: string, draft: TaskDraft) => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string) => void;
  clearCompleted: () => void;
  addCategory: (name: string, color: ColorKey) => void;
  deleteCategory: (id: string) => void;
  seedSampleData: () => void;
  resetAll: () => void;
  categoryById: (id: string) => Category | undefined;
}

/** Keeps only well-formed tasks so a corrupted localStorage entry cannot crash the UI. */
function sanitiseTasks(value: unknown): Task[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is Task => {
    if (typeof item !== 'object' || item === null) return false;
    const task = item as Partial<Task>;
    return typeof task.id === 'string' && typeof task.title === 'string';
  });
}

function sanitiseCategories(value: unknown): Category[] {
  if (!Array.isArray(value) || value.length === 0) return DEFAULT_CATEGORIES;
  const valid = value.filter((item): item is Category => {
    if (typeof item !== 'object' || item === null) return false;
    const category = item as Partial<Category>;
    return typeof category.id === 'string' && typeof category.name === 'string';
  });
  return valid.length > 0 ? valid : DEFAULT_CATEGORIES;
}

export function useTasks(): UseTasksResult {
  const [rawTasks, setTasks] = useLocalStorage<Task[]>(STORAGE_KEYS.tasks, []);
  const [rawCategories, setCategories] = useLocalStorage<Category[]>(
    STORAGE_KEYS.categories,
    DEFAULT_CATEGORIES,
  );

  const tasks = useMemo(() => sanitiseTasks(rawTasks), [rawTasks]);
  const categories = useMemo(() => sanitiseCategories(rawCategories), [rawCategories]);

  const addTask = useCallback(
    (draft: TaskDraft) => {
      const now = Date.now();
      const task: Task = {
        id: createId('task'),
        title: draft.title.trim(),
        notes: draft.notes.trim(),
        completed: false,
        priority: draft.priority,
        dueDate: draft.dueDate || null,
        categoryId: draft.categoryId || DEFAULT_CATEGORY_ID,
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      };
      setTasks((current) => [task, ...sanitiseTasks(current)]);
    },
    [setTasks],
  );

  const updateTask = useCallback(
    (id: string, draft: TaskDraft) => {
      setTasks((current) =>
        sanitiseTasks(current).map((task) =>
          task.id === id
            ? {
                ...task,
                title: draft.title.trim(),
                notes: draft.notes.trim(),
                priority: draft.priority,
                dueDate: draft.dueDate || null,
                categoryId: draft.categoryId || task.categoryId,
                updatedAt: Date.now(),
              }
            : task,
        ),
      );
    },
    [setTasks],
  );

  const deleteTask = useCallback(
    (id: string) => {
      setTasks((current) => sanitiseTasks(current).filter((task) => task.id !== id));
    },
    [setTasks],
  );

  const toggleTask = useCallback(
    (id: string) => {
      setTasks((current) =>
        sanitiseTasks(current).map((task) => {
          if (task.id !== id) return task;
          const completed = !task.completed;
          return {
            ...task,
            completed,
            completedAt: completed ? Date.now() : null,
            updatedAt: Date.now(),
          };
        }),
      );
    },
    [setTasks],
  );

  const clearCompleted = useCallback(() => {
    setTasks((current) => sanitiseTasks(current).filter((task) => !task.completed));
  }, [setTasks]);

  const addCategory = useCallback(
    (name: string, color: ColorKey) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setCategories((current) => {
        const list = sanitiseCategories(current);
        const exists = list.some(
          (category) => category.name.toLowerCase() === trimmed.toLowerCase(),
        );
        if (exists) return list;
        return [...list, { id: createId('cat'), name: trimmed, color }];
      });
    },
    [setCategories],
  );

  const deleteCategory = useCallback(
    (id: string) => {
      setCategories((current) => {
        const list = sanitiseCategories(current);
        if (list.length <= 1) return list;
        return list.filter((category) => category.id !== id);
      });
      // Tasks in the removed category fall back to the first remaining category.
      setTasks((current) => {
        const list = sanitiseCategories(rawCategories);
        const fallback = list.find((category) => category.id !== id)?.id ?? DEFAULT_CATEGORY_ID;
        return sanitiseTasks(current).map((task) =>
          task.categoryId === id ? { ...task, categoryId: fallback } : task,
        );
      });
    },
    [rawCategories, setCategories, setTasks],
  );

  const seedSampleData = useCallback(() => {
    const now = Date.now();
    const day = 86_400_000;
    const sample: Task[] = [
      {
        id: createId('task'),
        title: 'Welcome to TaskFlow 🎉',
        notes: 'Tick the circle to complete a task, or click the card to edit it.',
        completed: false,
        priority: 'high',
        dueDate: new Date(now + day).toISOString().slice(0, 10),
        categoryId: 'personal',
        createdAt: now,
        updatedAt: now,
        completedAt: null,
      },
      {
        id: createId('task'),
        title: 'Prepare the quarterly report',
        notes: 'Collect numbers from the finance dashboard and draft the summary.',
        completed: false,
        priority: 'medium',
        dueDate: new Date(now + 3 * day).toISOString().slice(0, 10),
        categoryId: 'work',
        createdAt: now - 1000,
        updatedAt: now - 1000,
        completedAt: null,
      },
      {
        id: createId('task'),
        title: 'Buy groceries for the week',
        notes: 'Oats, berries, coffee beans, olive oil.',
        completed: false,
        priority: 'low',
        dueDate: null,
        categoryId: 'shopping',
        createdAt: now - 2000,
        updatedAt: now - 2000,
        completedAt: null,
      },
      {
        id: createId('task'),
        title: 'Morning run — 5 km',
        notes: 'Keep an easy pace and stretch afterwards.',
        completed: true,
        priority: 'medium',
        dueDate: null,
        categoryId: 'health',
        createdAt: now - 3000,
        updatedAt: now - 3000,
        completedAt: now - 3000,
      },
    ];
    setTasks(sample);
    setCategories(DEFAULT_CATEGORIES);
  }, [setCategories, setTasks]);

  const resetAll = useCallback(() => {
    setTasks([]);
    setCategories(DEFAULT_CATEGORIES);
  }, [setCategories, setTasks]);

  const categoryById = useCallback(
    (id: string) => categories.find((category) => category.id === id),
    [categories],
  );

  return {
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
    resetAll,
    categoryById,
  };
}
