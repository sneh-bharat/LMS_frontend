'use client';

import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  ChevronDown,
  Database,
  FileText,
  Filter,
  Loader,
  Plus,
  RefreshCw,
  Search,
  Settings,
  Trash2,
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { useReportTemplates } from '@/features/lab/services/lab.service';
import type { ReportTemplate } from '@/features/lab/services/lab.service';

const PAGE_SIZE = 10;

// ── Main Component ──────────────────────────────────────────────────────────
export default function TemplatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const testIdParam = searchParams.get('testId');
  const parsedTestId = testIdParam ? Number(testIdParam) : NaN;
  const selectedTestId = Number.isFinite(parsedTestId) ? parsedTestId : undefined;
  const selectedTestName = searchParams.get('testName') || '';
  const selectedTestLabel = selectedTestName || (selectedTestId ? `Test ID ${selectedTestId}` : '');

  const [pageNo, setPageNo] = useState(0);
  const [search, setSearch] = useState('');
  const [branchIdInput, setBranchIdInput] = useState('1');

  const branchId = useMemo(() => {
    const trimmed = branchIdInput.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [branchIdInput]);

  const { data, isLoading, isError, error, refetch, isFetching } = useReportTemplates({
    pageNo,
    pageSize: PAGE_SIZE,
    branchId,
    testId: selectedTestId,
  });

  const pageData = data?.data;
  const rows = pageData?.content ?? [];
  const totalPages = pageData?.totalPages ?? 0;
  const totalElements = pageData?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = pageData ? !pageData.last : false;

  // Client-side search filter
  const filteredRows = rows.filter((row) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      (row.templateName ?? '').toLowerCase().includes(term) ||
      (row.testName ?? '').toLowerCase().includes(term) ||
      (row.testCode ?? '').toLowerCase().includes(term) ||
      (row.departmentName ?? '').toLowerCase().includes(term)
    );
  });

  const activeTemplates = filteredRows.filter((t) => t.isActive).length;

  const handleAddTemplate = (row: ReportTemplate) => {
    const params = new URLSearchParams({
      testId: String(selectedTestId ?? row.testId),
      testName: selectedTestName || row.testName,
    });
    router.push(`/lab/templates/template_management?${params.toString()}`);
  };

  const handleConfigInterpretation = (testId: number) => {
  };

  const handleDeleteTemplate = (templateId: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-1">
            <span className="text-[#006D77]">Test</span>{' '}
            <span className="text-highlight">Templates</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            {selectedTestLabel
              ? `Manage test report templates and interpretations for ${selectedTestLabel}`
              : 'Manage test report templates and interpretations'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {selectedTestId && (
            <Badge variant="gradient" className="px-4 py-2 text-[10px]">
              Test ID: {selectedTestId}
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 px-6"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
          <Button variant="gradient" size="sm" className="gap-2 shadow-sm px-8">
            <Plus size={16} /> Create Template
          </Button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4">
        <div className="relative flex-1 group w-full">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#006D77] transition-colors"
            size={18}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by template name, test name, code, or department…"
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-48 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              value={branchIdInput}
              onChange={(e) => {
                setBranchIdInput(e.target.value);
                setPageNo(0);
              }}
              placeholder="Branch ID"
              className="input-refined w-full py-2.5 pl-10 pr-4 text-xs font-bold uppercase tracking-wider"
            />
          </div>
        </div>
      </div>

      {/* ERROR */}
      {isError && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
          <AlertCircle size={18} className="shrink-0" />
          <span className="font-medium">
            {error instanceof Error ? error.message : 'Failed to load report templates.'}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto font-bold"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-4">
            <Loader className="text-slate-400 animate-spin" size={32} />
            <p className="text-slate-600 font-medium">Loading report templates…</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Code
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Template Name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Test Name
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Department
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Template
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <FileText size={28} className="text-slate-300" />
                          </div>
                          <p className="text-sm font-bold text-slate-700">
                            No templates found
                          </p>
                          <p className="text-xs font-medium text-slate-400">
                            Try changing the search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr
                        key={row.templateId}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        {/* Code */}
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-600 font-mono group-hover:text-[#00AC80] transition-colors">
                            {row.testCode || '—'}
                          </span>
                        </td>

                        {/* Template Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#006D77] group-hover:text-white transition-all">
                              <FileText size={20} />
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-[#006D77] transition-colors text-sm mb-0.5">
                                {row.templateName || '—'}
                              </div>
                              <div className="text-xs text-slate-500 line-clamp-1">
                                ID: {row.templateId}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Test Name */}
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700 text-sm">
                            {row.testName || '—'}
                          </div>
                          <div className="text-xs text-slate-400">
                            Test ID: {row.testId}
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="primary" className="px-2.5 py-1 text-[10px] font-bold">
                              {row.departmentName || '—'}
                            </Badge>
                          </div>
                        </td>

                        {/* Template Actions */}
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleAddTemplate(row)}
                              className="px-3 py-2 border border-[#006D77]/20 text-[#006D77] rounded-lg text-xs font-bold hover:bg-[#006D77]/5 transition-colors flex items-center justify-center gap-2"
                            >
                              <Plus size={14} />
                              Edit Template
                            </button>
                            <button
                              onClick={() => handleConfigInterpretation(row.testId)}
                              className="px-3 py-2 border border-emerald-500/30 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <Settings size={14} />
                              Interpretation
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(row.templateId)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <Badge
                            variant={row.isActive ? 'success' : 'secondary'}
                            className="text-[10px] font-bold"
                          >
                            {row.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Database size={14} className="text-emerald-600 shrink-0" />
                <span>
                  Page {pageNo + 1} of {Math.max(totalPages, 1)}
                  <span className="text-slate-400 mx-2">·</span>
                  {totalElements} total
                  <span className="text-slate-400 mx-2">·</span>
                  <span className="text-[#FF671F] font-bold">{activeTemplates} Active</span>
                </span>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-slate-200"
                  disabled={!canPrev || isFetching}
                  onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-slate-200"
                  disabled={!canNext || isFetching}
                  onClick={() => setPageNo((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
