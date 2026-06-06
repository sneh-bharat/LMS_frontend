import referrerAxios from './axios';
import commissionAxios from '../Commission/axios';
import { DoctorTestCommission } from '../Commission/commissionPrice';

/** Single referrer record from auth service. */
export interface Referrer {
  id: number;
  referrerName?: string;
  name?: string;
  fullName?: string;
  username?: string;
  phone?: string;
  mobile?: string;
  phoneNumber?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  status?: string;
  showOnReport?: boolean | string | null;
  showOnPrint?: boolean | string | null;
  address?: string;
  centre?: string;
  marketingAssociate?: string;
  branchId?: number;
  branchName?: string;
  branch?: { branchName?: string } | null;
}

export interface ReferrersPage {
  content: Referrer[];
  pageNo?: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}

export interface ReferrersApiResponse {
  data: ReferrersPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchReferrersParams {
  pageNo: number;
  pageSize: number;
  /** `all` → `/referrers/all`, `active` → `/referrers/active` */
  listType?: 'all' | 'active';
}

export function getReferrerName(row: Referrer): string {
  return (
    row.referrerName?.trim() ||
    row.fullName?.trim() ||
    row.name?.trim() ||
    '—'
  );
}

export function getReferrerPhone(row: Referrer): string {
  return row.phone?.trim() || row.mobile?.trim() || row.phoneNumber?.trim() || '—';
}

export function getReferrerStatusLabel(row: Referrer): string {
  if (typeof row.isActive === 'boolean') {
    return row.isActive ? 'Active' : 'Inactive';
  }
  const status = row.status?.trim();
  if (!status) return '—';
  if (/^active$/i.test(status)) return 'Active';
  if (/^inactive$/i.test(status)) return 'Inactive';
  return status;
}

export function isReferrerActive(row: Referrer): boolean {
  if (typeof row.isActive === 'boolean') return row.isActive;
  return /^active$/i.test(row.status?.trim() ?? '');
}

export function getShowOnReportLabel(row: Referrer): string {
  const value = row.showOnReport ?? row.showOnPrint;
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true' || normalized === 'yes' || normalized === 'show all') return 'Yes';
  if (normalized === 'false' || normalized === 'no' || normalized === 'hide all') return 'No';
  return String(value);
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/referrers/all?pageNo=&pageSize=`
 */
export async function fetchReferrers(
  params: FetchReferrersParams
): Promise<ReferrersApiResponse> {
  return referrerAxios.get('/api/v1/referrers/all', {
    params: {
      pageNo: params.pageNo,
      pageSize: params.pageSize,
    },
  }) as Promise<ReferrersApiResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/referrers/active?pageNo=&pageSize=`
 */
export async function fetchActiveReferrers(
  params: FetchReferrersParams
): Promise<ReferrersApiResponse> {
  return referrerAxios.get('/api/v1/referrers/active', {
    params: {
      pageNo: params.pageNo,
      pageSize: params.pageSize,
    },
  }) as Promise<ReferrersApiResponse>;
}

/**
 * Search active referrers by name (client-side filter).
 * Fetches a large page and filters by keyword — used by the ReferrerSelect dropdown.
 */
export async function searchReferrers(searchKey: string): Promise<Referrer[]> {
  const res = await fetchActiveReferrers({ pageNo: 0, pageSize: 200 });
  const all = res?.data?.content ?? [];
  const key = searchKey.trim().toLowerCase();
  if (!key) return all;
  return all.filter((r) => {
    const name = getReferrerName(r).toLowerCase();
    const phone = getReferrerPhone(r).toLowerCase();
    return name.includes(key) || phone.includes(key);
  });
}

/** GET `/api/v1/referrers/{id}` — single referrer envelope. */
export interface ReferrerDetailResponse {
  data: Referrer;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/referrers/{id}`
 */
export async function fetchReferrerById(id: number): Promise<ReferrerDetailResponse> {
  return referrerAxios.get(`/api/v1/referrers/${id}`) as Promise<ReferrerDetailResponse>;
}

export interface ReferrerMutationApiResponse {
  data?: Referrer;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** Single record from GET `/api/v1/commissions/referrer/{referrerId}`. */
export interface ReferrerCommissionItem {
  applyToAllTests: boolean;
  commissionPercentage: number;
  departmentId: number;
  departmentName: string;
  description?: string | null;
  id: number;
  isActive: boolean;
  referrerId: number;
  referrerName: string;
}

export interface ReferrerCommissionByReferrerResponse {
  data: ReferrerCommissionItem[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** POST `/api/v1/referrers/register` request body. */
export interface CreateReferrerPayload {
  branchId: number;
  name: string;
  mobile: string;
  address: string;
  email: string;
  phone: string;
  showOnReport: string;
  isActive: boolean;
  username: string;
  password: string;
  role: string;
}

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/referrers/register` — create a new referrer.
 */
export async function createReferrer(
  payload: CreateReferrerPayload
): Promise<ReferrerMutationApiResponse> {
  return referrerAxios.post('/api/v1/referrers/register', payload) as Promise<ReferrerMutationApiResponse>;
}

/** PUT `/api/v1/referrers/{id}` request body. */
export interface UpdateReferrerPayload {
  username: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  showOnReport: string;
  address: string;
  branchId: number;
}

/**
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/referrers/{id}` — update referrer by id.
 */
export async function updateReferrer(
  id: number,
  payload: UpdateReferrerPayload
): Promise<ReferrerMutationApiResponse> {
  return referrerAxios.put(`/api/v1/referrers/${id}`, payload) as Promise<ReferrerMutationApiResponse>;
}

/**
 * DELETE `{NEXT_PUBLIC_API_AUTH}/api/v1/referrers/{id}` — delete referrer by id.
 */
export async function deleteReferrer(id: number): Promise<ReferrerMutationApiResponse> {
  return referrerAxios.delete(`/api/v1/referrers/${id}`) as Promise<ReferrerMutationApiResponse>;
}

/** GET `{NEXT_PUBLIC_API_Test}/api/v1/commissions/referrer/{referrerId}` */
export async function fetchCommissionsByReferrer(
  referrerId: number
): Promise<ReferrerCommissionByReferrerResponse> {
  return commissionAxios.get(
    `/api/v1/commissions/referrer/${referrerId}`
  ) as Promise<ReferrerCommissionByReferrerResponse>;
}

export function showOnReportToFormValue(value: Referrer['showOnReport']): 'Yes' | 'No' {
  return getShowOnReportLabel({ id: 0, showOnReport: value }) === 'Yes' ? 'Yes' : 'No';
}

export interface ReferrerCommissionItem {
  testId: number;
  testCode: string;
  testName: string;
  mrpPrice: number;
  finalPrice: number;
  commissionPercentage: number;
  commissionAmount: number;
}

export interface ReferrerTestCommissionListApiResponse {
  data: ReferrerCommissionItem[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}