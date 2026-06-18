'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Ban,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Database,
  Eye,
  Filter,
  Loader,
  MoreVertical,
  RefreshCw,
  Search,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  canApproveTestRequisition,
  canSoftDeleteTestRequisition,
  formatAmountPaid,
  formatRequisitionDate,
  getTestRequisitionDoctorName,
  getTestRequisitionNumber,
  getTestRequisitionPatientName,
  getTestRequisitionStatus,
  isTestRequisitionConverted,
  type TestRequisition,
} from '@/app/Apis/testRequest/TestRequestApi';
import { useDeleteTestRequisition, useTestRequisitionById, useTestRequisitionsList, useSearchTestRequisitions } from '@/app/Apis/testRequest/useTestRequisitions';
import NewRequisition from './newRequisition';
import DetailsRequisition from './DetailsRequisition';
import RejectRequisition from './RejectRequition';
import ApproveRequisition from './AppoveRequisition';
import {
  listingBadge,
  listingEmptyBox,
  listingEmptyTitle,
  listingFilterSelect,
  listingLoadingBox,
  listingLoadingText,
  listingPaginationBtn,
  listingPaginationText,
  listingRefreshBtn,
  listingRowMono,
  listingRowTitle,
  listingSearchInput,
  listingSubtitle,
  listingTableCard,
  listingTableFooter,
  listingTableTh,
  listingTitle,
  listingToolbar,
  listingToolbarInner,
} from '@/lib/listingPageStyles';

const PAGE_SIZE = 10;

const TABLE_CELL = 'px-3 py-4 sm:px-5 sm:py-5';

type StatusFilter = 'all' | string;

function statusBadgeClass(status?: string): string {
  const normalized = status?.trim().toUpperCase() ?? '';
  if (['COMPLETED', 'PAID', 'APPROVED', 'ACTIVE', 'DONE', 'CONFIRMED'].includes(normalized)) {
    return `bg-emerald-600 hover:bg-emerald-600 text-white ${listingBadge}`;
  }
  if (['PENDING', 'DRAFT', 'UNPAID', 'IN_PROGRESS', 'PROCESSING', 'SUBMITTED'].includes(normalized)) {
    return `bg-amber-500 hover:bg-amber-500 text-white ${listingBadge}`;
  }
  if (['CANCELLED', 'REJECTED', 'FAILED'].includes(normalized)) {
    return `bg-rose-600 hover:bg-rose-600 text-white ${listingBadge}`;
  }
  if (normalized === 'CONVERTED') {
    return `bg-violet-600 hover:bg-violet-600 text-white ${listingBadge}`;
  }
  return listingBadge;
}

function priorityBadgeClass(priority?: string): string {
  const normalized = priority?.trim().toUpperCase() ?? '';
  if (['URGENT', 'STAT', 'HIGH'].includes(normalized)) {
    return `bg-rose-600 hover:bg-rose-600 text-white ${listingBadge}`;
  }
  if (['NORMAL', 'ROUTINE', 'MEDIUM'].includes(normalized)) {
    return `bg-sky-600 hover:bg-sky-600 text-white ${listingBadge}`;
  }
  return listingBadge;
}

function TestRequisitionActions({
  requisition,
  onView,
  onApprove,
  onReject,
  onDelete,
  deleting,
}: {
  requisition: TestRequisition;
  onView: (requisitionId: number) => void;
  onApprove: (requisition: TestRequisition) => void;
  onReject: (requisition: TestRequisition) => void;
  onDelete: (requisition: TestRequisition) => void;
  deleting?: boolean;
}) {
  const canDelete = canSoftDeleteTestRequisition(requisition);
  const canApprove = canApproveTestRequisition(requisition);
  const status = requisition.requisitionStatus?.trim().toUpperCase() ?? '';
  const canReject =
    !isTestRequisitionConverted(requisition) &&
    status !== 'REJECTED' &&
    status !== 'CANCELLED';

  return (
    <div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              type="button"
              className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
              title="More actions"
              aria-label="More actions"
            >
              <MoreVertical size={15} strokeWidth={2} />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="min-w-56 p-1.5 rounded-xl border-slate-100 shadow-2xl">
          <DropdownMenuItem
            onClick={() => {
              if (requisition.id == null || requisition.id <= 0) {
                toast.error('Requisition id is missing.');
                return;
              }
              onView(requisition.id);
            }}
            className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
          >
            <Eye size={16} className="mr-3 text-emerald-500" />
            <span>View details</span>
          </DropdownMenuItem>

          {canApprove ? (
            <DropdownMenuItem
              onClick={() => onApprove(requisition)}
              className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700"
            >
              <CheckCircle size={16} className="mr-3 text-emerald-500" />
              <span>Approve requisition</span>
            </DropdownMenuItem>
          ) : null}

          {canReject || canDelete ? (
            <DropdownMenuSeparator className="my-1.5 bg-slate-50" />
          ) : null}

          {canReject ? (
            <DropdownMenuItem
              onClick={() => onReject(requisition)}
              className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-rose-700"
            >
              <XCircle size={16} className="mr-3 text-rose-500" />
              <span>Reject requisition</span>
            </DropdownMenuItem>
          ) : null}

          {canDelete ? (
            <DropdownMenuItem
              onClick={() => onDelete(requisition)}
              disabled={deleting}
              className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-amber-700"
            >
              <Ban size={16} className="mr-3 text-amber-500" />
              <span>Cancel requisition</span>
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default function TestRequestListPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [viewRequisitionId, setViewRequisitionId] = useState<number | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<{
    requisitionId: number;
    branchId: number;
    requisitionNumber?: string | null;
  } | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<{
    requisitionId: number;
    branchId: number;
    requisitionNumber?: string | null;
  } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<TestRequisition | null>(null);

  const isSearching = debouncedSearch.length > 0;

  const listQuery = useTestRequisitionsList(
    { pageNo, pageSize: PAGE_SIZE },
    { enabled: !isSearching }
  );

  const searchQuery = useSearchTestRequisitions({
    searchTerm: debouncedSearch,
    pageNo,
    pageSize: PAGE_SIZE,
    enabled: isSearching,
  });

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = isSearching ? searchQuery : listQuery;

  const refetch = isSearching ? searchQuery.refetch : listQuery.refetch;

  const {
    data: detailRes,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useTestRequisitionById(viewRequisitionId, detailsOpen);

  const deleteMutation = useDeleteTestRequisition();

  const handleViewRequisition = (requisitionId: number) => {
    setViewRequisitionId(requisitionId);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setViewRequisitionId(null);
  };

  const handleRejectRequisition = (requisition: TestRequisition) => {
    if (requisition.id == null || requisition.id <= 0) {
      toast.error('Requisition id is missing.');
      return;
    }

    if (requisition.branchId == null || requisition.branchId <= 0) {
      toast.error('Branch id is missing for this requisition.');
      return;
    }

    setRejectTarget({
      requisitionId: requisition.id,
      branchId: requisition.branchId,
      requisitionNumber: requisition.requisitionNumber,
    });
    setRejectOpen(true);
  };

  const handleCloseReject = () => {
    setRejectOpen(false);
    setRejectTarget(null);
  };

  const handleApproveRequisition = (requisition: TestRequisition) => {
    if (requisition.id == null || requisition.id <= 0) {
      toast.error('Requisition id is missing.');
      return;
    }

    if (requisition.branchId == null || requisition.branchId <= 0) {
      toast.error('Branch id is missing for this requisition.');
      return;
    }

    setApproveTarget({
      requisitionId: requisition.id,
      branchId: requisition.branchId,
      requisitionNumber: requisition.requisitionNumber,
    });
    setApproveOpen(true);
  };

  const handleCloseApprove = () => {
    setApproveOpen(false);
    setApproveTarget(null);
  };

  const handleDeleteRequisition = (requisition: TestRequisition) => {
    if (requisition.id == null || requisition.id <= 0) {
      toast.error('Requisition id is missing.');
      return;
    }

    if (isTestRequisitionConverted(requisition)) {
      toast.error('Converted requisitions cannot be cancelled.');
      return;
    }

    if (!canSoftDeleteTestRequisition(requisition)) {
      toast.error('This requisition is already cancelled.');
      return;
    }

    setCancelTarget(requisition);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget?.id) return;

    deleteMutation.mutate(cancelTarget.id, {
      onSuccess: (res) => {
        if (res?.response === false) {
          toast.error(res.message || 'Failed to cancel requisition.');
          return;
        }
        toast.success(res.message?.trim() || 'Requisition cancelled successfully.');
        if (viewRequisitionId === cancelTarget.id) {
          handleCloseDetails();
        }
        setCancelTarget(null);
        void refetch();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to cancel requisition.');
      },
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPageNo(0);
  }, [debouncedSearch, statusFilter]);

  const page = data?.data;
  const rows = page?.content ?? [];

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((row) => {
      const status = getTestRequisitionStatus(row);
      if (status !== '—') set.add(status);
    });
    return Array.from(set).sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    if (statusFilter === 'all') return rows;
    return rows.filter((row) => getTestRequisitionStatus(row) === statusFilter);
  }, [rows, statusFilter]);

  const totalPages = page?.totalPages ?? 1;
  const totalElements = page?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page ? !page.last && pageNo + 1 < totalPages : false;

  const handleRefresh = () => {
    if (isSearching) {
      void searchQuery.refetch();
    } else {
      void listQuery.refetch();
    }
  };

  const showInitialLoader = isLoading && rows.length === 0;

  return (
    <>
      <NewRequisition
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />

      <DetailsRequisition
        isOpen={detailsOpen}
        requisitionId={viewRequisitionId}
        detail={detailRes?.data ?? null}
        isLoading={isDetailLoading}
        isError={isDetailError}
        error={detailError instanceof Error ? detailError : null}
        onRetry={() => void refetchDetail()}
        onClose={handleCloseDetails}
      />

      <RejectRequisition
        isOpen={rejectOpen}
        requisitionId={rejectTarget?.requisitionId ?? null}
        branchId={rejectTarget?.branchId ?? null}
        requisitionNumber={rejectTarget?.requisitionNumber}
        onClose={handleCloseReject}
        onSuccess={() => {
          if (viewRequisitionId === rejectTarget?.requisitionId) {
            handleCloseDetails();
          }
          void refetch();
        }}
      />

      <ApproveRequisition
        isOpen={approveOpen}
        requisitionId={approveTarget?.requisitionId ?? null}
        branchId={approveTarget?.branchId ?? null}
        requisitionNumber={approveTarget?.requisitionNumber}
        onClose={handleCloseApprove}
        onSuccess={() => {
          if (viewRequisitionId === approveTarget?.requisitionId) {
            void refetchDetail();
          }
          void refetch();
        }}
      />

      <ConfirmAlertDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => {
          if (!deleteMutation.isPending) setCancelTarget(null);
        }}
        onConfirm={handleConfirmCancel}
        title="Cancel requisition"
        description={`Are you sure you want to cancel "${cancelTarget ? getTestRequisitionNumber(cancelTarget) : 'this requisition'}"? This will set the status to CANCELLED.`}
        confirmText="Confirm cancel"
        cancelText="Keep requisition"
        variant="warning"
        isLoading={deleteMutation.isPending}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className={listingTitle}>
              Test <span className="text-emerald-600">Requisition</span>
            </h1>
            <p className={`${listingSubtitle} max-w-xl`}>
              View and manage test requisitions across branches.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="gap-2 shadow-sm px-6 sm:px-8 font-bold w-full sm:w-auto justify-center"
              onClick={() => setAddModalOpen(true)}
            >
              <UserPlus size={16} aria-hidden />
              New requisition
            </Button>
          </div>
        </div>

        <div className={listingToolbar}>
          <div className={listingToolbarInner}>
            <div className="relative flex-1 group w-full min-w-0">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none"
                size={16}
                aria-hidden
              />
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search requisition, patient, or doctor…"
                className={listingSearchInput}
                aria-label="Search test requisitions"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
              <div className="relative flex-1 sm:min-w-35 group">
                <Filter
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none"
                  size={14}
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={listingFilterSelect}
                  aria-label="Filter by status"
                  disabled={isLoading}
                >
                  <option value="all">All statuses</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
                  size={14}
                />
              </div>
              <button
                type="button"
                className={listingRefreshBtn}
                onClick={handleRefresh}
                disabled={isLoading || isFetching}
                title="Refresh list"
              >
                <RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} aria-hidden />
              </button>
            </div>
          </div>
        </div>

        {isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0" aria-hidden />
            <span className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load test requisitions.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto font-bold"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {showInitialLoader ? (
          <div className={listingLoadingBox}>
            <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
            <p className={listingLoadingText}>Loading test requisitions…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className={listingEmptyBox}>
            <p className={listingEmptyTitle}>No test requisitions found.</p>
          </div>
        ) : (
          <div className={listingTableCard}>
            <div className="overflow-x-auto -mx-px">
              <table className="w-full min-w-[760px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className={listingTableTh}>Requisition</th>
                    <th className={listingTableTh}>Patient</th>
                    <th className={`${listingTableTh} hidden sm:table-cell`}>Priority</th>
                    <th className={`${listingTableTh} hidden lg:table-cell`}>Doctor</th>
                    <th className={`${listingTableTh} hidden md:table-cell`}>Date</th>
                    <th className={`${listingTableTh} text-center`}>Status</th>
                    <th className={`${listingTableTh} text-center hidden xl:table-cell`}>Amount</th>
                    <th className={`${listingTableTh} text-center sticky right-0 bg-slate-50`}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                        {isSearching
                          ? `No test requisitions found matching "${debouncedSearch}".`
                          : 'No test requisitions match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row, index) => {
                      const status = getTestRequisitionStatus(row);

                      return (
                        <tr
                          key={row.id ?? `${row.requisitionNumber ?? 'row'}-${index}`}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                        >
                          <td className={TABLE_CELL}>
                            <div className="flex items-start gap-2 sm:gap-3 min-w-[140px]">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                                <ClipboardList size={16} className="sm:hidden" aria-hidden />
                                <ClipboardList size={18} className="hidden sm:block" aria-hidden />
                              </div>
                              <div className="min-w-0">
                                <div className={`${listingRowTitle} text-sm sm:text-base truncate max-w-[120px] sm:max-w-none`}>
                                  {getTestRequisitionNumber(row)}
                                </div>
                                <div className="mt-1 sm:hidden">
                                  <Badge variant="secondary" className={priorityBadgeClass(row.priority)}>
                                    {row.priority?.trim() || '—'}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className={`${TABLE_CELL} text-sm font-semibold text-slate-800 max-w-[140px] sm:max-w-none`}>
                            <span className="line-clamp-2 sm:line-clamp-none">
                              {getTestRequisitionPatientName(row)}
                            </span>
                          </td>
                          <td className={`${TABLE_CELL} hidden sm:table-cell`}>
                            <Badge variant="secondary" className={priorityBadgeClass(row.priority)}>
                              {row.priority?.trim() || '—'}
                            </Badge>
                          </td>
                          <td className={`${TABLE_CELL} text-sm font-semibold text-slate-700 hidden lg:table-cell max-w-[160px]`}>
                            <span className="truncate block">
                              {getTestRequisitionDoctorName(row)}
                            </span>
                          </td>
                          <td className={`${TABLE_CELL} ${listingRowMono} hidden md:table-cell whitespace-nowrap`}>
                            {formatRequisitionDate(row.requisitionDate ?? row.createdAt)}
                          </td>
                          <td className={`${TABLE_CELL} text-center`}>
                            <Badge variant="secondary" className={statusBadgeClass(status)}>
                              {status}
                            </Badge>
                          </td>
                          <td className={`${TABLE_CELL} text-center text-sm font-bold text-slate-900 hidden xl:table-cell whitespace-nowrap`}>
                            {formatAmountPaid(row)}
                          </td>
                          <td className={`${TABLE_CELL} text-center sticky right-0 bg-white group-hover:bg-slate-50`}>
                            <TestRequisitionActions
                              requisition={row}
                              onView={handleViewRequisition}
                              onApprove={handleApproveRequisition}
                              onReject={handleRejectRequisition}
                              onDelete={handleDeleteRequisition}
                              deleting={deleteMutation.isPending}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className={`${listingTableFooter} flex-col gap-3 sm:flex-row sm:items-center`}>
              <div className={`flex items-center gap-2 ${listingPaginationText} justify-center sm:justify-start`}>
                <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
                <span>
                  Page {pageNo + 1} of {Math.max(totalPages, 1)}
                  <span className="text-slate-400 mx-2">·</span>
                  {totalElements} total
                </span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-end w-full sm:w-auto">
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
      </div>
    </>
  );
}
