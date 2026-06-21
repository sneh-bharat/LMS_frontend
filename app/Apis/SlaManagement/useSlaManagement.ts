'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createSlaRule,
  deleteSlaRule,
  getSlaRules,
  getSlaRulesByPriority,
  updateSlaRule,
  type CreateSlaRuleInput,
  type SlaRulePriority,
  type SlaRulesApiResponse,
  type UpdateSlaRuleInput,
} from './SlaManagementApi';

export const slaManagementQueryKeys = {
  all: ['sla-management'] as const,
  list: (priority?: SlaRulePriority) =>
    priority
      ? ([...slaManagementQueryKeys.all, 'list', 'priority', priority] as const)
      : ([...slaManagementQueryKeys.all, 'list'] as const),
};

export function useSlaRules(priorityFilter: 'All' | SlaRulePriority = 'All') {
  const priority = priorityFilter === 'All' ? undefined : priorityFilter;

  return useQuery<SlaRulesApiResponse, Error>({
    queryKey: slaManagementQueryKeys.list(priority),
    queryFn: () => (priority ? getSlaRulesByPriority(priority) : getSlaRules()),
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateSlaRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSlaRuleInput) => createSlaRule(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: slaManagementQueryKeys.all });
    },
  });
}

export function useUpdateSlaRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateSlaRuleInput }) =>
      updateSlaRule(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: slaManagementQueryKeys.all });
    },
  });
}

export function useDeleteSlaRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteSlaRule(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: slaManagementQueryKeys.all });
    },
  });
}
