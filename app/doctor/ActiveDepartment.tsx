'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Building2,
  Percent,
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Layers,
  Plus,
  Trash2,
  Pencil,
  FlaskConical,
} from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { DeleteAlertDialog } from '@/components/ui/delete-alert-dialog';
import { departmentApi } from '@/app/Apis/lab/departmentApi';
import { useDoctorCommissions, useDeleteDoctorCommission } from '@/app/Apis/Commission/useDoctorCommission';
import type { DoctorCommission } from '@/app/Apis/Commission/commissionPrice';

const EMPTY_COMMISSIONS: DoctorCommission[] = [];

export interface ActiveDepartmentProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number | null;
  doctorName?: string;
  onAddCommission?: () => void;
  onEditCommission?: (commission: DoctorCommission) => void;
  onViewTestCommissions?: () => void;
}

/** Treat numeric-only strings as IDs, not display names. */
function isDepartmentIdPlaceholder(value: string): boolean {
  return /^\d+$/.test(value.trim());
}

function needsDepartmentNameLookup(item: DoctorCommission): boolean {
  if (item.departmentId < 1) return false;
  const name = item.departmentName?.trim();
  return !name || isDepartmentIdPlaceholder(name);
}

function resolveDepartmentDisplayName(
  item: DoctorCommission,
  nameByDepartmentId: Record<number, string>
): string {
  const fromApi = item.departmentName?.trim();
  if (fromApi && !isDepartmentIdPlaceholder(fromApi)) return fromApi;
  const fromLookup = nameByDepartmentId[item.departmentId]?.trim();
  if (fromLookup) return fromLookup;
  return 'Unknown department';
}

function CommissionCard({
  item,
  departmentDisplayName,
  onEdit,
  onDelete,
  deletePending,
}: {
  item: DoctorCommission;
  departmentDisplayName: string;
  onEdit?: () => void;
  onDelete: () => void;
  deletePending: boolean;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <Building2 size={18} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</p>
            <h4 className="text-base font-bold text-slate-900 tracking-tight truncate">{departmentDisplayName}</h4>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            Commission
          </label>
          <p className="text-lg font-black text-emerald-700">{item.commissionPercentage}%</p>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Layers size={10} aria-hidden />
            Apply to all tests
          </label>
          <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            {item.applyToAllTests ? (
              <>
                <CheckCircle2 size={14} className="text-emerald-600" aria-hidden />
                Yes
              </>
            ) : (
              <>
                <XCircle size={14} className="text-slate-400" aria-hidden />
                No
              </>
            )}
          </p>
        </div>
      </div>

      {item.description?.trim() ? (
        <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 leading-relaxed">
          {item.description}
        </p>
      ) : null}

      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap justify-end gap-2">
        {onEdit ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 rounded-lg border-emerald-200 font-bold text-emerald-700 hover:bg-emerald-50"
            onClick={onEdit}
            disabled={deletePending}
          >
            <Pencil size={12} aria-hidden />
            Edit commission
          </Button>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 rounded-lg border-rose-200 font-bold text-rose-700 hover:bg-rose-50"
          onClick={onDelete}
          disabled={deletePending}
        >
          <Trash2 size={12} aria-hidden />
          Delete commission
        </Button>
      </div>
    </div>
  );
}

export default function ActiveDepartment({
  isOpen,
  onClose,
  doctorId,
  doctorName,
  onAddCommission,
  onEditCommission,
  onViewTestCommissions,
}: ActiveDepartmentProps) {
  const commissionsQuery = useDoctorCommissions(doctorId, {
    enabled: isOpen && doctorId != null && doctorId > 0,
  });
  const deleteMutation = useDeleteDoctorCommission();
  const [commissionToDelete, setCommissionToDelete] = useState<{
    id: number;
    departmentName: string;
  } | null>(null);

  const commissions = useMemo(
    () => commissionsQuery.data?.data ?? EMPTY_COMMISSIONS,
    [commissionsQuery.data?.data]
  );
  const displayDoctorName = doctorName?.trim() || commissions[0]?.doctorName || 'Doctor';
  const [departmentNamesById, setDepartmentNamesById] = useState<Record<number, string>>({});
  const [resolvingNames, setResolvingNames] = useState(false);

  /** Stable string key so useEffect does not re-run on new `[]` references every render. */
  const missingDepartmentIdsKey = useMemo(() => {
    const ids: number[] = [];
    for (const item of commissions) {
      if (needsDepartmentNameLookup(item)) {
        ids.push(item.departmentId);
      }
    }
    return ids.length > 0 ? [...new Set(ids)].sort((a, b) => a - b).join(',') : '';
  }, [commissions]);

  const resolvedDoctorId = doctorId ?? 0;

  useEffect(() => {
    if (!isOpen) {
      setDepartmentNamesById({});
      setResolvingNames(false);
      return;
    }

    let cancelled = false;
    setResolvingNames(true);

    (async () => {
      const nameMap: Record<number, string> = {};

      try {
        const res = await departmentApi.getActiveDepartments({ pageNo: 0, pageSize: 500 });
        for (const dept of res?.data?.content ?? []) {
          const name = dept.departmentName?.trim();
          if (name && dept.id > 0) nameMap[dept.id] = name;
        }
      } catch {
        /* fall through to per-id lookup */
      }

      if (missingDepartmentIdsKey) {
        const ids = missingDepartmentIdsKey.split(',').map((id) => Number(id));
        await Promise.all(
          ids.map(async (id) => {
            if (nameMap[id]) return;
            try {
              const res = await departmentApi.getDepartmentById(id);
              const name = res?.data?.departmentName?.trim();
              if (name) nameMap[id] = name;
            } catch {
              /* skip */
            }
          })
        );
      }

      if (!cancelled) {
        setDepartmentNamesById(nameMap);
        setResolvingNames(false);
      }
    })();

    return () => {
      cancelled = true;
      setResolvingNames(false);
    };
  }, [isOpen, resolvedDoctorId, missingDepartmentIdsKey]);

  const loading =
    commissionsQuery.isLoading ||
    (commissionsQuery.isFetching && !commissionsQuery.data) ||
    (resolvingNames && Boolean(missingDepartmentIdsKey));

  const activeCount = commissions.filter((c) => c.isActive).length;

  const closeDeleteDialog = () => {
    if (deleteMutation.isPending) return;
    setCommissionToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (!commissionToDelete || !doctorId) return;
    deleteMutation.mutate(
      { commissionId: commissionToDelete.id, doctorId },
      {
        onSuccess: (res) => {
          toast.success(res?.message?.trim() || 'Commission deleted successfully.');
          setCommissionToDelete(null);
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to delete commission.');
        },
      }
    );
  };

  const footer =
    onAddCommission || onViewTestCommissions ? (
      <div className="flex flex-wrap gap-3 w-full">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold min-w-[120px]">
          Close
        </Button>
        {onViewTestCommissions ? (
          <Button
            type="button"
            variant="outline"
            onClick={onViewTestCommissions}
            className="flex-1 font-bold min-w-[120px] gap-1.5 border-sky-200 text-sky-800 hover:bg-sky-50"
          >
            <FlaskConical size={14} aria-hidden />
            Test commissions
          </Button>
        ) : null}
        {onAddCommission ? (
          <Button type="button" variant="gradient" onClick={onAddCommission} className="flex-1 font-bold min-w-[120px]">
            Add commission
          </Button>
        ) : null}
      </div>
    ) : undefined;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Building2 className="text-white" size={24} aria-hidden />
          <span>
            Department <span className="text-emerald-200">commissions</span>
          </span>
        </div>
      }
      description={displayDoctorName}
      footer={footer}
      maxWidth="xl"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading department commissions…</p>
        </div>
      ) : commissionsQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {commissionsQuery.error instanceof Error
              ? commissionsQuery.error.message
              : 'Failed to load commissions.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 font-bold"
            onClick={() => commissionsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50">
                <Stethoscope size={28} aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{displayDoctorName}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Building2 size={14} className="text-emerald-500" aria-hidden />
                Active departments & commission
              </h4>
            </div>

            {commissions.length === 0 ? (
              <div className="p-10 rounded-xl border border-dashed border-slate-200 text-center">
                <Building2 className="mx-auto text-slate-200 mb-2" size={32} aria-hidden />
                <p className="text-sm text-slate-500 font-medium">No department commissions configured yet.</p>
                {onAddCommission ? (
                  <Button
                    type="button"
                    variant="gradient"
                    size="sm"
                    className="mt-4 gap-1.5 font-bold"
                    onClick={onAddCommission}
                  >
                    <Plus size={14} aria-hidden />
                    Add commission
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {commissions.map((item, index) => {
                  const departmentDisplayName = resolveDepartmentDisplayName(item, departmentNamesById);
                  return (
                    <CommissionCard
                      key={`${item.departmentId}-${item.commissionPercentage}-${index}`}
                      item={item}
                      departmentDisplayName={departmentDisplayName}
                      deletePending={deleteMutation.isPending}
                      onEdit={onEditCommission ? () => onEditCommission(item) : undefined}
                      onDelete={() =>
                        setCommissionToDelete({
                          id: item.id,
                          departmentName: departmentDisplayName,
                        })
                      }
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      <DeleteAlertDialog
        isOpen={Boolean(commissionToDelete)}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete commission"
        description={
          commissionToDelete
            ? `Remove the commission for "${commissionToDelete.departmentName}"? This cannot be undone.`
            : 'Are you sure you want to delete this commission?'
        }
        isLoading={deleteMutation.isPending}
      />
    </RightDrawer>
  );
}
