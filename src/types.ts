export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  priority: Priority;
  /** Due date in `YYYY-MM-DD` format, or null when the task has no deadline. */
  dueDate: string | null;
  categoryId: string;
  createdAt: number;
  updatedAt: number;
  completedAt: number | null;
}

export interface Category {
  id: string;
  name: string;
  /** Key into CATEGORY_COLORS. */
  color: ColorKey;
}

export type ColorKey =
  | 'indigo'
  | 'violet'
  | 'fuchsia'
  | 'rose'
  | 'amber'
  | 'emerald'
  | 'sky'
  | 'teal';

export type StatusFilter = 'all' | 'active' | 'completed';

export type PriorityFilter = 'all' | Priority;

export type SortKey = 'due' | 'priority' | 'created' | 'alpha';

export interface Filters {
  search: string;
  status: StatusFilter;
  priority: PriorityFilter;
  categoryId: string;
  sort: SortKey;
}

export interface TaskDraft {
  title: string;
  notes: string;
  priority: Priority;
  dueDate: string | null;
  categoryId: string;
}

export interface Stats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  dueToday: number;
  completionRate: number;
  byCategory: Array<{ category: Category; total: number; completed: number }>;
}
