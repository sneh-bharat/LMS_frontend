/**
 * Custom Hooks for Reflex Rules API Integration
 * React Query hooks for managing laboratory reflex testing rules
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchReflexRules,
  fetchReflexRuleById,
  createReflexRule,
  updateReflexRule,
  deleteReflexRule,
  toggleReflexRuleStatus,
  type ReflexRule,
  type CreateReflexRuleInput,
  type UpdateReflexRuleInput,
  type ApiResponse,
  type PaginatedResponse,
} from '@/app/Apis/lab/ReflexRules';
import { toast } from 'sonner';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const reflexRuleKeys = {
  all: ['reflexRules'] as const,
  lists: () => [...reflexRuleKeys.all, 'list'] as const,
  list: (params: { pageNo: number; pageSize: number; search?: string; statusFilter?: string }) =>
    [...reflexRuleKeys.lists(), params] as const,
  details: () => [...reflexRuleKeys.all, 'detail'] as const,
  detail: (id: number) => [...reflexRuleKeys.details(), id] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch all reflex rules with pagination
 */
export function useReflexRules(
  pageNo: number = 0,
  pageSize: number = 20,
  search?: string,
  statusFilter?: string
) {
  return useQuery({
    queryKey: reflexRuleKeys.list({ pageNo, pageSize, search, statusFilter }),
    queryFn: () => fetchReflexRules(pageNo, pageSize, search, statusFilter),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single reflex rule by ID
 */
export function useReflexRule(id: number | null) {
  return useQuery({
    queryKey: reflexRuleKeys.detail(id!),
    queryFn: () => fetchReflexRuleById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

/**
 * Hook to create a new reflex rule
 */
export function useCreateReflexRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReflexRule,
    onSuccess: (response: ApiResponse<ReflexRule>) => {
      // Invalidate and refetch reflex rules list
      queryClient.invalidateQueries({ queryKey: reflexRuleKeys.lists() });
      toast.success('Reflex rule created successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to create reflex rule';
      toast.error(message);
      console.error('Create reflex rule error:', error);
    },
  });
}

/**
 * Hook to update an existing reflex rule
 */
export function useUpdateReflexRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, data }: { ruleId: number; data: UpdateReflexRuleInput }) =>
      updateReflexRule(ruleId, data),
    onSuccess: (response: ApiResponse<ReflexRule>, variables) => {
      // Invalidate and refetch both list and specific rule
      queryClient.invalidateQueries({ queryKey: reflexRuleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reflexRuleKeys.detail(variables.ruleId) });
      toast.success('Reflex rule updated successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to update reflex rule';
      toast.error(message);
      console.error('Update reflex rule error:', error);
    },
  });
}

/**
 * Hook to delete a reflex rule
 */
export function useDeleteReflexRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReflexRule,
    onSuccess: () => {
      // Invalidate and refetch reflex rules list
      queryClient.invalidateQueries({ queryKey: reflexRuleKeys.lists() });
      toast.success('Reflex rule deleted successfully');
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to delete reflex rule';
      toast.error(message);
      console.error('Delete reflex rule error:', error);
    },
  });
}

/**
 * Hook to toggle reflex rule status
 */
export function useToggleReflexRuleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId, isActive }: { ruleId: number; isActive: boolean }) =>
      toggleReflexRuleStatus(ruleId, isActive),
    onSuccess: (_, variables) => {
      // Invalidate and refetch both list and specific rule
      queryClient.invalidateQueries({ queryKey: reflexRuleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reflexRuleKeys.detail(variables.ruleId) });
      toast.success(`Reflex rule ${variables.isActive ? 'deactivated' : 'activated'} successfully`);
    },
    onError: (error: any) => {
      const message = error?.message || 'Failed to toggle reflex rule status';
      toast.error(message);
      console.error('Toggle reflex rule status error:', error);
    },
  });
}
