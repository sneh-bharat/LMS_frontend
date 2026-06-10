'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle,
  ChevronDown,
  Eye,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Trash2,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { ConfirmAlertDialog, DeleteAlertDialog } from '@/components/ui';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getOrganizationCode,
  getOrganizationEmail,
  getOrganizationName,
  getOrganizationPhone,
  getOrganizationStatus,
  getOrganizationType,
  type Organization,
} from '@/app/Apis/organizations/organization';
import {
  useOrganizations,
  useOrganizationStatistics,
  useApproveOrganization,
  useToggleOrganizationStatus,
  useDeleteOrganization,
} from '@/app/Apis/organizations/useOrganizations';
import { useBranchesAll } from '@/app/Apis/branch/useBranchApi';
import type { Branch } from '@/app/Apis/branch/branchApi';
import OrganizationDetailsDrawer from './details';
import AddNewOrganization from './Add-new-orgn';
import EditOrganization from './Edit-orgn';

const PAGE_SIZE = 10;

const filterLabelClass =
  'text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1';
const inputClass =
  'h-11 rounded-xl border-slate-200 bg-white/80 hover:bg-white transition-all font-bold shadow-none ring-0 focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500';

function statusBadgeVariant(status: string) {
  const s = status.toUpperCase();
  if (s === 'ACTIVE' || s === 'APPROVED') return 'success';
  if (s === 'PENDING') return 'warning';
  if (s === 'INACTIVE' || s === 'REJECTED') return 'destructive';
  return 'secondary';
}

function OrganizationActions({
  row,
  onView,
  onEdit,
  onApprove,
  onToggleStatus,
  onDelete,
}: {
  row: Organization;
  onView: (row: Organization) => void;
  onEdit: (row: Organization) => void;
  onApprove?: (row: Organization) => void;
  onToggleStatus?: (row: Organization) => void;
  onDelete?: (row: Organization) => void;
}) {
  const status = getOrganizationStatus(row);
  const isPending = status === 'PENDING';
  const isActive = row.isActive;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Organization actions"
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
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        {isPending && onApprove && (
          <DropdownMenuItem
            onClick={() => onApprove(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-amber-600 focus:bg-amber-50 focus:text-amber-700"
          >
            <Plus size={14} className="rotate-0 text-amber-600" />
            Approve
          </DropdownMenuItem>
        )}
        {!isPending && onToggleStatus && (
          <DropdownMenuItem
            onClick={() => onToggleStatus(row)}
            className={`rounded-lg py-2.5 text-xs font-black uppercase ${isActive ? 'text-rose-600 focus:bg-rose-50 focus:text-rose-700' : 'text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700'}`}
          >
            <Plus size={14} className={isActive ? 'rotate-45' : 'rotate-0'} />
            {isActive ? 'Deactivate' : 'Activate'}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={() => onDelete(row)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-rose-600 focus:bg-rose-50 focus:text-rose-700"
          >
            <Trash2 size={14} />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function OrganizationPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchId, setBranchId] = useState<string>('');
  const [branchReady, setBranchReady] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<number | null>(null);
  const [organizationToEdit, setOrganizationToEdit] = useState<Organization | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [organizationToApprove, setOrganizationToApprove] = useState<Organization | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [organizationToToggle, setOrganizationToToggle] = useState<Organization | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [organizationToDelete, setOrganizationToDelete] = useState<Organization | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [flashApiMessage, setFlashApiMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const parsedBranchId = useMemo(() => {
    if (!branchId) return null;
    const id = Number.parseInt(branchId.trim(), 10);
    return Number.isFinite(id) && id > 0 ? id : null;
  }, [branchId]);

  useEffect(() => {
    setPageNo(0);
  }, [parsedBranchId]);

  /* ── Branches (tenants/all) ── */
  const {
    data: branchesRes,
    isLoading: isBranchesLoading,
  } = useBranchesAll({ page: 0, size: 100 });
  const branches: Branch[] = branchesRes?.data?.content ?? [];

  // Auto-select first branch when branches load
  useEffect(() => {
    if (!branchReady && branches.length > 0) {
      setBranchId(String(branches[0].id));
      setBranchReady(true);
    }
  }, [branches, branchReady]);

  const {
    data: statisticsRes,
    isLoading: isStatisticsLoading,
    isError: isStatisticsError,
    error: statisticsError,
    isFetching: isStatisticsFetching,
    refetch: refetchStatistics,
  } = useOrganizationStatistics({});

  const statistics = statisticsRes?.data ?? null;

  const statCards = useMemo(
    () => [
      {
        label: 'Total Organizations',
        value: statistics != null ? String(statistics.totalOrganizations) : '—',
        icon: Building2,
        tone: 'text-[#FF671F]',
        bg: 'bg-[#FF671F]/15',
        valueColor: 'text-[#FF671F]',
      },
      {
        label: 'Active',
        value: statistics != null ? String(statistics.activeOrganizations) : '—',
        icon: CheckCircle,
        tone: 'text-[#006D77]',
        bg: 'bg-[#006D77]/15',
        valueColor: 'text-[#006D77]',
      },
      {
        label: 'Inactive',
        value: statistics != null ? String(statistics.inactiveOrganizations) : '—',
        icon: XCircle,
        tone: 'text-red-600',
        bg: 'bg-red-400/30',
        valueColor: 'text-red-600',
      },
    ],
    [statistics]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useOrganizations(
    {
      pageNo,
      pageSize: PAGE_SIZE,
      branchId: parsedBranchId ?? undefined,
      searchTerm: debouncedSearchTerm.trim() || undefined,
    },
    { enabled: branchReady && (parsedBranchId != null || debouncedSearchTerm.trim().length > 0) }
  );

  const approveMutation = useApproveOrganization();
  const toggleMutation = useToggleOrganizationStatus();
  const deleteMutation = useDeleteOrganization();

  useEffect(() => {
    const msg = data?.message?.trim();
    if (!msg || !dataUpdatedAt) return;
    setFlashApiMessage(msg);
    const timer = window.setTimeout(() => setFlashApiMessage(null), 2000);
    return () => window.clearTimeout(timer);
  }, [data?.message, dataUpdatedAt]);

  const page = data?.data;
  const organizations = page?.content ?? [];
  const totalPages = page?.totalPages ?? 1;
  const totalElements = page?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page?.last != null ? !page.last : pageNo + 1 < totalPages;

  const handleView = (org: Organization) => {
    setSelectedOrganizationId(org.id);
    setDetailsOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setOrganizationToEdit(org);
    setEditOpen(true);
  };

  const handleApprove = (org: Organization) => {
    setOrganizationToApprove(org);
    setApproveOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!organizationToApprove) return;
    try {
      const res = await approveMutation.mutateAsync(organizationToApprove.id);
      if (res.response === false) {
        toast.error(res.message || 'Failed to approve organization.');
        return;
      }
      toast.success(res.message || 'Organization approved successfully.');
      setApproveOpen(false);
      setOrganizationToApprove(null);
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve organization.');
    }
  };

  const handleToggleStatus = (org: Organization) => {
    setOrganizationToToggle(org);
    setStatusDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!organizationToToggle) return;
    try {
      const res = await toggleMutation.mutateAsync({
        organizationId: organizationToToggle.id,
        isActive: !organizationToToggle.isActive,
      });
      if (res.response === false) {
        toast.error(res.message || 'Failed to update organization status.');
        return;
      }
      toast.success(res.message || 'Status updated successfully.');
      setStatusDialogOpen(false);
      setOrganizationToToggle(null);
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.');
    }
  };

  const handleDelete = (org: Organization) => {
    setOrganizationToDelete(org);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!organizationToDelete) return;
    try {
      const res = await deleteMutation.mutateAsync(organizationToDelete.id);
      if (res.response === false) {
        toast.error(res.message || 'Failed to delete organization.');
        return;
      }
      toast.success(res.message || 'Organization deleted successfully.');
      setDeleteOpen(false);
      setOrganizationToDelete(null);
      void refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete organization.');
    }
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedOrganizationId(null);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setOrganizationToEdit(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AddNewOrganization
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => void refetch()}
        defaultTargetBranchId={parsedBranchId ?? undefined}
      />
      <EditOrganization
        isOpen={editOpen}
        onClose={closeEdit}
        onSuccess={() => void refetch()}
        organization={organizationToEdit}
      />
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Masters — <span className="text-[#FF671F]">Organization</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            View corporate and B2B organizations registered under a branch.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 font-bold border-slate-200 bg-white shadow-sm"
            disabled={isLoading || isFetching || isStatisticsFetching}
            onClick={() => {
              void refetch();
              void refetchStatistics();
            }}
          >
            <RefreshCw
              size={16}
              className={isFetching || isStatisticsFetching ? 'animate-spin' : ''}
              aria-hidden
            />
            Refresh
          </Button>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8"
            onClick={() => setAddOpen(true)}
          >
            <Plus size={16} aria-hidden />
            New Organization
          </Button>
        </div>
      </div>
      
      {isStatisticsError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {statisticsError instanceof Error
            ? statisticsError.message
            : 'Failed to load organization statistics.'}
        </div>
      ) : null}

      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-sm">
        {isStatisticsLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" aria-hidden />
            <span className="text-sm font-semibold">Loading statistics…</span>
          </div>
        ) : (
          <div className="flex flex-nowrap items-stretch gap-0 overflow-x-auto pb-1 scrollbar-thin">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.label}
                  className={`flex min-w-[9.5rem] flex-1 flex-col items-center justify-center px-3 py-1 text-center sm:min-w-0 ${
                    index < statCards.length - 1 ? 'border-r border-slate-200/70' : ''
                  }`}
                >
                  <div
                    className={`mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
                  >
                    <Icon size={18} className={card.tone} aria-hidden />
                  </div>
                  <span className="mb-1 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <span
                    className={`text-lg font-black leading-none sm:text-xl ${card.valueColor}`}
                  >
                    {card.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

     
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-4">
        {/* Branch selector */}
        {/* <div className="relative w-full md:w-72 shrink-0">
          <label className={`block ${filterLabelClass} mb-1`}>Branch</label>
          {isBranchesLoading ? (
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400">
              <Loader2 className="animate-spin" size={16} aria-hidden />
              Loading branches…
            </div>
          ) : branches.length === 0 ? (
            <div className="flex h-11 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 text-sm text-amber-700 font-semibold">
              <AlertCircle size={16} aria-hidden />
              No branches available
            </div>
          ) : (
            <div className="relative">
              <select
                value={branchId}
                onChange={(e) => {
                  setBranchId(e.target.value);
                  setBranchReady(true);
                  setPageNo(0);
                }}
                className={`${inputClass} w-full appearance-none pr-10 pl-4 cursor-pointer`}
              >
                <option value="" disabled>Select branch</option>
                {branches.map((b) => (
                  <option key={b.id} value={String(b.id)}>
                    {b.branchName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          )}
        </div> */}

        <div className="relative group flex-1 w-full">
          <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                size={18}
              />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPageNo(0);
                }}
                placeholder="Search by name or code..."
                className={`${inputClass} pl-11 pr-10`}
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPageNo(0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors"
                >
                  <SearchX size={16} />
                </button>
              )}
        </div>
       
      </div>


      <div className="w-full overflow-hidden rounded-[1.5rem] bg-white border border-slate-300 backdrop-blur-md shadow-sm">
        <Table className="border-collapse">
          <TableHeader className="bg-teal-600 border-b border-slate-100">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                ID
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                Organization Name
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                Code
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                Type
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                Phone
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                Email
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                Status
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
                Active/Inactive
              </TableHead>
              <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-50">
            {!branchReady ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={9}
                  className="px-6 py-16 text-center text-slate-500 text-sm font-semibold"
                >
                  Please select a branch to load organizations.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Gathering organizations…
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="px-6 py-12">
                  <div className="flex flex-wrap items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    <AlertCircle size={18} className="shrink-0" aria-hidden />
                    <span className="font-medium">{error?.message || 'Failed to load organizations.'}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="font-bold bg-white border-rose-200"
                      onClick={() => refetch()}
                    >
                      Retry
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                      <Building2 size={32} strokeWidth={1} aria-hidden />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">No organizations found</h4>
                    <p className="text-xs font-semibold text-slate-500 tracking-tight">
                      No records for branch {parsedBranchId} on this page.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => {
                const status = getOrganizationStatus(org);
                return (
                  <TableRow
                    key={org.id}
                    className="hover:bg-emerald-50/30 text-white transition-all group cursor-pointer border-none"
                    onClick={() => handleView(org)}
                  >
                    <TableCell className="px-6 py-5 font-mono text-xs font-bold text-slate-500">
                      {org.id}
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <span className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                        {getOrganizationName(org)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <span className="text-xs font-bold text-slate-500 font-mono group-hover:text-emerald-600 transition-colors">
                        {getOrganizationCode(org)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-5 text-xs font-bold text-slate-600">
                      {getOrganizationType(org)}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-xs font-bold text-slate-600">
                      {getOrganizationPhone(org)}
                    </TableCell>
                    <TableCell className="px-6 py-5 text-xs font-bold text-slate-600 max-w-[200px] truncate">
                      {getOrganizationEmail(org)}
                    </TableCell>
                    <TableCell className="px-6 py-5">
                      <Badge
                        variant={statusBadgeVariant(status)}
                        className="font-black text-[10px] uppercase tracking-wider"
                      >
                        {status}
                      </Badge>

                    </TableCell>
                    <TableCell
                      className="font-black text-[10px] uppercase tracking-wider"
                    >
                      <Badge
                        variant={org.isActive ? 'success' : 'destructive'}
                        className="font-black text-[10px] uppercase tracking-wider"
                      >
                        {org.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="px-6 py-5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <OrganizationActions
                        row={org}
                        onView={handleView}
                        onEdit={handleEdit}
                        onApprove={handleApprove}
                        onToggleStatus={handleToggleStatus}
                        onDelete={handleDelete}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {parsedBranchId != null && !isLoading && !isError ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/80">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Page {pageNo + 1} of {totalPages}
              <span className="text-slate-400 font-semibold normal-case tracking-normal ml-2">
                · {totalElements} organization{totalElements === 1 ? '' : 's'}
              </span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200 bg-white"
                disabled={!canPrev || isFetching}
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200 bg-white"
                disabled={!canNext || isFetching}
                onClick={() => setPageNo((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      <ConfirmAlertDialog
        isOpen={approveOpen}
        onClose={() => {
          setApproveOpen(false);
          setOrganizationToApprove(null);
        }}
        onConfirm={handleConfirmApprove}
        title="Approve Organization"
        description={`Are you sure you want to approve "${organizationToApprove?.orgName}"? This will activate the organization and allow them to start using the platform.`}
        confirmText="Approve Organization"
        isLoading={approveMutation.isPending}
        variant="success"
      />

      <ConfirmAlertDialog
        isOpen={statusDialogOpen}
        onClose={() => {
          setStatusDialogOpen(false);
          setOrganizationToToggle(null);
        }}
        onConfirm={handleConfirmToggleStatus}
        title={organizationToToggle?.isActive ? 'Deactivate Organization' : 'Activate Organization'}
        description={`Are you sure you want to ${organizationToToggle?.isActive ? 'deactivate' : 'activate'} "${organizationToToggle?.orgName}"? This will ${organizationToToggle?.isActive ? 'disable' : 'enable'} their access to the platform.`}
        confirmText={organizationToToggle?.isActive ? 'Deactivate Now' : 'Activate Now'}
        isLoading={toggleMutation.isPending}
        variant={organizationToToggle?.isActive ? 'destructive' : 'success'}
      />

      <DeleteAlertDialog
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setOrganizationToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Organization"
        description={`Are you sure you want to permanently delete "${organizationToDelete?.orgName}"? This action cannot be undone and all associated data will be lost.`}
        isLoading={deleteMutation.isPending}
      />

      <OrganizationDetailsDrawer
        isOpen={detailsOpen}
        onClose={closeDetails}
        organizationId={selectedOrganizationId}
      />
    </div>
  );
}