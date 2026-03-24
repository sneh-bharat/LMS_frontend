'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Download,
  Filter,
} from 'lucide-react';
import AddNewBank, { FormData } from './Addnewbank';

interface BankExpense {
  id: number;
  expenseCategory: string;
  bankAccount: string;
  mode: 'cash' | 'cheque' | 'online' | 'card' | 'transfer';
  payeePartyName: string;
  amount: number;
  date: string;
  expenseNote: string;
  createdAt: string;
}

const SAMPLE_BANK_EXPENSES: BankExpense[] = [
  {
    id: 1,
    expenseCategory: 'Equipment',
    bankAccount: 'Primary Account - HDFC Bank (XXXX1234)',
    mode: 'transfer',
    payeePartyName: 'Medical Equipment Suppliers Ltd.',
    amount: 125000,
    date: '2024-02-25',
    expenseNote: 'Purchase of medical diagnostic equipment for cardiology department',
    createdAt: '2024-02-25',
  },
  {
    id: 2,
    expenseCategory: 'Staff Salaries',
    bankAccount: 'Operational Account - SBI Bank (XXXX9012)',
    mode: 'transfer',
    payeePartyName: 'Staff Payroll System',
    amount: 850000,
    date: '2024-02-24',
    expenseNote: 'Monthly staff salaries for February 2024',
    createdAt: '2024-02-24',
  },
  {
    id: 3,
    expenseCategory: 'Electricity Bill',
    bankAccount: 'Primary Account - HDFC Bank (XXXX1234)',
    mode: 'online',
    payeePartyName: 'WBSEDCL',
    amount: 45000,
    date: '2024-02-23',
    expenseNote: 'Monthly electricity bill payment',
    createdAt: '2024-02-23',
  },
  {
    id: 4,
    expenseCategory: 'Maintenance',
    bankAccount: 'Secondary Account - ICICI Bank (XXXX5678)',
    mode: 'cheque',
    payeePartyName: 'Building Maintenance Services',
    amount: 35000,
    date: '2024-02-22',
    expenseNote: 'Quarterly building maintenance and repair services',
    createdAt: '2024-02-22',
  },
];

const CATEGORIES = [
  'Electrical Maintenance',
  'Bio-medical Waste',
  'Doctor IP Pay',
  'Doctor Payment',
  'DTH Bill',
  'Electricity Bill',
  'EPF Payment',
  'Food Expenses',
  'Franchise Wallet Recharge',
  'Franchise Wallet Refund',
  'Fuel Expenses',
  'Internet Bill',
  'Lab Machinery Maintenance',
  'Medical Supplies',
  'Equipment',
  'Staff Salaries',
  'Utilities',
  'Maintenance',
  'Travel',
  'Consumables',
  'Other',
];

const BANK_ACCOUNTS = [
  'Primary Account - HDFC Bank (XXXX1234)',
  'Secondary Account - ICICI Bank (XXXX5678)',
  'Operational Account - SBI Bank (XXXX9012)',
  'Savings Account - Axis Bank (XXXX3456)',
];

function ExpenseActionsMenu({
  expense,
  onEdit,
  onDelete,
  onView,
}: {
  expense: BankExpense;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-2">
          <button
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => {
              if (onView) {
                onView();
              }
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={14} /> View
          </button>
          <div className="h-[1px] bg-slate-100 my-1"></div>
          <button
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

const BankExpensePage = () => {
  const [expenses, setExpenses] = useState<BankExpense[]>(SAMPLE_BANK_EXPENSES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<BankExpense | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.expenseCategory.toLowerCase().includes(search.toLowerCase()) ||
      expense.payeePartyName.toLowerCase().includes(search.toLowerCase()) ||
      expense.expenseNote.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || expense.expenseCategory === categoryFilter;
    const matchesBank = bankFilter === 'all' || expense.bankAccount === bankFilter;

    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const matchesDateRange = expenseDate >= start && expenseDate <= end;

    return matchesSearch && matchesCategory && matchesBank && matchesDateRange;
  });

  const totalExpense = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleAddExpense = (formData: FormData) => {
    if (editingExpense) {
      setExpenses(
        expenses.map((e) =>
          e.id === editingExpense.id
            ? { 
                ...e, 
                expenseCategory: formData.expenseCategory,
                bankAccount: formData.bankAccount,
                mode: formData.mode,
                payeePartyName: formData.payeePartyName,
                amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) || 0 : formData.amount,
                date: formData.date,
                expenseNote: formData.expenseNote,
              }
            : e
        )
      );
      setEditingExpense(null);
    } else {
      const newExpense: BankExpense = {
        id: Math.max(...expenses.map((e) => e.id), 0) + 1,
        expenseCategory: formData.expenseCategory,
        bankAccount: formData.bankAccount,
        mode: formData.mode,
        payeePartyName: formData.payeePartyName,
        amount: typeof formData.amount === 'string' ? parseFloat(formData.amount) || 0 : formData.amount,
        date: formData.date,
        expenseNote: formData.expenseNote,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setExpenses([...expenses, newExpense]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (expense: BankExpense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleView = (expense: BankExpense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter((e) => e.id !== id));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const categoryStats = CATEGORIES.map((cat) => {
    const categoryExpenses = filteredExpenses.filter((e) => e.expenseCategory === cat);
    return {
      category: cat,
      count: categoryExpenses.length,
      total: categoryExpenses.reduce((sum, e) => sum + e.amount, 0),
    };
  }).filter(stat => stat.count > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header Section */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="text-blue-600">Bank</span> Expense Management
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Track and manage bank expenses, transfers, and account-based payments.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all">
                <Download size={18} /> Export
              </button>
              <button
                onClick={() => {
                  setEditingExpense(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} /> Expense
              </button>
            </div>
          </div>

          {/* Date Range, Category, and Bank Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex gap-2 flex-1">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Category</label>
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Bank Account</label>
              <div className="relative">
                <select
                  value={bankFilter}
                  onChange={(e) => setBankFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All</option>
                  {BANK_ACCOUNTS.map((account) => (
                    <option key={account} value={account}>
                      {account}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">
                Total expense between {startDate} - {endDate}
              </p>
              <p className="text-3xl font-bold text-slate-900">
                ₹{totalExpense.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-600 text-sm font-medium mb-1">Transactions</p>
              <p className="text-3xl font-bold text-blue-600">{filteredExpenses.length}</p>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {categoryStats.map((stat) => (
                <div key={stat.category} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{stat.category}</p>
                    <p className="text-sm text-slate-600">{stat.count} transaction{stat.count !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="font-bold text-slate-900">
                    ₹{stat.total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Bank Account
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Payee Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((expense, index) => (
                    <tr key={expense.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                          {expense.expenseCategory}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{expense.bankAccount}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{expense.payeePartyName}</p>
                          <p className="text-xs text-slate-500 mt-1">{expense.expenseNote}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{expense.date}</td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">
                          ₹{expense.amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                          {expense.mode.charAt(0).toUpperCase() + expense.mode.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ExpenseActionsMenu
                          expense={expense}
                          onEdit={() => handleEdit(expense)}
                          onDelete={() => handleDelete(expense.id)}
                          onView={() => handleView(expense)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-600">
                      <Search className="mx-auto mb-4 text-slate-400" size={32} />
                      <p className="font-semibold text-slate-900 mb-1">No Transaction Found.</p>
                      <p className="text-sm">Try adjusting your filters or date range</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredExpenses.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold">{filteredExpenses.length}</span> of{' '}
                <span className="font-bold">{expenses.length}</span> expenses
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddNewBank
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddExpense}
        editData={editingExpense}
        categories={CATEGORIES}
        bankAccounts={BANK_ACCOUNTS}
      />
    </div>
  );
}

export default BankExpensePage;
