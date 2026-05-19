'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import { branchApi } from '@/app/Apis/branch/branchApi';
import type { InvoiceBranchOption } from '@/app/diagnosis/invoice-list/constants';
import {
  bulkDeleteTestOrders,
  createTestOrder,
  deleteTestOrder,
  fetchTestOrderById,
  fetchTestOrderByOrderNumber,
  fetchTestOrders,
  fetchPatientInvoices,
  fetchTestOrdersByPatientId,
  fetchTestOrdersByDateRange,
  fetchTestOrdersBySearch,
  fetchTestOrdersByStatus,
  type FetchTestOrdersByDateRangeParams,
  type FetchTestOrdersBySearchParams,
  type TestOrderStatusFilter,
  updateTestOrderFinancial,
  updateTestOrderMedical,
  type BulkDeleteTestOrdersPayload,
  type CreateTestOrderPayload,
  type FetchTestOrdersParams,
  type TestOrderApiResponse,
  type PatientInvoicesApiResponse,
  type TestOrderDetailApiResponse,
  type TestOrdersListApiResponse,
  type UpdateTestOrderFinancialPayload,
  type UpdateTestOrderMedicalPayload,
} from './testOrderApi';

export const testOrderQueryKeys = {
  all: ['test-orders'] as const,
  list: (p: FetchTestOrdersParams) =>
    [
      ...testOrderQueryKeys.all,
      'list',
      p.pageNo ?? 0,
      p.pageSize ?? 10,
      p.sortBy ?? 'createdAt',
      p.branchId ?? 'all',
    ] as const,
  detail: (orderId: number) => [...testOrderQueryKeys.all, 'detail', orderId] as const,
  orderNumber: (orderNumber: string) =>
    [...testOrderQueryKeys.all, 'order-number', orderNumber] as const,
  patient: (patientId: number, pageNo: number, pageSize: number) =>
    [...testOrderQueryKeys.all, 'patient', patientId, pageNo, pageSize] as const,
  patientInvoices: (patientId: number, pageNo: number, pageSize: number) =>
    [...testOrderQueryKeys.all, 'patient-invoices', patientId, pageNo, pageSize] as const,
  status: (status: TestOrderStatusFilter, pageNo: number, pageSize: number) =>
    [...testOrderQueryKeys.all, 'status', status, pageNo, pageSize] as const,
  branchFilterOptions: () => [...testOrderQueryKeys.all, 'branch-filter-options'] as const,
  dateRange: (p: FetchTestOrdersByDateRangeParams) =>
    [
      ...testOrderQueryKeys.all,
      'date-range',
      p.startDate,
      p.endDate,
      p.pageNo ?? 0,
      p.pageSize ?? 10,
    ] as const,
  processingSearch: (searchTerm: string, pageNo: number, pageSize: number) =>
    [...testOrderQueryKeys.all, 'search', searchTerm, pageNo, pageSize] as const,
};

export type TestOrdersListQueryKey = ReturnType<typeof testOrderQueryKeys.list>;

export type UseTestOrdersListOptions = Omit<
  UseQueryOptions<TestOrdersListApiResponse, Error, TestOrdersListApiResponse, TestOrdersListQueryKey>,
  'queryKey' | 'queryFn'
>;

/** GET paginated test orders (bookings / invoices). */
export function useTestOrdersList(
  params: FetchTestOrdersParams & { enabled?: boolean },
  queryOptions?: UseTestOrdersListOptions
) {
  const { enabled = true, ...fetchParams } = params;
  return useQuery({
    queryKey: testOrderQueryKeys.list(fetchParams),
    queryFn: () => fetchTestOrders(fetchParams),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...queryOptions,
    enabled: queryOptions?.enabled ?? enabled,
  });
}

/**
 * POST create test order (diagnostic booking).
 * Uses `bookingAxios` with Bearer token from `localStorage.getItem('token')`.
 */
export function useCreateTestOrder() {
  const queryClient = useQueryClient();

  return useMutation<TestOrderApiResponse, Error, CreateTestOrderPayload>({
    mutationFn: (payload) => createTestOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
    },
  });
}

/** Alias for booking page — same as `useCreateTestOrder`. */
export function useCreateTestOrderBooking() {
  return useCreateTestOrder();
}

export function useTestOrderDetail(orderId: number | null) {
  return useQuery({
    queryKey: orderId != null && orderId > 0 ? testOrderQueryKeys.detail(orderId) : ['test-orders', 'detail', 'idle'],
    queryFn: () => fetchTestOrderById(orderId!),
    enabled: orderId != null && orderId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/test-orders/order-number/{orderNumber}`. */
export function useTestOrderByOrderNumber(orderNumber: string | null) {
  const trimmed = orderNumber?.trim() ?? '';
  return useQuery<TestOrderDetailApiResponse, Error>({
    queryKey: trimmed
      ? testOrderQueryKeys.orderNumber(trimmed)
      : ['test-orders', 'order-number', 'idle'],
    queryFn: () => fetchTestOrderByOrderNumber(trimmed),
    enabled: trimmed.length > 0,
    staleTime: 30 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/test-orders/search?searchTerm=…` — orders by processing type. */
export function useTestOrdersByProcessingType(
  searchTerm: string | null,
  pageNo: number,
  pageSize: number
) {
  const term = searchTerm?.trim() ?? '';
  return useQuery<TestOrdersListApiResponse, Error>({
    queryKey:
      term.length > 0
        ? testOrderQueryKeys.processingSearch(term, pageNo, pageSize)
        : ['test-orders', 'search', 'idle'],
    queryFn: () => fetchTestOrdersBySearch({ searchTerm: term, pageNo, pageSize }),
    enabled: term.length > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/test-orders/date-range`. */
export function useTestOrdersByDateRange(
  params: FetchTestOrdersByDateRangeParams | null,
  options?: { enabled?: boolean }
) {
  const enabled =
    options?.enabled ??
    Boolean(params?.startDate && params?.endDate && params.startDate <= params.endDate);

  return useQuery<TestOrdersListApiResponse, Error>({
    queryKey: params
      ? testOrderQueryKeys.dateRange(params)
      : ['test-orders', 'date-range', 'idle'],
    queryFn: () => fetchTestOrdersByDateRange(params!),
    enabled: enabled && params != null,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/test-orders/patient/{patientId}/invoices`. */
export function usePatientInvoices(
  patientId: number | null,
  pageNo: number,
  pageSize: number
) {
  const id = patientId != null && patientId > 0 ? patientId : null;
  return useQuery<PatientInvoicesApiResponse, Error>({
    queryKey:
      id != null
        ? testOrderQueryKeys.patientInvoices(id, pageNo, pageSize)
        : ['test-orders', 'patient-invoices', 'idle'],
    queryFn: () => fetchPatientInvoices(id!, pageNo, pageSize),
    enabled: id != null,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/test-orders/patient/{patientId}`. */
export function useTestOrdersByPatientId(
  patientId: number | null,
  pageNo: number,
  pageSize: number
) {
  const id = patientId != null && patientId > 0 ? patientId : null;
  return useQuery<TestOrdersListApiResponse, Error>({
    queryKey:
      id != null
        ? testOrderQueryKeys.patient(id, pageNo, pageSize)
        : ['test-orders', 'patient', 'idle'],
    queryFn: () => fetchTestOrdersByPatientId(id!, pageNo, pageSize),
    enabled: id != null,
    staleTime: 30 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

/**
 * Branch options for invoice list filter — unique `branchId` values from test orders,
 * resolved to names via branch service when available.
 */
export function useTestOrderBranchOptions() {
  return useQuery<InvoiceBranchOption[], Error>({
    queryKey: testOrderQueryKeys.branchFilterOptions(),
    queryFn: async () => {
      const res = await fetchTestOrders({ pageNo: 0, pageSize: 500, sortBy: 'createdAt' });
      const branchIds = new Set<number>();
      for (const order of res.data?.content ?? []) {
        if (order.branchId != null && order.branchId > 0) {
          branchIds.add(order.branchId);
        }
      }
      if (branchIds.size === 0) return [];

      let branches: { id: number; branchName: string }[] = [];
      try {
        const branchRes = await branchApi.getAllBranches({ pageNo: 0, pageSize: 200 });
        branches = branchRes.data?.content ?? [];
      } catch {
        // Labels fall back to "Branch #id" when branch service is unavailable.
      }

      return Array.from(branchIds)
        .map((branchId) => ({
          branchId,
          branchName:
            branches.find((b) => b.id === branchId)?.branchName ?? `Branch #${branchId}`,
        }))
        .sort((a, b) => a.branchName.localeCompare(b.branchName));
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/test-orders/status/{status}`. */
export function useTestOrdersByStatus(
  status: TestOrderStatusFilter | null,
  pageNo: number,
  pageSize: number
) {
  return useQuery<TestOrdersListApiResponse, Error>({
    queryKey:
      status != null
        ? testOrderQueryKeys.status(status, pageNo, pageSize)
        : ['test-orders', 'status', 'idle'],
    queryFn: () => fetchTestOrdersByStatus(status!, pageNo, pageSize),
    enabled: status != null,
    staleTime: 30 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateTestOrderMedical() {
  const queryClient = useQueryClient();
  return useMutation<
    TestOrderApiResponse,
    Error,
    { orderId: number; payload: UpdateTestOrderMedicalPayload }
  >({
    mutationFn: ({ orderId, payload }) => updateTestOrderMedical(orderId, payload),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.detail(orderId) });
    },
  });
}

export function useUpdateTestOrderFinancial() {
  const queryClient = useQueryClient();
  return useMutation<
    TestOrderApiResponse,
    Error,
    { orderId: number; payload: UpdateTestOrderFinancialPayload }
  >({
    mutationFn: ({ orderId, payload }) => updateTestOrderFinancial(orderId, payload),
    onSuccess: (_data, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.detail(orderId) });
    },
  });
}

/** DELETE `/api/v1/test-orders/{orderId}`. */
export function useDeleteTestOrder() {
  const queryClient = useQueryClient();
  return useMutation<TestOrderApiResponse, Error, number>({
    mutationFn: (orderId) => deleteTestOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
    },
  });
}

/** DELETE `/api/v1/test-orders/bulk`. */
export function useBulkDeleteTestOrders() {
  const queryClient = useQueryClient();
  return useMutation<TestOrderApiResponse, Error, BulkDeleteTestOrdersPayload>({
    mutationFn: (payload) => bulkDeleteTestOrders(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testOrderQueryKeys.all });
    },
  });
}
