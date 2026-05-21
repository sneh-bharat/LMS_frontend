'use client';
import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  MoreHorizontal,
  Filter,
  Microscope,
  Clock,
  User,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { useSamplesList } from '@/app/Apis/booking/useSamples';
import { mapSampleToReceipt, type SampleReceiptRow } from '@/app/Apis/booking/sample';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';

// ─── Types ──────────────────────────────────────────────────────────────
type Receipt = SampleReceiptRow;

const PAGE_SIZE = 10;
const STATUS_OPTIONS = ['All', 'Pending', 'Accepted', 'Rejected'];
const SAMPLE_TYPES = ['All', 'Blood', 'Urine', 'Swab', 'Stool', 'Other'];

// ─── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: Receipt['status'] }) {
  const config = {
    pending: { color: 'warning' as const, icon: <Clock size={10} /> },
    accepted: { color: 'success' as const, icon: <CheckCircle size={10} /> },
    rejected: { color: 'danger' as const, icon: <XCircle size={10} /> },
  };

  return (
    <Badge variant={config[status].color} className="gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase">
      {config[status].icon}
      {status}
    </Badge>
  );
}

// ─── Condition Badge ───────────────────────────────────────────────────────────────
function ConditionBadge({ condition }: { condition?: Receipt['condition'] }) {
  if (!condition) return null;

  const config = {
    good: { color: 'success' as const, label: 'Good' },
    haemolysed: { color: 'danger' as const, label: 'Haemolysed' },
    clotted: { color: 'warning' as const, label: 'Clotted' },
    insufficient: { color: 'warning' as const, label: 'Insufficient' },
    leaked: { color: 'danger' as const, label: 'Leaked' },
  };

  return (
    <Badge variant={config[condition].color} className="px-2.5 py-1 text-[10px] font-bold uppercase">
      {config[condition].label}
    </Badge>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SampleReceiptPage() {
  const [pageNo, setPageNo] = useState(0);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const {
    data: samplesRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useSamplesList({
    pageNo,
    pageSize: PAGE_SIZE,
    sortBy: 'createdAt',
  });

  const samplesPage = samplesRes?.data;
  const apiReceipts = useMemo(
    () => (samplesPage?.content ?? []).map(mapSampleToReceipt),
    [samplesPage?.content]
  );

  useEffect(() => {
    setReceipts(apiReceipts);
  }, [apiReceipts]);

  const totalElements = samplesPage?.totalElements ?? 0;
  const totalPages = samplesPage?.totalPages ?? 0;
  const canPrev = pageNo > 0;
  const canNext = samplesPage?.last != null ? !samplesPage.last : pageNo + 1 < totalPages;

  const filtered = receipts.filter(r =>
    (deptFilter === 'All' || r.sampleType === deptFilter) &&
    (statusFilter === 'All' || r.status === statusFilter.toLowerCase()) &&
    (r.patient.toLowerCase().includes(search.toLowerCase()) ||
     r.sampleId.toLowerCase().includes(search.toLowerCase()))
  );

  const handleEdit = () => {
    toast.info('Sample edit is not available yet. Use Register Sample to add a new record.');
  };

  const handleAccept = (receiptId: string) => {
    setReceipts(prev =>
      prev.map(r =>
        r.sampleId === receiptId
          ? { ...r, status: 'accepted' as const, condition: 'good' as const }
          : r
      )
    );
  };

  const handleReject = (receiptId: string, condition: Receipt['condition']) => {
    setReceipts(prev =>
      prev.map(r =>
        r.sampleId === receiptId
          ? { ...r, status: 'rejected' as const, condition }
          : r
      )
    );
  };

  const handleDelete = (receiptId: string) => {
    setReceipts(prev => prev.filter(r => r.sampleId !== receiptId));
  };

  const handleOpenModal = () => setModalOpen(true);

  const handleCloseModal = () => setModalOpen(false);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* ── Modals ── */}
    

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <Microscope size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Sample <span className="text-[#FF671F]">Collection & Acceptance</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              Manage and track diagnostic sample collections.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5 shadow-sm">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 bg-white text-emerald-800 border border-emerald-200 font-bold"
          >
            {totalElements} Samples
          </Badge>
        </div>
      </div>

      {/* ── Control Bar ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative group flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Sample ID or Patient..."
            className="input-refined w-full py-2.5 pl-10 pr-4 font-bold"
            suppressHydrationWarning
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="input-refined py-2 pl-8 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none w-full"
              suppressHydrationWarning
            >
              {SAMPLE_TYPES.map(type => <option key={type}>{type}</option>)}
            </select>
          </div>
          <div className="relative flex-1 lg:w-40">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-refined py-2 pl-8 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none w-full"
              suppressHydrationWarning
            >
              {STATUS_OPTIONS.map(status => <option key={status}>{status}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">
            {error instanceof Error ? error.message : 'Failed to load samples.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {/* ── Receipts Table ── */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Patient</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tests</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample Type</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collected At</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Condition</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin text-emerald-600" />
                    <span className="text-sm font-semibold">Loading samples…</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 border border-slate-100">
                      <Package size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-slate-900 tracking-tight">No samples found</p>
                      <p className="text-xs font-medium text-slate-400">Try adjusting your filters.</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : filtered.map((receipt, idx) => (
              <tr key={receipt.sampleId} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    {receipt.sampleId}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <User size={20} />
                    </div>
                    <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                      {receipt.patient}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {receipt.tests.length > 0 ? (
                      receipt.tests.map((test, i) => (
                        <Badge key={i} variant="primary" className="text-[9px] px-2 py-0.5">
                          {test}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <Badge variant="secondary" className="px-2.5 py-1 text-[10px] font-bold uppercase">
                    {receipt.sampleType}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Clock size={14} className="text-slate-400" />
                    <span className="text-sm font-semibold">{receipt.collectedAt}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <StatusBadge status={receipt.status} />
                </td>
                <td className="px-6 py-4">
                  <ConditionBadge condition={receipt.condition} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {receipt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(receipt.sampleId)}
                          className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all"
                          title="Accept Sample"
                          suppressHydrationWarning
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(receipt.sampleId, 'haemolysed')}
                          className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all"
                          title="Reject Sample"
                          suppressHydrationWarning
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleEdit}
                      className="p-1.5 bg-slate-50 text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                      title="Edit Sample (coming soon)"
                      suppressHydrationWarning
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(receipt.sampleId)}
                      className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-slate-100"
                      title="Delete Sample"
                      suppressHydrationWarning
                    >
                      <Trash2 size={14} />
                    </button>
                    <button 
                      className="p-1.5 text-slate-300 hover:text-slate-600"
                      suppressHydrationWarning
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
            <span>
              Page {pageNo + 1} of {Math.max(totalPages, 1)}
              <span className="text-slate-400 mx-2">·</span>
              {totalElements} total samples
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200"
              disabled={!canPrev || isFetching}
              onClick={() => setPageNo((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft size={16} />
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200"
              disabled={!canNext || isFetching}
              onClick={() => setPageNo((p) => p + 1)}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Footer Stats ── */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">{totalElements}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Samples</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{receipts.filter(r => r.status === 'accepted').length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Accepted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">{receipts.filter(r => r.status === 'pending').length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600">{receipts.filter(r => r.status === 'rejected').length}</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
}