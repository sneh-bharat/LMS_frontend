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
  Edit2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import SampleDetails from '@/app/lab/sample-receipt/Sample-details';
import UpdateSampleStatus from '@/app/lab/sample-receipt/update-sample-status';
import EditSample from '@/app/lab/sample-receipt/edit-sample';
import SampleProcess from '@/app/lab/sample-receipt/sample-process';
import UpdateSampleProcess from '@/app/lab/sample-receipt/update-process';
import ProcessDetails from '@/app/lab/sample-receipt/process-details';
import {
  useSamplesList,
  useSampleStatistics,
  useDeleteSample,
  useDeleteSampleProcessing,
  useBulkDeleteSamples,
} from '@/app/Apis/booking/useSamples';
import type { SampleStatisticsData } from '@/app/Apis/booking/sample';
import {
  fetchSampleProcessingBySampleId,
  resolveLatestProcessingIdForSample,
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
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog';

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

type SampleActionsMenuProps = {
  receipt: Receipt;
  isDeletePending: boolean;
  onAccept: (sampleId: string) => void;
  onViewDetails: (id: number) => void;
  onOpenProcessForm: (receipt: Receipt) => void;
  onViewProcessingDetails: (receipt: Receipt) => void;
  onOpenStatusForm: (receipt: Receipt) => void;
  onEdit: (receipt: Receipt) => void;
  onUpdateProcess: (receipt: Receipt) => void;
  onDeleteProcess: (receipt: Receipt) => void;
  onDelete: (id: number) => void;
};

function hasProcessingId(receipt: Receipt): boolean {
  const id = receipt.processingId;
  return id != null && id > 0;
}

function SampleActionsMenu({
  receipt,
  isDeletePending,
  onAccept,
  onViewDetails,
  onOpenProcessForm,
  onViewProcessingDetails,
  onOpenStatusForm,
  onEdit,
  onUpdateProcess,
  onDeleteProcess,
  onDelete,
}: SampleActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300 shrink-0"
            title="More actions"
            aria-label="More actions"
            disabled={isDeletePending}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={15} strokeWidth={2} />
          </Button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-56 p-1.5 rounded-xl border-slate-100 shadow-2xl"
      >
        {receipt.status === 'pending' && (
          <DropdownMenuItem
            onClick={() => onAccept(receipt.sampleId)}
            className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
          >
            <CheckCircle size={16} className="mr-3 text-emerald-500" />
            <span>Accept Sample</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => onViewDetails(receipt.id)}
          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
        >
          <Eye size={16} className="mr-3 text-emerald-500" />
          <span>View Details</span>
        </DropdownMenuItem>
      
      
        <DropdownMenuItem
          onClick={() => onOpenStatusForm(receipt)}
          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-blue-700"
        >
          <RefreshCcw size={16} className="mr-3 text-blue-500" />
          <span>Update Status</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1.5 bg-slate-50" />
        <DropdownMenuItem
          onClick={() => onEdit(receipt)}
          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
        >
          <Edit3 size={16} className="mr-3 text-emerald-500" />
          <span>Edit Sample</span>
        </DropdownMenuItem>
       
        <DropdownMenuItem
          onClick={() => onDelete(receipt.id)}
          className="rounded-lg py-2.5 font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 hover:bg-rose-50"
        >
          <Trash2 size={16} className="mr-3" />
          <span>Delete Sample</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onOpenProcessForm(receipt)}
          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-amber-700"
        >
          <Activity size={16} className="mr-3 text-amber-500" />
          <span>Record Processing</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onViewProcessingDetails(receipt)}
          className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-amber-700"
        >
          <ClipboardList size={16} className="mr-3 text-amber-600" />
          <span>Processing Details</span>
        </DropdownMenuItem>
        {hasProcessingId(receipt) ? (
          <DropdownMenuItem
            onClick={() => onUpdateProcess(receipt)}
            className="rounded-lg py-2.5 font-bold text-amber-600 hover:text-amber-700"
          >
            <Edit2 size={16} className="mr-3 text-amber-500" />
            <span>Update Process</span>
          </DropdownMenuItem>
        ) : null}
        {hasProcessingId(receipt) ? (
          <DropdownMenuItem
            onClick={() => onDeleteProcess(receipt)}
            className="rounded-lg py-2.5 font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 hover:bg-rose-50"
          >
            <Trash2 size={16} className="mr-3" />
            <span>Delete Processing</span>
          </DropdownMenuItem>
        ) : null}

      </DropdownMenuContent>
    </DropdownMenu>
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
  const deleteProcessMutation = useDeleteSampleProcessing();
  const bulkDeleteSamplesMutation = useBulkDeleteSamples();
  const isDeletePending =
    deleteSampleMutation.isPending || bulkDeleteSamplesMutation.isPending;
  const isDeleteProcessPending = deleteProcessMutation.isPending;
  const [editOpen, setEditOpen] = useState(false);
  const [editingSampleId, setEditingSampleId] = useState<number | null>(null);
  const [processFormOpen, setProcessFormOpen] = useState(false);
  const [processTarget, setProcessTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [updateProcessOpen, setUpdateProcessOpen] = useState(false);
  const [updateProcessTarget, setUpdateProcessTarget] = useState<{
    processId: number;
    label: string;
    record?: SampleProcessingRecord;
  } | null>(null);
  const [deleteProcessTarget, setDeleteProcessTarget] = useState<{
    sampleId: number;
    processId: number;
    label: string;
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
    setReceipts((prev) =>
      apiReceipts.map((row) => {
        const existing = prev.find((r) => r.id === row.id);
        const processingId = row.processingId ?? existing?.processingId ?? null;
        return processingId != null && processingId > 0
          ? { ...row, processingId }
          : row;
      }),
    );
  }, [apiReceipts]);

  /** Samples list API often omits processingId — resolve from GET /sample-processing/sample/{id}. */
  useEffect(() => {
    const missing = apiReceipts.filter((r) => !hasProcessingId(r));
    if (missing.length === 0) return;

    let cancelled = false;

    (async () => {
      const pairs = await Promise.all(
        missing.map(async (row) => {
          try {
            const processId = await resolveLatestProcessingIdForSample(row.id);
            return { sampleId: row.id, processId };
          } catch {
            return { sampleId: row.id, processId: null as number | null };
          }
        }),
      );

      if (cancelled) return;

      const idBySample = new Map<number, number>();
      for (const { sampleId, processId } of pairs) {
        if (processId != null && processId > 0) {
          idBySample.set(sampleId, processId);
        }
      }

      if (idBySample.size === 0) return;

      setReceipts((prev) =>
        prev.map((row) => {
          const processId = row.processingId ?? idBySample.get(row.id);
          return processId != null && processId > 0
            ? { ...row, processingId: processId }
            : row;
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
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
    patchReceiptProcessingId(record.sampleId, record.id);
    setUpdateProcessTarget({
      processId: record.id,
      label: processDetailsTarget?.label ?? `Sample #${record.sampleId}`,
      record,
    });
    setUpdateProcessOpen(true);
  };

  const handleCloseUpdateProcess = () => {
    setUpdateProcessOpen(false);
    setUpdateProcessTarget(null);
  };

  const patchReceiptProcessingId = (sampleId: number, processId: number) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === sampleId ? { ...r, processingId: processId } : r)),
    );
  };

  const clearReceiptProcessingId = (sampleId: number) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === sampleId ? { ...r, processingId: null } : r)),
    );
  };

  const handleProcessingDeleted = (sampleId: number) => {
    clearReceiptProcessingId(sampleId);
    void refetch();
  };

  const handleUpdateProcess = async (receipt: Receipt) => {
    let processId = receipt.processingId;
    let record: SampleProcessingRecord | undefined;

    if (processId == null || processId <= 0) {
      try {
        const res = await fetchSampleProcessingBySampleId(receipt.id);
        const latest = res.data?.[0];
        if (!latest?.id) {
          toast.error('No processing record found. Record processing first.');
          return;
        }
        processId = latest.id;
        record = latest;
        patchReceiptProcessingId(receipt.id, latest.id);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load processing record.',
        );
        return;
      }
    }

    setUpdateProcessTarget({
      processId,
      label: receipt.sampleId,
      record,
    });
    setUpdateProcessOpen(true);
  };

  const handleDeleteProcess = async (receipt: Receipt) => {
    let processId = receipt.processingId;

    if (processId == null || processId <= 0) {
      try {
        const res = await fetchSampleProcessingBySampleId(receipt.id);
        const latest = res.data?.[0];
        if (!latest?.id) {
          toast.error('No processing record found.');
          return;
        }
        processId = latest.id;
        patchReceiptProcessingId(receipt.id, latest.id);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to load processing record.',
        );
        return;
      }
    }

    setDeleteProcessTarget({
      sampleId: receipt.id,
      processId,
      label: receipt.sampleId,
    });
  };

  const handleConfirmDeleteProcess = () => {
    if (!deleteProcessTarget) return;

    deleteProcessMutation.mutate(
      {
        processId: deleteProcessTarget.processId,
        sampleId: deleteProcessTarget.sampleId,
      },
      {
        onSuccess: (res) => {
          if (res.response === false) {
            toast.error(res.message || 'Failed to delete processing record.');
            return;
          }
          toast.success(
            res.message?.trim() || 'Processing deleted. You can record processing again.',
          );
          handleProcessingDeleted(deleteProcessTarget.sampleId);
          setDeleteProcessTarget(null);
        },
        onError: (err) => {
          toast.error(err.message || 'Failed to delete processing record.');
        },
      },
    );
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        onSuccess={(record) => {
          if (record?.id && record.sampleId) {
            patchReceiptProcessingId(record.sampleId, record.id);
          }
          void refetch();
          if (processTarget?.id) {
            handleOpenProcessDetails(processTarget.id, processTarget.label);
          }
        }}
      />

      <UpdateSampleProcess
        isOpen={updateProcessOpen}
        onClose={handleCloseUpdateProcess}
        processId={updateProcessTarget?.processId ?? null}
        sampleLabel={updateProcessTarget?.label}
        initialRecord={updateProcessTarget?.record ?? null}
        onSuccess={(record) => {
          if (record?.id && record.sampleId) {
            patchReceiptProcessingId(record.sampleId, record.id);
          }
          void refetch();
          const sampleId = record?.sampleId ?? updateProcessTarget?.record?.sampleId;
          if (sampleId) {
            handleOpenProcessDetails(sampleId, updateProcessTarget?.label ?? `Sample #${sampleId}`);
          }
        }}
      />
      <ProcessDetails
        isOpen={processDetailsOpen}
        onClose={handleCloseProcessDetails}
        sampleId={processDetailsTarget?.sampleId ?? null}
        sampleLabel={processDetailsTarget?.label}
        onEditRecord={handleEditProcessing}
        onDeletedRecord={(sampleId) => handleProcessingDeleted(sampleId)}
      />

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200 shrink-0">
            <Microscope size={18} className="sm:hidden" />
            <Microscope size={20} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1 leading-tight">
              Sample <span className="text-[#FF671F]">Collection & Acceptance</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl">
              Manage and track diagnostic sample collections.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 border border-emerald-100 px-3 py-2 sm:px-4 sm:py-2.5 shadow-sm self-start md:self-auto">
          <Badge
            variant="secondary"
            className="px-3 py-1 sm:px-4 sm:py-1.5 bg-white text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm"
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

      <div className="bg-white/60 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-200 shadow-sm">
        {isStatisticsLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-semibold">Loading statistics…</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 xl:flex xl:flex-nowrap xl:items-stretch xl:gap-0 xl:overflow-x-auto xl:pb-1 scrollbar-thin">
            {SAMPLE_STAT_CARDS.map((card, index) => {
              const Icon = card.icon;
              const count = statistics != null ? statistics[card.key] : null;
              return (
                <div
                  key={card.key}
                  className={`flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white/80 px-2 py-3 text-center sm:px-3 xl:min-w-[9.5rem] xl:flex-1 xl:rounded-none xl:border-0 xl:bg-transparent xl:py-1 ${
                    index < SAMPLE_STAT_CARDS.length - 1
                      ? 'xl:border-r xl:border-slate-200/70'
                      : ''
                  }`}
                >
                  <div
                    className={`mb-2 flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
                  >
                    <Icon size={16} className={`sm:hidden ${card.tone}`} />
                    <Icon size={18} className={`hidden sm:block ${card.tone}`} />
                  </div>
                  <span className="mb-1 text-[9px] sm:text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <span
                    className={`text-base sm:text-lg font-black leading-none lg:text-xl ${
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
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-center">
        <div className="relative group flex-1 w-full min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Sample ID or Patient..."
            className="input-refined w-full py-2.5 pl-10 pr-4 font-bold text-sm sm:text-base"
            suppressHydrationWarning
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:min-w-[9rem] lg:w-40">
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
          <div className="relative flex-1 sm:min-w-[9rem] lg:w-40">
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
        <div className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
          <p className="text-sm font-semibold text-rose-900">
            {selectedIds.length} sample{selectedIds.length === 1 ? '' : 's'} selected
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200 bg-white w-full sm:w-auto"
              disabled={isDeletePending}
              onClick={() => setSelectedIds([])}
            >
              Clear selection
            </Button>
            <Button
              type="button"
              size="sm"
              className="font-bold gap-2 bg-rose-600 hover:bg-rose-700 text-white w-full sm:w-auto"
              disabled={isDeletePending}
              onClick={handleBulkDeleteClick}
            >
              <Trash2 size={14} aria-hidden />
              Bulk delete samples
            </Button>
          </div>
        </div>
      ) : null}

      {/* ── Receipts Table / Mobile Cards ── */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        {isLoading ? (
          <div className="px-4 sm:px-6 py-16 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-emerald-600" />
              <span className="text-sm font-semibold">Loading samples…</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="px-4 sm:px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 border border-slate-100">
                <Package size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 tracking-tight">No samples found</p>
                <p className="text-xs font-medium text-slate-400">Try adjusting your filters.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile card list */}
            <div className="md:hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
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
                  Select all on page
                </label>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {filtered.length} shown
                </span>
              </div>
              <div className="divide-y divide-slate-100">
              {filtered.map((receipt) => {
                const isSelected = selectedSet.has(receipt.id);
                return (
                  <div
                    key={receipt.id}
                    className={`p-4 transition-colors ${isSelected ? 'bg-emerald-50/60' : ''}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(receipt.id)}
                          disabled={isDeletePending}
                          className="mt-1 w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-300 shrink-0"
                          aria-label={`Select ${receipt.sampleId}`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-600 font-mono">
                              {receipt.sampleId}
                            </span>
                            {receipt.orderNumber ? (
                              <Badge variant="primary" className="text-[9px] px-2 py-0.5 font-mono">
                                {receipt.orderNumber}
                              </Badge>
                            ) : null}
                          </div>
                          <div className="mt-1 flex items-center gap-2 min-w-0">
                            <div className="w-8 h-8 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                              <User size={16} />
                            </div>
                            <p className="font-bold text-slate-900 text-sm truncate">
                              {receipt.patient}
                            </p>
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="px-2.5 py-1 text-[10px] font-bold uppercase">
                              {receipt.sampleType}
                            </Badge>
                            <ConditionBadge label={receipt.conditionLabel} condition={receipt.condition} />
                          </div>
                          <div className="mt-2 flex items-center gap-1.5 text-slate-500">
                            <Clock size={13} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-semibold">{receipt.collectedAt}</span>
                          </div>
                        </div>
                      </div>
                      <SampleActionsMenu
                        receipt={receipt}
                        isDeletePending={isDeletePending}
                        onAccept={handleAccept}
                        onViewDetails={handleViewDetails}
                        onOpenProcessForm={handleOpenProcessForm}
                        onViewProcessingDetails={handleViewProcessingDetails}
                        onOpenStatusForm={handleOpenStatusForm}
                        onEdit={handleEdit}
                        onUpdateProcess={handleUpdateProcess}
                        onDeleteProcess={handleDeleteProcess}
                        onDelete={handleDelete}
                      />
                    </div>
                  </div>
                );
              })}
              </div>
            </div>

            {/* Desktop / tablet table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[880px] text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="w-12 px-3 lg:px-4 py-4 text-center">
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
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample ID</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collected By</th>
                    <th className="hidden lg:table-cell px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Order No.</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample Type</th>
                    <th className="hidden xl:table-cell px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Collected At</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Condition</th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((receipt) => {
                    const isSelected = selectedSet.has(receipt.id);
                    return (
                      <tr
                        key={receipt.id}
                        className={`hover:bg-slate-50 transition-colors group ${
                          isSelected ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        <td className="w-12 px-3 lg:px-4 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(receipt.id)}
                            disabled={isDeletePending}
                            className="w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-300"
                            aria-label={`Select ${receipt.sampleId}`}
                          />
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <span className="text-xs font-bold text-slate-600 font-mono">
                            {receipt.sampleId}
                          </span>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                              <User size={20} />
                            </div>
                            <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm truncate max-w-[12rem] xl:max-w-none">
                              {receipt.patient}
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-4 lg:px-6 py-4">
                          {receipt.orderNumber ? (
                            <Badge variant="primary" className="text-[9px] px-2 py-0.5 font-mono">
                              {receipt.orderNumber}
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <Badge variant="secondary" className="px-2.5 py-1 text-[10px] font-bold uppercase">
                            {receipt.sampleType}
                          </Badge>
                        </td>
                        <td className="hidden xl:table-cell px-4 lg:px-6 py-4">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock size={14} className="text-slate-400 shrink-0" />
                            <span className="text-sm font-semibold whitespace-nowrap">{receipt.collectedAt}</span>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <ConditionBadge label={receipt.conditionLabel} condition={receipt.condition} />
                        </td>
                        <td
                          className="px-4 lg:px-6 py-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            <SampleActionsMenu
                              receipt={receipt}
                              isDeletePending={isDeletePending}
                              onAccept={handleAccept}
                              onViewDetails={handleViewDetails}
                              onOpenProcessForm={handleOpenProcessForm}
                              onViewProcessingDetails={handleViewProcessingDetails}
                              onOpenStatusForm={handleOpenStatusForm}
                              onEdit={handleEdit}
                              onUpdateProcess={handleUpdateProcess}
                              onDeleteProcess={handleDeleteProcess}
                              onDelete={handleDelete}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
            <span className="leading-relaxed">
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
              className="font-bold border-slate-200 flex-1 sm:flex-none"
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
              className="font-bold border-slate-200 flex-1 sm:flex-none"
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

      <ConfirmAlertDialog
        isOpen={Boolean(deleteProcessTarget)}
        onClose={() => {
          if (!isDeleteProcessPending) setDeleteProcessTarget(null);
        }}
        onConfirm={handleConfirmDeleteProcess}
        title="Delete processing record"
        description={`Remove processing for "${deleteProcessTarget?.label ?? 'this sample'}"? You can record processing again afterward.`}
        confirmText="Delete processing"
        cancelText="Keep record"
        variant="warning"
        isLoading={isDeleteProcessPending}
      />
    </div>
  );
}