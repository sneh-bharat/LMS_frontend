'use client';

import { useEffect, type ReactNode } from 'react';
import { useForm, type UseFormSetError } from 'react-hook-form';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Label, Button } from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
  buildUpdateTenantPayload,
  countPhoneDigits,
  isTenantMutationSuccess,
  SUBSCRIPTION_PLAN_OPTIONS,
  type TenantApiResponse,
  type TenantDetail,
} from '@/app/Apis/tenant/tenantApi';
import { useTenantById, useUpdateTenant } from '@/app/Apis/tenant/useTenants';

interface EditTenantProps {
  isOpen: boolean;
  tenantId: number | null;
  onSuccess?: () => void;
  onClose: () => void;
}

type EditTenantFormValues = {
  tenantName: string;
  companyName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  adminEmail: string;
  subscriptionPlan: string;
  maxBranches: string;
  maxUsersPerBranch: string;
  isActive: boolean;
};

const defaultValues: EditTenantFormValues = {
  tenantName: '',
  companyName: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
  city: '',
  state: '',
  country: '',
  postalCode: '',
  adminEmail: '',
  subscriptionPlan: '',
  maxBranches: '',
  maxUsersPerBranch: '',
  isActive: true,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_INPUT_PATTERN = /^[0-9+\-\s()]*$/;

function tenantDetailToFormValues(tenant: TenantDetail): EditTenantFormValues {
  return {
    tenantName: tenant.tenantName?.trim() ?? '',
    companyName: tenant.companyName?.trim() ?? '',
    contactEmail: tenant.contactEmail?.trim() ?? '',
    contactPhone: tenant.contactPhone?.trim() ?? '',
    address: tenant.address?.trim() ?? '',
    city: tenant.city?.trim() ?? '',
    state: tenant.state?.trim() ?? '',
    country: tenant.country?.trim() ?? '',
    postalCode: tenant.postalCode?.trim() ?? '',
    adminEmail: tenant.adminEmail?.trim() ?? '',
    subscriptionPlan: tenant.subscriptionPlan?.trim().toUpperCase() ?? '',
    maxBranches: tenant.maxBranches != null ? String(tenant.maxBranches) : '',
    maxUsersPerBranch:
      tenant.maxUsersPerBranch != null ? String(tenant.maxUsersPerBranch) : '',
    isActive: tenant.isActive,
  };
}

function validateContactPhone(value: string): true | string {
  const trimmed = value.trim();
  if (!trimmed) return 'Contact phone is required.';
  if (!PHONE_INPUT_PATTERN.test(trimmed)) {
    return 'Enter a valid phone number (digits only).';
  }

  const digitCount = countPhoneDigits(trimmed);
  if (digitCount < 10) return 'Phone number must be at least 10 digits.';
  if (digitCount > 15) return 'Phone number cannot exceed 15 digits.';
  return true;
}

function formatFieldErrors(fieldErrors: unknown): string | null {
  if (!fieldErrors) return null;

  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    const first = fieldErrors[0] as { message?: string; defaultMessage?: string; field?: string };
    const detail = first.message ?? first.defaultMessage;
    if (typeof detail === 'string') {
      return first.field ? `${first.field}: ${detail}` : detail;
    }
  }

  if (typeof fieldErrors === 'object' && fieldErrors !== null) {
    const entries = Object.entries(fieldErrors as Record<string, unknown>);
    if (entries.length > 0) {
      const [field, detail] = entries[0];
      if (typeof detail === 'string') return `${field}: ${detail}`;
    }
  }

  return null;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const o = err as Record<string, unknown>;

    const responseData = (o.response as { data?: Record<string, unknown> } | undefined)?.data;
    const nestedData =
      responseData && typeof responseData.data === 'object' && responseData.data !== null
        ? (responseData.data as Record<string, unknown>)
        : responseData;

    const fieldMessage = formatFieldErrors(
      nestedData?.fieldErrors ?? nestedData?.errors ?? responseData?.fieldErrors
    );
    if (fieldMessage) return fieldMessage;

    if (responseData) {
      if (typeof responseData.message === 'string' && responseData.message.trim()) {
        return responseData.message;
      }
      if (typeof responseData.error === 'string' && responseData.error.trim()) {
        return responseData.error;
      }
    }

    if (typeof o.message === 'string' && o.message !== 'Request failed with status code 400') {
      return o.message;
    }
  }

  if (err instanceof Error) return err.message;
  return 'Failed to update tenant.';
}

function mapApiMessageToField(
  message: string,
  setError: UseFormSetError<EditTenantFormValues>
): boolean {
  const lower = message.toLowerCase();
  const looksDuplicate =
    lower.includes('duplicate') ||
    lower.includes('already exist') ||
    lower.includes('already exists') ||
    lower.includes('already registered') ||
    lower.includes('already in use') ||
    lower.includes('unique') ||
    lower.includes('constraint');

  if (lower.includes('admin') && lower.includes('email')) {
    setError('adminEmail', { type: 'server', message });
    return true;
  }

  if (lower.includes('contact') && lower.includes('email')) {
    setError('contactEmail', { type: 'server', message });
    return true;
  }

  if (looksDuplicate && lower.includes('email')) {
    setError('adminEmail', { type: 'server', message });
    return true;
  }

  return false;
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pt-2 border-t border-slate-100 first:border-t-0 first:pt-0">
      {children}
    </h3>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-rose-600 flex items-center gap-1">
      <AlertCircle size={12} aria-hidden />
      {message}
    </p>
  );
}

export default function EditTenant({ isOpen, tenantId, onSuccess, onClose }: EditTenantProps) {
  const updateMutation = useUpdateTenant();
  const detailQuery = useTenantById(tenantId, {
    enabled: isOpen && tenantId != null && tenantId > 0,
  });

  const tenant = detailQuery.data?.data;
  const loadingDetail =
    !!tenantId &&
    (detailQuery.isLoading || (detailQuery.isFetching && !detailQuery.data));

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<EditTenantFormValues>({
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (isOpen && tenant) {
      reset(tenantDetailToFormValues(tenant));
    } else if (!isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, tenant, reset]);

  const onSubmit = (values: EditTenantFormValues) => {
    if (!tenantId || tenantId <= 0) return;

    let payload;
    try {
      payload = buildUpdateTenantPayload(values);
    } catch (err) {
      toast.error(getErrorMessage(err));
      return;
    }

    if (
      !Number.isFinite(payload.maxBranches) ||
      payload.maxBranches! <= 0 ||
      !Number.isFinite(payload.maxUsersPerBranch) ||
      payload.maxUsersPerBranch! <= 0
    ) {
      toast.error('Max branches and max users per branch must be positive numbers.');
      return;
    }

    if (!payload.contactPhone || payload.contactPhone.length < 10) {
      toast.error('Contact phone must contain at least 10 digits.');
      return;
    }

    updateMutation.mutate(
      { tenantId, payload },
      {
        onSuccess: (res: TenantApiResponse) => {
          if (!isTenantMutationSuccess(res)) {
            const message = res.message?.trim() || 'Failed to update tenant.';
            if (mapApiMessageToField(message, setError)) return;
            toast.error(message);
            return;
          }

          toast.success(res.message?.trim() || 'Tenant updated successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err: unknown) => {
          const message = getErrorMessage(err);
          if (mapApiMessageToField(message, setError)) return;
          toast.error(message);
        },
      }
    );
  };

  const pending = updateMutation.isPending;

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1 font-bold"
        disabled={pending}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="edit-tenant-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || loadingDetail || detailQuery.isError || !tenant}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Saving…
          </span>
        ) : (
          'Save changes'
        )}
      </Button>
    </div>
  );

  const inputClass = (hasError: boolean) =>
    `border-slate-200 ${hasError ? 'border-rose-300' : ''}`;

  const labelClass = 'text-xs font-bold text-slate-700 uppercase tracking-widest';

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Edit <span className="text-emerald-200">tenant</span>
        </>
      }
      description={
        tenant
          ? `${tenant.tenantName} · ID ${tenant.id}`
          : 'Update tenant organization details'
      }
      footer={footer}
      maxWidth="xl"
    >
      {loadingDetail ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Loading tenant details…</p>
        </div>
      ) : detailQuery.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-rose-500 shrink-0" aria-hidden />
          <p className="text-sm font-semibold text-rose-800">
            {detailQuery.error?.message || 'Failed to load tenant details.'}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-bold bg-white"
            onClick={() => detailQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : tenant ? (
        <form
          id="edit-tenant-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          {tenant.domain?.trim() ? (
            <div className="space-y-2">
              <Label className={labelClass}>Domain</Label>
              <Input
                value={tenant.domain.trim()}
                disabled
                className="border-slate-200 bg-slate-50 text-slate-600"
              />
            </div>
          ) : null}

          <SectionTitle>Tenant Information</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-tenantName" className={labelClass}>
                Tenant Name *
              </Label>
              <Input
                id="edit-tenantName"
                placeholder="Tenant name"
                className={inputClass(Boolean(errors.tenantName))}
                disabled={pending}
                {...register('tenantName', {
                  required: 'Tenant name is required.',
                  minLength: { value: 3, message: 'Tenant name must be at least 3 characters.' },
                  setValueAs: (v: string) => v.trimStart(),
                })}
              />
              <FieldError message={errors.tenantName?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-companyName" className={labelClass}>
                Company Name *
              </Label>
              <Input
                id="edit-companyName"
                placeholder="Company name"
                className={inputClass(Boolean(errors.companyName))}
                disabled={pending}
                {...register('companyName', {
                  required: 'Company name is required.',
                  validate: (v) => v.trim().length > 0 || 'Company name is required.',
                })}
              />
              <FieldError message={errors.companyName?.message} />
            </div>
          </div>

          <SectionTitle>Contact Information</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-contactEmail" className={labelClass}>
                Contact Email *
              </Label>
              <Input
                id="edit-contactEmail"
                type="email"
                placeholder="contact@company.com"
                autoComplete="email"
                className={inputClass(Boolean(errors.contactEmail))}
                disabled={pending}
                {...register('contactEmail', {
                  required: 'Contact email is required.',
                  pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
                  onChange: () => clearErrors('contactEmail'),
                })}
              />
              <FieldError message={errors.contactEmail?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-contactPhone" className={labelClass}>
                Contact Phone *
              </Label>
              <Input
                id="edit-contactPhone"
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                autoComplete="tel"
                className={inputClass(Boolean(errors.contactPhone))}
                disabled={pending}
                {...register('contactPhone', {
                  required: 'Contact phone is required.',
                  validate: validateContactPhone,
                })}
              />
              <FieldError message={errors.contactPhone?.message} />
            </div>
          </div>

          <SectionTitle>Address Information</SectionTitle>
          <div className="space-y-2">
            <Label htmlFor="edit-address" className={labelClass}>
              Address *
            </Label>
            <Input
              id="edit-address"
              placeholder="Street address"
              className={inputClass(Boolean(errors.address))}
              disabled={pending}
              {...register('address', {
                required: 'Address is required.',
                validate: (v) => v.trim().length > 0 || 'Address is required.',
              })}
            />
            <FieldError message={errors.address?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-city" className={labelClass}>
                City *
              </Label>
              <Input
                id="edit-city"
                placeholder="City"
                className={inputClass(Boolean(errors.city))}
                disabled={pending}
                {...register('city', {
                  required: 'City is required.',
                  validate: (v) => v.trim().length > 0 || 'City is required.',
                })}
              />
              <FieldError message={errors.city?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-state" className={labelClass}>
                State *
              </Label>
              <Input
                id="edit-state"
                placeholder="State"
                className={inputClass(Boolean(errors.state))}
                disabled={pending}
                {...register('state', {
                  required: 'State is required.',
                  validate: (v) => v.trim().length > 0 || 'State is required.',
                })}
              />
              <FieldError message={errors.state?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-country" className={labelClass}>
                Country *
              </Label>
              <Input
                id="edit-country"
                placeholder="Country"
                className={inputClass(Boolean(errors.country))}
                disabled={pending}
                {...register('country', {
                  required: 'Country is required.',
                  validate: (v) => v.trim().length > 0 || 'Country is required.',
                })}
              />
              <FieldError message={errors.country?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-postalCode" className={labelClass}>
                Postal Code *
              </Label>
              <Input
                id="edit-postalCode"
                placeholder="Postal code"
                className={inputClass(Boolean(errors.postalCode))}
                disabled={pending}
                {...register('postalCode', {
                  required: 'Postal code is required.',
                  validate: (v) => v.trim().length > 0 || 'Postal code is required.',
                })}
              />
              <FieldError message={errors.postalCode?.message} />
            </div>
          </div>

          <SectionTitle>Admin Information</SectionTitle>
          <div className="space-y-2">
            <Label htmlFor="edit-adminEmail" className={labelClass}>
              Admin Email *
            </Label>
            <Input
              id="edit-adminEmail"
              type="email"
              placeholder="admin@company.com"
              autoComplete="email"
              className={inputClass(Boolean(errors.adminEmail))}
              disabled={pending}
              {...register('adminEmail', {
                required: 'Admin email is required.',
                pattern: { value: EMAIL_PATTERN, message: 'Enter a valid email address.' },
                onChange: () => clearErrors('adminEmail'),
              })}
            />
            <FieldError message={errors.adminEmail?.message} />
          </div>

          <SectionTitle>Subscription Information</SectionTitle>
          <div className="space-y-2">
            <Label htmlFor="edit-subscriptionPlan" className={labelClass}>
              Subscription Plan *
            </Label>
            <select
              id="edit-subscriptionPlan"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                errors.subscriptionPlan ? 'border-rose-300' : 'border-input'
              }`}
              disabled={pending}
              {...register('subscriptionPlan', {
                required: 'Subscription plan is required.',
              })}
            >
              <option value="" disabled>
                Select plan
              </option>
              {SUBSCRIPTION_PLAN_OPTIONS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan}
                </option>
              ))}
            </select>
            <FieldError message={errors.subscriptionPlan?.message} />
          </div>

          <SectionTitle>Limits &amp; Capacity</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-maxBranches" className={labelClass}>
                Max Branches *
              </Label>
              <Input
                id="edit-maxBranches"
                type="number"
                min={1}
                step={1}
                placeholder="Enter Max Branches"
                className={inputClass(Boolean(errors.maxBranches))}
                disabled={pending}
                {...register('maxBranches', {
                  required: 'Max branches is required.',
                  validate: (v) => {
                    const num = Number(v);
                    if (!Number.isFinite(num) || num <= 0) {
                      return 'Max branches must be greater than 0.';
                    }
                    return true;
                  },
                })}
              />
              <FieldError message={errors.maxBranches?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxUsersPerBranch" className={labelClass}>
                Max Users Per Branch *
              </Label>
              <Input
                id="edit-maxUsersPerBranch"
                type="number"
                min={1}
                step={1}
                placeholder="Enter Max Users Per Branch"
                className={inputClass(Boolean(errors.maxUsersPerBranch))}
                disabled={pending}
                {...register('maxUsersPerBranch', {
                  required: 'Max users per branch is required.',
                  validate: (v) => {
                    const num = Number(v);
                    if (!Number.isFinite(num) || num <= 0) {
                      return 'Max users per branch must be greater than 0.';
                    }
                    return true;
                  },
                })}
              />
              <FieldError message={errors.maxUsersPerBranch?.message} />
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="edit-isActive"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
              {...register('isActive')}
            />
            <Label
              htmlFor="edit-isActive"
              className="text-sm font-semibold text-slate-800 cursor-pointer mb-0"
            >
              Active tenant
            </Label>
          </div>
        </form>
      ) : null}
    </RightDrawer>
  );
}
