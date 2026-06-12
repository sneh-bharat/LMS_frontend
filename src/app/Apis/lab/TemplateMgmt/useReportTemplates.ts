'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createReportTemplate,
  fetchReportTemplates,
  type CreateReportTemplatePayload,
  type FetchReportTemplatesParams,
  type ReportTemplatesApiResponse,
} from './TemplateMgmtApi';

export const reportTemplateQueryKeys = {
  all: ['report-templates'] as const,
  list: (params: FetchReportTemplatesParams) =>
    [...reportTemplateQueryKeys.all, 'list', params] as const,
};

/**
 * Fetch paginated list of report templates.
 */
export function useReportTemplates(params: FetchReportTemplatesParams) {
  return useQuery<ReportTemplatesApiResponse>({
    queryKey: reportTemplateQueryKeys.list(params),
    queryFn: () => fetchReportTemplates(params),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Create a new report template.
 */
export function useCreateReportTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReportTemplatePayload) => createReportTemplate(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportTemplateQueryKeys.all });
    },
  });
}
