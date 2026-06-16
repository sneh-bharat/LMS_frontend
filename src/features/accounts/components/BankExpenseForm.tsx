'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import { zodFieldErrors } from '@/lib/zod';
import { bankExpenseSchema, type BankExpenseFormValues } from '../schemas/bankExpense.schema';
import {
  BANK_ACCOUNTS,
  BANK_EXPENSE_CATEGORIES,
  BANK_EXPENSE_PAYMENT_MODES,
} from '../constants/bank-expense';

const EMPTY: BankExpenseFormValues = {
  expenseCategory: '',
  bankAccount: '',
  mode: 'transfer',
  payeePartyName: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  expenseNote: '',
};

export interface BankExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BankExpenseFormValues) => void;
  defaultValues?: BankExpenseFormValues | null;
}

/** Bank-expense create/edit form, validated by `bankExpenseSchema` (Zod). */
export function BankExpenseForm({ isOpen, onClose, onSubmit, defaultValues }: BankExpenseFormProps) {
  const [form, setForm] = useState<BankExpenseFormValues>(defaultValues ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(defaultValues ?? EMPTY);
    setErrors({});
  }, [defaultValues, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = bankExpenseSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    onSubmit(parsed.data);
    onClose();
  };

  if (!isOpen) return null;

  const selectCls =
    'w-full cursor-pointer appearance-none rounded-lg border bg-white px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Bank Expense Management"
      description="Bank Expense Management"
      footer={
        <div className="flex w-full gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-300 px-6 py-2.5 font-bold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="bank-expense-form"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
          >
            Save
          </button>
        </div>
      }
      maxWidth="md"
    >
      <form id="bank-expense-form" onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Expense Category <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="expenseCategory"
                value={form.expenseCategory}
                onChange={handleChange}
                className={`${selectCls} ${errors.expenseCategory ? 'border-red-500' : 'border-slate-300'}`}
              >
                <option value="">Please Select</option>
                {BANK_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.expenseCategory && <p className="mt-1 text-xs text-red-500">{errors.expenseCategory}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Mode</label>
            <div className="relative">
              <select name="mode" value={form.mode} onChange={handleChange} className={`${selectCls} border-slate-300`}>
                {BANK_EXPENSE_PAYMENT_MODES.map((method) => (
                  <option key={method} value={method.toLowerCase()}>
                    {method}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">
            Bank Account <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="bankAccount"
              value={form.bankAccount}
              onChange={handleChange}
              className={`${selectCls} ${errors.bankAccount ? 'border-red-500' : 'border-slate-300'}`}
            >
              <option value="">Please Select</option>
              {BANK_ACCOUNTS.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          {errors.bankAccount && <p className="mt-1 text-xs text-red-500">{errors.bankAccount}</p>}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Payee/Party Name</label>
            <input
              type="text"
              name="payeePartyName"
              placeholder="Enter name"
              value={form.payeePartyName}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              placeholder="0.00"
              value={form.amount || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.amount && <p className="mt-1 text-xs text-red-500">{errors.amount}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={`w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-slate-300'
              }`}
            />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Expense Note</label>
          <textarea
            name="expenseNote"
            placeholder="Enter expense note"
            value={form.expenseNote}
            onChange={handleChange}
            rows={4}
            className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </form>
    </RightDrawer>
  );
}

export default BankExpenseForm;
