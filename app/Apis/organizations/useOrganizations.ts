'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createOrganization,
  fetchAllOrganizations,
  fetchOrganizationById,
  fetchOrganizationStatistics,
  updateOrganization,
  approveOrganization,
  toggleOrganizationStatus,
  deleteOrganization,
  type CreateOrganizationApiResponse,
  type CreateOrganizationPayload,
  type FetchOrganizationStatisticsParams,
  type FetchOrganizationsParams,
  type OrganizationDetailApiResponse,
  type OrganizationStatisticsApiResponse,
  type OrganizationsListApiResponse,
  type UpdateOrganizationApiResponse,
  type UpdateOrganizationPayload,
} from './organization';

export const organizationQueryKeys = {
  all: ['organizations'] as const,
  list: (params: FetchOrganizationsParams) =>
    [
      ...organizationQueryKeys.all,
      'list',
      params.pageNo ?? 0,
      params.pageSize ?? 10,
      params.branchId ?? 'all',
      params.searchTerm ?? '',
    ] as const,
  detail: (organizationId: number) =>
    [...organizationQueryKeys.all, 'detail', organizationId] as const,
  statistics: (params: FetchOrganizationStatisticsParams) =>
    [
      ...organizationQueryKeys.all,
      'statistics',
      params.branchId ?? 'all',
    ] as const,
};

export type OrganizationsListQueryKey = ReturnType<typeof organizationQueryKeys.list>;

export type UseOrganizationsOptions = Omit<
  UseQueryOptions<
    OrganizationsListApiResponse,
    Error,
    OrganizationsListApiResponse,
    OrganizationsListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/**
 * GET `/api/v1/organizations/all` — paginated organizations for a branch.
 */
export function useOrganizations(
  params: FetchOrganizationsParams = {},
  queryOptions?: UseOrganizationsOptions
) {
  const { enabled = true, ...fetchParams } = { pageNo: 0, pageSize: 10, ...params };

  return useQuery({
    queryKey: organizationQueryKeys.list(fetchParams),
    queryFn: () => fetchAllOrganizations(fetchParams),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** GET `/api/v1/organizations/statistics` */
export function useOrganizationStatistics(
  params: FetchOrganizationStatisticsParams = {},
  options?: { enabled?: boolean }
) {
  return useQuery<OrganizationStatisticsApiResponse, Error>({
    queryKey: organizationQueryKeys.statistics(params),
    queryFn: () => fetchOrganizationStatistics(params),
    enabled: options?.enabled ?? true,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/organizations/{organizationId}` */
export function useOrganizationById(
  organizationId: number | null,
  options?: { enabled?: boolean }
) {
  const id = organizationId != null && organizationId > 0 ? organizationId : null;
  const enabled = (options?.enabled ?? true) && id != null;

  return useQuery<OrganizationDetailApiResponse, Error>({
    queryKey: id != null ? organizationQueryKeys.detail(id) : ['organizations', 'detail', 'idle'],
    queryFn: () => fetchOrganizationById(id!),
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST `/api/v1/organizations/create` */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<CreateOrganizationApiResponse, Error, CreateOrganizationPayload>({
    mutationFn: (payload) => createOrganization(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
    },
  });
}

/** PUT `/api/v1/organizations/{organizationId}` */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateOrganizationApiResponse,
    Error,
    { organizationId: number; payload: UpdateOrganizationPayload }
  >({
    mutationFn: ({ organizationId, payload }) => updateOrganization(organizationId, payload),
    onSuccess: (_, { organizationId }) => {
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.detail(organizationId) });
    },
  });
}

/** PUT `/api/v1/organizations/{organizationId}/approve` */
export function useApproveOrganization() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; response: boolean; status: string }, Error, number>({
    mutationFn: (organizationId) => approveOrganization(organizationId),
    onSuccess: (_, organizationId) => {
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.detail(organizationId) });
    },
  });
}

/** PUT `/api/v1/organizations/{organizationId}/status?isActive=true` */
export function useToggleOrganizationStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; response: boolean; status: string },
    Error,
    { organizationId: number; isActive: boolean }
  >({
    mutationFn: ({ organizationId, isActive }) => toggleOrganizationStatus(organizationId, isActive),
    onSuccess: (_, { organizationId }) => {
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.detail(organizationId) });
    },
  });
}

/** DELETE `/api/v1/organizations/{organizationId}` */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; response: boolean; status: string }, Error, number>({
    mutationFn: (organizationId) => deleteOrganization(organizationId),
    onSuccess: (_, organizationId) => {
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.all });
      void queryClient.invalidateQueries({ queryKey: organizationQueryKeys.detail(organizationId) });
    },
  });
}
