'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  Eye,
  Download,
  FileText,
} from 'lucide-react';
import AddNewFranchiseDue, { FranchiseDueFormData } from './AddNewFranchiseDue';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FranchiseDue {
  id: number;
  date: string;
  invoiceNumber: string;
  patientName: string;
  ageDays: number;
  due: number;
  franchise: string;
  status: 'pending' | 'partial' | 'overdue';
  createdAt: string;
}

// ─── Static Data ─────────────────────────────────────────────────────────────
const SAMPLE_DUE_RECORDS: FranchiseDue[] = [
  {
    id: 1, date: '2025-06-18', invoiceNumber: 'TL-INV-42',
    patientName: 'Cash Franchise', ageDays: 258, due: 200.0,
    franchise: 'Cash', status: 'overdue', createdAt: '2025-06-18',
  },
  {
    id: 2, date: '2025-07-02', invoiceNumber: 'TL-INV-56',
    patientName: 'Shanti', ageDays: 244, due: 92.0,
    franchise: 'Credit', status: 'pending', createdAt: '2025-07-02',
  },
  {
    id: 3, date: '2025-07-09', invoiceNumber: 'TL-INV-69',
    patientName: 'MOHAMMED BURHANUDDIN SABER', ageDays: 237, due: 1650.0,
    franchise: 'Cash', status: 'overdue', createdAt: '2025-07-09',
  },
  {
    id: 4, date: '2025-07-15', invoiceNumber: 'TL-INV-75',
    patientName: 'Ramesh Kumar', ageDays: 200, due: 450.0,
    franchise: 'HO(IP)', status: 'partial', createdAt: '2025-07-15',
  },
];

const FRANCHISE_OPTIONS = [
  'Cash', 'HO(IP)', 'Credit', 'Credit Franchise',
  'sv prasad hospital', 'Wallet', 'wallet flexibility',
];
const DATE_FILTER_OPTIONS = ['Last 15 Days', 'Last 45 Days', 'Last 90 Days', 'All'];
const PAYMENT_MODES = ['Cash', 'Cheque', 'Card', 'UPI', 'Net Banking', 'eSeva'];

// ─── Actions Menu ─────────────────────────────────────────────────────────────
function DueActionsMenu({
  onEdit, onDelete, onView,
}: {
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-50 py-2">
          <button
            onClick={() => { onEdit(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Edit2 size={14} /> Edit
          </button>
          <button
            onClick={() => { onView(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-colors"
          >
            <Eye size={14} /> View
          </button>
          <div className="h-[1px] bg-slate-100 my-1" />
          <button
            onClick={() => { onDelete(); setOpen(false); }}
            className="w-full text-left px-4 py-2.5 text-xs font-bold uppercase text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Auto Pay Popup ───────────────────────────────────────────────────────────
function AutoPayPopup({
  open, onClose, onSubmit, totalDue,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: string, mode: string) => void;
  totalDue: number;
}) {
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('Cash');

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Auto Payment</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 text-xl transition-colors">×</button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Amount</label>
            <input
              type="number"
              placeholder={`Max ₹${totalDue.toLocaleString('en-IN')}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-2">Payment Mode</label>
            <div className="relative">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
              >
                {PAYMENT_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50 transition-all">Cancel</button>
            <button
              onClick={() => { onSubmit(amount, mode); onClose(); setAmount(''); setMode('Cash'); }}
              className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Auto Pay History Modal ───────────────────────────────────────────────────
function AutoPayHistoryModal({
  open, onClose, records,
}: {
  open: boolean;
  onClose: () => void;
  records: { date: string; amount: string; mode: string }[];
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Auto Pay History</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-rose-100 hover:text-rose-600 text-slate-500 text-xl transition-colors">×</button>
        </div>
        <div className="p-6">
          {records.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <FileText className="mx-auto mb-3 text-slate-300" size={36} />
              <p className="font-semibold">No payment history yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700">{r.date}</td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-900">₹{parseFloat(r.amount || '0').toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">{r.mode}</span>
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

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: FranchiseDue['status'] }) {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-blue-100 text-blue-700',
    overdue: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${styles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ─── Age Pill ─────────────────────────────────────────────────────────────────
function AgePill({ days }: { days: number }) {
  const cls =
    days >= 250 ? 'bg-rose-100 text-rose-700' :
    days >= 200 ? 'bg-orange-100 text-orange-700' :
    'bg-amber-100 text-amber-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cls}`}>
      {days} days
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const FranchiseDueList = () => {
  const [records, setRecords] = useState<FranchiseDue[]>(SAMPLE_DUE_RECORDS);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FranchiseDue | null>(null);
  const [franchiseFilter, setFranchiseFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('All');
  const [autoPayOpen, setAutoPayOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [payHistory, setPayHistory] = useState<{ date: string; amount: string; mode: string }[]>([]);

  const filteredRecords = records.filter((r) => {
    const matchesSearch =
      r.patientName.toLowerCase().includes(search.toLowerCase()) ||
      r.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      r.franchise.toLowerCase().includes(search.toLowerCase());
    const matchesFranchise = franchiseFilter === 'all' || r.franchise === franchiseFilter;
    return matchesSearch && matchesFranchise;
  });

  const totalDue = filteredRecords.reduce((s, r) => s + r.due, 0);

  const franchiseStats = FRANCHISE_OPTIONS.map((f) => {
    const items = filteredRecords.filter((r) => r.franchise === f);
    return { franchise: f, count: items.length, total: items.reduce((s, r) => s + r.due, 0) };
  }).filter((s) => s.count > 0);

  const handleAddRecord = (formData: FranchiseDueFormData) => {
    if (editingRecord) {
      setRecords(records.map((r) =>
        r.id === editingRecord.id
          ? { ...r, ...formData, due: parseFloat(String(formData.due)) || 0 }
          : r
      ));
      setEditingRecord(null);
    } else {
      const newRecord: FranchiseDue = {
        id: Math.max(...records.map((r) => r.id), 0) + 1,
        ...formData,
        due: parseFloat(String(formData.due)) || 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setRecords([...records, newRecord]);
    }
    setIsModalOpen(false);
  };

  const handleEdit = (r: FranchiseDue) => { setEditingRecord(r); setIsModalOpen(true); };
  const handleView = (r: FranchiseDue) => { setEditingRecord(r); setIsModalOpen(true); };
  const handleDelete = (id: number) => {
    if (confirm('Delete this due record?')) setRecords(records.filter((r) => r.id !== id));
  };
  const handleCloseModal = () => { setIsModalOpen(false); setEditingRecord(null); };
  const handleAutoPaySubmit = (amount: string, mode: string) => {
    const today = new Date().toISOString().split('T')[0];
    setPayHistory((prev) => [...prev, { date: today, amount, mode }]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">

      {/* ── Header Section ── */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Title + CTA */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                <span className="text-green-600">Franchise</span> Due List
              </h1>
              <p className="text-slate-600 text-base max-w-2xl">
                Track outstanding dues, overdue invoices, and franchise payment records.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all">
                <Download size={18} /> Export
              </button>
              <button
                onClick={() => { setEditingRecord(null); setIsModalOpen(true); }}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} /> Add Due
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient, invoice, franchise…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 bg-white"
                />
              </div>
            </div>

            {/* Franchise */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Franchise</label>
              <div className="relative">
                <select
                  value={franchiseFilter}
                  onChange={(e) => setFranchiseFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  <option value="all">All</option>
                  {FRANCHISE_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Range */}
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Date Range</label>
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-slate-900 appearance-none bg-white cursor-pointer"
                >
                  {DATE_FILTER_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
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
              <p className="text-slate-600 text-sm font-medium mb-1">Total Outstanding Due ({dateFilter})</p>
              <p className="text-3xl font-bold text-slate-900">
                ₹{totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex gap-8">
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Invoices</p>
                <p className="text-3xl font-bold text-green-600">{filteredRecords.length}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-600 text-sm font-medium mb-1">Overdue</p>
                <p className="text-3xl font-bold text-rose-500">
                  {filteredRecords.filter((r) => r.status === 'overdue').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Franchise Breakdown — mirrors Category Breakdown in BankExpensePage */}
        {franchiseStats.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Franchise Breakdown</h3>
            <div className="space-y-3">
              {franchiseStats.map((stat) => (
                <div key={stat.franchise} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{stat.franchise}</p>
                    <p className="text-sm text-slate-600">{stat.count} invoice{stat.count !== 1 ? 's' : ''}</p>
                  </div>
                  <p className="font-bold text-slate-900">
                    ₹{stat.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">#</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Invoice Number</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Patient Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Franchise</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Age (Days)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Due Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((r, index) => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{r.date}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold font-mono">
                          {r.invoiceNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-900">{r.patientName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                          {r.franchise}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AgePill days={r.ageDays} />
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">
                          ₹{r.due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <DueActionsMenu
                          onEdit={() => handleEdit(r)}
                          onDelete={() => handleDelete(r.id)}
                          onView={() => handleView(r)}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-600">
                      <Search className="mx-auto mb-4 text-slate-400" size={32} />
                      <p className="font-semibold text-slate-900 mb-1">No Due Records Found.</p>
                      <p className="text-sm">Try adjusting your filters or search term</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer — Auto Pay buttons + Total (like BankExpensePage footer) */}
          {filteredRecords.length > 0 && (
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setAutoPayOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-all shadow-sm text-sm"
                >
                  Auto Pay
                </button>
                <button
                  onClick={() => setHistoryOpen(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-all shadow-sm text-sm"
                >
                  Auto Pay History
                </button>
              </div>
              <div className="flex items-center gap-6">
                <p className="text-sm text-slate-600 font-medium">
                  Showing <span className="font-bold text-slate-900">{filteredRecords.length}</span> of{' '}
                  <span className="font-bold text-slate-900">{records.length}</span> records
                </p>
                <p className="text-sm font-bold text-slate-900">
                  Total Due:{' '}
                  <span className="text-green-600 text-base">
                    ₹{totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AddNew Modal (same pattern as AddNewBank) ── */}
      <AddNewFranchiseDue
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleAddRecord}
        editData={editingRecord}
        franchiseOptions={FRANCHISE_OPTIONS}
      />

      {/* ── Auto Pay Popup ── */}
      <AutoPayPopup
        open={autoPayOpen}
        onClose={() => setAutoPayOpen(false)}
        onSubmit={handleAutoPaySubmit}
        totalDue={totalDue}
      />

      {/* ── Auto Pay History Modal ── */}
      <AutoPayHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        records={payHistory}
      />
    </div>
  );
};

export default FranchiseDueList;