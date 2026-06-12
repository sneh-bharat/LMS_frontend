'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Database,
  Eye,
  Filter,
  Loader,
  Mail,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getTenantAdminEmail,
  getTenantAdminPhone,
  getTenantCompanyName,
  getTenantName,
  getTenantRowKey,
  getTenantStatusLabel,
  getTenantSubscriptionPlan,
  isTenantActive,
  isTenantMutationSuccess,
  type Tenant,
  type TenantApiResponse,
} from '@/app/Apis/tenant/tenantApi';
import { useDeleteTenant, useTenantsList } from '@/app/Apis/tenant/useTenants';
import NewTenant from './NewTenant';
import TenantDetailsDrawer from './tenantDetails';
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
  listingRowPhone,
  listingRowTitle,
  listingRowValue,
  listingSearchInput,
  listingSubtitle,
  listingTableCard,
  listingTableFooter,
  listingTableThSm,
  listingTitle,
  listingToolbar,
  listingToolbarInner,
} from '@/lib/listingPageStyles';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'inactive';

function TenantActions({
  tenant,
  onView,
  onEdit,
  onDelete,
  canDelete,
}: {
  tenant: Tenant;
  onView: (tenant: Tenant) => void;
  onEdit: (tenant: Tenant) => void;
  onDelete: (tenant: Tenant) => void;
  canDelete: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Tenant actions"
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
          onClick={() => onView(tenant)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(tenant)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-blue-600 focus:bg-blue-50 focus:text-blue-700"
        >
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        {canDelete ? (
          <DropdownMenuItem
            onClick={() => onDelete(tenant)}
            className="rounded-lg py-2.5 text-xs font-black uppercase text-red-600 focus:bg-red-50 focus:text-red-700"
          >
            <Trash2 size={14} />
            Delete
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function TenantManagementPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewTenantId, setViewTenantId] = useState<number | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<Tenant | null>(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    setRole(localStorage.getItem('role') || '');
  }, []);

  const canDelete = role !== 'ADMIN';
  const deleteMutation = useDeleteTenant();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useTenantsList({ page: pageNo, size: PAGE_SIZE });

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

  const filteredRows = useMemo(() => {
    let list = rows;

    if (statusFilter === 'active') {
      list = list.filter((row) => isTenantActive(row));
    } else if (statusFilter === 'inactive') {
      list = list.filter((row) => !isTenantActive(row));
    }

    const term = debouncedSearch.toLowerCase();
    if (!term) return list;

    return list.filter((row) => {
      const haystack = [
        getTenantName(row),
        getTenantCompanyName(row),
        getTenantAdminEmail(row),
        getTenantAdminPhone(row),
        getTenantSubscriptionPlan(row),
        row.domainName,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [rows, debouncedSearch, statusFilter]);

  const totalPages = page?.totalPages ?? 0;
  const totalElements = page?.totalElements ?? 0;
  const pageSize = page?.pageSize ?? PAGE_SIZE;
  const canPrev = pageNo > 0;
  const canNext = page ? !page.last : false;

  const showInitialLoader = isLoading && rows.length === 0;

  const handleRefresh = () => {
    void refetch();
  };

  const handleView = (tenant: Tenant) => {
    if (tenant.id != null && tenant.id > 0) {
      setViewTenantId(tenant.id);
    }
  };

  const handleEdit = (_tenant: Tenant) => {
    // Placeholder for future edit modal
  };

  const handleDelete = (tenant: Tenant) => {
    setDeleteTenant(tenant);
  };

  const handleConfirmDelete = () => {
    if (!deleteTenant?.id) return;

    deleteMutation.mutate(deleteTenant.id, {
      onSuccess: (res: TenantApiResponse) => {
        if (!isTenantMutationSuccess(res)) {
          toast.error(res.message || 'Failed to delete tenant.');
          return;
        }
        toast.success(res.message?.trim() || 'Tenant deleted successfully.');
        if (viewTenantId === deleteTenant.id) {
          setViewTenantId(null);
        }
        setDeleteTenant(null);
        void refetch();
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to delete tenant.');
      },
    });
  };

  return (
    <>
      <NewTenant
        isOpen={addModalOpen}
        onSuccess={handleRefresh}
        onClose={() => setAddModalOpen(false)}
      />

      <TenantDetailsDrawer
        isOpen={viewTenantId !== null}
        tenantId={viewTenantId}
        onClose={() => setViewTenantId(null)}
        onEdit={() => setViewTenantId(null)}
      />

      <DeleteAlertDialog
        isOpen={Boolean(deleteTenant)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTenant(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete tenant"
        description={`Are you sure you want to delete "${deleteTenant ? getTenantName(deleteTenant) : 'this tenant'}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className={listingTitle}>
              Tenant <span className="text-emerald-600">Management</span>
            </h1>
            <p className={`${listingSubtitle} max-w-xl`}>
              View and manage tenant accounts, subscriptions, and organization access.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="gap-2 shadow-sm px-8 font-bold"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus size={16} aria-hidden />
              New tenant
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
            placeholder="Search tenants by name, company, email, or phone…"
            className={listingSearchInput}
            aria-label="Search tenants"
            autoComplete="off"
            spellCheck={false}
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
              onChange={(e) => {
                setStatusFilter(e.target.value as StatusFilter);
                setPageNo(0);
              }}
              className={listingFilterSelect}
              aria-label="Filter by status"
              disabled={isLoading}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
            disabled={isFetching}
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
            {error instanceof Error ? error.message : 'Failed to load tenants.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      ) : null}

      {showInitialLoader ? (
        <div className={listingLoadingBox}>
          <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
          <p className={listingLoadingText}>Loading tenants…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className={listingEmptyBox}>
          <p className={listingEmptyTitle}>No tenants found.</p>
        </div>
      ) : (
        <div className={listingTableCard}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className={listingTableThSm}>
                    Tenant Name
                  </th>
                  <th className={listingTableThSm}>
                    Company Name
                  </th>
                  <th className={listingTableThSm}>
                    Admin Email
                  </th>
                  <th className={listingTableThSm}>
                    Admin Phone
                  </th>
                  <th className={listingTableThSm}>
                    Subscription Plan
                  </th>
                  <th className={`${listingTableThSm} text-center`}>
                    Total Branches
                  </th>
                  <th className={`${listingTableThSm} text-center`}>
                    Total Users
                  </th>
                  <th className={`${listingTableThSm} text-center`}>
                    Status
                  </th>
                  <th className={`${listingTableThSm} text-center`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-slate-400 font-medium">
                      No matches on this page for your search or filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row, index) => {
                    const active = isTenantActive(row);
                    return (
                      <tr
                        key={getTenantRowKey(row, index)}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-4 sm:px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                              <Building2 size={18} aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <div className={listingRowTitle}>
                                {getTenantName(row)}
                              </div>
                              {row.domainName?.trim() ? (
                                <div className="text-xs text-slate-500 truncate max-w-55 mt-0.5">
                                  {row.domainName.trim()}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-sm font-semibold text-slate-700">
                          {getTenantCompanyName(row)}
                        </td>
                        <td className="px-4 sm:px-6 py-5">
                          <div className={`flex items-center gap-1.5 min-w-0 ${listingRowValue}`}>
                            <Mail size={12} className="text-emerald-500 shrink-0" aria-hidden />
                            <span className="truncate max-w-45">{getTenantAdminEmail(row)}</span>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-5">
                          <div className={`flex items-center gap-1.5 ${listingRowPhone}`}>
                            <Phone size={12} className="text-emerald-500 shrink-0" aria-hidden />
                            {getTenantAdminPhone(row)}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-5">
                          <Badge variant="secondary" className={`${listingBadge} uppercase tracking-wide`}>
                            {getTenantSubscriptionPlan(row)}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-center text-sm font-semibold text-slate-700">
                            {row.maxBranches ?? 0} 
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-center text-sm font-semibold text-slate-700">
                          {row.maxUsersPerBranch ?? 0}
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-center">
                          <Badge
                            variant={active ? 'default' : 'secondary'}
                            className={
                              active
                                ? `bg-emerald-600 hover:bg-emerald-600 text-white ${listingBadge}`
                                : listingBadge
                            }
                          >
                            {getTenantStatusLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-6 py-5 text-center">
                          <TenantActions
                            tenant={row}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            canDelete={canDelete}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
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
                <span className="text-slate-400 mx-2 hidden sm:inline">·</span>
                <span className="hidden sm:inline">{pageSize} per page</span>
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
      </div>
    </>
  );
}
