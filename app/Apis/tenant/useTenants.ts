'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  activateTenant,
  createTenant,
  deleteTenant,
  fetchInactiveTenants,
  fetchTenants,
  getActiveTenants,
  getExpiringTenants,
  getTenantDetails,
  renewTenantSubscription,
  searchTenantsByName,
  updateTenant,
  type CreateTenantPayload,
  type FetchTenantsParams,
  type SearchTenantsParams,
  type TenantsApiResponse,
  type UpdateTenantPayload,
} from './tenantApi';

export type TenantListMode = 'all' | 'active' | 'inactive';

export const tenantQueryKeys = {
  all: ['tenants'] as const,
  list: (mode: TenantListMode, p: FetchTenantsParams) =>
    [...tenantQueryKeys.all, 'list', mode, p.page, p.size] as const,
  search: (p: SearchTenantsParams) =>
    [...tenantQueryKeys.all, 'search', p.term, p.page, p.size] as const,
  expiring: (days: number) => [...tenantQueryKeys.all, 'expiring', days] as const,
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

export type TenantsSearchQueryKey = ReturnType<typeof tenantQueryKeys.search>;

export type UseTenantsSearchQueryOptions = Omit<
  UseQueryOptions<
    TenantsApiResponse,
    Error,
    TenantsApiResponse,
    TenantsSearchQueryKey
  >,
  'queryKey' | 'queryFn'
>;

function fetchTenantsByMode(
  mode: TenantListMode,
  params: FetchTenantsParams
): Promise<TenantsApiResponse> {
  if (mode === 'active') return getActiveTenants(params);
  if (mode === 'inactive') return fetchInactiveTenants(params);
  return fetchTenants(params);
}

/** Refetch list, search, and expiring panels — not tenant detail drawers. */
function invalidateTenantListQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return (
        Array.isArray(key) &&
        key[0] === tenantQueryKeys.all[0] &&
        (key[1] === 'list' || key[1] === 'search' || key[1] === 'expiring')
      );
    },
  });
}

/** Paginated tenants — GET `/all`, `/active`, or inactive derived from `/all`. */
export function useTenantsList(
  params: FetchTenantsParams & { mode?: TenantListMode; enabled?: boolean },
  queryOptions?: UseTenantsListQueryOptions
) {
  const { enabled = true, mode = 'all', ...fetchParams } = params;

  return useQuery({
    queryKey: tenantQueryKeys.list(mode, fetchParams),
    queryFn: () => fetchTenantsByMode(mode, fetchParams),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/** Search tenants by name — GET `/api/v1/tenants/search`. */
export function useSearchTenants(
  params: SearchTenantsParams & { enabled?: boolean },
  queryOptions?: UseTenantsSearchQueryOptions
) {
  const { enabled = true, term, ...fetchParams } = params;
  const trimmedTerm = term.trim();

  return useQuery({
    queryKey: tenantQueryKeys.search({ term: trimmedTerm, ...fetchParams }),
    queryFn: () => searchTenantsByName({ term: trimmedTerm, ...fetchParams }),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: (queryOptions?.enabled ?? enabled) && trimmedTerm.length > 0,
  });
}

/** GET expiring tenants — `/api/v1/tenants/expiring?days=`. */
export function useExpiringTenants(days: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: tenantQueryKeys.expiring(days),
    queryFn: () => getExpiringTenants(days),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
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
      invalidateTenantListQueries(queryClient);
    },
  });
}

/** PUT update tenant; refreshes list panels (edit drawer closes on success). */
export function useUpdateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, payload }: { tenantId: number; payload: UpdateTenantPayload }) =>
      updateTenant(tenantId, payload),
    onSuccess: (_data, { tenantId }) => {
      invalidateTenantListQueries(queryClient);
      queryClient.removeQueries({ queryKey: tenantQueryKeys.detail(tenantId) });
    },
  });
}

/** PUT renew tenant subscription; refreshes list panels (renew drawer closes on success). */
export function useRenewTenantSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, months }: { tenantId: number; months: number }) =>
      renewTenantSubscription(tenantId, months),
    onSuccess: (_data, { tenantId }) => {
      invalidateTenantListQueries(queryClient);
      queryClient.removeQueries({ queryKey: tenantQueryKeys.detail(tenantId) });
    },
  });
}

/** PUT activate/deactivate tenant — `/api/v1/tenants/{id}/activate?active=`. */
export function useActivateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tenantId, isActive }: { tenantId: number; isActive: boolean }) =>
      activateTenant(tenantId, isActive),
    onSuccess: (_data, { tenantId }) => {
      invalidateTenantListQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: tenantQueryKeys.detail(tenantId) });
    },
  });
}

/** DELETE tenant by ID — `/api/v1/tenants/{id}`. */
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: number) => deleteTenant(tenantId),
    onSuccess: (_data, tenantId) => {
      invalidateTenantListQueries(queryClient);
      queryClient.removeQueries({ queryKey: tenantQueryKeys.detail(tenantId) });
    },
  });
}
