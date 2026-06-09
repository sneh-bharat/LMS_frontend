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

export interface FetchBloodCollectorsParams {
  page: number;
  size: number;
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
 */
export async function fetchBloodCollectors(
  params: FetchBloodCollectorsParams
): Promise<BloodCollectorsApiResponse> {
  return collectorAxios.get('/api/v1/blood-collectors/all', {
    params: {
      page: params.page,
      size: params.size,
    },
  }) as Promise<BloodCollectorsApiResponse>;
}

export interface BloodCollectorMutationApiResponse {
  data?: BloodCollector;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** POST `/api/v1/blood-collectors/create` request body. */
export interface CreateBloodCollectorPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: number;
  isVerified: boolean;
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
