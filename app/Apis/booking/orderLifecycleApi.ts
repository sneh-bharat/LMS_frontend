import bookingAxios from './axios';
import type { TestOrderApiResponse } from './testOrderApi';

export interface OrderCancellationDetails {
  id: number;
  orderId: number;
  orderNumber: string | null;
  cancellationReason: string;
  cancellationNotes: string | null;
  cancellationDateTime: string;
  cancelledBy: string;
  refundAmount: number;
  refundStatus: string;
  refundReference: string | null;
  notificationSent: boolean;
  notificationDateTime: string | null;
}

export interface CancellationDetailsApiResponse {
  data: OrderCancellationDetails;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface CancelTestOrderPayload {
  cancellationReason: string;
  cancellationNotes?: string;
  refundAmount: number;
}

export interface ProcessOrderPaymentPayload {
  orderId: number;
  amount: number;
  paymentMode: string;
  remarks?: string;
}

export interface ProcessOrderPaymentApiResponse {
  data?: unknown;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

export interface LifecycleModification {
  fieldName: string;
  id: number;
  ipAddress: string | null;
  modificationDateTime: string;
  modificationType: string;
  modifiedBy: string;
  newValue: string | null;
  oldValue: string | null;
  orderId: number;
  reasonForChange: string | null;
}

export interface OrderLifecycleTrackData {
  totalNotifications: number;
  isCancelled: boolean;
  orderNumber: string;
  createdDate: string;
  orderId: number;
  currentStatus: string;
  totalModifications: number;
  recentModifications: LifecycleModification[];
  cancellationDetails: OrderCancellationDetails | null;
  orderDate: string;
  notifications: unknown[];
}

export interface TrackOrderLifecycleApiResponse {
  data: OrderLifecycleTrackData;
  message: string;
  response: boolean;
  status: string;
  timestamp?: string;
}

/**
 * GET `/api/v1/order-lifecycle/{orderId}/cancellation`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchCancellationDetails(
  orderId: number
): Promise<CancellationDetailsApiResponse> {
  if (!orderId || orderId < 1) {
    throw new Error('A valid order ID is required to load cancellation details.');
  }

  return bookingAxios.get(
    `/order-lifecycle/${orderId}/cancellation`
  ) as Promise<CancellationDetailsApiResponse>;
}

/**
 * POST `/api/v1/order-lifecycle/{orderId}/cancel`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function cancelTestOrder(
  orderId: number,
  payload: CancelTestOrderPayload
): Promise<TestOrderApiResponse> {
  if (!orderId || orderId < 1) {
    throw new Error('A valid order ID is required to cancel.');
  }

  return bookingAxios.post(
    `/order-lifecycle/${orderId}/cancel`,
    payload
  ) as Promise<TestOrderApiResponse>;
}

/**
 * GET `/api/v1/order-lifecycle/{orderId}/track`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function fetchTrackOrderLifecycle(
  orderId: number
): Promise<TrackOrderLifecycleApiResponse> {
  if (!orderId || orderId < 1) {
    throw new Error('A valid order ID is required to track lifecycle.');
  }

  return bookingAxios.get(
    `/order-lifecycle/${orderId}/track`
  ) as Promise<TrackOrderLifecycleApiResponse>;
}

/**
 * POST `/api/v1/payments/process`
 * Auth: Bearer token from `localStorage.token` via `bookingAxios`.
 */
export async function processOrderPayment(
  payload: ProcessOrderPaymentPayload
): Promise<ProcessOrderPaymentApiResponse> {
  if (!payload.orderId || payload.orderId < 1) {
    throw new Error('A valid order ID is required to process payment.');
  }
  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw new Error('Payment amount must be greater than zero.');
  }
  if (!payload.paymentMode?.trim()) {
    throw new Error('Payment mode is required.');
  }

  return bookingAxios.post('/payments/process', {
    orderId: payload.orderId,
    amount: payload.amount,
    paymentMode: payload.paymentMode.trim().toUpperCase(),
    remarks: payload.remarks?.trim() || undefined,
  }) as Promise<ProcessOrderPaymentApiResponse>;
}
