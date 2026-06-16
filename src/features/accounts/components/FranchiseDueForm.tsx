'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import { zodFieldErrors } from '@/lib/zod';
import { franchiseDueSchema, type FranchiseDueFormValues } from '../schemas/franchiseDue.schema';
import { FRANCHISE_DUE_STATUS_OPTIONS, FRANCHISE_OPTIONS } from '../constants/franchise-due';

const EMPTY: FranchiseDueFormValues = {
  date: new Date().toISOString().split('T')[0],
  invoiceNumber: '',
  patientName: '',
  ageDays: 0,
  due: 0,
  franchise: '',
  status: 'pending',
};

export interface FranchiseDueFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: FranchiseDueFormValues) => void;
  defaultValues?: FranchiseDueFormValues | null;
  franchiseOptions?: string[];
}

/** Franchise-due create/edit form, validated by `franchiseDueSchema` (Zod). */
export function FranchiseDueForm({
  isOpen,
  onClose,
  onSubmit,
  defaultValues,
  franchiseOptions = FRANCHISE_OPTIONS,
}: FranchiseDueFormProps) {
  const [form, setForm] = useState<FranchiseDueFormValues>(defaultValues ?? EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setForm(defaultValues ?? EMPTY);
    setErrors({});
  }, [defaultValues, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'ageDays' || name === 'due' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = franchiseDueSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    onSubmit(parsed.data);
    onClose();
  };

  if (!isOpen) return null;

  const inputCls = (err?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500 ${
      err ? 'border-red-500' : 'border-slate-300'
    }`;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={defaultValues ? 'Edit Franchise Due' : 'Add New Franchise Due'}
      description={defaultValues ? 'Update franchise due details' : 'Add a new franchise due'}
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
            form="franchise-due-form"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-2.5 font-bold text-white shadow-lg transition-all hover:from-teal-600 hover:to-blue-600 hover:shadow-xl"
          >
            Save
          </button>
        </div>
      }
      maxWidth="md"
    >
      <form id="franchise-due-form" onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Date <span className="text-red-500">*</span>
            </label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className={inputCls(errors.date)} />
            {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Invoice Number <span className="text-red-500">*</span>
            </label>
            <input type="text" name="invoiceNumber" placeholder="e.g., TL-INV-42" value={form.invoiceNumber} onChange={handleChange} className={inputCls(errors.invoiceNumber)} />
            {errors.invoiceNumber && <p className="mt-1 text-xs text-red-500">{errors.invoiceNumber}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Franchise <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select name="franchise" value={form.franchise} onChange={handleChange} className={`${inputCls(errors.franchise)} cursor-pointer appearance-none bg-white`}>
                <option value="">Please Select</option>
                {franchiseOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.franchise && <p className="mt-1 text-xs text-red-500">{errors.franchise}</p>}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Patient Name <span className="text-red-500">*</span>
            </label>
            <input type="text" name="patientName" placeholder="Enter patient name" value={form.patientName} onChange={handleChange} className={inputCls(errors.patientName)} />
            {errors.patientName && <p className="mt-1 text-xs text-red-500">{errors.patientName}</p>}
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">Age (Days)</label>
            <input type="number" name="ageDays" placeholder="0" min="0" value={form.ageDays || ''} onChange={handleChange} className={inputCls()} />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-900">
              Due Amount <span className="text-red-500">*</span>
            </label>
            <input type="number" name="due" placeholder="0.00" step="0.01" min="0" value={form.due || ''} onChange={handleChange} className={inputCls(errors.due)} />
            {errors.due && <p className="mt-1 text-xs text-red-500">{errors.due}</p>}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-900">Status</label>
          <div className="relative">
            <select name="status" value={form.status} onChange={handleChange} className={`${inputCls()} cursor-pointer appearance-none bg-white`}>
              {FRANCHISE_DUE_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}

export default FranchiseDueForm;
