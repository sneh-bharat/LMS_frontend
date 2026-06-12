'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  skipToken,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  createReferrer,
  deleteReferrer,
  fetchActiveReferrers,
  fetchReferrerById,
  fetchReferrers,
  updateReferrer,
  type CreateReferrerPayload,
  type FetchReferrersParams,
  type ReferrerDetailResponse,
  type ReferrersApiResponse,
  type UpdateReferrerPayload,
} from './referrerApi';

export const referrerQueryKeys = {
  all: ['referrers'] as const,
  list: (p: FetchReferrersParams) =>
    [
      ...referrerQueryKeys.all,
      'list',
      p.listType ?? 'all',
      p.pageNo,
      p.pageSize,
    ] as const,
  detail: (id: number) => [...referrerQueryKeys.all, 'detail', id] as const,
};

export type ReferrersListQueryKey = ReturnType<typeof referrerQueryKeys.list>;

export type UseReferrersListQueryOptions = Omit<
  UseQueryOptions<ReferrersApiResponse, Error, ReferrersApiResponse, ReferrersListQueryKey>,
  'queryKey' | 'queryFn'
>;

/** Paginated referrers — GET `/api/v1/referrers/all` or `/api/v1/referrers/active`. */
export function useReferrersList(
  params: FetchReferrersParams & { enabled?: boolean },
  queryOptions?: UseReferrersListQueryOptions
) {
  const { enabled = true, listType = 'all', ...fetchParams } = params;
  const queryParams = { ...fetchParams, listType };
  return useQuery({
    queryKey: referrerQueryKeys.list(queryParams),
    queryFn: () =>
      listType === 'active'
        ? fetchActiveReferrers(queryParams)
        : fetchReferrers(queryParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

export type UseReferrerQueryOptions = Omit<
  UseQueryOptions<ReferrerDetailResponse, Error, ReferrerDetailResponse>,
  'queryKey' | 'queryFn'
>;

/** GET single referrer by id — `/api/v1/referrers/{id}`. */
export function useReferrerById(
  id: number | null | undefined,
  queryOptions?: UseReferrerQueryOptions & { enabled?: boolean }
) {
  const numericId = id != null && id > 0 ? id : undefined;
  const { enabled = true, ...rest } = queryOptions ?? {};

  return useQuery({
    ...rest,
    queryKey:
      numericId != null
        ? referrerQueryKeys.detail(numericId)
        : (['referrers', 'detail', 'disabled'] as const),
    queryFn: numericId != null ? () => fetchReferrerById(numericId) : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}





/** POST create referrer; invalidates list queries on success. */
export function useCreateReferrer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReferrerPayload) => createReferrer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: referrerQueryKeys.all });
    },
  });
}

/** PUT update referrer; invalidates list + detail queries on success. */
export function useUpdateReferrer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateReferrerPayload }) =>
      updateReferrer(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: referrerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: referrerQueryKeys.detail(id) });
    },
  });
}

/** DELETE referrer; invalidates list + detail queries on success. */
export function useDeleteReferrer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReferrer(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: referrerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: referrerQueryKeys.detail(id) });
    },
  });
}
