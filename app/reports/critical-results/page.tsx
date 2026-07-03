'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CRITICAL RESULTS PAGE — Definitions & Workflow
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * PURPOSE
 *   Lists lab parameter results that exceeded critical (panic) thresholds and
 *   need immediate clinical review.
 *
 * DATA FLOW
 *   1. `useGetCriticalResults()` (React Query hook in useReportEntry.ts)
 *      → calls `fetchCriticalResults()` in reportApi.ts
 *   2. `fetchCriticalResults()` → GET `/api/v1/results/critical`
 *   3. API envelope:
 *        {
 *          data: { criticalResults: CriticalResultItem[] },
 *          response: boolean,
 *          message: string,
 *          status: string
 *        }
 *   4. This page reads `data.data.criticalResults` and renders the table.
 *
 * KEY TYPES (reportApi.ts)
 *   - CriticalResultItem  → one row (parameter result)
 *   - CriticalResultsData → { criticalResults: CriticalResultItem[] }
 *   - CriticalResultsApiResponse → ReportApiResponse<CriticalResultsData>
 *
 * UI STATES
 *   - isLoading  → full-page loader
 *   - isError    → error banner + empty table area
 *   - rows = []  → "No critical results found"
 *   - rows > 0   → alert banner + responsive data table
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useMemo, useState } from 'react';
import { AlertTriangle, Loader, RefreshCw, Search } from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useGetCriticalResults } from '@/app/Apis/Report/useReportEntry';
import type { CriticalResultItem } from '@/app/Apis/Report/reportApi';
import {
  listingEmptyBox,
  listingEmptySub,
  listingEmptyTitle,
  listingLoadingBox,
  listingLoadingText,
  listingRefreshBtn,
  listingSearchInput,
  listingSubtitle,
  listingTableCard,
  listingTableFooter,
  listingTableTh,
  listingTableThSm,
  listingTitle,
  listingToolbar,
  listingToolbarInner,
} from '@/lib/listingPageStyles';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formats a numeric low–high pair for display. */
function formatRange(
  low: number | null | undefined,
  high: number | null | undefined,
): string {
  if (low != null && high != null) return `${low} – ${high}`;
  if (low != null) return `≥ ${low}`;
  if (high != null) return `≤ ${high}`;
  return '—';
}

/** Badge color for abnormal flags (LOW / HIGH / CRITICAL). */
function getAbnormalBadgeVariant(flag: string) {
  const key = (flag || '').toUpperCase();
  if (key === 'HIGH' || key === 'CRITICAL') return 'danger' as const;
  if (key === 'LOW') return 'warning' as const;
  return 'secondary' as const;
}

/** Badge color for result workflow status (DRAFT / VERIFIED / FINAL). */
function getStatusBadgeVariant(status: string) {
  const key = (status || '').toUpperCase();
  if (key === 'VERIFIED' || key === 'FINAL') return 'success' as const;
  if (key === 'DRAFT') return 'warning' as const;
  return 'secondary' as const;
}

/** Safe locale date/time from ISO string. */
function formatEnteredAt(value: string | null | undefined): string {
  if (!value) return '—';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleString();
}

/**
 * Extracts the critical-results array from the API envelope.
 * Path: response.data.criticalResults
 */
function extractCriticalRows(
  apiData: { data?: { criticalResults?: CriticalResultItem[] } } | undefined,
): CriticalResultItem[] {
  const list = apiData?.data?.criticalResults;
  return Array.isArray(list) ? list : [];
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CriticalResultsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isError, error, refetch, isFetching } =
    useGetCriticalResults();

  /** All critical rows from API: data.data.criticalResults */
  const rows = useMemo(() => extractCriticalRows(data), [data]);

  /** Client-side filter on parameter name, result value, or result ID. */
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const id = String(row.resultId);
      const name = (row.parameterName || '').toLowerCase();
      const value = (row.resultValue || '').toLowerCase();
      return id.includes(q) || name.includes(q) || value.includes(q);
    });
  }, [rows, searchQuery]);

  const showInitialLoader = isLoading && !data;
  const criticalCount = rows.length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <h1 className={listingTitle}>
            Critical <span className="text-emerald-600">Results</span>
          </h1>
          <p className={listingSubtitle}>
            Monitor parameter results that exceed critical thresholds and require
            immediate attention.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="gap-2 h-10 px-4 shrink-0 self-start xl:self-auto"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw
            size={16}
            className={isFetching ? 'animate-spin' : ''}
            aria-hidden
          />
          Refresh
        </Button>
      </div>

      {/* Critical alert — only when data loaded and rows exist */}
      {!showInitialLoader && criticalCount > 0 && (
        <div className="flex items-start sm:items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 px-4 sm:px-5 py-3.5">
          <AlertTriangle
            className="text-rose-600 shrink-0 mt-0.5 sm:mt-0"
            size={20}
            aria-hidden
          />
          <p className="text-sm font-bold text-rose-900">
            {criticalCount} critical result{criticalCount === 1 ? '' : 's'}{' '}
            require review.
          </p>
        </div>
      )}

      {/* API error */}
      {isError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 sm:px-5 py-3.5 text-sm font-bold text-rose-800">
          {(error as Error)?.message || 'Failed to load critical results.'}
        </div>
      )}

      {/* Search toolbar */}
      {!showInitialLoader && (
        <div className={listingToolbar}>
          <div className={listingToolbarInner}>
            <div className="relative flex-1 min-w-0">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
                aria-hidden
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by parameter, value, or result ID…"
                className={listingSearchInput}
                aria-label="Search critical results"
              />
            </div>
            <button
              type="button"
              className={listingRefreshBtn}
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh critical results"
            >
              <RefreshCw
                size={16}
                className={isFetching ? 'animate-spin' : ''}
              />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {showInitialLoader ? (
        <div className={listingLoadingBox}>
          <Loader className="text-slate-400 animate-spin" size={32} aria-hidden />
          <p className={listingLoadingText}>Loading critical results…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className={listingEmptyBox}>
          <p className={listingEmptyTitle}>No critical results found.</p>
          <p className={listingEmptySub}>
            Results that cross critical limits will appear here automatically.
          </p>
        </div>
      ) : (
        <div className={listingTableCard}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-225 text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className={listingTableThSm}>Result ID</th>
                  <th className={listingTableThSm}>Parameter</th>
                  <th className={listingTableThSm}>Result</th>
                  <th className={`${listingTableThSm} hidden md:table-cell`}>
                    Unit
                  </th>
                  <th className={`${listingTableThSm} hidden lg:table-cell`}>
                    Reference
                  </th>
                  <th className={`${listingTableThSm} hidden lg:table-cell`}>
                    Critical
                  </th>
                  <th className={`${listingTableTh} text-center`}>Flag</th>
                  <th className={`${listingTableTh} text-center`}>Status</th>
                  <th className={`${listingTableTh} text-center hidden sm:table-cell`}>
                    Verified
                  </th>
                  <th className={`${listingTableThSm} hidden xl:table-cell`}>
                    Entered At
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="text-center py-12 text-slate-400 font-medium px-4"
                    >
                      No matches for &quot;{searchQuery.trim()}&quot;.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.resultId}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                    >
                      <td className="px-4 sm:px-6 py-4 text-xs font-mono font-semibold text-slate-600">
                        {row.resultId}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors max-w-45 sm:max-w-none truncate sm:whitespace-normal">
                          {row.parameterName || '—'}
                        </div>
                        {row.instrumentName ? (
                          <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-40 sm:max-w-none">
                            {row.instrumentName}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <span className="text-sm font-black text-rose-600">
                          {row.resultValue || '—'}
                        </span>
                        <span className="md:hidden text-[10px] font-bold uppercase text-slate-400 ml-1">
                          {row.unit}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-[11px] font-semibold text-slate-700 hidden md:table-cell">
                        {row.unit || '—'}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-[11px] font-semibold text-slate-600 hidden lg:table-cell">
                        {formatRange(row.referenceLow, row.referenceHigh)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-[11px] font-bold text-rose-600 hidden lg:table-cell">
                        {formatRange(row.criticalLow, row.criticalHigh)}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <Badge
                          variant={getAbnormalBadgeVariant(row.abnormalFlag)}
                          className="text-[10px] font-bold"
                        >
                          {row.abnormalFlag || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center">
                        <Badge
                          variant={getStatusBadgeVariant(row.resultStatus)}
                          className="text-[10px] font-bold"
                        >
                          {row.resultStatus || '—'}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-center hidden sm:table-cell">
                        <span
                          className={
                            row.isVerified
                              ? 'text-emerald-600 text-xs font-bold'
                              : 'text-amber-600 text-xs font-bold'
                          }
                        >
                          {row.isVerified ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-[11px] font-medium text-slate-500 hidden xl:table-cell whitespace-nowrap">
                        {formatEnteredAt(row.enteredAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className={listingTableFooter}>
            <p className="text-xs text-slate-500 font-medium">
              Showing {filteredRows.length} of {criticalCount} critical result
              {criticalCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
