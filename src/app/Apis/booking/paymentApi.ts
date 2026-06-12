import bookingAxios from './axios';

export interface PaymentHistoryItem {
  id: number;
  amount: number;
  paymentMode: string;
  paymentDateTime?: string | null;
  transactionReference?: string | null;
  remarks?: string | null;
  status?: string | null;
  processedBy?: string | null;
}

export interface PaymentTransactionDetail extends PaymentHistoryItem {
  orderId?: number;
  balanceAfterPayment?: number | null;
}

export interface OrderPaymentSummaryData {
  orderId: number;
  orderNumber: string;
  totalAmount: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  pendingAmount: number;
  paymentStatus: string;
  isPaid: boolean;
  nextAction: string;
  paymentHistory?: PaymentHistoryItem[];
  transactions?: PaymentTransactionDetail[];
}

export interface PaymentSummaryApiResponse {
  data: OrderPaymentSummaryData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/payments/summary/{orderId}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchPaymentSummaryByOrder(
  orderId: number
): Promise<PaymentSummaryApiResponse> {
  if (!orderId || orderId < 1) {
    throw new Error('A valid order ID is required to load payment summary.');
  }

  return bookingAxios.get(
    `/payments/summary/${orderId}`
  ) as Promise<PaymentSummaryApiResponse>;
}

export interface PaymentTransaction {
  id: number;
  orderId: number;
  amount: number;
  currency: string;
  paymentMode: string;
  paymentStatus: string;
  paymentType: string;
  paymentDescription: string | null;
  paymentDate: string;
  collectedBy: string;
  receiptNumber: string | null;
  referenceNumber: string | null;
  transactionId: string | null;
  isRefund: boolean;
}

export interface PaymentTransactionsApiResponse {
  data: PaymentTransaction[];
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/payments/transactions/{orderId}`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchPaymentTransactions(
  orderId: number
): Promise<PaymentTransactionsApiResponse> {
  if (!orderId || orderId < 1) {
    throw new Error('A valid order ID is required to load payment transactions.');
  }

  return bookingAxios.get(
    `/payments/transactions/${orderId}`
  ) as Promise<PaymentTransactionsApiResponse>;
}

export interface ProcessPaymentRefundPayload {
  transactionId: number;
  orderId: number;
  refundAmount: number;
  refundReason: string;
  processedBy: string;
  remarks?: string;
}

export interface ProcessPaymentRefundApiResponse {
  data?: unknown;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * POST `/api/v1/payments/refund`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function processPaymentRefund(
  payload: ProcessPaymentRefundPayload
): Promise<ProcessPaymentRefundApiResponse> {
  if (!payload.transactionId || payload.transactionId < 1) {
    throw new Error('A valid transaction ID is required to process refund.');
  }
  if (!payload.orderId || payload.orderId < 1) {
    throw new Error('A valid order ID is required to process refund.');
  }
  if (!Number.isFinite(payload.refundAmount) || payload.refundAmount <= 0) {
    throw new Error('Refund amount must be greater than zero.');
  }
  if (!payload.refundReason?.trim()) {
    throw new Error('Refund reason is required.');
  }
  if (!payload.processedBy?.trim()) {
    throw new Error('Processed by is required.');
  }

  return bookingAxios.post('/payments/refund', {
    transactionId: payload.transactionId,
    orderId: payload.orderId,
    refundAmount: payload.refundAmount,
    refundReason: payload.refundReason.trim(),
    processedBy: payload.processedBy.trim(),
    remarks: payload.remarks?.trim() || undefined,
  }) as Promise<ProcessPaymentRefundApiResponse>;
}
