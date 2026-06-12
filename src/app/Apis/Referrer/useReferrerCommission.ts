'use client';

import { useMutation, useQuery, useQueryClient, skipToken } from '@tanstack/react-query';
import {
  createReferrerCommission,
  deleteReferrerCommissionById,
  fetchReferrerCommissions,
  fetchReferrerPaymentHistory,
  fetchReferrerCommissionCalculation,
  fetchReferrerCommissionPayByRange,
  fetchReferrerTestCommissions,
  markReferrerCommissionPaid,
  updateReferrerCommission,
  updateReferrerCommissionByTestId,
  type CreateReferrerCommissionPayload,
  type MarkReferrerCommissionPaidParams,
  type ReferrerCommissionPayRangeParams,
  type UpdateReferrerCommissionPayload,
  type UpdateReferrerTestCommissionOverridePayload,
} from './ReferrerCommission';



export const referrerCommissionQueryKeys = {
  all: ['referrer-commissions'] as const,
  byReferrer: (referrerId: number) => [...referrerCommissionQueryKeys.all, referrerId] as const,
  testsByReferrer: (referrerId: number) =>
    [...referrerCommissionQueryKeys.all, 'tests', referrerId] as const,
};

export function useReferrerCommissions(
  referrerId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  const numericId = referrerId != null && referrerId > 0 ? referrerId : undefined;
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey:
      numericId != null
        ? referrerCommissionQueryKeys.byReferrer(numericId)
        : ([...referrerCommissionQueryKeys.all, 'disabled'] as const),
    queryFn: numericId != null ? () => fetchReferrerCommissions(numericId) : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateReferrerCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReferrerCommissionPayload) => createReferrerCommission(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: referrerCommissionQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: referrerCommissionQueryKeys.byReferrer(payload.referrerId),
      });
    },
  });
}

export function useUpdateReferrerCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commissionId,
      payload,
    }: {
      commissionId: number;
      payload: UpdateReferrerCommissionPayload;
    }) => updateReferrerCommission(commissionId, payload),
    onSuccess: (_data, { payload }) => {
      queryClient.invalidateQueries({ queryKey: referrerCommissionQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: referrerCommissionQueryKeys.byReferrer(payload.referrerId),
      });
    },
  });
}

export function useDeleteReferrerCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commissionId }: { commissionId: number; referrerId: number }) =>
      deleteReferrerCommissionById(commissionId),
    onSuccess: (_data, { referrerId }) => {
      queryClient.invalidateQueries({ queryKey: referrerCommissionQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: referrerCommissionQueryKeys.byReferrer(referrerId),
      });
    },
  });
}

export function useReferrerPaymentHistory(
  referrerId: number | null | undefined,
  pageNo: number,
  pageSize: number,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: [
      'referrer-payment-history',
      referrerId,
      pageNo,
      pageSize,
    ],
    queryFn: () =>
      fetchReferrerPaymentHistory(
        referrerId!,
        pageNo,
        pageSize
      ),
    enabled:
      options?.enabled ?? (referrerId != null && referrerId > 0),
  });
}

export function useReferrerCommissionCalculation(
  referrerId: number | null,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['referrer-commission-calculation', referrerId],
    queryFn: () =>
      fetchReferrerCommissionCalculation(referrerId!),
    enabled:
      options?.enabled ??
      (referrerId != null && referrerId > 0),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}


export function useMarkReferrerCommissionPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: MarkReferrerCommissionPaidParams) =>
      markReferrerCommissionPaid(params),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: referrerCommissionQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: referrerCommissionQueryKeys.byReferrer(params.referrerId),
      });
      queryClient.invalidateQueries({
        queryKey: ['referrer-commission-pay', params.referrerId],
      });
      queryClient.invalidateQueries({
        queryKey: ['referrer-commission-calculation', params.referrerId],
      });
      queryClient.invalidateQueries({
        queryKey: ['referrer-payment-history'],
      });
    },
  });
}

export function useCalculateReferrerCommissionByRange() {
  return useMutation({
    mutationFn: (params: ReferrerCommissionPayRangeParams) =>
      fetchReferrerCommissionPayByRange(params),
  });
}

export function useReferrerTestCommissions(
  referrerId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  const numericId = referrerId != null && referrerId > 0 ? referrerId : undefined;
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey:
      numericId != null
        ? referrerCommissionQueryKeys.testsByReferrer(numericId)
        : ([...referrerCommissionQueryKeys.all, 'tests', 'disabled'] as const),
    queryFn: numericId != null ? () => fetchReferrerTestCommissions(numericId) : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateReferrerTestCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      referrerId,
      testId,
      payload,
    }: {
      referrerId: number;
      testId: number;
      payload: UpdateReferrerTestCommissionOverridePayload;
    }) => updateReferrerCommissionByTestId(referrerId, testId, payload),
    onSuccess: (_data, { referrerId }) => {
      queryClient.invalidateQueries({
        queryKey: referrerCommissionQueryKeys.testsByReferrer(referrerId),
      });
      queryClient.invalidateQueries({
        queryKey: referrerCommissionQueryKeys.byReferrer(referrerId),
      });
    },
  });
}

export function useReferrerCommissionPay(
  referrerId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  const numericId =
    referrerId != null && referrerId > 0 ? referrerId : undefined;

  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey: ['referrer-commission-pay', numericId],

    queryFn:
      numericId != null
        ? () => fetchReferrerCommissionCalculation(numericId)
        : skipToken,

    enabled: Boolean(numericId) && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}