import branchManagerAxios from './axios';

/** Single branch manager record from auth service. */
export interface BranchManager {
  id: number;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  branchId?: number;
  branchName?: string | null;
  tenantId?: number;
  isVerified?: boolean | null;
  isActive?: boolean | null;
  createdAt?: string;
  requestId?: number | null;
}

export interface BranchManagersPage {
  content: BranchManager[];
  pageNo?: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}

export interface BranchManagersApiResponse {
  data: BranchManagersPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface BranchManagerMutationApiResponse {
  data?: BranchManager | null;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export type BranchManagerDetailResponse = BranchManagerMutationApiResponse;

export interface FetchBranchManagersParams {
  page: number;
  size: number;
}

/** POST `/api/v1/branch-managers/create` request body. */
export interface CreateBranchManagerPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: number;
  isVerified: boolean;
}

/** PUT `/api/v1/branch-managers/{id}` request body. */
export interface UpdateBranchManagerPayload {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: number;
  isVerified: boolean;
}

// ─── Helper utilities ─────────────────────────────────────────────────────────

export function getBranchManagerName(row: BranchManager): string {
  return row.fullName?.trim() || '—';
}

export function getBranchManagerPhone(row: BranchManager): string {
  return row.phone?.trim() || '—';
}

export function getBranchManagerStatusLabel(row: BranchManager): string {
  if (typeof row.isActive === 'boolean') {
    return row.isActive ? 'Active' : 'Inactive';
  }
  return '—';
}

export function isBranchManagerActive(row: BranchManager): boolean {
  if (typeof row.isActive === 'boolean') return row.isActive;
  return false;
}

export function getBranchManagerVerifiedLabel(row: BranchManager): string {
  if (typeof row.isVerified === 'boolean') {
    return row.isVerified ? 'Verified' : 'Unverified';
  }
  return '—';
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET `/api/v1/branch-managers/all?page=&size=`
 */
export async function fetchBranchManagers(
  params: FetchBranchManagersParams
): Promise<BranchManagersApiResponse> {
  return branchManagerAxios.get('/api/v1/branch-managers/all', {
    params: { page: params.page, size: params.size },
  }) as Promise<BranchManagersApiResponse>;
}

/**
 * GET `/api/v1/branch-managers/active?page=&size=`
 */
export async function fetchActiveBranchManagers(
  params: FetchBranchManagersParams
): Promise<BranchManagersApiResponse> {
  return branchManagerAxios.get('/api/v1/branch-managers/active', {
    params: { page: params.page, size: params.size },
  }) as Promise<BranchManagersApiResponse>;
}

/**
 * GET `/api/v1/branch-managers/verified?page=&size=`
 */
export async function fetchVerifiedBranchManagers(
  params: FetchBranchManagersParams
): Promise<BranchManagersApiResponse> {
  return branchManagerAxios.get('/api/v1/branch-managers/verified', {
    params: { page: params.page, size: params.size },
  }) as Promise<BranchManagersApiResponse>;
}

/**
 * GET `/api/v1/branch-managers/{id}`
 */
export async function fetchBranchManagerById(
  id: number
): Promise<BranchManagerDetailResponse> {
  return branchManagerAxios.get(
    `/api/v1/branch-managers/${id}`
  ) as Promise<BranchManagerDetailResponse>;
}

/**
 * GET `/api/v1/branch-managers/username/{username}`
 */
export async function fetchBranchManagerByUsername(
  username: string
): Promise<BranchManagerDetailResponse> {
  const encoded = encodeURIComponent(username.trim());
  return branchManagerAxios.get(
    `/api/v1/branch-managers/username/${encoded}`
  ) as Promise<BranchManagerDetailResponse>;
}

/**
 * GET `/api/v1/branch-managers/branch/{branchId}`
 */
export async function fetchBranchManagerByBranchId(
  branchId: number
): Promise<BranchManagerDetailResponse> {
  return branchManagerAxios.get(
    `/api/v1/branch-managers/all?page=0&size=10&${branchId}`
  ) as Promise<BranchManagerDetailResponse>;
}

/**
 * POST `/api/v1/branch-managers/create`
 */
export async function createBranchManager(
  payload: CreateBranchManagerPayload
): Promise<BranchManagerMutationApiResponse> {
  return branchManagerAxios.post(
    '/api/v1/branch-managers/create',
    payload
  ) as Promise<BranchManagerMutationApiResponse>;
}

/**
 * PUT `/api/v1/branch-managers/{id}`
 */
export async function updateBranchManager(
  id: number,
  payload: UpdateBranchManagerPayload
): Promise<BranchManagerMutationApiResponse> {
  return branchManagerAxios.put(
    `/api/v1/branch-managers/${id}`,
    payload
  ) as Promise<BranchManagerMutationApiResponse>;
}

/**
 * PUT `/api/v1/branch-managers/{id}/verify`
 */
export async function verifyBranchManager(
  id: number
): Promise<BranchManagerMutationApiResponse> {
  return branchManagerAxios.put(
    `/api/v1/branch-managers/${id}/verify`
  ) as Promise<BranchManagerMutationApiResponse>;
}

/**
 * PUT `/api/v1/branch-managers/{id}/activate`
 */
export async function activateBranchManager(
  id: number
): Promise<BranchManagerMutationApiResponse> {
  return branchManagerAxios.put(
    `/api/v1/branch-managers/${id}/activate`
  ) as Promise<BranchManagerMutationApiResponse>;
}

/**
 * DELETE `/api/v1/branch-managers/{id}`
 */
export async function deleteBranchManager(
  id: number
): Promise<BranchManagerMutationApiResponse> {
  return branchManagerAxios.delete(
    `/api/v1/branch-managers/${id}`
  ) as Promise<BranchManagerMutationApiResponse>;
}