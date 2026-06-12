'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import { departmentApi, type Department } from '@/app/Apis/lab/departmentApi';
import {
  isLabCoordinatorMutationSuccess,
  normalizeLabCoordinatorPhone,
} from '@/app/Apis/LabCoordinator/LabCoordinatorApi';
import { useCreateLabCoordinator } from '@/app/Apis/LabCoordinator/useLabCoordinators';

export interface AddCoordinatorProps {
  isOpen: boolean;
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
  department: '',
  specialization: '',
  isVerified: true,
  isActive: true,
};

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;
    if (typeof o.message === 'string' && o.message.trim()) return o.message;
    const res = o.response as { data?: { message?: string; error?: string } } | undefined;
    const server = res?.data?.message ?? res?.data?.error;
    if (typeof server === 'string' && server.trim()) return server;
  }
  return 'Failed to create lab coordinator.';
}

const DUPLICATE_EMAIL_MESSAGE =
  'The email address already exists. Please use a different email address.';

function isDuplicateEmailMessage(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('email address already exists') ||
    (lower.includes('email') &&
      (lower.includes('duplicate') ||
        lower.includes('already') ||
        lower.includes('exist') ||
        lower.includes('in use')))
  );
}

function applyCreateFieldErrors(message: string, setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>) {
  const lower = message.toLowerCase();
  if (lower.includes('username') && (lower.includes('duplicate') || lower.includes('already') || lower.includes('exist'))) {
    setErrors((prev) => ({ ...prev, username: 'This username is already in use.' }));
    return true;
  }
  if (isDuplicateEmailMessage(message)) {
    setErrors((prev) => ({ ...prev, email: DUPLICATE_EMAIL_MESSAGE }));
    return true;
  }
  if (lower.includes('branch')) {
    setErrors((prev) => ({ ...prev, branchId: 'Selected branch is invalid. Choose another branch.' }));
    return true;
  }
  return false;
}

export default function AddCoordinator({ isOpen, onSuccess, onClose }: AddCoordinatorProps) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const createMutation = useCreateLabCoordinator();

  useEffect(() => {
    if (isOpen) {
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
        const list = res?.data?.content ?? [];
        if (cancelled) return;
        setBranches(list);
        setForm((prev) => {
          if (prev.branchId !== 0) return prev;
          const first = list[0]?.id;
          return first ? { ...prev, branchId: first } : prev;
        });
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
    if (!isOpen) return;

    let cancelled = false;
    (async () => {
      setLoadingDepartments(true);
      try {
        const res = await departmentApi.getAllDepartments({ pageNo: 0, pageSize: 100 });
        const list = res?.data?.content ?? [];
        if (cancelled) return;
        setDepartments(list);
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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
    if (!form.password.trim()) next.password = 'Password is required.';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (!form.phone.trim()) next.phone = 'Phone is required.';
    if (!form.department.trim()) next.department = 'Department is required.';
    if (!form.specialization.trim()) next.specialization = 'Specialization is required.';
    const email = form.email.trim();
    if (!email) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createMutation.mutate(
      {
        branchId: form.branchId,
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: normalizeLabCoordinatorPhone(form.phone),
        username: form.username.trim(),
        password: form.password,
        department: form.department.trim(),
        specialization: form.specialization.trim(),
        isVerified: form.isVerified === true,
        isActive: form.isActive === true,
      },
      {
        onSuccess: (res) => {
          if (!isLabCoordinatorMutationSuccess(res)) {
            const msg = res.message?.trim() || 'Failed to create lab coordinator.';
            if (!applyCreateFieldErrors(msg, setErrors)) {
              toast.error(msg);
            }
            return;
          }
          toast.success(res?.message?.trim() || 'Lab coordinator created successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          const msg = getErrorMessage(err);
          if (!applyCreateFieldErrors(msg, setErrors)) {
            toast.error(msg);
          }
        },
      }
    );
  };

  const pending = createMutation.isPending;

  const footer = (
    <div className="flex gap-3 w-full">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold" disabled={pending}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="lab-coordinator-form"
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
          'Save coordinator'
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
          Add <span className="text-emerald-200">lab coordinator</span>
        </>
      }
      description="Register a new lab coordinator account"
      footer={footer}
      maxWidth="md"
    >
      <form id="lab-coordinator-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Full name *
          </Label>
          <Input
            id="fullName"
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
          <Label htmlFor="branchId" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Branch *
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
              value={form.branchId || ''}
              onChange={handleChange}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.branchId ? 'border-rose-300' : 'border-input'
              }`}
              disabled={pending || branches.length === 0}
            >
              <option value="" disabled>
                Select branch
              </option>
              {branches.map((branch) => (
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
            <Label htmlFor="department" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Department *
            </Label>
            {loadingDepartments ? (
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500">
                <Loader2 className="animate-spin text-emerald-600" size={16} aria-hidden />
                Loading departments…
              </div>
            ) : (
              <select
                id="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  errors.department ? 'border-rose-300' : 'border-input'
                }`}
                disabled={pending || departments.length === 0}
              >
                <option value="" disabled>
                  Select department
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.departmentName}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            )}
            {errors.department ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.department}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="specialization" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Specialization *
            </Label>
            <Input
              id="specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="Enter Specialization"
              className={`border-slate-200 ${errors.specialization ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.specialization ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.specialization}
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Username *
            </Label>
            <Input
              id="username"
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
            <Label htmlFor="password" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Password *
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={form.password}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Phone *
            </Label>
            <Input
              id="phone"
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
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Email *
            </Label>
            <Input
              id="email"
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
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="isVerified"
              name="isVerified"
              type="checkbox"
              checked={form.isVerified === true}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
            />
            <Label htmlFor="isVerified" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Verified account
            </Label>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={form.isActive === true}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
            />
            <Label htmlFor="isActive" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Active account
            </Label>
          </div>
        </div>
      </form>
    </RightDrawer>
  );
}
