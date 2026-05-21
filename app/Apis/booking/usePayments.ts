'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPaymentSummaryByOrder,
  fetchPaymentTransactions,
  processPaymentRefund,
  type ProcessPaymentRefundApiResponse,
  type ProcessPaymentRefundPayload,
} from './paymentApi';
import { testOrderQueryKeys } from './useTestOrders';
import {
  fetchPaymentStatistics,
  fetchPaymentSearch,
  fetchAllPayments,
  fetchPaymentsByMode,
  fetchPaymentTransactionsByInvoice,
  type FetchPaymentStatisticsParams,
  type FetchPaymentSearchParams,
  type FetchAllPaymentsParams,
  type FetchPaymentsByModeParams,
} from './payment-history';

export const paymentQueryKeys = {
  all: ['payments'] as const,
  summary: (orderId: number) => [...paymentQueryKeys.all, 'summary', orderId] as const,
  transactions: (orderId: number) =>
    [...paymentQueryKeys.all, 'transactions', orderId] as const,
  statistics: (params: FetchPaymentStatisticsParams) =>
    [...paymentQueryKeys.all, 'statistics', params.startDate, params.endDate] as const,
  list: (pageNo: number, pageSize: number) =>
    [...paymentQueryKeys.all, 'list', pageNo, pageSize] as const,
  search: (params: FetchPaymentSearchParams) =>
    [
      ...paymentQueryKeys.all,
      'search',
      params.searchTerm,
      params.pageNo ?? 0,
      params.pageSize ?? 10,
    ] as const,
  byMode: (params: FetchPaymentsByModeParams) =>
    [
      ...paymentQueryKeys.all,
      'mode',
      params.paymentMode,
      params.pageNo ?? 0,
      params.pageSize ?? 10,
    ] as const,
  byInvoice: (invoiceNumber: string) =>
    [...paymentQueryKeys.all, 'invoice', invoiceNumber] as const,
};

/** GET `/api/v1/payments/summary/{orderId}` */
export function usePaymentSummary(orderId: number | null, enabled = true) {
  return useQuery({
    queryKey:
      orderId != null && orderId > 0
        ? paymentQueryKeys.summary(orderId)
        : ['payments', 'summary', 'idle'],
    queryFn: () => fetchPaymentSummaryByOrder(orderId!),
    enabled: enabled && orderId != null && orderId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/payments/transactions/{orderId}` */
export function usePaymentTransactions(orderId: number | null, enabled = true) {
  return useQuery({
    queryKey:
      orderId != null && orderId > 0
        ? paymentQueryKeys.transactions(orderId)
        : ['payments', 'transactions', 'idle'],
    queryFn: () => fetchPaymentTransactions(orderId!),
    enabled: enabled && orderId != null && orderId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/payments/statistics` */
export function usePaymentStatistics(
  params: FetchPaymentStatisticsParams | null,
  enabled = true
) {
  const dateRangeValid =
    params != null &&
    Boolean(params.startDate && params.endDate) &&
    params.startDate <= params.endDate;

  return useQuery({
    queryKey:
      dateRangeValid && params
        ? paymentQueryKeys.statistics(params)
        : ['payments', 'statistics', 'idle'],
    queryFn: () => fetchPaymentStatistics(params!),
    enabled: enabled && dateRangeValid,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/payments/all` */
export function useAllPayments(
  params: FetchAllPaymentsParams | null,
  enabled = true
) {
  const pageNo = params?.pageNo ?? 0;
  const pageSize = params?.pageSize ?? 10;

  return useQuery({
    queryKey:
      params != null
        ? paymentQueryKeys.list(pageNo, pageSize)
        : ['payments', 'list', 'idle'],
    queryFn: () => fetchAllPayments(params!),
    enabled: enabled && params != null,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/payments/search` */
export function usePaymentSearch(
  params: FetchPaymentSearchParams | null,
  enabled = true
) {
  const searchValid = params != null && Boolean(params.searchTerm?.trim());

  return useQuery({
    queryKey:
      searchValid && params
        ? paymentQueryKeys.search(params)
        : ['payments', 'search', 'idle'],
    queryFn: () => fetchPaymentSearch(params!),
    enabled: enabled && searchValid,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/payments/mode/{paymentMode}` */
export function usePaymentsByMode(
  params: FetchPaymentsByModeParams | null,
  enabled = true
) {
  const modeValid = params != null && Boolean(params.paymentMode?.trim());

  return useQuery({
    queryKey:
      modeValid && params
        ? paymentQueryKeys.byMode(params)
        : ['payments', 'mode', 'idle'],
    queryFn: () => fetchPaymentsByMode(params!),
    enabled: enabled && modeValid,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/payments/transactions/invoice/{invoiceNumber}` */
export function usePaymentTransactionsByInvoice(
  invoiceNumber: string | null,
  enabled = true
) {
  const invoiceValid = invoiceNumber != null && Boolean(invoiceNumber.trim());

  return useQuery({
    queryKey:
      invoiceValid && invoiceNumber
        ? paymentQueryKeys.byInvoice(invoiceNumber.trim())
        : ['payments', 'invoice', 'idle'],
    queryFn: () => fetchPaymentTransactionsByInvoice(invoiceNumber!),
    enabled: enabled && invoiceValid,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST `/api/v1/payments/refund` */
export function useProcessPaymentRefund() {
  const queryClient = useQueryClient();

  return useMutation<
    ProcessPaymentRefundApiResponse,
    Error,
    ProcessPaymentRefundPayload
  >({
    mutationFn: (payload) => processPaymentRefund(payload),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.summary(orderId) });
      queryClient.invalidateQueries({ queryKey: paymentQueryKeys.transactions(orderId) });
    },
  });
}
