'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import {
  useUpdateBloodCollector,
} from '@/app/Apis/collector/useCollectors';
import type { BloodCollector } from '@/app/Apis/collector/CollectorsApi';

export interface EditCollectorProps {
  isOpen: boolean;
  collector: BloodCollector | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const initialForm = {
  branchId: 0,
  fullName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  isVerified: true,
  isActive: true,
};

function collectorToForm(collector: BloodCollector) {
  return {
    branchId: collector.branchId ?? 0,
    fullName: collector.fullName?.trim() || '',
    email: collector.email?.trim() || '',
    phone: collector.phone?.trim() || '',
    username: collector.username?.trim() || '',
    password: '',
    isVerified: collector.isVerified === true,
    isActive: collector.isActive !== false,
  };
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;
    if (typeof o.message === 'string') return o.message;
    const res = o.response as { data?: { message?: string; error?: string } } | undefined;
    const server = res?.data?.message ?? res?.data?.error;
    if (typeof server === 'string') return server;
  }
  return 'Failed to update blood collector.';
}

export default function EditCollector({
  isOpen,
  collector,
  onSuccess,
  onClose,
}: EditCollectorProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const collectorId = collector?.id ?? null;

  const updateMutation = useUpdateBloodCollector();

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
    if (!isOpen || !collector) return;
    setForm(collectorToForm(collector));
    setErrors({});
  }, [isOpen, collector]);

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
        branchName: `Branch ${currentBranchId}`,
        branchType: '',
        address: null,
        city: null,
        state: null,
        country: null,
        postalCode: null,
        contactEmail: null,
        contactPhone: null,
        isActive: true,
        tenantId: collector?.tenantId ?? 1,
      });
    }

    return options;
  }, [branches, form.branchId, collector?.tenantId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const el = e.target;
    const name = el.name;

    if (el instanceof HTMLInputElement && el.type === 'checkbox') {
      const checkboxField = name as 'isVerified' | 'isActive';
      setForm((prev) => ({ ...prev, [checkboxField]: el.checked }));
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
    if (form.password.trim() && form.password.length < 6) {
      next.password = 'Password must be at least 6 characters.';
    }
    if (!form.phone.trim()) next.phone = 'Phone is required.';
    const email = form.email.trim();
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectorId || !validate()) return;

    const payload = {
      branchId: form.branchId,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      username: form.username.trim(),
      isVerified: form.isVerified,
      isActive: form.isActive,
      ...(form.password.trim() ? { password: form.password.trim() } : {}),
    };

    updateMutation.mutate(
      { id: collectorId, payload },
      {
        onSuccess: (res) => {
          if (res.response === false && res.status !== 'success') {
            toast.error(res.message || 'Failed to update blood collector.');
            return;
          }
          toast.success(res?.message?.trim() || 'Blood collector updated successfully.');
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
        form="edit-collector-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Saving…
          </span>
        ) : (
          'Update collector'
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
          Edit <span className="text-emerald-200">blood collector</span>
        </>
      }
      description="Update blood collector account details"
      footer={footer}
      maxWidth="md"
    >
      {!collector ? null : (
        <form id="edit-collector-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-fullName" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Full name *
            </Label>
            <Input
              id="edit-fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Full Name"
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
                placeholder="Username"
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
              <Label htmlFor="edit-password" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Password
              </Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                Phone *
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+916207707634"
                className={`border-slate-200 ${errors.phone ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.phone ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.phone}
                </p>
              ) : null}
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
                placeholder="bloodcoll@example.com"
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
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
              <input
                id="edit-isActive"
                name="isActive"
                type="checkbox"
                checked={form.isActive === true}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                disabled={pending}
              />
              <Label htmlFor="edit-isActive" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
                Active account
              </Label>
            </div>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}
