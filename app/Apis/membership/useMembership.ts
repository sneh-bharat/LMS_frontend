'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createMemberCard,
  deleteMemberCard,
  fetchAllMemberCards,
  fetchMemberCardById,
  fetchMemberCardStatistics,
  updateMemberCard,
  type CreateMemberCardApiResponse,
  type CreateMemberCardPayload,
  type DeleteMemberCardApiResponse,
  type UpdateMemberCardApiResponse,
  type UpdateMemberCardPayload,
  type FetchMemberCardStatisticsParams,
  type FetchMemberCardsParams,
  type MemberCardDetailApiResponse,
  type MemberCardStatisticsApiResponse,
  type MemberCardsListApiResponse,
} from './membership';

export const memberCardQueryKeys = {
  all: ['member-cards'] as const,
  list: (params: FetchMemberCardsParams) =>
    [
      ...memberCardQueryKeys.all,
      'list',
      params.pageNo ?? 0,
      params.pageSize ?? 10,
      params.branchId ?? 'all',
      params.searchTerm?.trim() ?? '',
    ] as const,
  detail: (cardId: number) => [...memberCardQueryKeys.all, 'detail', cardId] as const,
  statistics: (params: FetchMemberCardStatisticsParams) =>
    [...memberCardQueryKeys.all, 'statistics', params.branchId ?? 'all'] as const,
};

export type MemberCardsListQueryKey = ReturnType<typeof memberCardQueryKeys.list>;

export type UseMemberCardsOptions = Omit<
  UseQueryOptions<
    MemberCardsListApiResponse,
    Error,
    MemberCardsListApiResponse,
    MemberCardsListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/** GET `/api/v1/member-cards/statistics` */
export function useMemberCardStatistics(
  params: FetchMemberCardStatisticsParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery<MemberCardStatisticsApiResponse, Error>({
    queryKey: memberCardQueryKeys.statistics(params),
    queryFn: () => fetchMemberCardStatistics(params),
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/member-cards/all` — paginated member cards for a branch. */
export function useMemberCards(
  params: FetchMemberCardsParams = {},
  queryOptions?: UseMemberCardsOptions
) {
  const fetchParams = { pageNo: 0, pageSize: 10, ...params };
  const enabled = queryOptions?.enabled ?? true;

  return useQuery({
    queryKey: memberCardQueryKeys.list(fetchParams),
    queryFn: () => fetchAllMemberCards(fetchParams),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** GET `/api/v1/member-cards/{cardId}` */
export function useMemberCardById(
  cardId: number | null,
  options?: { enabled?: boolean }
) {
  const id = cardId != null && cardId > 0 ? cardId : null;
  const enabled = (options?.enabled ?? true) && id != null;

  return useQuery<MemberCardDetailApiResponse, Error>({
    queryKey: id != null ? memberCardQueryKeys.detail(id) : ['member-cards', 'detail', 'idle'],
    queryFn: () => fetchMemberCardById(id!),
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST `/api/v1/member-cards/create` */
export function useCreateMemberCard() {
  const queryClient = useQueryClient();

  return useMutation<CreateMemberCardApiResponse, Error, CreateMemberCardPayload>({
    mutationFn: (payload) => createMemberCard(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: memberCardQueryKeys.all });
    },
  });
}

/** PUT `/api/v1/member-cards/{cardId}` */
export function useUpdateMemberCard() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateMemberCardApiResponse,
    Error,
    { cardId: number; payload: UpdateMemberCardPayload }
  >({
    mutationFn: ({ cardId, payload }) => updateMemberCard(cardId, payload),
    onSuccess: (_, { cardId }) => {
      void queryClient.invalidateQueries({ queryKey: memberCardQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: memberCardQueryKeys.detail(cardId) });
    },
  });
}

/** DELETE `/api/v1/member-cards/{cardId}` */
export function useDeleteMemberCard() {
  const queryClient = useQueryClient();

  return useMutation<DeleteMemberCardApiResponse, Error, number>({
    mutationFn: (cardId) => deleteMemberCard(cardId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: memberCardQueryKeys.all });
    },
  });
}
