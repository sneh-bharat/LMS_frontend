'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  activateBranchManager,
  createBranchManager,
  deleteBranchManager,
  fetchActiveBranchManagers,
  fetchBranchManagerByBranchId,
  fetchBranchManagerById,
  fetchBranchManagerByUsername,
  fetchBranchManagers,
  fetchVerifiedBranchManagers,
  updateBranchManager,
  verifyBranchManager,
  type BranchManagersApiResponse,
  type CreateBranchManagerPayload,
  type FetchBranchManagersParams,
  type UpdateBranchManagerPayload,
} from './BranchManagersApi';

export const branchManagerQueryKeys = {
  all: ['branch-managers'] as const,
  list: (p: FetchBranchManagersParams) =>
    [...branchManagerQueryKeys.all, 'list', p.page, p.size] as const,
  activeList: (p: FetchBranchManagersParams) =>
    [...branchManagerQueryKeys.all, 'active', p.page, p.size] as const,
  verifiedList: (p: FetchBranchManagersParams) =>
    [...branchManagerQueryKeys.all, 'verified', p.page, p.size] as const,
  detail: (id: number) => [...branchManagerQueryKeys.all, 'detail', id] as const,
  byUsername: (username: string) =>
    [...branchManagerQueryKeys.all, 'username', username] as const,
  byBranch: (branchId: number) =>
    [...branchManagerQueryKeys.all, 'branch', branchId] as const,
};

export type BranchManagersListQueryKey = ReturnType<typeof branchManagerQueryKeys.list>;

export type UseBranchManagersListQueryOptions = Omit<
  UseQueryOptions<
    BranchManagersApiResponse,
    Error,
    BranchManagersApiResponse,
    BranchManagersListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/** Paginated all branch managers — GET `/api/v1/branch-managers/all`. */
export function useBranchManagersList(
  params: FetchBranchManagersParams & { enabled?: boolean },
  queryOptions?: UseBranchManagersListQueryOptions
) {
  const { enabled = true, ...fetchParams } = params;
  return useQuery({
    queryKey: branchManagerQueryKeys.list(fetchParams),
    queryFn: () => fetchBranchManagers(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** Paginated active branch managers — GET `/api/v1/branch-managers/active`. */
export function useActiveBranchManagersList(
  params: FetchBranchManagersParams & { enabled?: boolean }
) {
  const { enabled = true, ...fetchParams } = params;
  return useQuery({
    queryKey: branchManagerQueryKeys.activeList(fetchParams),
    queryFn: () => fetchActiveBranchManagers(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** Paginated verified branch managers — GET `/api/v1/branch-managers/verified`. */
export function useVerifiedBranchManagersList(
  params: FetchBranchManagersParams & { enabled?: boolean }
) {
  const { enabled = true, ...fetchParams } = params;
  return useQuery({
    queryKey: branchManagerQueryKeys.verifiedList(fetchParams),
    queryFn: () => fetchVerifiedBranchManagers(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** GET single branch manager by ID. */
export function useBranchManager(
  id: number | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: branchManagerQueryKeys.detail(id ?? 0),
    queryFn: () => fetchBranchManagerById(id!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET branch manager by username. */
export function useBranchManagerByUsername(
  username: string | undefined,
  options?: { enabled?: boolean }
) {
  const trimmed = username?.trim();
  return useQuery({
    queryKey: branchManagerQueryKeys.byUsername(trimmed || ''),
    queryFn: () => fetchBranchManagerByUsername(trimmed!),
    enabled: !!trimmed && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** GET branch manager by branch ID. */
export function useBranchManagerByBranchId(
  branchId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: branchManagerQueryKeys.byBranch(branchId ?? 0),
    queryFn: () => fetchBranchManagerByBranchId(branchId!),
    enabled: !!branchId && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST create branch manager. */
export function useCreateBranchManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBranchManagerPayload) => createBranchManager(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.all });
    },
  });
}

/** PUT update branch manager. */
export function useUpdateBranchManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBranchManagerPayload }) =>
      updateBranchManager(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.detail(id) });
    },
  });
}

/** PUT verify branch manager — `/api/v1/branch-managers/{id}/verify`. */
export function useVerifyBranchManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => verifyBranchManager(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.detail(id) });
    },
  });
}

/** PUT activate branch manager — `/api/v1/branch-managers/{id}/activate`. */
export function useActivateBranchManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activateBranchManager(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.detail(id) });
    },
  });
}

/** DELETE branch manager. */
export function useDeleteBranchManager() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBranchManager(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchManagerQueryKeys.all });
    },
  });
}