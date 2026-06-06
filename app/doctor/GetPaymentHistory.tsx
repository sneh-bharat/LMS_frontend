'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Clock,
  Database,
  History,
  IndianRupee,
  Loader2,
  Receipt,
  Stethoscope,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useDoctorPaymentHistory } from '@/app/Apis/Commission/useDoctorCommission';


const PAGE_SIZE = 10;

export interface GetPaymentHistoryProps {
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

function formatDate(value: string | null | undefined): string {
  if (!value?.trim()) return '—';
  const datePart = value.includes('T') ? value.split('T')[0] : value.trim();
  const [y, m, d] = datePart.split('-');
  if (!y || !m || !d) return value;
  return `${d}-${m}-${y}`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value?.trim()) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return formatDate(value);
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  accent = 'slate',
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: 'slate' | 'emerald' | 'sky' | 'amber' | 'rose';
}) {
  const accentStyles = {
    slate: 'bg-slate-100 text-slate-600 border-slate-100',
    emerald: 'bg-emerald-100 text-emerald-600 border-emerald-50',
    sky: 'bg-sky-100 text-sky-600 border-sky-50',
    amber: 'bg-amber-100 text-amber-600 border-amber-50',
    rose: 'bg-rose-100 text-rose-600 border-rose-50',
  };

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-lg font-black text-slate-900 tracking-tight mt-1 truncate">{value}</p>
        </div>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${accentStyles[accent]}`}
        >
          <Icon size={18} aria-hidden />
        </div>
      </div>
    </div>
  );
}

export default function GetPaymentHistory({
  isOpen,
  onClose,
  doctorId,
  doctorName,
}: GetPaymentHistoryProps) {
  const [pageNo, setPageNo] = useState(0);
  const [payDrawerOpen, setPayDrawerOpen] = useState(false);

  const historyQuery = useDoctorPaymentHistory(doctorId, pageNo, PAGE_SIZE, {
    enabled: isOpen && doctorId != null && doctorId > 0,
  });

  useEffect(() => {
    if (!isOpen) {
      setPageNo(0);
      setPayDrawerOpen(false);
    }
  }, [isOpen, doctorId]);

  const page = historyQuery.data?.data;
  const summary = page?.summary;
  const rows = page?.content ?? [];
  const displayDoctorName = doctorName?.trim() || rows[0]?.doctorName || 'Doctor';
  const loading = historyQuery.isLoading || (historyQuery.isFetching && !historyQuery.data);

  const totalPages = page?.totalPages ?? 1;
  const totalElements = page?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page?.totalPages != null ? pageNo + 1 < page.totalPages : false;

  return (
    <>
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <History className="text-white" size={24} aria-hidden />
          <span>
            Payment <span className="text-emerald-200">history</span>
          </span>
        </div>
      }
      description={displayDoctorName}
      maxWidth="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Page {pageNo + 1} of {Math.max(totalPages, 1)}
            <span className="text-slate-400 font-semibold normal-case tracking-normal ml-2">
              · {totalElements} record{totalElements === 1 ? '' : 's'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
           
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200"
              disabled={!canPrev || historyQuery.isFetching}
              onClick={() => setPageNo((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200"
              disabled={!canNext || historyQuery.isFetching}
              onClick={() => setPageNo((p) => p + 1)}
            >
              Next
            </Button>
            <Button type="button" variant="outline" size="sm" className="font-bold" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading payment history…</p>
        </div>
      ) : historyQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {historyQuery.error instanceof Error
              ? historyQuery.error.message
              : 'Failed to load payment history.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 font-bold"
            onClick={() => historyQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-start justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100 gap-4">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                <Stethoscope size={22} aria-hidden />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                  {displayDoctorName}
                </h3>
                {doctorId != null && doctorId > 0 ? (
                  <Badge variant="secondary" className="mt-1.5 text-[10px] font-bold border-slate-200 font-mono">
                    Doctor #{doctorId}
                  </Badge>
                ) : null}
              </div>
            </div>
          
          </div>

          {/* {summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <SummaryCard
                label="Total records"
                value={String(summary.totalRecords)}
                icon={Receipt}
              />
              <SummaryCard
                label="Payment count"
                value={String(summary.paymentCount)}
                icon={Database}
                accent="sky"
              />
              <SummaryCard
                label="Total paid"
                value={formatRupee(summary.totalPaid)}
                icon={Wallet}
                accent="emerald"
              />
              <SummaryCard
                label="Total pending"
                value={formatRupee(summary.totalPending)}
                icon={Clock}
                accent={summary.totalPending > 0 ? 'amber' : 'emerald'}
              />
              <SummaryCard
                label="Total advance"
                value={formatRupee(summary.totalAdvance)}
                icon={IndianRupee}
                accent="sky"
              />
            </div>
          ) : null} */}

          {rows.length === 0 ? (
            <div className="p-10 rounded-xl border border-dashed border-slate-200 text-center">
              <History className="mx-auto text-slate-200 mb-2" size={32} aria-hidden />
              <p className="text-sm text-slate-500 font-medium">No payment records found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Paid date
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Commission
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Effective paid
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Order amount
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                        Commission %
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                        Advance
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="text-sm font-bold text-slate-900">{formatDate(row.paidDate)}</div>
                          <div className="text-[10px] font-medium text-slate-400 mt-0.5">
                            {formatDateTime(row.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-black text-emerald-700 text-right">
                          {formatRupee(row.commissionAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800 text-right">
                          {formatRupee(row.effectivePaid)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                          {formatRupee(row.totalOrderAmount)}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-700 text-center">
                          {row.commissionPercentage}%
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                          {formatRupee(row.advancePayment)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            className={
                              row.isPaid
                                ? 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
                                : 'bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-bold'
                            }
                          >
                            {row.isPaid ? 'Paid' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-600 max-w-[140px] truncate">
                          {row.remarks?.trim() || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </RightDrawer>

   
    </>
  );
}
