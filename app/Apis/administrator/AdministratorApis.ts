import adminAxios from './axios';

export type AdminTypeOption = 'SUPER_ADMIN' | 'ADMIN';

export interface CreateAdministratorPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  adminType: AdminTypeOption;
  isVerified: boolean;
}

export interface AdministratorApiResponse {
  data?: unknown;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export const ADMIN_TYPE_OPTIONS: { value: AdminTypeOption; label: string }[] = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'ADMIN', label: 'Admin' },
];

export function normalizeAdminPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  return trimmed;
}

export function buildCreateAdministratorPayload(
  values: CreateAdministratorPayload
): CreateAdministratorPayload {
  return {
    username: values.username.trim(),
    password: values.password,
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: normalizeAdminPhone(values.phone),
    adminType: values.adminType,
    isVerified: values.isVerified,
  };
}

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/auth/register/administrator`
 */
export async function createAdministrator(
  payload: CreateAdministratorPayload
): Promise<AdministratorApiResponse> {
  return adminAxios.post(
    '/api/v1/auth/register/administrator',
    payload
  ) as Promise<AdministratorApiResponse>;
}

export function isAdministratorMutationSuccess(res: AdministratorApiResponse): boolean {
  return res.response === true;
}
