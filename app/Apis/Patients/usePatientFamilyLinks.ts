'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createPatientFamilyLink,
  deletePatientFamilyLink,
  fetchFamilyLinksByPatientId,
  type CreatePatientFamilyLinkPayload,
  type PatientFamilyLink,
  type PatientFamilyLinkRow,
} from './patientFamilyLinkApi';
import type { ApiResponse } from './Patient_Service_API';
import { fetchPatientById, type Patient } from './Patient_Service_API';

export const familyLinkQueryKeys = {
  all: ['family-links'] as const,
  byPatient: (patientId: number) => [...familyLinkQueryKeys.all, 'patient', patientId] as const,
};

export type FamilyLinksQueryPayload = {
  rows: PatientFamilyLinkRow[];
  message: string | null;
};

/**
 * GET `/api/v1/family-links/patient/{patientId}` — Bearer token via `patientServiceAxios`.
 */
export function useFamilyLinksByPatientId(patientId: number | null) {
  return useQuery({
    queryKey:
      patientId != null && patientId > 0
        ? familyLinkQueryKeys.byPatient(patientId)
        : ([...familyLinkQueryKeys.all, 'patient', 'idle'] as const),
    queryFn: async (): Promise<FamilyLinksQueryPayload> => {
      const res = await fetchFamilyLinksByPatientId(patientId!);
      return {
        rows: Array.isArray(res.data) ? res.data : [],
        message: res.message ?? null,
      };
    },
    enabled: patientId != null && patientId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Patient header on family-links listing (GET patient by id).
 */
export function usePatientForFamilyLinkHeader(patientId: number | null) {
  return useQuery({
    queryKey: ['patients', 'detail', patientId ?? 'none'] as const,
    queryFn: async (): Promise<Patient | null> => {
      const res = await fetchPatientById(patientId!);
      return res.data ?? null;
    },
    enabled: patientId != null && patientId > 0,
    staleTime: 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

function isCreateSuccess(res: ApiResponse<PatientFamilyLink>): boolean {
  return res.response === true || String(res.status || '').includes('200');
}

/**
 * POST `/api/v1/family-links` — Bearer token via `patientServiceAxios`.
 */
export function useCreateFamilyLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePatientFamilyLinkPayload) => {
      const result = await createPatientFamilyLink(payload);
      if (!isCreateSuccess(result) || !result.data) {
        throw new Error(result.message || 'Failed to create family link');
      }
      return result;
    },
    onSuccess: (result, variables) => {
      toast.success(result.message || 'Family link created successfully');
      void queryClient.invalidateQueries({
        queryKey: familyLinkQueryKeys.byPatient(variables.patientId),
      });
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Could not create family link';
      toast.error(msg);
    },
  });
}

/**
 * DELETE `/api/v1/family-links/patient/{patientId}/member/{familyMemberId}`
 */
export function useDeleteFamilyLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (args: { patientId: number; familyMemberId: number }) => {
      await deletePatientFamilyLink(args.patientId, args.familyMemberId);
    },
    onSuccess: (_data, { patientId }) => {
      toast.success('Family link removed.');
      void queryClient.invalidateQueries({ queryKey: familyLinkQueryKeys.byPatient(patientId) });
    },
    onError: (error: unknown) => {
      const msg = error instanceof Error ? error.message : 'Could not remove family link';
      toast.error(msg);
    },
  });
}
