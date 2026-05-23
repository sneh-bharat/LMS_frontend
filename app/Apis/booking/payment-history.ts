import bookingAxios from './axios';

export interface PaymentStatisticsData {
  netCollection: number;
  totalTransactions: number;
  successfulTransactions: number;
  totalCollected: number;
  failedTransactions: number;
  totalRefunded: number;
  refundTransactions: number;
}

export interface PaymentStatisticsApiResponse {
  data: PaymentStatisticsData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchPaymentStatisticsParams {
  startDate: string;
  endDate: string;
}

/**
 * GET `/api/v1/payments/statistics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchPaymentStatistics(
  params: FetchPaymentStatisticsParams
): Promise<PaymentStatisticsApiResponse> {
  const { startDate, endDate } = params;

  if (!startDate?.trim() || !endDate?.trim()) {
    throw new Error('Start date and end date are required.');
  }
  if (startDate > endDate) {
    throw new Error('Start date must be on or before end date.');
  }

  const query = new URLSearchParams({
    startDate: startDate.trim(),
    endDate: endDate.trim(),
  });

  return bookingAxios.get(
    `/payments/statistics?${query.toString()}`
  ) as Promise<PaymentStatisticsApiResponse>;
}

export interface PaymentSearchRecord {
  id: number;
  orderId?: number;
  patientId?: number;
  amount: number;
  currency?: string;
  paymentMode: string;
  paymentStatus?: string | null;
  paymentType?: string | null;
  paymentDescription?: string | null;
  paymentDate?: string | null;
  paymentDateTime?: string | null;
  paidBy?: string | null;
  collectedBy?: string | null;
  receiptNumber?: string | null;
  referenceNumber?: string | null;
  transactionId?: string | null;
  patientName?: string | null;
  patientCode?: string | null;
  patientMobile?: string | null;
  mobileNumber?: string | null;
  invoiceNumber?: string | null;
  orderNumber?: string | null;
  visitType?: string | null;
  discount?: number | null;
  tax?: number | null;
  netAmount?: number | null;
  remarks?: string | null;
  isRefund?: boolean;
  parentTransactionId?: string | null;
  refundAmount?: number | null;
  refundDate?: string | null;
  refundReason?: string | null;
}

const PAYMENT_MODE_DISPLAY: Record<string, string> = {
  CASH: 'Cash',
  CARD: 'Card',
  UPI: 'UPI',
  ONLINE: 'UPI',
  CREDIT: 'Card',
  BANK_TRANSFER: 'Bank Transfer',
  NEFT: 'Bank Transfer',
  RTGS: 'Bank Transfer',
};

/** Maps API values like `CASH` / `Cash` to UI labels used in filters and icons. */
export function normalizePaymentModeLabel(mode: string | null | undefined): string {
  const raw = mode?.trim();
  if (!raw) return 'Cash';
  const key = raw.toUpperCase().replace(/\s+/g, '_');
  return PAYMENT_MODE_DISPLAY[key] ?? raw;
}

/** Maps UI filter labels to API path segment (e.g. `Cash` → `CASH`). */
export function paymentModeForApi(mode: string): string {
  const key = mode.trim();
  const reverse: Record<string, string> = {
    Cash: 'CASH',
    Card: 'CARD',
    UPI: 'UPI',
    'Bank Transfer': 'BANK_TRANSFER',
  };
  return reverse[key] ?? key.toUpperCase().replace(/\s+/g, '_');
}

/** Single payment row inside invoice transaction lookup. */
export interface PaymentTransactionRecord extends PaymentSearchRecord {
  paymentType?: string | null;
}

export interface PaymentTransactionsByInvoiceData {
  orderId: number;
  patientId: number;
  invoiceNumber: string;
  orderDate?: string;
  totalAmount: number;
  netAmount: number;
  discountAmount?: number;
  concessionAmount?: number;
  emergencyCharge?: number;
  contrastCharge?: number;
  paidAmount: number;
  refundedAmount?: number;
  pendingAmount?: number;
  paymentStatus?: string;
  isPaid?: boolean;
  paymentHistory: PaymentTransactionRecord[];
}

export interface PaymentTransactionsByInvoiceApiResponse {
  data: PaymentTransactionsByInvoiceData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/** Heuristic: route search to invoice transactions API when term looks like an invoice code. */
export function looksLikeInvoiceNumber(term: string): boolean {
  const t = term.trim();
  if (t.length < 6) return false;
  return (
    /inv/i.test(t) ||
    /^dcl-/i.test(t) ||
    /^rcp-/i.test(t) ||
    /^[A-Z]{2,}-\w+-\d{4}-\d+/i.test(t)
  );
}

/** Maps invoice lookup `paymentHistory` into list rows for the payment history table. */
export function mapInvoiceTransactionsToRecords(
  data: PaymentTransactionsByInvoiceData
): PaymentSearchRecord[] {
  return (data.paymentHistory ?? []).map((item) => ({
    ...item,
    orderId: item.orderId ?? data.orderId,
    invoiceNumber: data.invoiceNumber,
    netAmount: data.netAmount,
    discount: data.discountAmount ?? item.discount,
    remarks:
      item.remarks ??
      item.refundReason ??
      item.paymentDescription ??
      undefined,
    amount:
      item.isRefund && item.refundAmount != null && item.refundAmount > 0
        ? item.refundAmount
        : item.amount,
  }));
}

export interface PaymentSearchPage {
  content: PaymentSearchRecord[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first?: boolean;
  last?: boolean;
}

export interface PaymentSearchApiResponse {
  data: PaymentSearchPage | PaymentSearchRecord[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface FetchPaymentSearchParams {
  searchTerm: string;
  pageNo?: number;
  pageSize?: number;
}


export interface FetchPaymentsByModeParams {
  paymentMode: string;
  pageNo?: number;
  pageSize?: number;
}

function normalizePaymentListPage(
  raw: PaymentSearchPage | PaymentSearchRecord[] | undefined,
  pageNo: number,
  pageSize: number
): PaymentSearchPage {
  if (Array.isArray(raw)) {
    return {
      content: raw,
      pageNo,
      pageSize,
      totalElements: raw.length,
      totalPages: raw.length > 0 ? 1 : 0,
      first: pageNo === 0,
      last: true,
    };
  }

  const content = raw?.content ?? [];
  const size = raw?.pageSize ?? pageSize;
  const no = raw?.pageNo ?? pageNo;
  const totalElements = raw?.totalElements ?? content.length;
  const totalPages =
    raw?.totalPages ?? (size > 0 ? Math.max(1, Math.ceil(totalElements / size)) : 0);

  return {
    content,
    pageNo: no,
    pageSize: size,
    totalElements,
    totalPages,
    first: raw?.first ?? no === 0,
    last: raw?.last ?? no + 1 >= totalPages,
  };
}

export interface FetchAllPaymentsParams {
  pageNo?: number;
  pageSize?: number;
}

export interface PaymentListApiResponse {
  data: PaymentSearchPage | PaymentSearchRecord[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/payments/all?pageNo=0&pageSize=10`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchAllPayments(
  params: FetchAllPaymentsParams = {}
): Promise<PaymentListApiResponse> {
  const query = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });

  const res = (await bookingAxios.get(
    `/payments/all?${query.toString()}`
  )) as PaymentListApiResponse;

  if (res.data) {
    res.data = normalizePaymentListPage(
      res.data,
      params.pageNo ?? 0,
      params.pageSize ?? 10
    );
  }

  return res;
}

/**
 * GET `/api/v1/payments/search?searchTerm=UPI&pageNo=0&pageSize=10`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchPaymentSearch(
  params: FetchPaymentSearchParams
): Promise<PaymentSearchApiResponse> {
  const term = params.searchTerm.trim();
  if (!term) {
    throw new Error('searchTerm is required for payment search.');
  }

  const query = new URLSearchParams({
    searchTerm: term,
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });

  const res = (await bookingAxios.get(
    `/payments/search?${query.toString()}`
  )) as PaymentSearchApiResponse;

  if (res.data) {
    res.data = normalizePaymentListPage(
      res.data,
      params.pageNo ?? 0,
      params.pageSize ?? 10
    );
  }

  return res;
}

/**
 * GET `/api/v1/payments/mode/{paymentMode}?pageNo=0&pageSize=10`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchPaymentsByMode(
  params: FetchPaymentsByModeParams
): Promise<PaymentListApiResponse> {
  const mode = params.paymentMode.trim();
  if (!mode) {
    throw new Error('paymentMode is required for payments by mode.');
  }

  const query = new URLSearchParams({
    pageNo: String(params.pageNo ?? 0),
    pageSize: String(params.pageSize ?? 10),
  });

  const apiMode = paymentModeForApi(mode);

  const res = (await bookingAxios.get(
    `/payments/mode/${encodeURIComponent(apiMode)}?${query.toString()}`
  )) as PaymentListApiResponse;

  if (res.data) {
    res.data = normalizePaymentListPage(
      res.data,
      params.pageNo ?? 0,
      params.pageSize ?? 10
    );
  }

  return res;
}

/**
 * GET `/api/v1/payments/transactions/invoice/{invoiceNumber}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchPaymentTransactionsByInvoice(
  invoiceNumber: string
): Promise<PaymentTransactionsByInvoiceApiResponse> {
  const invoice = invoiceNumber.trim();
  if (!invoice) {
    throw new Error('Invoice number is required.');
  }

  return bookingAxios.get(
    `/payments/transactions/invoice/${encodeURIComponent(invoice)}`
  ) as Promise<PaymentTransactionsByInvoiceApiResponse>;
}
