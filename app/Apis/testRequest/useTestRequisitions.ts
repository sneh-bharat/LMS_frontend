'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTestRequisition,
  deleteTestRequisitionById,
  fetchTestRequisitionById,
  getTestRequisitions,
  searchTestRequisitions,
  rejectTestRequisitionById,
  approveTestRequisitionById,
  type FetchTestRequisitionsParams,
  type SearchTestRequisitionsParams,
  type RejectTestRequisitionPayload,
  type ApproveTestRequisitionPayload,
} from './TestRequestApi';

const LIST_KEY = ['test-requisitions'] as const;
const DETAIL_KEY = ['test-requisition-detail'] as const;

/** GET test requisitions list */
export function useTestRequisitionsList(
  params: FetchTestRequisitionsParams,
  queryOptions?: { enabled?: boolean }
) {
  const { pageNo, pageSize } = params;
  const { enabled = true } = queryOptions ?? {};

  return useQuery({
    queryKey: [...LIST_KEY, pageNo, pageSize],
    queryFn: () => getTestRequisitions(params),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled,
  });
}

/** Search test requisitions — GET `/test-requisitions/search`. */
export function useSearchTestRequisitions(
  params: SearchTestRequisitionsParams & { enabled?: boolean }
) {
  const { enabled = true, searchTerm, pageNo, pageSize } = params;
  const trimmedTerm = searchTerm.trim();

  return useQuery({
    queryKey: [...LIST_KEY, 'search', trimmedTerm, pageNo, pageSize],
    queryFn: () => searchTestRequisitions({ searchTerm: trimmedTerm, pageNo, pageSize }),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    enabled: enabled && trimmedTerm.length > 0,
  });
}

/** GET /api/v1/test-requisitions/{requisitionId} — only when enabled (e.g. on View click). */
export function useTestRequisitionById(
  requisitionId: number | null,
  enabled = false
) {
  const id = requisitionId != null && requisitionId > 0 ? requisitionId : null;

  return useQuery({
    queryKey: [...DETAIL_KEY, id],
    queryFn: () => fetchTestRequisitionById(id!),
    enabled: enabled && id != null,
    staleTime: 0,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/** POST new test requisition */
export function useCreateTestRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestRequisition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
    },
  });
}

/** Soft-delete — DELETE /api/v1/test-requisitions/{requisitionId} */
export function useDeleteTestRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTestRequisitionById,
    onSuccess: (_res, requisitionId) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: [...DETAIL_KEY, requisitionId] });
    },
  });
}

/** POST /api/v1/test-requisitions/{requisitionId}/reject */
export function useRejectTestRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requisitionId,
      payload,
    }: {
      requisitionId: number;
      payload?: RejectTestRequisitionPayload;
    }) => rejectTestRequisitionById(requisitionId, payload),
    onSuccess: (_res, { requisitionId }) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: [...DETAIL_KEY, requisitionId] });
    },
  });
}

/** POST /api/v1/test-requisitions/{requisitionId}/approve */
export function useApproveTestRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requisitionId,
      payload,
    }: {
      requisitionId: number;
      payload?: ApproveTestRequisitionPayload;
    }) => approveTestRequisitionById(requisitionId, payload),
    onSuccess: (_res, { requisitionId }) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY });
      queryClient.invalidateQueries({ queryKey: [...DETAIL_KEY, requisitionId] });
    },
  });
}
