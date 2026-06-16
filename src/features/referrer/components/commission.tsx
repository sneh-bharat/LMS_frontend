'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { departmentApi, type Department } from '@/app/Apis/lab/departmentApi';
import { fetchReferrerById, getReferrerName } from '../services/referrer.service';
import type {
  CreateReferrerCommissionPayload,
  ReferrerCommission,
} from '@/app/Apis/Referrer/ReferrerCommission';
import {
  useCreateReferrerCommission,
  useUpdateReferrerCommission,
} from '../services/referrer.service';

export interface ReferrerCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId: number | null;
  referrerName?: string;
  /** When set, form runs in edit mode (PUT). Omit for create (POST). */
  commissionId?: number | null;
  /** Prefill for edit; avoids extra fetch when opened from department list. */
  initialCommission?: ReferrerCommission | null;
}

const initialForm = {
  referrerId: 0,
  referrerName: '',
  departmentId: 0,
  departmentName: '',
  commissionPercentage: '',
  applyToAllTests: true,
  isActive: true,
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;
    if (typeof o.message === 'string') return o.message;
  }
  return 'Could not save commission. Please try again.';
}

function buildPayload(formData: typeof initialForm): CreateReferrerCommissionPayload {
  return {
    referrerId: formData.referrerId,
    referrerName: formData.referrerName.trim(),
    departmentId: formData.departmentId,
    departmentName: formData.departmentName.trim(),
    commissionPercentage: parseFloat(formData.commissionPercentage),
    applyToAllTests: formData.applyToAllTests,
    isActive: formData.isActive,
  };
}

export default function Commission({
  isOpen,
  onClose,
  referrerId,
  referrerName,
  commissionId,
  initialCommission,
}: ReferrerCommissionProps) {
  const isEdit = Boolean(commissionId != null && commissionId > 0);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingReferrer, setLoadingReferrer] = useState(false);

  const createMutation = useCreateReferrerCommission();
  const updateMutation = useUpdateReferrerCommission();

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setErrors({});
      return;
    }

    if (isEdit && initialCommission) {
      const deptName =
        initialCommission.departmentName?.trim() ||
        departments.find((d) => d.id === initialCommission.departmentId)?.departmentName ||
        '';
      setFormData({
        referrerId: initialCommission.referrerId,
        referrerName: initialCommission.referrerName?.trim() || referrerName?.trim() || '',
        departmentId: initialCommission.departmentId,
        departmentName: deptName,
        commissionPercentage: String(initialCommission.commissionPercentage),
        applyToAllTests: initialCommission.applyToAllTests,
        isActive: initialCommission.isActive,
      });
      return;
    }

    if (referrerId == null || referrerId < 1) {
      setFormData(initialForm);
      return;
    }

    setFormData({
      ...initialForm,
      referrerId,
      referrerName: referrerName?.trim() || '',
    });
  }, [isOpen, isEdit, initialCommission, referrerId, referrerName]);

  useEffect(() => {
    if (!isOpen || referrerId == null || referrerId < 1) return;
    if (formData.referrerName.trim()) return;
    if (referrerName?.trim()) return;

    let cancelled = false;
    setLoadingReferrer(true);
    (async () => {
      try {
        const res = await fetchReferrerById(referrerId);
        if (!cancelled && res?.data) {
          const name = getReferrerName(res.data);
          if (name !== '—') {
            setFormData((prev) => ({ ...prev, referrerName: name }));
          }
        }
      } catch {
        if (!cancelled) toast.error('Failed to load referrer name.');
      } finally {
        if (!cancelled) setLoadingReferrer(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, referrerId, referrerName, formData.referrerName]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setLoadingDepartments(true);
      try {
        const res = await departmentApi.getActiveDepartments({ pageNo: 0, pageSize: 200 });
        const list = res?.data?.content ?? [];
        if (!cancelled) setDepartments(list.filter((d) => d.isActive));
      } catch {
        if (!cancelled) {
          setDepartments([]);
          toast.error('Failed to load departments.');
        }
      } finally {
        if (!cancelled) setLoadingDepartments(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isEdit || !initialCommission || formData.departmentName.trim()) return;
    const deptName =
      initialCommission.departmentName?.trim() ||
      departments.find((d) => d.id === initialCommission.departmentId)?.departmentName ||
      '';
    if (deptName) {
      setFormData((prev) => ({ ...prev, departmentName: deptName }));
    }
  }, [isOpen, isEdit, initialCommission, departments, formData.departmentName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const el = e.target;
    const name = el.name;

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: el.checked }));
    } else if (name === 'departmentId') {
      const id = Number(el.value) || 0;
      const dept = departments.find((d) => d.id === id);
      setFormData((prev) => ({
        ...prev,
        departmentId: id,
        departmentName: dept?.departmentName ?? '',
      }));
    } else if (name === 'commissionPercentage') {
      setFormData((prev) => ({ ...prev, commissionPercentage: el.value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: el.value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.referrerId || formData.referrerId < 1) next.referrerId = 'Referrer is required';
    if (!formData.referrerName.trim()) next.referrerName = 'Referrer name is required';
    if (!formData.departmentId || formData.departmentId < 1) next.departmentId = 'Department is required';
    if (!formData.departmentName.trim()) next.departmentId = 'Department is required';

    const pct = parseFloat(formData.commissionPercentage);
    if (!formData.commissionPercentage.trim()) next.commissionPercentage = 'Commission percentage is required';
    else if (!Number.isFinite(pct) || pct < 0 || pct > 100) {
      next.commissionPercentage = 'Enter a value between 0 and 100';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = buildPayload(formData);

    if (isEdit && commissionId) {
      updateMutation.mutate(
        { commissionId, payload },
        {
          onSuccess: (res) => {
            toast.success(res?.message?.trim() || 'Commission updated successfully.');
            onClose();
          },
          onError: (err) => {
            toast.error(getErrorMessage(err));
          },
        }
      );
      return;
    }

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || 'Commission created successfully.');
        onClose();
      },
      onError: (err) => {
        toast.error(getErrorMessage(err));
      },
    });
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const loadingMeta =
    loadingReferrer || ((loadingDepartments && departments.length === 0) && !isEdit);

  const footer = (
    <div className="flex gap-3 w-full">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold" disabled={pending}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="referrer-commission-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || loadingMeta || !formData.referrerId}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Saving…
          </span>
        ) : isEdit ? (
          'Update commission'
        ) : (
          'Create commission'
        )}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        isEdit ? (
          <>
            Edit <span className="text-emerald-200">commission</span>
          </>
        ) : (
          <>
            Add <span className="text-emerald-200">commission</span>
          </>
        )
      }
      description={
        isEdit
          ? 'Update department commission for this referrer'
          : 'Set department commission for this referrer'
      }
      footer={footer}
      maxWidth={isEdit ? 'xl' : 'md'}
    >
      {loadingMeta ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading form…</p>
        </div>
      ) : (
        <form id="referrer-commission-form" onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="referrerId" value={formData.referrerId || ''} />

          <div className="space-y-2">
            <Label htmlFor="referrerName" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Referrer name
            </Label>
            <Input
              id="referrerName"
              name="referrerName"
              value={formData.referrerName}
              readOnly
              className="border-slate-200 bg-slate-50 text-slate-700"
              disabled={pending}
            />
            {errors.referrerName ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.referrerName}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Department *
            </Label>
            {isEdit ? (
              <Input
                id="departmentName"
                name="departmentName"
                value={formData.departmentName}
                readOnly
                className="border-slate-200 bg-slate-50 text-slate-700"
                disabled={pending}
              />
            ) : loadingDepartments ? (
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                <Loader2 className="animate-spin text-emerald-600" size={16} aria-hidden />
                Loading departments…
              </div>
            ) : (
              <select
                id="departmentId"
                name="departmentId"
                value={formData.departmentId || ''}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.departmentId ? 'border-rose-300' : 'border-input'
                }`}
                disabled={pending || departments.length === 0}
              >
                <option value="" disabled>
                  Select department
                </option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.departmentName}
                  </option>
                ))}
              </select>
            )}
            {formData.departmentName && !isEdit ? (
              <p className="text-xs text-slate-500 font-medium">
                Selected: <span className="text-slate-800 font-bold">{formData.departmentName}</span>
              </p>
            ) : null}
            {errors.departmentId ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.departmentId}
              </p>
            ) : null}
            {!isEdit && !loadingDepartments && departments.length === 0 ? (
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> No active departments found.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="commissionPercentage"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
            >
              <Percent size={12} aria-hidden />
              Commission percentage *
            </Label>
            <Input
              id="commissionPercentage"
              name="commissionPercentage"
              type="number"
              min={0}
              max={100}
              step={0.01}
              value={formData.commissionPercentage}
              onChange={handleChange}
              placeholder="15.00"
              className={`border-slate-200 ${errors.commissionPercentage ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.commissionPercentage ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.commissionPercentage}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="applyToAllTests"
              name="applyToAllTests"
              type="checkbox"
              checked={formData.applyToAllTests}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
            />
            <Label htmlFor="applyToAllTests" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Apply to all tests in this department
            </Label>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
            />
            <Label htmlFor="isActive" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Active commission rule
            </Label>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}
