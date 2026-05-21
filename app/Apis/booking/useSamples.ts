'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchSamples,
  registerSample,
  type FetchSamplesParams,
  type RegisterSamplePayload,
  type RegisterSampleApiResponse,
  type SamplesListApiResponse,
} from './sample';

export const sampleQueryKeys = {
  all: ['samples'] as const,
  list: (params: FetchSamplesParams) =>
    [
      ...sampleQueryKeys.all,
      'list',
      params.pageNo ?? 0,
      params.pageSize ?? 10,
      params.sortBy ?? 'createdAt',
    ] as const,
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
