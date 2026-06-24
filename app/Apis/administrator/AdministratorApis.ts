import adminAxios from './axios';

export type AdminTypeOption = 'SUPER_ADMIN' | 'ADMIN';
export const DEFAULT_ADMIN_PAGE_SIZE = 10;

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

/** get the all administrator list data `api/v1/administrators/all?pageNo=0&pageSize=10` */
export interface AllAdministratorParams {
  pageNo?: number;
  pageSize?: number;

}
export interface AllAdministratorApiResponse {
  data?: unknown;
  items: AllAdministratorItem[];
}

export interface AllAdministratorItem {
  adminType: string;
  createdAt: string;
  email: string;
  fullName: string;
  id: number;
  isActive: boolean;
  isVerified: boolean;
  phone: string;
  role: string;
  tenantId: number;
  username: string;
}
function parseAdministratorListResponse(res: unknown): AllAdministratorApiResponse {
  const raw = res as { data?: unknown };

  const listFromDirect = Array.isArray(raw) ? raw : null;
  const listFromData = Array.isArray(raw?.data) ? raw.data : null;
  const listFromContent =
    raw?.data && typeof raw.data === 'object' && Array.isArray((raw.data as { content?: unknown }).content)
      ? (raw.data as { content: AllAdministratorItem[] }).content
      : null;
  const items = (listFromDirect || listFromData || listFromContent || []) as AllAdministratorItem[];

  return { data: raw?.data, items };
}

export async function fetchAllAdministrators(
  params: AllAdministratorParams
): Promise<AllAdministratorApiResponse> {
  const { pageNo = 0, pageSize = DEFAULT_ADMIN_PAGE_SIZE } = params;
  const res = await adminAxios.get(`/api/v1/administrators/all?pageNo=${pageNo}&pageSize=${pageSize}`) as unknown;
  return parseAdministratorListResponse(res);
}

/** get the active administrator list data `api/v1/administrators/active?pageNo=0&pageSize=10` */
export type ActiveAdministratorApiResponse = AllAdministratorApiResponse;

export async function fetchActiveAdministrators(
  params: AllAdministratorParams
): Promise<ActiveAdministratorApiResponse> {
  const { pageNo = 0, pageSize = DEFAULT_ADMIN_PAGE_SIZE } = params;
  const res = await adminAxios.get(`/api/v1/administrators/active?pageNo=${pageNo}&pageSize=${pageSize}`) as unknown;
  return parseAdministratorListResponse(res);
}

/** get the verified administrator list data `api/v1/administrators/verified?pageNo=0&pageSize=10` */

export async function fetchVerifiedAdministrators(
  params: AllAdministratorParams
): Promise<ActiveAdministratorApiResponse> {
  const { pageNo = 0, pageSize = DEFAULT_ADMIN_PAGE_SIZE } = params;
  const res = await adminAxios.get(`/api/v1/administrators/verified?pageNo=${pageNo}&pageSize=${pageSize}`) as unknown;
  return parseAdministratorListResponse(res);
}

/**  PUT update the administrator status `api/v1/administrators/1 */
export interface UpdateAdministratorStatusPayload {
  fullName: string;
  email: string;
  phone: string;
  adminType: AdminTypeOption;
  isVerified: boolean;
  isActive: boolean;
}


export function buildUpdateAdministratorPayload(
  values: UpdateAdministratorStatusPayload
): UpdateAdministratorStatusPayload {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: normalizeAdminPhone(values.phone),
    adminType: values.adminType,
    isVerified: values.isVerified,
    isActive: values.isActive,
  };
}

export async function updateAdministratorStatus(
  id: number,
  payload: UpdateAdministratorStatusPayload
): Promise<AdministratorApiResponse> {
  const res = await adminAxios.put(`/api/v1/administrators/${id}`, payload) as unknown;
  return res as AdministratorApiResponse;
}


/** GET administrator by username `api/v1/administrators/username/{username}` */
export interface SearchedAdministratorParams {
  username: string;
}

export interface SearchedAdministratorApiResponse {
  data?: AllAdministratorItem;
  items: AllAdministratorItem[];
}

export async function fetchSearchedAdministrators(
  params: SearchedAdministratorParams
): Promise<SearchedAdministratorApiResponse> {
  const username = params.username.trim();
  if (!username) {
    return { items: [] };
  }

  const encoded = encodeURIComponent(username);
  const res = await adminAxios.get(`/api/v1/administrators/username/${encoded}`) as unknown;
  const raw = res as { data?: AllAdministratorItem | null };
  const item = raw?.data && typeof raw.data === 'object' ? raw.data : null;

  return {
    data: item ?? undefined,
    items: item ? [item] : [],
  };
}
