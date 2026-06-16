'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { DataTable, type DataTableColumn, Loader } from '@/components/common';
import { formatCurrency } from '@/lib/format';
import { useCashExpenses } from '../hooks/useCashExpenses';
import { CashExpenseForm } from '../components/CashExpenseForm';
import { RowActionsMenu } from '../components/RowActionsMenu';
import { CASH_EXPENSE_CATEGORIES } from '../constants/cash-expense';
import type { CashExpense } from '../types/accounts.types';
import type { CashExpenseFormValues } from '../schemas/cashExpense.schema';

function toForm(expense: CashExpense): CashExpenseFormValues {
  const { id: _id, createdAt: _createdAt, ...rest } = expense;
  return rest;
}

/**
 * Daily cash-expense management.
 *
 * Server state comes from `useCashExpenses()` (React Query). A local working copy
 * backs optimistic add/edit/delete until the write endpoints are live; the mutation
 * hooks in `useCashExpenseMutations` are ready to take over at that point.
 */
export function CashExpensePage() {
  const { data, isLoading } = useCashExpenses();
  const [expenses, setExpenses] = useState<CashExpense[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<CashExpense | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (data) setExpenses(data);
  }, [data]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenses.filter((expense) => {
      const matchesSearch =
        expense.expenseCategory.toLowerCase().includes(q) ||
        expense.payeePartyName.toLowerCase().includes(q) ||
        expense.expenseNote.toLowerCase().includes(q);
      const matchesCategory =
        categoryFilter === 'all' || expense.expenseCategory === categoryFilter;
      const date = new Date(expense.date);
      return matchesSearch && matchesCategory && date >= start && date <= end;
    });
  }, [expenses, search, categoryFilter, startDate, endDate]);

  const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (values: CashExpenseFormValues) => {
    if (editing) {
      setExpenses((prev) =>
        prev.map((e) => (e.id === editing.id ? { ...e, ...values } : e)),
      );
    } else {
      setExpenses((prev) => [
        ...prev,
        { id: Math.max(0, ...prev.map((e) => e.id)) + 1, ...values, createdAt: new Date().toISOString().split('T')[0] },
      ]);
    }
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const columns = useMemo<DataTableColumn<CashExpense>[]>(
    () => [
      { key: 'index', label: '#', render: (_row, i) => <span className="font-semibold">{i + 1}</span> },
      {
        key: 'expenseCategory',
        label: 'Category',
        render: (row) => (
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
            {row.expenseCategory}
          </span>
        ),
      },
      {
        key: 'description',
        label: 'Description',
        render: (row) => (
          <div>
            <p className="text-sm font-semibold text-slate-900">{row.payeePartyName || '—'}</p>
            <p className="mt-1 text-xs text-slate-500">{row.expenseNote}</p>
          </div>
        ),
      },
      { key: 'date', label: 'Date', render: (row) => <span className="text-sm text-slate-600">{row.date}</span> },
      {
        key: 'amount',
        label: 'Amount',
        align: 'right',
        render: (row) => <span className="text-sm font-bold text-slate-900">{formatCurrency(row.amount, { maximumFractionDigits: 2 })}</span>,
      },
      {
        key: 'mode',
        label: 'Payment Method',
        render: (row) => (
          <span className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold capitalize text-blue-700">
            {row.mode}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Action',
        align: 'center',
        render: (row) => (
          <RowActionsMenu
            onEdit={() => {
              setEditing(row);
              setIsModalOpen(true);
            }}
            onView={() => {
              setEditing(row);
              setIsModalOpen(true);
            }}
            onDelete={() => handleDelete(row.id)}
          />
        ),
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900">
                <span className="text-[#FF671F]">Daily</span> Expense Management
              </h1>
              <p className="max-w-2xl text-base text-slate-600">
                Track and manage daily cash expenses across different categories.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 font-bold text-slate-700 transition-all hover:bg-slate-50">
                <Download size={18} /> Export
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-teal-600 hover:to-blue-600 hover:shadow-xl"
              >
                <Plus size={20} /> Add Expense
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 gap-2">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Category</label>
              <input
                list="cash-expense-categories"
                value={categoryFilter === 'all' ? '' : categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value || 'all')}
                placeholder="All"
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <datalist id="cash-expense-categories">
                {CASH_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-600">
                Total expense between {startDate} - {endDate}
              </p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalExpense, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-sm font-medium text-slate-600">Transactions</p>
              <p className="text-3xl font-bold text-green-600">{filtered.length}</p>
            </div>
          </div>
        </div>

        {isLoading ? <Loader label="Loading expenses…" /> : <DataTable columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="No Transaction Found." />}
      </div>

      <CashExpenseForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        defaultValues={editing ? toForm(editing) : null}
      />
    </div>
  );
}

export default CashExpensePage;
