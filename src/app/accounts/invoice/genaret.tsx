'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GenerateFormData {
  b2b: string;
  startDate: string;
  endDate: string;
  invoiceType: string;
}

interface GeneratePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GenerateFormData) => void;
  b2bOptions: string[];
}

const INVOICE_TYPES = ['Due Invoices', 'All Invoices', 'Paid Invoices', 'Partial Invoices'];

const EMPTY: GenerateFormData = {
  b2b: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date().toISOString().split('T')[0],
  invoiceType: 'Due Invoices',
};

// ─── Component ────────────────────────────────────────────────────────────────
const GeneratePopup = ({ isOpen, onClose, onSubmit, b2bOptions }: GeneratePopupProps) => {
  const [form, setForm] = useState<GenerateFormData>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof GenerateFormData, string>>>({});

  useEffect(() => {
    if (isOpen) { setForm({ ...EMPTY, b2b: b2bOptions[0] ?? '' }); setErrors({}); }
  }, [isOpen, b2bOptions]);

  if (!isOpen) return null;

  const set = (field: keyof GenerateFormData, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = () => {
    const e: Partial<Record<keyof GenerateFormData, string>> = {};
    if (!form.b2b) e.b2b = 'Please select a B2B';
    if (!form.startDate) e.startDate = 'Start date required';
    if (!form.endDate) e.endDate = 'End date required';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date cannot be before start date';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Generate Invoice</h2>
            <p className="text-sm text-slate-500 mt-0.5">Set criteria to generate one invoice</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Invoice Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Invoice Type</label>
            <div className="relative">
              <select
                value={form.invoiceType}
                onChange={(e) => set('invoiceType', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none bg-white cursor-pointer"
              >
                {INVOICE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Select B2B */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
              Select B2B <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.b2b}
                onChange={(e) => set('b2b', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none bg-white cursor-pointer ${
                  errors.b2b ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                }`}
              >
                <option value="">Select B2B</option>
                {b2bOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            {errors.b2b && <p className="text-xs text-rose-500 mt-1">{errors.b2b}</p>}
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                From <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 ${
                  errors.startDate ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                }`}
              />
              {errors.startDate && <p className="text-xs text-rose-500 mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">
                To <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 ${
                  errors.endDate ? 'border-rose-400 bg-rose-50' : 'border-slate-300'
                }`}
              />
              {errors.endDate && <p className="text-xs text-rose-500 mt-1">{errors.endDate}</p>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-md"
          >
            + Generate
          </button>
        </div>
      </div>
    </div>
  );
};

export default GeneratePopup;