'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createBloodCollector,
  fetchBloodCollectorById,
  fetchBloodCollectorByUsername,
  fetchBloodCollectors,
  updateBloodCollector,
  type BloodCollectorsApiResponse,
  type CreateBloodCollectorPayload,
  type FetchBloodCollectorsParams,
  type UpdateBloodCollectorPayload,
} from './CollectorsApi';

export const collectorQueryKeys = {
  all: ['blood-collectors'] as const,
  list: (p: FetchBloodCollectorsParams) =>
    [...collectorQueryKeys.all, 'list', p.page, p.size] as const,
  detail: (id: number) => [...collectorQueryKeys.all, 'detail', id] as const,
  byUsername: (username: string) =>
    [...collectorQueryKeys.all, 'username', username] as const,
};

export type BloodCollectorsListQueryKey = ReturnType<typeof collectorQueryKeys.list>;

export type UseBloodCollectorsListQueryOptions = Omit<
  UseQueryOptions<
    BloodCollectorsApiResponse,
    Error,
    BloodCollectorsApiResponse,
    BloodCollectorsListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/** Paginated blood collectors — GET `/api/v1/blood-collectors/all`. */
export function useBloodCollectorsList(
  params: FetchBloodCollectorsParams & { enabled?: boolean },
  queryOptions?: UseBloodCollectorsListQueryOptions
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: collectorQueryKeys.list(fetchParams),
    queryFn: () => fetchBloodCollectors(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** POST create blood collector; invalidates list queries on success. */
export function useCreateBloodCollector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBloodCollectorPayload) => createBloodCollector(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectorQueryKeys.all });
    },
  });
}

/** GET single blood collector — `/api/v1/blood-collectors/{id}`. */
export function useBloodCollector(
  id: number | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: collectorQueryKeys.detail(id ?? 0),
    queryFn: () => fetchBloodCollectorById(id!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET blood collector by username — `/api/v1/blood-collectors/username/{username}`. */
export function useBloodCollectorByUsername(
  username: string | undefined,
  options?: { enabled?: boolean }
) {
  const trimmedUsername = username?.trim();

  return useQuery({
    queryKey: collectorQueryKeys.byUsername(trimmedUsername || ''),
    queryFn: () => fetchBloodCollectorByUsername(trimmedUsername!),
    enabled: !!trimmedUsername && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** PUT update blood collector; invalidates list + detail. */
export function useUpdateBloodCollector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBloodCollectorPayload }) =>
      updateBloodCollector(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: collectorQueryKeys.detail(id) });
    },
  });
}
