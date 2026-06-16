'use client';

import { useMemo, useState } from 'react';

export interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
}

export interface UsePaginationResult<T> {
  page: number;
  pageSize: number;
  totalPages: number;
  pageItems: T[];
  setPage: (page: number) => void;
  next: () => void;
  prev: () => void;
  canPrev: boolean;
  canNext: boolean;
}

/**
 * Client-side pagination over an in-memory array.
 * For server-paginated endpoints, pass the page/pageSize to the query instead.
 */
export function usePagination<T>(
  items: T[],
  { initialPage = 1, pageSize = 10 }: UsePaginationOptions = {},
): UsePaginationResult<T> {
  const [page, setPageState] = useState(initialPage);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => items.slice((safePage - 1) * pageSize, safePage * pageSize),
    [items, safePage, pageSize],
  );

  const setPage = (p: number) => setPageState(Math.min(Math.max(1, p), totalPages));

  return {
    page: safePage,
    pageSize,
    totalPages,
    pageItems,
    setPage,
    next: () => setPage(safePage + 1),
    prev: () => setPage(safePage - 1),
    canPrev: safePage > 1,
    canNext: safePage < totalPages,
  };
}

export default usePagination;
