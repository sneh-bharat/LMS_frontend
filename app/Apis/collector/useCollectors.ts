'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createBloodCollector,
  fetchBloodCollectors,
  type BloodCollectorsApiResponse,
  type CreateBloodCollectorPayload,
  type FetchBloodCollectorsParams,
} from './CollectorsApi';

export const collectorQueryKeys = {
  all: ['blood-collectors'] as const,
  list: (p: FetchBloodCollectorsParams) =>
    [...collectorQueryKeys.all, 'list', p.page, p.size] as const,
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
