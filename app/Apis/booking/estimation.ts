import bookingAxios, { readAuthTokenFromLocalStorage } from './axios';

/**
 * Estimations resource on the booking service.
 * `bookingAxios` base URL is `{NEXT_PUBLIC_API_Booking}/api/v1`, so requests resolve to:
 * - `GET  /api/v1/estimations`
 * - `POST /api/v1/estimations` (create estimation)
 */
export const ESTIMATIONS_API_PATH = '/estimations' as const;

export interface EstimationItem {
  id: number;
  testId: number;
  testCode?: string | null;
  testName?: string | null;
  categoryName?: string | null;
  departmentName?: string | null;
  basePrice?: number | null;
  quantity?: number | null;
  totalPrice?: number | null;
  netPrice?: number | null;
  discountAmount?: number | null;
  discountPercentage?: number | null;
  isPackageItem?: boolean | null;
  packageName?: string | null;
  vialType?: string | null;
  estimatedSlaHours?: number | null;
  remarks?: string | null;
  isActive?: boolean | null;
}

export interface Estimation {
  id: number;
  estimationNumber: string;
  patientId: number;
  priority: string;
  estimationStatus: string;
  approvalStatus: string;
  finalAmount: number;
  createdByName?: string | null;
  estimatedCollectionDate?: string | null;
  estimatedCollectionTime?: string | null;
  estimationDate?: string | null;
  validUntil?: string | null;
  totalAmount?: number | null;
  netAmount?: number | null;
  isConverted?: boolean | null;
  convertedOrderId?: number | null;
  isEmergency?: boolean | null;
  referrerName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  estimationItems?: EstimationItem[] | null;
  [key: string]: unknown;
}

export interface EstimationsPage {
  content: Estimation[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

export interface EstimationsListApiResponse {
  data: EstimationsPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchEstimationsParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
}

function buildEstimationsQuery(params: FetchEstimationsParams): URLSearchParams {
  const query = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });
  if (params.sortBy?.trim()) {
    query.set('sortBy', params.sortBy.trim());
  }
  return query;
}

function normalizeEstimationsPage(raw: EstimationsPage | undefined): EstimationsPage {
  const content = Array.isArray(raw?.content) ? raw.content : [];
  return {
    content,
    pageNo: raw?.pageNo ?? 0,
    pageSize: raw?.pageSize ?? 10,
    totalElements: raw?.totalElements ?? content.length,
    totalPages: raw?.totalPages ?? 1,
    first: raw?.first,
    last: raw?.last,
  };
}

/** Human-readable enum label (e.g. DRAFT → Draft). */
export function formatEstimationLabel(value?: string | null): string {
  const s = value?.trim();
  if (!s) return '—';
  return s
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatEstimationCurrency(amount?: number | null): string {
  const n = Number(amount);
  if (!Number.isFinite(n)) return '—';
  return `₹${n.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatEstimationDate(value?: string | null): string {
  if (!value?.trim()) return '—';
  const d = new Date(value.trim());
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return value.trim();
}

/**
 * GET `/api/v1/estimations?pageNo=0&pageSize=10&sortBy=createdAt`
 *
 * Uses `bookingAxios`, which attaches `Authorization: Bearer <token>` from
 * `localStorage.getItem('token')` on every request (see `app/Apis/booking/axios.ts`).
 */
export interface EstimationItemCreatePayload {
  testId: number;
  basePrice: number;
  netPrice: number;
  quantity: number;
}

/** POST `/api/v1/estimations` request body. */
export interface CreateEstimationPayload {
  patientId: number;
  estimationDate: string;
  validUntil: string;
  priority: string;
  referringDoctor?: number | null;
  referringHospital?: number | null;
  clinicalNotes?: string;
  drugAllergy?: string;
  lmpDate?: string | null;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasAnaemia: boolean;
  hasThyroid: boolean;
  hasArthritis: boolean;
  hasAsthma: boolean;
  otherPreExistingDisease?: string | null;
  isEmergency: boolean;
  referrerName?: string;
  srfId?: string;
  totalAmount: number;
  discountAmount: number;
  discountPercentage: number;
  concessionAmount: number;
  concessionBy?: string;
  emergencyCharge: number;
  contrastCharge: number;
  estimatedTaxAmount: number;
  estimatedCollectionDate?: string;
  estimatedCollectionTime?: string;
  estimatedReportDate?: string;
  requestedBy?: string;
  contactEmail?: string;
  contactPhone?: string;
  remarks?: string;
  createdByName?: string;
  branchId: number;
  estimationItems: EstimationItemCreatePayload[];
}

export interface CreateEstimationResponseData {
  id?: number;
  estimationNumber?: string;
  [key: string]: unknown;
}

export interface CreateEstimationApiResponse {
  data: CreateEstimationResponseData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Normalize POST body before `POST /api/v1/estimations`. */
export function normalizeCreateEstimationPayload(
  payload: CreateEstimationPayload
): CreateEstimationPayload {
  return {
    ...payload,
    lmpDate: payload.lmpDate?.trim() ? payload.lmpDate.trim() : null,
    otherPreExistingDisease: payload.otherPreExistingDisease?.trim()
      ? payload.otherPreExistingDisease.trim()
      : null,
    totalAmount: roundMoney(payload.totalAmount),
    discountAmount: roundMoney(payload.discountAmount),
    discountPercentage: roundMoney(payload.discountPercentage),
    concessionAmount: roundMoney(payload.concessionAmount),
    emergencyCharge: roundMoney(payload.emergencyCharge),
    contrastCharge: roundMoney(payload.contrastCharge),
    estimatedTaxAmount: roundMoney(payload.estimatedTaxAmount),
    estimationItems: payload.estimationItems.map((item) => ({
      testId: item.testId,
      basePrice: roundMoney(item.basePrice),
      netPrice: roundMoney(item.netPrice),
      quantity: item.quantity > 0 ? item.quantity : 1,
    })),
  };
}

/**
 * **Create estimation** — `POST /api/v1/estimations`
 *
 * Uses `bookingAxios` (`NEXT_PUBLIC_API_Booking` + `/api/v1`) with
 * `Authorization: Bearer <token>` from `localStorage.token`.
 */
export async function createEstimation(
  payload: CreateEstimationPayload
): Promise<CreateEstimationApiResponse> {
  const token = readAuthTokenFromLocalStorage();
  if (!token?.trim()) {
    throw new Error('Authentication required. Please log in again.');
  }

  const body = normalizeCreateEstimationPayload(payload);
  const res = (await bookingAxios.post(
    ESTIMATIONS_API_PATH,
    body
  )) as CreateEstimationApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to create estimation.');
  }

  return res;
}

export async function fetchEstimations(
  params: FetchEstimationsParams = {}
): Promise<EstimationsListApiResponse> {
  const token = readAuthTokenFromLocalStorage();
  if (!token?.trim()) {
    throw new Error('Authentication required. Please log in again.');
  }

  const query = buildEstimationsQuery({
    ...params,
    sortBy: params.sortBy ?? 'createdAt',
  });

  const res = (await bookingAxios.get(
    `${ESTIMATIONS_API_PATH}?${query.toString()}`
  )) as EstimationsListApiResponse;

  if (res.response === false) {
    throw new Error(res.message || 'Failed to load estimations.');
  }

  return {
    ...res,
    data: normalizeEstimationsPage(res.data),
  };
}
