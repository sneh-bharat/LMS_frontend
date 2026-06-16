'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createReceptionist,
  fetchActiveReceptionists,
  fetchReceptionistByBranchId,
  fetchReceptionistById,
  fetchReceptionistByUsername,
  fetchReceptionists,
  fetchVerifiedReceptionists,
  updateReceptionist,
  type CreateReceptionistPayload,
  type FetchReceptionistsParams,
  type ReceptionistsApiResponse,
  type UpdateReceptionistPayload,
} from './ReceptionistsApi';

export const receptionistQueryKeys = {
  all: ['receptionists'] as const,
  list: (p: FetchReceptionistsParams) =>
    [...receptionistQueryKeys.all, 'list', p.page, p.size] as const,
  activeList: (p: FetchReceptionistsParams) =>
    [...receptionistQueryKeys.all, 'active', p.page, p.size] as const,
  verifiedList: (p: FetchReceptionistsParams) =>
    [...receptionistQueryKeys.all, 'verified', p.page, p.size] as const,
  detail: (id: number) =>
    [...receptionistQueryKeys.all, 'detail', id] as const,
  byUsername: (username: string) =>
    [...receptionistQueryKeys.all, 'username', username] as const,
  byBranch: (branchId: number, page: number, size: number) =>
    [...receptionistQueryKeys.all, 'branch', branchId, page, size] as const,
};

export type ReceptionistsListQueryKey = ReturnType<typeof receptionistQueryKeys.list>;

export type UseReceptionistsListQueryOptions = Omit<
  UseQueryOptions<
    ReceptionistsApiResponse,
    Error,
    ReceptionistsApiResponse,
    ReceptionistsListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/** Paginated all receptionists — GET `/api/v1/receptionists/all`. */
export function useReceptionistsList(
  params: FetchReceptionistsParams & { enabled?: boolean },
  queryOptions?: UseReceptionistsListQueryOptions
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: receptionistQueryKeys.list(fetchParams),
    queryFn: () => fetchReceptionists(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** Paginated active receptionists — GET `/api/v1/receptionists/active`. */
export function useActiveReceptionistsList(
  params: FetchReceptionistsParams & { enabled?: boolean }
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: receptionistQueryKeys.activeList(fetchParams),
    queryFn: () => fetchActiveReceptionists(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** Paginated verified receptionists — GET `/api/v1/receptionists/verified`. */
export function useVerifiedReceptionistsList(
  params: FetchReceptionistsParams & { enabled?: boolean }
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: receptionistQueryKeys.verifiedList(fetchParams),
    queryFn: () => fetchVerifiedReceptionists(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** GET single receptionist — `/api/v1/receptionists/{id}`. */
export function useReceptionist(
  id: number | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: receptionistQueryKeys.detail(id ?? 0),
    queryFn: () => fetchReceptionistById(id!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET receptionist by username — `/api/v1/receptionists/username/{username}`. */
export function useReceptionistByUsername(
  username: string | undefined,
  options?: { enabled?: boolean }
) {
  const trimmedUsername = username?.trim();

  return useQuery({
    queryKey: receptionistQueryKeys.byUsername(trimmedUsername || ''),
    queryFn: () => fetchReceptionistByUsername(trimmedUsername!),
    enabled: !!trimmedUsername && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** POST create receptionist; invalidates list queries on success. */
export function useCreateReceptionist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReceptionistPayload) => createReceptionist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receptionistQueryKeys.all });
    },
  });
}

/** PUT update receptionist; invalidates list + detail on success. */
export function useUpdateReceptionist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateReceptionistPayload }) =>
      updateReceptionist(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: receptionistQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: receptionistQueryKeys.detail(id) });
    },
  });
}

export function useReceptionistsByBranch(
  branchId: number | null,
  params: { page: number; size: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: receptionistQueryKeys.byBranch(branchId ?? 0, params.page, params.size),
    queryFn: () => fetchReceptionistByBranchId(branchId!, params),
    enabled: (options?.enabled ?? true) && branchId !== null,
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}