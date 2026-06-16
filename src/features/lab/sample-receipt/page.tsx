'use client';
import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Search,
  Plus,
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
  RefreshCcw,
  ClipboardList,
  Inbox,
  Share2,
  FlaskConical,
  BadgeCheck,
  Activity,
  ArrowRightCircle,
  MoreVertical,
  Eye,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import SampleDetails from '@/features/lab/sample-receipt/Sample-details';
import UpdateSampleStatus from '@/features/lab/sample-receipt/update-sample-status';
import EditSample from '@/features/lab/sample-receipt/edit-sample';
import SampleProcess from '@/features/lab/sample-receipt/sample-process';
import ProcessDetails from '@/features/lab/sample-receipt/process-details';
import {
  useSamplesList,
  useSampleStatistics,
  useDeleteSample,
  useBulkDeleteSamples,
} from '@/app/Apis/booking/useSamples';
import type { SampleStatisticsData } from '@/app/Apis/booking/sample';
import {
  mapSampleToReceipt,
  SAMPLE_API_STATUSES,
  formatSampleStatusLabel,
  type SampleApiStatus,
  type SampleProcessingRecord,
  type SampleReceiptRow,
} from '@/app/Apis/booking/sample';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';

// ─── Types ──────────────────────────────────────────────────────────────
type Receipt = SampleReceiptRow;
type DeleteMode = 'single' | 'bulk';

const PAGE_SIZE = 10;
type StatusFilter = 'All' | SampleApiStatus;
const SAMPLE_TYPES = ['All', 'Blood', 'Serum', 'Plasma', 'Urine', 'Swab', 'Stool', 'Other'];

type StatCardConfig = {
  label: string;
  key: keyof SampleStatisticsData;
  icon: LucideIcon;
  tone: string;
  bg: string;
};

const SAMPLE_STAT_CARDS: StatCardConfig[] = [
  { label: 'Registered', key: 'registeredCount', icon: ClipboardList, tone: 'text-slate-700', bg: 'bg-slate-400/30' },
  { label: 'Collected', key: 'collectedCount', icon: Package, tone: 'text-emerald-700', bg: 'bg-emerald-400/30' },
  { label: 'Received', key: 'receivedCount', icon: Inbox, tone: 'text-blue-700', bg: 'bg-blue-400/30' },
  { label: 'Allocated', key: 'allocatedCount', icon: Share2, tone: 'text-indigo-700', bg: 'bg-indigo-400/30' },
  { label: 'Processing', key: 'processingCount', icon: Activity, tone: 'text-amber-700', bg: 'bg-amber-400/30' },
  { label: 'In Analysis', key: 'in_analysisCount', icon: FlaskConical, tone: 'text-violet-700', bg: 'bg-violet-400/30' },
  { label: 'Analysis Complete', key: 'analysis_completeCount', icon: BadgeCheck, tone: 'text-teal-700', bg: 'bg-teal-400/30' },
  { label: 'Processed', key: 'processedCount', icon: CheckCircle, tone: 'text-green-700', bg: 'bg-green-400/30' },
  { label: 'Stored', key: 'storedCount', icon: Database, tone: 'text-cyan-700', bg: 'bg-cyan-400/30' },
  { label: 'Rejected', key: 'rejectedCount', icon: XCircle, tone: 'text-rose-600', bg: 'bg-rose-400/30' },
  { label: 'Disposed', key: 'disposedCount', icon: Trash2, tone: 'text-slate-600', bg: 'bg-slate-400/30' },
];

// ─── Status Badge ───────────────────────────────────────────────────────────────
function StatusBadge({
  label,
  workflow,
}: {
  label: string;
  workflow: Receipt['status'];
}) {
  const config = {
    pending: { color: 'warning' as const, icon: <Clock size={10} /> },
    accepted: { color: 'success' as const, icon: <CheckCircle size={10} /> },
    rejected: { color: 'danger' as const, icon: <XCircle size={10} /> },
  };
  const { color, icon } = config[workflow];

  return (
    <Badge variant={color} className="gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase">
      {icon}
      {label}
    </Badge>
  );
}

// ─── Condition Badge ───────────────────────────────────────────────────────────────
function ConditionBadge({
  label,
  condition,
}: {
  label: string;
  condition?: Receipt['condition'];
}) {
  if (!label || label === '—') return <span className="text-xs text-slate-400">—</span>;

  const config = {
    good: 'success' as const,
    haemolysed: 'danger' as const,
    clotted: 'warning' as const,
    insufficient: 'warning' as const,
    leaked: 'danger' as const,
  };
  const variant = condition ? config[condition] : 'secondary';

  return (
    <Badge variant={variant} className="px-2.5 py-1 text-[10px] font-bold uppercase">
      {label}
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
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<number | null>(null);
  const [statusFormOpen, setStatusFormOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{
    id: number;
    label: string;
    currentStatus?: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<DeleteMode>('single');
  const [deletingSampleId, setDeletingSampleId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const deleteSampleMutation = useDeleteSample();
  const bulkDeleteSamplesMutation = useBulkDeleteSamples();
  const isDeletePending =
    deleteSampleMutation.isPending || bulkDeleteSamplesMutation.isPending;
  const [editOpen, setEditOpen] = useState(false);
  const [editingSampleId, setEditingSampleId] = useState<number | null>(null);
  const [processFormOpen, setProcessFormOpen] = useState(false);
  const [processTarget, setProcessTarget] = useState<{
    id: number;
    label: string;
    processId?: number;
    record?: SampleProcessingRecord;
  } | null>(null);
  const [processDetailsOpen, setProcessDetailsOpen] = useState(false);
  const [processDetailsTarget, setProcessDetailsTarget] = useState<{
    sampleId: number;
    label: string;
  } | null>(null);

  const {
    data: statisticsRes,
    isLoading: isStatisticsLoading,
    isFetching: isStatisticsFetching,
    isError: isStatisticsError,
    error: statisticsError,
  } = useSampleStatistics();

  const statistics = statisticsRes?.data ?? null;

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
    status: statusFilter === 'All' ? undefined : statusFilter,
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

  const filtered = receipts.filter((r) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      r.patient.toLowerCase().includes(q) ||
      r.sampleId.toLowerCase().includes(q) ||
      (r.collectedBy?.toLowerCase().includes(q) ?? false) ||
      (r.orderNumber?.toLowerCase().includes(q) ?? false);

    const matchesType =
      deptFilter === 'All' ||
      r.sampleType.toLowerCase() === deptFilter.toLowerCase();

    return matchesSearch && matchesType;
  });

  const visibleIds = useMemo(() => filtered.map((r) => r.id), [filtered]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const allPageSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedSet.has(id));
  const somePageSelected =
    visibleIds.some((id) => selectedSet.has(id)) && !allPageSelected;

  const handleToggleSelect = (sampleId: number) => {
    setSelectedIds((prev) =>
      prev.includes(sampleId)
        ? prev.filter((id) => id !== sampleId)
        : [...prev, sampleId]
    );
  };

  const handleToggleSelectAll = () => {
    if (allPageSelected) {
      setSelectedIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
    }
  };

  const handleEdit = (receipt: Receipt) => {
    setEditingSampleId(receipt.id);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditingSampleId(null);
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

  const deletingSample = deletingSampleId
    ? receipts.find((r) => r.id === deletingSampleId)
    : null;

  const handleDelete = (id: number) => {
    setDeleteMode('single');
    setDeletingSampleId(id);
    setDeleteDialogOpen(true);
  };

  const handleBulkDeleteClick = () => {
    if (selectedIds.length === 0) return;
    setDeleteMode('bulk');
    setDeletingSampleId(null);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (isDeletePending) return;
    setDeleteDialogOpen(false);
    setDeletingSampleId(null);
    setDeleteMode('single');
  };

  const handleConfirmDelete = async () => {
    try {
      if (deleteMode === 'bulk') {
        if (selectedIds.length === 0) return;

        const response = await bulkDeleteSamplesMutation.mutateAsync({
          sampleIds: selectedIds,
        });
        if (response.response === false) {
          throw new Error(response.message || 'Bulk deletion failed.');
        }
        toast.success(
          response.message?.trim() ||
            `${selectedIds.length} sample${selectedIds.length === 1 ? '' : 's'} deleted successfully.`
        );
        if (selectedSampleId != null && selectedIds.includes(selectedSampleId)) {
          handleCloseDetails();
        }
        setSelectedIds([]);
      } else {
        if (!deletingSampleId) return;

        const response = await deleteSampleMutation.mutateAsync(deletingSampleId);
        if (response.response === false) {
          throw new Error(response.message || 'Deletion failed.');
        }
        toast.success(response.message?.trim() || 'Sample deleted successfully.');
        if (selectedSampleId === deletingSampleId) {
          handleCloseDetails();
        }
        setSelectedIds((prev) => prev.filter((id) => id !== deletingSampleId));
      }

      setDeleteDialogOpen(false);
      setDeletingSampleId(null);
      setDeleteMode('single');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : deleteMode === 'bulk'
            ? 'Failed to delete selected samples. Please try again.'
            : 'Failed to delete sample. Please try again.';
      toast.error(message);
      console.error('Error deleting sample(s):', err);
    }
  };

  const deleteDialogTitle =
    deleteMode === 'bulk' ? 'Bulk delete samples' : 'Delete sample';

  const deleteDialogDescription =
    deleteMode === 'bulk'
      ? `Are you sure you want to permanently delete ${selectedIds.length} selected sample${
          selectedIds.length === 1 ? '' : 's'
        }? This action cannot be undone.`
      : deletingSample
        ? `Are you sure you want to permanently delete sample "${deletingSample.sampleId}"? This action cannot be undone.`
        : 'Are you sure you want to permanently delete this sample? This action cannot be undone.';

  const handleOpenModal = () => setModalOpen(true);

  const handleCloseModal = () => setModalOpen(false);

  const handleViewDetails = (id: number) => {
    setSelectedSampleId(id);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedSampleId(null);
  };

  const handleOpenStatusForm = (receipt: Receipt) => {
    setStatusTarget({
      id: receipt.id,
      label: receipt.sampleId,
      currentStatus: receipt.apiStatus,
    });
    setStatusFormOpen(true);
  };

  const handleCloseStatusForm = () => {
    setStatusFormOpen(false);
    setStatusTarget(null);
  };

  const handleOpenProcessForm = (receipt: Receipt) => {
    setProcessTarget({ id: receipt.id, label: receipt.sampleId });
    setProcessFormOpen(true);
  };

  const handleCloseProcessForm = () => {
    setProcessFormOpen(false);
    setProcessTarget(null);
  };

  const handleEditProcessing = (record: SampleProcessingRecord) => {
    setProcessDetailsOpen(false);
    setProcessTarget({
      id: record.sampleId,
      label: processDetailsTarget?.label ?? `Sample #${record.sampleId}`,
      processId: record.id,
      record,
    });
    setProcessFormOpen(true);
  };

  const handleOpenProcessDetails = (sampleId: number, label: string) => {
    setProcessDetailsTarget({ sampleId, label });
    setProcessDetailsOpen(true);
  };

  const handleCloseProcessDetails = () => {
    setProcessDetailsOpen(false);
    setProcessDetailsTarget(null);
  };

  const handleViewProcessingDetails = (receipt: Receipt) => {
    handleOpenProcessDetails(receipt.id, receipt.sampleId);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SampleDetails
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        sampleId={selectedSampleId}
      />
      <UpdateSampleStatus
        isOpen={statusFormOpen}
        onClose={handleCloseStatusForm}
        sampleId={statusTarget?.id ?? null}
        sampleLabel={statusTarget?.label}
        currentStatus={statusTarget?.currentStatus}
        onSuccess={() => void refetch()}
      />
      <EditSample
        isOpen={editOpen}
        onClose={handleCloseEdit}
        sampleId={editingSampleId}
        onSuccess={() => void refetch()}
      />
      <SampleProcess
        isOpen={processFormOpen}
        onClose={handleCloseProcessForm}
        sampleId={processTarget?.id ?? null}
        sampleLabel={processTarget?.label}
        processId={processTarget?.processId ?? null}
        initialRecord={processTarget?.record ?? null}
        onSuccess={() => {
          void refetch();
          if (processTarget?.id) {
            handleOpenProcessDetails(processTarget.id, processTarget.label);
          }
        }}
      />
      <ProcessDetails
        isOpen={processDetailsOpen}
        onClose={handleCloseProcessDetails}
        sampleId={processDetailsTarget?.sampleId ?? null}
        sampleLabel={processDetailsTarget?.label}
        onEditRecord={handleEditProcessing}
      />

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
        
      {isStatisticsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {statisticsError instanceof Error
            ? statisticsError.message
            : 'Failed to load sample statistics.'}
        </div>
      ) : null}

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-sm">
        {isStatisticsLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-semibold">Loading statistics…</span>
          </div>
        ) : (
          <div className="flex flex-nowrap items-stretch gap-0 overflow-x-auto pb-1 scrollbar-thin">
            {SAMPLE_STAT_CARDS.map((card, index) => {
              const Icon = card.icon;
              const count = statistics != null ? statistics[card.key] : null;
              return (
                <div
                  key={card.key}
                  className={`flex min-w-[9.5rem] flex-1 flex-col items-center justify-center px-3 py-1 text-center sm:min-w-0 ${
                    index < SAMPLE_STAT_CARDS.length - 1
                      ? 'border-r border-slate-200/70'
                      : ''
                  }`}
                >
                  <div
                    className={`mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
                  >
                    <Icon size={18} className={card.tone} />
                  </div>
                  <span className="mb-1 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <span
                    className={`text-lg font-black leading-none sm:text-xl ${
                      card.key === 'receivedCount' || card.key === 'collectedCount'
                        ? 'text-emerald-600'
                        : card.key === 'rejectedCount'
                          ? 'text-rose-600'
                          : 'text-slate-900'
                    }`}
                  >
                    {count != null ? String(count) : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {!isStatisticsLoading && isStatisticsFetching ? (
          <p className="mt-2 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Refreshing statistics…
          </p>
        ) : null}
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
              onChange={(e) => {
                const value = e.target.value as StatusFilter;
                setStatusFilter(value);
                setPageNo(0);
                setSelectedIds([]);
              }}
              className="input-refined py-2 pl-8 pr-8 text-[10px] font-bold uppercase tracking-wider appearance-none w-full"
              suppressHydrationWarning
            >
              <option value="All">All statuses</option>
              {SAMPLE_API_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {formatSampleStatusLabel(status)}
                </option>
              ))}
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

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-rose-900">
            {selectedIds.length} sample{selectedIds.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200 bg-white"
              disabled={isDeletePending}
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
            <Button
              type="button"
              size="sm"
              className="font-bold gap-2 bg-rose-600 hover:bg-rose-700 text-white"
              disabled={isDeletePending}
              onClick={handleBulkDeleteClick}
            >
              <Trash2 size={14} aria-hidden />
              Bulk delete samples
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Receipts Table ── */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="w-12 px-4 py-4 text-center">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected;
                  }}
                  onChange={handleToggleSelectAll}
                  disabled={isDeletePending || filtered.length === 0}
                  className="w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-300"
                  aria-label="Select all samples on this page"
                />
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collected By</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order No.</th>
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
                <td colSpan={9} className="px-6 py-16 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin text-emerald-600" />
                    <span className="text-sm font-semibold">Loading samples…</span>
                  </div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-16 text-center">
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
            ) : filtered.map((receipt) => {
              const isSelected = selectedSet.has(receipt.id);
              return (
              <tr
                key={receipt.id}
                className={`hover:bg-slate-50 transition-colors group ${
                  isSelected ? 'bg-emerald-50/60' : ''
                }`}
              >
                <td className="w-12 px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleSelect(receipt.id)}
                    disabled={isDeletePending}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-300"
                    aria-label={`Select ${receipt.sampleId}`}
                  />
                </td>
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
                  {receipt.orderNumber ? (
                    <Badge variant="primary" className="text-[9px] px-2 py-0.5 font-mono">
                      {receipt.orderNumber}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
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
                  <StatusBadge label={receipt.statusLabel} workflow={receipt.status} />
                </td>
                <td className="px-6 py-4">
                  <ConditionBadge label={receipt.conditionLabel} condition={receipt.condition} />
                </td>
                <td
                  className="px-6 py-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300"
                      title="View sample details"
                      aria-label="View sample details"
                      onClick={() => handleViewDetails(receipt.id)}
                    >
                      <ArrowRightCircle size={15} strokeWidth={2} />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
                            title="More actions"
                            aria-label="More actions"
                            disabled={isDeletePending}
                          >
                            <MoreVertical size={15} strokeWidth={2} />
                          </Button>
                        }
                      />
                      <DropdownMenuContent className="min-w-56 p-1.5 rounded-xl border-slate-100 shadow-2xl">
                        {receipt.status === 'pending' && (
                          <DropdownMenuItem
                            onClick={() => handleAccept(receipt.sampleId)}
                            className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
                          >
                            <CheckCircle size={16} className="mr-3 text-emerald-500" />
                            <span>Accept Sample</span>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleOpenProcessForm(receipt)}
                          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-amber-700"
                        >
                          <Activity size={16} className="mr-3 text-amber-500" />
                          <span>Record Processing</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewProcessingDetails(receipt)}
                          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-amber-700"
                        >
                          <ClipboardList size={16} className="mr-3 text-amber-600" />
                          <span>Processing Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleOpenStatusForm(receipt)}
                          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-blue-700"
                        >
                          <RefreshCcw size={16} className="mr-3 text-blue-500" />
                          <span>Update Status</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleViewDetails(receipt.id)}
                          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
                        >
                          <Eye size={16} className="mr-3 text-emerald-500" />
                          <span>View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1.5 bg-slate-50" />
                        <DropdownMenuItem
                          onClick={() => handleEdit(receipt)}
                          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
                        >
                          <Edit3 size={16} className="mr-3 text-emerald-500" />
                          <span>Edit Sample</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(receipt.id)}
                          className="rounded-lg py-2.5 font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 size={16} className="mr-3" />
                          <span>Delete Sample</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            );
            })}
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

   

      <DeleteAlertDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={deleteDialogTitle}
        description={deleteDialogDescription}
        isLoading={isDeletePending}
      />
    </div>
  );
}