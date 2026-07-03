'use client';

/**
 * RESULT VERIFICATION — Workflow
 * 1. useResultStatusList({ status }) → GET `/api/v1/results/status/:status?page=&size=`
 * 2. Rows from `data.data.content[]`
 * 3. Three-dot menu → Verify (DRAFT/ENTERED) or View Details
 */

import { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Eye,
  FileCheck,
  Loader,
  MoreHorizontal,
  RefreshCw,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useResultStatusList } from '@/app/Apis/Report/useReportEntry';
import {
  toPendingVerificationRow,
  type ApiResultStatus,
  type PendingVerificationItem,
  type ResultStatusItem,
} from '@/app/Apis/Report/reportApi';
import ResultVerificationPanel, {
  type VerificationPanelMode,
} from './resultVerificationPanel';
import {
  listingEmptyBox,
  listingEmptySub,
  listingEmptyTitle,
  listingLoadingBox,
  listingLoadingText,
  listingPaginationBtn,
  listingPaginationText,
  listingSubtitle,
  listingTableCard,
  listingTableFooter,
  listingTableTh,
  listingTableThSm,
  listingTitle,
  listingToolbar,
} from '@/lib/listingPageStyles';

const PAGE_SIZE = 20;

const STATUS_TABS: { value: ApiResultStatus; label: string; color: string }[] =
  [
    { value: 'DRAFT', label: 'Draft', color: 'bg-orange-500' },
    { value: 'ENTERED', label: 'Entered', color: 'bg-amber-500' },
    { value: 'REVIEWED', label: 'Reviewed', color: 'bg-violet-500' },
    { value: 'APPROVED', label: 'Approved', color: 'bg-emerald-600' },
    { value: 'REPORTED', label: 'Reported', color: 'bg-sky-600' },
  ];

function formatRange(
  low: number | null | undefined,
  high: number | null | undefined,
): string {
  if (low != null && high != null) return `${low} – ${high}`;
  if (low != null) return `≥ ${low}`;
  if (high != null) return `≤ ${high}`;
  return '—';
}

function getAbnormalBadgeVariant(flag: string) {
  const key = (flag || '').toUpperCase();
  if (key === 'HIGH' || key === 'CRITICAL') return 'danger' as const;
  if (key === 'LOW') return 'warning' as const;
  return 'secondary' as const;
}

function getStatusBadgeVariant(status: string) {
  const key = (status || '').toUpperCase();
  if (key === 'VERIFIED' || key === 'APPROVED' || key === 'REPORTED')
    return 'success' as const;
  if (key === 'DRAFT' || key === 'ENTERED') return 'warning' as const;
  if (key === 'REVIEWED') return 'info' as const;
  return 'secondary' as const;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleString();
}

function canVerifyRow(row: ResultStatusItem): boolean {
  const status = (row.resultStatus || '').toUpperCase();
  return (
    !row.isVerified &&
    (status === 'DRAFT' || status === 'ENTERED')
  );
}

function ResultActions({
  row,
  onVerify,
}: {
  row: ResultStatusItem;
  onVerify: (row: ResultStatusItem) => void;

}) {
  const showVerify = canVerifyRow(row);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Result actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} /> verify 
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-44 p-1.5 rounded-2xl border-slate-100 shadow-2xl"
      >
        {showVerify && (
          <DropdownMenuItem
            onClick={() => onVerify(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
          >
            <CheckCircle2 size={14} />
            Approve / Reject
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ResultVerificationPage() {
  const [pageNo, setPageNo] = useState(0);
  const [statusFilter, setStatusFilter] = useState<ApiResultStatus>('DRAFT');
  const [selectedRow, setSelectedRow] = useState<PendingVerificationItem | null>(
    null,
  );
  const [panelMode, setPanelMode] = useState<VerificationPanelMode>('verify');

  const { data, isLoading, isError, error, refetch, isFetching } =
    useResultStatusList({
      status: statusFilter,
      page: pageNo,
      size: PAGE_SIZE,
    });

  const rows: ResultStatusItem[] = useMemo(
    () => (Array.isArray(data?.data?.content) ? data.data.content : []),
    [data],
  );

  const totalElements = data?.data?.totalElements ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;
  const canPrev = pageNo > 0;
  const canNext = pageNo + 1 < totalPages;

  const showInitialLoader = isLoading && !data;
  const criticalOnPage = rows.filter((r) => r.isCritical).length;
  const activeTab = STATUS_TABS.find((t) => t.value === statusFilter);

  const openPanel = (row: ResultStatusItem, mode: VerificationPanelMode) => {
    setSelectedRow(toPendingVerificationRow(row));
    setPanelMode(mode);
  };

  const closePanel = () => setSelectedRow(null);

  const handleStatusChange = (status: ApiResultStatus) => {
    setStatusFilter(status);
    setPageNo(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className={listingTitle}>
            Result <span className="text-emerald-600">Verification</span>
          </h1>
          <p className={listingSubtitle}>
            Browse results by status — DRAFT, ENTERED, REVIEWED, APPROVED,
            REPORTED.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 h-10 px-4 shrink-0 self-start xl:self-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            size={16}
            className={isFetching ? 'animate-spin' : ''}
            aria-hidden
          />
          Refresh
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className={listingToolbar}>
        <div className="flex flex-wrap items-center gap-1 px-4 py-2.5 bg-slate-50/60">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-2 shrink-0">
            Status
          </span>
          {STATUS_TABS.map(({ value, label, color }) => {
            const isActive = statusFilter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleStatusChange(value)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                  isActive
                    ? `${color} text-white shadow-sm`
                    : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
                }`}
                disabled={isLoading}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {!showInitialLoader && totalElements > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/90 px-4 sm:px-5 py-3.5">
          <div className="flex items-center gap-3">
            <FileCheck className="text-violet-600 shrink-0" size={20} aria-hidden />
            <p className="text-sm font-bold text-violet-900">
              {totalElements} {activeTab?.label ?? statusFilter} result
              {totalElements === 1 ? '' : 's'}
            </p>
          </div>
          {criticalOnPage > 0 && (
            <div className="flex items-center gap-2 sm:ml-auto">
              <AlertCircle size={14} className="text-rose-600" aria-hidden />
              <span className="text-xs font-bold text-rose-700">
                {criticalOnPage} critical on this page
              </span>
            </div>
          )}
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 sm:px-5 py-3.5 text-sm font-bold text-rose-800">
          {(error as Error)?.message || 'Failed to load results.'}
        </div>
      )}

      {showInitialLoader ? (
        <div className={listingLoadingBox}>
          <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
          <p className={listingLoadingText}>Loading {statusFilter} results…</p>
        </div>
      ) : totalElements === 0 ? (
        <div className={listingEmptyBox}>
          <p className={listingEmptyTitle}>
            No {activeTab?.label ?? statusFilter} results found.
          </p>
          <p className={listingEmptySub}>
            Try another status tab or check back later.
          </p>
        </div>
      ) : (
        <div className={listingTableCard}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-240 text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className={`${listingTableThSm} hidden sm:table-cell`}>
                    Result ID
                  </th>
                  <th className={listingTableThSm}>Parameter</th>
                  <th className={listingTableThSm}>Result</th>
                  <th className={`${listingTableThSm} hidden md:table-cell`}>
                    Unit
                  </th>
                  <th className={`${listingTableThSm} hidden lg:table-cell`}>
                    Reference
                  </th>
                  <th className={`${listingTableTh} text-center`}>Flag</th>
                  <th className={`${listingTableTh} text-center`}>Status</th>
                  <th className={`${listingTableTh} text-center hidden sm:table-cell`}>
                    Critical
                  </th>
                  <th className={`${listingTableThSm} hidden xl:table-cell`}>
                    Entered At
                  </th>
                  
                  <th className={`${listingTableTh} text-center w-14`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.resultId}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-4 sm:px-6 py-4 text-xs font-mono font-semibold text-slate-600 hidden sm:table-cell">
                      {row.resultId}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors max-w-45 sm:max-w-none truncate sm:whitespace-normal">
                        {row.parameterName || '—'}
                      </div>
                      {row.clinicalInterpretation ? (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 line-clamp-2">
                          {row.clinicalInterpretation}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`text-sm font-black ${
                          row.isCritical ? 'text-rose-600' : 'text-slate-800'
                        }`}
                      >
                        {row.resultValue || '—'}
                      </span>
                      <span className="md:hidden text-[10px] font-bold uppercase text-slate-400 ml-1">
                        {row.unit}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[11px] font-semibold text-slate-700 hidden md:table-cell">
                      {row.unit || '—'}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[11px] font-semibold text-slate-600 hidden lg:table-cell">
                      {formatRange(row.referenceLow, row.referenceHigh)}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <Badge
                        variant={getAbnormalBadgeVariant(row.abnormalFlag)}
                        className="text-[10px] font-bold"
                      >
                        {row.abnormalFlag || '—'}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <Badge
                        variant={getStatusBadgeVariant(row.resultStatus)}
                        className="text-[10px] font-bold"
                      >
                        {row.resultStatus || '—'}
                      </Badge>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                      <span
                        className={
                          row.isCritical
                            ? 'text-rose-600 text-xs font-bold'
                            : 'text-slate-400 text-xs font-bold'
                        }
                      >
                        {row.isCritical ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-[11px] font-medium text-slate-500 hidden xl:table-cell whitespace-nowrap">
                      {formatDateTime(row.enteredAt)}
                    </td>
                  
                    <td className="px-4 sm:px-6 py-4 text-center">
                      <ResultActions
                        row={row}
                        onVerify={(r) => openPanel(r, 'verify')}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={listingTableFooter}>
            <div className={`flex items-center gap-2 ${listingPaginationText}`}>
              <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
              <span>
                Page {pageNo + 1} of {Math.max(totalPages, 1)}
                <span className="text-slate-400 mx-2">·</span>
                {totalElements} total
              </span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={listingPaginationBtn}
                disabled={!canPrev || isFetching}
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={listingPaginationBtn}
                disabled={!canNext || isFetching}
                onClick={() => setPageNo((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      <ResultVerificationPanel
        isOpen={selectedRow != null}
        onClose={closePanel}
        row={selectedRow}
        mode={panelMode}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
