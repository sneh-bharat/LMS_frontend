'use client';

import {
  AlertCircle,
  ClipboardList,
  IndianRupee,
  Loader2,
  Percent,
  Stethoscope,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { useReferrerCommissionPay } from '@/app/Apis/Referrer/useReferrerCommission';


export interface ReferrerCommissionPayProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId: number | null;
  referrerName?: string;
}

function formatRupee(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-xl font-black text-slate-900 tracking-tight mt-1 truncate">{value}</p>
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

export default function ReferrerCommissionPay({
  isOpen,
  onClose,
  referrerId,
  referrerName
}: ReferrerCommissionPayProps) {
  const payQuery = useReferrerCommissionPay(referrerId, {
    enabled: isOpen && referrerId != null && referrerId > 0,
  });

  const summary = payQuery.data?.data;
  const displayReferrerName = referrerName?.trim() || 'Referrer';
  const loading = payQuery.isLoading || (payQuery.isFetching && !payQuery.data);

  const pendingAccent =
    summary && summary.pendingAmount > 0 ? ('amber' as const) : ('emerald' as const);

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Wallet className="text-white" size={24} aria-hidden />
          <span>
            Commission <span className="text-emerald-200">pay details</span>
          </span>
        </div>
      }
      description={displayReferrerName}
      maxWidth="lg"
      footer={
        <Button type="button" variant="outline" onClick={onClose} className="w-full font-bold">
          Close
        </Button>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-600">
          <Loader2 className="animate-spin text-emerald-600" size={32} aria-hidden />
          <p className="text-sm font-medium">Loading commission amount…</p>
        </div>
      ) : payQuery.isError ? (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle size={16} aria-hidden />
            {payQuery.error instanceof Error
              ? payQuery.error.message
              : 'Failed to load commission amount for this doctor.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 font-bold"
            onClick={() => payQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : !summary ? (
        <div className="p-10 rounded-xl border border-dashed border-slate-200 text-center">
          <Wallet className="mx-auto text-slate-200 mb-2" size={32} aria-hidden />
          <p className="text-sm text-slate-500 font-medium">No commission pay data available.</p>
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
                  {displayReferrerName}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-[10px] font-bold border-slate-200 font-mono">
                    Doctor #{summary.referrerId}
                  </Badge>
                  <Badge
                    className={
                      summary.pendingAmount > 0
                        ? 'bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-bold'
                        : 'bg-emerald-600 hover:bg-emerald-600 text-white text-[10px] font-bold'
                    }
                  >
                    {summary.pendingAmount > 0 ? 'Payment pending' : 'All settled'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryCard
              label="Total orders"
              value={String(summary.totalOrders)}
              icon={ClipboardList}
              accent="slate"
            />
            <SummaryCard
              label="Total patients"
              value={String(summary.totalPatients)}
              icon={Users}
              accent="sky"
            />
            <SummaryCard
              label="Total order amount"
              value={formatRupee(summary.totalOrderAmount)}
              icon={IndianRupee}
              accent="slate"
            />
            <SummaryCard
              label="Total commission"
              value={formatRupee(summary.totalCommission)}
              icon={Percent}
              accent="emerald"
            />
            <SummaryCard
              label="Total paid"
              value={formatRupee(summary.totalPaid)}
              icon={Wallet}
              accent="sky"
            />
            <SummaryCard
              label="Pending amount"
              value={formatRupee(summary.pendingAmount)}
              icon={IndianRupee}
              accent={pendingAccent}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              Payment overview
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Order value
                </p>
                <p className="font-black text-slate-900">{formatRupee(summary.totalOrderAmount)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Commission earned
                </p>
                <p className="font-black text-emerald-700">{formatRupee(summary.totalCommission)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Amount paid to doctor
                </p>
                <p className="font-black text-sky-700">{formatRupee(summary.totalPaid)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Balance pending
                </p>
                <p
                  className={`font-black ${
                    summary.pendingAmount > 0 ? 'text-amber-700' : 'text-emerald-700'
                  }`}
                >
                  {formatRupee(summary.pendingAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </RightDrawer>
  );
}
