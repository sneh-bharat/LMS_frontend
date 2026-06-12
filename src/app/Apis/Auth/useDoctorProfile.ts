'use client';

import { useQuery } from '@tanstack/react-query';
import {
  fetchDoctorProfileById,
  getStoredDoctorId,
  persistDoctorSession,
  type DoctorProfileData,
} from './doctorProfileApi';

export const doctorProfileQueryKeys = {
  all: ['doctor-profile'] as const,
  byId: (doctorId: number) => [...doctorProfileQueryKeys.all, doctorId] as const,
};

export function useDoctorProfile(doctorId: number | null | undefined) {
  const numericId = doctorId != null && doctorId > 0 ? doctorId : getStoredDoctorId();

  return useQuery({
    queryKey: numericId != null ? doctorProfileQueryKeys.byId(numericId) : doctorProfileQueryKeys.all,
    queryFn: async () => {
      if (numericId == null) {
        throw new Error('Doctor session not found. Please sign in again.');
      }
      const res = await fetchDoctorProfileById(numericId);
      if (!res?.data) {
        throw new Error(res?.message?.trim() || 'Could not load profile.');
      }
      persistDoctorSession(res.data);
      return res;
    },
    enabled: numericId != null,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export type { DoctorProfileData };
