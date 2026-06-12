import labTechnicianAxios from './axios';

/** Single lab technician record. */
export interface LabTechnician {
  id: number;
  name: string;
  username: string;
  email: string;
  department?: string | null;
  role?: string | null;
  shift?: string | null;
  isVerified?: boolean;
  isActive?: boolean;
  phone?: string | null;
  branchId?: number | null;
  branchName?: string | null;
}

export interface LabTechniciansPage {
  content: LabTechnician[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

export interface LabTechniciansApiResponse {
  data: LabTechniciansPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchLabTechniciansParams {
  page: number;
  size: number;
  /** `verified` → `/lab-technicians/verified`, `active` → `/lab-technicians/active` */
  listType?: 'verified' | 'active';
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-technicians/verified?page=&size=`
 * — Fetch verified lab technicians with pagination.
 *
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-technicians/active?page=&size=`
 * — Fetch active lab technicians with pagination.
 */
export async function fetchLabTechnicians(
  params: FetchLabTechniciansParams
): Promise<LabTechniciansApiResponse> {
  const endpoint = params.listType === 'active' ? 'active' : 'verified';
  return labTechnicianAxios.get(`/api/v1/lab-technicians/${endpoint}`, {
    params: {
      page: params.page,
      size: params.size,
    },
  }) as Promise<LabTechniciansApiResponse>;
}

/** Helper: get display name from a lab technician record. */
export function getLabTechnicianName(row: LabTechnician): string {
  return row.name?.trim() || row.username?.trim() || '—';
}

/** Helper: get phone from a lab technician record. */
export function getLabTechnicianPhone(row: LabTechnician): string {
  return row.phone?.trim() || '—';
}

/** POST `/api/v1/lab-technicians/register` request body. */
export interface CreateLabTechnicianPayload {
  username: string;
  password: string;
  name: string;
  email: string;
  department: string;
  shift: string;
  isVerified: boolean;
  isActive: boolean;
  branchId: number;
}

export interface LabTechnicianMutationApiResponse {
  data?: LabTechnician;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * POST `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-technicians/register`
 * — Create a new lab technician.
 */
export async function createLabTechnician(
  payload: CreateLabTechnicianPayload
): Promise<LabTechnicianMutationApiResponse> {
  return labTechnicianAxios.post(
    '/api/v1/lab-technicians/register',
    payload
  ) as Promise<LabTechnicianMutationApiResponse>;
}

export interface LabTechnicianDetailApiResponse {
  data: LabTechnician;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-technicians/{id}`
 * — Fetch a single lab technician by ID.
 */
export async function fetchLabTechnicianById(
  id: number
): Promise<LabTechnicianDetailApiResponse> {
  return labTechnicianAxios.get(
    `/api/v1/lab-technicians/${id}`
  ) as Promise<LabTechnicianDetailApiResponse>;
}

/** PATCH `/api/v1/lab-technicians/{id}` request body. */
export interface UpdateLabTechnicianPayload {
  name: string;
  email: string;
  department: string;
  shift: string;
  isVerified: boolean;
  isActive: boolean;
  branchId: number;
}

export interface UpdateLabTechnicianParams {
  id: number;
  payload: UpdateLabTechnicianPayload;
}

/**
 * PATCH `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-technicians/{id}`
 * — Update an existing lab technician (partial update).
 */
export async function updateLabTechnician(
  params: UpdateLabTechnicianParams
): Promise<LabTechnicianMutationApiResponse> {
  return labTechnicianAxios.patch(
    `/api/v1/lab-technicians/${params.id}`,
    params.payload
  ) as Promise<LabTechnicianMutationApiResponse>;
}

export interface LabTechnicianByUsernameApiResponse {
  data: LabTechnician;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-technicians/username/{username}`
 * — Fetch a single lab technician by username.
 */
export async function fetchLabTechnicianByUsername(
  username: string
): Promise<LabTechnicianByUsernameApiResponse> {
  return labTechnicianAxios.get(
    `/api/v1/lab-technicians/username/${encodeURIComponent(username)}`
  ) as Promise<LabTechnicianByUsernameApiResponse>;
}

/**
 * DELETE `{NEXT_PUBLIC_API_AUTH}/api/v1/lab-technicians/{id}`
 * — Delete a lab technician by ID.
 */
export async function deleteLabTechnician(
  id: number
): Promise<LabTechnicianMutationApiResponse> {
  return labTechnicianAxios.delete(
    `/api/v1/lab-technicians/${id}`
  ) as Promise<LabTechnicianMutationApiResponse>;
}
