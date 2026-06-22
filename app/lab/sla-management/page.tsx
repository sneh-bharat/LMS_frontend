'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ChevronDown,
  Settings,
  Loader2,
  RefreshCcw,
  Shield,
  AlertCircle,
  MoreHorizontal,
  Edit2,
  Trash2,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import AddNewSla from './addNew';
import { useActiveDepartments } from '@/app/Apis/lab/departmentHooks';
import {
  useSlaRules,
  useDeleteSlaRule,
} from '@/app/Apis/SlaManagement/useSlaManagement';
import type { SlaRule, SlaRulePriority } from '@/app/Apis/SlaManagement/SlaManagementApi';

const PAGE_SIZE = 10;
const PRIORITY_FILTERS: Array<'All' | SlaRulePriority> = [
  'All',
  'ROUTINE',
  'URGENT',
  'STAT',
  'NORMAL',
];

function PriorityBadge({ priority }: { priority: SlaRulePriority }) {
  const tone =
    priority === 'STAT' || priority === 'URGENT'
      ? 'bg-[#FEECEC] text-rose-700'
      : priority === 'NORMAL'
        ? 'bg-sky-50 text-sky-700'
        : 'bg-slate-100 text-slate-600';

  return (
    <Badge variant="secondary" className={`px-2.5 py-1 text-[10px] font-bold border-0 ${tone}`}>
      {priority}
    </Badge>
  );
}

function RuleActions({
  rule,
  onEdit,
  onDelete,
}: {
  rule: SlaRule;
  onEdit: (rule: SlaRule) => void;
  onDelete: (id: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-600"
      >
        <MoreHorizontal size={20} />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 py-1">
            <button
              type="button"
              onClick={() => {
                onEdit(rule);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(rule.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function SlaManagementPage() {
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'All' | SlaRulePriority>('All');
  const [pageNo, setPageNo] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<SlaRule | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data, isLoading, isFetching, isError, error, refetch } = useSlaRules(priorityFilter);
  const { data: departmentsResponse } = useActiveDepartments({ pageNo: 0, pageSize: 500 });
  const deleteMutation = useDeleteSlaRule();

  const departmentNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const dept of departmentsResponse?.data?.content ?? []) {
      map.set(dept.id, dept.departmentName);
    }
    return map;
  }, [departmentsResponse]);

  const resolveDepartmentName = (departmentId: number) =>
    departmentNameById.get(departmentId) ?? '—';

  const rules: SlaRule[] = data?.data ?? [];
  const loading = isLoading;
  const isRefreshing = isFetching && !isLoading;
  const errorMessage = error?.message ?? 'Failed to load SLA rules.';

  useEffect(() => {
    setPageNo(0);
  }, [search, priorityFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return rules.filter((row) => {
      const departmentName = resolveDepartmentName(row.departmentId);
      const matchesSearch =
        !q ||
        row.description.toLowerCase().includes(q) ||
        row.testType.toLowerCase().includes(q) ||
        departmentName.toLowerCase().includes(q) ||
        (row.categoryName?.toLowerCase().includes(q) ?? false);

      return matchesSearch;
    });
  }, [rules, search, departmentNameById]);

  const totalElements = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / PAGE_SIZE));
  const pageRows = filtered.slice(pageNo * PAGE_SIZE, pageNo * PAGE_SIZE + PAGE_SIZE);

  const handleRefresh = async () => {
    const result = await refetch();
    if (result.isError) {
      toast.error(result.error?.message ?? errorMessage);
    }
  };

  const handleOpenCreate = () => {
    setEditingRule(null);
    setDrawerOpen(true);
  };

  const handleEdit = (rule: SlaRule) => {
    setEditingRule(rule);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setEditingRule(null);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      const response = await deleteMutation.mutateAsync(deletingId);
      toast.success(response.message?.trim() || 'SLA configuration deleted.');
      setDeleteDialogOpen(false);
      setDeletingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete SLA configuration.');
    }
  };

  const deletingRule = deletingId ? rules.find((r) => r.id === deletingId) : null;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <AddNewSla
        isOpen={drawerOpen}
        onClose={handleCloseDrawer}
        onSuccess={() => void refetch()}
        editData={editingRule}
      />

      <DeleteAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete SLA configuration"
        description={
          deletingRule
            ? `Are you sure you want to delete "${deletingRule.description}"? This action cannot be undone.`
            : 'Are you sure you want to delete this SLA configuration?'
        }
        onConfirm={() => void handleConfirmDelete()}
        isLoading={deleteMutation.isPending}
      />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#006D77] flex items-center justify-center text-white shadow-lg shadow-teal-200 shrink-0">
            <Shield size={18} className="sm:hidden" />
            <Shield size={20} className="hidden sm:block" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-1 leading-tight">
              <span className="text-[#006D77]">SLA</span>{' '}
              <span className="text-[#FF671F]">Management</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium max-w-xl">
              Configure service-level agreement rules — turnaround targets, warning thresholds, and breach escalation.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto">
          {/* <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 font-bold"
            onClick={() => void handleRefresh()}
            disabled={isRefreshing}
          >
            <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            Refresh
          </Button> */}
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="gap-2 shadow-sm px-6 sm:px-8 font-bold"
            onClick={handleOpenCreate}
          >
            <Plus size={16} /> Create SLA
          </Button>
        </div>
      </div>

      {/* Control bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3 sm:gap-4">
        <div className="relative flex-1 group w-full min-w-0">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by description, test type, department..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:min-w-[9rem] lg:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value as 'All' | SlaRulePriority);
                    setPageNo(0);
                  }}
                  className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
                >
                  {PRIORITY_FILTERS.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === 'All' ? 'All priorities' : priority}
                    </option>
                  ))}
                </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"
              size={14}
            />
          </div>
          <Button variant="outline" size="sm" className="rounded-lg p-2.5 border-slate-200 shrink-0">
            <Settings size={18} />
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" aria-hidden />
          <span className="font-medium">{errorMessage}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="ml-auto font-bold"
            onClick={() => void handleRefresh()}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200">
        {loading ? (
          <div className="px-4 sm:px-6 py-16 text-center text-slate-500">
            <div className="flex items-center justify-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#006D77]" />
              <span className="text-sm font-semibold">Loading SLA rules…</span>
            </div>
          </div>
        ) : pageRows.length === 0 ? (
          <div className="px-4 sm:px-6 py-16 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 border border-slate-100">
                <Shield size={32} />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 tracking-tight">No SLA rules found</p>
                <p className="text-xs font-medium text-slate-400">
                  Create your first SLA configuration to get started.
                </p>
              </div>
              <Button variant="gradient" size="sm" className="gap-2 mt-2" onClick={handleOpenCreate}>
                <Plus size={16} /> Create SLA
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-100">
              {pageRows.map((row) => (
                <div key={row.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <PriorityBadge priority={row.priority} />
                        <Badge variant="primary" className="text-[9px] px-2 py-0.5">
                          {row.testType}
                        </Badge>
                      </div>
                      <p className="font-bold text-slate-900 text-sm">{row.description}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {resolveDepartmentName(row.departmentId)} ·{' '}
                        {row.categoryName ?? `Cat #${row.categoryId}`}
                      </p>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SLA</p>
                          <p className="font-bold text-slate-800 mt-0.5">{row.slaHours}h</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warning</p>
                          <p className="font-bold text-amber-600 mt-0.5">{row.warningThresholdHours}h</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Breach</p>
                          <p className="font-bold text-rose-600 mt-0.5">{row.breachEscalationHours}h</p>
                        </div>
                      </div>
                    </div>
                    <RuleActions rule={row} onEdit={handleEdit} onDelete={handleDeleteClick} />
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Priority
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Test Type
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Department
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      SLA Hrs
                    </th>
                    <th className="px-4 lg:px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 lg:px-6 py-4">
                        <PriorityBadge priority={row.priority} />
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <Badge variant="primary" className="text-[10px] font-bold">
                          {row.testType}
                        </Badge>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm font-semibold text-slate-700 max-w-0">
                        <span className="block truncate">
                          {resolveDepartmentName(row.departmentId)}
                        </span>
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={13} className="text-slate-400" />
                          <span className="text-sm font-bold text-slate-800 font-mono">
                            {row.slaHours}h
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <RuleActions rule={row} onEdit={handleEdit} onDelete={handleDeleteClick} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="bg-slate-50 px-4 sm:px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>
                Showing {pageRows.length} of {totalElements} rules
              </span>
              <div className="w-1 h-1 rounded-full bg-slate-200 hidden sm:block" />
              <span className="text-[#FF671F] hidden sm:inline">SLA Rules Setup</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="px-4 py-1 text-[10px] font-bold"
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                disabled={pageNo === 0}
              >
                Prev
              </Button>
              <span className="px-4 py-1 text-xs font-bold text-slate-600">
                Page {pageNo + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="px-4 py-1 text-[10px] font-bold"
                onClick={() => setPageNo((p) => Math.min(totalPages - 1, p + 1))}
                disabled={pageNo + 1 >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
