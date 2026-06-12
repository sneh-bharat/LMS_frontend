'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEstimation,
  fetchEstimationById,
  fetchEstimations,
  updateEstimationStatus,
  type CreateEstimationApiResponse,
  type CreateEstimationPayload,
  type EstimationDetailApiResponse,
  type EstimationStatus,
  type EstimationsListApiResponse,
  type FetchEstimationsParams,
  type UpdateEstimationStatusApiResponse,
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
  detail: (estimationId: number) =>
    [...estimationQueryKeys.all, 'detail', estimationId] as const,
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

/** GET `/api/v1/estimations/{estimationId}` */
export function useEstimationDetail(
  estimationId: number | null | undefined,
  enabled = true
) {
  const id =
    estimationId != null && estimationId > 0 ? estimationId : null;

  return useQuery<EstimationDetailApiResponse, Error>({
    queryKey: estimationQueryKeys.detail(id ?? 0),
    queryFn: () => fetchEstimationById(id!),
    enabled: enabled && id != null && typeof window !== 'undefined',
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
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

export interface UpdateEstimationStatusVariables {
  estimationId: number;
  status: EstimationStatus;
}

/**
 * **Update estimation status** — `PUT /api/v1/estimations/{id}/status?status=`
 */
export function useUpdateEstimationStatus() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateEstimations();

  return useMutation<
    UpdateEstimationStatusApiResponse,
    Error,
    UpdateEstimationStatusVariables
  >({
    mutationFn: ({ estimationId, status }) =>
      updateEstimationStatus({ estimationId, status }),
    onSuccess: (_res, variables) => {
      invalidate();
      queryClient.invalidateQueries({
        queryKey: estimationQueryKeys.detail(variables.estimationId),
      });
    },
  });
}
