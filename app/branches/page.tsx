'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import {
  Search,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Building2,
  Plus,
  CreditCard,
  ListOrdered,
  Loader,
  RefreshCw,
  Database,
  AlertCircle,
  Eye,
  Pencil,
  MoreHorizontal,
  Users,
  UserCheck,
  UserX,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AddFranchiseModal from './AddFranchiseModal';
import BranchDetailsDrawer from './details-B2b';
import PriceConfiguration from './Price-configuration';
import PriceListPage from './PriceListPage';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';

const PAGE_SIZE = 10;

type StatusFilter = 'all' | 'active' | 'inactive';

const STATUS_TABS: {
  value: StatusFilter;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: 'all', label: 'All', icon: <Users size={14} /> },
  { value: 'active', label: 'Active', icon: <UserCheck size={14} /> },
  { value: 'inactive', label: 'Inactive', icon: <UserX size={14} /> },
];

function isBranchActive(branch: Branch): boolean {
  if (typeof branch.isActive === 'boolean') {
    return branch.isActive;
  }
  return branch.status?.trim().toUpperCase() === 'ACTIVE';
}

function branchStatusLabel(branch: Branch): string {
  return isBranchActive(branch) ? 'ACTIVE' : 'INACTIVE';
}

function formatBranchType(branchType: string): string {
  return branchType.toLowerCase().replace(/_/g, ' ');
}

function BranchActions({
  branch,
  onView,
  onEdit,
  onDelete,
  onConfigurePrices,
  onPriceListing,
}: {
  branch: Branch;
  onView: (branch: Branch) => void;
  onEdit: (branch: Branch) => void;
  onDelete: (branch: Branch) => void;
  onConfigurePrices: (branch: Branch) => void;
  onPriceListing: (branch: Branch) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Branch actions"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={20} />
          </button>
        }
      />
      <DropdownMenuContent
        align="end"
        className="min-w-48 p-1.5 rounded-2xl border border-slate-200 shadow-xl bg-white"
      >
        <DropdownMenuItem
          onClick={() => onView(branch)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 text-slate-500 shrink-0">
            <Eye size={13} />
          </span>
          View details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(branch)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-emerald-50 focus:text-emerald-700 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-500 shrink-0">
            <Pencil size={13} />
          </span>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onConfigurePrices(branch)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-green-50 focus:text-green-700 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-green-50 text-green-600 shrink-0">
            <CreditCard size={13} />
          </span>
          Configure prices
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onPriceListing(branch)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-slate-700 hover:text-slate-900 focus:bg-blue-50 focus:text-blue-700 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 text-blue-600 shrink-0">
            <ListOrdered size={13} />
          </span>
          Price listing
        </DropdownMenuItem>
        <div className="h-px bg-slate-100 mx-1 my-1" />
        <DropdownMenuItem
          onClick={() => onDelete(branch)}
          className="rounded-xl px-3 py-2.5 gap-3 text-xs font-semibold text-red-600 hover:text-red-700 focus:bg-red-50 focus:text-red-700 cursor-pointer"
        >
          <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-500 shrink-0">
            <Trash2 size={13} />
          </span>
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function BranchesPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingBranchId, setDeletingBranchId] = useState<number | null>(null);
  const [editingBranch, setEditingBranch] = useState<{
    id: string;
    branchName: string;
    branchType: string;
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    contactEmail: string;
    contactPhone: string;
    isActive?: boolean;
    status?: string;
  } | null>(null);
  const [branchRows, setBranchRows] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [priceConfigBranch, setPriceConfigBranch] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [priceListBranch, setPriceListBranch] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const loadBranches = useCallback(async () => {
    setIsFetching(true);
    setLoadError(null);

    try {
      const response = await branchApi.listBranchesAll({
        page: currentPage,
        size: PAGE_SIZE,
      });

      setBranchRows(response.data.content ?? []);
      setTotalPages(response.data.totalPages);
      setTotalElements(response.data.totalElements);
    } catch (error) {
      console.error('Failed to load branches:', error);
      setBranchRows([]);
      setLoadError('Failed to load branches. Please try again.');
      toast.error('Failed to load branches. Please try again.');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [currentPage]);

  useEffect(() => {
    if (branchRows.length === 0) {
      setLoading(true);
    }
    void loadBranches();
  }, [loadBranches]);

  const branches = useMemo(() => {
    const term = search.trim().toLowerCase();

    return branchRows.filter((branch) => {
      const active = isBranchActive(branch);
      if (statusFilter === 'active' && !active) return false;
      if (statusFilter === 'inactive' && active) return false;

      if (!term) return true;

      const haystack = [
        branch.branchName,
        branch.branchCode,
        branch.city,
        branch.state,
        branch.contactEmail,
        branch.contactPhone,
        branch.address,
        branch.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(term);
    });
  }, [branchRows, search, statusFilter]);

  const handleViewDetails = (branchId: number) => {
    setSelectedBranchId(branchId);
    setShowDetailsDrawer(true);
  };

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch({
      id: branch.id.toString(),
      branchName: branch.branchName,
      branchType: branch.branchType,
      address: branch.address || '',
      city: branch.city || '',
      state: branch.state || '',
      country: branch.country || '',
      postalCode: branch.postalCode || '',
      contactEmail: branch.contactEmail || '',
      contactPhone: branch.contactPhone || '',
      isActive: branch.isActive,
      status: branch.status || '',
    });
    setShowAddModal(true);
  };

  const handleDeleteBranch = async () => {
    if (!deletingBranchId) return;

    try {
      await branchApi.deleteBranch(deletingBranchId);
      toast.success('Branch deleted successfully!');
      loadBranches();
      setShowDeleteDialog(false);
      setDeletingBranchId(null);
    } catch (error: any) {
      console.error('Failed to delete branch:', error);
      const errorMessage =
        error?.response?.data?.message ||
        'Failed to delete branch. Please try again.';
      toast.error(errorMessage);
    }
  };

  const openDeleteDialog = (branch: Branch) => {
    setDeletingBranchId(branch.id);
    setShowDeleteDialog(true);
  };

  const canPrev = currentPage > 0;
  const canNext = currentPage + 1 < totalPages;

  return (
    <>
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Branches <span className="text-emerald-600">& B2B</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              Manage diagnostic centers, collection points, and institutional partnerships.
            </p>
          </div>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-8 font-bold"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} aria-hidden />
            Add new branch
          </Button>
        </div>

        {/* Search + filter bar */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
            <div className="relative flex-1 group">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors pointer-events-none"
                size={16}
                aria-hidden
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by branch name, location, or email…"
                className="w-full h-10 pl-10 pr-9 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400 focus:bg-white transition-all"
                aria-label="Search branches"
                disabled={loading}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors text-xs font-bold"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => void loadBranches()}
              disabled={loading || isFetching}
              title="Refresh"
              className="h-10 w-10 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all disabled:opacity-40 shrink-0"
            >
              <RefreshCw
                size={15}
                className={isFetching ? 'animate-spin' : ''}
                aria-hidden
              />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 bg-slate-50/60">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">
              Filter
            </span>
            {STATUS_TABS.map(({ value, label, icon }) => {
              const isActive = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all ${
                    isActive
                      ? value === 'all'
                        ? 'bg-slate-800 text-white shadow-sm'
                        : value === 'active'
                          ? 'bg-emerald-500 text-white shadow-sm'
                          : 'bg-slate-500 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-slate-200/70 hover:text-slate-700'
                  }`}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error banner */}
        {loadError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
            <AlertCircle size={18} className="shrink-0" aria-hidden />
            <span className="font-medium">{loadError}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto font-bold"
              onClick={() => void loadBranches()}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Table */}
        {loading && branchRows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
            <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
            <p className="text-slate-600 font-medium">Loading branches…</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center space-y-2">
            <Building2 size={48} className="mx-auto text-slate-300 mb-2" aria-hidden />
            <p className="text-slate-600 font-semibold">
              {search || statusFilter !== 'all'
                ? 'No branches match your search or filter.'
                : 'No branches found.'}
            </p>
            <p className="text-slate-400 text-sm">
              {search || statusFilter !== 'all'
                ? 'Try adjusting the search or filter above.'
                : 'Create your first branch to get started.'}
            </p>
            {!search && statusFilter === 'all' && (
              <Button
                type="button"
                variant="gradient"
                size="sm"
                className="mt-4 gap-2 font-bold"
                onClick={() => setShowAddModal(true)}
              >
                <Plus size={16} />
                Add new branch
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Branch name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Location
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Type
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Contact
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
                  {branches.map((branch) => {
                    const active = isBranchActive(branch);
                    return (
                      <tr
                        key={branch.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all shrink-0">
                              <Building2 size={18} aria-hidden />
                            </div>
                            <div className="min-w-0 flex flex-col justify-center min-h-10">
                              <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-600 transition-colors">
                                {branch.branchName}
                              </div>
                              {branch.branchCode && (
                                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                                  {branch.branchCode}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            {branch.address && (
                              <div className="flex items-start gap-1.5 text-xs font-medium text-slate-600">
                                <MapPin size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{branch.address}</span>
                              </div>
                            )}
                            {(branch.city || branch.state) && (
                              <div className="text-xs text-slate-500 font-semibold pl-4">
                                {[branch.city, branch.state].filter(Boolean).join(', ')}
                              </div>
                            )}
                            {!branch.address && !branch.city && !branch.state && (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge variant="outline" className="text-[10px] font-bold capitalize">
                            {formatBranchType(branch.branchType)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                              <Phone size={11} className="text-emerald-400 shrink-0" />
                              {branch.contactPhone?.trim() || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={11} className="text-emerald-400 shrink-0" />
                              <span className="truncate max-w-44">
                                {branch.contactEmail?.trim() || '—'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <Badge
                            variant={active ? 'default' : 'secondary'}
                            className={
                              active
                                ? 'bg-emerald-500 hover:bg-emerald-500 text-white text-[10px] font-bold'
                                : 'text-[10px] font-bold'
                            }
                          >
                            <span
                              className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                                active ? 'bg-white/90' : 'bg-slate-400'
                              }`}
                            />
                            {branchStatusLabel(branch)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <BranchActions
                            branch={branch}
                            onView={(b) => handleViewDetails(b.id)}
                            onEdit={handleEditBranch}
                            onDelete={openDeleteDialog}
                            onConfigurePrices={(b) =>
                              setPriceConfigBranch({ id: b.id, name: b.branchName })
                            }
                            onPriceListing={(b) =>
                              setPriceListBranch({ id: b.id, name: b.branchName })
                            }
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Database size={14} className="text-emerald-500 shrink-0" aria-hidden />
                <span>
                  Page {currentPage + 1} of {Math.max(totalPages, 1)} · {totalElements} total
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-bold border-slate-200"
                  disabled={!canPrev || isFetching}
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-bold border-slate-200"
                  disabled={!canNext || isFetching}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <AddFranchiseModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingBranch(null);
          void loadBranches();
        }}
        initialData={editingBranch || undefined}
      />
      <BranchDetailsDrawer
        isOpen={showDetailsDrawer}
        onClose={() => setShowDetailsDrawer(false)}
        branchId={selectedBranchId}
        onEdit={(branch) => {
          setEditingBranch(branch);
          setShowDetailsDrawer(false);
          setShowAddModal(true);
        }}
      />
      <DeleteAlertDialog
        isOpen={showDeleteDialog}
        onClose={() => {
          setShowDeleteDialog(false);
          setDeletingBranchId(null);
        }}
        onConfirm={handleDeleteBranch}
        title="Delete Branch"
        description="Are you sure you want to permanently delete this branch? This action cannot be undone and all associated data will be lost."
      />
      {priceConfigBranch && (
        <PriceConfiguration
          isOpen
          onClose={() => setPriceConfigBranch(null)}
          branchId={priceConfigBranch.id}
          branchName={priceConfigBranch.name}
        />
      )}
      {priceListBranch && (
        <PriceListPage
          isOpen
          onClose={() => setPriceListBranch(null)}
          branchId={priceListBranch.id}
          branchName={priceListBranch.name}
        />
      )}
    </>
  );
}
