'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, FlaskConical, Loader2, Search } from 'lucide-react';
import { RightDrawer, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  fetchTestsAscending,
  type ApiResponse,
  type PaginatedResponse,
  type Test,
} from '@/app/Apis/lab/TestApis';
import {
  filterTestsForBranch,
  sortInvestigationsByName,
  testToInvestigation,
  type BookingInvestigation,
} from './bookingInvestigationUtils';

const PAGE_SIZE = 10;

function extractPaginatedTests(
  response: ApiResponse<PaginatedResponse<Test>> | PaginatedResponse<Test> | null | undefined
): Test[] {
  if (!response) return [];
  if ('content' in response && Array.isArray(response.content)) {
    return response.content;
  }
  if ('data' in response && response.data?.content) {
    return response.data.content;
  }
  return [];
}

function extractPaginatedTestsPage(
  response: ApiResponse<PaginatedResponse<Test>> | PaginatedResponse<Test> | null | undefined
): PaginatedResponse<Test> | null {
  if (!response) return null;
  if ('content' in response && Array.isArray(response.content)) {
    return response as PaginatedResponse<Test>;
  }
  if ('data' in response && response.data) {
    return response.data;
  }
  return null;
}

export interface AddInvestigationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (inv: BookingInvestigation[]) => void;
  branchId: number;
}

export default function AddInvestigationsModal({
  isOpen,
  onClose,
  onAdd,
  branchId,
}: AddInvestigationsModalProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [branchTests, setBranchTests] = useState<BookingInvestigation[]>([]);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const loadTests = useCallback(
    async (query: string, page: number, append: boolean) => {
      if (!branchId || branchId < 1) {
        setBranchTests([]);
        setHasMore(false);
        setLoadError('Select a valid branch before adding investigations.');
        return;
      }

      if (append) setLoadingMore(true);
      else setLoading(true);
      setLoadError(null);

      try {
        const trimmed = query.trim();
        const response = await fetchTestsAscending(page, PAGE_SIZE, trimmed || undefined, {
          branchId,
        });
        const pageData = extractPaginatedTestsPage(response);
        const content = extractPaginatedTests(response);
        const mapped = sortInvestigationsByName(
          filterTestsForBranch(content, branchId).map(testToInvestigation)
        );

        setBranchTests((prev) => {
          if (!append) return mapped;
          const byId = new Map(prev.map((t) => [t.id, t]));
          for (const item of mapped) byId.set(item.id, item);
          return sortInvestigationsByName([...byId.values()]);
        });
        setPageNo(pageData?.pageNo ?? page);
        setHasMore(pageData ? !pageData.last : false);
      } catch (err: unknown) {
        if (!append) setBranchTests([]);
        setHasMore(false);
        const message =
          err instanceof Error ? err.message : 'Failed to load tests. Please try again.';
        setLoadError(message);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [branchId]
  );

  useEffect(() => {
    if (!isOpen) return;
    setSelected([]);
    setSearch('');
    setPageNo(0);
    setHasMore(false);
    setAddError(null);
  }, [isOpen, branchId]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => loadTests(search, 0, false), search.trim() ? 400 : 0);
    return () => clearTimeout(timer);
  }, [search, isOpen, loadTests]);

  const branchTestById = new Map(branchTests.map((t) => [t.id, t]));
  const displayedTests = branchTests;

  const toggle = (id: number) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;
    loadTests(search, pageNo + 1, true);
  };

  const handleAdd = () => {
    const valid = selected
      .filter((id) => branchTestById.has(id))
      .map((id) => branchTestById.get(id)!);
    const invalidCount = selected.length - valid.length;

    if (valid.length === 0) {
      setAddError(
        invalidCount > 0
          ? 'Selected tests are not available at this branch.'
          : 'Select at least one test.'
      );
      return;
    }

    if (invalidCount > 0) {
      setAddError(`${invalidCount} test(s) skipped — not available at this branch.`);
    } else {
      setAddError(null);
    }

    onAdd(valid);
    setSelected([]);
    if (invalidCount === 0) onClose();
  };

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Add <span className="text-emerald-200">Investigations</span>
        </>
      }
      description="Tests available at the selected branch"
      footer={
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-gray-300">
            Cancel
          </Button>
          <Button
            disabled={selected.length === 0 || loading}
            onClick={handleAdd}
            className="flex-[2] rounded-xl custom-gradient text-white font-bold"
          >
            Add {selected.length} Tests
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
            size={18}
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search test name..."
            className="pl-10 border-gray-300"
          />
        </div>

        {loadError ? (
          <p className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-3 py-2">
            {loadError}
          </p>
        ) : null}
        {addError ? (
          <p className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
            {addError}
          </p>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-medium">Loading branch tests…</span>
          </div>
        ) : displayedTests.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-12">
            {search.trim()
              ? 'No matching tests at this branch.'
              : 'No active tests configured for this branch.'}
          </p>
        ) : (
          <div className="space-y-2">
            {displayedTests.map((inv) => (
              <div
                key={inv.id}
                onClick={() => toggle(inv.id)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group',
                  selected.includes(inv.id)
                    ? 'border-emerald-500 bg-emerald-50/50'
                    : 'border-gray-200 bg-white hover:border-emerald-200 hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
                      selected.includes(inv.id)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'
                    )}
                  >
                    {selected.includes(inv.id) ? (
                      <CheckCircle2 size={24} />
                    ) : (
                      <FlaskConical size={20} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-900 leading-snug">{inv.name}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                      {inv.category}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-black text-slate-900">₹{inv.mrp}</div>
              </div>
            ))}
            {hasMore ? (
              <div className="pt-2 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold border-gray-300"
                  disabled={loadingMore}
                  onClick={handleLoadMore}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-2" />
                      Loading…
                    </>
                  ) : (
                    'Load more tests'
                  )}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </RightDrawer>
  );
}
