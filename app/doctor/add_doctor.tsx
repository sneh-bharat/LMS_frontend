'use client';

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import type {CreateReferringDoctorPayload, ReferringDoctor, UpdateReferringDoctorPayload,
} from '@/app/Apis/doctor/referringDoctorApi';
import { useCreateReferringDoctor, useReferringDoctor, useUpdateReferringDoctor,
} from '@/app/Apis/doctor/useReferringDoctors';

export interface AddDoctorProps {
  isOpen: boolean;
  onClose: () => void;
  /** When set, loads `GET /api/v1/doctors/:id` and submits `PUT` for update. */
  doctorId?: number | null;
  /**
   * Current list slice (e.g. same page) used to block duplicate email / mobile before submit.
   * Duplicates on other pages are still caught via API error handling.
   */
  doctorsForDuplicateCheck?: ReferringDoctor[];
}

const initialForm = {
  doctorName: '',
  branchId: 0,
  specialization: '',
  hospitalName: '',
  username: '',
  password: '',
  doctorEmail: '',
  doctorPhone: '',
  isVerified: true,
  role: 'DOCTOR',
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
  return 'Could not save doctor. Please try again.';
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeMobileDigits(mobile: string): string {
  return mobile.replace(/\D/g, '');
}

const DUPLICATE_EMAIL_MSG = 'This email is already used by another referring doctor.';
const DUPLICATE_MOBILE_MSG = 'This phone number is already used by another referring doctor.';

/** Map common API duplicate / unique constraint messages to field errors. Returns true if handled. */
function mapApiErrorToDuplicateFields(
  err: unknown,
  setErrors: Dispatch<SetStateAction<Record<string, string>>>
): boolean {
  const msg = getErrorMessage(err);
  const lower = msg.toLowerCase();
  const looksDuplicate =
    lower.includes('duplicate') ||
    lower.includes('already exist') ||
    lower.includes('already exists') ||
    lower.includes('already registered') ||
    lower.includes('already in use') ||
    lower.includes('unique') ||
    lower.includes('constraint');

  let touched = false;
  if (lower.includes('email') && looksDuplicate) {
    setErrors((prev) => ({ ...prev, doctorEmail: DUPLICATE_EMAIL_MSG }));
    touched = true;
  }
  if ((lower.includes('mobile') || lower.includes('phone')) && looksDuplicate) {
    setErrors((prev) => ({ ...prev, doctorPhone: DUPLICATE_MOBILE_MSG }));
    touched = true;
  }
  return touched;
}

export default function AddDoctor({ isOpen, onClose, doctorId, doctorsForDuplicateCheck }: AddDoctorProps) {
  const isEdit = Boolean(doctorId != null && doctorId > 0);

  const [formData, setFormData] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const detailQuery = useReferringDoctor(doctorId, { enabled: isOpen && isEdit });
  const createMutation = useCreateReferringDoctor();
  const updateMutation = useUpdateReferringDoctor();

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

  useEffect(() => {
    if (!isOpen || !isEdit || !doctorId) return;
    const doc = detailQuery.data?.data;
    if (!doc || doc.id !== doctorId) return;

    setFormData({
      doctorName: doc.doctorName,
      branchId: doc.branchId != null && doc.branchId > 0 ? doc.branchId : 0,
      specialization: doc.specialization ?? '',
      hospitalName: doc.hospitalName ?? '',
      username: '',
      password: '',
      doctorEmail: doc.doctorEmail ?? '',
      doctorPhone: doc.doctorPhone ?? '',
      isVerified: true,
      role: 'DOCTOR',
      isActive: doc.isActive,
    });
  }, [isOpen, isEdit, doctorId, detailQuery.data?.data]);

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
    if (!formData.doctorName.trim()) next.doctorName = 'Doctor name is required';

    if (!isEdit) {
      if (!formData.branchId || formData.branchId < 1) next.branchId = 'Branch is required';
      if (!formData.specialization.trim()) next.specialization = 'Specialization is required';
      if (!formData.hospitalName.trim()) next.hospitalName = 'Hospital name is required';
      if (!formData.username.trim()) next.username = 'Username is required';
      if (!formData.password) next.password = 'Password is required';
      else if (formData.password.length < 6) next.password = 'Password must be at least 6 characters';
      if (!formData.doctorPhone.trim()) next.doctorPhone = 'Phone is required';
      const email = formData.doctorEmail.trim();
      if (!email) next.doctorEmail = 'Email is required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.doctorEmail = 'Enter a valid email';
    } else {
      const email = formData.doctorEmail.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.doctorEmail = 'Enter a valid email';
    }

    const others = doctorsForDuplicateCheck?.filter((d) => !isEdit || d.id !== doctorId) ?? [];
    const emailTrim = formData.doctorEmail.trim();
    if (emailTrim && !next.doctorEmail) {
      const em = normalizeEmail(emailTrim);
      const emailDup = others.some(
        (d) =>
          d.doctorEmail != null &&
          String(d.doctorEmail).trim() !== '' &&
          normalizeEmail(String(d.doctorEmail)) === em
      );
      if (emailDup) next.doctorEmail = DUPLICATE_EMAIL_MSG;
    }

    const mobDigits = normalizeMobileDigits(formData.doctorPhone);
    if (mobDigits.length > 0 && !next.doctorPhone) {
      const mobDup = others.some((d) => {
        const od = normalizeMobileDigits(String(d.doctorPhone ?? ''));
        return od.length > 0 && od === mobDigits;
      });
      if (mobDup) next.doctorPhone = DUPLICATE_MOBILE_MSG;
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && doctorId) {
      const payload: UpdateReferringDoctorPayload = {
        doctorName: formData.doctorName.trim(),
        specialization: formData.specialization.trim(),
        hospitalName: formData.hospitalName.trim(),
        mobile: formData.doctorPhone.trim(),
        email: formData.doctorEmail.trim(),
        isActive: formData.isActive,
        branchId: formData.branchId > 0 ? formData.branchId : null,
      };
      updateMutation.mutate(
        { id: doctorId, payload },
        {
          onSuccess: () => {
            toast.success('Referring doctor updated successfully.');
            onClose();
          },
          onError: (err) => {
            if (mapApiErrorToDuplicateFields(err, setErrors)) return;
            toast.error(getErrorMessage(err));
          },
        }
      );
      return;
    }

    const payload: CreateReferringDoctorPayload = {
      doctorName: formData.doctorName.trim(),
      branchId: formData.branchId,
      specialization: formData.specialization.trim(),
      hospitalName: formData.hospitalName.trim(),
      username: formData.username.trim(),
      password: formData.password,
      doctorEmail: formData.doctorEmail.trim(),
      doctorPhone: formData.doctorPhone.trim(),
      isVerified: formData.isVerified,
      role: formData.role,
      isActive: formData.isActive,
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Referring doctor added successfully.');
        onClose();
      },
      onError: (err) => {
        if (mapApiErrorToDuplicateFields(err, setErrors)) return;
        toast.error(getErrorMessage(err));
      },
    });
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const loadingDetail = isEdit && (detailQuery.isLoading || (detailQuery.isFetching && !detailQuery.data));

  const specializationLabel = useMemo(() => (isEdit ? 'Specialization' : 'Specialization *'), [isEdit]);
  const hospitalLabel = useMemo(() => (isEdit ? 'Hospital name' : 'Hospital name *'), [isEdit]);
  const phoneLabel = useMemo(() => (isEdit ? 'Phone' : 'Phone *'), [isEdit]);
  const emailLabel = useMemo(() => (isEdit ? 'Email' : 'Email *'), [isEdit]);
  const branchLabel = useMemo(() => (isEdit ? 'Branch' : 'Branch *'), [isEdit]);

  const footer = (
    <div className="flex gap-3 w-full">
      <Button type="button" variant="outline" onClick={onClose} className="flex-1 font-bold" disabled={pending}>
        Cancel
      </Button>
      <Button
        type="submit"
        form="referring-doctor-form"
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
          'Update doctor'
        ) : (
          'Save doctor'
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
            Edit <span className="text-emerald-200">referring doctor</span>
          </>
        ) : (
          <>
            Add <span className="text-emerald-200">referring doctor</span>
          </>
        )
      }
      description={isEdit ? 'Update referring physician details' : 'Register a new referring physician for your network'}
      footer={footer}
      maxWidth="md"
    >
      {isEdit && detailQuery.isError ? (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 flex items-center justify-between gap-2">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load doctor.'}
          </span>
          <Button type="button" variant="outline" size="sm" className="shrink-0 font-bold" onClick={() => detailQuery.refetch()}>
            Retry
          </Button>
        </div>
      ) : null}

      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading doctor…</p>
        </div>
      ) : (
        <form id="referring-doctor-form" onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="doctorName" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
              Doctor name *
            </Label>
            <Input
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              placeholder="e.g. Dr. Doctor Name"
              className={`border-slate-200 ${errors.doctorName ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.doctorName ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.doctorName}
              </p>
            ) : null}
          </div>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                {specializationLabel}
              </Label>
              <Input
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g. Specialization Name"
                className={`border-slate-200 ${errors.specialization ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.specialization ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.specialization}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="hospitalName" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                {hospitalLabel}
              </Label>
              <Input
                id="hospitalName"
                name="hospitalName"
                value={formData.hospitalName}
                onChange={handleChange}
                placeholder="e.g. Hospital Name"
                className={`border-slate-200 ${errors.hospitalName ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.hospitalName ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.hospitalName}
                </p>
              ) : null}
            </div>
          </div>

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

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="doctorPhone" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                {phoneLabel}
              </Label>
              <Input
                id="doctorPhone"
                name="doctorPhone"
                value={formData.doctorPhone}
                onChange={handleChange}
                placeholder="+91-XX-XXXX-XXXX"
                className={`border-slate-200 ${errors.doctorPhone ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.doctorPhone ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.doctorPhone}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorEmail" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                {emailLabel}
              </Label>
              <Input
                id="doctorEmail"
                name="doctorEmail"
                type="email"
                value={formData.doctorEmail}
                onChange={handleChange}
                placeholder="Email"
                autoComplete="email"
                className={`border-slate-200 ${errors.doctorEmail ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.doctorEmail ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.doctorEmail}
                </p>
              ) : null}
            </div>
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
              Active (can receive referrals)
            </Label>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}
