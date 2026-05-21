'use client';

import { useEffect, useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { Input, Button, Label } from '@/components/ui';
import { RightDrawer } from '@/components/ui/right-drawer';
import { cn } from '@/lib/utils';
import type { TestOrder } from '@/app/Apis/booking/testOrderApi';

export interface CancelOrderFormValues {
  cancellationReason: string;
  cancellationNotes: string;
  refundAmount: string;
}

export interface CancelOrderProps {
  isOpen: boolean;
  onClose: () => void;
  order: TestOrder | null;
  onSubmit?: (values: CancelOrderFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

const BLANK_FORM: CancelOrderFormValues = {
  cancellationReason: '',
  cancellationNotes: '',
  refundAmount: '',
};

const FIELD_LABEL =
  'text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1';

export function CancelOrder({
  isOpen,
  onClose,
  order,
  onSubmit,
  isSubmitting = false,
}: CancelOrderProps) {
  const [form, setForm] = useState<CancelOrderFormValues>(BLANK_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(BLANK_FORM);
    setError(null);
  }, [isOpen, order?.id]);

  const setField =
    (key: keyof CancelOrderFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      if (error) setError(null);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.cancellationReason.trim()) {
      setError('Cancellation reason is required.');
      return;
    }
    if (form.refundAmount.trim()) {
      const amount = Number(form.refundAmount);
      if (!Number.isFinite(amount) || amount < 0) {
        setError('Refund amount must be a valid number (0 or greater).');
        return;
      }
    }
    if (!onSubmit) {
      onClose();
      return;
    }
    try {
      await onSubmit({
        cancellationReason: form.cancellationReason.trim(),
        cancellationNotes: form.cancellationNotes.trim(),
        refundAmount: form.refundAmount.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel order.');
    }
  };

  if (!order) return null;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Ban className="text-white" size={22} />
          <span>
            Cancel <span className="text-emerald-200">Order</span>
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
            form="cancel-order-form"
            disabled={isSubmitting}
            className="custom-gradient text-white font-bold gap-2 min-w-[140px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Cancelling…
              </>
            ) : (
              'Confirm cancellation'
            )}
          </Button>
        </div>
      }
    >
      <form id="cancel-order-form" onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        <p className="text-sm text-slate-600 font-medium leading-relaxed">
          Provide a reason and optional refund details to cancel this booking. This action may not
          be reversible.
        </p>

        <div className="space-y-2">
          <Label htmlFor="cancellationReason" className={FIELD_LABEL}>
            Cancellation reason <span className="text-rose-500">*</span>
          </Label>
          <textarea
            id="cancellationReason"
            value={form.cancellationReason}
            onChange={setField('cancellationReason')}
            placeholder="Describe why this order is being cancelled…"
            rows={4}
            disabled={isSubmitting}
            className={cn(
              'flex min-h-[100px] w-full rounded-xl border border-gray-300 shadow-md bg-white px-4 py-3 text-sm transition-all outline-none placeholder:text-slate-400 focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/10 disabled:pointer-events-none disabled:opacity-50 font-medium resize-y'
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cancellationNotes" className={FIELD_LABEL}>
            Cancellation notes
          </Label>
          <Input
            id="cancellationNotes"
            value={form.cancellationNotes}
            onChange={setField('cancellationNotes')}
            placeholder="Patient rescheduled the appointment"
            disabled={isSubmitting}
            className="border-gray-300"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="refundAmount" className={FIELD_LABEL}>
            Refund amount
          </Label>
          <Input
            id="refundAmount"
            type="text"
            inputMode="decimal"
            value={form.refundAmount}
            onChange={setField('refundAmount')}
            placeholder="500.00"
            disabled={isSubmitting}
            className="border-gray-300 font-mono"
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

export default CancelOrder;
