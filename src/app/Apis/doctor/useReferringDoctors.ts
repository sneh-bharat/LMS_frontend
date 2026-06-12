'use client';

import { useMutation, useQuery, useQueryClient, skipToken, type UseQueryOptions } from '@tanstack/react-query';
import {
  createReferringDoctor,
  deleteReferringDoctor,
  fetchReferringDoctorById,
  fetchReferringDoctors,
  updateReferringDoctor,
  type CreateReferringDoctorPayload,
  type FetchReferringDoctorsParams,
  type ReferringDoctorDetailResponse,
  type ReferringDoctorsApiResponse,
  type UpdateReferringDoctorPayload,
} from './referringDoctorApi';

export const referringDoctorQueryKeys = {
  all: ['referring-doctors'] as const,
  list: (p: FetchReferringDoctorsParams) =>
    [...referringDoctorQueryKeys.all, 'list', p.pageNo, p.pageSize, p.branchId ?? 'all'] as const,
  detail: (id: number) => [...referringDoctorQueryKeys.all, 'detail', id] as const,
};

export type ReferringDoctorsListQueryKey = ReturnType<typeof referringDoctorQueryKeys.list>;

export type UseReferringDoctorQueryOptions = Omit<
  UseQueryOptions<ReferringDoctorDetailResponse, Error, ReferringDoctorDetailResponse>,
  'queryKey' | 'queryFn'
>;

export type UseReferringDoctorsListQueryOptions = Omit<
  UseQueryOptions<ReferringDoctorsApiResponse, Error, ReferringDoctorsApiResponse, ReferringDoctorsListQueryKey>,
  'queryKey' | 'queryFn'
>;

/** GET single referring doctor by id. */
export function useReferringDoctor(
  id: number | null | undefined,
  queryOptions?: UseReferringDoctorQueryOptions & { enabled?: boolean }
) {
  const numericId = id != null && id > 0 ? id : undefined;
  const { enabled = true, ...rest } = queryOptions ?? {};

  return useQuery({
    ...rest,
    queryKey:
      numericId != null
        ? referringDoctorQueryKeys.detail(numericId)
        : (['referring-doctors', 'detail', 'disabled'] as const),
    queryFn: numericId != null ? () => fetchReferringDoctorById(numericId) : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Paginated referring doctors (GET `/referring-doctors`). Uses React Query; HTTP + auth via `referringDoctorAxios`.
 */
export function useReferringDoctorsList(
  params: FetchReferringDoctorsParams & { enabled?: boolean },
  queryOptions?: UseReferringDoctorsListQueryOptions
) {
  const { enabled = true, ...fetchParams } = params;
  return useQuery({
    queryKey: referringDoctorQueryKeys.list(fetchParams),
    queryFn: () => fetchReferringDoctors(fetchParams),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** Call after create/update/delete referring doctors so list queries refetch. */
export function useInvalidateReferringDoctors() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: referringDoctorQueryKeys.all });
}

/** POST create referring doctor; invalidates list queries on success. */
export function useCreateReferringDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReferringDoctorPayload) => createReferringDoctor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referringDoctorQueryKeys.all });
    },
  });
}

/** PUT update referring doctor; invalidates list + detail. */
export function useUpdateReferringDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateReferringDoctorPayload }) =>
      updateReferringDoctor(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: referringDoctorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: referringDoctorQueryKeys.detail(id) });
    },
  });
}

/** DELETE referring doctor; invalidates list + detail. */
export function useDeleteReferringDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReferringDoctor(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: referringDoctorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: referringDoctorQueryKeys.detail(id) });
    },
  });
}
