'use client';

import { useMemo, useState } from 'react';
import { Download, Plus } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common';
import { formatCurrency } from '@/lib/format';
import { BankExpenseForm } from '../components/BankExpenseForm';
import { RowActionsMenu } from '../components/RowActionsMenu';
import {
  BANK_ACCOUNTS,
  BANK_EXPENSE_CATEGORIES,
  SAMPLE_BANK_EXPENSES,
} from '../constants/bank-expense';
import type { BankExpense } from '../types/accounts.types';
import type { BankExpenseFormValues } from '../schemas/bankExpense.schema';

function toForm(expense: BankExpense): BankExpenseFormValues {
  const { id: _id, createdAt: _createdAt, ...rest } = expense;
  return rest;
}

/** Bank expense management. TODO: replace `SAMPLE_BANK_EXPENSES` with a Query hook. */
export function BankExpensePage() {
  const [expenses, setExpenses] = useState<BankExpense[]>(SAMPLE_BANK_EXPENSES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bankFilter, setBankFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<BankExpense | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenses.filter((e) => {
      const matchesSearch =
        e.expenseCategory.toLowerCase().includes(q) ||
        e.payeePartyName.toLowerCase().includes(q) ||
        e.expenseNote.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === 'all' || e.expenseCategory === categoryFilter;
      const matchesBank = bankFilter === 'all' || e.bankAccount === bankFilter;
      const date = new Date(e.date);
      return matchesSearch && matchesCategory && matchesBank && date >= start && date <= end;
    });
  }, [expenses, search, categoryFilter, bankFilter, startDate, endDate]);

  const totalExpense = filtered.reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (values: BankExpenseFormValues) => {
    if (editing) {
      setExpenses((prev) => prev.map((e) => (e.id === editing.id ? { ...e, ...values } : e)));
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

  const columns = useMemo<DataTableColumn<BankExpense>[]>(
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
      { key: 'bankAccount', label: 'Bank Account', render: (row) => <span className="text-sm font-semibold text-slate-900">{row.bankAccount}</span> },
      {
        key: 'payeePartyName',
        label: 'Payee Name',
        render: (row) => (
          <div>
            <p className="text-sm font-semibold text-slate-900">{row.payeePartyName}</p>
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
        label: 'Mode',
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

  const selectCls =
    'w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900">
                <span className="text-[#FF671F]">Bank</span> Expense Management
              </h1>
              <p className="max-w-2xl text-base text-slate-600">
                Track and manage bank expenses, transfers, and account-based payments.
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
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
              >
                <Plus size={20} /> Expense
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex flex-1 gap-2">
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">From</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={selectCls} />
              </div>
              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">To</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={selectCls} />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Category</label>
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectCls}>
                <option value="all">All</option>
                {BANK_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Bank Account</label>
              <select value={bankFilter} onChange={(e) => setBankFilter(e.target.value)} className={selectCls}>
                <option value="all">All</option>
                {BANK_ACCOUNTS.map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
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
              <p className="text-3xl font-bold text-blue-600">{filtered.length}</p>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} rowKey={(row) => row.id} emptyMessage="No Transaction Found." />
      </div>

      <BankExpenseForm
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

export default BankExpensePage;
