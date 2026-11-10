import type { Category, Transaction } from '../types';
import { formatCurrency, formatDate, relativeDayLabel } from '../utils/format';
import { colorStyle } from '../utils/colors';
import { Badge } from './ui/Badge';
import { ArrowDownIcon, ArrowUpIcon, PencilIcon, TrashIcon } from './Icons';

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionItem({ transaction, category, onEdit, onDelete }: TransactionItemProps) {
  const isIncome = transaction.type === 'income';
  const style = colorStyle(category?.color ?? 'slate');
  const relative = relativeDayLabel(transaction.date);

  return (
    <li className="group flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50 sm:px-5 dark:hover:bg-slate-800/50">
      {/* Type indicator — colour AND icon AND sign, so it never relies on colour alone. */}
      <span
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          isIncome
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        ].join(' ')}
        aria-hidden="true"
      >
        {isIncome ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {transaction.description}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {category ? (
            <Badge className={`${style.soft} ${style.text}`} dot={style.bg}>
              {category.name}
            </Badge>
          ) : (
            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" dot="bg-slate-400">
              Uncategorised
            </Badge>
          )}
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {relative ? `${relative} · ` : ''}
            {formatDate(transaction.date)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <span
          className={[
            'text-sm font-bold tabular-nums sm:text-base',
            isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
          ].join(' ')}
        >
          <span className="sr-only">{isIncome ? 'Income' : 'Expense'} of </span>
          {isIncome ? '+' : '−'}
          {formatCurrency(transaction.amount)}
        </span>

        {/* Touch devices get full 44px targets; pointer devices keep them compact
            and reveal them on hover/focus to reduce visual noise. */}
        <div className="flex items-center gap-0.5 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(transaction)}
            aria-label={`Edit ${transaction.description}`}
            title="Edit"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 pointer-coarse:h-11 pointer-coarse:w-11 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(transaction)}
            aria-label={`Delete ${transaction.description}`}
            title="Delete"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 pointer-coarse:h-11 pointer-coarse:w-11 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </li>
  );
}
