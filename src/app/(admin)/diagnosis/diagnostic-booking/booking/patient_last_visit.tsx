'use client';

import {
  Building2,
  Calendar,
  FlaskConical,
  History,
  IndianRupee,
  Loader2,
  User,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import { usePatientLastVisit } from '@/app/Apis/booking/useTestOrders';

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatGender(gender: string | null | undefined) {
  if (!gender) return '—';
  const g = gender.toUpperCase();
  if (g === 'MALE') return 'Male';
  if (g === 'FEMALE') return 'Female';
  return gender;
}

export interface PatientLastVisitProps {
  patientId: number | null | undefined;
  className?: string;
}

export default function PatientLastVisit({ patientId, className }: PatientLastVisitProps) {
  const { data, isLoading, isError, error, isFetching } = usePatientLastVisit(patientId);

  if (patientId == null || patientId < 1) {
    return null;
  }

  const visit = data?.data;

  return (
    <div
      className={
        className ??
        'rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 p-5 shadow-sm'
      }
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
          <History size={18} />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
            Patient Last Visit
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
            Previous booking snapshot
          </p>
        </div>
        {isFetching && !isLoading ? (
          <Loader2 size={16} className="ml-auto animate-spin text-indigo-500" />
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-6 text-slate-500 text-sm font-semibold">
          <Loader2 size={18} className="animate-spin text-indigo-500" />
          Loading last visit…
        </div>
      ) : isError ? (
        <p className="text-sm font-semibold text-rose-600 py-2">
          {error instanceof Error ? error.message : 'Failed to load last visit.'}
        </p>
      ) : !visit ? (
        <p className="text-sm font-semibold text-slate-500 py-2">No previous visit found.</p>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Patient
              </p>
              <p className="text-base font-black text-slate-900 mt-0.5">{visit.patientName}</p>
              <p className="text-xs font-mono font-bold text-indigo-700 mt-1">{visit.uhid}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-[10px] font-bold uppercase">
                {visit.visitType}
              </Badge>
              {visit.hasPendingPayment ? (
                <Badge variant="warning" className="text-[10px] font-bold">
                  Pending payment
                </Badge>
              ) : null}
              {visit.hasAbha ? (
                <Badge variant="info" className="text-[10px] font-bold">
                  ABHA
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <div className="rounded-xl bg-white/80 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Calendar size={12} /> Last visit
              </p>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {formatDateTime(visit.lastVisitDateTime)}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <User size={12} /> Age / Gender
              </p>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {visit.age} · {formatGender(visit.gender)}
              </p>
            </div>
            <div className="rounded-xl bg-white/80 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Building2 size={12} /> Branch
              </p>
              <p className="text-xs font-bold text-slate-900 mt-1">{visit.branchName}</p>
            </div>
            <div className="rounded-xl bg-white/80 border border-slate-100 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <IndianRupee size={12} /> Due amount
              </p>
              <p
                className={`text-xs font-black mt-1 ${visit.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}
              >
                {formatCurrency(visit.dueAmount)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
