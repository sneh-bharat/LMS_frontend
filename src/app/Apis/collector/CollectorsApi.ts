import collectorAxios from './axios';

/** Single blood collector record from auth service. */
export interface BloodCollector {
  id: number;
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: string;
  branchId?: number;
  branchName?: string;
  tenantId?: number;
  isVerified?: boolean | null;
  isActive?: boolean | null;
  collectionCenter?: string | null;
  createdAt?: string;
  requestId?: number | null;
}

export interface BloodCollectorsPage {
  content: BloodCollector[];
  pageNo?: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}

export interface BloodCollectorsApiResponse {
  data: BloodCollectorsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export type BloodCollectorStatusFilter = 'all' | 'active' | 'inactive' | 'verified';

export interface FetchBloodCollectorsParams {
  page: number;
  size: number;
  statusFilter?: BloodCollectorStatusFilter;
}

export function getCollectorName(row: BloodCollector): string {
  return row.fullName?.trim() || '—';
}

export function getCollectorPhone(row: BloodCollector): string {
  return row.phone?.trim() || '—';
}

export function getCollectorStatusLabel(row: BloodCollector): string {
  if (typeof row.isActive === 'boolean') {
    return row.isActive ? 'Active' : 'Inactive';
  }
  return '—';
}

export function isCollectorActive(row: BloodCollector): boolean {
  if (typeof row.isActive === 'boolean') return row.isActive;
  return false;
}

export function getCollectorVerifiedLabel(row: BloodCollector): string {
  if (typeof row.isVerified === 'boolean') {
    return row.isVerified ? 'Verified' : 'Unverified';
  }
  return '—';
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/blood-collectors/all?page=&size=`
 * - `active` → `/api/v1/blood-collectors/active?page=0&size=10`
 * - `all` / `inactive` → `/api/v1/blood-collectors/all` (inactive filtered client-side)  
 * - `verified` → `/api/v1/blood-collectors/verified?page=0&size=10`
 */
export async function fetchBloodCollectors(
  params: FetchBloodCollectorsParams
): Promise<BloodCollectorsApiResponse> {
  const { page, size, statusFilter = 'all' } = params;

  if (statusFilter === 'active') {
    return collectorAxios.get('/api/v1/blood-collectors/active', {
      params: { page, size },
    }) as Promise<BloodCollectorsApiResponse>;
  }

  if (statusFilter === 'verified') {
    return collectorAxios.get('/api/v1/blood-collectors/verified', {
      params: { page, size },
    }) as Promise<BloodCollectorsApiResponse>;
  }

  return collectorAxios.get('/api/v1/blood-collectors/all', {
    params: { page, size },
  }) as Promise<BloodCollectorsApiResponse>;
}

export interface BloodCollectorMutationApiResponse {
  data?: BloodCollector;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}


export type BloodCollectorDetailResponse = BloodCollectorMutationApiResponse;

/** POST `/api/v1/blood-collectors/create` request body. */
export interface CreateBloodCollectorPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: number;
  isVerified: boolean;
  isActive: boolean;
}

/** PUT `/api/v1/blood-collectors/{id}` request body. */
export interface UpdateBloodCollectorPayload {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: number;
  isVerified: boolean;
  isActive: boolean;
  password?: string;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/blood-collectors/username/{username}`
 * (GET by id is not supported on `/blood-collectors/{id}` — that path is PUT-only.)
 */
export async function fetchBloodCollectorByUsername(
  username: string
): Promise<BloodCollectorDetailResponse> {
  const trimmed = username.trim();
  if (!trimmed) {
    throw new Error('Username is required.');
  }

  const res = (await collectorAxios.get(
    `/api/v1/blood-collectors/username/${encodeURIComponent(trimmed)}`
  )) as BloodCollectorDetailResponse;

  if (!res.response) {
    throw new Error(res.message?.trim() || 'Blood collector not found.');
  }

  return res;
}

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/blood-collectors/create` — create a new blood collector.
 */
export async function createBloodCollector(
  payload: CreateBloodCollectorPayload
): Promise<BloodCollectorMutationApiResponse> {
  return collectorAxios.post(
    '/api/v1/blood-collectors/create',
    payload
  ) as Promise<BloodCollectorMutationApiResponse>;
}

/**
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/blood-collectors/{id}` — update a blood collector.
 */
export async function updateBloodCollector(
  id: number,
  payload: UpdateBloodCollectorPayload
): Promise<BloodCollectorMutationApiResponse> {
  return collectorAxios.put(
    `/api/v1/blood-collectors/${id}`,
    payload
  ) as Promise<BloodCollectorMutationApiResponse>;
}

export function buildUpdateBloodCollectorPayload(
  collector: BloodCollector,
  overrides: Partial<UpdateBloodCollectorPayload> = {}
): UpdateBloodCollectorPayload {
  return {
    username: collector.username?.trim() || '',
    fullName: collector.fullName?.trim() || '',
    email: collector.email?.trim() || '',
    phone: collector.phone?.trim() || '',
    branchId: collector.branchId ?? 0,
    isVerified: collector.isVerified === true,
    isActive: collector.isActive !== false,
    ...overrides,
  };
}

/** Load latest collector data before PUT (GET by id is not supported). */
export async function resolveBloodCollectorForMutation(
  collector: BloodCollector
): Promise<BloodCollector> {
  const username = collector.username?.trim();
  if (!username) return collector;

  try {
    const res = await fetchBloodCollectorByUsername(username);
    if (res.data?.id === collector.id) return res.data;
  } catch {
    // use list row data when username lookup fails
  }

  return collector;
}

/**
 * Delete (deactivate) via PUT `/api/v1/blood-collectors/{id}`.
 * DELETE and GET are not supported on this path.
 */
export async function deleteBloodCollector(
  collector: BloodCollector
): Promise<BloodCollectorMutationApiResponse> {
  const source = await resolveBloodCollectorForMutation(collector);
  const payload = buildUpdateBloodCollectorPayload(source, { isActive: false });

  if (!payload.branchId || payload.branchId < 1) {
    throw new Error('Branch is required to delete this blood collector.');
  }

  const res = (await updateBloodCollector(collector.id, payload)) as BloodCollectorMutationApiResponse;

  if (!res.response) {
    throw new Error(res.message?.trim() || 'Failed to delete blood collector.');
  }

  return res;
}

export interface ActivateBloodCollectorParams {
  id: number;
  isActive: boolean;
}

/**
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/blood-collectors/{id}/activate?active=true|false`
 */
export async function activateBloodCollector(
  params: ActivateBloodCollectorParams
): Promise<BloodCollectorMutationApiResponse> {
  const { id, isActive } = params;

  if (!id || id < 1) {
    throw new Error('A valid blood collector ID is required.');
  }

  const res = (await collectorAxios.put(
    `/api/v1/blood-collectors/${id}/activate?active=${isActive}`
  )) as BloodCollectorMutationApiResponse;

  if (!res.response) {
    throw new Error(res.message?.trim() || 'Failed to update blood collector status.');
  }

  return res;
}

export function isBloodCollectorMutationSuccess(
  res: BloodCollectorMutationApiResponse
): boolean {
  return res.response === true;
}