'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertCircle,
  Bell,
  CalendarDays,
  ClipboardList,
  Clock3,
  FileText,
  RefreshCcw,
  Search,
  UserCircle2,
} from 'lucide-react';
import { Badge, Button, Card, Input, Label, Table } from '@/components/ui';
import {
  fetchTrackOrderLifecycle,
  type OrderLifecycleTrackData,
} from '@/app/Apis/booking/orderLifecycleApi';

function formatDateTime(dateLike: string | null | undefined) {
  if (!dateLike) return 'N/A';
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return dateLike;
  return parsed.toLocaleString();
}

function formatDate(dateLike: string | null | undefined) {
  if (!dateLike) return 'N/A';
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return dateLike;
  return parsed.toLocaleDateString();
}

function statusBadgeClass(status: string) {
  if (status === 'CANCELLED') {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  if (status === 'COMPLETED') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (status === 'IN_PROGRESS') {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export default function TrackingOrderPage() {
  const searchParams = useSearchParams();
  const initialOrderId = useMemo(() => {
    const param = Number(searchParams.get('orderId') || '1');
    return Number.isFinite(param) && param > 0 ? param : 1;
  }, [searchParams]);

  const [orderIdInput, setOrderIdInput] = useState(String(initialOrderId));
  const [trackedOrderId, setTrackedOrderId] = useState(initialOrderId);

  const parsedInputOrderId = Number.parseInt(orderIdInput, 10);
  const canTrack = Number.isFinite(parsedInputOrderId) && parsedInputOrderId > 0;

  const {
    data: lifecycleRes,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['order-lifecycle', 'track', trackedOrderId],
    queryFn: () => fetchTrackOrderLifecycle(trackedOrderId),
    enabled: trackedOrderId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const lifecycle: OrderLifecycleTrackData | null = lifecycleRes?.data ?? null;
  const recentModifications = lifecycle?.recentModifications ?? [];
  const notifications = lifecycle?.notifications ?? [];

  const handleTrack = () => {
    if (!canTrack) return;
    setTrackedOrderId(parsedInputOrderId);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Activity size={22} />
            </div>
            Track Order Lifecycle
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Monitor status, cancellation, notification, and modification events for a test order.
          </p>
        </div>
        <div className="w-full md:w-96 space-y-2">
          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
            Track by Order ID
          </Label>
          <div className="relative flex items-center gap-2">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value.replace(/[^\d]/g, ''))}
              placeholder="Enter booking order id"
              className="pl-10 border-gray-300"
            />
            <Button
              type="button"
              onClick={handleTrack}
              disabled={!canTrack || isFetching}
              className="rounded-xl custom-gradient text-white font-bold gap-2"
            >
              <Search size={14} />
              Track
            </Button>
          </div>
          {!canTrack ? (
            <p className="text-[11px] text-rose-600 font-semibold">Enter a valid numeric order ID.</p>
          ) : null}
          {isError ? (
            <p className="text-[11px] text-rose-600 font-semibold">{error instanceof Error ? error.message : 'Failed to load lifecycle details.'}</p>
          ) : null}
        </div>
      </div>

      {isLoading ? (
        <Card className="p-10 border-gray-300 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 text-center">Loading lifecycle details...</p>
        </Card>
      ) : !lifecycle ? (
        <Card className="p-10 border-gray-300 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 text-center">No lifecycle details found for this order.</p>
        </Card>
      ) : (
      <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="p-5 border-gray-300 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Order Number</p>
          <p className="text-lg font-black text-slate-900 mt-2">{lifecycle.orderNumber}</p>
        </Card>
        <Card className="p-5 border-gray-300 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Status</p>
          <div className="mt-2">
            <Badge className={`font-black text-[10px] tracking-wider border ${statusBadgeClass(lifecycle.currentStatus)}`}>
              {lifecycle.currentStatus.replace('_', ' ')}
            </Badge>
          </div>
        </Card>
        <Card className="p-5 border-gray-300 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Modifications</p>
          <p className="text-lg font-black text-slate-900 mt-2">{lifecycle.totalModifications}</p>
        </Card>
        <Card className="p-5 border-gray-300 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Notifications</p>
          <p className="text-lg font-black text-slate-900 mt-2">{lifecycle.totalNotifications}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <Card className="overflow-hidden border-gray-300 shadow-sm">
            <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
              <RefreshCcw className="text-blue-600" size={18} />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Modifications</h2>
            </div>
            {recentModifications.length === 0 ? (
              <div className="p-6 text-sm font-semibold text-slate-500">No modification history found.</div>
            ) : (
              <Table>
                <thead className="bg-slate-50/70 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Field</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Change</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Updated By</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentModifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.fieldName}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {item.oldValue ?? 'N/A'} {'->'} {item.newValue ?? 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">{item.modifiedBy}</td>
                      <td className="px-6 py-4 text-slate-500">{formatDateTime(item.modificationDateTime)}</td>
                      <td className="px-6 py-4 text-slate-600">{item.reasonForChange ?? 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>

          <Card className="p-6 border-gray-300 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="text-indigo-600" size={18} />
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Notifications</h2>
            </div>
            {notifications.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 p-6 text-center">
                <p className="text-sm font-semibold text-slate-500">No notification records found for this order.</p>
              </div>
            ) : null}
          </Card>
        </div>

        <div className="xl:col-span-4 space-y-8">
          <Card className="p-6 border-gray-300 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <ClipboardList className="text-emerald-600" size={16} />
              Lifecycle Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Order Date</span>
                <span className="text-slate-900 font-black">{formatDate(lifecycle.orderDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Created Date</span>
                <span className="text-slate-900 font-black text-right">{formatDateTime(lifecycle.createdDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-semibold">Cancellation Flag</span>
                <Badge className={lifecycle.isCancelled ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'}>
                  {lifecycle.isCancelled ? 'YES' : 'NO'}
                </Badge>
              </div>
            </div>
          </Card>

          {lifecycle.cancellationDetails ? (
            <Card className="p-6 border-rose-200 bg-rose-50/40 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-rose-700 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle size={16} />
                Cancellation Details
              </h2>
              <div className="space-y-3 text-sm">
                <p className="text-slate-700">
                  <span className="font-bold">Reason:</span> {lifecycle.cancellationDetails.cancellationReason}
                </p>
                <p className="text-slate-700">
                  <span className="font-bold">Notes:</span> {lifecycle.cancellationDetails.cancellationNotes ?? 'N/A'}
                </p>
                <p className="text-slate-700 flex items-start gap-2">
                  <UserCircle2 className="mt-0.5 text-slate-500" size={14} />
                  <span>
                    <span className="font-bold">Cancelled By:</span> {lifecycle.cancellationDetails.cancelledBy}
                  </span>
                </p>
                <p className="text-slate-700 flex items-start gap-2">
                  <Clock3 className="mt-0.5 text-slate-500" size={14} />
                  <span>
                    <span className="font-bold">Cancelled On:</span>{' '}
                    {formatDateTime(lifecycle.cancellationDetails.cancellationDateTime)}
                  </span>
                </p>
                <div className="text-slate-700 flex items-start gap-2">
                  <CalendarDays className="mt-0.5 text-slate-500 shrink-0" size={14} />
                  <div className="flex flex-wrap items-center gap-2">
                    <span>
                      <span className="font-bold">Refund:</span> Rs. {lifecycle.cancellationDetails.refundAmount}
                    </span>
                    <Badge className="bg-amber-100 text-amber-700 border border-amber-200">
                      {lifecycle.cancellationDetails.refundStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          ) : null}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
