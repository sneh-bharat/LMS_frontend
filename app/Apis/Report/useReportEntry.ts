'use client';

import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  API_RESULT_STATUSES,
  enterBulkResults,
  enterSingleResult,
  enterSingleResultsBatch,
  fetchCriticalResults,
  fetchOrderResult,
  fetchParametersWithReference,
  fetchPendingVerificationResults,
  fetchReportList,
  getResultById,
  getResultStatus,
  submitResultApproval,
  type ApiResultStatus,
  type CriticalResultsApiResponse,
  type EnterBulkResultsPayload,
  type EnterSingleResultPayload,
  type EnterSingleResultsBatchOptions,
  type GetResultByIdApiResponse,
  type OrderResultApiResponse,
  type ParameterResultEntry,
  type PendingVerificationApiResponse,
  type ResultListApiResponse,
  type ResultListParams,
  type ResultApprovalApiResponse,
  type ResultApprovalPayload,
  type ResultStatusApiResponse,
} from './reportApi';

export const reportQueryKeys = {
  all: ['report'] as const,
  resultList: (params: ResultListParams) =>
    [...reportQueryKeys.all, 'result-list', params] as const,
  parameters: (testId: number, gender: string, age: number) =>
    [...reportQueryKeys.all, 'parameters', testId, gender, age] as const,
  resultDetail: (resultId: number) =>
    [...reportQueryKeys.all, 'result-detail', resultId] as const,
  orderResult: (orderId: number) =>
    [...reportQueryKeys.all, 'order-result', orderId] as const,
  criticalResults: () => [...reportQueryKeys.all, 'critical-results'] as const,
  resultStatus: (status: ApiResultStatus, page = 0, size = 20) =>
    [...reportQueryKeys.all, 'result-status', status, page, size] as const,
  pendingVerification: (page = 0, size = 20) =>
    [...reportQueryKeys.all, 'pending-verification', page, size] as const,
};

/** GET `/api/v1/test-orders/result-list` */
export function useReportResultList(
  params: ResultListParams & { enabled?: boolean } = {},
) {
  const { enabled = true, ...fetchParams } = params;
  const pageNo = fetchParams.pageNo ?? 0;
  const pageSize = fetchParams.pageSize ?? 10;

  return useQuery<ResultListApiResponse, Error>({
    queryKey: reportQueryKeys.resultList({ ...fetchParams, pageNo, pageSize }),
    queryFn: () => fetchReportList({ ...fetchParams, pageNo, pageSize }),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** GET `/api/v1/tests/report/{testId}` */
export function useReportParameters(
  testId: number,
  gender: string,
  age: number,
  options?: { enabled?: boolean },
) {
  const normalizedGender = gender.toUpperCase();
  const enabled =
    (options?.enabled ?? true) &&
    testId > 0 &&
    !!normalizedGender &&
    age > 0;

  return useQuery({
    queryKey: reportQueryKeys.parameters(testId, normalizedGender, age),
    queryFn: () => fetchParametersWithReference(testId, normalizedGender, age),
    enabled,
    staleTime: 5 * 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/results/order/{orderId}` */
export function useReportOrderResult(
  orderId: number,
  options?: { enabled?: boolean },
) {
  return useQuery<OrderResultApiResponse, Error>({
    queryKey: reportQueryKeys.orderResult(orderId),
    queryFn: () => fetchOrderResult(orderId),
    enabled: !!orderId && orderId > 0 && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/results/{resultId}` */
export function useReportResultDetail(
  resultId: number | null,
  options?: { enabled?: boolean },
) {
  const id = resultId ?? 0;

  return useQuery<GetResultByIdApiResponse, Error>({
    queryKey: reportQueryKeys.resultDetail(id),
    queryFn: () => getResultById(id),
    enabled: !!id && id > 0 && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST `/api/v1/results/enter` */
export function useEnterSingleResult() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnterSingleResultPayload) => enterSingleResult(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
    },
  });
}

/** POST `/api/v1/results/enter` — sequential batch */
export function useEnterSingleResultsBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      options,
      parameters,
      getClinicalInterpretation,
    }: {
      options: EnterSingleResultsBatchOptions;
      parameters: ParameterResultEntry[];
      getClinicalInterpretation?: (param: ParameterResultEntry) => string | undefined;
    }) => enterSingleResultsBatch(options, parameters, getClinicalInterpretation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
    },
  });
}

/** POST `/api/v1/results/enter-bulk` */
export function useEnterBulkResults() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnterBulkResultsPayload) => enterBulkResults(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
    },
  });
}


/** GET `/api/v1/results/critical` - Get Critical Results */
export function useGetCriticalResults(options?: { enabled?: boolean }) {
  return useQuery<CriticalResultsApiResponse, Error>({
    queryKey: reportQueryKeys.criticalResults(),
    queryFn: () => fetchCriticalResults(),
    enabled: options?.enabled ?? true,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/results/status/:status` — count per workflow status (uses totalElements). */
export function useResultStatusStats(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;

  const queries = useQueries({
    queries: API_RESULT_STATUSES.map((status) => ({
      queryKey: reportQueryKeys.resultStatus(status, 0, 1),
      queryFn: () => getResultStatus(status, { page: 0, size: 1 }),
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
      enabled,
    })),
  });

  const stats = API_RESULT_STATUSES.reduce(
    (acc, status, index) => {
      acc[status] = queries[index]?.data?.data?.totalElements ?? 0;
      return acc;
    },
    {} as Record<ApiResultStatus, number>,
  );

  return {
    stats,
    isLoading: queries.some((q) => q.isLoading),
    isFetching: queries.some((q) => q.isFetching),
    refetch: () => Promise.all(queries.map((q) => q.refetch())),
  };
}

/** GET `/api/v1/results/status/:status` — paginated listing by workflow status. */
export function useResultStatusList(
  params: {
    status: ApiResultStatus;
    page?: number;
    size?: number;
    enabled?: boolean;
  },
) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  return useQuery<ResultStatusApiResponse, Error>({
    queryKey: reportQueryKeys.resultStatus(params.status, page, size),
    queryFn: () => getResultStatus(params.status, { page, size }),
    enabled: params.enabled ?? true,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/results/pending-verification` — listing for result verification. */
export function usePendingVerificationResults(
  params: { page?: number; size?: number; enabled?: boolean } = {},
) {
  const page = params.page ?? 0;
  const size = params.size ?? 20;

  return useQuery<PendingVerificationApiResponse, Error>({
    queryKey: reportQueryKeys.pendingVerification(page, size),
    queryFn: () => fetchPendingVerificationResults({ page, size }),
    enabled: params.enabled ?? true,
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** PUT `/api/v1/results/approve` — approve or reject a result. */
export function useSubmitResultApproval() {
  const queryClient = useQueryClient();

  return useMutation<ResultApprovalApiResponse, Error, ResultApprovalPayload>({
    mutationFn: (payload) => submitResultApproval(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportQueryKeys.all });
    },
  });
}

/** @deprecated Use useSubmitResultApproval with approvalStatus APPROVED */
export function useVerifyResult() {
  const mutation = useSubmitResultApproval();
  return {
    ...mutation,
    mutate: (
      vars: { resultId: number; verifiedBy?: string; comments?: string },
      options?: Parameters<typeof mutation.mutate>[1],
    ) =>
      mutation.mutate(
        {
          resultId: vars.resultId,
          approverName: vars.verifiedBy || 'Staff',
          approverRole: 'PATHOLOGIST',
          approvalStatus: 'APPROVED',
          comments: vars.comments,
          actionTaken: 'Approved for release',
        },
        options,
      ),
    mutateAsync: async (vars: {
      resultId: number;
      verifiedBy?: string;
      comments?: string;
    }) =>
      mutation.mutateAsync({
        resultId: vars.resultId,
        approverName: vars.verifiedBy || 'Staff',
        approverRole: 'PATHOLOGIST',
        approvalStatus: 'APPROVED',
        comments: vars.comments,
        actionTaken: 'Approved for release',
      }),
  };
}

/** @deprecated Use useSubmitResultApproval with approvalStatus REJECTED */
export function useRejectResult() {
  const mutation = useSubmitResultApproval();
  return {
    ...mutation,
    mutate: (
      vars: {
        resultId: number;
        rejectedBy?: string;
        rejectionReason?: string;
        comments?: string;
        actionTaken?: string;
      },
      options?: Parameters<typeof mutation.mutate>[1],
    ) =>
      mutation.mutate(
        {
          resultId: vars.resultId,
          approverName: vars.rejectedBy || 'Staff',
          approverRole: 'PATHOLOGIST',
          approvalStatus: 'REJECTED',
          comments: vars.comments,
          rejectionReason: vars.rejectionReason,
          actionTaken: vars.actionTaken || 'Returned for correction',
        },
        options,
      ),
    mutateAsync: async (vars: {
      resultId: number;
      rejectedBy?: string;
      rejectionReason?: string;
      comments?: string;
      actionTaken?: string;
    }) =>
      mutation.mutateAsync({
        resultId: vars.resultId,
        approverName: vars.rejectedBy || 'Staff',
        approverRole: 'PATHOLOGIST',
        approvalStatus: 'REJECTED',
        comments: vars.comments,
        rejectionReason: vars.rejectionReason,
        actionTaken: vars.actionTaken || 'Returned for correction',
      }),
  };
}
