'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import {
  Input,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import { cn } from '@/lib/utils';
import type { TestOrder } from '@/features/diagnosis/services/booking.service';

export interface ProcessPaymentFormValues {
  amount: string;
  paymentMode: string;
  remarks: string;
}

export interface ProcessPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  order: TestOrder | null;
  onSubmit?: (values: ProcessPaymentFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const PAYMENT_MODES = ['CASH', 'CARD', 'UPI', 'ONLINE', 'CREDIT'] as const;

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function pendingAmount(order: TestOrder) {
  return order.pendingAmount ?? Math.max(0, (order.actualPayable ?? 0) - (order.paidAmount ?? 0));
}

export function ProcessPayment({
  isOpen,
  onClose,
  order,
  onSubmit,
  isSubmitting = false,
}: ProcessPaymentProps) {
  const dueAmount = useMemo(() => (order ? pendingAmount(order) : 0), [order]);

  const [form, setForm] = useState<ProcessPaymentFormValues>({
    amount: '',
    paymentMode: 'CASH',
    remarks: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !order) return;
    setForm({
      amount: dueAmount > 0 ? dueAmount.toFixed(2) : '',
      paymentMode: order.paymentMode?.trim().toUpperCase() || 'CASH',
      remarks: '',
    });
    setError(null);
  }, [isOpen, order?.id, dueAmount, order?.paymentMode]);

  const setField =
    (key: keyof ProcessPaymentFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (error) setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Payment amount must be greater than zero.');
      return;
    }
    if (!form.paymentMode.trim()) {
      setError('Payment mode is required.');
      return;
    }
    if (!onSubmit) {
      onClose();
      return;
    }
    try {
      await onSubmit({
        amount: form.amount.trim(),
        paymentMode: form.paymentMode.trim().toUpperCase(),
        remarks: form.remarks.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment.');
    }
  };

  if (!order) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <CreditCard className="text-white" size={22} />
          <span>
            Process <span className="text-emerald-200">Payment</span>
          </span>
        </div>
      }
      description={`Order: ${order.orderNumber}`}
      maxWidth="md"
      footer={
        <div className="flex flex-wrap gap-3 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-slate-200 text-slate-600 font-bold"
          >
            Close
          </Button>
          <Button
            type="submit"
            form="process-payment-form"
            disabled={isSubmitting}
            className="custom-gradient text-white font-bold gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : (
              'Confirm payment'
            )}
          </Button>
        </div>
      }
    >
      <form id="process-payment-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Record a payment against this booking. Amount and mode will be sent to the billing service.
        </p>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</p>
            <p className="font-black text-slate-900 mt-1">{formatCurrency(order.actualPayable ?? order.totalAmount ?? 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid</p>
            <p className="font-black text-emerald-700 mt-1">{formatCurrency(order.paidAmount ?? 0)}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Due</p>
            <p className="font-black text-rose-600 mt-1">{formatCurrency(dueAmount)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentAmount" className={FIELD_LABEL}>
            Amount <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="paymentAmount"
            type="text"
            inputMode="decimal"
            value={form.amount}
            onChange={setField('amount')}
            placeholder="500.00"
            disabled={isSubmitting}
            className="border-gray-300 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentMode" className={FIELD_LABEL}>
            Payment mode <span className="text-rose-500">*</span>
          </Label>
          <Select
            value={form.paymentMode}
            onValueChange={(value) => {
              setForm((prev) => ({ ...prev, paymentMode: value || 'CASH' }));
              if (error) setError(null);
            }}
            disabled={isSubmitting}
          >
            <SelectTrigger id="paymentMode" className="border-gray-300">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentRemarks" className={FIELD_LABEL}>
            Remarks
          </Label>
          <textarea
            id="paymentRemarks"
            value={form.remarks}
            onChange={setField('remarks')}
            placeholder="Quick payment"
            rows={3}
            disabled={isSubmitting}
            className={cn(
              'flex min-h-[80px] w-full rounded-xl border border-gray-300 shadow-md bg-white px-4 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:pointer-events-none disabled:opacity-50 font-medium resize-y'
            )}
          />
        </div>

        {error ? (
          <p className="text-sm font-semibold text-rose-600 pl-1" role="alert">
            {error}
          </p>
        ) : null}
      </form>
    </RightDrawer>
  );
}

export default ProcessPayment;
