'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  enterBulkResults,
  enterSingleResult,
  enterSingleResultsBatch,
  fetchOrderResult,
  fetchParametersWithReference,
  fetchReportList,
  getResultById,
  type EnterBulkResultsPayload,
  type EnterSingleResultPayload,
  type EnterSingleResultsBatchOptions,
  type GetResultByIdApiResponse,
  type OrderResultApiResponse,
  type ParameterResultEntry,
  type ResultListApiResponse,
  type ResultListParams,
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
