'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  Database,
  Eye,
  Filter,
  Loader,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  getCollectorName,
  getCollectorPhone,
  getCollectorStatusLabel,
  getCollectorVerifiedLabel,
  isBloodCollectorMutationSuccess,
  isCollectorActive,
  type BloodCollector,
  type BloodCollectorMutationApiResponse,
  type BloodCollectorStatusFilter,
} from '@/app/Apis/collector/CollectorsApi';
import {
  useActivateBloodCollector,
  useBloodCollectorsList,
  useBloodCollectorByUsername,
  useDeleteBloodCollector,
} from '@/app/Apis/collector/useCollectors';
import AddCollectorModal from '../components/AddCollectorModal';
import EditCollector from '../components/EditCollector';
import CollectorDetails from '../components/CollectorDetails';

const PAGE_SIZE = 10;

type SearchBy = 'Name' | 'Username' | 'Phone' | 'Email';

function CollectorActions({
  collector,
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
}: {
  collector: BloodCollector;
  onView: (collector: BloodCollector) => void;
  onEdit: (collector: BloodCollector) => void;
  onToggleStatus: (collector: BloodCollector) => void;
  onDelete: (collector: BloodCollector) => void;
}) {
  const active = isCollectorActive(collector);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Collector actions"
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
          onClick={() => onView(collector)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
         <DropdownMenuItem
          onClick={() => onEdit(collector)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-blue-600 focus:bg-blue-50 focus:text-blue-700"
        >
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        {/* <DropdownMenuItem
          onClick={() => onToggleStatus(collector)}
          className={`rounded-lg py-2.5 text-xs font-black uppercase ${
            active
              ? 'text-rose-600 focus:bg-rose-50 focus:text-rose-700'
              : 'text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700'
          }`}
        >
          <Plus size={14} className={active ? 'rotate-45' : 'rotate-0'} />
          {active ? 'Deactivate' : 'Activate'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(collector)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-rose-600 focus:bg-rose-50 focus:text-rose-700"
        >
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem> */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function CollectorListPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchBy, setSearchBy] = useState<SearchBy>('Name');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editCollector, setEditCollector] = useState<BloodCollector | null>(null);
  const [viewCollector, setViewCollector] = useState<BloodCollector | null>(null);
  const [deleteCollector, setDeleteCollector] = useState<BloodCollector | null>(null);
  const [statusCollector, setStatusCollector] = useState<BloodCollector | null>(null);
  const [statusFilter, setStatusFilter] = useState<BloodCollectorStatusFilter>('all');
  const activateMutation = useActivateBloodCollector();
  const deleteMutation = useDeleteBloodCollector();

  const isUsernameApiSearch =
    searchBy === 'Username' && debouncedSearch.length > 0;

  const {
    data,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
    isFetching: isListFetching,
  } = useBloodCollectorsList(
    { page: pageNo, size: PAGE_SIZE, statusFilter },
    { enabled: !isUsernameApiSearch }
  );

  const {
    data: collectorByUsernameResponse,
    isLoading: isUsernameLoading,
    isError: isUsernameNotFound,
    refetch: refetchByUsername,
    isFetching: isUsernameFetching,
  } = useBloodCollectorByUsername(debouncedSearch, {
    enabled: isUsernameApiSearch,
  });

  const isLoading = isUsernameApiSearch ? isUsernameLoading : isListLoading;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setPageNo(0);
  }, [debouncedSearch, searchBy, statusFilter]);

  const page = data?.data;

  const rows = useMemo(() => {
    if (isUsernameApiSearch) {
      if (isUsernameNotFound) return [];
      const collector = collectorByUsernameResponse?.data;
      return collector ? [collector] : [];
    }

    let list = page?.content ?? [];

    if (statusFilter === 'inactive') {
      list = list.filter((row) => row.isActive === false);
    }

    return list;
  }, [
    isUsernameApiSearch,
    isUsernameNotFound,
    collectorByUsernameResponse?.data,
    page?.content,
    statusFilter,
  ]);

  const filteredRows = useMemo(() => {
    if (isUsernameApiSearch) return rows;

    const term = searchText.trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((row) => {
      if (searchBy === 'Username') {
        return (row.username ?? '').toLowerCase().includes(term);
      }
      if (searchBy === 'Phone') {
        const phone = getCollectorPhone(row).replace(/\D/g, '');
        const digits = term.replace(/\D/g, '');
        return phone.includes(digits) || getCollectorPhone(row).toLowerCase().includes(term);
      }
      if (searchBy === 'Email') {
        return (row.email ?? '').toLowerCase().includes(term);
      }
      return getCollectorName(row).toLowerCase().includes(term);
    });
  }, [rows, searchText, searchBy, isUsernameApiSearch]);

  const isSearchingByUsername =
    isUsernameApiSearch && (isUsernameLoading || isUsernameFetching);
  const showInitialLoader =
    isListLoading && !isUsernameApiSearch && searchText.trim() === '' && rows.length === 0;
  const isFetching = isUsernameApiSearch ? isUsernameFetching : isListFetching;
  const isError = isListError;
  const error = listError;

  const totalPages = isUsernameApiSearch ? 1 : page?.totalPages ?? 0;
  const totalElements = isUsernameApiSearch
    ? filteredRows.length
    : page?.totalElements ?? 0;
  const canPrev = !isUsernameApiSearch && pageNo > 0;
  const canNext = !isUsernameApiSearch && page ? !page.last : false;

  const handleRefresh = () => {
    if (isUsernameApiSearch) {
      void refetchByUsername();
    } else {
      void refetchList();
    }
  };

  const handleFormSuccess = () => {
    if (isUsernameApiSearch) {
      void refetchByUsername();
    } else {
      void refetchList();
    }
  };

  const formatCreatedAt = (value?: string) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleView = (collector: BloodCollector) => {
    setViewCollector(collector);
  };

  const handleEdit = (collector: BloodCollector) => {
    setEditCollector(collector);
  };

  const handleDelete = (collector: BloodCollector) => {
    setDeleteCollector(collector);
  };

  const handleConfirmDelete = () => {
    if (!deleteCollector) return;

    deleteMutation.mutate(deleteCollector, {
      onSuccess: (res: BloodCollectorMutationApiResponse) => {
        if (!isBloodCollectorMutationSuccess(res)) {
          toast.error(res.message || 'Failed to delete blood collector.');
          return;
        }
        toast.success(res?.message?.trim() || 'Blood collector deleted successfully.');
        setDeleteCollector(null);
        handleFormSuccess();
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to delete blood collector.');
      },
    });
  };

  const handleToggleStatus = (collector: BloodCollector) => {
    setStatusCollector(collector);
  };

  const handleConfirmToggleStatus = () => {
    if (!statusCollector) return;

    const nextIsActive = !isCollectorActive(statusCollector);

    activateMutation.mutate(
      { id: statusCollector.id, isActive: nextIsActive },
      {
        onSuccess: (res) => {
          if (!isBloodCollectorMutationSuccess(res)) {
            toast.error(res.message || 'Failed to update status.');
            return;
          }
          toast.success(
            res.message?.trim() ||
              `Blood collector ${nextIsActive ? 'activated' : 'deactivated'} successfully.`
          );
          setStatusCollector(null);
          handleFormSuccess();
        },
        onError: (err: Error) => {
          toast.error(err.message || 'Failed to update status.');
        },
      }
    );
  };

  return (
    <>
      <AddCollectorModal
        isOpen={addModalOpen}
        onSuccess={handleFormSuccess}
        onClose={() => setAddModalOpen(false)}
      />

      <EditCollector
        isOpen={editCollector !== null}
        collector={editCollector}
        onSuccess={handleFormSuccess}
        onClose={() => setEditCollector(null)}
      />

      <CollectorDetails
        isOpen={Boolean(viewCollector)}
        collector={viewCollector}
        onClose={() => setViewCollector(null)}
        onEdit={(collector) => {
          setViewCollector(null);
          handleEdit(collector);
        }}
      />

      <ConfirmAlertDialog
        isOpen={Boolean(statusCollector)}
        onClose={() => {
          if (!activateMutation.isPending) setStatusCollector(null);
        }}
        onConfirm={handleConfirmToggleStatus}
        title={
          statusCollector && isCollectorActive(statusCollector)
            ? 'Deactivate Blood Collector'
            : 'Activate Blood Collector'
        }
        description={`Are you sure you want to ${
          statusCollector && isCollectorActive(statusCollector) ? 'deactivate' : 'activate'
        } "${statusCollector ? getCollectorName(statusCollector) : 'this blood collector'}"?`}
        confirmText={
          statusCollector && isCollectorActive(statusCollector)
            ? 'Deactivate Now'
            : 'Activate Now'
        }
        isLoading={activateMutation.isPending}
        variant={
          statusCollector && isCollectorActive(statusCollector) ? 'destructive' : 'success'
        }
      />

      <DeleteAlertDialog
        isOpen={Boolean(deleteCollector)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteCollector(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete blood collector"
        description={`Are you sure you want to delete ${deleteCollector ? getCollectorName(deleteCollector) : 'this collector'}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />

      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
              Blood Collector <span className="text-emerald-600">Management</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium max-w-xl">
              View and manage blood collector accounts and collection assignments.
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
              <UserPlus size={16} aria-hidden />
              New collector
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
              placeholder={ 'Search by username (exact match)…'
                
              }
              className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
              aria-label="Search collectors"
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
                setStatusFilter(e.target.value as BloodCollectorStatusFilter);
                setPageNo(0);
              }}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Filter by status"
              disabled={isLoading || isUsernameApiSearch}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
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
              onClick={handleRefresh}
              disabled={isFetching}
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
              {error instanceof Error ? error.message : 'Failed to load blood collectors.'}
            </span>
            <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        ) : null}

        {showInitialLoader ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
            <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
            <p className="text-slate-600 font-medium">Loading blood collectors…</p>
          </div>
        ) : !isUsernameApiSearch && rows.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-600 font-medium">
            No blood collectors found.
          </div>
        ) : (
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Collector name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Username
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Phone
                    </th>
                    
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Role
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Verified
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Branch
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Created
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-12 text-slate-400 font-medium">
                        {isSearchingByUsername ? (
                          <span className="inline-flex items-center justify-center gap-2">
                            <Loader className="animate-spin text-emerald-600" size={18} aria-hidden />
                            Searching by username…
                          </span>
                        ) : isUsernameApiSearch ? (
                          `No collector found with username "${debouncedSearch}".`
                        ) : (
                          'No matches on this page for your search.'
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row: BloodCollector) => {
                      const active = isCollectorActive(row);
                      const verified = row.isVerified === true;
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
                                  {getCollectorName(row)}
                                </div>
                                {row.collectionCenter?.trim() ? (
                                  <div className="text-xs text-slate-500 truncate max-w-55 mt-0.5">
                                    {row.collectionCenter.trim()}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 text-sm font-semibold text-slate-700 font-mono">
                            {row.username?.trim() || '—'}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                              <Phone size={12} className="text-emerald-500 shrink-0" aria-hidden />
                              {getCollectorPhone(row)}
                            </div>
                          </td>
                        
                          <td className="px-6 py-5">
                            <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide">
                              {row.role?.trim() || '—'}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-center">
                            <Badge
                              variant={verified ? 'default' : 'secondary'}
                              className={
                                verified
                                  ? 'bg-sky-600 hover:bg-sky-600 text-white text-[10px] font-bold'
                                  : 'text-[10px] font-bold'
                              }
                            >
                              {getCollectorVerifiedLabel(row)}
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
                              {getCollectorStatusLabel(row)}
                            </Badge>
                          </td>
                          <td className="px-6 py-5 text-center text-sm font-semibold text-slate-700">
                            {row?.branchName?.trim() || '—'}
                          </td>
                          <td className="px-6 py-5 text-center text-xs font-medium text-slate-500">
                            {formatCreatedAt(row.createdAt)}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <CollectorActions
                              collector={row}
                              onView={handleView}
                              onEdit={handleEdit}
                              onToggleStatus={handleToggleStatus}
                              onDelete={handleDelete}
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
    </>
  );
}
