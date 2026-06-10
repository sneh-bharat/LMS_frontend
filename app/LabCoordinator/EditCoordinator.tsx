'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import {
  useLabCoordinatorById,
  useUpdateLabCoordinator,
} from '@/app/Apis/LabCoordinator/useLabCoordinators';
import { getLabCoordinatorName } from '@/app/Apis/LabCoordinator/LabCoordinatorApi';

export interface EditCoordinatorProps {
  isOpen: boolean;
  coordinatorId: number | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const initialForm = {
  branchId: 0,
  fullName: '',
  email: '',
  phone: '',
  username: '',
  isVerified: true,
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
  return 'Failed to update lab coordinator.';
}

export default function EditCoordinator({
  isOpen,
  coordinatorId,
  onSuccess,
  onClose,
}: EditCoordinatorProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const detailQuery = useLabCoordinatorById(coordinatorId, {
    enabled: isOpen && coordinatorId != null && coordinatorId > 0,
  });
  const updateMutation = useUpdateLabCoordinator();

  const loadingDetail =
    !!coordinatorId &&
    (detailQuery.isLoading || (detailQuery.isFetching && !detailQuery.data));

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setLoadingBranches(true);
      try {
        const res = await branchApi.listBranchesAll({ page: 0, size: 100 });
        if (cancelled) return;
        setBranches(res?.data?.content ?? []);
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
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !coordinatorId) return;
    const coordinator = detailQuery.data?.data;
    if (!coordinator || coordinator.id !== coordinatorId) return;

    setForm({
      branchId: coordinator.branchId ?? 0,
      fullName: coordinator.fullName?.trim() || coordinator.name?.trim() || '',
      email: coordinator.email?.trim() || '',
      phone: coordinator.phone?.trim() || '',
      username: coordinator.username?.trim() || '',
      isVerified: coordinator.isVerified === true,
    });
    setErrors({});
  }, [isOpen, coordinatorId, detailQuery.data?.data]);

  const branchOptions = useMemo(() => {
    const options = [...branches];
    const currentBranchId = form.branchId;

    if (
      currentBranchId > 0 &&
      !options.some((branch) => branch.id === currentBranchId)
    ) {
      options.unshift({
        id: currentBranchId,
        branchCode: '',
        branchName: detailQuery.data?.data?.branchName?.trim() || `Branch ${currentBranchId}`,
        branchType: '',
        address: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        contactEmail: null,
        contactPhone: null,
        isActive: true,
        tenantId: detailQuery.data?.data?.tenantId ?? 1,
      });
    }

    return options;
  }, [branches, form.branchId, detailQuery.data?.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const el = e.target;
    const name = el.name;

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      setForm((prev) => ({ ...prev, isVerified: el.checked }));
    } else if (name === 'branchId') {
      setForm((prev) => ({ ...prev, branchId: Number(el.value) || 0 }));
    } else {
      setForm((prev) => ({ ...prev, [name]: el.value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.branchId || form.branchId < 1) next.branchId = 'Branch is required.';
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!form.username.trim()) next.username = 'Username is required.';
    if (!form.phone.trim()) next.phone = 'Phone is required.';
    const email = form.email.trim();
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinatorId || !validate()) return;

    updateMutation.mutate(
      {
        id: coordinatorId,
        payload: {
          branchId: form.branchId,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          username: form.username.trim(),
          isVerified: form.isVerified === true,
        },
      },
      {
        onSuccess: (res) => {
          if (res.response === false && res.status !== 'success') {
            toast.error(res.message || 'Failed to update lab coordinator.');
            return;
          }
          toast.success(res?.message?.trim() || 'Lab coordinator updated successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err));
        },
      }
    );
  };

  const pending = updateMutation.isPending;

  const footer = (
    <div className="flex gap-3 w-full">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold" disabled={pending}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="edit-lab-coordinator-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || loadingDetail || detailQuery.isError}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Updating…
          </span>
        ) : (
          'Update coordinator'
        )}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Edit <span className="text-emerald-200">lab coordinator</span>
        </>
      }
      description={
        coordinatorId
          ? detailQuery.data?.data
            ? getLabCoordinatorName(detailQuery.data.data)
            : `Coordinator ID: ${coordinatorId}`
          : 'Update lab coordinator account'
      }
      footer={footer}
      maxWidth="md"
    >
      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading coordinator details…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load coordinator.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="shrink-0 font-bold" onClick={() => detailQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : (
        <form id="edit-lab-coordinator-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-fullName" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Full name *
            </Label>
            <Input
              id="edit-fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter Full Name"
              className={`border-slate-200 ${errors.fullName ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.fullName ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.fullName}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-branchId" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Branch *
            </Label>
            {loadingBranches ? (
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                <Loader2 className="animate-spin text-emerald-600" size={16} aria-hidden />
                Loading branches…
              </div>
            ) : (
              <select
                id="edit-branchId"
                name="branchId"
                value={form.branchId || ''}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.branchId ? 'border-rose-300' : 'border-input'
                }`}
                disabled={pending || branchOptions.length === 0}
              >
                <option value="" disabled>
                  Select branch
                </option>
                {branchOptions.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName}
                  </option>
                ))}
              </select>
            )}
            {errors.branchId ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.branchId}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-username" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Username *
              </Label>
              <Input
                id="edit-username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Enter Username"
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
              <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Phone *
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91-XX-XXXX-XXXX"
                className={`border-slate-200 ${errors.phone ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.phone ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.phone}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-email" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Email *
            </Label>
            <Input
              id="edit-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter Email"
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

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="edit-isVerified"
              name="isVerified"
              type="checkbox"
              checked={form.isVerified === true}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
            />
            <Label htmlFor="edit-isVerified" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Verified account
            </Label>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}
