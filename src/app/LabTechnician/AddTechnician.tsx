'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import {
  useCreateLabTechnician,
  useLabTechnician,
  useUpdateLabTechnician,
} from '@/app/Apis/LabTechnician/useLabTechnicians';
import type {
  CreateLabTechnicianPayload,
  UpdateLabTechnicianPayload,
} from '@/app/Apis/LabTechnician/labtechnicianApi';

export interface AddTechnicianProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, loads `GET /api/v1/lab-technicians/:id` and submits `PUT` for update. */
  technicianId?: number | null;
}

const SHIFTS = ['Morning', 'Afternoon', 'Evening', 'Night'] as const;

const initialForm = {
  name: '',
  username: '',
  password: '',
  email: '',
  department: '',
  shift: 'Morning',
  branchId: 0,
  isVerified: true,
  isActive: true,
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;
    if (typeof o.message === 'string') return o.message;
    const res = o.response as { data?: { message?: string; error?: string } } | undefined;
    const server = res?.data?.message ?? res?.data?.error;
    if (typeof server === 'string') return server;
  }
  return 'Could not save lab technician. Please try again.';
}

export default function AddTechnician({ isOpen, onClose, technicianId }: AddTechnicianProps) {
  const isEdit = Boolean(technicianId != null && technicianId > 0);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const detailQuery = useLabTechnician(technicianId, { enabled: isOpen && isEdit });
  const createMutation = useCreateLabTechnician();
  const updateMutation = useUpdateLabTechnician();

  // Reset form on open/close
  useEffect(() => {
    if (!isOpen) {
      setFormData(initialForm);
      setErrors({});
      return;
    }
    if (!isEdit) {
      setFormData(initialForm);
    }
  }, [isOpen, isEdit]);

  // Load branches
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      try {
        const res = await branchApi.getAllBranches({ pageNo: 0, pageSize: 200 });
        const list = res?.data?.content ?? [];
        if (cancelled) return;
        setBranches(list);
        if (!isEdit) {
          setFormData((prev) => {
            if (prev.branchId !== 0) return prev;
            const first = list[0]?.id;
            return first ? { ...prev, branchId: first } : prev;
          });
        }
      } catch {
        if (!cancelled) {
          setBranches([]);
          toast.error('Failed to load branches.');
        }
      } finally {
        if (!cancelled) setLoadingBranches(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, isEdit]);

  // Populate form from detail query in edit mode
  useEffect(() => {
    if (!isOpen || !isEdit || !technicianId) return;
    const tech = detailQuery.data?.data;
    if (!tech || tech.id !== technicianId) return;

    setFormData({
      name: tech.name ?? '',
      username: tech.username ?? '',
      password: '',
      email: tech.email ?? '',
      department: tech.department ?? '',
      shift: (tech.shift as typeof SHIFTS[number]) || 'Morning',
      branchId: tech.branchId != null && tech.branchId > 0 ? tech.branchId : 0,
      isVerified: tech.isVerified ?? true,
      isActive: tech.isActive ?? true,
    });
  }, [isOpen, isEdit, technicianId, detailQuery.data?.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const el = e.target;
    const name = el.name;

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: el.checked }));
    } else {
      const value = el instanceof HTMLSelectElement && name === 'branchId' ? Number(el.value) || 0 : el.value;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};

    if (!formData.name.trim()) next.name = 'Name is required';
    if (!formData.branchId || formData.branchId < 1) next.branchId = 'Branch is required';
    if (!formData.department.trim()) next.department = 'Department is required';

    const email = formData.email.trim();
    if (!email) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email';

    if (!isEdit) {
      if (!formData.username.trim()) next.username = 'Username is required';
      if (!formData.password) next.password = 'Password is required';
      else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && technicianId) {
      const payload: UpdateLabTechnicianPayload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        department: formData.department.trim(),
        shift: formData.shift,
        isVerified: formData.isVerified,
        isActive: formData.isActive,
        branchId: formData.branchId,
      };

      updateMutation.mutate(
        { id: technicianId, payload },
        {
          onSuccess: (res) => {
            toast.success(res?.message?.trim() || 'Lab technician updated successfully.');
            onClose();
          },
          onError: (err) => {
            const msg = getErrorMessage(err);
            const lower = msg.toLowerCase();
            if (lower.includes('email') && (lower.includes('duplicate') || lower.includes('already'))) {
              setErrors((prev) => ({ ...prev, email: 'This email is already in use.' }));
              return;
            }
            toast.error(msg);
          },
        }
      );
      return;
    }

    const payload: CreateLabTechnicianPayload = {
      name: formData.name.trim(),
      username: formData.username.trim(),
      password: formData.password,
      email: formData.email.trim(),
      department: formData.department.trim(),
      shift: formData.shift,
      isVerified: formData.isVerified,
      isActive: formData.isActive,
      branchId: formData.branchId,
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res?.message?.trim() || 'Lab technician registered successfully.');
        onClose();
      },
      onError: (err) => {
        const msg = getErrorMessage(err);
        const lower = msg.toLowerCase();

        if (lower.includes('email') && (lower.includes('duplicate') || lower.includes('already'))) {
          setErrors((prev) => ({ ...prev, email: 'This email is already in use.' }));
          return;
        }
        if (lower.includes('username') && (lower.includes('duplicate') || lower.includes('already'))) {
          setErrors((prev) => ({ ...prev, username: 'This username is already taken.' }));
          return;
        }

        toast.error(msg);
      },
    });
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const loadingDetail = isEdit && (detailQuery.isLoading || (detailQuery.isFetching && !detailQuery.data));

  const nameLabel = useMemo(() => (isEdit ? 'Full name' : 'Full name *'), [isEdit]);
  const emailLabel = useMemo(() => (isEdit ? 'Email' : 'Email *'), [isEdit]);
  const departmentLabel = useMemo(() => (isEdit ? 'Department' : 'Department *'), [isEdit]);
  const branchLabel = useMemo(() => (isEdit ? 'Branch' : 'Branch *'), [isEdit]);

  const footer = (
    <div className="flex gap-3 w-full">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold" disabled={pending}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="lab-technician-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || loadingDetail}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Saving…
          </span>
        ) : isEdit ? (
          'Update technician'
        ) : (
          'Save technician'
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
            Edit <span className="text-emerald-200">lab technician</span>
          </>
        ) : (
          <>
            Add <span className="text-emerald-200">lab technician</span>
          </>
        )
      }
      description={isEdit ? 'Update lab technician details' : 'Register a new lab technician for your facility'}
      footer={footer}
      maxWidth="md"
    >
      {isEdit && detailQuery.isError ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load technician.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="shrink-0 font-bold" onClick={() => detailQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading technician…</p>
        </div>
      ) : (
        <form id="lab-technician-form" onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              {nameLabel}
            </Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className={`border-slate-200 ${errors.name ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.name ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.name}
              </p>
            ) : null}
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label htmlFor="branchId" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              {branchLabel}
            </Label>
            {loadingBranches ? (
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                <Loader2 className="animate-spin text-emerald-600" size={16} aria-hidden />
                Loading branches…
              </div>
            ) : (
              <select
                id="branchId"
                name="branchId"
                value={formData.branchId || ''}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.branchId ? 'border-rose-300' : 'border-input'
                }`}
                disabled={pending || branches.length === 0}
              >
                {isEdit ? (
                  <option value="">Not set</option>
                ) : (
                  <option value="" disabled>
                    Select branch
                  </option>
                )}
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.branchName}
                  </option>
                ))}
              </select>
            )}
            {errors.branchId ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.branchId}
              </p>
            ) : null}
            {!loadingBranches && branches.length === 0 ? (
              <p className="text-xs text-amber-700 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> No branches found. Create a branch first.
              </p>
            ) : null}
          </div>

          {/* Username + Password — only in create mode */}
          {!isEdit ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Username *
                </Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="UserName"
                  autoComplete="username"
                  className={`border-slate-200 ${errors.username ? 'border-rose-300' : ''}`}
                  disabled={pending}
                />
                {errors.username ? (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} aria-hidden /> {errors.username}
                  </p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Password *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  className={`border-slate-200 ${errors.password ? 'border-rose-300' : ''}`}
                  disabled={pending}
                />
                {errors.password ? (
                  <p className="text-xs text-rose-600 flex items-center gap-1">
                    <AlertCircle size={12} aria-hidden /> {errors.password}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              {emailLabel}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              autoComplete="email"
              className={`border-slate-200 ${errors.email ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.email ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.email}
              </p>
            ) : null}
          </div>

          {/* Department + Shift */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="department" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                {departmentLabel}
              </Label>
              <Input
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department Name"
                className={`border-slate-200 ${errors.department ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.department ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.department}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Shift *
              </Label>
              <select
                id="shift"
                name="shift"
                value={formData.shift}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={pending}
              >
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <div className="flex items-center gap-3">
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
                Active
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="isVerified"
                name="isVerified"
                type="checkbox"
                checked={formData.isVerified}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                disabled={pending}
              />
              <Label htmlFor="isVerified" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
                Verified
              </Label>
            </div>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}
