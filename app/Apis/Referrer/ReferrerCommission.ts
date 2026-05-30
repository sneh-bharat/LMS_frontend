import commissionAxios from '../Commission/axios';

/** POST create / PUT update referrer commission body. */
export interface CreateReferrerCommissionPayload {
  referrerId: number;
  referrerName: string;
  departmentId: number;
  departmentName: string;
  commissionPercentage: number;
  applyToAllTests: boolean;
  isActive: boolean;
}

export type UpdateReferrerCommissionPayload = CreateReferrerCommissionPayload;

/** Single referrer–department commission record from GET list. */
export interface ReferrerCommission {
  id: number;
  referrerId: number;
  referrerName: string;
  departmentId: number;
  departmentName?: string | null;
  commissionPercentage: number;
  applyToAllTests: boolean;
  isActive: boolean;
  description?: string | null;
}

export interface ReferrerCommissionListApiResponse {
  data: ReferrerCommission[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface ReferrerCommissionApiResponse {
  data?: unknown;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * POST `/api/v1/commissions/referrer` — create referrer commission.
 */
export async function createReferrerCommission(
  payload: CreateReferrerCommissionPayload
): Promise<ReferrerCommissionApiResponse> {
  return commissionAxios.post('/api/v1/commissions/referrer', payload) as Promise<ReferrerCommissionApiResponse>;
}

/**
 * GET `/api/v1/commissions/referrer/{referrerId}` — list commission rules for a referrer.
 */
export async function fetchReferrerCommissions(
  referrerId: number
): Promise<ReferrerCommissionListApiResponse> {
  return commissionAxios.get(
    `/api/v1/commissions/referrer/${referrerId}`
  ) as Promise<ReferrerCommissionListApiResponse>;
}

/**
 * PUT `/api/v1/commissions/referrer/{commissionId}` — update referrer commission.
 */
export async function updateReferrerCommission(
  commissionId: number,
  payload: UpdateReferrerCommissionPayload
): Promise<ReferrerCommissionApiResponse> {
  return commissionAxios.put(
    `/api/v1/commissions/referrer/${commissionId}`,
    payload
  ) as Promise<ReferrerCommissionApiResponse>;
}

/** DELETE `/api/v1/commissions/referrer/{commissionId}` */
export async function deleteReferrerCommissionById(
  commissionId: number
): Promise<ReferrerCommissionApiResponse> {
  return commissionAxios.delete(
    `/api/v1/commissions/referrer/${commissionId}`
  ) as Promise<ReferrerCommissionApiResponse>;
}
