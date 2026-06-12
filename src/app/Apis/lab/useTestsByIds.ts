'use client';

import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { fetchTestByIdOptional, type Test } from './TestApis';

export const testsByIdsQueryKey = (ids: number[]) =>
  ['tests', 'by-ids', ...[...ids].sort((a, b) => a - b)] as const;

/**
 * Fetches lab test records for a set of ids (e.g. test-order list enrichment).
 */
export function useTestsByIds(testIds: number[]) {
  const uniqueIds = useMemo(
    () => [...new Set(testIds.filter((id) => id > 0))],
    [testIds]
  );

  const queries = useQueries({
    queries: uniqueIds.map((id) => ({
      queryKey: ['tests', 'detail', id] as const,
      queryFn: (): Promise<Test | null> => fetchTestByIdOptional(id),
      staleTime: 5 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    })),
  });

  const testsById = useMemo(() => {
    const map = new Map<number, Test>();
    uniqueIds.forEach((id, index) => {
      const test = queries[index]?.data;
      if (test) map.set(id, test);
    });
    return map;
  }, [uniqueIds, queries]);

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);

  return { testsById, isLoading, isFetching };
}
