import referringDoctorAxios from './axios';

export interface ReferringDoctor {
  id: number;
  doctorName: string;
  mobile: string;
  email?: string | null;
  hospitalName?: string | null;
  specialization?: string | null;
  branchId: number | null;
  tenantId?: number;
  isActive: boolean;
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

/** POST `/api/v1/referring-doctors` request body (matches backend contract). */
export interface CreateReferringDoctorPayload {
  doctorName: string;
  branchId: number;
  specialization: string;
  hospitalName: string;
  mobile: string;
  email: string;
  isActive: boolean;
}

/** GET `/api/v1/referring-doctors/:id` — single doctor envelope. */
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
 * GET `/api/v1/referring-doctors?pageNo=&pageSize=&branchId=`
 */
export async function fetchReferringDoctors(
  params: FetchReferringDoctorsParams
): Promise<ReferringDoctorsApiResponse> {
  const search = new URLSearchParams({
    pageNo: String(params.pageNo),
    pageSize: String(params.pageSize),
  });
  if (params.branchId != null && Number.isFinite(params.branchId)) {
    search.set('branchId', String(params.branchId));
  }
  const data = (await referringDoctorAxios.get(
    `/referring-doctors?${search.toString()}`
  )) as ReferringDoctorsApiResponse;
  return data;
}

/**
 * POST `/api/v1/referring-doctors` — create a referring doctor.
 */
export async function createReferringDoctor(
  payload: CreateReferringDoctorPayload
): Promise<unknown> {
  return referringDoctorAxios.post('/referring-doctors', payload);
}

/** GET `/api/v1/referring-doctors/:id` */
export async function fetchReferringDoctorById(id: number): Promise<ReferringDoctorDetailResponse> {
  return referringDoctorAxios.get(`/referring-doctors/${id}`) as Promise<ReferringDoctorDetailResponse>;
}

/** PUT `/api/v1/referring-doctors/:id` — switch to `patch` if your backend uses PATCH. */
export async function updateReferringDoctor(
  id: number,
  payload: UpdateReferringDoctorPayload
): Promise<unknown> {
  return referringDoctorAxios.put(`/referring-doctors/${id}`, payload);
}

/** DELETE `/api/v1/referring-doctors/:id` */
export async function deleteReferringDoctor(id: number): Promise<unknown> {
  return referringDoctorAxios.delete(`/referring-doctors/${id}`);
}
