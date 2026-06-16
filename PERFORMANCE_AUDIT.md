# PERFORMANCE AUDIT

**Date:** 2026-06-16 · **Scope:** `src/features/` + shared layer
**Build baseline:** `pnpm build` green — 87 static pages, first-load JS to be tracked per route.

## 1. Excessive client components

~204 of ~226 page/component files carry `'use client'`. Every migrated route is a client
tree. Leaf presentational pieces (tables rows, stat cards, badges, read-only detail views)
do not need it.
**Action:** keep `'use client'` only on files using hooks/handlers/browser APIs; let route
`page.tsx` wrappers and pure presentational children be server components where possible.

## 2. Missing memoization

God pages recompute filtered lists, stats reductions, and **column definitions with closures**
on every render without `useMemo`; row action handlers recreated each render without
`useCallback`. (Fixed already in `accounts` pages.)
**Action:** `useMemo` for derived lists/stats/columns; `useCallback` for stable handlers;
`React.memo` on heavy row/cell components and large tables.

## 3. Large bundle imports

- **TipTap editor** (`components/common/AdvancedTemplateEditor`, ~640 lines + many
  `@tiptap/*` extensions) is imported eagerly by template/report features.
- **recharts** on dashboard/reports.
- `lucide-react` icons imported individually (OK — tree-shaken) but some files import 15–20.
**Action:** `next/dynamic` (ssr:false) for the TipTap editor and chart-heavy panels; lazy-load
modals/drawers (`AddX`, `EditX`, detail drawers) that are closed on first paint.

## 4. Duplicate / unbatched requests

Cross-feature hooks (`useReferringDoctors`, `useBranches`, `usePatientsByIds`) are called from
multiple components; without shared React Query keys this can refetch.
**Action:** centralize keys in `@/lib/query/queryKeys`; set sensible `staleTime`; use
`usePatientsByIds`-style batching for N+1 patient lookups.

## 5. Expensive computations

Client-side filtering/sorting/reducing over full datasets in list pages (e.g. category/
franchise breakdowns) run on each keystroke.
**Action:** debounce search (`@/hooks/useDebounce`), memoize aggregates, paginate
(`@/hooks/usePagination`) or move filtering server-side for large datasets.

## 6. Shipped mock data

`SAMPLE_*` fixtures ship in client bundles for several features.
**Action:** replace with API via the service layer; until then keep fixtures in
`constants/` (already isolated) so they're easy to drop.

## Tracking

Re-run `pnpm build` after each feature and watch the per-route First Load JS column;
record notable before/after deltas here as dynamic-imports/memoization land.
Targets: no route > ~300 kB First Load JS; editor/chart routes code-split.
