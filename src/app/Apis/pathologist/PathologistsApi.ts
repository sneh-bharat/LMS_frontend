import pathologistAxios from './axios';

/** Single pathologist record from auth service. */
export interface Pathologist {
  id: number;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  licenseNumber?: string;
  role?: string;
  branchId?: number;
  branchName?: string;
  tenantId?: number;
  isVerified?: boolean | null;
  isActive?: boolean | null;
  createdAt?: string;
  requestId?: number | null;
  content?: Pathologist[];
  totalElements?: number;
}

export interface PathologistsPage {
  content: Pathologist[];
  pageNo?: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}

export interface PathologistsApiResponse {
  data: PathologistsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface PathologistMutationApiResponse {
  data?: Pathologist | null;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export type PathologistDetailResponse = PathologistMutationApiResponse;

export interface FetchPathologistsParams {
  page: number;
  size: number;
}

/** POST `/api/v1/pathologists` request body. */
export interface CreatePathologistPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  branchId: number;
  isVerified: boolean;
  isActive: boolean;
}

/** PUT `/api/v1/pathologists/{id}` request body. */
export interface UpdatePathologistPayload {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  branchId: number;
  isVerified: boolean;
  isActive: boolean;
  password?: string;
}

// ─── Helper utilities ─────────────────────────────────────────────────────────

export function getPathologistName(row: Pathologist): string {
  return row.fullName?.trim() || '—';
}

export function getPathologistPhone(row: Pathologist): string {
  return row.phone?.trim() || '—';
}

export function getPathologistStatusLabel(row: Pathologist): string {
  if (typeof row.isActive === 'boolean') {
    return row.isActive ? 'Active' : 'Inactive';
  }
  return '—';
}

export function isPathologistActive(row: Pathologist): boolean {
  if (typeof row.isActive === 'boolean') return row.isActive;
  return false;
}

export function getPathologistVerifiedLabel(row: Pathologist): string {
  if (typeof row.isVerified === 'boolean') {
    return row.isVerified ? 'Verified' : 'Unverified';
  }
  return '—';
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/pathologists?page=&size=`
 */
export async function fetchPathologists(
  params: FetchPathologistsParams
): Promise<PathologistsApiResponse> {
  return pathologistAxios.get('/api/v1/pathologists', {
    params: { pageNo: params.page, pageSize: params.size },
  }) as Promise<PathologistsApiResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/pathologists/active?page=&size=`
 */
export async function fetchActivePathologists(
  params: FetchPathologistsParams
): Promise<PathologistsApiResponse> {
  return pathologistAxios.get('/api/v1/pathologists/active', {
    params: { pageNo: params.page, pageSize: params.size },
  }) as Promise<PathologistsApiResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/pathologists/verified?page=&size=`
 */
export async function fetchVerifiedPathologists(
  params: FetchPathologistsParams
): Promise<PathologistsApiResponse> {
  return pathologistAxios.get('/api/v1/pathologists/verified', {
    params: { pageNo: params.page, pageSize: params.size },
  }) as Promise<PathologistsApiResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/pathologists/{username}`
 * Note: the API uses username as the path param (not ID)
 */
export async function fetchPathologistByUsername(
  username: string
): Promise<PathologistDetailResponse> {
  const encodedUsername = encodeURIComponent(username.trim());
  return pathologistAxios.get(
    `/api/v1/pathologists/${encodedUsername}`
  ) as Promise<PathologistDetailResponse>;
}

export async function fetchPathologistByBranchId(
  branchId: number,
  params: FetchPathologistsParams
): Promise<PathologistDetailResponse> {
  return pathologistAxios.get(
    `/api/v1/pathologists`, {
    params: { pageNo: params.page, pageSize: params.size, branchId: branchId},
  }
  ) as Promise<PathologistDetailResponse>;
}

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/pathologists` — create a new pathologist.
 */
export async function createPathologist(
  payload: CreatePathologistPayload
): Promise<PathologistMutationApiResponse> {
  return pathologistAxios.post(
    '/api/v1/pathologists',
    payload
  ) as Promise<PathologistMutationApiResponse>;
}

/**
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/pathologists/{id}` — update a pathologist.
 */
export async function updatePathologist(
  id: number,
  payload: UpdatePathologistPayload
): Promise<PathologistMutationApiResponse> {
  return pathologistAxios.put(
    `/api/v1/pathologists/${id}`,
    payload
  ) as Promise<PathologistMutationApiResponse>;
}