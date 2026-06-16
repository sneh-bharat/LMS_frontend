'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/query/queryKeys';
import {
  branchApi,
  type CreateBranchInput,
  type UpdateBranchInput,
} from '../services/branch.service';

export interface BranchListParams {
  page: number;
  size: number;
}

/** Paginated branch list. */
export function useBranches(params: BranchListParams) {
  return useQuery({
    queryKey: [...queryKeys.branches.list(), params],
    queryFn: () => branchApi.listBranchesAll(params),
  });
}

function extractError(error: unknown, fallback: string): string {
  const e = error as { response?: { data?: { message?: string; data?: { errorCode?: string } } } };
  return e?.response?.data?.message || e?.response?.data?.data?.errorCode || fallback;
}

/** Create / update / delete mutations; each invalidates the branch list on success. */
export function useBranchMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.branches.all });

  const create = useMutation({
    mutationFn: (data: CreateBranchInput) => branchApi.createBranch(data),
    onSuccess: () => {
      toast.success('Branch created successfully!');
      invalidate();
    },
    onError: (e) => toast.error(extractError(e, 'Failed to save branch. Please try again.')),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateBranchInput }) =>
      branchApi.updateBranch(id, data),
    onSuccess: () => {
      toast.success('Branch updated successfully!');
      invalidate();
    },
    onError: (e) => toast.error(extractError(e, 'Failed to save branch. Please try again.')),
  });

  const remove = useMutation({
    mutationFn: (id: number) => branchApi.deleteBranch(id),
    onSuccess: () => {
      toast.success('Branch deleted successfully!');
      invalidate();
    },
    onError: (e) => toast.error(extractError(e, 'Failed to delete branch. Please try again.')),
  });

  return { create, update, remove };
}
