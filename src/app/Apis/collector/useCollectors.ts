'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  activateBloodCollector,
  createBloodCollector,
  deleteBloodCollector,
  fetchBloodCollectorByUsername,
  fetchBloodCollectors,
  updateBloodCollector,
  type ActivateBloodCollectorParams,
  type BloodCollector,
  type BloodCollectorsApiResponse,
  type CreateBloodCollectorPayload,
  type FetchBloodCollectorsParams,
  type UpdateBloodCollectorPayload,
} from './CollectorsApi';

export const collectorQueryKeys = {
  all: ['blood-collectors'] as const,
  list: (p: FetchBloodCollectorsParams) =>
    [...collectorQueryKeys.all, 'list', p.statusFilter ?? 'all', p.page, p.size] as const,
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

/** Delete blood collector via PUT; invalidates list + detail. */
export function useDeleteBloodCollector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (collector: BloodCollector) => deleteBloodCollector(collector),
    onSuccess: (_data, collector) => {
      queryClient.invalidateQueries({ queryKey: collectorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: collectorQueryKeys.detail(collector.id) });
    },
  });
}

/** PUT activate/deactivate blood collector — `/api/v1/blood-collectors/{id}/activate`. */
export function useActivateBloodCollector() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ActivateBloodCollectorParams) => activateBloodCollector(params),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: collectorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: collectorQueryKeys.detail(id) });
    },
  });
}
