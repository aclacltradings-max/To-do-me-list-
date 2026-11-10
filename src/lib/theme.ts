import type { ColorKey, Priority } from '../types';

/**
 * Static Tailwind class strings per colour key.
 * Tailwind only keeps classes it can see literally, so every variant is written
 * out in full instead of being assembled at runtime.
 */
export interface ColorTokens {
  /** Solid dot / bar colour. */
  solid: string;
  /** Soft chip (background + text + border). */
  chip: string;
  /** Left accent border for cards. */
  accent: string;
  /** Focus ring colour. */
  ring: string;
}

export const CATEGORY_COLORS: Record<ColorKey, ColorTokens> = {
  indigo: {
    solid: 'bg-indigo-500',
    chip: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-300 dark:border-indigo-400/30',
    accent: 'border-l-indigo-500',
    ring: 'focus:ring-indigo-500/40',
  },
  violet: {
    solid: 'bg-violet-500',
    chip: 'bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-300 dark:border-violet-400/30',
    accent: 'border-l-violet-500',
    ring: 'focus:ring-violet-500/40',
  },
  fuchsia: {
    solid: 'bg-fuchsia-500',
    chip: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-500/20 dark:text-fuchsia-300 dark:border-fuchsia-400/30',
    accent: 'border-l-fuchsia-500',
    ring: 'focus:ring-fuchsia-500/40',
  },
  rose: {
    solid: 'bg-rose-500',
    chip: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-400/30',
    accent: 'border-l-rose-500',
    ring: 'focus:ring-rose-500/40',
  },
  amber: {
    solid: 'bg-amber-500',
    chip: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300 dark:border-amber-400/30',
    accent: 'border-l-amber-500',
    ring: 'focus:ring-amber-500/40',
  },
  emerald: {
    solid: 'bg-emerald-500',
    chip: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-300 dark:border-emerald-400/30',
    accent: 'border-l-emerald-500',
    ring: 'focus:ring-emerald-500/40',
  },
  sky: {
    solid: 'bg-sky-500',
    chip: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-300 dark:border-sky-400/30',
    accent: 'border-l-sky-500',
    ring: 'focus:ring-sky-500/40',
  },
  teal: {
    solid: 'bg-teal-500',
    chip: 'bg-teal-500/10 text-teal-600 border-teal-500/20 dark:text-teal-300 dark:border-teal-400/30',
    accent: 'border-l-teal-500',
    ring: 'focus:ring-teal-500/40',
  },
};

export const COLOR_KEYS = Object.keys(CATEGORY_COLORS) as ColorKey[];

export interface PriorityTokens {
  label: string;
  chip: string;
  dot: string;
  /** Higher number sorts first. */
  weight: number;
}

export const PRIORITIES: Record<Priority, PriorityTokens> = {
  high: {
    label: 'High',
    chip: 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-300 dark:border-rose-400/30',
    dot: 'bg-rose-500',
    weight: 3,
  },
  medium: {
    label: 'Medium',
    chip: 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:text-amber-300 dark:border-amber-400/30',
    dot: 'bg-amber-500',
    weight: 2,
  },
  low: {
    label: 'Low',
    chip: 'bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-300 dark:border-sky-400/30',
    dot: 'bg-sky-500',
    weight: 1,
  },
};

export const PRIORITY_ORDER: Priority[] = ['high', 'medium', 'low'];

export function colorTokens(color: ColorKey): ColorTokens {
  return CATEGORY_COLORS[color] ?? CATEGORY_COLORS.indigo;
}
