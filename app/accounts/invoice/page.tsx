'use client';

import { useState } from 'react';
import {
  Printer,
  CreditCard,
  ChevronDown,
  MoreHorizontal,
  Search,
  Plus,
  FileText,
} from 'lucide-react';
import GeneratePopup, { GenerateFormData } from './genaret';

// ─── Types ────────────────────────────────────────────────────────────────────
interface OneInvoiceRecord {
  id: number;
  b2bDetails: string;
  startDate: string;
  endDate: string;
  invoiceCount: number;
  totalAmount: number;
  paidAmount: number;
  invoiceType: string;
}

// ─── Static data ─────────────────────────────────────────────────────────────
const B2B_OPTIONS = [
  'Credit Franchise',
  'HO(IP)',
  'Cash',
  'Credit',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
];

const INVOICE_TYPE_OPTIONS = ['Due Invoices', 'All Invoices', 'Paid Invoices', 'Partial Invoices'];

const PAYMENT_MODES = ['Cash', 'Cheque', 'Card', 'UPI', 'Net Banking', 'eSeva'];

const SAMPLE_RECORDS: OneInvoiceRecord[] = [
  { id: 1, b2bDetails: 'Credit Franchise', startDate: '2025-01-07', endDate: '2025-01-07', invoiceCount: 1, totalAmount: 2640, paidAmount: 2000, invoiceType: 'Due Invoices' },
  { id: 2, b2bDetails: 'Credit Franchise', startDate: '2025-01-06', endDate: '2025-01-06', invoiceCount: 1, totalAmount: 138, paidAmount: 0,    invoiceType: 'Due Invoices' },
  { id: 3, b2bDetails: 'Credit Franchise', startDate: '2025-01-06', endDate: '2025-01-06', invoiceCount: 1, totalAmount: 148, paidAmount: 0,    invoiceType: 'Due Invoices' },
  { id: 4, b2bDetails: 'Credit Franchise', startDate: '2025-01-06', endDate: '2025-01-06', invoiceCount: 3, totalAmount: 1043, paidAmount: 500, invoiceType: 'Due Invoices' },
];

// ─── Payment Popup (OneInvoice Payment) ──────────────────────────────────────
function PaymentPopup({
  open,
  onClose,
  onSubmit,
  record,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: string, mode: string) => void;
  record: OneInvoiceRecord | null;
}) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');

  if (!open || !record) return null;

  const due = record.totalAmount - record.paidAmount;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">OneInvoice Payment</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 text-xl transition-colors font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Due info */}
          <div className="bg-slate-50 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase">Outstanding Due</span>
            <span className="font-bold text-rose-600 text-lg">₹{due.toLocaleString('en-IN')}</span>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Amount</label>
            <input
              type="number"
              placeholder={`Max ₹${due.toLocaleString('en-IN')}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900"
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Payment Mode</label>
            <div className="relative">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
              >
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-500 text-white font-semibold rounded-lg hover:bg-slate-600 transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onSubmit(amount, mode);
                onClose();
                setAmount('');
                setMode('Cash');
              }}
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
            >
              Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Amount display ───────────────────────────────────────────────────────────
function AmountCell({ total, paid }: { total: number; paid: number }) {
  const due = total - paid;
  return (
    <div>
      <p className="font-bold text-slate-900 text-sm">
        {total.toFixed(2)}/{paid.toFixed(2)}
      </p>
      {due > 0 && (
        <p className="text-xs text-rose-500 font-semibold mt-0.5">Due: ₹{due.toFixed(2)}</p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const OneInvoicePage = () => {
  const [records, setRecords] = useState<OneInvoiceRecord[]>(SAMPLE_RECORDS);
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('Due Invoices');
  const [b2bFilter, setB2bFilter] = useState('all');
  const [search, setSearch] = useState('');

  const [generateOpen, setGenerateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<OneInvoiceRecord | null>(null);

  const filteredRecords = records.filter((r) => {
    const matchesType = invoiceTypeFilter === 'all' || r.invoiceType === invoiceTypeFilter;
    const matchesB2b = b2bFilter === 'all' || r.b2bDetails === b2bFilter;
    const matchesSearch =
      r.b2bDetails.toLowerCase().includes(search.toLowerCase()) ||
      r.startDate.includes(search) ||
      r.endDate.includes(search);
    return matchesType && matchesB2b && matchesSearch;
  });

  const handleGenerate = (data: GenerateFormData) => {
    const newRecord: OneInvoiceRecord = {
      id: Math.max(...records.map((r) => r.id), 0) + 1,
      b2bDetails: data.b2b,
      startDate: data.startDate,
      endDate: data.endDate,
      invoiceCount: 1,
      totalAmount: 0,
      paidAmount: 0,
      invoiceType: data.invoiceType,
    };
    setRecords([newRecord, ...records]);
  };

  const handlePaymentSubmit = (amount: string, mode: string) => {
    if (!selectedRecord) return;
    const paid = parseFloat(amount) || 0;
    setRecords(records.map((r) =>
      r.id === selectedRecord.id
        ? { ...r, paidAmount: Math.min(r.paidAmount + paid, r.totalAmount) }
        : r
    ));
  };

  const totalDue = filteredRecords.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);
  const totalAmount = filteredRecords.reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">

      {/* ── Header ── */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Title row */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="text-blue-600">One</span> Invoice
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Manage consolidated B2B invoices, track payments, and generate new invoice records.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setGenerateOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={18} /> Generate
              </button>
            </div>
          </div>

          {/* Filters row */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search B2B, date…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Invoice Type filter */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Invoice Type</label>
              <div className="relative">
                <select
                  value={invoiceTypeFilter}
                  onChange={(e) => setInvoiceTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All Types</option>
                  {INVOICE_TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* B2B filter */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Select B2B</label>
              <div className="relative">
                <select
                  value={b2bFilter}
                  onChange={(e) => setB2bFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">Select B2B</option>
                  {B2B_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-slate-600 text-sm font-medium mb-1">Total Invoice Amount</p>
              <p className="text-3xl font-bold text-slate-900">
                ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Invoices</p>
                <p className="text-3xl font-bold text-blue-600">{filteredRecords.length}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Total Due</p>
                <p className="text-3xl font-bold text-rose-500">
                  ₹{totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">B2B Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r, index) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500">{index + 1}</td>

                      {/* B2B Details */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FileText size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{r.b2bDetails}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-semibold mt-1">
                              {r.invoiceType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Invoice Period */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 font-mono">
                            {r.startDate} ~ {r.endDate}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {r.invoiceCount} invoice{r.invoiceCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <AmountCell total={r.totalAmount} paid={r.paidAmount} />
                      </td>

                      {/* Action buttons */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                          >
                            <Printer size={12} /> Print
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all"
                          >
                            <Printer size={12} /> Print2
                          </button>
                          <button
                            onClick={() => { setSelectedRecord(r); setPaymentOpen(true); }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
                          >
                            <CreditCard size={12} /> Payment
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Search className="mx-auto mb-4 text-slate-300" size={36} />
                      <p className="font-semibold text-slate-900 mb-1">No Invoices Found.</p>
                      <p className="text-sm text-slate-500">Try adjusting your filters or generate a new invoice</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredRecords.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{filteredRecords.length}</span> of{' '}
                <span className="font-bold text-slate-900">{records.length}</span> invoices
              </p>
              <p className="text-sm font-bold text-slate-900">
                Total Due:{' '}
                <span className="text-rose-600 text-base">
                  ₹{totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Generate Popup (from genaret.tsx) ── */}
      <GeneratePopup
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSubmit={handleGenerate}
        b2bOptions={B2B_OPTIONS}
      />

      {/* ── Payment Popup ── */}
      <PaymentPopup
        open={paymentOpen}
        onClose={() => { setPaymentOpen(false); setSelectedRecord(null); }}
        onSubmit={handlePaymentSubmit}
        record={selectedRecord}
      />
    </div>
  );
};

export default OneInvoicePage;