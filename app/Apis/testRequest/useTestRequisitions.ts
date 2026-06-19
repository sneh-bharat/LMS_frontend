'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveTestRequisitionById,
  addTestRequisitionItems,
  createTestRequisition,
  deleteTestRequisitionById,
  deleteTestRequisitionItem,
  fetchTestRequisitionById,
  getTestRequisitions,
  getTestRequisitionsByPatientId,
  getTestRequisitionsByStatus,
  rejectTestRequisitionById,
  searchTestRequisitions,
  updateTestRequisition,
  RequisitionStatus,
  type ApproveTestRequisitionPayload,
  type FetchTestRequisitionsParams,
  type RejectTestRequisitionPayload,
  type SearchTestRequisitionsParams,
  type TestRequisitionItem,
  type UpdateTestRequisitionPayload,
} from './TestRequestApi';

export { RequisitionStatus };

const LIST_KEY = ['test-requisitions'] as const;
const DETAIL_KEY = ['test-requisition-detail'] as const;

/** GET test requisitions by status */
export function useTestRequisitions(
  status: RequisitionStatus,
  pageNo = 0,
  pageSize = 10,
  enabled = true,
) {
  return useQuery({
    queryKey: ['test-requisitions', status, pageNo, pageSize],
    queryFn: () => getTestRequisitionsByStatus(status, pageNo, pageSize),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** GET test requisitions by patient */
export function useTestRequisitionsByPatientId(
  patientId: number | null,
  pageNo = 0,
  pageSize = 10,
  enabled = true,
) {
  const id = patientId != null && patientId > 0 ? patientId : null;

  return useQuery({
    queryKey: ['test-requisitions', 'patient', id, pageNo, pageSize],
    queryFn: () => getTestRequisitionsByPatientId(id!, pageNo, pageSize),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
    enabled: enabled && id != null,
  });
}

/** GET all test requisitions */
export function useTestRequisitionsList(
  params: FetchTestRequisitionsParams,
  queryOptions?: { enabled?: boolean },
) {
  const { pageNo, pageSize } = params;
  const { enabled = true } = queryOptions ?? {};

  return useQuery({
    queryKey: [...LIST_KEY, pageNo, pageSize],
    queryFn: () => getTestRequisitions(params),
    staleTime: 30_000,
    enabled,
  });
}

/** Search test requisitions */
export function useSearchTestRequisitions(
  params: SearchTestRequisitionsParams & { enabled?: boolean },
) {
  const { enabled = true, searchTerm, pageNo, pageSize } = params;
  const trimmedTerm = searchTerm.trim();

  return useQuery({
    queryKey: [...LIST_KEY, 'search', trimmedTerm, pageNo, pageSize],
    queryFn: () => searchTestRequisitions({ searchTerm: trimmedTerm, pageNo, pageSize }),
    staleTime: 30_000,
    enabled: enabled && trimmedTerm.length > 0,
  });
}

export function useTestRequisitionById(requisitionId: number | null, enabled = false) {
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

export function useAddTestRequisitionItems() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requisitionId,
      items,
    }: {
      requisitionId: number;
      items: TestRequisitionItem[];
    }) => addTestRequisitionItems(requisitionId, items),
    onSuccess: (_res, { requisitionId }) => {
      queryClient.invalidateQueries({
        queryKey: LIST_KEY,
        refetchType: 'active',
      });
      if (requisitionId > 0) {
        queryClient.invalidateQueries({
          queryKey: [...DETAIL_KEY, requisitionId],
          refetchType: 'active',
        });
      }
    },
  });
}

export function useDeleteTestRequisitionItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requisitionId,
      itemId,
    }: {
      requisitionId: number;
      itemId: number;
    }) => deleteTestRequisitionItem(requisitionId, itemId),
    onSuccess: (_res, { requisitionId }) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY, refetchType: 'active' });
      if (requisitionId > 0) {
        queryClient.invalidateQueries({
          queryKey: [...DETAIL_KEY, requisitionId],
          refetchType: 'active',
        });
      }
    },
  });
}

export function useCreateTestRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTestRequisition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY, refetchType: 'active' });
    },
  });
}

export function useDeleteTestRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTestRequisitionById,
    onSuccess: (_res, requisitionId) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY, refetchType: 'active' });
      if (requisitionId > 0) {
        queryClient.invalidateQueries({
          queryKey: [...DETAIL_KEY, requisitionId],
          refetchType: 'active',
        });
      }
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: LIST_KEY, refetchType: 'active' });
      if (requisitionId > 0) {
        queryClient.invalidateQueries({
          queryKey: [...DETAIL_KEY, requisitionId],
          refetchType: 'active',
        });
      }
    },
  });
}

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
      queryClient.invalidateQueries({ queryKey: LIST_KEY, refetchType: 'active' });
      if (requisitionId > 0) {
        queryClient.invalidateQueries({
          queryKey: [...DETAIL_KEY, requisitionId],
          refetchType: 'active',
        });
      }
    },
  });
}

export function useUpdateTestRequisition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requisitionId,
      payload,
    }: {
      requisitionId: number;
      payload: UpdateTestRequisitionPayload;
    }) => updateTestRequisition(requisitionId, payload),
    onSuccess: (_res, { requisitionId }) => {
      queryClient.invalidateQueries({ queryKey: LIST_KEY, refetchType: 'active' });
      if (requisitionId > 0) {
        queryClient.invalidateQueries({
          queryKey: [...DETAIL_KEY, requisitionId],
          refetchType: 'active',
        });
      }
    },
  });
}
