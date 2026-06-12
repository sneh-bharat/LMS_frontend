import labCoordinatorAxios from './axios';

/** Single lab coordinator record from auth service. */
export interface LabCoordinator {
  id: number;
  /** Detail API returns `name`; list may use `fullName`. */
  name?: string;
  fullName?: string;
  username?: string;
  departmentName?: string;
  department?: string;
  departmentId?: number;
  role?: string;
  shift?: string;
  isActive?: boolean | null;
  isVerified?: boolean | null;
  email?: string;
  phone?: string;
  specialization?: string;
  branchId?: number;
  branchName?: string;
  tenantId?: number;
  createdAt?: string;
}

export interface LabCoordinatorsPage {
  content: LabCoordinator[];
  pageNo?: number;
  pageSize?: number;
  totalPages: number;
  totalElements: number;
  first?: boolean;
  last?: boolean;
}

export interface LabCoordinatorsApiResponse {
  data: LabCoordinatorsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export type LabCoordinatorStatusFilter = 'all' | 'active' | 'inactive' | 'verified';

export interface FetchLabCoordinatorsParams {
  pageNo: number;
  pageSize: number;
  statusFilter?: LabCoordinatorStatusFilter;
}

export function getLabCoordinatorName(row: LabCoordinator): string {
  return row.name?.trim() || row.fullName?.trim() || '—';
}

export function getLabCoordinatorDepartment(row: LabCoordinator): string {
  return row.departmentName?.trim() || row.department?.trim() || '—';
}

export function getLabCoordinatorStatusLabel(row: LabCoordinator): string {
  if (typeof row.isActive === 'boolean') {
    return row.isActive ? 'Active' : 'Inactive';
  }
  return '—';
}

export function isLabCoordinatorActive(row: LabCoordinator): boolean {
  if (typeof row.isActive === 'boolean') return row.isActive;
  return false;
}

export function getLabCoordinatorVerifiedLabel(row: LabCoordinator): string {
  if (typeof row.isVerified === 'boolean') {
    return row.isVerified ? 'Verified' : 'Unverified';
  }
  return '—';
}


/**
 * GET lab coordinators list.
 * - `active` → `/api/v1/lab-coordinators/active?pageNo=0&pageSize=10`
 * - `verified` → `/api/v1/lab-coordinators/verified?pageNo=0&pageSize=10`
 * - `all` / `inactive` → `/api/v1/lab-coordinators/all` (inactive filtered client-side)
 */
export async function fetchLabCoordinators(
  params: FetchLabCoordinatorsParams
): Promise<LabCoordinatorsApiResponse> {
  const { pageNo, pageSize, statusFilter = 'all' } = params;

  if (statusFilter === 'active') {
    return labCoordinatorAxios.get('/api/v1/lab-coordinators/active', {
      params: { pageNo, pageSize },
    }) as Promise<LabCoordinatorsApiResponse>;
  }

  if (statusFilter === 'verified') {
    return labCoordinatorAxios.get('/api/v1/lab-coordinators/verified', {
      params: { pageNo, pageSize },
    }) as Promise<LabCoordinatorsApiResponse>;
  }

  return labCoordinatorAxios.get('/api/v1/lab-coordinators/all', {
    params: { pageNo, pageSize },
  }) as Promise<LabCoordinatorsApiResponse>;
}

export interface LabCoordinatorDetailApiResponse {
  data: LabCoordinator;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/{id}`
 */
export async function fetchLabCoordinatorById(
  id: number
): Promise<LabCoordinatorDetailApiResponse> {
  return labCoordinatorAxios.get(
    `/api/v1/lab-coordinators/${id}`
  ) as Promise<LabCoordinatorDetailApiResponse>;
}

export interface LabCoordinatorMutationApiResponse {
  data?: LabCoordinator;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** POST `/api/v1/lab-coordinators/create` request body. */
export interface CreateLabCoordinatorPayload {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  specialization: string;
  isVerified: boolean;
  isActive: boolean;
  branchId: number;
}

/** Normalize phone for auth API (existing records use compact format e.g. +919903026504). */
export function normalizeLabCoordinatorPhone(phone: string): string {
  return phone.trim().replace(/\s+/g, '');
}

export function buildCreateLabCoordinatorPayload(
  payload: CreateLabCoordinatorPayload
): CreateLabCoordinatorPayload {
  return {
    username: payload.username.trim(),
    password: payload.password,
    fullName: payload.fullName.trim(),
    email: payload.email.trim(),
    phone: normalizeLabCoordinatorPhone(payload.phone),
    department: payload.department.trim(),
    specialization: payload.specialization.trim(),
    isVerified: payload.isVerified === true,
    isActive: payload.isActive === true,
    branchId: Number(payload.branchId) || 0,
  };
}

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/create`
 */
export async function createLabCoordinator(
  payload: CreateLabCoordinatorPayload
): Promise<LabCoordinatorMutationApiResponse> {
  const body = buildCreateLabCoordinatorPayload(payload);

  if (!body.branchId || body.branchId < 1) {
    throw new Error('A valid branch is required.');
  }

  const res = (await labCoordinatorAxios.post(
    '/api/v1/lab-coordinators/create',
    body
  )) as LabCoordinatorMutationApiResponse;

  if (!res.response) {
    throw new Error(res.message?.trim() || 'Failed to create lab coordinator.');
  }

  return res;
}

/** PUT `/api/v1/lab-coordinators/{id}` request body. */
export interface UpdateLabCoordinatorPayload {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: number;
  department: string;
  specialization: string; 
  isVerified: boolean;
}

export interface UpdateLabCoordinatorParams {
  id: number;
  payload: UpdateLabCoordinatorPayload;
}

/**
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/{id}`
 */
export async function updateLabCoordinator(
  params: UpdateLabCoordinatorParams
): Promise<LabCoordinatorMutationApiResponse> {
  return labCoordinatorAxios.put(
    `/api/v1/lab-coordinators/${params.id}`,
    params.payload
  ) as Promise<LabCoordinatorMutationApiResponse>;
}

/**
 * DELETE `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/{id}`
 */
export async function deleteLabCoordinator(
  id: number
): Promise<LabCoordinatorMutationApiResponse> {
  return labCoordinatorAxios.delete(
    `/api/v1/lab-coordinators/${id}`
  ) as Promise<LabCoordinatorMutationApiResponse>;
}

export interface ActivateLabCoordinatorParams {
  id: number;
  isActive: boolean;
}

/**
 * PUT `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/{id}/activate?active=true|false`
 */
export async function activateLabCoordinator(
  params: ActivateLabCoordinatorParams
): Promise<LabCoordinatorMutationApiResponse> {
  const { id, isActive } = params;

  if (!id || id < 1) {
    throw new Error('A valid lab coordinator ID is required.');
  }

  const res = (await labCoordinatorAxios.put(
    `/api/v1/lab-coordinators/${id}/activate?active=${isActive}`
  )) as LabCoordinatorMutationApiResponse;

  if (!res.response) {
    throw new Error(res.message?.trim() || 'Failed to update lab coordinator status.');
  }

  return res;
}

export function isLabCoordinatorMutationSuccess(
  res: LabCoordinatorMutationApiResponse
): boolean {
  return res.response === true;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/username/{username}`
 */
export async function fetchLabCoordinatorByUsername(
  username: string
): Promise<LabCoordinatorDetailApiResponse> {
  const encodedUsername = encodeURIComponent(username.trim());
  return labCoordinatorAxios.get(
    `/api/v1/lab-coordinators/username/${encodedUsername}`
  ) as Promise<LabCoordinatorDetailApiResponse>;
}

