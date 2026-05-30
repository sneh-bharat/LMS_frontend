'use client';

import { useMutation, useQuery, useQueryClient, skipToken } from '@tanstack/react-query';
import {
  createReferrerCommission,
  deleteReferrerCommissionById,
  fetchReferrerCommissions,
  updateReferrerCommission,
  type CreateReferrerCommissionPayload,
  type UpdateReferrerCommissionPayload,
} from './ReferrerCommission';

export const referrerCommissionQueryKeys = {
  all: ['referrer-commissions'] as const,
  byReferrer: (referrerId: number) => [...referrerCommissionQueryKeys.all, referrerId] as const,
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
