import type { Category, Filters, Priority, Stats, Task } from '../types';
import { PRIORITIES } from './theme';

export const STORAGE_KEYS = {
  tasks: 'taskflow.tasks.v1',
  categories: 'taskflow.categories.v1',
  theme: 'taskflow.theme.v1',
} as const;

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: 'indigo' },
  { id: 'personal', name: 'Personal', color: 'emerald' },
  { id: 'shopping', name: 'Shopping', color: 'amber' },
  { id: 'health', name: 'Health', color: 'rose' },
];

export const DEFAULT_CATEGORY_ID = 'personal';

export const ALL_CATEGORY_ID = 'all';

export function createId(prefix = 'id'): string {
  const random = Math.random().toString(36).slice(2, 9);
  return `${prefix}_${Date.now().toString(36)}_${random}`;
}

/** Today's date as `YYYY-MM-DD` in the user's local timezone. */
export function todayISO(): string {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Parse a `YYYY-MM-DD` string as a local date (avoids UTC shifting bugs). */
export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function addDaysISO(iso: string, days: number): string {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
}

/** Whole days from today until `iso`. Negative means the date has passed. */
export function daysUntil(iso: string): number {
  const today = parseISODate(todayISO()).getTime();
  const target = parseISODate(iso).getTime();
  return Math.round((target - today) / 86_400_000);
}

export type DueState = 'none' | 'overdue' | 'today' | 'tomorrow' | 'soon' | 'later';

export function dueState(task: Task): DueState {
  if (!task.dueDate || task.completed) return 'none';
  const diff = daysUntil(task.dueDate);
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 3) return 'soon';
  return 'later';
}

export function formatDueDate(iso: string): string {
  const diff = daysUntil(iso);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff === -1) return 'Yesterday';
  if (diff < -1 && diff >= -6) return `${Math.abs(diff)} days ago`;
  const date = parseISODate(iso);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  });
}

export function relativeCreated(timestamp: number): string {
  const diffMinutes = Math.round((Date.now() - timestamp) / 60_000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const hours = Math.round(diffMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export const DEFAULT_FILTERS: Filters = {
  search: '',
  status: 'all',
  priority: 'all',
  categoryId: ALL_CATEGORY_ID,
  sort: 'due',
};

export function matchesSearch(task: Task, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return task.title.toLowerCase().includes(needle) || task.notes.toLowerCase().includes(needle);
}

function compareDue(a: Task, b: Task): number {
  if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
  if (a.dueDate) return -1;
  if (b.dueDate) return 1;
  return b.createdAt - a.createdAt;
}

export function applyFilters(tasks: Task[], filters: Filters): Task[] {
  const filtered = tasks.filter((task) => {
    if (filters.status === 'active' && task.completed) return false;
    if (filters.status === 'completed' && !task.completed) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.categoryId !== ALL_CATEGORY_ID && task.categoryId !== filters.categoryId) {
      return false;
    }
    return matchesSearch(task, filters.search);
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    // Completed tasks always sink to the bottom of the list.
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    switch (filters.sort) {
      case 'priority':
        return PRIORITIES[b.priority].weight - PRIORITIES[a.priority].weight || compareDue(a, b);
      case 'created':
        return b.createdAt - a.createdAt;
      case 'alpha':
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      case 'due':
      default:
        return compareDue(a, b);
    }
  });
  return sorted;
}

export function computeStats(tasks: Task[], categories: Category[]): Stats {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const active = total - completed;
  const overdue = tasks.filter((task) => dueState(task) === 'overdue').length;
  const dueToday = tasks.filter((task) => dueState(task) === 'today').length;

  const byCategory = categories.map((category) => {
    const inCategory = tasks.filter((task) => task.categoryId === category.id);
    return {
      category,
      total: inCategory.length,
      completed: inCategory.filter((task) => task.completed).length,
    };
  });

  const uncategorised = tasks.filter(
    (task) => !categories.some((category) => category.id === task.categoryId),
  );
  if (uncategorised.length > 0) {
    byCategory.push({
      category: { id: 'uncategorised', name: 'Uncategorised', color: 'violet' },
      total: uncategorised.length,
      completed: uncategorised.filter((task) => task.completed).length,
    });
  }

  return {
    total,
    completed,
    active,
    overdue,
    dueToday,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    byCategory,
  };
}

export function priorityLabel(priority: Priority): string {
  return PRIORITIES[priority].label;
}
