'use client';

import {
  Ban,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  Bell,
  User,
  MessageSquare,
  Hash,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import type { TestOrder } from '@/features/diagnosis/services/booking.service';
import { useCancellationDetails } from '@/features/diagnosis/services/booking.service';

export interface CancelDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: TestOrder | null;
}

function DetailField({
  label,
  value,
  icon: Icon,
  mono,
  multiline,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  mono?: boolean;
  multiline?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon ? <Icon size={10} /> : null}
        {label}
      </label>
      <p
        className={`text-sm font-bold text-slate-900 ${mono ? 'font-mono' : ''} ${
          multiline ? 'whitespace-pre-wrap leading-relaxed' : ''
        }`}
      >
        {value || '—'}
      </p>
    </div>
  );
}

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

function formatCurrency(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function refundStatusVariant(status: string | null | undefined) {
  const s = status?.toUpperCase() ?? '';
  if (s === 'COMPLETED' || s === 'REFUNDED' || s === 'PAID') return 'success' as const;
  if (s === 'PENDING') return 'warning' as const;
  if (s === 'FAILED' || s === 'REJECTED') return 'destructive' as const;
  return 'secondary' as const;
}

export function CancelDetails({ isOpen, onClose, order }: CancelDetailsProps) {
  const orderId = order?.id ?? null;
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useCancellationDetails(orderId, isOpen);

  const details = response?.data;
  const displayOrderNumber = details?.orderNumber ?? order?.orderNumber ?? '—';

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Ban className="text-white" size={22} />
          <span>
            Cancellation <span className="text-emerald-200">Details</span>
          </span>
        </div>
      }
      description={`Order: ${displayOrderNumber}`}
      maxWidth="md"
      footer={
        <div className="flex justify-end w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-200 text-slate-600 font-bold"
          >
            Close
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" />
          <p className="text-sm font-medium">Loading cancellation details…</p>
        </div>
      ) : isError ? (
        <div className="py-16 text-center space-y-4">
          <p className="text-sm font-semibold text-rose-600">
            {error?.message || 'Could not load cancellation details.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !details ? (
        <div className="py-16 text-center text-sm text-slate-500">
          No cancellation record found for this order.
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-start justify-between bg-amber-50 p-6 rounded-2xl border border-amber-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 border-2 border-amber-50">
                <FileText size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
                  {displayOrderNumber}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="destructive">Cancelled</Badge>
                  <Badge variant={refundStatusVariant(details.refundStatus)}>
                    Refund {details.refundStatus}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                Refund amount
              </div>
              <div className="text-lg font-black text-amber-800 bg-white px-3 py-1 rounded-lg border border-amber-200 font-mono">
                {formatCurrency(details.refundAmount)}
              </div>
            </div>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DetailField
              label="Order ID"
              value={String(details.orderId)}
              icon={Hash}
              mono
            />
            <DetailField
              label="Cancelled by"
              value={details.cancelledBy}
              icon={User}
            />
            <DetailField
              label="Cancelled on"
              value={formatDateTime(details.cancellationDateTime)}
              icon={Calendar}
            />
            <DetailField
              label="Refund reference"
              value={details.refundReference ?? '—'}
              icon={CreditCard}
              mono
            />
          </section>

          <section className="space-y-4 p-5 rounded-2xl border border-slate-100 bg-slate-50/50">
            <DetailField
              label="Cancellation reason"
              value={details.cancellationReason}
              icon={MessageSquare}
              multiline
            />
            <DetailField
              label="Cancellation notes"
              value={details.cancellationNotes ?? '—'}
              icon={MessageSquare}
              multiline
            />
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <DetailField
              label="Notification sent"
              value={details.notificationSent ? 'Yes' : 'No'}
              icon={Bell}
            />
            <DetailField
              label="Notification date"
              value={formatDateTime(details.notificationDateTime)}
              icon={Bell}
            />
          </section>
        </div>
      )}
    </RightDrawer>
  );
}

export default CancelDetails;
