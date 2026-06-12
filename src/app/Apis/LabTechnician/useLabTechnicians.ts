'use client';

import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import {
  createLabTechnician,
  deleteLabTechnician,
  fetchLabTechnicianById,
  fetchLabTechnicianByUsername,
  fetchLabTechnicians,
  updateLabTechnician,
  type CreateLabTechnicianPayload,
  type FetchLabTechniciansParams,
  type LabTechnicianDetailApiResponse,
  type LabTechnicianByUsernameApiResponse,
  type UpdateLabTechnicianParams,
} from './labtechnicianApi';

export const labTechnicianQueryKeys = {
  all: ['lab-technicians'] as const,
  list: (params: FetchLabTechniciansParams) =>
    [...labTechnicianQueryKeys.all, 'list', params] as const,
  detail: (id: number) => [...labTechnicianQueryKeys.all, 'detail', id] as const,
  byUsername: (username: string) => [...labTechnicianQueryKeys.all, 'username', username] as const,
};

/**
 * Fetch paginated list of verified lab technicians.
 */
export function useLabTechnicians(params: FetchLabTechniciansParams) {
  return useQuery({
    queryKey: labTechnicianQueryKeys.list(params),
    queryFn: () => fetchLabTechnicians(params),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch a single lab technician by ID.
 */
export function useLabTechnician(
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<LabTechnicianDetailApiResponse>, 'queryKey' | 'queryFn'>
) {
  const numericId = id != null && id > 0 ? id : null;
  return useQuery({
    queryKey: labTechnicianQueryKeys.detail(numericId ?? 0),
    queryFn: () => fetchLabTechnicianById(numericId!),
    enabled: numericId != null && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}

/**
 * Create a new lab technician.
 */
export function useCreateLabTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLabTechnicianPayload) => createLabTechnician(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labTechnicianQueryKeys.all });
    },
  });
}

/**
 * Update an existing lab technician by ID.
 */
export function useUpdateLabTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UpdateLabTechnicianParams) => updateLabTechnician(params),
    onSuccess: (_data, params) => {
      queryClient.invalidateQueries({ queryKey: labTechnicianQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: labTechnicianQueryKeys.detail(params.id) });
    },
  });
}

/**
 * Delete a lab technician by ID.
 */
export function useDeleteLabTechnician() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteLabTechnician(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: labTechnicianQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: labTechnicianQueryKeys.detail(id) });
    },
  });
}

/**
 * Fetch a single lab technician by username.
 */
export function useLabTechnicianByUsername(
  username: string | null | undefined,
  options?: Omit<UseQueryOptions<LabTechnicianByUsernameApiResponse>, 'queryKey' | 'queryFn'>
) {
  const trimmed = username?.trim() || '';
  return useQuery({
    queryKey: labTechnicianQueryKeys.byUsername(trimmed),
    queryFn: () => fetchLabTechnicianByUsername(trimmed),
    enabled: trimmed.length > 0 && (options?.enabled ?? true),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
}
