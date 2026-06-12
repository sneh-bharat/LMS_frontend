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
  isAdministratorMutationSuccess,
  type AdministratorApiResponse,
} from '@/app/Apis/administrator/AdministratorApis';
import { useCreateAdministrator } from '@/app/Apis/administrator/useAdministrator';

interface AddNewAdminProps {
  isOpen: boolean;
  onSuccess?: () => void;
  onClose: () => void;
}

const PHONE_PATTERN = /^[0-9+\-\s()]+$/;

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
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  phone: z
    .string()
    .min(1, 'Phone is required.')
    .refine((v) => PHONE_PATTERN.test(v.trim()), {
      message: 'Enter a valid phone number (digits, +, spaces, or dashes only).',
    })
    .refine((v) => {
      const digits = v.replace(/\D/g, '').length;
      return digits >= 10 && digits <= 11;
    }, {
      message: 'Phone number must be between 10 and 11 digits.',
    }),
  adminType: z.enum(['SUPER_ADMIN', 'ADMIN'], {
    message: 'Admin type is required.',
  }),
  isVerified: z.boolean(),
});

type AddAdminFormValues = z.infer<typeof addAdminSchema>;

const defaultValues: AddAdminFormValues = {
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

function getErrorMessage(err: unknown): string {
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
  return 'Failed to create administrator.';
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

export default function AddNewAdmin({ isOpen, onSuccess, onClose }: AddNewAdminProps) {
  const router = useRouter();
  const createMutation = useCreateAdministrator();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddAdminFormValues>({
    resolver: zodResolver(addAdminSchema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    if (isOpen) {
      reset(defaultValues);
    }
  }, [isOpen, reset]);

  const onSubmit = (values: AddAdminFormValues) => {
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
        toast.error(getErrorMessage(err));
      },
    });
  };

  const pending = createMutation.isPending;

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
        form="add-new-admin-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Creating…
          </span>
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
        <>
          Add <span className="text-emerald-200">new admin</span>
        </>
      }
      description="Register a new administrator account"
      footer={footer}
      maxWidth="lg"
    >
      <form
        id="add-new-admin-form"
        onSubmit={handleSubmit(onSubmit)}
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
            className={inputClass(Boolean(errors.fullName))}
            disabled={pending}
            {...register('fullName')}
          />
          <FieldError message={errors.fullName?.message} />
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
              className={inputClass(Boolean(errors.email))}
              disabled={pending}
              {...register('email')}
            />
            <FieldError message={errors.email?.message} />
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
              className={inputClass(Boolean(errors.phone))}
              disabled={pending}
              {...register('phone')}
            />
            <FieldError message={errors.phone?.message} />
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
              className={inputClass(Boolean(errors.username))}
              disabled={pending}
              {...register('username')}
            />
            <FieldError message={errors.username?.message} />
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
              className={inputClass(Boolean(errors.password))}
              disabled={pending}
              {...register('password')}
            />
            <FieldError message={errors.password?.message} />
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
              errors.adminType ? 'border-rose-300' : 'border-input'
            }`}
            disabled={pending}
            {...register('adminType')}
          >
            {ADMIN_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <FieldError message={errors.adminType?.message} />
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/80 px-4 py-3">
          <input
            id="isVerified"
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            disabled={pending}
            {...register('isVerified')}
          />
          <Label htmlFor="isVerified" className="text-sm font-semibold text-slate-800 cursor-pointer mb-0">
            Verified account
          </Label>
        </div>
      </form>
    </RightDrawer>
  );
}
