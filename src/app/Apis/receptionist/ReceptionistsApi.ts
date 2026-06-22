import receptionistAxios from './axios';

/** Single receptionist record from auth service. */
export interface Receptionist {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  deskNumber?: string;
  role?: string;
  branchId?: number;
  branchName?: string;
  isVerified?: boolean | null;
  isActive?: boolean | null;
  content?: Receptionist[];
  totalElements?: number;
}

export interface ReceptionistsPage {
  content: Receptionist[];
  pageNo?: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}

export interface ReceptionistsApiResponse {
  data: ReceptionistsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface ReceptionistMutationApiResponse {
  data?: Receptionist | null;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export type ReceptionistDetailResponse = ReceptionistMutationApiResponse;

export interface FetchReceptionistsParams {
  page: number;
  size: number;
}

/** POST `/api/v1/receptionists/register` request body. */
export interface CreateReceptionistPayload {
  username: string;
  password: string;
  name: string;
  email: string;
  deskNumber: string;
  branchId: number;
  isVerified: boolean;
  isActive: boolean;
}

/** PUT `/api/v1/receptionists/{id}` request body. */
export interface UpdateReceptionistPayload {
  username: string;
  name: string;
  email: string;
  deskNumber: string;
  branchId: number;
  isVerified: boolean;
  isActive: boolean;
  password?: string;
}

// ─── Helper utilities ────────────────────────────────────────────────────────

export function getReceptionistName(row: Receptionist): string {
  return row.name?.trim() || '—';
}

export function getReceptionistStatusLabel(row: Receptionist): string {
  if (typeof row.isActive === 'boolean') {
    return row.isActive ? 'Active' : 'Inactive';
  }
  return '—';
}

export function isReceptionistActive(row: Receptionist): boolean {
  if (typeof row.isActive === 'boolean') return row.isActive;
  return false;
}

export function getReceptionistVerifiedLabel(row: Receptionist): string {
  if (typeof row.isVerified === 'boolean') {
    return row.isVerified ? 'Verified' : 'Unverified';
  }
  return '—';
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/receptionists/all?page=&size=`
 */
export async function fetchReceptionists(
  params: FetchReceptionistsParams
): Promise<ReceptionistsApiResponse> {
  return receptionistAxios.get('/api/v1/receptionists/all', {
    params: { page: params.page, size: params.size },
  }) as Promise<ReceptionistsApiResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/receptionists/active?page=&size=`
 */
export async function fetchActiveReceptionists(
  params: FetchReceptionistsParams
): Promise<ReceptionistsApiResponse> {
  return receptionistAxios.get('/api/v1/receptionists/active', {
    params: { page: params.page, size: params.size },
  }) as Promise<ReceptionistsApiResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/receptionists/verified?page=&size=`
 */
export async function fetchVerifiedReceptionists(
  params: FetchReceptionistsParams
): Promise<ReceptionistsApiResponse> {
  return receptionistAxios.get('/api/v1/receptionists/verified', {
    params: { page: params.page, size: params.size },
  }) as Promise<ReceptionistsApiResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/receptionists/{id}`
 */
export async function fetchReceptionistById(
  id: number
): Promise<ReceptionistDetailResponse> {
  return receptionistAxios.get(
    `/api/v1/receptionists/${id}`
  ) as Promise<ReceptionistDetailResponse>;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/receptionists/username/{username}`
 */
export async function fetchReceptionistByUsername(
  username: string
): Promise<ReceptionistDetailResponse> {
  const encodedUsername = encodeURIComponent(username.trim());
  return receptionistAxios.get(
    `/api/v1/receptionists/username/${encodedUsername}`
  ) as Promise<ReceptionistDetailResponse>;
}

export async function fetchReceptionistByBranchId(
  branchId: number,
  params: FetchReceptionistsParams
): Promise<ReceptionistDetailResponse> {
  return receptionistAxios.get(`/api/v1/receptionists/all`, {
    params: { page: params.page, size: params.size, branchId },
  }) as Promise<ReceptionistDetailResponse>;
}

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/receptionists/register` — create a new receptionist.
 */
export async function createReceptionist(
  payload: CreateReceptionistPayload
): Promise<ReceptionistMutationApiResponse> {
  return receptionistAxios.post(
    '/api/v1/receptionists/register',
    payload
  ) as Promise<ReceptionistMutationApiResponse>;
}

/**
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/receptionists/{id}` — update a receptionist.
 */
export async function updateReceptionist(
  id: number,
  payload: UpdateReceptionistPayload
): Promise<ReceptionistMutationApiResponse> {
  return receptionistAxios.put(
    `/api/v1/receptionists/${id}`,
    payload
  ) as Promise<ReceptionistMutationApiResponse>;
}