'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, CreditCard, FileText, Plus, Printer, Search } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common';
import { formatCurrency } from '@/lib/format';
import { GenerateInvoiceForm } from '../components/GenerateInvoiceForm';
import { AmountPaymentDialog } from '../components/AmountPaymentDialog';
import {
  INVOICE_B2B_OPTIONS,
  INVOICE_PAYMENT_MODES,
  INVOICE_TYPE_OPTIONS,
  SAMPLE_INVOICE_RECORDS,
} from '../constants/invoice';
import type { OneInvoiceRecord } from '../types/accounts.types';
import type { GenerateInvoiceFormValues } from '../schemas/generateInvoice.schema';

/** Consolidated B2B "One Invoice" management. TODO: replace fixture with a Query hook. */
export function InvoicePage() {
  const [records, setRecords] = useState<OneInvoiceRecord[]>(SAMPLE_INVOICE_RECORDS);
  const [search, setSearch] = useState('');
  const [invoiceTypeFilter, setInvoiceTypeFilter] = useState('Due Invoices');
  const [b2bFilter, setB2bFilter] = useState('all');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selected, setSelected] = useState<OneInvoiceRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const matchesType = invoiceTypeFilter === 'all' || r.invoiceType === invoiceTypeFilter;
      const matchesB2b = b2bFilter === 'all' || r.b2bDetails === b2bFilter;
      const matchesSearch =
        r.b2bDetails.toLowerCase().includes(q) || r.startDate.includes(search) || r.endDate.includes(search);
      return matchesType && matchesB2b && matchesSearch;
    });
  }, [records, search, invoiceTypeFilter, b2bFilter]);

  const totalAmount = filtered.reduce((s, r) => s + r.totalAmount, 0);
  const totalDue = filtered.reduce((s, r) => s + (r.totalAmount - r.paidAmount), 0);

  const handleGenerate = (data: GenerateInvoiceFormValues) => {
    setRecords((prev) => [
      {
        id: Math.max(0, ...prev.map((r) => r.id)) + 1,
        b2bDetails: data.b2b,
        startDate: data.startDate,
        endDate: data.endDate,
        invoiceCount: 1,
        totalAmount: 0,
        paidAmount: 0,
        invoiceType: data.invoiceType,
      },
      ...prev,
    ]);
  };

  const handlePayment = (amount: string) => {
    if (!selected) return;
    const paid = parseFloat(amount) || 0;
    setRecords((prev) =>
      prev.map((r) =>
        r.id === selected.id ? { ...r, paidAmount: Math.min(r.paidAmount + paid, r.totalAmount) } : r,
      ),
    );
  };

  const columns = useMemo<DataTableColumn<OneInvoiceRecord>[]>(
    () => [
      { key: 'index', label: '#', render: (_r, i) => <span className="font-semibold text-slate-500">{i + 1}</span> },
      {
        key: 'b2bDetails',
        label: 'B2B Details',
        render: (r) => (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100">
              <FileText size={14} className="text-[#FF671F]" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{r.b2bDetails}</p>
              <span className="mt-1 inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{r.invoiceType}</span>
            </div>
          </div>
        ),
      },
      {
        key: 'period',
        label: 'Invoice Period',
        render: (r) => (
          <div>
            <p className="font-mono text-sm font-semibold text-slate-900">
              {r.startDate} ~ {r.endDate}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {r.invoiceCount} invoice{r.invoiceCount !== 1 ? 's' : ''}
            </p>
          </div>
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        render: (r) => {
          const due = r.totalAmount - r.paidAmount;
          return (
            <div>
              <p className="text-sm font-bold text-slate-900">
                {r.totalAmount.toFixed(2)}/{r.paidAmount.toFixed(2)}
              </p>
              {due > 0 && <p className="mt-0.5 text-xs font-semibold text-rose-500">Due: ₹{due.toFixed(2)}</p>}
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: 'Action',
        align: 'center',
        render: (r) => (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-700">
              <Printer size={12} /> Print
            </button>
            <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-green-600">
              <Printer size={12} /> Print2
            </button>
            <button
              onClick={() => {
                setSelected(r);
                setPaymentOpen(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-blue-700"
            >
              <CreditCard size={12} /> Payment
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const selectCls =
    'w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900">
                <span className="text-[#FF671F]">One</span> Invoice
              </h1>
              <p className="max-w-2xl text-base text-slate-600">
                Manage consolidated B2B invoices, track payments, and generate new invoice records.
              </p>
            </div>
            <button
              onClick={() => setGenerateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-blue-700 hover:shadow-xl"
            >
              <Plus size={18} /> Generate
            </button>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search B2B, date…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Invoice Type</label>
              <div className="relative">
                <select value={invoiceTypeFilter} onChange={(e) => setInvoiceTypeFilter(e.target.value)} className={selectCls}>
                  <option value="all">All Types</option>
                  {INVOICE_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Select B2B</label>
              <div className="relative">
                <select value={b2bFilter} onChange={(e) => setB2bFilter(e.target.value)} className={selectCls}>
                  <option value="all">Select B2B</option>
                  {INVOICE_B2B_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-600">Total Invoice Amount</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalAmount, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="mb-1 text-sm font-medium text-slate-600">Invoices</p>
                <p className="text-3xl font-bold text-blue-600">{filtered.length}</p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-sm font-medium text-slate-600">Total Due</p>
                <p className="text-3xl font-bold text-rose-500">{formatCurrency(totalDue, { maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} rowKey={(r) => r.id} emptyMessage="No Invoices Found." />
      </div>

      <GenerateInvoiceForm isOpen={generateOpen} onClose={() => setGenerateOpen(false)} onSubmit={handleGenerate} b2bOptions={INVOICE_B2B_OPTIONS} />

      <AmountPaymentDialog
        open={paymentOpen}
        title="OneInvoice Payment"
        onClose={() => {
          setPaymentOpen(false);
          setSelected(null);
        }}
        onSubmit={handlePayment}
        modes={INVOICE_PAYMENT_MODES}
        maxDue={selected ? selected.totalAmount - selected.paidAmount : 0}
        dueLabel="Outstanding Due"
        submitLabel="Payment"
      />
    </div>
  );
}

export default InvoicePage;
