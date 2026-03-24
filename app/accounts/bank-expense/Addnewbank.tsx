'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

export interface FormData {
  expenseCategory: string;
  bankAccount: string;
  mode: 'cash' | 'cheque' | 'online' | 'card' | 'transfer';
  payeePartyName: string;
  amount: number | string;
  date: string;
  expenseNote: string;
}

interface AddNewBankProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  editData?: FormData | null;
  categories?: string[];
  bankAccounts?: string[];
}

const PAYMENT_MODES = ['Cash', 'Cheque', 'Online', 'Card', 'Transfer'];
const DEFAULT_CATEGORIES = [
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

const DEFAULT_BANK_ACCOUNTS = [
  'Primary Account - HDFC Bank (XXXX1234)',
  'Secondary Account - ICICI Bank (XXXX5678)',
  'Operational Account - SBI Bank (XXXX9012)',
  'Savings Account - Axis Bank (XXXX3456)',
];

export default function AddNewBank({
  isOpen,
  onClose,
  onSubmit,
  editData,
  categories = DEFAULT_CATEGORIES,
  bankAccounts = DEFAULT_BANK_ACCOUNTS,
}: AddNewBankProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>(
    editData || {
      expenseCategory: '',
      bankAccount: '',
      mode: 'transfer',
      payeePartyName: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      expenseNote: '',
    }
  );

  useEffect(() => {
    if (editData) {
      setFormData(editData);
    } else {
      setFormData({
        expenseCategory: '',
        bankAccount: '',
        mode: 'transfer',
        payeePartyName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        expenseNote: '',
      });
    }
  }, [editData, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amount' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.expenseCategory) {
      newErrors.expenseCategory = 'Expense category is required';
    }

    if (!formData.bankAccount) {
      newErrors.bankAccount = 'Bank account is required';
    }

    if (!formData.amount || Number(formData.amount) <= 0) {
      newErrors.amount = 'Valid amount is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
    
    if (!editData) {
      setFormData({
        expenseCategory: '',
        bankAccount: '',
        mode: 'transfer',
        payeePartyName: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        expenseNote: '',
      });
      setErrors({});
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 bg-white">
          <h2 className="text-xl font-bold text-slate-900">
            Bank Expense Management
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Expense Category, Bank Account, Mode - Three Column */}
          <div className="grid grid-cols-3 gap-4">
            {/* Expense Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Expense Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="expenseCategory"
                  value={formData.expenseCategory}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer ${
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
              </div>
              {errors.expenseCategory && (
                <p className="mt-1 text-xs text-red-500">{errors.expenseCategory}</p>
              )}
            </div>

            {/* Bank Account */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Bank Account <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer ${
                    errors.bankAccount ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Please Select</option>
                  {bankAccounts.map((account) => (
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
              {errors.bankAccount && (
                <p className="mt-1 text-xs text-red-500">{errors.bankAccount}</p>
              )}
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Mode
              </label>
              <div className="relative">
                <select
                  name="mode"
                  value={formData.mode}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  {PAYMENT_MODES.map((method) => (
                    <option key={method} value={method.toLowerCase()}>
                      {method}
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

          {/* Payee/Party Name, Amount, Date - Three Column */}
          <div className="grid grid-cols-3 gap-4">
            {/* Payee/Party Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Payee/Party Name
              </label>
              <input
                type="text"
                name="payeePartyName"
                placeholder="Enter name"
                value={formData.payeePartyName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 ${
                  errors.amount ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 ${
                  errors.date ? 'border-red-500' : 'border-slate-300'
                }`}
              />
              {errors.date && (
                <p className="mt-1 text-xs text-red-500">{errors.date}</p>
              )}
            </div>
          </div>

          {/* Expense Note */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Expense Note
            </label>
            <textarea
              name="expenseNote"
              placeholder="Enter expense note"
              value={formData.expenseNote}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}