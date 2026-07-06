'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import {
  AlertCircle,
  ChevronDown,
  Database,
  Eye,
  Filter,
  Loader,
  Mail,
  MoreHorizontal,
  Pencil,
  Percent,
  History,
  Phone,
  RefreshCw,
  Wallet,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import { fetchReferrerCommissions, type ReferrerCommission } from '@/app/Apis/Referrer/ReferrerCommission';
import { referrerCommissionQueryKeys } from '@/app/Apis/Referrer/useReferrerCommission';
import Commission from './commission';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
  getReferrerName,
  getReferrerPhone,
  getReferrerStatusLabel,
  getShowOnReportLabel,
  isReferrerActive,
  type Referrer,
} from '@/app/Apis/Referrer/referrerApi';
import { useDeleteReferrer, useReferrersList } from '@/app/Apis/Referrer/useReferrer';
import AddReferrer from './AddReferrer';
import ReferrerDetailsView from './details-view';
import GetTestCommission from './GetTestCommission';
import GetPaymentHistory from './GetPaymentHistory';
import ReferrerCommissionPay from './ReferrerCommissionpay';
import PayReferrerCommission from './PayReferrerCommission';
import CalculateRff from './CalculateRff';

const PAGE_SIZE = 10;

type SearchBy = 'Name' | 'Username' | 'Phone' | 'Email';
type StatusFilter = 'All' | 'Active';

type CommissionDrawerState = {
  referrerId: number;
  referrerName: string;
  commissionId?: number | null;
  initialCommission?: ReferrerCommission;
};

function ReferrerActions({
  row,
  hasCommission,
  onView,
  onEdit,
  onDelete,
  onCommissionCreate,
  onCommissionEdit,
  onTestCommissions,
  onPaymentHistory,
  onCommissionPay,
  onPayCommission,
  onCalculateCommission,
}: {
  row: Referrer;
  hasCommission: boolean;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (row: Referrer) => void;
  onCommissionCreate: (row: Referrer) => void;
  onCommissionEdit: (row: Referrer) => void;
  onTestCommissions: (row: Referrer) => void;
  onPaymentHistory: (row: Referrer) => void;
  onCommissionPay: (row: Referrer) => void;
  onPayCommission: (row: Referrer) => void;
  onCalculateCommission: (row: Referrer) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Referrer actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-44 p-1.5 rounded-2xl border-slate-100 shadow-2xl"
      >
        <DropdownMenuItem
          onClick={() => onView(row.id)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(row.id)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-blue-600 focus:bg-blue-50 focus:text-blue-700"
        >
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        {!hasCommission ? (
          <DropdownMenuItem
            onClick={() => onCommissionCreate(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
          >
            <Percent size={14} />
            Commission
          </DropdownMenuItem>
        ) : (
          <>
            <DropdownMenuItem
              onClick={() => onCommissionEdit(row)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
            >
              <Pencil size={14} />
              Edit Commission
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onTestCommissions(row)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
            >
              <Percent size={14} />
              Test Commissions
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem
          onClick={() => onPaymentHistory(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-sky-600 focus:bg-sky-50 focus:text-sky-700"
        >
          <History size={14} />
          Payment history
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onCommissionPay(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-violet-600 focus:bg-violet-50 focus:text-violet-700"
        >
          <Wallet size={14} />
          Commission details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onPayCommission(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-indigo-600 focus:bg-indigo-50 focus:text-indigo-700"
        >
          <Wallet size={14} />
          Pay Commission
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onCalculateCommission(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-[#ff671f] focus:bg-orange-50 focus:text-[#ff671f]"
        >
          <Wallet size={14} />
          Calculate to Commission
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(row)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-rose-600 focus:bg-rose-50 focus:text-rose-700"
        >
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ReferrerListPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('Name');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [viewReferrerId, setViewReferrerId] = useState<number | null>(null);
  const [editReferrerId, setEditReferrerId] = useState<number | null>(null);
  const [referrerToDelete, setReferrerToDelete] = useState<{ id: number; name: string } | null>(null);

  const deleteMutation = useDeleteReferrer();
  const { data, isLoading, isError, error, refetch, isFetching } = useReferrersList({
    pageNo,
    pageSize: PAGE_SIZE,
    listType: statusFilter === 'Active' ? 'active' : 'all',
  });

  useEffect(() => {
    setPageNo(0);
  }, [statusFilter, searchBy]);

  const page = data?.data;
  const rows = page?.content ?? [];

  const filteredRows = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      if (searchBy === 'Username') {
        return (row.username ?? '').toLowerCase().includes(term);
      }
      if (searchBy === 'Phone') {
        const phone = getReferrerPhone(row).replace(/\D/g, '');
        const digits = term.replace(/\D/g, '');
        return phone.includes(digits) || getReferrerPhone(row).toLowerCase().includes(term);
      }
      if (searchBy === 'Email') {
        return (row.email ?? '').toLowerCase().includes(term);
      }
      return getReferrerName(row).toLowerCase().includes(term);
    });
  }, [rows, searchText, searchBy]);

  const pageReferrerIds = useMemo(
    () => filteredRows.map((row) => row.id).filter((id) => id > 0),
    [filteredRows]
  );

  const commissionChecks = useQueries({
    queries: pageReferrerIds.map((id) => ({
      queryKey: referrerCommissionQueryKeys.byReferrer(id),
      queryFn: () => fetchReferrerCommissions(id),
      staleTime: 30_000,
      enabled: !isLoading && id > 0,
    })),
  });

  const referrerIdsWithCommission = useMemo(() => {
    const set = new Set<number>();
    commissionChecks.forEach((query, index) => {
      const id = pageReferrerIds[index];
      if (id && (query.data?.data?.length ?? 0) > 0) {
        set.add(id);
      }
    });
    return set;
  }, [commissionChecks, pageReferrerIds]);

  const openCommissionCreate = (row: Referrer) => {
    setCommissionReferrer({
      referrerId: row.id,
      referrerName: getReferrerName(row),
      commissionId: null,
    });
  };

  const openCommissionEdit = (row: Referrer) => {
    const index = pageReferrerIds.indexOf(row.id);
    const rules = index >= 0 ? commissionChecks[index]?.data?.data : undefined;
    const first = rules?.[0];
    if (!first) {
      toast.error('No commission rule found for this referrer.');
      return;
    }
    setCommissionReferrer({
      referrerId: row.id,
      referrerName: getReferrerName(row),
      commissionId: first.id,
      initialCommission: first,
    });
  };

  const closeCommission = () => setCommissionReferrer(null);

  const totalPages = page?.totalPages ?? 0;
  const totalElements = page?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page ? !page.last : false;
  // Separate state for each drawer
  const [commissionReferrer, setCommissionReferrer] = useState<CommissionDrawerState | null>(null);
  const [testCommissionReferrer, setTestCommissionReferrer] = useState<{ referrerId: number; referrerName: string } | null>(null);
  const openPaymentHistory = (referrer: Referrer) => {
    setPaymentHistoryReferrer({
      referrerId: referrer.id, referrerName: getReferrerName(referrer),
    });
  };
  const [commissionDetailsReferrer, setCommissionDetailsReferrer] = useState<{
    referrerId: number;
    referrerName: string;
  } | null>(null);
  const [payCommissionReferrer, setPayCommissionReferrer] = useState<{
    referrerId: number;
    referrerName: string;
  } | null>(null);
  const [calculateCommissionReferrer, setCalculateCommissionReferrer] = useState<{
    referrerId: number;
    referrerName: string;
  } | null>(null);

  const openCommissionDetails = (referrer: Referrer) => {
    setCommissionDetailsReferrer({
      referrerId: referrer.id,
      referrerName: getReferrerName(referrer),
    });
  };

  const openPayCommission = (referrer: Referrer) => {
    setPayCommissionReferrer({
      referrerId: referrer.id,
      referrerName: getReferrerName(referrer),
    });
  };

  const openCalculateCommission = (referrer: Referrer) => {
    setCalculateCommissionReferrer({
      referrerId: referrer.id,
      referrerName: getReferrerName(referrer),
    });
  };
  const closePaymentHistory = () => { setPaymentHistoryReferrer(null); };

  const [paymentHistoryReferrer, setPaymentHistoryReferrer] = useState<{ referrerId: number; referrerName: string; } | null>(null);

  const openEditFromView = (referrer: Referrer) => {
    setViewReferrerId(null);
    setEditReferrerId(referrer.id);
  };

  const closeEditDrawer = () => setEditReferrerId(null);

  const handleReferrerSaved = () => {
    closeEditDrawer();
    refetch();
  };

  const openDeleteDialog = (row: Referrer) => {
    setReferrerToDelete({ id: row.id, name: getReferrerName(row) });
  };

  const closeDeleteDialog = () => {
    if (deleteMutation.isPending) return;
    setReferrerToDelete(null);
  };

  const openTestCommissions = (referrer: Referrer) => {
    setTestCommissionReferrer({
      referrerId: referrer.id,
      referrerName: getReferrerName(referrer),
    });
  };

  const handleConfirmDelete = () => {
    if (!referrerToDelete) return;
    const { id, name } = referrerToDelete;
    deleteMutation.mutate(id, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || `Deleted: ${name}`);
        setReferrerToDelete(null);
        if (viewReferrerId === id) setViewReferrerId(null);
        if (editReferrerId === id) setEditReferrerId(null);
        refetch();
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : 'Failed to delete referrer.');
      },
    });
  };

  return (
    <>
      <RightDrawer
        isOpen={addDrawerOpen}
        onClose={() => setAddDrawerOpen(false)}
        title={
          <>
            Add <span className="text-emerald-200">referrer</span>
          </>
        }
        description="Register a new referrer account"
        maxWidth="md"
      >
        <AddReferrer
          isOpen={addDrawerOpen}
          onSuccess={() => {
            setAddDrawerOpen(false);
            refetch();
          }}
          onClose={() => setAddDrawerOpen(false)}
        />
      </RightDrawer>

      <ReferrerDetailsView
        isOpen={viewReferrerId != null}
        onClose={() => setViewReferrerId(null)}
        referrerId={viewReferrerId}
        onEdit={openEditFromView}
      />

      <RightDrawer
        isOpen={editReferrerId != null}
        onClose={closeEditDrawer}
        title={
          <>
            Edit <span className="text-emerald-200">referrer</span>
          </>
        }
        description={editReferrerId ? `Referrer ID: ${editReferrerId}` : undefined}
        maxWidth="md"
      >
        {editReferrerId ? (
          <AddReferrer
            isOpen={editReferrerId != null}
            referrerId={editReferrerId}
            onSuccess={handleReferrerSaved}
            onClose={closeEditDrawer}
          />
        ) : null}
      </RightDrawer>

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Referrer <span className="text-emerald-600">Management</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              View and manage referrer accounts, roles, and report visibility.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="gap-2 shadow-sm px-8 font-bold"
              onClick={() => setAddDrawerOpen(true)}
            >
              <UserPlus size={16} aria-hidden />
              New referrer
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
          <div className="relative flex-1 group w-full min-w-0">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
              size={18}
              aria-hidden
            />
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search referrers…"
              className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
              aria-label="Search referrers"
              disabled={isLoading}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
            <div className="relative flex-1 sm:min-w-35 group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" size={14} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
                aria-label="Status filter"
                disabled={isLoading}
              >
                <option value="All">All referrers</option>
                <option value="Active">Active only</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={14} />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg p-2.5 border-slate-200 shrink-0"
              onClick={() => refetch()}
              disabled={isLoading || isFetching}
              title="Refresh list"
            >
              <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} aria-hidden />
            </Button>
          </div>
        </div>

        {isError ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0" aria-hidden />
            <span className="font-medium">
              {error instanceof Error ? error.message : 'Failed to load referrers.'}
            </span>
            <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
            <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
            <p className="text-slate-600 font-medium">Loading referrers…</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-600 font-medium">
            No referrers found.
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Referrer name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Username
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                     Contact details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Role
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                  
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                        No matches on this page for your search.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => {
                      const active = isReferrerActive(row);
                      const showOnReport = getShowOnReportLabel(row);
                      return (
                        <tr
                          key={row.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                                <UserCheck size={18} aria-hidden />
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                                  {getReferrerName(row)}
                                </div>
                                {row.address?.trim() ? (
                                  <div className="text-xs text-slate-500 truncate max-w-55 mt-0.5">
                                    {row.address.trim()}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-semibold text-slate-700 font-mono">
                            {row.username?.trim() || '—'}
                          </td>
                         
                          <td className="px-6 py-5 max-w-55">
                            <div className="space-y-1.5 text-xs text-slate-700 font-semibold">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Mail size={12} className="text-emerald-500 shrink-0" aria-hidden />
                                {row.email?.trim() ? (
                                  <a
                                    href={`mailto:${row.email.trim()}`}
                                    className="truncate hover:text-emerald-700 transition-colors"
                                  >
                                    {row.email.trim()}
                                  </a>
                                ) : (
                                  <span>—</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <Phone size={12} className="text-emerald-500 shrink-0" aria-hidden />
                                <span className="truncate">{getReferrerPhone(row)}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide">
                              {row.role?.trim() || '—'}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Badge
                              variant={active ? 'default' : 'secondary'}
                              className={
                                active
                                  ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
                                  : 'text-[10px] font-bold'
                              }
                            >
                              {getReferrerStatusLabel(row)}
                            </Badge>
                          </td>
                          
                          <td className="px-6 py-5 text-center">
                            <ReferrerActions
                              row={row}
                              hasCommission={referrerIdsWithCommission.has(row.id)}
                              onView={setViewReferrerId}
                              onEdit={setEditReferrerId}
                              onDelete={openDeleteDialog}
                              onCommissionCreate={openCommissionCreate}
                              onCommissionEdit={openCommissionEdit}
                              onTestCommissions={openTestCommissions}
                              onPaymentHistory={openPaymentHistory}
                              onCommissionPay={openCommissionDetails}
                              onPayCommission={openPayCommission}
                              onCalculateCommission={openCalculateCommission}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
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
                  className="font-bold border-slate-200"
                  disabled={!canPrev || isFetching}
                  onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                >
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
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Commission
        isOpen={commissionReferrer != null}
        referrerId={commissionReferrer?.referrerId ?? null}
        referrerName={commissionReferrer?.referrerName}
        commissionId={commissionReferrer?.commissionId ?? null}
        initialCommission={commissionReferrer?.initialCommission ?? null}
        onClose={closeCommission}
      />

      <GetTestCommission
        isOpen={testCommissionReferrer != null}
        referrerId={testCommissionReferrer?.referrerId ?? null}
        referrerName={testCommissionReferrer?.referrerName}
        onClose={() => setTestCommissionReferrer(null)}
      />

      <GetPaymentHistory
        isOpen={paymentHistoryReferrer != null}
        referrerId={paymentHistoryReferrer?.referrerId ?? null}
        referrerName={paymentHistoryReferrer?.referrerName}
        onClose={closePaymentHistory}
      />

      <ReferrerCommissionPay
        isOpen={commissionDetailsReferrer != null}
        referrerId={commissionDetailsReferrer?.referrerId ?? null}
        referrerName={commissionDetailsReferrer?.referrerName}
        onClose={() => setCommissionDetailsReferrer(null)}
      />

      <PayReferrerCommission
        isOpen={payCommissionReferrer != null}
        referrerId={payCommissionReferrer?.referrerId ?? null}
        referrerName={payCommissionReferrer?.referrerName}
        onClose={() => setPayCommissionReferrer(null)}
        onPaid={() => refetch()}
      />

      <CalculateRff
        isOpen={calculateCommissionReferrer != null}
        referrerId={calculateCommissionReferrer?.referrerId ?? null}
        referrerName={calculateCommissionReferrer?.referrerName}
        onClose={() => setCalculateCommissionReferrer(null)}
      />

      <DeleteAlertDialog
        isOpen={Boolean(referrerToDelete)}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete referrer"
        description={
          referrerToDelete
            ? `Remove "${referrerToDelete.name}" from referrers? This cannot be undone.`
            : 'Are you sure you want to delete this referrer?'
        }
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
