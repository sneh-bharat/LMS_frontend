'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, Search } from 'lucide-react';
import { RightDrawer, Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';
import {
  fetchTestsAscending,
  type ApiResponse,
  type PaginatedResponse,
  type Test,
} from '@/app/Apis/lab/TestApis';
import type { EstimationInvestigation } from '@/app/Apis/booking/mapEstimationForm';

const PAGE_SIZE = 10;

function testToInvestigation(test: Test): EstimationInvestigation {
  return {
    id: test.id,
    name: test.testName,
    mrp: test.price,
  };
}

function filterTestsForBranch(tests: Test[], branchId: number): Test[] {
  const activeTests = tests.filter((t) => t.isActive);
  const branchMatched = activeTests.filter((t) => t.branchId === branchId);
  return branchMatched.length > 0 ? branchMatched : activeTests;
}

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

function sortByName(items: EstimationInvestigation[]): EstimationInvestigation[] {
  return [...items].sort((a, b) => a.name.localeCompare(b.name));
}

export interface EstimationAddTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (tests: EstimationInvestigation[]) => void;
  branchId: number;
  existingTestIds?: number[];
}

export default function EstimationAddTestsModal({
  isOpen,
  onClose,
  onAdd,
  branchId,
  existingTestIds = [],
}: EstimationAddTestsModalProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState('');
  const [branchTests, setBranchTests] = useState<EstimationInvestigation[]>([]);
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
        setLoadError('Select a branch before adding tests.');
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
        const mapped = sortByName(
          filterTestsForBranch(content, branchId).map(testToInvestigation)
        );

        setBranchTests((prev) => {
          if (!append) return mapped;
          const byId = new Map(prev.map((t) => [t.id, t]));
          for (const item of mapped) byId.set(item.id, item);
          return sortByName([...byId.values()]);
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

  const toggle = (id: number) => {
    if (existingTestIds.includes(id)) return;
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    const valid = selected
      .filter((id) => branchTestById.has(id))
      .map((id) => branchTestById.get(id)!);

    if (valid.length === 0) {
      setAddError('Select at least one test.');
      return;
    }

    onAdd(valid);
    setSelected([]);
    setAddError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Add <span className="text-emerald-200">Tests</span>
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
            Add {selected.length} test{selected.length === 1 ? '' : 's'}
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
            <Loader2 className="animate-spin text-emerald-600" size={20} />
            <span className="text-sm font-semibold">Loading tests…</span>
          </div>
        ) : branchTests.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No tests found for this branch.</p>
        ) : (
          <ul className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {branchTests.map((test) => {
              const alreadyAdded = existingTestIds.includes(test.id);
              const isSelected = selected.includes(test.id);
              return (
                <li key={test.id}>
                  <button
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => toggle(test.id)}
                    className={cn(
                      'w-full text-left rounded-xl border px-4 py-3 transition-all',
                      alreadyAdded
                        ? 'border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed'
                        : isSelected
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 hover:border-emerald-300 hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-bold text-slate-800 text-sm truncate">{test.name}</span>
                      <span className="text-sm font-black text-emerald-700 shrink-0">
                        ₹{test.mrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {alreadyAdded ? (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Already in list
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {hasMore && !loading ? (
          <Button
            type="button"
            variant="outline"
            disabled={loadingMore}
            onClick={() => loadTests(search, pageNo + 1, true)}
            className="w-full rounded-xl border-gray-300"
          >
            {loadingMore ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Loading…
              </>
            ) : (
              'Load more tests'
            )}
          </Button>
        ) : null}
      </div>
    </RightDrawer>
  );
}
