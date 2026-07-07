'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { branchApi, type Branch } from '@/app/Apis/branch/branchApi';
import {
  getReferrerName,
  getReferrerPhone,
  showOnReportToFormValue,
} from '@/app/Apis/Referrer/referrerApi';
import {
  useCreateReferrer,
  useReferrerById,
  useUpdateReferrer,
} from '@/app/Apis/Referrer/useReferrer';

export interface AddReferrerProps {
  isOpen?: boolean;
  /** When set, loads GET `/api/v1/referrers/{id}` and submits PUT on save. */
  referrerId?: number | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const initialForm = {
  branchId: 0,
  name: '',
  mobile: '',
  address: '',
  email: '',
  phone: '',
  showOnReport: 'Yes' as 'Yes' | 'No',
  isActive: true,
  username: '',
  password: '',
};

const PHONE_MAX_DIGITS = 11;
const PHONE_MIN_DIGITS = 10;

function sanitizeAlphabeticInput(value: string): string {
  return value.replace(/[^A-Za-z ]/g, '');
}

function sanitizePhoneInput(value: string): string {
  return value.replace(/\D/g, '').slice(0, PHONE_MAX_DIGITS);
}

function getErrorMessage(err: unknown, isEdit: boolean): string {
  if (err instanceof Error) return err.message;
  if (typeof err === 'object' && err !== null && 'message' in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }
  return isEdit ? 'Failed to update referrer.' : 'Failed to create referrer.';
}

export default function AddReferrer({
  isOpen = true,
  referrerId,
  onSuccess,
  onClose,
}: AddReferrerProps) {
  const isEdit = Boolean(referrerId != null && referrerId > 0);

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const detailQuery = useReferrerById(referrerId, { enabled: isOpen && isEdit });
  const createMutation = useCreateReferrer();
  const updateMutation = useUpdateReferrer();

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoadingBranches(true);
    branchApi
      .getAllBranches({ pageNo: 0, pageSize: 200 })
      .then((res) => {
        if (cancelled) return;
        const list = res?.data?.content ?? [];
        setBranches(list);
        if (!isEdit && list[0]?.id) {
          setForm((prev) => (prev.branchId ? prev : { ...prev, branchId: list[0].id }));
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load branches.');
      })
      .finally(() => {
        if (!cancelled) setLoadingBranches(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, isEdit]);

  useEffect(() => {
    if (!isOpen || !isEdit || !referrerId) return;
    const referrer = detailQuery.data?.data;
    if (!referrer || referrer.id !== referrerId) return;

    const phone = getReferrerPhone(referrer);
    const rawName = getReferrerName(referrer) === '—' ? '' : getReferrerName(referrer);
    const rawMobile = referrer.mobile?.trim() || (phone === '—' ? '' : phone);
    setForm({
      branchId: referrer.branchId != null && referrer.branchId > 0 ? referrer.branchId : 0,
      name: sanitizeAlphabeticInput(rawName),
      mobile: sanitizePhoneInput(rawMobile),
      address: referrer.address?.trim() ?? '',
      email: referrer.email?.trim() ?? '',
      phone: phone === '—' ? '' : phone,
      showOnReport: showOnReportToFormValue(referrer.showOnReport ?? referrer.showOnPrint),
      isActive: referrer.isActive ?? /^active$/i.test(referrer.status ?? ''),
      username: referrer.username?.trim() ?? '',
      password: '',
    });
  }, [isOpen, isEdit, referrerId, detailQuery.data?.data]);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!form.branchId || form.branchId < 1) next.branchId = 'Branch is required.';
    if (!form.name.trim()) next.name = 'Name is required.';
    else if (!/^[A-Za-z ]+$/.test(form.name.trim())) {
      next.name = 'Name must contain only letters.';
    }
    if (!form.email.trim()) next.email = 'Email is required.';
    if (!form.username.trim()) next.username = 'Username is required.';

    if (isEdit) {
      if (!form.phone.trim() && !form.mobile.trim()) {
        next.phone = 'Phone is required.';
      }
      if (form.password.trim() && form.password.length < 6) {
        next.password = 'Password must be at least 6 characters.';
      }
    } else {
      if (!form.mobile.trim()) next.mobile = 'Mobile is required.';
      else if (!/^\d+$/.test(form.mobile)) {
        next.mobile = 'Mobile must contain digits only.';
      } else if (form.mobile.length < PHONE_MIN_DIGITS || form.mobile.length > PHONE_MAX_DIGITS) {
        next.mobile = `Mobile must be between ${PHONE_MIN_DIGITS} and ${PHONE_MAX_DIGITS} digits.`;
      }
      if (!form.password.trim()) next.password = 'Password is required.';
      else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const phone = form.phone.trim() || form.mobile.trim();

    if (isEdit && referrerId) {
      const payload = {
        branchId: form.branchId,
        name: form.name.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        phone,
        showOnReport: form.showOnReport,
        username: form.username.trim(),
        ...(form.password.trim() ? { password: form.password } : {}),
      };

      updateMutation.mutate(
        { id: referrerId, payload },
        {
          onSuccess: (res) => {
            toast.success(res?.message?.trim() || 'Referrer updated successfully.');
            onSuccess?.();
            onClose();
          },
          onError: (err) => {
            toast.error(getErrorMessage(err, true));
          },
        }
      );
      return;
    }

    createMutation.mutate(
      {
        branchId: form.branchId,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        address: form.address.trim(),
        email: form.email.trim(),
        phone,
        showOnReport: form.showOnReport === 'Yes' ? 'true' : 'false',
        isActive: form.isActive,
        username: form.username.trim(),
        password: form.password,
        role: 'REFERRER',
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message?.trim() || 'Referrer created successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err) => {
          toast.error(getErrorMessage(err, false));
        },
      }
    );
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const loadingDetail = isEdit && (detailQuery.isLoading || (detailQuery.isFetching && !detailQuery.data?.data));

  if (loadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
        <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
        <p className="text-sm font-medium">Loading referrer…</p>
      </div>
    );
  }

  if (isEdit && detailQuery.isError) {
    return (
      <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-6 text-sm text-rose-800 flex flex-col items-center gap-3 text-center">
        <AlertCircle size={24} aria-hidden />
        <p className="font-medium">
          {detailQuery.error instanceof Error ? detailQuery.error.message : 'Failed to load referrer.'}
        </p>
        <Button type="button" variant="outline" size="sm" className="font-bold" onClick={() => detailQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Branch *</Label>
        <select
          value={form.branchId || ''}
          onChange={(e) => {
            setForm((f) => ({ ...f, branchId: Number(e.target.value) }));
            if (errors.branchId) setErrors((prev) => ({ ...prev, branchId: '' }));
          }}
          className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-semibold ${
            errors.branchId ? 'border-rose-300' : 'border-input'
          }`}
          disabled={pending || loadingBranches}
        >
          <option value="">Select branch</option>
          {branches.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.branchName}
            </option>
          ))}
        </select>
        {errors.branchId ? (
          <p className="text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle size={12} aria-hidden /> {errors.branchId}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Referrer name *</Label>
        <Input
          value={form.name}
          onChange={(e) => {
            setForm((f) => ({ ...f, name: sanitizeAlphabeticInput(e.target.value) }));
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          placeholder="Referrer Name"
          disabled={pending}
          className={errors.name ? 'border-rose-300' : ''}
        />
        {errors.name ? (
          <p className="text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle size={12} aria-hidden /> {errors.name}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Username *</Label>
          <Input
            value={form.username}
            onChange={(e) => {
              setForm((f) => ({ ...f, username: e.target.value }));
              if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
            }}
            placeholder="Username"
            disabled={pending}
            className={errors.username ? 'border-rose-300' : ''}
          />
          {errors.username ? (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> {errors.username}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Password {isEdit ? '(optional)' : '*'}
          </Label>
          <Input
            type="password"
            value={form.password}
            onChange={(e) => {
              setForm((f) => ({ ...f, password: e.target.value }));
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            placeholder={isEdit ? 'Leave blank to keep current' : '••••••••'}
            disabled={pending}
            className={errors.password ? 'border-rose-300' : ''}
          />
          {errors.password ? (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> {errors.password}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!isEdit ? (
          <div className="space-y-2">
            <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Mobile *</Label>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={PHONE_MAX_DIGITS}
              value={form.mobile}
              onChange={(e) => {
                setForm((f) => ({ ...f, mobile: sanitizePhoneInput(e.target.value) }));
                if (errors.mobile) setErrors((prev) => ({ ...prev, mobile: '' }));
              }}
              placeholder="9876543210"
              disabled={pending}
              className={errors.mobile ? 'border-rose-300' : ''}
            />
            {errors.mobile ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.mobile}
              </p>
            ) : null}
          </div>
        ) : null}
        <div className={`space-y-2 ${isEdit ? 'sm:col-span-2' : ''}`}>
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">
            Phone {isEdit ? '*' : ''}
          </Label>
          <Input
            value={form.phone}
            maxLength={PHONE_MAX_DIGITS}
            onChange={(e) => {
              setForm((f) => ({ ...f, phone: e.target.value }));
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
            }}
            placeholder='+91-XX-XXXX-XXXX'
            disabled={pending}
            className={errors.phone ? 'border-rose-300' : ''}
          />
          {errors.phone ? (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> {errors.phone}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Email *</Label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) => {
            setForm((f) => ({ ...f, email: e.target.value }));
            if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
          }}
          placeholder="Email"
          disabled={pending}
          className={errors.email ? 'border-rose-300' : ''}
        />
        {errors.email ? (
          <p className="text-xs text-rose-600 flex items-center gap-1">
            <AlertCircle size={12} aria-hidden /> {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Address</Label>
        <Input
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          placeholder="Enter address"
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Show on report</Label>
        <select
          value={form.showOnReport}
          onChange={(e) => setForm((f) => ({ ...f, showOnReport: e.target.value as 'Yes' | 'No' }))}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
          disabled={pending}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      </div>

      {!isEdit ? (
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest">Status</Label>
          <select
            value={form.isActive ? 'active' : 'inactive'}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-semibold"
            disabled={pending}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      ) : null}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1 font-bold" onClick={onClose} disabled={pending}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient" className="flex-1 font-bold" disabled={pending}>
          {pending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} aria-hidden />
              Saving…
            </span>
          ) : isEdit ? (
            'Update referrer'
          ) : (
            'Create referrer'
          )}
        </Button>
      </div>
    </form>
  );
}
