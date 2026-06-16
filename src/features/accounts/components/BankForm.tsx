'use client';

import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { zodFieldErrors } from '@/lib/zod';
import { bankSchema, type BankFormValues } from '../schemas/bank.schema';

const EMPTY: BankFormValues = {
  bankName: '',
  branch: '',
  accountNumber: '',
  ifscCode: '',
  contactNumber: '',
  email: '',
  accountHolderName: '',
  status: 'Active',
  openingBalance: 0,
  currentBalance: 0,
};

export interface BankFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: BankFormValues) => void;
  defaultValues?: BankFormValues | null;
  isEditMode?: boolean;
}

function TextField({
  label,
  name,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
}: {
  label: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full rounded-xl border px-4 py-3 font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:ring-4 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
            : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10'
        }`}
      />
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-rose-600">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
}

/** Bank account create/edit form, validated by `bankSchema` (Zod). */
export function BankForm({ isOpen, onClose, onSubmit, defaultValues, isEditMode }: BankFormProps) {
  const [form, setForm] = useState<BankFormValues>(defaultValues ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(defaultValues ?? EMPTY);
    setErrors({});
  }, [defaultValues, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = () => {
    const parsed = bankSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
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
      title={
        <>
          {isEditMode ? 'Edit Bank' : 'Add New Bank'} <span className="text-emerald-200">Account</span>
        </>
      }
      description={isEditMode ? 'Update bank account details' : 'Add a new bank account'}
      footer={
        <div className="flex w-full gap-3">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="button" variant="gradient" onClick={handleSubmit} className="flex-1">
            Save Bank Account
          </Button>
        </div>
      }
      maxWidth="lg"
    >
      <form
        id="bank-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        <div>
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField label="Bank Name *" name="bankName" value={form.bankName} onChange={handleChange} error={errors.bankName} placeholder="e.g., HDFC Bank" />
            <TextField label="Branch Name *" name="branch" value={form.branch} onChange={handleChange} error={errors.branch} placeholder="e.g., Connaught Place" />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
            Account Details
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField label="Account Number *" name="accountNumber" value={form.accountNumber} onChange={handleChange} error={errors.accountNumber} placeholder="e.g., 50200012345678" />
            <TextField label="IFSC Code *" name="ifscCode" value={form.ifscCode} onChange={handleChange} error={errors.ifscCode} placeholder="e.g., HDFC0001234" />
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField label="Account Holder Name *" name="accountHolderName" value={form.accountHolderName} onChange={handleChange} error={errors.accountHolderName} placeholder="e.g., Think Lab Diagnostics Pvt Ltd" />
            <TextField label="Contact Number *" name="contactNumber" type="tel" value={form.contactNumber} onChange={handleChange} error={errors.contactNumber} placeholder="+91 11 2345 6789" />
            <TextField label="Email Address *" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="branch@bank.com" />
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-700">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">
            Balance Information
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <TextField label="Opening Balance (₹)" name="openingBalance" type="number" value={form.openingBalance} onChange={handleChange} error={errors.openingBalance} />
            <TextField label="Current Balance (₹)" name="currentBalance" type="number" value={form.currentBalance} onChange={handleChange} error={errors.currentBalance} />
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}

export default BankForm;
