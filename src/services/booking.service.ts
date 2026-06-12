import { bookingClient, ordersClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/types';

export interface TestOrderListParams {
  page?: number;
  size?: number;
  status?: string;
  patientId?: number;
  fromDate?: string;
  toDate?: string;
  branchId?: number;
}

export interface TestOrderSummary {
  id: number;
  orderNumber: string;
  patientId: number;
  patientName?: string | null;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
  netAmount?: number;
  paidAmount?: number;
  dueAmount?: number;
}

export interface PaymentPayload {
  orderId: number;
  amount: number;
  paymentMode: string;
  remarks?: string;
}

export const bookingService = {
  listOrders: (params: TestOrderListParams): Promise<PaginatedResponse<TestOrderSummary>> =>
    ordersClient.get('/test-orders', { params }),

  getOrder: (id: number): Promise<{ data: TestOrderSummary }> =>
    ordersClient.get(`/test-orders/${id}`),

  createPayment: (payload: PaymentPayload) =>
    bookingClient.post('/payments', payload),

  getPaymentsByOrder: (orderId: number) =>
    bookingClient.get(`/payments/order/${orderId}`),

  cancelOrder: (id: number, reason: string) =>
    ordersClient.put(`/test-orders/${id}/cancel`, { reason }),

  getPatientLastVisit: (patientId: number) =>
    ordersClient.get(`/test-orders/patient/${patientId}/last-visit`),
};
