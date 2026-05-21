'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { Input, Button, Label } from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import { cn } from '@/lib/utils';
import type { TestOrder } from '@/app/Apis/booking/testOrderApi';
import type { PaymentTransaction } from '@/app/Apis/booking/paymentApi';

export interface RefundFormValues {
  refundAmount: string;
  refundReason: string;
  processedBy: string;
  remarks: string;
}

export interface RefundsProps {
  isOpen: boolean;
  onClose: () => void;
  order: TestOrder | null;
  /** Payment transaction id (hidden field; used for API). */
  transactionId: number | null;
  /** Transaction amount passed from row (hidden + prefill refund amount). */
  transactionAmount?: number | null;
  /** Optional fallback for max-amount validation. */
  selectedTransaction?: PaymentTransaction | null;
  onSubmit?: (values: RefundFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const BLANK_FORM: RefundFormValues = {
  refundAmount: '',
  refundReason: '',
  processedBy: '',
  remarks: '',
};

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Logged-in user from login (`localStorage.fullName`). */
function getLoggedInUserName() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('fullName')?.trim() ?? '';
}

function maxRefundForTransaction(txn: PaymentTransaction | null | undefined) {
  if (!txn || txn.isRefund) return 0;
  return Math.max(0, txn.amount ?? 0);
}

export function Refunds({
  isOpen,
  onClose,
  order,
  transactionId,
  transactionAmount = null,
  selectedTransaction = null,
  onSubmit,
  isSubmitting = false,
}: RefundsProps) {
  const maxRefundable = useMemo(() => {
    if (transactionAmount != null && transactionAmount > 0) {
      return transactionAmount;
    }
    return maxRefundForTransaction(selectedTransaction);
  }, [transactionAmount, selectedTransaction]);

  const [form, setForm] = useState<RefundFormValues>(BLANK_FORM);
  const [error, setError] = useState<string | null>(null);
  const loggedInUserName = getLoggedInUserName();

  useEffect(() => {
    if (!isOpen || !order || !transactionId) return;
    const amountStr =
      maxRefundable > 0 ? maxRefundable.toFixed(2) : '';
    setForm({
      ...BLANK_FORM,
      refundAmount: amountStr,
      processedBy: loggedInUserName,
    });
    setError(null);
  }, [isOpen, order?.id, transactionId, loggedInUserName, maxRefundable]);

  const setField =
    (key: keyof RefundFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (error) setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.refundReason.trim()) {
      setError('Refund reason is required.');
      return;
    }
    const processedBy = form.processedBy.trim() || loggedInUserName;
    if (!processedBy) {
      setError('Logged-in user name is required. Please sign in again.');
      return;
    }

    const amount = Number(form.refundAmount.trim());
    if (!form.refundAmount.trim() || !Number.isFinite(amount) || amount <= 0) {
      setError('Refund amount must be greater than zero.');
      return;
    }
    if (maxRefundable > 0 && amount > maxRefundable) {
      setError(`Refund amount cannot exceed ${formatCurrency(maxRefundable)}.`);
      return;
    }

    if (!onSubmit) {
      onClose();
      return;
    }

    try {
      await onSubmit({
        refundAmount: form.refundAmount.trim(),
        refundReason: form.refundReason.trim(),
        processedBy,
        remarks: form.remarks.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process refund.');
    }
  };

  if (!order || !transactionId) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <RotateCcw className="text-white" size={22} />
          <span>
            Process <span className="text-emerald-200">Refund</span>
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
            form="process-refund-form"
            disabled={isSubmitting}
            className="custom-gradient text-white font-bold gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processing…
              </>
            ) : (
              'Confirm refund'
            )}
          </Button>
        </div>
      }
    >
      <form
        id="process-refund-form"
        onSubmit={(e) => void handleSubmit(e)}
        className="space-y-6"
      >
        <input type="hidden" name="transactionId" value={transactionId} readOnly />
        {transactionAmount != null ? (
          <input type="hidden" name="transactionAmount" value={transactionAmount} readOnly />
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="refundAmount" className={FIELD_LABEL}>
            Refund amount <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="refundAmount"
            type="text"
            inputMode="decimal"
            value={form.refundAmount}
            onChange={setField('refundAmount')}
            disabled={isSubmitting}
            className="border-gray-300 font-mono"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="refundReason" className={FIELD_LABEL}>
            Refund reason <span className="text-rose-500">*</span>
          </Label>
          <textarea
            id="refundReason"
            value={form.refundReason}
            onChange={setField('refundReason')}
            placeholder="Describe why this refund is being issued…"
            rows={4}
            disabled={isSubmitting}
            className={cn(
              'flex min-h-[100px] w-full rounded-xl border border-gray-300 shadow-md bg-white px-4 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:pointer-events-none disabled:opacity-50 font-medium resize-y'
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="processedBy" className={FIELD_LABEL}>
            Processed by <span className="text-rose-500">*</span>
          </Label>
          <Input
            id="processedBy"
            value={form.processedBy}
            onChange={setField('processedBy')}
            readOnly={Boolean(loggedInUserName)}
            disabled={isSubmitting || Boolean(loggedInUserName)}
            className="border-gray-300 bg-slate-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="refundRemarks" className={FIELD_LABEL}>
            Remarks
          </Label>
          <textarea
            id="refundRemarks"
            value={form.remarks}
            onChange={setField('remarks')}
            placeholder="Optional notes for audit trail"
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

export default Refunds;
