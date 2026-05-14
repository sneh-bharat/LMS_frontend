import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { branchApi, Branch, CreateBranchInput, UpdateBranchInput, BranchQueryParams } from './branchApi';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  list: (params: BranchQueryParams) => [...branchKeys.lists(), params] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: number) => [...branchKeys.details(), id] as const,
  active: () => [...branchKeys.all, 'active'] as const,
};

// ─── Query Hooks ─────────────────────────────────────────────────────────────

/**
 * Hook to fetch branches with pagination, search, and filtering
 */
export function useBranches(params: BranchQueryParams = {}) {
  return useQuery({
    queryKey: branchKeys.list(params),
    queryFn: () => branchApi.getAllBranches(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch active branches only
 */
export function useActiveBranches(params: { pageNo?: number; pageSize?: number; search?: string; tenantId?: number } = {}) {
  return useQuery({
    queryKey: [...branchKeys.active(), params],
    queryFn: () => branchApi.getActiveBranches(params),
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch a single branch by ID
 */
export function useBranchById(id: number) {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => branchApi.getBranchById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

// ─── Mutation Hooks ──────────────────────────────────────────────────────────

/**
 * Hook to create a new branch
 */
export function useCreateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBranchInput) => branchApi.createBranch(input),
    onSuccess: (result) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Branch created successfully');
        queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
        queryClient.invalidateQueries({ queryKey: branchKeys.active() });
      } else {
        toast.error(result.message || 'Failed to create branch');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while creating branch');
    },
  });
}

/**
 * Hook to update an existing branch
 */
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateBranchInput }) =>
      branchApi.updateBranch(id, input),
    onSuccess: (result, variables) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Branch updated successfully');
        queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
        queryClient.invalidateQueries({ queryKey: branchKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: branchKeys.active() });
      } else {
        toast.error(result.message || 'Failed to update branch');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating branch');
    },
  });
}

/**
 * Hook to delete a branch
 */
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => branchApi.deleteBranch(id),
    onSuccess: (result) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Branch deleted successfully');
        queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
        queryClient.invalidateQueries({ queryKey: branchKeys.active() });
      } else {
        toast.error(result.message || 'Failed to delete branch');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while deleting branch');
    },
  });
}

/**
 * Hook to toggle branch status (active/inactive)
 */
export function useToggleBranchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      branchApi.toggleBranchStatus(id, isActive),
    onSuccess: (result, variables) => {
      if (result.response || result.status === 'success') {
        toast.success(result.message || 'Branch status updated successfully');
        queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
        queryClient.invalidateQueries({ queryKey: branchKeys.detail(variables.id) });
        queryClient.invalidateQueries({ queryKey: branchKeys.active() });
      } else {
        toast.error(result.message || 'Failed to update branch status');
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'An error occurred while updating branch status');
    },
  });
}