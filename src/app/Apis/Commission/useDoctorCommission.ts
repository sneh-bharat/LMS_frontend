'use client';

import { useMutation, useQuery, useQueryClient, skipToken } from '@tanstack/react-query';
import {
  createDoctorCommission,
  deleteDoctorCommissionById,
  fetchDoctorCommissions,
  fetchDoctorCommissionPay,
  fetchDoctorCommissionPayByRange,
  fetchDoctorPaymentHistory,
  fetchDoctorTestCommissions,
  markDoctorCommissionPaid,
  updateDoctorCommission,
  updateDoctorCommissionByTestId,
  type CreateDoctorCommissionPayload,
  type UpdateDoctorCommissionPayload,
  type UpdateDoctorTestCommissionOverridePayload,
  type DoctorCommissionPayRangeParams,
  type DoctorPaymentHistoryParams,
  type MarkDoctorCommissionPaidParams,
} from './commissionPrice';
import { referringDoctorQueryKeys } from '../doctor/useReferringDoctors';

export const doctorCommissionQueryKeys = {
  all: ['doctor-commissions'] as const,
  byDoctor: (doctorId: number) => [...doctorCommissionQueryKeys.all, doctorId] as const,
  testsByDoctor: (doctorId: number) =>
    [...doctorCommissionQueryKeys.all, 'tests', doctorId] as const,
  payByDoctor: (doctorId: number) => [...doctorCommissionQueryKeys.all, 'pay', doctorId] as const,
  paymentHistoryByDoctor: (doctorId: number, pageNo: number, pageSize: number) =>
    [...doctorCommissionQueryKeys.all, 'payment-history', doctorId, pageNo, pageSize] as const,
};

export function useDoctorCommissions(
  doctorId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  const numericId = doctorId != null && doctorId > 0 ? doctorId : undefined;
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey:
      numericId != null
        ? doctorCommissionQueryKeys.byDoctor(numericId)
        : ([...doctorCommissionQueryKeys.all, 'disabled'] as const),
    queryFn: numericId != null ? () => fetchDoctorCommissions(numericId) : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDoctorTestCommissions(
  doctorId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  const numericId = doctorId != null && doctorId > 0 ? doctorId : undefined;
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey:
      numericId != null
        ? doctorCommissionQueryKeys.testsByDoctor(numericId)
        : ([...doctorCommissionQueryKeys.all, 'tests', 'disabled'] as const),
    queryFn: numericId != null ? () => fetchDoctorTestCommissions(numericId) : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useDoctorCommissionPay(
  doctorId: number | null | undefined,
  options?: { enabled?: boolean }
) {
  const numericId = doctorId != null && doctorId > 0 ? doctorId : undefined;
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey:
      numericId != null
        ? doctorCommissionQueryKeys.payByDoctor(numericId)
        : ([...doctorCommissionQueryKeys.all, 'pay', 'disabled'] as const),
    queryFn: numericId != null ? () => fetchDoctorCommissionPay(numericId) : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCalculateDoctorCommissionByRange() {
  return useMutation({
    mutationFn: (params: DoctorCommissionPayRangeParams) =>
      fetchDoctorCommissionPayByRange(params),
  });
}

export function useDoctorPaymentHistory(
  doctorId: number | null | undefined,
  pageNo: number,
  pageSize: number,
  options?: { enabled?: boolean }
) {
  const numericId = doctorId != null && doctorId > 0 ? doctorId : undefined;
  const { enabled = true } = options ?? {};

  return useQuery({
    queryKey:
      numericId != null
        ? doctorCommissionQueryKeys.paymentHistoryByDoctor(numericId, pageNo, pageSize)
        : ([...doctorCommissionQueryKeys.all, 'payment-history', 'disabled'] as const),
    queryFn:
      numericId != null
        ? () => fetchDoctorPaymentHistory({ doctorId: numericId, pageNo, pageSize })
        : skipToken,
    enabled: Boolean(numericId) && enabled,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function usePayDoctorCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      doctorId,
      payload,
    }: {
      doctorId: number;
      payload: Omit<MarkDoctorCommissionPaidParams, 'doctorId'>;
    }) => markDoctorCommissionPaid({ doctorId, ...payload }),
    onSuccess: (_data, { doctorId }) => {
      queryClient.invalidateQueries({
        queryKey: [...doctorCommissionQueryKeys.all, 'payment-history', doctorId],
      });
      queryClient.invalidateQueries({
        queryKey: doctorCommissionQueryKeys.payByDoctor(doctorId),
      });
    },
  });
}

export function useCreateDoctorCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDoctorCommissionPayload) => createDoctorCommission(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: referringDoctorQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: referringDoctorQueryKeys.detail(payload.doctorId),
      });
      queryClient.invalidateQueries({
        queryKey: doctorCommissionQueryKeys.byDoctor(payload.doctorId),
      });
    },
  });
}

export function useUpdateDoctorCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      commissionId,
      payload,
    }: {
      commissionId: number;
      payload: UpdateDoctorCommissionPayload;
    }) => updateDoctorCommission(commissionId, payload),
    onSuccess: (_data, { payload }) => {
      queryClient.invalidateQueries({
        queryKey: doctorCommissionQueryKeys.byDoctor(payload.doctorId),
      });
    },
  });
}

export function useDeleteDoctorCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commissionId }: { commissionId: number; doctorId: number }) =>
      deleteDoctorCommissionById(commissionId),
    onSuccess: (_data, { doctorId }) => {
      queryClient.invalidateQueries({
        queryKey: doctorCommissionQueryKeys.byDoctor(doctorId),
      });
    },
  });
}

export function useUpdateDoctorTestCommission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      doctorId,
      testId,
      payload,
    }: {
      doctorId: number;
      testId: number;
      payload: UpdateDoctorTestCommissionOverridePayload;
    }) => updateDoctorCommissionByTestId(doctorId, testId, payload),
    onSuccess: (_data, { doctorId }) => {
      queryClient.invalidateQueries({
        queryKey: doctorCommissionQueryKeys.testsByDoctor(doctorId),
      });
    },
  });
}
