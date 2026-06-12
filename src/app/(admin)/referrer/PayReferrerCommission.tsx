'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CalendarRange,
  CreditCard,
  Hash,
  IndianRupee,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Button from '@/components/ui/button';
import { Input, Label } from '@/components/ui';
import { useMarkReferrerCommissionPaid } from '@/app/Apis/Referrer/useReferrerCommission';

export interface PayReferrerCommissionProps {
  isOpen: boolean;
  onClose: () => void;
  referrerId: number | null;
  referrerName?: string;
  /** Prefill payment amount (e.g. pending balance). */
  suggestedAmount?: number;
  onPaid?: () => void;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'bank_transfer', label: 'Bank transfer' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'card', label: 'Card' },
] as const;

function firstDayOfMonthIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function lastDayOfMonthIso(): string {
  const d = new Date();
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return `${last.getFullYear()}-${String(last.getMonth() + 1).padStart(2, '0')}-${String(last.getDate()).padStart(2, '0')}`;
}

function formatRupee(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) return '—';
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PayReferrerCommission({
  isOpen,
  onClose,
  referrerId,
  referrerName,
  suggestedAmount,
  onPaid,
}: PayReferrerCommissionProps) {
  const [startDate, setStartDate] = useState(firstDayOfMonthIso);
  const [endDate, setEndDate] = useState(lastDayOfMonthIso);
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionReference, setTransactionReference] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const payMutation = useMarkReferrerCommissionPaid();

  useEffect(() => {
    if (!isOpen) {
      setStartDate(firstDayOfMonthIso());
      setEndDate(lastDayOfMonthIso());
      setAmount('');
      setRemarks('');
      setPaymentMethod('cash');
      setTransactionReference('');
      setErrors({});
      return;
    }
    if (suggestedAmount != null && suggestedAmount > 0) {
      setAmount(String(suggestedAmount));
    }
  }, [isOpen, suggestedAmount]);

  const dateRangeInvalid = Boolean(startDate && endDate) && startDate > endDate;

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    const parsedAmount = parseFloat(amount);

    if (!startDate.trim()) next.startDate = 'Start date is required.';
    if (!endDate.trim()) next.endDate = 'End date is required.';
    if (startDate && endDate && startDate > endDate) {
      next.endDate = 'End date must be on or after start date.';
    }
    if (!amount.trim()) next.amount = 'Amount is required.';
    else if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      next.amount = 'Enter a valid amount greater than 0.';
    }
    if (!paymentMethod.trim()) next.paymentMethod = 'Payment method is required.';

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!referrerId || referrerId < 1) return;
    if (!validate()) return;

    payMutation.mutate(
      {
        referrerId,
        startDate,
        endDate,
        amount: parseFloat(amount),
        remarks: remarks.trim() || undefined,
        paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
      },
      {
        onSuccess: (res) => {
          toast.success(res?.message?.trim() || 'Commission marked as paid successfully.');
          onPaid?.();
          onClose();
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Failed to mark commission as paid.');
        },
      }
    );
  };

  const pending = payMutation.isPending;
  const displayReferrerName = referrerName?.trim() || 'Referrer';

  const footer = (
    <div className="flex gap-3 w-full">
      <Button
        type="button"
        variant="outline"
        onClick={onClose}
        className="flex-1 font-bold"
        disabled={pending}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="pay-referrer-commission-form"
        variant="gradient"
        className="flex-1 font-bold"
        disabled={pending || !referrerId || dateRangeInvalid}
      >
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="animate-spin" size={18} aria-hidden />
            Processing…
          </span>
        ) : (
          'Mark as paid'
        )}
      </Button>
    </div>
  );

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          Pay <span className="text-emerald-200">referrer commission</span>
        </>
      }
      description={displayReferrerName}
      footer={footer}
      maxWidth="md"
    >
      <form id="pay-referrer-commission-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1">
            <Building2 size={12} aria-hidden />
            Referrer
          </Label>
          <Input
            value={displayReferrerName}
            readOnly
            className="border-slate-200 bg-slate-50 text-slate-700 font-semibold"
          />
        </div>

        {suggestedAmount != null && suggestedAmount > 0 ? (
          <div className="rounded-lg border border-amber-100 bg-amber-50/80 px-4 py-3 text-sm">
            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">
              Pending balance
            </p>
            <p className="font-black text-amber-900 mt-1">{formatRupee(suggestedAmount)}</p>
          </div>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="referrerStartDate"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
            >
              <CalendarRange size={12} aria-hidden />
              Start date *
            </Label>
            <Input
              id="referrerStartDate"
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (errors.startDate) setErrors((prev) => ({ ...prev, startDate: '' }));
              }}
              className={`border-slate-200 font-semibold ${errors.startDate ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.startDate ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.startDate}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="referrerEndDate"
              className="text-xs font-bold text-slate-700 uppercase tracking-widest"
            >
              End date *
            </Label>
            <Input
              id="referrerEndDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => {
                setEndDate(e.target.value);
                if (errors.endDate) setErrors((prev) => ({ ...prev, endDate: '' }));
              }}
              className={`border-slate-200 font-semibold ${errors.endDate ? 'border-rose-300' : ''}`}
              disabled={pending}
            />
            {errors.endDate ? (
              <p className="text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle size={12} aria-hidden /> {errors.endDate}
              </p>
            ) : null}
          </div>
        </div>

        {dateRangeInvalid ? (
          <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle size={12} aria-hidden /> Start date must be on or before end date.
          </p>
        ) : null}

        <div className="space-y-2">
          <Label
            htmlFor="referrerAmount"
            className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
          >
            <IndianRupee size={12} aria-hidden />
            Amount *
          </Label>
          <Input
            id="referrerAmount"
            type="number"
            min={0.01}
            step={0.01}
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount) setErrors((prev) => ({ ...prev, amount: '' }));
            }}
            placeholder="700.00"
            className={`border-slate-200 ${errors.amount ? 'border-rose-300' : ''}`}
            disabled={pending}
          />
          {errors.amount ? (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> {errors.amount}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="referrerPaymentMethod"
            className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
          >
            <CreditCard size={12} aria-hidden />
            Payment method *
          </Label>
          <select
            id="referrerPaymentMethod"
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              if (errors.paymentMethod) setErrors((prev) => ({ ...prev, paymentMethod: '' }));
            }}
            className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm font-semibold ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              errors.paymentMethod ? 'border-rose-300' : 'border-input'
            }`}
            disabled={pending}
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label}
              </option>
            ))}
          </select>
          {errors.paymentMethod ? (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <AlertCircle size={12} aria-hidden /> {errors.paymentMethod}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="referrerTransactionReference"
            className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1"
          >
            <Hash size={12} aria-hidden />
            Transaction reference
          </Label>
          <Input
            id="referrerTransactionReference"
            value={transactionReference}
            onChange={(e) => setTransactionReference(e.target.value)}
            placeholder="Optional reference number"
            className="border-slate-200"
            disabled={pending}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="referrerRemarks"
            className="text-xs font-bold text-slate-700 uppercase tracking-widest"
          >
            Remarks
          </Label>
          <Input
            id="referrerRemarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="May commission paid"
            className="border-slate-200"
            disabled={pending}
          />
        </div>
      </form>
    </RightDrawer>
  );
}
