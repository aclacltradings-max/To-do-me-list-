import { lazy, Suspense, useCallback, useMemo, useState } from 'react';
import type { Category, Transaction, TransactionDraft, TransactionFilters } from './types';
import { useFinance } from './hooks/useFinance';
import { useTheme } from './hooks/useTheme';
import { useInstallPrompt } from './hooks/useInstallPrompt';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { computeTotals, filterTransactions, hasActiveFilters } from './utils/finance';
import { monthKey, todayISO } from './utils/format';
import { Header } from './components/Header';
import { OfflineBanner } from './components/OfflineBanner';
import { InstallDialog } from './components/InstallDialog';
import { Dashboard } from './components/Dashboard';
import { FilterBar } from './components/FilterBar';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { MonthlySummary } from './components/MonthlySummary';
import { CategoryManager } from './components/CategoryManager';
import { Modal } from './components/ui/Modal';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { Toast } from './components/ui/Toast';
import { Button } from './components/ui/Button';
import { CheckCircleIcon, PlusIcon, SparkIcon } from './components/Icons';

// Recharts is heavy, so the charts are split into their own chunk and fetched
// only once the panel is about to render.
const ChartsPanel = lazy(() =>
  import('./components/charts/ChartsPanel').then((m) => ({ default: m.ChartsPanel })),
);

function ChartsFallback() {
  return (
    <div className="card flex h-72 items-center justify-center">
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading charts…</p>
    </div>
  );
}

const EMPTY_FILTERS: TransactionFilters = {
  search: '',
  type: 'all',
  categoryId: 'all',
  from: '',
  to: '',
};

export default function App() {
  const store = useFinance();
  const { isDark, toggleTheme } = useTheme();
  const install = useInstallPrompt();
  const online = useOnlineStatus();

  const [filters, setFilters] = useState<TransactionFilters>(EMPTY_FILTERS);

  // Dialog state
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [draft, setDraft] = useState<TransactionDraft>(() => store.emptyDraft());
  const [pendingDelete, setPendingDelete] = useState<Transaction | null>(null);
  const [pendingCategoryDelete, setPendingCategoryDelete] = useState<Category | null>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const [installToastOpen, setInstallToastOpen] = useState(false);

  const { transactions, categories } = store;

  /** Runs the native install prompt when possible, otherwise shows instructions. */
  const handleInstall = useCallback(async () => {
    const outcome = await install.promptInstall();
    if (outcome === 'accepted') {
      setInstallOpen(false);
      setInstallToastOpen(true);
    } else if (outcome === 'unavailable') {
      setInstallOpen(true);
    }
  }, [install]);

  /** Rows matching the active filters — drives the list, summary and charts. */
  const visible = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters],
  );

  const totals = useMemo(() => computeTotals(visible), [visible]);

  const currentMonth = monthKey(todayISO());
  const monthTotals = useMemo(
    () => computeTotals(visible.filter((t) => monthKey(t.date) === currentMonth)),
    [visible, currentMonth],
  );

  const openAdd = useCallback(() => {
    setEditing(null);
    setDraft(store.emptyDraft('expense'));
    setFormOpen(true);
  }, [store]);

  const openEdit = useCallback(
    (transaction: Transaction) => {
      setEditing(transaction);
      setDraft(store.draftFrom(transaction));
      setFormOpen(true);
    },
    [store],
  );

  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditing(null);
  }, []);

  const handleSubmit = useCallback(
    (next: TransactionDraft) => {
      if (editing) store.updateTransaction(editing.id, next);
      else store.addTransaction(next);
      closeForm();
    },
    [editing, store, closeForm],
  );

  const confirmDelete = useCallback(() => {
    if (pendingDelete) store.deleteTransaction(pendingDelete.id);
    setPendingDelete(null);
  }, [pendingDelete, store]);

  const confirmCategoryDelete = useCallback(() => {
    if (pendingCategoryDelete) store.deleteCategory(pendingCategoryDelete.id);
    setPendingCategoryDelete(null);
  }, [pendingCategoryDelete, store]);

  const filtered = hasActiveFilters(filters);
  const categoryUsage = pendingCategoryDelete
    ? transactions.filter((t) => t.categoryId === pendingCategoryDelete.id).length
    : 0;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onAdd={openAdd}
        canInstall={install.showInstall}
        onInstall={handleInstall}
      />

      {!online && <OfflineBanner />}

      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6 sm:px-6 lg:px-8">
        {/* Dashboard */}
        <Dashboard
          totals={totals}
          monthTotals={monthTotals}
          transactionCount={visible.length}
        />

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <FilterBar
              filters={filters}
              onChange={setFilters}
              onReset={() => setFilters(EMPTY_FILTERS)}
              categories={categories}
              resultCount={visible.length}
              totalCount={transactions.length}
            />

            <Suspense fallback={<ChartsFallback />}>
              <ChartsPanel transactions={visible} categories={categories} />
            </Suspense>

            <TransactionList
              transactions={visible}
              categories={categories}
              filtered={filtered}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onAdd={openAdd}
              onResetFilters={() => setFilters(EMPTY_FILTERS)}
              onLoadSample={store.loadSampleData}
            />
          </div>

          <aside className="space-y-6 lg:col-span-4">
            <CategoryManager
              categories={categories}
              categoriesByType={store.categoriesByType}
              transactions={transactions}
              onAdd={store.addCategory}
              onRename={store.renameCategory}
              onDelete={setPendingCategoryDelete}
            />

            <MonthlySummary transactions={visible} />

            <section className="card p-5">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Data</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Everything is stored in this browser's localStorage. Nothing is uploaded.
              </p>
              <div className="mt-3.5 flex flex-col gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  block
                  onClick={store.loadSampleData}
                  disabled={transactions.length > 0}
                >
                  <SparkIcon className="h-4 w-4" />
                  Load sample data
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  block
                  onClick={() => setResetOpen(true)}
                  disabled={transactions.length === 0}
                >
                  Clear all transactions
                </Button>
              </div>
            </section>
          </aside>
        </div>
      </main>

      {/* Mobile floating action button */}
      <button
        type="button"
        onClick={openAdd}
        aria-label="Add transaction"
        className="fixed right-5 bottom-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500 active:scale-95 sm:hidden"
      >
        <PlusIcon className="h-6 w-6" />
      </button>

      {/* Add / edit dialog */}
      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? 'Edit transaction' : 'Add transaction'}
        description={
          editing
            ? 'Update the details and save your changes.'
            : 'Record money coming in or going out.'
        }
        size="lg"
      >
        <TransactionFormWrapper
          editing={editing}
          draft={draft}
          onChange={setDraft}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          categories={categories}
          onAddCategory={store.addCategory}
        />
      </Modal>

      {/* Delete a transaction */}
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete transaction?"
        message={
          pendingDelete
            ? `“${pendingDelete.description}” will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Delete a category */}
      <ConfirmDialog
        open={pendingCategoryDelete !== null}
        title="Delete category?"
        message={
          pendingCategoryDelete
            ? categoryUsage > 0
              ? `“${pendingCategoryDelete.name}” is used by ${categoryUsage} transaction${categoryUsage === 1 ? '' : 's'}. Deleting it will also delete ${categoryUsage === 1 ? 'that transaction' : 'those transactions'}.`
              : `“${pendingCategoryDelete.name}” has no transactions and will be removed.`
            : ''
        }
        confirmLabel="Delete category"
        onConfirm={confirmCategoryDelete}
        onCancel={() => setPendingCategoryDelete(null)}
      />

      {/* Clear everything */}
      <ConfirmDialog
        open={resetOpen}
        title="Clear all transactions?"
        message={`All ${transactions.length} transactions will be deleted. Your categories are kept. This cannot be undone.`}
        confirmLabel="Clear everything"
        onConfirm={() => {
          store.clearAllTransactions();
          setResetOpen(false);
        }}
        onCancel={() => setResetOpen(false)}
      />

      {/* Install instructions / native prompt */}
      <InstallDialog
        open={installOpen}
        onClose={() => setInstallOpen(false)}
        platform={install.platform}
        canInstall={install.canInstall}
        onInstall={handleInstall}
      />

      <Toast
        open={installToastOpen}
        onClose={() => setInstallToastOpen(false)}
        icon={<CheckCircleIcon className="h-5 w-5" />}
      >
        FinTrack was installed. Look for it on your home screen or in your apps list.
      </Toast>
    </div>
  );
}

/** Thin wrapper so the form remounts cleanly when switching between add and edit. */
function TransactionFormWrapper({
  editing,
  ...rest
}: {
  editing: Transaction | null;
  draft: TransactionDraft;
  onChange: (draft: TransactionDraft) => void;
  onSubmit: (draft: TransactionDraft) => void;
  onCancel: () => void;
  categories: Category[];
  onAddCategory: (name: string, type: Category['type'], color: Category['color']) => Category;
}) {
  return <TransactionForm key={editing?.id ?? 'new'} transaction={editing} {...rest} />;
}
