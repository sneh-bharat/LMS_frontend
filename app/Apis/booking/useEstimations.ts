'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEstimation,
  fetchEstimations,
  type CreateEstimationApiResponse,
  type CreateEstimationPayload,
  type EstimationsListApiResponse,
  type FetchEstimationsParams,
} from './estimation';

export const estimationQueryKeys = {
  all: ['estimations'] as const,
  list: (params: FetchEstimationsParams) =>
    [
      ...estimationQueryKeys.all,
      'list',
      params.pageNo ?? 0,
      params.pageSize ?? 10,
      params.sortBy ?? 'createdAt',
    ] as const,
};

/**
 * GET `/api/v1/estimations?pageNo=&pageSize=&sortBy=`
 * Bearer token from `localStorage.token` via `bookingAxios`.
 */
export function useEstimationsList(
  params: FetchEstimationsParams & { enabled?: boolean } = {}
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery<EstimationsListApiResponse, Error>({
    queryKey: estimationQueryKeys.list(fetchParams),
    queryFn: () => fetchEstimations(fetchParams),
    enabled: enabled && typeof window !== 'undefined',
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** Invalidate all estimation list queries (e.g. after create/update). */
export function useInvalidateEstimations() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: estimationQueryKeys.all });
  };
}

/**
 * **Create estimation** mutation — `POST /api/v1/estimations`
 * (via `createEstimation` → `bookingAxios` + `ESTIMATIONS_API_PATH`).
 */
export function useCreateEstimation() {
  const invalidate = useInvalidateEstimations();

  return useMutation<CreateEstimationApiResponse, Error, CreateEstimationPayload>({
    mutationFn: (payload) => createEstimation(payload),
    onSuccess: () => invalidate(),
  });
}
