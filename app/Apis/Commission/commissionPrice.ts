import commissionAxios from './axios';
import bookingAxios from '../booking/axios';

/** POST create / PUT update doctor commission body. */
export interface CreateDoctorCommissionPayload {
  doctorId: number;
  doctorName: string;
  departmentId: number;
  departmentName: string;
  commissionPercentage: number;
  applyToAllTests: boolean;
  isActive: boolean;
}

export type UpdateDoctorCommissionPayload = CreateDoctorCommissionPayload;

/** Single doctor–department commission record from GET list. */
export interface DoctorCommission {
  id: number;
  doctorId: number;
  doctorName: string;
  departmentId: number;
  departmentName?: string | null;
  commissionPercentage: number;
  applyToAllTests: boolean;
  isActive: boolean;
  description?: string | null;
}

export interface DoctorCommissionListApiResponse {
  data: DoctorCommission[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface DoctorCommissionApiResponse {
  data?: unknown;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * POST `/api/v1/commissions/doctor` — create doctor commission.
 * Auth: Bearer token (via `commissionAxios` request interceptor).
 */
export async function createDoctorCommission(
  payload: CreateDoctorCommissionPayload
): Promise<DoctorCommissionApiResponse> {
  return commissionAxios.post('/api/v1/commissions/doctor', payload) as Promise<DoctorCommissionApiResponse>;
}

/**
 * GET `/api/v1/commissions/doctor/{doctorId}` — list commission rules for a doctor.
 */
export async function fetchDoctorCommissions(
  doctorId: number
): Promise<DoctorCommissionListApiResponse> {
  return commissionAxios.get(`/api/v1/commissions/doctor/${doctorId}`) as Promise<DoctorCommissionListApiResponse>;
}

// GET `/api/v1/commissions/doctor/{{doctorId}}` — list commission rules for a doctor.
export async function fetchDoctorCommissionById(
  doctorId: number
): Promise<DoctorCommissionListApiResponse> {
  return commissionAxios.get(`/api/v1/commissions/doctor/${doctorId}`) as Promise<DoctorCommissionListApiResponse>;
}

/**
 * PUT `/api/v1/commissions/doctor/{commissionId}` — update doctor commission.
 */
export async function updateDoctorCommission(
  commissionId: number,
  payload: UpdateDoctorCommissionPayload
): Promise<DoctorCommissionApiResponse> {
  return commissionAxios.put(
    `/api/v1/commissions/doctor/${commissionId}`,
    payload
  ) as Promise<DoctorCommissionApiResponse>;
}

/** DELETE `/api/v1/commissions/doctor/{commissionId}` */
export async function deleteDoctorCommissionById(
  commissionId: number
): Promise<DoctorCommissionApiResponse> {
  return commissionAxios.delete(`/api/v1/commissions/doctor/${commissionId}`) as Promise<DoctorCommissionApiResponse>;
}

/** Single test commission row from GET `/api/v1/commissions/doctor/{doctorId}/tests`. */
export interface DoctorTestCommission {
  testId: number;
  testCode: string;
  testName: string;
  mrpPrice: number;
  finalPrice: number;
  commissionPercentage: number;
  commissionAmount: number;
}

export interface DoctorTestCommissionListApiResponse {
  data: DoctorTestCommission[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/commissions/doctor/{doctorId}/tests` — list per-test commission for a doctor.
 */
export async function fetchDoctorTestCommissions(
  doctorId: number
): Promise<DoctorTestCommissionListApiResponse> {
  return commissionAxios.get(
    `/api/v1/commissions/doctor/${doctorId}/tests`
  ) as Promise<DoctorTestCommissionListApiResponse>;
}

export interface UpdateDoctorTestCommissionOverridePayload {
  commissionAmount?: number;
  commissionPercentage?: number;
}

/**
 * PUT `/api/v1/commissions/doctor/{doctorId}/tests/{testId}/override`
 * — update per-test commission override for a doctor (send only changed fields).
 */
export async function updateDoctorCommissionByTestId(
  doctorId: number,
  testId: number,
  payload: UpdateDoctorTestCommissionOverridePayload
): Promise<DoctorCommissionApiResponse> {
  const params = new URLSearchParams();

  if (payload.commissionAmount != null && Number.isFinite(payload.commissionAmount)) {
    params.set('commissionAmount', String(payload.commissionAmount));
  }
  if (payload.commissionPercentage != null && Number.isFinite(payload.commissionPercentage)) {
    params.set('commissionPercentage', String(payload.commissionPercentage));
  }

  if (!params.toString()) {
    return Promise.reject(new Error('Provide commission amount or commission percentage to update.'));
  }

  return commissionAxios.put(
    `/api/v1/commissions/doctor/${doctorId}/tests/${testId}/override?${params.toString()}`
  ) as Promise<DoctorCommissionApiResponse>;
}

/** Doctor commission summary from GET `/api/v1/commissions/calculate/doctor/{doctorId}` (booking service). */
export interface DoctorCommissionRangeTestItem {
  testId?: number;
  testCode?: string;
  testName: string;
  mrpPrice: number;
  finalPrice: number;
  commissionAmount: number;
}

export interface DoctorCommissionPaySummary {
  doctorId: number;
  totalOrderAmount: number;
  totalPaid: number;
  totalOrders: number;
  totalCommission: number;
  pendingAmount: number;
  totalPatients: number;
  tests?: DoctorCommissionRangeTestItem[];
}

export interface DoctorCommissionPayApiResponse {
  data: DoctorCommissionPaySummary;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET commission amount by doctor — booking service
 * `NEXT_PUBLIC_API_Booking/api/v1/commissions/calculate/doctor/{doctorId}`.
 */
export async function fetchDoctorCommissionPay(
  doctorId: number
): Promise<DoctorCommissionPayApiResponse> {
  return bookingAxios.get(
    `/commissions/calculate/doctor/${doctorId}`
  ) as Promise<DoctorCommissionPayApiResponse>;
}

export interface DoctorCommissionPayRangeParams {
  doctorId: number;
  startDate: string;
  endDate: string;
}

/**
 * GET commission by doctor for a date range — booking service
 * `/api/v1/commissions/calculate/doctor/{doctorId}/range?startDate=&endDate=`.
 */
export async function fetchDoctorCommissionPayByRange({
  doctorId,
  startDate,
  endDate,
}: DoctorCommissionPayRangeParams): Promise<DoctorCommissionPayApiResponse> {
  const params = new URLSearchParams({
    startDate: startDate.trim(),
    endDate: endDate.trim(),
  });
  return bookingAxios.get(
    `/commissions/calculate/doctor/${doctorId}/range?${params.toString()}`
  ) as Promise<DoctorCommissionPayApiResponse>;
}

/** Single doctor commission payment record. */
export interface DoctorPaymentHistoryRecord {
  id: number;
  doctorId: number;
  doctorName: string;
  totalOrderAmount: number;
  commissionPercentage: number;
  commissionAmount: number;
  effectivePaid: number;
  advancePayment: number;
  isPaid: boolean;
  paidDate: string;
  createdAt: string;
  remarks?: string | null;
}

export interface DoctorPaymentHistorySummary {
  totalRecords: number;
  totalPaid: number;
  totalPending: number;
  totalAdvance: number;
  paymentCount: number;
}

export interface DoctorPaymentHistoryPage {
  summary: DoctorPaymentHistorySummary;
  content: DoctorPaymentHistoryRecord[];
  totalPages: number;
  pageSize: number;
  currentPage: number;
  totalElements: number;
}

export interface DoctorPaymentHistoryApiResponse {
  data: DoctorPaymentHistoryPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface DoctorPaymentHistoryParams {
  doctorId: number;
  pageNo?: number;
  pageSize?: number;
}

/**
 * GET `{NEXT_PUBLIC_API_Booking}/api/v1/commissions/doctor/{doctorId}/payment-history` — paginated payment history.
 */
export async function fetchDoctorPaymentHistory({
  doctorId,
  pageNo = 0,
  pageSize = 10,
}: DoctorPaymentHistoryParams): Promise<DoctorPaymentHistoryApiResponse> {
  const params = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });
  return bookingAxios.get(
    `/commissions/doctor/${doctorId}/payment-history?${params.toString()}`
  ) as Promise<DoctorPaymentHistoryApiResponse>;
}

/** POST `{NEXT_PUBLIC_API_Booking}/api/v1/commissions/doctor/{doctorId}/mark-paid` — mark commission paid. */
export interface MarkDoctorCommissionPaidParams {
  doctorId: number;
  startDate: string;
  endDate: string;
  amount: number;
  remarks?: string;
  paymentMethod: string;
  transactionReference?: string;
}

export async function markDoctorCommissionPaid({
  doctorId,
  startDate,
  endDate,
  amount,
  remarks,
  paymentMethod,
  transactionReference,
}: MarkDoctorCommissionPaidParams): Promise<DoctorCommissionApiResponse> {
  const params = new URLSearchParams({
    startDate: startDate.trim(),
    endDate: endDate.trim(),
    amount: String(amount),
    paymentMethod: paymentMethod.trim(),
  });

  if (remarks?.trim()) params.set('remarks', remarks.trim());
  if (transactionReference?.trim()) {
    params.set('transactionReference', transactionReference.trim());
  }

  return bookingAxios.post(
    `/commissions/doctor/${doctorId}/mark-paid?${params.toString()}`
  ) as Promise<DoctorCommissionApiResponse>;
}

/** @deprecated Use `markDoctorCommissionPaid` */
export type PayDoctorCommissionPayload = MarkDoctorCommissionPaidParams;

/** @deprecated Use `markDoctorCommissionPaid` */
export async function payDoctorCommission(
  doctorId: number,
  payload: Omit<MarkDoctorCommissionPaidParams, 'doctorId'>
): Promise<DoctorCommissionApiResponse> {
  return markDoctorCommissionPaid({ doctorId, ...payload });
}
