'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createPathologist,
  fetchActivePathologists,
  fetchPathologistByBranchId,
  fetchPathologistByUsername,
  fetchPathologists,
  fetchVerifiedPathologists,
  updatePathologist,
  type CreatePathologistPayload,
  type FetchPathologistsParams,
  type PathologistsApiResponse,
  type UpdatePathologistPayload,
} from './PathologistsApi';

export const pathologistQueryKeys = {
  all: ['pathologists'] as const,
  list: (p: FetchPathologistsParams) =>
    [...pathologistQueryKeys.all, 'list', p.page, p.size] as const,
  activeList: (p: FetchPathologistsParams) =>
    [...pathologistQueryKeys.all, 'active', p.page, p.size] as const,
  verifiedList: (p: FetchPathologistsParams) =>
    [...pathologistQueryKeys.all, 'verified', p.page, p.size] as const,
  byUsername: (username: string) =>
    [...pathologistQueryKeys.all, 'username', username] as const,
  byBranch: (branchId: number, page: number, size: number) => 
  [...pathologistQueryKeys.all, "branch", branchId, page, size],
};

export type PathologistsListQueryKey = ReturnType<typeof pathologistQueryKeys.list>;

export type UsePathologistsListQueryOptions = Omit<
  UseQueryOptions<
    PathologistsApiResponse,
    Error,
    PathologistsApiResponse,
    PathologistsListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/** Paginated all pathologists — GET `/api/v1/pathologists`. */
export function usePathologistsList(
  params: FetchPathologistsParams & { enabled?: boolean },
  queryOptions?: UsePathologistsListQueryOptions
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: pathologistQueryKeys.list(fetchParams),
    queryFn: () => fetchPathologists(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** Paginated active pathologists — GET `/api/v1/pathologists/active`. */
export function useActivePathologistsList(
  params: FetchPathologistsParams & { enabled?: boolean }
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: pathologistQueryKeys.activeList(fetchParams),
    queryFn: () => fetchActivePathologists(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** Paginated verified pathologists — GET `/api/v1/pathologists/verified`. */
export function useVerifiedPathologistsList(
  params: FetchPathologistsParams & { enabled?: boolean }
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: pathologistQueryKeys.verifiedList(fetchParams),
    queryFn: () => fetchVerifiedPathologists(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** GET pathologist by username — `/api/v1/pathologists/{username}`. */
export function usePathologistByUsername(
  username: string | undefined,
  options?: { enabled?: boolean }
) {
  const trimmedUsername = username?.trim();

  return useQuery({
    queryKey: pathologistQueryKeys.byUsername(trimmedUsername || ''),
    queryFn: () => fetchPathologistByUsername(trimmedUsername!),
    enabled: !!trimmedUsername && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** POST create pathologist; invalidates all list queries on success. */
export function useCreatePathologist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePathologistPayload) => createPathologist(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pathologistQueryKeys.all });
    },
  });
}

/** PUT update pathologist; invalidates list + detail on success. */
export function useUpdatePathologist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdatePathologistPayload }) =>
      updatePathologist(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pathologistQueryKeys.all });
    },
  });
}

export function usePathologistsByBranch(
  branchId: number | null,
  params: { page: number; size: number },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: pathologistQueryKeys.byBranch(branchId ?? 0, params.page, params.size),
    queryFn: () => fetchPathologistByBranchId(branchId!, params),
    enabled: branchId !== null && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}