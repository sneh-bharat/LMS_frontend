'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Database,
  FlaskConical,
  Loader2,
  Pencil,
  Percent,
  Search,
  Stethoscope,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useDoctorTestCommissions } from '\.\.\/services\/doctor\.service';
import type { DoctorTestCommission } from '\.\.\/services\/doctor\.service';
import EditTestPriceCommission from './EditTestPriceCommission';

const EMPTY_TESTS: DoctorTestCommission[] = [];
const PAGE_SIZE = 10;

export interface GetTestCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  doctorId: number | null;
  doctorName?: string;
}

function formatRupee(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function GetTestCommission({
  isOpen,
  onClose,
  doctorId,
  doctorName,
}: GetTestCommissionProps) {
  const [searchText, setSearchText] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [testToUpdate, setTestToUpdate] = useState<DoctorTestCommission | null>(null);

  const testsQuery = useDoctorTestCommissions(doctorId, {
    enabled: isOpen && doctorId != null && doctorId > 0,
  });

  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
      setVisibleCount(PAGE_SIZE);
      setTestToUpdate(null);
    }
  }, [isOpen, doctorId]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchText]);

  const tests = useMemo(() => testsQuery.data?.data ?? EMPTY_TESTS, [testsQuery.data?.data]);

  const filteredTests = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return tests;
    return tests.filter(
      (test) =>
        test.testName.toLowerCase().includes(query) ||
        test.testCode.toLowerCase().includes(query)
    );
  }, [tests, searchText]);

  const displayedTests = useMemo(
    () => filteredTests.slice(0, visibleCount),
    [filteredTests, visibleCount]
  );

  const hasMore = visibleCount < filteredTests.length;

  const totals = useMemo(() => {
    let commissionTotal = 0;
    for (const test of filteredTests) {
      if (Number.isFinite(test.commissionAmount)) {
        commissionTotal += test.commissionAmount;
      }
    }
    return { count: filteredTests.length, commissionTotal };
  }, [filteredTests]);

  const displayDoctorName = doctorName?.trim() || 'Doctor';
  const loading = testsQuery.isLoading || (testsQuery.isFetching && !testsQuery.data);

  return (
    <>
      <RightDrawer
        isOpen={isOpen}
        onClose={onClose}
        title={
          <div className="flex items-center gap-3">
            <FlaskConical className="text-white" size={24} aria-hidden />
            <span>
              Test <span className="text-emerald-200">commissions</span>
            </span>
          </div>
        }
        description={displayDoctorName}
        maxWidth="xl"
        footer={
          <Button type="button" variant="outline" onClick={onClose} className="w-full font-bold">
            Close
          </Button>
        }
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
            <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
            <p className="text-sm font-medium">Loading test commissions…</p>
          </div>
        ) : testsQuery.isError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-medium">
              <AlertCircle size={16} aria-hidden />
              {testsQuery.error instanceof Error
                ? testsQuery.error.message
                : 'Failed to load test commissions.'}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 font-bold"
              onClick={() => testsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50 shrink-0">
                  <Stethoscope size={28} aria-hidden />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                    {displayDoctorName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-[10px] font-bold border-slate-200">
                      {totals.count} test{totals.count === 1 ? '' : 's'}
                    </Badge>
                    <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1">
                      <Percent size={10} aria-hidden />
                      Total commission {formatRupee(totals.commissionTotal)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors"
                size={18}
                aria-hidden
              />
              <input
                type="search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by test name or code…"
                className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
                aria-label="Search test commissions"
              />
            </div>

            {tests.length === 0 ? (
              <div className="p-10 rounded-xl border border-dashed border-slate-200 text-center">
                <FlaskConical className="mx-auto text-slate-200 mb-2" size={32} aria-hidden />
                <p className="text-sm text-slate-500 font-medium">
                  No test commissions found for this doctor.
                </p>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-10 rounded-xl border border-dashed border-slate-200 text-center">
                <Search className="mx-auto text-slate-200 mb-2" size={32} aria-hidden />
                <p className="text-sm text-slate-500 font-medium">No tests match your search.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Code
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          Test Name
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                          MRP
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                          Commission %
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                          Commission Amount
                        </th>
                        <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {displayedTests.map((test) => (
                        <tr key={test.testId} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <Badge
                              variant="secondary"
                              className="px-2 py-0.5 border-slate-200 text-[10px] font-bold font-mono"
                            >
                              {test.testCode}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-slate-900">{test.testName}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                            {formatRupee(test.mrpPrice)}
                          </td>
                          <td className="px-4 py-3 text-sm font-black text-emerald-700 text-center">
                            {test.commissionPercentage}%
                          </td>
                          <td className="px-4 py-3 text-sm font-black text-slate-900 text-right">
                            {formatRupee(test.commissionAmount)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1 rounded-lg border-emerald-200 font-bold text-emerald-700 hover:bg-emerald-50"
                              onClick={() => setTestToUpdate(test)}
                            >
                              <Pencil size={12} aria-hidden />
                              Update
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
                    <span>
                      Showing {displayedTests.length} of {filteredTests.length} test
                      {filteredTests.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {hasMore ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-lg font-bold border-slate-200 shrink-0"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      Load more
                    </Button>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </RightDrawer>

      <EditTestPriceCommission
        isOpen={testToUpdate != null}
        onClose={() => setTestToUpdate(null)}
        doctorId={doctorId}
        doctorName={doctorName}
        test={testToUpdate}
      />
    </>
  );
}
