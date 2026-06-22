'use client';

import { useQuery } from '@tanstack/react-query';
import { getSlaMonitoring, type GetSlaMonitoringResponse } from './SlamonitoringApi';

export const slaMonitoringQueryKeys = {
  all: ['sla-monitoring'] as const,
  list: () => [...slaMonitoringQueryKeys.all, 'list'] as const,
};

export function useSlaMonitoring(enabled = true) {
  return useQuery<GetSlaMonitoringResponse, Error>({
    queryKey: slaMonitoringQueryKeys.list(),
    queryFn: getSlaMonitoring,
    enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
