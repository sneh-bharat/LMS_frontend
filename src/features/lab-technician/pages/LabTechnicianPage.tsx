'use client';

import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Eye,
  FlaskConical,
  Loader,
  Mail,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useLabTechnicians } from '\.\.\/services\/lab\-technician\.service';
import { useDeleteLabTechnician } from '\.\.\/services\/lab\-technician\.service';
import { useLabTechnicianByUsername } from '\.\.\/services\/lab\-technician\.service';
import { getLabTechnicianName, type LabTechnician } from '\.\.\/services\/lab\-technician\.service';
import AddTechnician from '../components/AddTechnician';
import { LabTechnicianDetails } from '../components/DetailsView';
import { toast } from 'sonner';

const PAGE_SIZE = 10;

export default function LabTechnicianListPage() {
  const [page, setPage] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [usernameSearch, setUsernameSearch] = useState('');
  const [listType, setListType] = useState<'verified' | 'active'>('verified');
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [viewTechnicianId, setViewTechnicianId] = useState<number | null>(null);
  const [editTechnicianId, setEditTechnicianId] = useState<number | null>(null);
  const [deleteTechnicianId, setDeleteTechnicianId] = useState<number | null>(null);

  const deleteMutation = useDeleteLabTechnician();

  const handleDeleteConfirm = () => {
    if (deleteTechnicianId == null) return;
    deleteMutation.mutate(deleteTechnicianId, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || 'Lab technician deleted successfully.');
        setDeleteTechnicianId(null);
      },
      onError: (err) => {
        const msg = err instanceof Error ? err.message : 'Failed to delete lab technician.';
        toast.error(msg);
      },
    });
  };

  const { data, isLoading, isError, error, refetch, isFetching } = useLabTechnicians({
    page,
    size: PAGE_SIZE,
    listType,
  });

  const isUsernameSearchActive = usernameSearch.trim().length > 0;
  const {
    data: usernameResult,
    isLoading: isUsernameLoading,
    isError: isUsernameError,
    error: usernameError,
    refetch: refetchUsername,
  } = useLabTechnicianByUsername(isUsernameSearchActive ? usernameSearch : null);

  const pageData = data?.data;
  const rows = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;
  const canPrev = page > 0;
  const canNext = pageData ? !pageData.last : false;

  // Client-side search filter
  const filteredRows = rows.filter((row) => {
    const term = searchText.trim().toLowerCase();
    if (!term) return true;
    return (
      getLabTechnicianName(row).toLowerCase().includes(term) ||
      (row.username ?? '').toLowerCase().includes(term) ||
      (row.email ?? '').toLowerCase().includes(term) ||
      (row.department ?? '').toLowerCase().includes(term)
    );
  });

  // Username search result rows
  const usernameRows =
    isUsernameSearchActive && usernameResult?.data ? [usernameResult.data] : [];

  // Decide which rows to render
  const displayRows = isUsernameSearchActive ? usernameRows : filteredRows;

  const handleUsernameSearch = () => {
    const term = searchText.trim();
    if (!term) return;
    setUsernameSearch(term);
  };

  const handleClearUsernameSearch = () => {
    setUsernameSearch('');
    setSearchText('');
  };

  const handleListTypeChange = (type: 'verified' | 'active') => {
    if (type === listType) return;
    setListType(type);
    setPage(0);
    setUsernameSearch('');
    setSearchText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            Lab <span className="text-emerald-600">Technicians</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            {listType === 'verified'
              ? 'View verified lab technicians, their departments, shifts, and status.'
              : 'View active lab technicians, their departments, shifts, and status.'}
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
            New Lab Technician
          </Button>
        </div>
      </div>

      {/* List Type Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm w-fit">
        <button
          type="button"
          onClick={() => handleListTypeChange('verified')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            listType === 'verified'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <CheckCircle2 size={14} aria-hidden />
            Verified
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleListTypeChange('active')}
          className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
            listType === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <span className="flex items-center gap-2">
            <FlaskConical size={14} aria-hidden />
            Active
          </span>
        </button>
      </div>

      {/* Search & Refresh */}
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
            onChange={(e) => {
              setSearchText(e.target.value);
              if (isUsernameSearchActive) setUsernameSearch('');
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUsernameSearch();
              }
            }}
            placeholder="Search by  username"
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            aria-label="Search lab technicians"
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-lg p-2.5 border-slate-200 shrink-0 gap-1.5 font-bold text-xs"
            onClick={handleUsernameSearch}
            disabled={isLoading || isFetching || !searchText.trim()}
            title="Search by exact username"
          >
            <Search size={14} aria-hidden />
            By Username
          </Button>
          {isUsernameSearchActive && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg p-2.5 border-rose-200 text-rose-600 shrink-0 gap-1.5 font-bold text-xs"
              onClick={handleClearUsernameSearch}
              title="Clear username search"
            >
              <XCircle size={14} aria-hidden />
              Clear
            </Button>
          )}
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

      {/* Error */}
      {isError && !isUsernameSearchActive && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">
            {error instanceof Error ? error.message : 'Failed to load lab technicians.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto font-bold"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Username Search Error */}
      {isUsernameSearchActive && isUsernameError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">
            {usernameError instanceof Error
              ? usernameError.message
              : `No lab technician found for username "${usernameSearch}".`}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto font-bold"
            onClick={handleClearUsernameSearch}
          >
            Clear Search
          </Button>
        </div>
      )}

      {/* Username Search Active Banner */}
      {isUsernameSearchActive && !isUsernameError && !isUsernameLoading && usernameRows.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-emerald-800">
          <CheckCircle2 size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">
            Showing result for username: <span className="font-mono font-bold">&ldquo;{usernameSearch}&rdquo;</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto font-bold border-emerald-200 text-emerald-700"
            onClick={handleClearUsernameSearch}
          >
            Show All
          </Button>
        </div>
      )}

      {/* Table */}
      {isLoading || isUsernameLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
          <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
          <p className="text-slate-600 font-medium">
            {isUsernameLoading ? 'Searching by username…' : 'Loading lab technicians…'}
          </p>
        </div>
      ) : displayRows.length === 0 && !isUsernameSearchActive ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-600 font-medium">
          No lab technicians found.
        </div>
      ) : (
        <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    ID
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Name
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Username
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Email
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Department
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Role
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Shift
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Verified
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                    Active
                  </th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-slate-400 font-medium">
                      {isUsernameSearchActive
                        ? `No lab technician found for username "${usernameSearch}".`
                        : 'No matches found for your search.'}
                    </td>
                  </tr>
                ) : (
                  displayRows.map((row) => (
                    <LabTechnicianRow
                      key={row.id}
                      row={row}
                      onView={(id) => setViewTechnicianId(id)}
                      onEdit={(id) => setEditTechnicianId(id)}
                      onDelete={(id) => setDeleteTechnicianId(id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isUsernameSearchActive && (
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
              <span>
                Page {page + 1} of {Math.max(totalPages, 1)}
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
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="font-bold border-slate-200"
                disabled={!canNext || isFetching}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
          )}
        </div>
      )}

      {/* Add Technician Drawer */}
      <AddTechnician
        isOpen={addDrawerOpen}
        onClose={() => {
          setAddDrawerOpen(false);
          refetch();
        }}
      />

      {/* Edit Technician Drawer */}
      <AddTechnician
        isOpen={editTechnicianId != null}
        onClose={() => {
          setEditTechnicianId(null);
          refetch();
        }}
        technicianId={editTechnicianId}
      />

      {/* View Technician Details Drawer */}
      <LabTechnicianDetails
        isOpen={viewTechnicianId != null}
        onClose={() => setViewTechnicianId(null)}
        technicianId={viewTechnicianId}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteAlertDialog
        isOpen={deleteTechnicianId != null}
        onClose={() => {
          if (!deleteMutation.isPending) setDeleteTechnicianId(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Lab Technician"
        description="Are you sure you want to permanently delete this lab technician record? This action cannot be undone."
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

function LabTechnicianRow({ row, onView, onEdit, onDelete }: { row: LabTechnician; onView: (id: number) => void; onEdit: (id: number) => void; onDelete: (id: number) => void }) {
  const isVerified = row.isVerified === true;
  const isActive = row.isActive === true;

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors group">
      {/* ID */}
      <td className="px-6 py-5">
        <span className="text-sm font-mono font-bold text-slate-500">{row.id}</span>
      </td>

      {/* Name */}
      <td className="px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-[#006D77] group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
            <FlaskConical size={18} aria-hidden />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-slate-900 text-sm tracking-tight group-hover:text-emerald-700 transition-colors">
              {getLabTechnicianName(row)}
            </div>
          </div>
        </div>
      </td>

      {/* Username */}
      <td className="px-6 py-5 text-sm font-semibold text-slate-700 font-mono">
        {row.username?.trim() || '—'}
      </td>

      {/* Email */}
      <td className="px-6 py-5 max-w-55">
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold truncate">
          <Mail size={12} className="text-emerald-500 shrink-0" aria-hidden />
          {row.email?.trim() ? (
            <a
              href={`mailto:${row.email.trim()}`}
              className="truncate hover:text-emerald-700 transition-colors"
            >
              {row.email.trim()}
            </a>
          ) : (
            '—'
          )}
        </div>
      </td>

      {/* Department */}
      <td className="px-6 py-5">
        <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wide">
          {row.department?.trim() || '—'}
        </Badge>
      </td>

      {/* Role */}
      <td className="px-6 py-5">
        <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wide">
          {row.role?.trim() || '—'}
        </Badge>
      </td>

      {/* Shift */}
      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
        {row.shift?.trim() || '—'}
      </td>

      {/* Verified */}
      <td className="px-6 py-5 text-center">
        {isVerified ? (
          <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1">
            <CheckCircle2 size={12} />
            Yes
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] font-bold gap-1">
            <XCircle size={12} />
            No
          </Badge>
        )}
      </td>

      {/* Active */}
      <td className="px-6 py-5 text-center">
        <Badge
          variant={isActive ? 'default' : 'secondary'}
          className={
            isActive
              ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
              : 'text-[10px] font-bold'
          }
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      </td>

      {/* Actions */}
      <td className="px-6 py-5 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
                aria-label="Lab technician actions"
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
            <DropdownMenuItem
              onClick={() => onDelete(row.id)}
              className="rounded-lg py-2.5 text-xs font-black uppercase text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
}
