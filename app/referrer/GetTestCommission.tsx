'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileText,
  Loader2,
  Percent,
  Search,
  UserCheck,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import {
  fetchCommissionsByReferrer,
  type ReferrerCommissionItem,
} from '@/app/Apis/Referrer/referrerApi';

const EMPTY_COMMISSIONS: ReferrerCommissionItem[] = [];
const PAGE_SIZE = 10;

export interface GetTestCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId?: number | null;
  referrerName?: string;

}

export default function CommissionReferrer({
  isOpen,
  onClose,
  referrerId,
  referrerName,

}: GetTestCommissionProps) {
  const [searchText, setSearchText] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commissions, setCommissions] = useState<ReferrerCommissionItem[]>(EMPTY_COMMISSIONS);

  const activeReferrerId = referrerId != null && referrerId > 0 ? referrerId : null;
  const activeReferrerName = referrerName?.trim() || 'Referrer';
  const canLoad = activeReferrerId != null && activeReferrerId > 0;

  useEffect(() => {
    if (!isOpen) {
      setSearchText('');
      setVisibleCount(PAGE_SIZE);
      setError(null);
      setCommissions(EMPTY_COMMISSIONS);
    }
  }, [isOpen, activeReferrerId]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchText]);

  const loadCommissions = async () => {
    if (!canLoad) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetchCommissionsByReferrer(activeReferrerId!);
      setCommissions(res?.data ?? EMPTY_COMMISSIONS);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : typeof err === 'object' &&
              err !== null &&
              'message' in err &&
              typeof (err as { message: unknown }).message === 'string'
            ? (err as { message: string }).message
            : 'Failed to load referrer commissions.';
      setError(msg);
      setCommissions(EMPTY_COMMISSIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen || !canLoad) return;
    void loadCommissions();
  }, [isOpen, canLoad, activeReferrerId]);

  const filteredCommissions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) return commissions;
    return commissions.filter(
      (row) =>
        row.departmentName.toLowerCase().includes(query) ||
        row.referrerName.toLowerCase().includes(query) ||
        String(row.departmentId).includes(query)
    );
  }, [commissions, searchText]);

  const displayedCommissions = useMemo(
    () => filteredCommissions.slice(0, visibleCount),
    [filteredCommissions, visibleCount]
  );

  const hasMore = visibleCount < filteredCommissions.length;

  const totals = useMemo(() => {
    const count = filteredCommissions.length;
    const sum = filteredCommissions.reduce((acc, row) => acc + (row.commissionPercentage || 0), 0);
    return { count, averageCommission: count > 0 ? sum / count : 0 };
  }, [filteredCommissions]);

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={24} aria-hidden />
          <span>
            Referrer <span className="text-emerald-200">commissions</span>
          </span>
        </div>
      }
      description={activeReferrerName}
      maxWidth="xl"
      footer={
        <Button type="button" variant="outline" onClick={onClose} className="w-full font-bold">
          Close
        </Button>
      }
    >
      {!canLoad ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 font-medium">
          Referrer ID is required to load commissions.
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading referrer commissions…</p>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {error}
          </span>
          <Button type="button" variant="outline" size="sm" className="shrink-0 font-bold" onClick={loadCommissions}>
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-start justify-between bg-slate-50 p-6 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 border-2 border-emerald-50 shrink-0">
                <UserCheck size={28} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight truncate">{activeReferrerName}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px] font-bold border-slate-200">
                    {totals.count} commission rule{totals.count === 1 ? '' : 's'}
                  </Badge>
                  <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1">
                    <Percent size={10} aria-hidden />
                    Avg commission {totals.averageCommission.toFixed(2)}%
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
              placeholder="Search by department or referrer name…"
              className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
              aria-label="Search referrer commissions"
            />
          </div>

          {commissions.length === 0 ? (
            <div className="p-10 rounded-xl border border-dashed border-slate-200 text-center">
              <FileText className="mx-auto text-slate-200 mb-2" size={32} aria-hidden />
              <p className="text-sm text-slate-500 font-medium">
                No commission records found for this referrer.
              </p>
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="p-10 rounded-xl border border-dashed border-slate-200 text-center">
              <Search className="mx-auto text-slate-200 mb-2" size={32} aria-hidden />
              <p className="text-sm text-slate-500 font-medium">No records match your search.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">ID</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Department</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Referrer</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Apply to all tests</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Commission %</th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedCommissions.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="px-2 py-0.5 border-slate-200 text-[10px] font-bold font-mono">
                            {row.id}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-900">
                          {row.departmentName} <span className="text-slate-500">#{row.departmentId}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700">{row.referrerName}</td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={row.applyToAllTests ? 'default' : 'secondary'} className={row.applyToAllTests ? 'bg-sky-600 hover:bg-sky-600 text-white text-[10px] font-bold' : 'text-[10px] font-bold'}>
                            {row.applyToAllTests ? 'Yes' : 'No'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-black text-emerald-700 text-center">
                          {row.commissionPercentage}%
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={row.isActive ? 'default' : 'secondary'} className={row.isActive ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold gap-1' : 'text-[10px] font-bold gap-1'}>
                            {row.isActive ? <CheckCircle2 size={10} aria-hidden /> : null}
                            {row.isActive ? 'Active' : 'Inactive'}
                          </Badge>
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
                    Showing {displayedCommissions.length} of {filteredCommissions.length} commission
                    {filteredCommissions.length === 1 ? '' : 's'}
                  </span>
                </div>
                {hasMore ? (
                  <Button type="button" variant="outline" size="sm" className="rounded-lg font-bold border-slate-200 shrink-0" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                    Load more
                  </Button>
                ) : null}
              </div>
            </div>
          )}
        </div>
      )}
    </RightDrawer>
  );
}
