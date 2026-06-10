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

export interface FetchLabCoordinatorsParams {
    pageNo: number;
    pageSize: number;
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
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/all?pageNo=0&pageSize=10`
 */
export async function fetchLabCoordinators(
  params: FetchLabCoordinatorsParams
): Promise<LabCoordinatorsApiResponse> {
  return labCoordinatorAxios.get('/api/v1/lab-coordinators/all', {
    params: {
        pageNo: params.pageNo,
        pageSize: params.pageSize,
    },
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

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-coordinators/create`
 */
export async function createLabCoordinator(
  payload: CreateLabCoordinatorPayload
): Promise<LabCoordinatorMutationApiResponse> {
  return labCoordinatorAxios.post(
    '/api/v1/lab-coordinators/create',
    payload
  ) as Promise<LabCoordinatorMutationApiResponse>;
}

/** PUT `/api/v1/lab-coordinators/{id}` request body. */
export interface UpdateLabCoordinatorPayload {
  username: string;
  fullName: string;
  email: string;
  phone: string;
  branchId: number;
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
