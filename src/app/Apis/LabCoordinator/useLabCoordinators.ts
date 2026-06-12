'use client';

import { skipToken, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createLabCoordinator,
  deleteLabCoordinator,
  fetchLabCoordinatorById,
  fetchLabCoordinatorByUsername,
  fetchLabCoordinators,
  updateLabCoordinator,
  activateLabCoordinator,
  type ActivateLabCoordinatorParams,
  type CreateLabCoordinatorPayload,
  type FetchLabCoordinatorsParams,
  type LabCoordinatorDetailApiResponse,
  type LabCoordinatorsApiResponse,
  type UpdateLabCoordinatorParams,
} from './LabCoordinatorApi';


export const labCoordinatorQueryKeys = {
  all: ['lab-coordinators'] as const,
  list: (p: FetchLabCoordinatorsParams) =>
    [...labCoordinatorQueryKeys.all, 'list', p.statusFilter ?? 'all', p.pageNo, p.pageSize] as const,
  detail: (id: number) => [...labCoordinatorQueryKeys.all, 'detail', id] as const,
  byUsername: (username: string) =>
    [...labCoordinatorQueryKeys.all, 'username', username] as const,
};

export type LabCoordinatorsListQueryKey = ReturnType<typeof labCoordinatorQueryKeys.list>;

export type UseLabCoordinatorsListQueryOptions = Omit<
  UseQueryOptions<
    LabCoordinatorsApiResponse,
    Error,
    LabCoordinatorsApiResponse,
    LabCoordinatorsListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/** Paginated lab coordinators — GET `/api/v1/lab-coordinators/all`. */
export function useLabCoordinatorsList(
  params: FetchLabCoordinatorsParams & { enabled?: boolean },
  queryOptions?: UseLabCoordinatorsListQueryOptions
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: labCoordinatorQueryKeys.list(fetchParams),
    queryFn: () => fetchLabCoordinators(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** GET lab coordinator by username — `/api/v1/lab-coordinators/username/{username}`. */
export function useLabCoordinatorByUsername(
  username: string | undefined,
  options?: { enabled?: boolean }
) {
  const trimmedUsername = username?.trim();

  return useQuery({
    queryKey: labCoordinatorQueryKeys.byUsername(trimmedUsername || ''),
    queryFn: () => fetchLabCoordinatorByUsername(trimmedUsername!),
    enabled: !!trimmedUsername && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** GET single lab coordinator by id — `/api/v1/lab-coordinators/{id}`. */
export function useLabCoordinatorById(
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<LabCoordinatorDetailApiResponse>, 'queryKey' | 'queryFn'> & {
    enabled?: boolean;
  }
) {
  const numericId = id != null && id > 0 ? id : null;
  const { enabled = true, ...rest } = options ?? {};

  return useQuery({
    ...rest,
    queryKey: numericId != null ? labCoordinatorQueryKeys.detail(numericId) : ['lab-coordinators', 'detail', 'disabled'],
    queryFn: numericId != null ? () => fetchLabCoordinatorById(numericId) : skipToken,
    enabled: numericId != null && enabled,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST create lab coordinator; invalidates list queries on success. */
export function useCreateLabCoordinator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLabCoordinatorPayload) => createLabCoordinator(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labCoordinatorQueryKeys.all });
    },
  });
}

/** PUT update lab coordinator — `/api/v1/lab-coordinators/{id}`. */
export function useUpdateLabCoordinator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateLabCoordinatorParams) => updateLabCoordinator(params),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: labCoordinatorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: labCoordinatorQueryKeys.detail(params.id) });
    },
  });
}

/** DELETE lab coordinator by id — `/api/v1/lab-coordinators/{id}`. */
export function useDeleteLabCoordinator() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteLabCoordinator(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: labCoordinatorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: labCoordinatorQueryKeys.detail(id) });
    },
  });
}

/** PUT activate/deactivate lab coordinator — `/api/v1/lab-coordinators/{id}/activate`. */
export function useActivateLabCoordinator() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ActivateLabCoordinatorParams) =>
      activateLabCoordinator(params),

    onSuccess: (data, params) => {
      const updatedIsActive =
        typeof data.data?.isActive === 'boolean' ? data.data.isActive : params.isActive;

      queryClient.setQueriesData<LabCoordinatorsApiResponse>(
        { queryKey: labCoordinatorQueryKeys.all },
        (old) => {
          if (!old?.data?.content) return old;
          return {
            ...old,
            data: {
              ...old.data,
              content: old.data.content.map((row) =>
                row.id === params.id ? { ...row, isActive: updatedIsActive } : row
              ),
            },
          };
        }
      );

      queryClient.invalidateQueries({ queryKey: labCoordinatorQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: labCoordinatorQueryKeys.detail(params.id) });
    },
  });
}