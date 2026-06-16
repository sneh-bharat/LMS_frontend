'use client';

import {
  Activity,
  Ban,
  Bell,
  Calendar,
  CreditCard,
  FileText,
  Hash,
  Loader2,
  MessageSquare,
  User,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import type { TestOrder } from '@/features/diagnosis/services/booking.service';
import type {
  LifecycleModification,
  OrderCancellationDetails,
  OrderLifecycleTrackData,
} from '@/features/diagnosis/services/booking.service';
import { useTrackOrderLifecycle } from '@/features/diagnosis/services/booking.service';

export interface TrackLifecycleProps {
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

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatCurrency(amount: number | null | undefined) {
  if (amount == null || Number.isNaN(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusBadgeVariant(status: string | null | undefined) {
  const s = status?.toUpperCase() ?? '';
  if (s === 'COMPLETED' || s === 'DELIVERED') return 'success' as const;
  if (s === 'CANCELLED' || s === 'CANCELED') return 'destructive' as const;
  if (s === 'PENDING' || s === 'IN_PROGRESS') return 'warning' as const;
  return 'secondary' as const;
}

function refundStatusVariant(status: string | null | undefined) {
  const s = status?.toUpperCase() ?? '';
  if (s === 'COMPLETED' || s === 'REFUNDED' || s === 'PAID') return 'success' as const;
  if (s === 'PENDING') return 'warning' as const;
  if (s === 'FAILED' || s === 'REJECTED') return 'destructive' as const;
  return 'secondary' as const;
}

function formatCancellationReason(reason: string) {
  return reason
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-center">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900">{value}</p>
    </div>
  );
}

function CancellationSection({ details }: { details: OrderCancellationDetails }) {
  return (
    <section className="space-y-4">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
        <Ban size={14} className="text-amber-600" />
        Cancellation details
      </h4>
      <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="destructive">Cancelled</Badge>
            <Badge variant={refundStatusVariant(details.refundStatus)}>
              Refund {details.refundStatus}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund amount</p>
            <p className="text-lg font-black text-amber-800 font-mono">
              {formatCurrency(details.refundAmount)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <DetailField label="Cancelled by" value={details.cancelledBy} icon={User} />
          <DetailField
            label="Cancelled on"
            value={formatDateTime(details.cancellationDateTime)}
            icon={Calendar}
          />
          <DetailField
            label="Cancellation reason"
            value={formatCancellationReason(details.cancellationReason)}
            icon={MessageSquare}
          />
          <DetailField
            label="Refund reference"
            value={details.refundReference ?? '—'}
            icon={CreditCard}
            mono
          />
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
        </div>

        {details.cancellationNotes ? (
          <DetailField
            label="Cancellation notes"
            value={details.cancellationNotes}
            icon={MessageSquare}
            multiline
          />
        ) : null}
      </div>
    </section>
  );
}

function ModificationRow({ item }: { item: LifecycleModification }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-wider">
          {item.modificationType.replace(/_/g, ' ')}
        </Badge>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {formatDateTime(item.modificationDateTime)}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Field</p>
          <p className="font-bold text-slate-800">{item.fieldName}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Modified by</p>
          <p className="font-bold text-slate-800">{item.modifiedBy}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Old value</p>
          <p className="font-semibold text-slate-600 wrap-break-word">{item.oldValue ?? '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">New value</p>
          <p className="font-semibold text-slate-900 wrap-break-word">{item.newValue ?? '—'}</p>
        </div>
        {item.ipAddress ? (
          <div className="sm:col-span-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IP address</p>
            <p className="font-mono text-xs font-semibold text-slate-600">{item.ipAddress}</p>
          </div>
        ) : null}
      </div>
      {item.reasonForChange ? (
        <p className="text-xs text-slate-600 border-t border-slate-100 pt-3 leading-relaxed">
          <span className="font-black uppercase tracking-widest text-slate-400">Reason: </span>
          {item.reasonForChange}
        </p>
      ) : null}
    </div>
  );
}

function NotificationsSection({ notifications }: { notifications: unknown[] }) {
  return (
    <section className="space-y-3">
      <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
        <Bell size={14} className="text-blue-600" />
        Notifications
      </h4>
      {notifications.length === 0 ? (
        <p className="text-sm text-slate-500 py-4 text-center rounded-xl border border-dashed border-slate-200">
          No notifications sent for this order.
        </p>
      ) : (
        <div className="space-y-2">
          {notifications.map((item, index) => (
            <pre
              key={index}
              className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-mono text-slate-700 overflow-x-auto"
            >
              {JSON.stringify(item, null, 2)}
            </pre>
          ))}
        </div>
      )}
    </section>
  );
}

function TrackLifecycleContent({ track }: { track: OrderLifecycleTrackData }) {
  const displayOrderNumber = track.orderNumber || '—';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-start justify-between bg-blue-50 p-6 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 border-2 border-blue-50">
            <FileText size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight font-mono">
              {displayOrderNumber}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={statusBadgeVariant(track.currentStatus)}>
                {track.currentStatus.replace(/_/g, ' ')}
              </Badge>
              {track.isCancelled ? <Badge variant="destructive">Cancelled order</Badge> : null}
            </div>
          </div>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <DetailField label="Order date" value={formatDate(track.orderDate)} icon={Calendar} />
        <DetailField label="Created" value={formatDateTime(track.createdDate)} icon={Calendar} />
        <DetailField
          label="Lifecycle status"
          value={track.isCancelled ? 'Cancelled' : 'Active'}
          icon={Activity}
        />
      </section>

      {track.cancellationDetails ? (
        <CancellationSection details={track.cancellationDetails} />
      ) : track.isCancelled ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          This order is marked cancelled but no cancellation record was returned.
        </p>
      ) : null}

      <section className="space-y-3">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-indigo-600" />
          Recent modifications ({track.recentModifications.length})
        </h4>
        {track.recentModifications.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center rounded-xl border border-dashed border-slate-200">
            No modifications recorded yet.
          </p>
        ) : (
          <div className="space-y-3">
            {track.recentModifications.map((item) => (
              <ModificationRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>

      <NotificationsSection notifications={track.notifications ?? []} />
    </div>
  );
}

export function TrackLifecycle({ isOpen, onClose, order }: TrackLifecycleProps) {
  const orderId = order?.id ?? null;
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useTrackOrderLifecycle(orderId, isOpen);

  const track = response?.data;
  const displayOrderNumber = track?.orderNumber ?? order?.orderNumber ?? '—';

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Activity className="text-white" size={22} />
          <span>
            Order <span className="text-emerald-200">Lifecycle</span>
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
          <Loader2 size={32} className="animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading lifecycle track…</p>
        </div>
      ) : isError ? (
        <div className="py-16 text-center space-y-4">
          <p className="text-sm font-semibold text-rose-600">
            {error?.message || 'Could not load order lifecycle.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : !track ? (
        <div className="py-16 text-center text-sm text-slate-500">
          No lifecycle data found for this order.
        </div>
      ) : (
        <TrackLifecycleContent track={track} />
      )}
    </RightDrawer>
  );
}

export default TrackLifecycle;
