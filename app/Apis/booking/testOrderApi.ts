import bookingAxios from './axios';
import { normalizeCreateTestOrderPayload } from './testOrderPayloadUtils';

import type { OrderPriorityValue } from './orderPriority';

/** `com.sbpl.lims.enums.order.Priority` */
export type TestOrderPriority = OrderPriorityValue;
export type TestOrderStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | string;
export type TestOrderPaymentStatus = 'PAID' | 'UNPAID' | 'PARTIAL' | string;
export type TestOrderItemResultStatus = 'DRAFT' | string;

export interface TestOrderListItem {
  id: number;
  abnormalFlag?: string | null;
  discountPercentage: number;
  isActive: boolean;
  isCritical: boolean;
  netPrice: number;
  orderId: number;
  referenceRange?: string | null;
  remarks?: string | null;
  resultStatus: TestOrderItemResultStatus;
  resultValue?: string | null;
  sampleId?: number | null;
  testId: number;
  /** Present when booking service embeds test summary on order items. */
  testName?: string | null;
  testPrice: number;
  unit?: string | null;
}

export interface TestOrder {
  id: number;
  orderNumber: string;
  patientId: number;
  /** Present when booking service embeds patient summary on list/detail. */
  patientName?: string | null;
  referringDoctorId?: number | null;
  referringDoctorName?: string | null;
  referringHospitalId?: number | null;
  referringHospitalName?: string | null;
  orderDate: string;
  priority: TestOrderPriority;
  orderStatus: TestOrderStatus;
  paymentStatus: TestOrderPaymentStatus;
  drugAllergy?: string;
  lmpDate?: string | null;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasAnaemia: boolean;
  hasThyroid: boolean;
  hasArthritis: boolean;
  hasAsthma: boolean;
  otherPreExistingDisease?: string;
  referrerName?: string;
  srfId?: string;
  clinicalNotes?: string;
  isEmergency: boolean;
  isActive: boolean;
  isPaid: boolean;
  collectionDate?: string;
  collectionTime?: string;
  expectedReportDate?: string | null;
  actualReportDate?: string | null;
  orderItems: TestOrderListItem[];
  totalAmount: number;
  discountAmount: number;
  concessionAmount: number;
  concessionBy?: string;
  emergencyCharge: number;
  collectorName?: string;
  contrastCharge: number;
  actualPayable: number;
  netAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentMode?: string;
  paymentReference?: string;
  createdByName?: string;
  createdAt: string;
  updatedAt: string;
  turnaroundTimeHours?: number;
  branchId?: number;
}

export interface TestOrdersPage {
  content: TestOrder[];
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
}

export interface TestOrdersListApiResponse {
  data: TestOrdersPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchTestOrdersParams {
  pageNo?: number;
  pageSize?: number;
  sortBy?: string;
  branchId?: number;
}

export interface TestOrderItemPayload {
  testId: number;
  testPrice: number;
  discountPercentage: number;
  netPrice: number;
}

/** POST `/api/v1/test-orders` request body (ThinkLAB booking contract). */
export interface CreateTestOrderPayload {
  patientId: number;
  /** Referring doctor id */
  referringDoctor?: number | null;
  /** Referring hospital id */
  referringHospital?: number | null;
  orderDate: string;
  priority: TestOrderPriority;
  drugAllergy?: string;
  lmpDate?: string | null;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasAnaemia: boolean;
  hasThyroid: boolean;
  hasArthritis: boolean;
  hasAsthma: boolean;
  otherPreExistingDisease?: string;
  referrerName?: string;
  srfId?: string;
  clinicalNotes?: string;
  isEmergency: boolean;
  collectionDate?: string;
  collectionTime?: string;
  expectedReportDate?: string;
  orderItems: TestOrderItemPayload[];
  totalAmount: number;
  discountAmount: number;
  concessionAmount: number;
  concessionBy?: string;
  emergencyCharge: number;
  collectorName?: string;
  contrastCharge: number;
  actualPayable: number;
  netAmount: number;
  paidAmount: number;
  paymentMode: string;
  paymentReference?: string;
  createdByName?: string;
  branchId: number;
}

export interface TestOrderResponseData {
  id?: number;
  orderNumber?: string;
  [key: string]: unknown;
}

export interface TestOrderApiResponse {
  data: TestOrderResponseData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface TestOrderDetailApiResponse {
  data: TestOrder;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * Partial PUT body — patient / order medical information only.
 * `PUT /api/v1/test-orders/{orderId}`
 */
export interface UpdateTestOrderMedicalPayload {
  drugAllergy?: string;
  lmpDate?: string | null;
  hasDiabetes: boolean;
  hasHypertension: boolean;
  hasAnaemia?: boolean;
  hasThyroid: boolean;
  hasArthritis?: boolean;
  hasAsthma: boolean;
  otherPreExistingDisease?: string;
}

/**
 * Partial PUT body — order financial information only.
 * `PUT /api/v1/test-orders/{orderId}`
 */
export interface UpdateTestOrderFinancialPayload {
  concessionAmount: number;
  concessionBy?: string;
  emergencyCharge: number;
  collectorName?: string;
  contrastCharge: number;
  actualPayable: number;
  processingType: string;
}

/**
 * POST `/api/v1/test-orders` — create diagnostic test booking.
 * Auth: `Authorization: Bearer <token>` from `localStorage.token` (see `booking/axios.ts`).
 */
export async function createTestOrder(
  payload: CreateTestOrderPayload
): Promise<TestOrderApiResponse> {
  const body = normalizeCreateTestOrderPayload(payload);
  return bookingAxios.post('/test-orders', body) as Promise<TestOrderApiResponse>;
}

/**
 * GET `/api/v1/test-orders?pageNo=0&pageSize=10&sortBy=createdAt`
 */
export async function fetchTestOrders(
  params: FetchTestOrdersParams = {}
): Promise<TestOrdersListApiResponse> {
  const search = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
    sortBy: params.sortBy ?? 'createdAt',
  });
  if (params.branchId != null && params.branchId > 0) {
    search.set('branchId', String(params.branchId));
  }
  return bookingAxios.get(`/test-orders?${search.toString()}`) as Promise<TestOrdersListApiResponse>;
}

/**
 * GET `/api/v1/test-orders/order-number/{orderNumber}` — lookup by invoice / order number.
 */
export async function fetchTestOrderByOrderNumber(
  orderNumber: string
): Promise<TestOrderDetailApiResponse> {
  const encoded = encodeURIComponent(orderNumber.trim());
  return bookingAxios.get(
    `/test-orders/order-number/${encoded}`
  ) as Promise<TestOrderDetailApiResponse>;
}

/**
 * GET `/api/v1/test-orders/patient/{patientId}?pageNo=0&pageSize=10` — orders for a patient.
 */
export async function fetchTestOrdersByPatientId(
  patientId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<TestOrdersListApiResponse> {
  const params = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });
  return bookingAxios.get(
    `/test-orders/patient/${patientId}?${params.toString()}`
  ) as Promise<TestOrdersListApiResponse>;
}

export interface PatientInvoiceItem {
  id: number;
  invoiceNumber: string;
  orderDate: string;
  createdAt: string;
  isPaid: boolean;
  paymentStatus: string;
  total: number;
  netAmount: number;
  paid: number;
  pending: number;
  discount: number;
  refunded: number;
}

export interface PatientInvoiceTotals {
  totalAmount: number;
  totalPaid: number;
  totalPending: number;
  totalDiscount: number;
  totalRefunded: number;
}

export interface PatientInvoicePatientSummary {
  id: number;
  patientCode?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  age?: number | null;
}

/** Raw paginated payload from GET `/test-orders/patient/{id}/invoices`. */
interface PatientInvoicesPageRaw {
  content?: PatientInvoiceItem[];
  invoices?: PatientInvoiceItem[];
  patient?: PatientInvoicePatientSummary;
  patientId?: number;
  pageNo?: number;
  pageSize?: number;
  totalPages?: number;
  totalElements?: number;
  totals?: PatientInvoiceTotals;
  first?: boolean;
  last?: boolean;
}

export interface PatientInvoicesPage {
  invoices: PatientInvoiceItem[];
  patient?: PatientInvoicePatientSummary;
  patientId: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  totals: PatientInvoiceTotals;
  first?: boolean;
  last?: boolean;
}

function normalizePatientInvoicesPage(
  raw: PatientInvoicesPageRaw,
  pageNo: number,
  pageSize: number
): PatientInvoicesPage {
  const invoices = raw.invoices ?? raw.content ?? [];
  const totalElements = raw.totalElements ?? invoices.length;
  const size = raw.pageSize ?? pageSize;
  const no = raw.pageNo ?? pageNo;
  const totalPages = raw.totalPages ?? Math.max(1, Math.ceil(totalElements / Math.max(size, 1)));

  return {
    invoices,
    patient: raw.patient,
    patientId: raw.patientId ?? raw.patient?.id ?? 0,
    pageNo: no,
    pageSize: size,
    totalPages,
    totalElements,
    totals: raw.totals ?? {
      totalAmount: 0,
      totalPaid: 0,
      totalPending: 0,
      totalDiscount: 0,
      totalRefunded: 0,
    },
    first: raw.first ?? no === 0,
    last: raw.last ?? no + 1 >= totalPages,
  };
}

export interface PatientInvoicesApiResponse {
  data: PatientInvoicesPage;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/test-orders/patient/{patientId}/invoices?pageNo=0&pageSize=10`
 * Auth: Bearer token via `bookingAxios`.
 */
export async function fetchPatientInvoices(
  patientId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<PatientInvoicesApiResponse> {
  const params = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });
  const res = (await bookingAxios.get(
    `/test-orders/patient/${patientId}/invoices?${params.toString()}`
  )) as PatientInvoicesApiResponse & { data?: PatientInvoicesPageRaw };

  if (!res?.data) return res;

  return {
    ...res,
    data: normalizePatientInvoicesPage(res.data, pageNo, pageSize),
  };
}

/** Order status values accepted by GET `/test-orders/status/{status}`. */
export type TestOrderStatusFilter = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * GET `/api/v1/test-orders/status/{status}?pageNo=0&pageSize=10` — orders by status.
 */
export async function fetchTestOrdersByStatus(
  status: TestOrderStatusFilter,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<TestOrdersListApiResponse> {
  const params = new URLSearchParams({
    pageNo: String(pageNo),
    pageSize: String(pageSize),
  });
  return bookingAxios.get(
    `/test-orders/status/${encodeURIComponent(status)}?${params.toString()}`
  ) as Promise<TestOrdersListApiResponse>;
}

export interface FetchTestOrdersByDateRangeParams {
  startDate: string;
  endDate: string;
  pageNo?: number;
  pageSize?: number;
}

function normalizeTestOrdersPage(
  page: TestOrdersPage,
  pageNo: number,
  pageSize: number
): TestOrdersPage {
  const totalElements = page.totalElements ?? page.content?.length ?? 0;
  const size = page.pageSize ?? pageSize;
  const no = page.pageNo ?? pageNo;
  const totalPages = page.totalPages ?? Math.max(1, Math.ceil(totalElements / size));
  return {
    ...page,
    content: page.content ?? [],
    pageNo: no,
    pageSize: size,
    totalElements,
    totalPages,
    first: page.first ?? no === 0,
    last: page.last ?? no + 1 >= totalPages,
  };
}

export interface FetchTestOrdersBySearchParams {
  searchTerm: string;
  pageNo?: number;
  pageSize?: number;
}

/**
 * GET `/api/v1/test-orders/search?searchTerm=Emergency&pageNo=0&pageSize=10`
 * Search orders by processing / priority type (Routine, Urgent, Emergency, Timed, etc.).
 */
export async function fetchTestOrdersBySearch(
  params: FetchTestOrdersBySearchParams
): Promise<TestOrdersListApiResponse> {
  const term = params.searchTerm.trim();
  if (!term) {
    throw new Error('searchTerm is required for test order search.');
  }
  const search = new URLSearchParams({
    searchTerm: term,
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });
  const res = (await bookingAxios.get(
    `/test-orders/search?${search.toString()}`
  )) as TestOrdersListApiResponse;

  if (res.data) {
    res.data = normalizeTestOrdersPage(res.data, params.pageNo ?? 0, params.pageSize ?? 10);
  }
  return res;
}

/**
 * GET `/api/v1/test-orders/date-range?startDate=&endDate=&pageNo=0&pageSize=10`
 */
export async function fetchTestOrdersByDateRange(
  params: FetchTestOrdersByDateRangeParams
): Promise<TestOrdersListApiResponse> {
  const search = new URLSearchParams({
    startDate: params.startDate,
    endDate: params.endDate,
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });
  const res = (await bookingAxios.get(
    `/test-orders/date-range?${search.toString()}`
  )) as TestOrdersListApiResponse;

  if (res.data) {
    res.data = normalizeTestOrdersPage(
      res.data,
      params.pageNo ?? 0,
      params.pageSize ?? 10
    );
  }
  return res;
}

/**
 * GET `/api/v1/test-orders/{id}` — falls back to list search if detail route is unavailable.
 */
export async function fetchTestOrderById(orderId: number): Promise<TestOrderDetailApiResponse> {
  try {
    return (await bookingAxios.get(`/test-orders/${orderId}`)) as TestOrderDetailApiResponse;
  } catch (detailError) {
    const list = await fetchTestOrders({ pageNo: 0, pageSize: 500, sortBy: 'createdAt' });
    const order = list.data?.content?.find((o) => o.id === orderId);
    if (!order) {
      throw detailError instanceof Error
        ? detailError
        : new Error('Test order not found');
    }
    return {
      data: order,
      message: list.message ?? 'Test order loaded from list',
      response: list.response ?? true,
      status: list.status ?? '200 OK',
      timestamp: list.timestamp,
    };
  }
}

/**
 * PUT `/api/v1/test-orders/{orderId}` — partial update (send only fields being changed).
 */
export async function updateTestOrder(
  orderId: number,
  payload: UpdateTestOrderMedicalPayload | UpdateTestOrderFinancialPayload
): Promise<TestOrderApiResponse> {
  return bookingAxios.put(`/test-orders/${orderId}`, payload) as Promise<TestOrderApiResponse>;
}

/** PUT medical fields only on `PUT /api/v1/test-orders/{orderId}`. */
export async function updateTestOrderMedical(
  orderId: number,
  payload: UpdateTestOrderMedicalPayload
): Promise<TestOrderApiResponse> {
  return updateTestOrder(orderId, payload);
}

/** PUT financial fields only on `PUT /api/v1/test-orders/{orderId}`. */
export async function updateTestOrderFinancial(
  orderId: number,
  payload: UpdateTestOrderFinancialPayload
): Promise<TestOrderApiResponse> {
  return updateTestOrder(orderId, payload);
}

/**
 * DELETE `/api/v1/test-orders/{orderId}` — remove a diagnostic test order / invoice.
 */
export async function deleteTestOrder(orderId: number): Promise<TestOrderApiResponse> {
  return bookingAxios.delete(`/test-orders/${orderId}`) as Promise<TestOrderApiResponse>;
}

/** DELETE `/api/v1/test-orders/bulk` request body. */
export interface BulkDeleteTestOrdersPayload {
  orderIds: number[];
}

/**
 * DELETE `/api/v1/test-orders/bulk` — remove multiple diagnostic test orders.
 */
export async function bulkDeleteTestOrders(
  payload: BulkDeleteTestOrdersPayload
): Promise<TestOrderApiResponse> {
  return bookingAxios.delete('/test-orders/bulk', {
    data: payload,
  }) as Promise<TestOrderApiResponse>;
}
