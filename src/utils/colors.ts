import type { ColorToken } from '../types';

export interface ColorStyle {
  /** Solid swatch, used for dots and chart fills. */
  bg: string;
  /** Soft tinted background for chips. */
  soft: string;
  text: string;
  ring: string;
  /** Raw hex so Recharts can render the same palette on canvas. */
  hex: string;
}

export const COLORS: Record<ColorToken, ColorStyle> = {
  indigo: { bg: 'bg-indigo-500', soft: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-300', ring: 'ring-indigo-200 dark:ring-indigo-500/30', hex: '#6366f1' },
  sky: { bg: 'bg-sky-500', soft: 'bg-sky-50 dark:bg-sky-500/10', text: 'text-sky-700 dark:text-sky-300', ring: 'ring-sky-200 dark:ring-sky-500/30', hex: '#0ea5e9' },
  emerald: { bg: 'bg-emerald-500', soft: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-500/30', hex: '#10b981' },
  teal: { bg: 'bg-teal-500', soft: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-700 dark:text-teal-300', ring: 'ring-teal-200 dark:ring-teal-500/30', hex: '#14b8a6' },
  amber: { bg: 'bg-amber-500', soft: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', ring: 'ring-amber-200 dark:ring-amber-500/30', hex: '#f59e0b' },
  orange: { bg: 'bg-orange-500', soft: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-300', ring: 'ring-orange-200 dark:ring-orange-500/30', hex: '#f97316' },
  rose: { bg: 'bg-rose-500', soft: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300', ring: 'ring-rose-200 dark:ring-rose-500/30', hex: '#f43f5e' },
  pink: { bg: 'bg-pink-500', soft: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-700 dark:text-pink-300', ring: 'ring-pink-200 dark:ring-pink-500/30', hex: '#ec4899' },
  violet: { bg: 'bg-violet-500', soft: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300', ring: 'ring-violet-200 dark:ring-violet-500/30', hex: '#8b5cf6' },
  cyan: { bg: 'bg-cyan-500', soft: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-300', ring: 'ring-cyan-200 dark:ring-cyan-500/30', hex: '#06b6d4' },
  lime: { bg: 'bg-lime-500', soft: 'bg-lime-50 dark:bg-lime-500/10', text: 'text-lime-700 dark:text-lime-300', ring: 'ring-lime-200 dark:ring-lime-500/30', hex: '#84cc16' },
  slate: { bg: 'bg-slate-500', soft: 'bg-slate-100 dark:bg-slate-500/10', text: 'text-slate-700 dark:text-slate-300', ring: 'ring-slate-200 dark:ring-slate-500/30', hex: '#64748b' },
};

export const COLOR_TOKENS = Object.keys(COLORS) as ColorToken[];

export function colorStyle(token: ColorToken): ColorStyle {
  return COLORS[token] ?? COLORS.slate;
}
