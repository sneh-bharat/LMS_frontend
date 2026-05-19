'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchPatientById, type Patient } from './Patient_Service_API';

export const patientsByIdsQueryKey = (ids: number[]) =>
  ['patients', 'by-ids', ...[...ids].sort((a, b) => a - b)] as const;

/**
 * Fetches patient records for a set of ids (e.g. test-order list enrichment).
 */
export function usePatientsByIds(patientIds: number[]) {
  const uniqueIds = useMemo(
    () => [...new Set(patientIds.filter((id) => id > 0))],
    [patientIds]
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['patients', 'detail', id] as const,
      queryFn: async (): Promise<Patient | null> => {
        const res = await fetchPatientById(id);
        return res.data ?? null;
      },
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    })),
  });

  const patientsById = useMemo(() => {
    const map = new Map<number, Patient>();
    uniqueIds.forEach((id, index) => {
      const patient = queries[index]?.data;
      if (patient) map.set(id, patient);
    });
    return map;
  }, [uniqueIds, queries]);

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);

  return { patientsById, isLoading, isFetching };
}
