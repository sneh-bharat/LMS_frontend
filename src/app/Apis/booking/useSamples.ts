'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchSamples,
  fetchSampleById,
  fetchSampleStatistics,
  registerSample,
  createSampleProcessing,
  updateSampleProcessing,
  fetchSampleProcessingById,
  fetchSampleProcessingBySampleId,
  updateSampleStatus,
  updateSample,
  deleteSample,
  bulkDeleteSamples,
  type BulkDeleteSamplesApiResponse,
  type BulkDeleteSamplesPayload,
  type DeleteSampleApiResponse,
  type FetchSamplesParams,
  type RegisterSamplePayload,
  type RegisterSampleApiResponse,
  type CreateSampleProcessingPayload,
  type CreateSampleProcessingApiResponse,
  type UpdateSampleProcessingPayload,
  type UpdateSampleProcessingApiResponse,
  type SampleProcessingByIdApiResponse,
  type SampleProcessingBySampleApiResponse,
  type SampleByIdApiResponse,
  type SamplesListApiResponse,
  type SampleStatisticsApiResponse,
  type UpdateSampleStatusApiResponse,
  type UpdateSampleStatusParams,
  type UpdateSampleApiResponse,
  type UpdateSamplePayload,
} from './sample';

export const sampleQueryKeys = {
  all: ['samples'] as const,
  list: (params: FetchSamplesParams) =>
    [
      ...sampleQueryKeys.all,
      'list',
      params.status ?? 'all',
      params.pageNo ?? 0,
      params.pageSize ?? 10,
      params.sortBy ?? 'createdAt',
    ] as const,
  detail: (id: number) => [...sampleQueryKeys.all, 'detail', id] as const,
  processing: (processId: number) =>
    [...sampleQueryKeys.all, 'processing', processId] as const,
  processingBySample: (sampleId: number) =>
    [...sampleQueryKeys.all, 'processing', 'sample', sampleId] as const,
  statistics: () => [...sampleQueryKeys.all, 'statistics'] as const,
};

/** GET paginated samples for sample receipt listing. */
export function useSamplesList(
  params: FetchSamplesParams & { enabled?: boolean } = {}
) {
  const { enabled = true, ...fetchParams } = params;

  return useQuery<SamplesListApiResponse, Error>({
    queryKey: sampleQueryKeys.list(fetchParams),
    queryFn: () => fetchSamples(fetchParams),
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/samples/statistics` */
export function useSampleStatistics(enabled = true) {
  return useQuery<SampleStatisticsApiResponse, Error>({
    queryKey: sampleQueryKeys.statistics(),
    queryFn: () => fetchSampleStatistics(),
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/samples/{id}` */
export function useSampleById(sampleId: number | null, enabled = true) {
  const idValid = sampleId != null && sampleId > 0;

  return useQuery<SampleByIdApiResponse, Error>({
    queryKey: idValid ? sampleQueryKeys.detail(sampleId) : ['samples', 'detail', 'idle'],
    queryFn: () => fetchSampleById(sampleId!),
    enabled: enabled && idValid,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** PUT `/api/v1/samples/{id}/status` */
export function useUpdateSampleStatus() {
  const queryClient = useQueryClient();

  return useMutation<UpdateSampleStatusApiResponse, Error, UpdateSampleStatusParams>({
    mutationFn: (params) => updateSampleStatus(params),
    onSuccess: (res, { sampleId }) => {
      if (res.response === false) return;
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.detail(sampleId) });
    },
  });
}

/** PUT `/api/v1/samples/{id}` */
export function useUpdateSample() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSampleApiResponse,
    Error,
    { sampleId: number; payload: UpdateSamplePayload }
  >({
    mutationFn: ({ sampleId, payload }) => updateSample(sampleId, payload),
    onSuccess: (res, { sampleId }) => {
      if (res.response === false) return;
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.detail(sampleId) });
    },
  });
}

/** DELETE `/api/v1/samples/{id}` */
export function useDeleteSample() {
  const queryClient = useQueryClient();

  return useMutation<DeleteSampleApiResponse, Error, number>({
    mutationFn: (sampleId) => deleteSample(sampleId),
    onSuccess: (res) => {
      if (res.response === false) return;
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
    },
  });
}

/** DELETE `/api/v1/samples/bulk` (lims-patient). */
export function useBulkDeleteSamples() {
  const queryClient = useQueryClient();

  return useMutation<BulkDeleteSamplesApiResponse, Error, BulkDeleteSamplesPayload>({
    mutationFn: (payload) => bulkDeleteSamples(payload),
    onSuccess: (res) => {
      if (res.response === false) return;
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
    },
  });
}

/** GET `/api/v1/sample-processing/{processId}` */
export function useSampleProcessingById(processId: number | null, enabled = true) {
  const idValid = processId != null && processId > 0;

  return useQuery<SampleProcessingByIdApiResponse, Error>({
    queryKey: idValid
      ? sampleQueryKeys.processing(processId)
      : ['samples', 'processing', 'idle'],
    queryFn: () => fetchSampleProcessingById(processId!),
    enabled: enabled && idValid,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** GET `/api/v1/sample-processing/sample/{sampleId}` */
export function useSampleProcessingBySampleId(sampleId: number | null, enabled = true) {
  const idValid = sampleId != null && sampleId > 0;

  return useQuery<SampleProcessingBySampleApiResponse, Error>({
    queryKey: idValid
      ? sampleQueryKeys.processingBySample(sampleId)
      : ['samples', 'processing', 'sample', 'idle'],
    queryFn: () => fetchSampleProcessingBySampleId(sampleId!),
    enabled: enabled && idValid,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** PUT `/api/v1/sample-processing/{processId}` */
export function useUpdateSampleProcessing() {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateSampleProcessingApiResponse,
    Error,
    { processId: number; payload: UpdateSampleProcessingPayload }
  >({
    mutationFn: ({ processId, payload }) => updateSampleProcessing(processId, payload),
    onSuccess: (res, { processId, payload }) => {
      if (res.response === false) return;
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.processing(processId) });
      queryClient.invalidateQueries({
        queryKey: sampleQueryKeys.processingBySample(payload.sampleId),
      });
    },
  });
}

/** POST `/api/v1/sample-processing` */
export function useCreateSampleProcessing() {
  const queryClient = useQueryClient();

  return useMutation<
    CreateSampleProcessingApiResponse,
    Error,
    CreateSampleProcessingPayload
  >({
    mutationFn: (payload) => createSampleProcessing(payload),
    onSuccess: (res, { sampleId }) => {
      if (res.response === false) return;
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.detail(sampleId) });
      queryClient.invalidateQueries({
        queryKey: sampleQueryKeys.processingBySample(sampleId),
      });
      if (res.data?.id) {
        queryClient.invalidateQueries({
          queryKey: sampleQueryKeys.processing(res.data.id),
        });
      }
    },
  });
}

/** POST `/api/v1/samples/register` */
export function useRegisterSample() {
  const queryClient = useQueryClient();

  return useMutation<RegisterSampleApiResponse, Error, RegisterSamplePayload>({
    mutationFn: (payload) => registerSample(payload),
    onSuccess: (res) => {
      if (res.response === false) return;
      queryClient.invalidateQueries({ queryKey: sampleQueryKeys.all });
    },
  });
}
