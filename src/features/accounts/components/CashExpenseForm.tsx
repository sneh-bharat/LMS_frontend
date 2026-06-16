'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
  cashExpenseSchema,
  toFieldErrors,
  type CashExpenseFormValues,
} from '../schemas/cashExpense.schema';
import { CASH_EXPENSE_CATEGORIES, CASH_EXPENSE_PAYMENT_MODES } from '../constants/cash-expense';

const EMPTY: CashExpenseFormValues = {
  expenseCategory: '',
  payeePartyName: '',
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  mode: 'cash',
  expenseNote: '',
};

export interface CashExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CashExpenseFormValues) => void;
  defaultValues?: CashExpenseFormValues | null;
  categories?: readonly string[];
}

/**
 * Cash-expense create/edit form. Validation is driven by `cashExpenseSchema` (Zod)
 * instead of the previous hand-rolled `validateForm()`.
 */
export function CashExpenseForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  categories = CASH_EXPENSE_CATEGORIES,
}: CashExpenseFormProps) {
  const [form, setForm] = useState<CashExpenseFormValues>(defaultValues ?? EMPTY);
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
    const parsed = cashExpenseSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      return;
    }
    onSubmit(parsed.data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title="Cash Expense Management"
      description="Cash Expense Management"
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
            form="cash-expense-form"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:from-teal-600 hover:to-blue-600 hover:shadow-xl"
          >
            Save
          </button>
        </div>
      }
      maxWidth="md"
    >
      <form id="cash-expense-form" onSubmit={handleSubmit} className="space-y-6 p-6">
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
                className={`w-full cursor-pointer appearance-none rounded-lg border bg-white px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.expenseCategory ? 'border-red-500' : 'border-slate-300'
                }`}
              >
                <option value="">Please Select</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
            {errors.expenseCategory && (
              <p className="mt-1 text-xs text-red-500">{errors.expenseCategory}</p>
            )}
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Mode</label>
            <div className="relative">
              <select
                name="mode"
                value={form.mode}
                onChange={handleChange}
                className="w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CASH_EXPENSE_PAYMENT_MODES.map((method) => (
                  <option key={method} value={method.toLowerCase()}>
                    {method}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Payee/Party Name
            </label>
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

export default CashExpenseForm;
