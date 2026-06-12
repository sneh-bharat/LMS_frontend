'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { testOrderQueryKeys } from './useTestOrders';
import type { TestOrderApiResponse } from './testOrderApi';
import {
  cancelTestOrder,
  fetchCancellationDetails,
  fetchTrackOrderLifecycle,
  processOrderPayment,
  type CancelTestOrderPayload,
  type ProcessOrderPaymentApiResponse,
  type ProcessOrderPaymentPayload,
} from './orderLifecycleApi';

export const orderLifecycleQueryKeys = {
  all: ['order-lifecycle'] as const,
  cancellation: (orderId: number) =>
    [...orderLifecycleQueryKeys.all, 'cancellation', orderId] as const,
  track: (orderId: number) =>
    [...orderLifecycleQueryKeys.all, 'track', orderId] as const,
};

/** GET `/api/v1/order-lifecycle/{orderId}/cancellation` */
export function useCancellationDetails(orderId: number | null, enabled = true) {
  return useQuery({
    queryKey:
      orderId != null && orderId > 0
        ? orderLifecycleQueryKeys.cancellation(orderId)
        : ['order-lifecycle', 'cancellation', 'idle'],
    queryFn: () => fetchCancellationDetails(orderId!),
    enabled: enabled && orderId != null && orderId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/order-lifecycle/{orderId}/track` */
export function useTrackOrderLifecycle(orderId: number | null, enabled = true) {
  return useQuery({
    queryKey:
      orderId != null && orderId > 0
        ? orderLifecycleQueryKeys.track(orderId)
        : ['order-lifecycle', 'track', 'idle'],
    queryFn: () => fetchTrackOrderLifecycle(orderId!),
    enabled: enabled && orderId != null && orderId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST `/api/v1/order-lifecycle/{orderId}/cancel` */
export function useCancelTestOrder() {
  const queryClient = useQueryClient();

  return useMutation<
    TestOrderApiResponse,
    Error,
    { orderId: number; payload: CancelTestOrderPayload }
  >({
    mutationFn: ({ orderId, payload }) => cancelTestOrder(orderId, payload),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({
        queryKey: orderLifecycleQueryKeys.cancellation(orderId),
      });
    },
  });
}

/** POST `/api/v1/payments/process` */
export function useProcessOrderPayment() {
  const queryClient = useQueryClient();

  return useMutation<
    ProcessOrderPaymentApiResponse,
    Error,
    ProcessOrderPaymentPayload
  >({
    mutationFn: (payload) => processOrderPayment(payload),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.detail(orderId) });
      queryClient.invalidateQueries({
        queryKey: orderLifecycleQueryKeys.cancellation(orderId),
      });
      queryClient.invalidateQueries({ queryKey: ['payments', 'summary', orderId] });
      queryClient.invalidateQueries({ queryKey: ['payments', 'transactions', orderId] });
    },
  });
}
