'use client';

import { useMemo, useState } from 'react';
import { ChevronDown, Download, Plus, Search } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/common';
import { formatCurrency } from '@/lib/format';
import { FranchiseDueForm } from '../components/FranchiseDueForm';
import { RowActionsMenu } from '../components/RowActionsMenu';
import { AmountPaymentDialog } from '../components/AmountPaymentDialog';
import { AutoPayHistoryDialog, type AutoPayHistoryRecord } from '../components/AutoPayHistoryDialog';
import {
  DATE_FILTER_OPTIONS,
  FRANCHISE_DUE_STATUS_STYLES,
  FRANCHISE_OPTIONS,
  FRANCHISE_PAYMENT_MODES,
  SAMPLE_DUE_RECORDS,
  agePillClass,
} from '../constants/franchise-due';
import type { FranchiseDue } from '../types/accounts.types';
import type { FranchiseDueFormValues } from '../schemas/franchiseDue.schema';

function toForm(record: FranchiseDue): FranchiseDueFormValues {
  const { id: _id, createdAt: _createdAt, ...rest } = record;
  return rest;
}

/** Franchise due list. TODO: replace `SAMPLE_DUE_RECORDS` with a Query hook. */
export function FranchiseDuePage() {
  const [records, setRecords] = useState<FranchiseDue[]>(SAMPLE_DUE_RECORDS);
  const [search, setSearch] = useState('');
  const [franchiseFilter, setFranchiseFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FranchiseDue | null>(null);
  const [autoPayOpen, setAutoPayOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [payHistory, setPayHistory] = useState<AutoPayHistoryRecord[]>([]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const matchesSearch =
        r.patientName.toLowerCase().includes(q) ||
        r.invoiceNumber.toLowerCase().includes(q) ||
        r.franchise.toLowerCase().includes(q);
      const matchesFranchise = franchiseFilter === 'all' || r.franchise === franchiseFilter;
      return matchesSearch && matchesFranchise;
    });
  }, [records, search, franchiseFilter]);

  const totalDue = filtered.reduce((s, r) => s + r.due, 0);
  const overdueCount = filtered.filter((r) => r.status === 'overdue').length;

  const handleSubmit = (values: FranchiseDueFormValues) => {
    if (editing) {
      setRecords((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...values } : r)));
    } else {
      setRecords((prev) => [
        ...prev,
        { id: Math.max(0, ...prev.map((r) => r.id)) + 1, ...values, createdAt: new Date().toISOString().split('T')[0] },
      ]);
    }
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Delete this due record?')) setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const columns = useMemo<DataTableColumn<FranchiseDue>[]>(
    () => [
      { key: 'index', label: '#', render: (_r, i) => <span className="font-semibold">{i + 1}</span> },
      { key: 'date', label: 'Date', render: (r) => <span className="text-sm text-slate-600">{r.date}</span> },
      {
        key: 'invoiceNumber',
        label: 'Invoice Number',
        render: (r) => (
          <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-slate-700">{r.invoiceNumber}</span>
        ),
      },
      { key: 'patientName', label: 'Patient Name', render: (r) => <span className="text-sm font-semibold text-slate-900">{r.patientName}</span> },
      {
        key: 'franchise',
        label: 'Franchise',
        render: (r) => <span className="inline-flex items-center rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">{r.franchise}</span>,
      },
      {
        key: 'ageDays',
        label: 'Age (Days)',
        render: (r) => <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${agePillClass(r.ageDays)}`}>{r.ageDays} days</span>,
      },
      { key: 'due', label: 'Due Amount', render: (r) => <span className="text-sm font-bold text-slate-900">{formatCurrency(r.due, { maximumFractionDigits: 2 })}</span> },
      {
        key: 'status',
        label: 'Status',
        render: (r) => (
          <span className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold ${FRANCHISE_DUE_STATUS_STYLES[r.status] ?? ''}`}>
            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Action',
        align: 'center',
        render: (r) => (
          <RowActionsMenu
            onEdit={() => {
              setEditing(r);
              setIsModalOpen(true);
            }}
            onView={() => {
              setEditing(r);
              setIsModalOpen(true);
            }}
            onDelete={() => handleDelete(r.id)}
          />
        ),
      },
    ],
    [],
  );

  const selectCls =
    'w-full cursor-pointer appearance-none rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-slate-900">
                <span className="text-green-600">Franchise</span> Due List
              </h1>
              <p className="max-w-2xl text-base text-slate-600">
                Track outstanding dues, overdue invoices, and franchise payment records.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-3 font-bold text-slate-700 transition-all hover:bg-slate-50">
                <Download size={18} /> Export
              </button>
              <button
                onClick={() => {
                  setEditing(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-teal-600 hover:to-blue-600 hover:shadow-xl"
              >
                <Plus size={20} /> Add Due
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, invoice, franchise…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-slate-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Franchise</label>
              <div className="relative">
                <select value={franchiseFilter} onChange={(e) => setFranchiseFilter(e.target.value)} className={selectCls}>
                  <option value="all">All</option>
                  {FRANCHISE_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase text-slate-600">Date Range</label>
              <div className="relative">
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className={selectCls}>
                  {DATE_FILTER_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown size={18} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-600">Total Outstanding Due ({dateFilter})</p>
              <p className="text-3xl font-bold text-slate-900">{formatCurrency(totalDue, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="mb-1 text-sm font-medium text-slate-600">Invoices</p>
                <p className="text-3xl font-bold text-green-600">{filtered.length}</p>
              </div>
              <div className="text-right">
                <p className="mb-1 text-sm font-medium text-slate-600">Overdue</p>
                <p className="text-3xl font-bold text-rose-500">{overdueCount}</p>
              </div>
            </div>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} rowKey={(r) => r.id} emptyMessage="No Due Records Found." />

        <div className="mt-4 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center">
          <div className="flex gap-3">
            <button
              onClick={() => setAutoPayOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-amber-600"
            >
              Auto Pay
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-500 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-teal-600"
            >
              Auto Pay History
            </button>
          </div>
          <p className="text-sm font-bold text-slate-900">
            Total Due: <span className="text-base text-green-600">{formatCurrency(totalDue, { maximumFractionDigits: 2 })}</span>
          </p>
        </div>
      </div>

      <FranchiseDueForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
        defaultValues={editing ? toForm(editing) : null}
      />

      <AmountPaymentDialog
        open={autoPayOpen}
        title="Auto Payment"
        onClose={() => setAutoPayOpen(false)}
        onSubmit={(amount, mode) =>
          setPayHistory((prev) => [...prev, { date: new Date().toISOString().split('T')[0], amount, mode }])
        }
        modes={FRANCHISE_PAYMENT_MODES}
        maxDue={totalDue}
        submitLabel="Submit"
        accent="green"
      />

      <AutoPayHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} records={payHistory} />
    </div>
  );
}

export default FranchiseDuePage;
