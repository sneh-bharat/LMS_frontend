import commissionAxios from '../Commission/axios';
import bookingAxios from '../booking/axios';

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
/** POST `{NEXT_PUBLIC_API_Booking}/api/v1/commissions/doctor/{doctorId}/mark-paid` — mark commission paid. */
export interface MarkReferrerCommissionPaidParams {
  referrerId: number;
  startDate: string;
  endDate: string;
  amount: number;
  remarks?: string;
  paymentMethod: string;
  transactionReference?: string;
}

export interface ReferrerCommissionApiResponse {
  data?: unknown;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
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

export interface ReferrerPaymentHistoryItem {
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
  remarks: string | null;
}

export interface ReferrerPaymentHistorySummary {
  totalRecords: number;
  totalPaid: number;
  totalPending: number;
  totalAdvance: number;
  paymentCount: number;
}

export interface ReferrerPaymentHistoryData {
  summary: ReferrerPaymentHistorySummary;
  totalPages: number;
  pageSize: number;
  currentPage: number;
  totalElements: number;
  content: ReferrerPaymentHistoryItem[];
}

export interface PaymentHistoryApiResponse {
  data: ReferrerPaymentHistoryData;
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

export interface ReferrerCommissionRangeTestItem {
  testId?: number;
  testCode?: string;
  testName: string;
  mrpPrice: number;
  finalPrice: number;
  commissionAmount: number;
}
export interface ReferrerCommissionPaySummary {
  referrerId: number;
  totalOrderAmount: number;
  totalPaid: number;
  totalOrders: number;
  totalCommission: number;
  pendingAmount: number;
  totalPatients: number;
  tests?: ReferrerCommissionRangeTestItem[];
}

export interface ReferrerCommissionPayApiResponse {
  data: ReferrerCommissionPaySummary;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface ReferrerCommissionPayRangeParams {
  referrerId: number;
  startDate: string;
  endDate: string;
}

export interface ReferrerPaymentHistoryApiResponse {
  data: ReferrerPaymentHistoryData;
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

export interface ReferrerCommissionCalculationData {
  totalOrderAmount: number;
  referrerId: number;
  totalPaid: number;
  totalOrders: number;
  totalCommission: number;
  pendingAmount: number;
  totalPatients: number;
}

export interface ReferrerCommissionCalculationApiResponse {
  data: ReferrerCommissionCalculationData;
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

/** Per-test commission row from GET `/api/v1/commissions/referrer/{referrerId}/tests`. */
export interface ReferrerTestCommission {
  testId: number;
  testCode: string;
  testName: string;
  mrpPrice: number;
  finalPrice: number;
  commissionPercentage: number;
  commissionAmount: number;
}

export interface ReferrerTestCommissionListApiResponse {
  data: ReferrerTestCommission[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface UpdateReferrerTestCommissionOverridePayload {
  commissionPercentage: number;
}

/** Mark-paid POST response payload. */
export interface MarkReferrerCommissionPaidData {
  recordId: number;
  isPaid: boolean;
  totalOrderAmount: number;
  paidDate: string;
  referrerId: number;
  endDate: string;
  transactionReference?: string;
  paymentMethod: string;
  totalCommission: number;
  paidAmount: number;
  startDate: string;
  pendingAmount: number;
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
 * GET `/api/v1/referrer-commissions/calculate/referrer/{referrerId}/range?startDate=&endDate=`
 * — calculate referrer commission for a specific date range.
 */
export async function fetchReferrerCommissionPayByRange({
  referrerId,
  startDate,
  endDate,
}: ReferrerCommissionPayRangeParams): Promise<ReferrerCommissionPayApiResponse> {
  const params = new URLSearchParams({
    startDate: startDate.trim(),
    endDate: endDate.trim(),
  });
  return bookingAxios.get(
    `/referrer-commissions/calculate/referrer/${referrerId}/range?${params.toString()}`
  ) as Promise<ReferrerCommissionPayApiResponse>;
}


/**
 * GET `/api/v1/referrer-commissions/referrer/{referrerId}/payment-history?pageNo=0&pageSize=10`
 * — Get payment history with summary for a referrer.
 */
  export function fetchReferrerPaymentHistory(
  referrerId: number | null, 
  pageNo = 0,
  pageSize = 10
): Promise<ReferrerPaymentHistoryApiResponse> {
  const params = new URLSearchParams({
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
  });

  return bookingAxios.get(
    `/referrer-commissions/referrer/${referrerId}/payment-history?${params.toString()}`
  ) as Promise<ReferrerPaymentHistoryApiResponse>;
}

export async function fetchReferrerCommissionCalculation(
  referrerId: number
): Promise<ReferrerCommissionCalculationApiResponse> {
  return bookingAxios.get(
    `/referrer-commissions/calculate/referrer/${referrerId}`
  ) as Promise<ReferrerCommissionCalculationApiResponse>;
}


export async function markReferrerCommissionPaid({
  referrerId,
  startDate,
  endDate,
  amount,
  remarks,
  paymentMethod,
  transactionReference,
}: MarkReferrerCommissionPaidParams): Promise<ReferrerCommissionApiResponse> {
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
    `/referrer-commissions/referrer/${referrerId}/mark-paid?${params.toString()}`
  ) as Promise<ReferrerCommissionApiResponse>;
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

/**
 * GET `/api/v1/commissions/referrer/{referrerId}/tests` — list per-test commission for a referrer.
 */
export async function fetchReferrerTestCommissions(
  referrerId: number
): Promise<ReferrerTestCommissionListApiResponse> {
  return commissionAxios.get(
    `/api/v1/commissions/referrer/${referrerId}/tests`
  ) as Promise<ReferrerTestCommissionListApiResponse>;
}

/**
 * PUT `/api/v1/commissions/referrer/{referrerId}/tests/{testId}/override?commissionPercentage=`
 * — update per-test commission override (percentage) for a referrer.
 */
export async function updateReferrerCommissionByTestId(
  referrerId: number,
  testId: number,
  payload: UpdateReferrerTestCommissionOverridePayload
): Promise<ReferrerCommissionApiResponse> {
  const params = new URLSearchParams({
    commissionPercentage: String(payload.commissionPercentage),
  });
  return commissionAxios.put(
    `/api/v1/commissions/referrer/${referrerId}/tests/${testId}/override?${params.toString()}`
  ) as Promise<ReferrerCommissionApiResponse>;
}
