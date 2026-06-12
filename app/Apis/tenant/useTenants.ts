'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createTenant,
  deleteTenant,
  fetchTenants,
  getTenantDetails,
  type CreateTenantPayload,
  type FetchTenantsParams,
  type TenantsApiResponse,
} from './tenantApi';

export const tenantQueryKeys = {
  all: ['tenants'] as const,
  list: (p: FetchTenantsParams) =>
    [...tenantQueryKeys.all, 'list', p.page, p.size] as const,
  detail: (id: number) => [...tenantQueryKeys.all, 'detail', id] as const,
};

export type TenantsListQueryKey = ReturnType<typeof tenantQueryKeys.list>;

export type UseTenantsListQueryOptions = Omit<
  UseQueryOptions<
    TenantsApiResponse,
    Error,
    TenantsApiResponse,
    TenantsListQueryKey
  >,
  'queryKey' | 'queryFn'
>;

/** Paginated tenants — GET `/api/v1/tenants/all`. */
export function useTenantsList(
  params: FetchTenantsParams & { enabled?: boolean },
  queryOptions?: UseTenantsListQueryOptions
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery({
    queryKey: tenantQueryKeys.list(fetchParams),
    queryFn: () => fetchTenants(fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** GET tenant by ID — `/api/v1/tenants/{id}`. */
export function useTenantById(
  tenantId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  const id = tenantId != null && tenantId > 0 ? tenantId : null;

  return useQuery({
    queryKey: tenantQueryKeys.detail(id ?? 0),
    queryFn: () => getTenantDetails(id!),
    enabled: !!id && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST create tenant; invalidates list queries on success. */
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTenantPayload) => createTenant(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all });
    },
  });
}

/** DELETE tenant by ID — `/api/v1/tenants/{id}`. */
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: number) => deleteTenant(tenantId),
    onSuccess: (_data, tenantId) => {
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.detail(tenantId) });
    },
  });
}
