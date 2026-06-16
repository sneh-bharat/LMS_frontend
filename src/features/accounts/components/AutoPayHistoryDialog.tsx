'use client';

import { FileText } from 'lucide-react';

export interface AutoPayHistoryRecord {
  date: string;
  amount: string;
  mode: string;
}

export interface AutoPayHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  records: AutoPayHistoryRecord[];
}

export function AutoPayHistoryDialog({ open, onClose, records }: AutoPayHistoryDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">Auto Pay History</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-xl text-slate-500 transition-colors hover:bg-rose-100 hover:text-rose-600"
          >
            ×
          </button>
        </div>
        <div className="p-6">
          {records.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              <FileText className="mx-auto mb-3 text-slate-300" size={36} />
              <p className="font-semibold">No payment history yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600">Date</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">{r.date}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">₹{parseFloat(r.amount || '0').toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">{r.mode}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default AutoPayHistoryDialog;
