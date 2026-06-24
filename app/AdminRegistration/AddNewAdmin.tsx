'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Input, Label, Button } from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import {
  ADMIN_TYPE_OPTIONS,
  buildCreateAdministratorPayload,
  buildUpdateAdministratorPayload,
  isAdministratorMutationSuccess,
  type AdminTypeOption,
  type AdministratorApiResponse,
} from '@/app/Apis/administrator/AdministratorApis';
import {
  useCreateAdministrator,
  useUpdateAdministrator,
} from '@/app/Apis/administrator/useAdministrator';

export interface AdminEditInitial {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  adminType: AdminTypeOption;
  isVerified: boolean;
  isActive: boolean;
}

interface AddNewAdminProps {
  isOpen: boolean;
  editAdmin?: AdminEditInitial | null;
  onSuccess?: () => void;
  onClose: () => void;
}

const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

const phoneSchema = z
  .string()
  .min(1, 'Phone is required.')
  .refine((v) => PHONE_PATTERN.test(v.trim()), {
    message: 'Enter a valid phone number (digits, +, spaces, or dashes only).',
  })
  .refine(
    (v) => {
      const digits = v.replace(/\D/g, '').length;
      return digits >= 10 && digits <= 11;
    },
    { message: 'Phone number must be between 10 and 11 digits.' }
  );

const addAdminSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required.')
    .min(3, 'Username must be at least 3 characters.')
    .max(50, 'Username cannot exceed 50 characters.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .min(8, 'Password must be at least 8 characters.'),
  fullName: z
    .string()
    .min(1, 'Full name is required.')
    .min(2, 'Full name must be at least 2 characters.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: phoneSchema,
  adminType: z.enum(['SUPER_ADMIN', 'ADMIN'], {
    message: 'Admin type is required.',
  }),
  isVerified: z.boolean(),
});

const editAdminSchema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required.')
    .min(2, 'Full name must be at least 2 characters.'),
  email: z.string().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: phoneSchema,
  adminType: z.enum(['SUPER_ADMIN', 'ADMIN'], {
    message: 'Admin type is required.',
  }),
  isVerified: z.boolean(),
  isActive: z.boolean(),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;
type EditAdminFormValues = z.infer<typeof editAdminSchema>;

const createDefaultValues: AddAdminFormValues = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  adminType: 'SUPER_ADMIN',
  isVerified: true,
};

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

function getErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error) return err.message;
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

    if (typeof o.message === 'string' && o.message !== 'Request failed with status code 400') {
      return o.message;
    }

    if (responseData) {
      if (typeof responseData.message === 'string') return responseData.message;
      if (typeof responseData.error === 'string') return responseData.error;
    }
  }
  return fallback;
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

function toEditFormValues(admin: AdminEditInitial): EditAdminFormValues {
  const adminType: AdminTypeOption =
    admin.adminType === 'ADMIN' ? 'ADMIN' : 'SUPER_ADMIN';

  return {
    fullName: admin.fullName === '-' ? '' : admin.fullName,
    email: admin.email === '-' ? '' : admin.email,
    phone: admin.phone === '-' ? '' : admin.phone,
    adminType,
    isVerified: admin.isVerified,
    isActive: admin.isActive,
  };
}

export default function AddNewAdmin({
  isOpen,
  editAdmin = null,
  onSuccess,
  onClose,
}: AddNewAdminProps) {
  const router = useRouter();
  const isEdit = editAdmin != null;
  const createMutation = useCreateAdministrator();
  const updateMutation = useUpdateAdministrator();

  const createForm = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues: createDefaultValues,
    mode: 'onBlur',
  });

  const editForm = useForm<EditAdminFormValues>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: toEditFormValues(
      editAdmin ?? {
        id: 0,
        fullName: '',
        email: '',
        phone: '',
        adminType: 'SUPER_ADMIN',
        isVerified: true,
        isActive: true,
      }
    ),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!isOpen) return;
    if (isEdit && editAdmin) {
      editForm.reset(toEditFormValues(editAdmin));
      return;
    }
    createForm.reset(createDefaultValues);
  }, [isOpen, isEdit, editAdmin, createForm, editForm]);

  const onCreateSubmit = (values: AddAdminFormValues) => {
    const payload = buildCreateAdministratorPayload(values);

    createMutation.mutate(payload, {
      onSuccess: (res: AdministratorApiResponse) => {
        if (!isAdministratorMutationSuccess(res)) {
          toast.error(res.message || 'Failed to create administrator.');
          return;
        }

        toast.success(res.message?.trim() || 'Administrator created successfully.');
        onSuccess?.();
        onClose();
        router.push('/AdminRegistration');
      },
      onError: (err: unknown) => {
        toast.error(getErrorMessage(err, 'Failed to create administrator.'));
      },
    });
  };

  const onEditSubmit = (values: EditAdminFormValues) => {
    if (!editAdmin) return;

    const payload = buildUpdateAdministratorPayload(values);

    updateMutation.mutate(
      { id: editAdmin.id, payload },
      {
        onSuccess: (res: AdministratorApiResponse) => {
          if (!isAdministratorMutationSuccess(res)) {
            toast.error(res.message || 'Failed to update administrator.');
            return;
          }

          toast.success(res.message?.trim() || 'Administrator updated successfully.');
          onSuccess?.();
          onClose();
        },
        onError: (err: unknown) => {
          toast.error(getErrorMessage(err, 'Failed to update administrator.'));
        },
      }
    );
  };

  const pending = createMutation.isPending || updateMutation.isPending;
  const createErrors = createForm.formState.errors;
  const editErrors = editForm.formState.errors;

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
        form={isEdit ? 'edit-admin-form' : 'add-new-admin-form'}
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            {isEdit ? 'Saving…' : 'Creating…'}
          </span>
        ) : isEdit ? (
          'Save changes'
        ) : (
          'Create admin'
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
        isEdit ? (
          <>
            Edit <span className="text-emerald-200">admin</span>
          </>
        ) : (
          <>
            Add <span className="text-emerald-200">new admin</span>
          </>
        )
      }
      description={
        isEdit
          ? 'Update administrator details and status'
          : 'Register a new administrator account'
      }
      footer={footer}
      maxWidth="lg"
    >
      {isEdit ? (
        <form
          id="edit-admin-form"
          onSubmit={editForm.handleSubmit(onEditSubmit)}
          className="space-y-6"
          noValidate
        >
          <SectionTitle>Personal Information</SectionTitle>
          <div className="space-y-2">
            <Label htmlFor="edit-fullName" className={labelClass}>
              Full Name *
            </Label>
            <Input
              id="edit-fullName"
              placeholder="Admin User Full Name"
              className={inputClass(Boolean(editErrors.fullName))}
              disabled={pending}
              {...editForm.register('fullName')}
            />
            <FieldError message={editErrors.fullName?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-email" className={labelClass}>
                Email *
              </Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter Email"
                autoComplete="email"
                className={inputClass(Boolean(editErrors.email))}
                disabled={pending}
                {...editForm.register('email')}
              />
              <FieldError message={editErrors.email?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone" className={labelClass}>
                Phone *
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                inputMode="tel"
                placeholder="+91-XX-XXXX-XXXX"
                autoComplete="tel"
                className={inputClass(Boolean(editErrors.phone))}
                disabled={pending}
                {...editForm.register('phone')}
              />
              <FieldError message={editErrors.phone?.message} />
            </div>
          </div>

          <SectionTitle>Admin Settings</SectionTitle>
          <div className="space-y-2">
            <Label htmlFor="edit-adminType" className={labelClass}>
              Admin Type *
            </Label>
            <select
              id="edit-adminType"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                editErrors.adminType ? 'border-rose-300' : 'border-input'
              }`}
              disabled={pending}
              {...editForm.register('adminType')}
            >
              {ADMIN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={editErrors.adminType?.message} />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="edit-isVerified"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
              {...editForm.register('isVerified')}
            />
            <Label htmlFor="edit-isVerified" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Verified account
            </Label>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="edit-isActive"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
              {...editForm.register('isActive')}
            />
            <Label htmlFor="edit-isActive" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Active account
            </Label>
          </div>
        </form>
      ) : (
        <form
          id="add-new-admin-form"
          onSubmit={createForm.handleSubmit(onCreateSubmit)}
          className="space-y-6"
          noValidate
        >
          <SectionTitle>Personal Information</SectionTitle>
          <div className="space-y-2">
            <Label htmlFor="fullName" className={labelClass}>
              Full Name *
            </Label>
            <Input
              id="fullName"
              placeholder="Admin User Full Name"
              className={inputClass(Boolean(createErrors.fullName))}
              disabled={pending}
              {...createForm.register('fullName')}
            />
            <FieldError message={createErrors.fullName?.message} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass}>
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                autoComplete="email"
                className={inputClass(Boolean(createErrors.email))}
                disabled={pending}
                {...createForm.register('email')}
              />
              <FieldError message={createErrors.email?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className={labelClass}>
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="+91-XX-XXXX-XXXX"
                autoComplete="tel"
                className={inputClass(Boolean(createErrors.phone))}
                disabled={pending}
                {...createForm.register('phone')}
              />
              <FieldError message={createErrors.phone?.message} />
            </div>
          </div>
          <SectionTitle>Account Information</SectionTitle>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="username" className={labelClass}>
                Username *
              </Label>
              <Input
                id="username"
                placeholder="Enter Username"
                autoComplete="username"
                className={inputClass(Boolean(createErrors.username))}
                disabled={pending}
                {...createForm.register('username')}
              />
              <FieldError message={createErrors.username?.message} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className={labelClass}>
                Password *
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className={inputClass(Boolean(createErrors.password))}
                disabled={pending}
                {...createForm.register('password')}
              />
              <FieldError message={createErrors.password?.message} />
            </div>
          </div>

          <SectionTitle>Admin Settings</SectionTitle>
          <div className="space-y-2">
            <Label htmlFor="adminType" className={labelClass}>
              Admin Type *
            </Label>
            <select
              id="adminType"
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                createErrors.adminType ? 'border-rose-300' : 'border-input'
              }`}
              disabled={pending}
              {...createForm.register('adminType')}
            >
              {ADMIN_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <FieldError message={createErrors.adminType?.message} />
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
            <input
              id="isVerified"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              disabled={pending}
              {...createForm.register('isVerified')}
            />
            <Label htmlFor="isVerified" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
              Verified account
            </Label>
          </div>
        </form>
      )}
    </RightDrawer>
  );
}
