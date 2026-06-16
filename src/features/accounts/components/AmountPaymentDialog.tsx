'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AmountPaymentDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (amount: string, mode: string) => void;
  modes: string[];
  /** Outstanding amount shown as a hint and in the input placeholder. */
  maxDue?: number;
  /** Label for the outstanding-due row; omit to hide the row. */
  dueLabel?: string;
  submitLabel?: string;
  accent?: 'blue' | 'green';
}

/**
 * Reusable "enter amount + payment mode" dialog. Replaces the duplicated
 * PaymentPopup / AutoPayPopup modals across the invoice and franchise-due pages.
 */
export function AmountPaymentDialog({
  open,
  title,
  onClose,
  onSubmit,
  modes,
  maxDue,
  dueLabel,
  submitLabel = 'Submit',
  accent = 'blue',
}: AmountPaymentDialogProps) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState(modes[0] ?? 'Cash');

  if (!open) return null;

  const accentBtn =
    accent === 'green' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';
  const ring = accent === 'green' ? 'focus:ring-green-500' : 'focus:ring-blue-500';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xl font-bold text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-5 p-6">
          {dueLabel && (
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
              <span className="text-xs font-semibold uppercase text-slate-500">{dueLabel}</span>
              <span className="text-lg font-bold text-rose-600">₹{(maxDue ?? 0).toLocaleString('en-IN')}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Amount</label>
            <input
              type="number"
              placeholder={maxDue != null ? `Max ₹${maxDue.toLocaleString('en-IN')}` : '0.00'}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full rounded-lg border border-slate-300 px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 ${ring}`}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Payment Mode</label>
            <div className="relative">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={`w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 ${ring}`}
              >
                {modes.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-semibold text-slate-700 transition-all hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSubmit(amount, mode);
                onClose();
                setAmount('');
                setMode(modes[0] ?? 'Cash');
              }}
              className={`flex-1 rounded-lg px-4 py-2.5 font-bold text-white transition-all ${accentBtn}`}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AmountPaymentDialog;
