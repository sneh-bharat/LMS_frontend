'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Edit3,
  Eye,
  FileText,
  Filter,
  MoreHorizontal,
  RefreshCcw,
  Search,
  Settings,
  User,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEstimationsList } from '@/app/Apis/booking/useEstimations';
import {
  formatEstimationCurrency,
  formatEstimationDate,
  formatEstimationLabel,
  type Estimation,
} from '@/app/Apis/booking/estimation';
import NewEstimation from './New-Estimation';
import EstimationDetails from '@/app/diagnosis/estimation/estimation-details';
import EstimationStatusUpdate from './status-update';

const PAGE_SIZE = 10;

const STATUS_FILTER_OPTIONS = [
  'All',
  'Draft',
  'Approved',
  'Converted',
  'Rejected',
  'Expired',
  'Cancelled',
];
const APPROVAL_FILTER_OPTIONS = ['All', 'Pending', 'Approved', 'Rejected'];

function statusBadgeVariant(
  status?: string | null
): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  const s = status?.trim().toUpperCase() ?? '';
  if (s.includes('APPROV') || s.includes('COMPLETE') || s === 'ACTIVE') return 'success';
  if (s.includes('REJECT') || s.includes('CANCEL')) return 'danger';
  if (s.includes('PENDING') || s.includes('DRAFT')) return 'warning';
  if (s.includes('CONVERT')) return 'primary';
  return 'secondary';
}

function priorityBadgeVariant(
  priority?: string | null
): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' {
  const p = priority?.trim().toUpperCase() ?? '';
  if (p.includes('EMERGENCY') || p.includes('URGENT')) return 'danger';
  if (p.includes('ROUTINE') || p.includes('NORMAL')) return 'primary';
  return 'secondary';
}

function EstimationActions({
  row,
  onView,
  onEdit,
  onStatusUpdate,
  onConvert,
}: {
  row: Estimation;
  onView: (row: Estimation) => void;
  onEdit: (row: Estimation) => void;
  onStatusUpdate: (row: Estimation) => void;
  onConvert: (row: Estimation) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Estimation actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-52 p-1.5 rounded-2xl border-slate-100 shadow-2xl"
      >
        <DropdownMenuItem
          onClick={() => onView(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-blue-600 focus:bg-blue-50 focus:text-blue-700"
        >
          <Edit3 size={14} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onStatusUpdate(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-green-600 focus:bg-green-50 focus:text-green-700"
        >
          <Check size={14} />
          Status Update
        </DropdownMenuItem>
        <DropdownMenuSeparator className="my-1.5 bg-slate-100" />
        <DropdownMenuItem
          onClick={() => onConvert(row)}
          disabled={Boolean(row.isConverted)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700 disabled:opacity-50"
        >
          <RefreshCcw size={14} />
          Convert
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function EstimationListPage() {
  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [approvalFilter, setApprovalFilter] = useState('All');
  const [newEstimationOpen, setNewEstimationOpen] = useState(false);
  const [viewEstimationId, setViewEstimationId] = useState<number | null>(null);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState<Estimation | null>(null);

  const {
    data: estimationsRes,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    isSuccess,
  } = useEstimationsList({
    pageNo,
    pageSize: PAGE_SIZE,
    sortBy: 'createdAt',
  });

  useEffect(() => {
    setPageNo(0);
  }, [statusFilter, approvalFilter]);

  const page = estimationsRes?.data;
  const estimations = page?.content ?? [];
  const totalElements = page?.totalElements ?? 0;
  const totalPages = page?.totalPages ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page?.last != null ? !page.last : pageNo + 1 < totalPages;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return estimations.filter((row) => {
      const matchesSearch =
        !q ||
        row.estimationNumber?.toLowerCase().includes(q) ||
        String(row.patientId).includes(q) ||
        row.createdByName?.toLowerCase().includes(q) ||
        row.estimationStatus?.toLowerCase().includes(q) ||
        row.approvalStatus?.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' ||
        row.estimationStatus?.toUpperCase() === statusFilter.toUpperCase();

      const matchesApproval =
        approvalFilter === 'All' ||
        row.approvalStatus?.toUpperCase() === approvalFilter.toUpperCase();

      return matchesSearch && matchesStatus && matchesApproval;
    });
  }, [estimations, search, statusFilter, approvalFilter]);

  const handleView = (row: Estimation) => {
    if (row.id > 0) setViewEstimationId(row.id);
  };

  const handleEdit = (row: Estimation) => {
    toast.info(`Edit estimation ${row.estimationNumber} (coming soon).`);
  };

  const handleConvert = (row: Estimation) => {
    if (row.isConverted) {
      toast.error('This estimation is already converted.');
      return;
    }
    toast.info(`Convert estimation ${row.estimationNumber} to order (coming soon).`);
  };

  const openAdd = () => setNewEstimationOpen(true);

  const handleStatusUpdateOpen = (row: Estimation) => {
    if (row.id > 0) setStatusUpdateTarget(row);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <NewEstimation
        isOpen={newEstimationOpen}
        onClose={() => setNewEstimationOpen(false)}
        onSuccess={() => void refetch()}
      />
      <EstimationDetails
        isOpen={viewEstimationId != null}
        onClose={() => setViewEstimationId(null)}
        estimationId={viewEstimationId}
      />
      <EstimationStatusUpdate
        isOpen={statusUpdateTarget != null}
        onClose={() => setStatusUpdateTarget(null)}
        estimationId={statusUpdateTarget?.id ?? null}
        estimationNumber={statusUpdateTarget?.estimationNumber}
        currentStatus={statusUpdateTarget?.estimationStatus}
        patientLabel={
          statusUpdateTarget?.patientName?.trim() ||
          (statusUpdateTarget?.patientId
            ? `Patient #${statusUpdateTarget.patientId}`
            : null)
        }
        onSuccess={() => void refetch()}
      />
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
          Test — <span className="text-[#FF671F]">Estimation</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Review and manage patient test estimations before booking conversion.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Badge
            variant="secondary"
            className="px-4 py-1.5 bg-slate-50 text-[#006D77] border border-slate-200 font-bold"
          >
            {totalElements} Estimations
          </Badge>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={openAdd}
          >
            <UserPlus size={16} aria-hidden />
            New Estimation
          </Button>
        </div>
      </div>

      {/* Control bar — matches lab/tests list */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors"
            size={18}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search estimations..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-44 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? 'All Status' : opt}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>
          <div className="relative flex-1 lg:w-44 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              {APPROVAL_FILTER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === 'All' ? 'All Approval' : opt}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200 shrink-0"
            disabled={isFetching}
            onClick={() => void refetch()}
            title="Refresh list"
          >
            <Settings size={18} className={isFetching ? 'animate-spin' : ''} />
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 flex flex-wrap items-center justify-between gap-2">
          <span>
            {error instanceof Error ? error.message : 'Failed to load estimations.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold border-rose-200 text-rose-700"
            onClick={() => void refetch()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {isSuccess && estimationsRes?.message ? (
        <p className="text-xs font-semibold text-slate-500 pl-1">{estimationsRes.message}</p>
      ) : null}

      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Estimation No
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Patient
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Priority
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Approval
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Total
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Created By
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Collection Date
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin h-5 w-5 border-2 border-[#006D77] border-t-transparent rounded-full" />
                      <span className="text-sm font-semibold">Loading estimations…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <FileText size={32} strokeWidth={1} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 mb-0.5">
                          No estimations found
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 tracking-tight">
                          {search.trim() || statusFilter !== 'All' || approvalFilter !== 'All'
                            ? 'Try adjusting your search or filters.'
                            : 'No estimation records on this page.'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => handleView(row)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-600 font-mono group-hover:text-[#00AC80] transition-colors">
                        {row.estimationNumber || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#006D77] group-hover:text-white transition-all shrink-0">
                          <User size={20} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 group-hover:text-[#006D77] transition-colors text-sm mb-0.5">
                            {row.patientName}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1">
                            {row.patientCode}
  
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={priorityBadgeVariant(row.priority)}
                        className="px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm"
                      >
                        {formatEstimationLabel(row.priority)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={statusBadgeVariant(row.estimationStatus)}
                        className="text-[10px] font-bold uppercase"
                      >
                        {formatEstimationLabel(row.estimationStatus)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={statusBadgeVariant(row.approvalStatus)}
                        className="text-[10px] font-bold uppercase"
                      >
                        {formatEstimationLabel(row.approvalStatus)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                        {formatEstimationCurrency(row.finalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {row.createdByName?.trim() || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {formatEstimationDate(row.estimatedCollectionDate)}
                      </span>
                    </td>
                    <td
                      className="px-6 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <EstimationActions
                        row={row}
                        onView={handleView}
                        onEdit={handleEdit}
                        onStatusUpdate={handleStatusUpdateOpen}
                        onConvert={handleConvert}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Database size={14} className="text-[#006D77] shrink-0" aria-hidden />
            <span>
              Page {pageNo + 1} of {Math.max(totalPages, 1)}
              <span className="text-slate-400 mx-2">·</span>
              {totalElements} total estimations
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
    </div>
  );
}
