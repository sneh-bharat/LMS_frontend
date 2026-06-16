'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  CalendarRange,
  ChevronDown,
  ClipboardList,
  Database,
  FlaskConical,
  IndianRupee,
  Loader2,
  Percent,
  Stethoscope,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { useCalculateDoctorCommissionByRange } from '\.\.\/services\/doctor\.service';
import type {
  DoctorCommissionPaySummary,
  DoctorCommissionRangeTestItem,
} from '\.\.\/services\/doctor\.service';

function normalizeRangeTest(raw: unknown): DoctorCommissionRangeTestItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const testName = String(item.testName ?? item.name ?? '').trim();
  if (!testName) return null;

  return {
    testId: typeof item.testId === 'number' ? item.testId : undefined,
    testCode: typeof item.testCode === 'string' ? item.testCode : undefined,
    testName,
    mrpPrice: Number(item.mrpPrice ?? item.mrp ?? 0),
    finalPrice: Number(item.finalPrice ?? item.discountedPrice ?? 0),
    commissionAmount: Number(item.commissionAmount ?? item.commission ?? 0),
  };
}

function normalizePaySummary(data: DoctorCommissionPaySummary): DoctorCommissionPaySummary {
  const rawTests = (data as DoctorCommissionPaySummary & { tests?: unknown[] }).tests;
  if (!Array.isArray(rawTests)) return { ...data, tests: [] };

  const tests = rawTests
    .map((item) => normalizeRangeTest(item))
    .filter((item): item is DoctorCommissionRangeTestItem => item != null);

  return { ...data, tests };
}

export interface SpecificDateRangeProps {
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

function formatDisplayDate(iso: string): string {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
}

function firstDayOfMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function lastDayOfMonthIso(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
}

function formatAmount(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return value.toLocaleString('en-IN', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function CommissionTestTable({ tests }: { tests: DoctorCommissionRangeTestItem[] }) {
  if (tests.length === 0) {
    return (
      <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center">
        <FlaskConical className="mx-auto text-slate-200 mb-2" size={28} aria-hidden />
        <p className="text-sm text-slate-500 font-medium">No test-wise commission for this range.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <FlaskConical size={14} className="text-emerald-500" aria-hidden />
          Test-wise commission
        </h4>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Test Name
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                MRP
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                Final Price
              </th>
              <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
                Commission
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tests.map((test, index) => (
              <tr
                key={test.testId ?? `${test.testName}-${index}`}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-3 text-sm font-bold text-slate-900">{test.testName}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                  {formatAmount(test.mrpPrice)}
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-700 text-right">
                  {formatAmount(test.finalPrice)}
                </td>
                <td className="px-4 py-3 text-sm font-black text-emerald-700 text-right">
                  {formatAmount(test.commissionAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
        <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
        <span>
          {tests.length} test{tests.length === 1 ? '' : 's'} in this period
        </span>
      </div>
    </div>
  );
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

function CommissionRangeResults({
  summary,
  doctorName,
  startDate,
  endDate,
}: {
  summary: DoctorCommissionPaySummary;
  doctorName: string;
  startDate: string;
  endDate: string;
}) {
  const pendingAccent = summary.pendingAmount > 0 ? ('amber' as const) : ('emerald' as const);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pt-2">
      <div className="flex items-start justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
            <Stethoscope size={22} aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate">{doctorName}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <Badge variant="secondary" className="text-[10px] font-bold border-slate-200 font-mono">
                Doctor #{summary.doctorId}
              </Badge>
              <Badge variant="secondary" className="text-[10px] font-bold border-slate-200">
                {formatDisplayDate(startDate)} – {formatDisplayDate(endDate)}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SummaryCard label="Total orders" value={String(summary.totalOrders)} icon={ClipboardList} />
        <SummaryCard label="Total patients" value={String(summary.totalPatients)} icon={Users} accent="sky" />
        <SummaryCard
          label="Total order amount"
          value={formatRupee(summary.totalOrderAmount)}
          icon={IndianRupee}
        />
        <SummaryCard
          label="Total commission"
          value={formatRupee(summary.totalCommission)}
          icon={Percent}
          accent="emerald"
        />
        <SummaryCard label="Total paid" value={formatRupee(summary.totalPaid)} icon={Wallet} accent="sky" />
        <SummaryCard
          label="Pending amount"
          value={formatRupee(summary.pendingAmount)}
          icon={IndianRupee}
          accent={pendingAccent}
        />
      </div>

      <CommissionTestTable tests={summary.tests ?? []} />
    </div>
  );
}

export default function SpecificDateRange({
  isOpen,
  onClose,
  doctorId,
  doctorName,
}: SpecificDateRangeProps) {
  const [startDate, setStartDate] = useState(firstDayOfMonthIso);
  const [endDate, setEndDate] = useState(lastDayOfMonthIso);
  const [errors, setErrors] = useState<{ startDate?: string; endDate?: string }>({});
  const [summary, setSummary] = useState<DoctorCommissionPaySummary | null>(null);

  const calculateMutation = useCalculateDoctorCommissionByRange();

  const displayDoctorName = doctorName?.trim() || 'Doctor';
  const dateRangeInvalid = Boolean(startDate && endDate) && startDate > endDate;

  useEffect(() => {
    if (!isOpen) {
      setStartDate(firstDayOfMonthIso());
      setEndDate(lastDayOfMonthIso());
      setErrors({});
      setSummary(null);
      calculateMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when drawer opens/closes
  }, [isOpen, doctorId]);

  const validate = (): boolean => {
    const next: { startDate?: string; endDate?: string } = {};
    if (!startDate.trim()) next.startDate = 'From date is required.';
    if (!endDate.trim()) next.endDate = 'To date is required.';
    if (startDate && endDate && startDate > endDate) {
      next.endDate = 'To date must be on or after from date.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleCalculate = () => {
    if (!doctorId || doctorId < 1) {
      toast.error('Select a doctor first.');
      return;
    }
    if (!validate()) return;

    calculateMutation.mutate(
      { doctorId, startDate, endDate },
      {
        onSuccess: (res) => {
          const data = res?.data;
          if (data) {
            setSummary(normalizePaySummary(data));
            toast.success(res?.message?.trim() || 'Commission calculated successfully.');
          } else {
            setSummary(null);
            toast.error('No commission data returned for this range.');
          }
        },
        onError: (err) => {
          setSummary(null);
          toast.error(err instanceof Error ? err.message : 'Failed to calculate commission.');
        },
      }
    );
  };

  const pending = calculateMutation.isPending;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <CalendarRange className="text-white" size={24} aria-hidden />
          <span>
            Commission by <span className="text-emerald-200">date range</span>
          </span>
        </div>
      }
      description="Calculate doctor commission for a specific period"
      maxWidth="xl"
      footer={
        <Button type="button" variant="outline" onClick={onClose} className="w-full font-bold">
          Close
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="commissionDoctor"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
            >
              <Stethoscope size={12} aria-hidden />
              Doctor
            </Label>
            <button
              type="button"
              id="commissionDoctor"
              className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 text-left text-sm font-bold text-slate-800 cursor-default"
              disabled
              aria-label="Selected doctor"
            >
              <span className="truncate">
                {displayDoctorName}
                {doctorId != null && doctorId > 0 ? (
                  <span className="text-slate-500 font-semibold ml-2">(ID: {doctorId})</span>
                ) : null}
              </span>
              <ChevronDown size={16} className="text-slate-400 shrink-0" aria-hidden />
            </button>
            {!doctorId || doctorId < 1 ? (
              <p className="text-xs text-amber-700 flex items-center gap-1 font-medium">
                <AlertCircle size={12} aria-hidden /> Open from a doctor row to select a doctor.
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-xs font-bold text-slate-700 uppercase tracking-widest"
              >
                From date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: undefined }));
                }}
                className={`border-slate-200 font-semibold ${errors.startDate ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.startDate ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.startDate}
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-400">{formatDisplayDate(startDate)}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                To date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: undefined }));
                }}
                className={`border-slate-200 font-semibold ${errors.endDate ? 'border-rose-300' : ''}`}
                disabled={pending}
              />
              {errors.endDate ? (
                <p className="text-xs text-rose-600 flex items-center gap-1">
                  <AlertCircle size={12} aria-hidden /> {errors.endDate}
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-400">{formatDisplayDate(endDate)}</p>
              )}
            </div>
          </div>

          {dateRangeInvalid ? (
            <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle size={12} aria-hidden /> From date must be on or before to date.
            </p>
          ) : null}

          <Button
            type="button"
            variant="gradient"
            className="w-full font-bold"
            disabled={pending || !doctorId || doctorId < 1 || dateRangeInvalid}
            onClick={handleCalculate}
          >
            {pending ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="animate-spin" size={18} aria-hidden />
                Calculating…
              </span>
            ) : (
              'Calculate commission'
            )}
          </Button>
        </div>

        {summary ? (
          <CommissionRangeResults
            summary={summary}
            doctorName={displayDoctorName}
            startDate={startDate}
            endDate={endDate}
          />
        ) : null}
      </div>
    </RightDrawer>
  );
}
