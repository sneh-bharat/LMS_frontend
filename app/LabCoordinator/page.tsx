'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ChevronDown,
  Database,
  Eye,
  Plus,
  Filter,
  FlaskConical,
  Loader,
  MoreHorizontal,
  RefreshCw,
  Search,
  Pencil,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  getLabCoordinatorDepartment,
  getLabCoordinatorName,
  getLabCoordinatorStatusLabel,
  getLabCoordinatorVerifiedLabel,
  isLabCoordinatorActive,
  isLabCoordinatorMutationSuccess,
  type LabCoordinator,
  type LabCoordinatorMutationApiResponse,
  type LabCoordinatorStatusFilter,
} from '@/app/Apis/LabCoordinator/LabCoordinatorApi';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import { ConfirmAlertDialog } from '@/components/ui/confirm-alert-dialog';
import {
  useActivateLabCoordinator,
  useDeleteLabCoordinator,
  useLabCoordinatorByUsername,
  useLabCoordinatorsList,
} from '@/app/Apis/LabCoordinator/useLabCoordinators';
import AddCoordinator from './AddCoordinator';
import EditCoordinator from './EditCoordinator';
import LabCoordinatorDetailsView from './detailsCoordinator';




const PAGE_SIZE = 10;

function LabCoordinatorActions({
  coordinator,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  coordinator: LabCoordinator;
  onView: (coordinatorId: number) => void;
  onEdit: (coordinatorId: number) => void;
  onDelete: (coordinator: LabCoordinator) => void;
  onToggleStatus: (coordinator: LabCoordinator) => void;
}) {
  const active = isLabCoordinatorActive(coordinator);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
            aria-label="Lab coordinator actions"
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
          onClick={() => onView(coordinator.id)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700"
        >
          <Eye size={14} />
          View
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onEdit(coordinator.id)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-sky-600 focus:bg-sky-50 focus:text-sky-700"
        >
          <Pencil size={14} />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleStatus(coordinator)}
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
          onClick={() => onDelete(coordinator)}
          className="rounded-lg py-2.5 text-xs font-black uppercase text-rose-600 focus:bg-rose-50 focus:text-rose-700"
        >
          <Trash2 size={14} />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function LabCoordinatorListPage() {
  const [pageNo, setPageNo] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LabCoordinatorStatusFilter>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [viewCoordinatorId, setViewCoordinatorId] = useState<number | null>(null);
  const [deleteCoordinator, setDeleteCoordinator] = useState<LabCoordinator | null>(null);
  const [editCoordinatorId, setEditCoordinatorId] = useState<number | null>(null);
  const [statusCoordinator, setStatusCoordinator] = useState<LabCoordinator | null>(null);
  const activateMutation = useActivateLabCoordinator();

  const deleteMutation = useDeleteLabCoordinator();

  const isUsernameApiSearch = debouncedSearch.length > 0;

  const {
    data,
    isLoading: isListLoading,
    isError: isListError,
    error: listError,
    refetch: refetchList,
    isFetching: isListFetching,
  } = useLabCoordinatorsList(
    { pageNo, pageSize: PAGE_SIZE, statusFilter },
    { enabled: !isUsernameApiSearch }
  );

  const {
    data: coordinatorByUsernameResponse,
    isLoading: isUsernameLoading,
    isError: isUsernameNotFound,
    refetch: refetchByUsername,
    isFetching: isUsernameFetching,
  } = useLabCoordinatorByUsername(debouncedSearch, {
    enabled: isUsernameApiSearch,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
      setPageNo(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  const page = data?.data;

  const rows = useMemo(() => {
    if (isUsernameApiSearch) {
      if (isUsernameNotFound) return [];
      const coordinator = coordinatorByUsernameResponse?.data;
      return coordinator ? [coordinator] : [];
    }

    let list = page?.content ?? [];

    if (statusFilter === 'inactive') {
      list = list.filter((row) => row.isActive === false);
    }

    return list;
  }, [
    isUsernameApiSearch,
    isUsernameNotFound,
    coordinatorByUsernameResponse?.data,
    page?.content,
    statusFilter,
  ]);

  const filteredRows = rows;

  const isLoading = isUsernameApiSearch ? isUsernameLoading : isListLoading;
  const isFetching = isUsernameApiSearch ? isUsernameFetching : isListFetching;
  const isError = isListError;
  const error = listError;

  const totalPages = isUsernameApiSearch ? 1 : page?.totalPages ?? 0;
  const totalElements = isUsernameApiSearch ? filteredRows.length : page?.totalElements ?? 0;
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

  const handleDelete = (coordinator: LabCoordinator) => {
    setDeleteCoordinator(coordinator);
  };

  const handleConfirmDelete = () => {
    if (!deleteCoordinator) return;

    deleteMutation.mutate(deleteCoordinator.id, {
      onSuccess: (res: LabCoordinatorMutationApiResponse) => {
        if (!isLabCoordinatorMutationSuccess(res)) {
          toast.error(res.message || 'Failed to delete lab coordinator.');
          return;
        }
        toast.success(res?.message?.trim() || 'Lab coordinator deleted successfully.');
        setDeleteCoordinator(null);
        handleFormSuccess();
      },
      onError: (err: Error) => {
        toast.error(err.message || 'Failed to delete lab coordinator.');
      },
    });
  };
  const handleToggleStatus = (coordinator: LabCoordinator) => {
    setStatusCoordinator(coordinator);
  };
  const handleConfirmToggleStatus = () => {
    if (!statusCoordinator) return;

    const nextIsActive = !isLabCoordinatorActive(statusCoordinator);

    activateMutation.mutate(
      { id: statusCoordinator.id, isActive: nextIsActive },
      {
        onSuccess: (res) => {
          if (!isLabCoordinatorMutationSuccess(res)) {
            toast.error(res.message || 'Failed to update status.');
            return;
          }
          toast.success(
            res.message?.trim() ||
              `Lab coordinator ${nextIsActive ? 'activated' : 'deactivated'} successfully.`
          );
          setStatusCoordinator(null);
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
      <AddCoordinator
        isOpen={addModalOpen}
        onSuccess={handleFormSuccess}
        onClose={() => setAddModalOpen(false)}
      />

    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Lab <span className="text-emerald-600">Coordinators</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            View and manage lab coordinator accounts and department assignments.
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
            New coordinator
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
            placeholder="Search lab coordinator Username"
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            aria-label="Search lab coordinators"
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
              onChange={(e) => {
                setStatusFilter(e.target.value as LabCoordinatorStatusFilter);
                setPageNo(0);
              }}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Filter by status"
              disabled={isLoading}
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
          {/* <div className="relative flex-1 sm:min-w-35 group">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              size={14}
            />
            <select
              value={searchBy}
              onChange={(e) => setSearchBy(e.target.value as SearchBy)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
              aria-label="Search by"
              disabled={isLoading}
            >
              <option value="Name">Search by name</option>
              <option value="Username">Search by username</option>
              <option value="Department">Search by department</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div> */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200 shrink-0"
            onClick={handleRefresh}
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
            {error instanceof Error ? error.message : 'Failed to load lab coordinators.'}
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

      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
          <p className="text-slate-600 font-medium">Loading lab coordinators…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-600 font-medium">
          {isUsernameApiSearch
            ? `No lab coordinator found with username "${debouncedSearch}".`
            : 'No lab coordinators found.'}
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Username
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Department
                  </th>
                 
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Branch
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Verified
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 font-medium">
                      {isUsernameApiSearch
                        ? `No lab coordinator found with username "${debouncedSearch}".`
                        : 'No lab coordinators match the current filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const active = isLabCoordinatorActive(row);
                    const verified = row.isVerified === true;

                    return (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                              <FlaskConical size={18} aria-hidden />
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
                                {getLabCoordinatorName(row)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-slate-700 font-mono">
                          {row.username?.trim() || '—'}
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                          {getLabCoordinatorDepartment(row)}
                        </td>
                        <td className="px-6 py-5 text-sm font-semibold">
                          {row.branchName?.trim() || '—'}
                        </td>
                        <td className="px-6 py-5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-bold uppercase tracking-wide"
                          >
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
                            {getLabCoordinatorStatusLabel(row)}
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
                            {getLabCoordinatorVerifiedLabel(row)}
                          </Badge>
                        </td>
                        <td className="px-6 py-5 text-center">
                        <LabCoordinatorActions
                            coordinator={row}
                            onView={setViewCoordinatorId}
                            onEdit={setEditCoordinatorId}
                            onDelete={handleDelete}
                            onToggleStatus={handleToggleStatus}
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

        <EditCoordinator
        isOpen={editCoordinatorId !== null}
        coordinatorId={editCoordinatorId}
        onSuccess={handleFormSuccess}
        onClose={() => setEditCoordinatorId(null)}
      />


      <LabCoordinatorDetailsView
        isOpen={viewCoordinatorId != null}
        onClose={() => setViewCoordinatorId(null)}
        coordinatorId={viewCoordinatorId}
      />
      <ConfirmAlertDialog
        isOpen={Boolean(statusCoordinator)}
        onClose={() => {
          if (!activateMutation.isPending) setStatusCoordinator(null);
        }}
        onConfirm={handleConfirmToggleStatus}
        title={
          statusCoordinator && isLabCoordinatorActive(statusCoordinator)
            ? 'Deactivate Lab Coordinator'
            : 'Activate Lab Coordinator'
        }
        description={`Are you sure you want to ${
          statusCoordinator && isLabCoordinatorActive(statusCoordinator) ? 'deactivate' : 'activate'
        } "${statusCoordinator ? getLabCoordinatorName(statusCoordinator) : 'this lab coordinator'}"?`}
        confirmText={
          statusCoordinator && isLabCoordinatorActive(statusCoordinator)
            ? 'Deactivate Now'
            : 'Activate Now'
        }
        isLoading={activateMutation.isPending}
        variant={
          statusCoordinator && isLabCoordinatorActive(statusCoordinator) ? 'destructive' : 'success'
        }
      />

      <DeleteAlertDialog
        isOpen={Boolean(deleteCoordinator)}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteCoordinator(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Lab Coordinator"
        description={`Are you sure you want to delete ${deleteCoordinator ? getLabCoordinatorName(deleteCoordinator) : 'this lab coordinator'}? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </div>
    </>
  );
}
