import referringDoctorAxios from './axios';

export interface ReferringDoctor {
  id: number;
  doctorName: string;
  doctorEmail: string;
  doctorPhone: string;
  hospitalName?: string | null;
  specialization?: string | null;
  branchId: number | null;
  branchName?: string | null;
  tenantId?: number;
  isActive: boolean;
  isVerified?: boolean;
  role?: string;
  username?: string;
  deviceId?: string | null;
  deviceTypes?: string | null;
  /** Present on some list responses when `branchName` is omitted. */
  branch?: { branchName?: string } | null;
}

export interface ReferringDoctorsPage {
  content: ReferringDoctor[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface ReferringDoctorsApiResponse {
  data: ReferringDoctorsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchReferringDoctorsParams {
  pageNo: number;
  pageSize: number;
  /** Omit or `undefined` to call without `branchId` (all branches, if backend allows). */
  branchId?: number;
}

export interface SearchReferringDoctorsParams {
  searchKey: string;
}

/** Search returns `data` as a doctor array (not paginated `content`). */
export interface ReferringDoctorsSearchApiResponse {
  data: ReferringDoctor[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** List uses paginated `data.content`; search uses `data[]`. */
export function extractReferringDoctorsList(
  data: ReferringDoctorsPage | ReferringDoctor[] | undefined
): ReferringDoctor[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.content ?? [];
}

/** POST `/api/v1/doctors/register` request body (matches backend contract). */
export interface CreateReferringDoctorPayload {
  doctorName: string;
  branchId: number;
  specialization: string;
  hospitalName: string;
  isActive: boolean;
  username: string;
  password: string;
  doctorEmail: string;
  doctorPhone: string;
  isVerified: boolean;
  role: string;
}

/** GET `/api/v1/doctors/:doctorId` — single doctor envelope. */
export interface ReferringDoctorDetailResponse {
  data: ReferringDoctor;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * PUT `/api/v1/referring-doctors/:id` — `doctorName` required; other fields optional on the API,
 * but the UI sends a full body for consistency with the backend contract.
 */
export interface UpdateReferringDoctorPayload {
  doctorName: string;
  specialization?: string;
  hospitalName?: string;
  mobile?: string;
  email?: string;
  isActive: boolean;
  branchId?: number | null;
}

/**
 * GET `/api/v1/doctors?pageNo=0&pageSize=10&branchId=`
 * Base: `NEXT_PUBLIC_API_URL1` (lims-patient)
 */
export async function fetchReferringDoctors(
  params: FetchReferringDoctorsParams
): Promise<ReferringDoctorsApiResponse> {
  const { pageNo, pageSize, branchId } = params;
  const queryParams: Record<string, string | number> = { pageNo, pageSize };
  if (branchId != null && Number.isFinite(branchId)) {
    queryParams.branchId = branchId;
  }
  return referringDoctorAxios.get('/api/v1/doctors/all', {
    params: queryParams,
  }) as Promise<ReferringDoctorsApiResponse>;
}

/**
 * GET `/api/v1/referring-doctors/search?searchKey=Sarah Smith`
 * Base: `NEXT_PUBLIC_API_URL1` (lims-patient)
 */
export async function searchReferringDoctors(
  params: SearchReferringDoctorsParams
): Promise<ReferringDoctorsSearchApiResponse> {
  return referringDoctorAxios.get('/api/v1/doctors/search', {
    params: { searchKey: params.searchKey.trim() },
  }) as Promise<ReferringDoctorsSearchApiResponse>;
}

/**
 * POST `/api/v1/doctors/register` — create a new doctor.
 */
export async function createReferringDoctor(
  payload: CreateReferringDoctorPayload
): Promise<unknown> {
  return referringDoctorAxios.post('/api/v1/doctors/register', payload);
}

/** GET `/api/v1/doctors/:doctorId` */
export async function fetchReferringDoctorById(id: number): Promise<ReferringDoctorDetailResponse> {
  return referringDoctorAxios.get(`/api/v1/doctors/${id}`) as Promise<ReferringDoctorDetailResponse>;
}

/** PUT `/api/v1/referring-doctors/:id` — switch to `patch` if your backend uses PATCH. */
export async function updateReferringDoctor(
  id: number,
  payload: UpdateReferringDoctorPayload
): Promise<unknown> {
  return referringDoctorAxios.put(`/api/v1/doctors/${id}`, payload);
}

/** DELETE `/api/v1/doctors/:id` */
export async function deleteReferringDoctor(id: number): Promise<unknown> {
  return referringDoctorAxios.delete(`/api/v1/doctors/${id}`);
}
