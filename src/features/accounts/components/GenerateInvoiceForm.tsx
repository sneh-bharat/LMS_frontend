'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { zodFieldErrors } from '@/lib/zod';
import { generateInvoiceSchema, type GenerateInvoiceFormValues } from '../schemas/generateInvoice.schema';
import { INVOICE_TYPE_OPTIONS } from '../constants/invoice';

export interface GenerateInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: GenerateInvoiceFormValues) => void;
  b2bOptions: string[];
}

/** "Generate Invoice" modal, validated by `generateInvoiceSchema` (Zod). */
export function GenerateInvoiceForm({ isOpen, onClose, onSubmit, b2bOptions }: GenerateInvoiceFormProps) {
  const empty: GenerateInvoiceFormValues = {
    b2b: b2bOptions[0] ?? '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    invoiceType: 'Due Invoices',
  };
  const [form, setForm] = useState<GenerateInvoiceFormValues>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setForm({ ...empty, b2b: b2bOptions[0] ?? '' });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, b2bOptions]);

  if (!isOpen) return null;

  const set = (field: keyof GenerateInvoiceFormValues, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const handleSubmit = () => {
    const parsed = generateInvoiceSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(zodFieldErrors(parsed.error));
      return;
    }
    onSubmit(parsed.data);
    onClose();
  };

  const inputCls = (err?: string) =>
    `w-full rounded-lg border px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      err ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Generate Invoice</h2>
            <p className="mt-0.5 text-sm text-slate-500">Set criteria to generate one invoice</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Invoice Type</label>
            <div className="relative">
              <select value={form.invoiceType} onChange={(e) => set('invoiceType', e.target.value)} className={`${inputCls()} cursor-pointer appearance-none bg-white`}>
                {INVOICE_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">
              Select B2B <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select value={form.b2b} onChange={(e) => set('b2b', e.target.value)} className={`${inputCls(errors.b2b)} cursor-pointer appearance-none bg-white`}>
                <option value="">Select B2B</option>
                {b2bOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
            {errors.b2b && <p className="mt-1 text-xs text-rose-500">{errors.b2b}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">
                From <span className="text-rose-500">*</span>
              </label>
              <input type="date" value={form.startDate} onChange={(e) => set('startDate', e.target.value)} className={inputCls(errors.startDate)} />
              {errors.startDate && <p className="mt-1 text-xs text-rose-500">{errors.startDate}</p>}
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">
                To <span className="text-rose-500">*</span>
              </label>
              <input type="date" value={form.endDate} onChange={(e) => set('endDate', e.target.value)} className={inputCls(errors.endDate)} />
              {errors.endDate && <p className="mt-1 text-xs text-rose-500">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-lg border border-slate-300 px-5 py-2.5 font-semibold text-slate-700 transition-all hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} className="rounded-lg bg-blue-600 px-6 py-2.5 font-bold text-white shadow-md transition-all hover:bg-blue-700">
            + Generate
          </button>
        </div>
      </div>
    </div>
  );
}

export default GenerateInvoiceForm;
