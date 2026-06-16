'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  ArrowRightCircle,
  CreditCard,
  FileText,
  History,
  IndianRupee,
  Receipt,
  Search,
  Wallet,
} from 'lucide-react';
import { Badge, Button, Card, Input, Label, Table } from '@/components/ui';
import {
  fetchPaymentSummaryByOrder,
  type OrderPaymentSummaryData,
  type PaymentHistoryItem,
  type PaymentTransaction,
} from '@/features/diagnosis/services/booking.service';
import { usePaymentTransactions } from '@/features/diagnosis/services/booking.service';

function formatCurrency(amount: number | null | undefined) {
  return `₹${(amount ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(dateLike: string | null | undefined) {
  if (!dateLike) return '—';
  const parsed = new Date(dateLike);
  if (Number.isNaN(parsed.getTime())) return dateLike;
  return parsed.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function paymentStatusBadgeClass(status: string) {
  const value = status.toUpperCase();
  if (value === 'PAID') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (value === 'UNPAID') return 'bg-rose-100 text-rose-700 border-rose-200';
  if (value === 'PARTIAL') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function OverviewField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function PaymentHistoryTable({ rows }: { rows: PaymentHistoryItem[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-6 text-sm font-semibold text-slate-500 text-center">
        No payment history found for this order.
      </div>
    );
  }

  return (
    <Table>
      <thead className="bg-slate-50/70 border-b border-gray-100">
        <tr>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Reference</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Remarks</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((item) => (
          <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
            <td className="px-6 py-4 text-slate-600">{formatDateTime(item.paymentDateTime)}</td>
            <td className="px-6 py-4 font-black text-slate-900">{formatCurrency(item.amount)}</td>
            <td className="px-6 py-4 font-semibold text-slate-700">{item.paymentMode || '—'}</td>
            <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.transactionReference || '—'}</td>
            <td className="px-6 py-4 text-slate-600">{item.remarks || '—'}</td>
            <td className="px-6 py-4">
              <Badge className={`font-black text-[10px] tracking-wider border ${paymentStatusBadgeClass(item.status || 'SUCCESS')}`}>
                {(item.status || 'SUCCESS').replace('_', ' ')}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

function TransactionDetailsTable({ rows }: { rows: PaymentTransaction[] }) {
  if (rows.length === 0) {
    return (
      <div className="p-6 text-sm font-semibold text-slate-500 text-center">
        No transaction details found for this order.
      </div>
    );
  }

  return (
    <Table>
      <thead className="bg-slate-50/70 border-b border-gray-100">
        <tr>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Txn ID</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Collected By</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt</th>
          <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.map((item) => (
          <tr key={`txn-${item.id}`} className="hover:bg-slate-50/60 transition-colors">
            <td className="px-6 py-4 font-mono text-xs font-bold text-slate-800">{item.transactionId || `#${item.id}`}</td>
            <td className="px-6 py-4 font-black text-slate-900">{formatCurrency(item.amount)}</td>
            <td className="px-6 py-4 font-semibold text-slate-700">{item.paymentMode || '—'}</td>
            <td className="px-6 py-4 text-slate-600">{item.paymentType || '—'}</td>
            <td className="px-6 py-4 text-slate-600">{item.collectedBy || '—'}</td>
            <td className="px-6 py-4 font-mono text-xs text-slate-600">{item.receiptNumber || '—'}</td>
            <td className="px-6 py-4 text-slate-600">{formatDateTime(item.paymentDate)}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default function PaymentSummaryPage() {
  const searchParams = useSearchParams();
  const initialOrderId = useMemo(() => {
    const param = Number(searchParams.get('orderId') || '1');
    return Number.isFinite(param) && param > 0 ? param : 1;
  }, [searchParams]);

  const [orderIdInput, setOrderIdInput] = useState(String(initialOrderId));
  const [summaryOrderId, setSummaryOrderId] = useState(initialOrderId);

  const parsedInputOrderId = Number.parseInt(orderIdInput, 10);
  const canLoad = Number.isFinite(parsedInputOrderId) && parsedInputOrderId > 0;

  const {
    data: summaryRes,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['payments', 'summary', summaryOrderId],
    queryFn: () => fetchPaymentSummaryByOrder(summaryOrderId),
    enabled: summaryOrderId > 0,
    staleTime: 30 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const {
    data: transactionsRes,
    isLoading: isTransactionsLoading,
  } = usePaymentTransactions(summaryOrderId, summaryOrderId > 0);

  const summary: OrderPaymentSummaryData | null = summaryRes?.data ?? null;
  const paymentHistory = summary?.paymentHistory ?? [];
  const transactions = transactionsRes?.data ?? [];
  const isLoadingAny = isLoading || isTransactionsLoading;

  const handleLoadSummary = () => {
    if (!canLoad) return;
    setSummaryOrderId(parsedInputOrderId);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/diagnosis/invoice-list"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-3"
          >
            <ArrowLeft size={14} />
            Back to invoice list
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <CreditCard size={22} />
            </div>
            Payment Summary by Order
          </h1>
          <p className="text-slate-500 text-sm font-semibold mt-1">
            View bill breakdown, payment status, history, and transaction details for a booking order.
          </p>
        </div>
        <div className="w-full md:w-96 space-y-2">
          <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">
            Load by Order ID
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
              onClick={handleLoadSummary}
              disabled={!canLoad || isFetching}
              className="rounded-xl custom-gradient text-white font-bold gap-2"
            >
              <Search size={14} />
              Load
            </Button>
          </div>
          {!canLoad ? (
            <p className="text-[11px] text-rose-600 font-semibold">Enter a valid numeric order ID.</p>
          ) : null}
          {isError ? (
            <p className="text-[11px] text-rose-600 font-semibold">
              {error instanceof Error ? error.message : 'Failed to load payment summary.'}
            </p>
          ) : null}
        </div>
      </div>

      {isLoadingAny ? (
        <Card className="p-10 border-gray-300 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 text-center">Loading payment summary…</p>
        </Card>
      ) : !summary ? (
        <Card className="p-10 border-gray-300 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 text-center">No payment summary found for this order.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="p-5 border-gray-300 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Bill Amount</p>
              <p className="text-lg font-black text-slate-900 mt-2">{formatCurrency(summary.totalAmount)}</p>
            </Card>
            <Card className="p-5 border-gray-300 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paid Amount</p>
              <p className="text-lg font-black text-emerald-700 mt-2">{formatCurrency(summary.paidAmount)}</p>
            </Card>
            <Card className="p-5 border-gray-300 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pending Amount</p>
              <p className="text-lg font-black text-rose-600 mt-2">{formatCurrency(summary.pendingAmount)}</p>
            </Card>
            <Card className="p-5 border-gray-300 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discount</p>
              <p className="text-lg font-black text-amber-600 mt-2">{formatCurrency(summary.discountAmount)}</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-8 space-y-8">
              <Card className="overflow-hidden border-gray-300 shadow-sm">
                <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
                  <History className="text-emerald-600" size={18} />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Payment History</h2>
                </div>
                <PaymentHistoryTable rows={paymentHistory} />
              </Card>

              <Card className="overflow-hidden border-gray-300 shadow-sm">
                <div className="p-5 border-b border-gray-100 bg-slate-50 flex items-center gap-3">
                  <Receipt className="text-blue-600" size={18} />
                  <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transaction Details</h2>
                </div>
                <TransactionDetailsTable rows={transactions} />
              </Card>
            </div>

            <div className="xl:col-span-4 space-y-8">
              <Card className="p-6 border-gray-300 shadow-sm space-y-5">
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Wallet className="text-emerald-600" size={16} />
                  Order Payment Overview
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <OverviewField label="Invoice Number" value={summary.orderNumber} />
                  <OverviewField label="Original Bill Amount" value={formatCurrency(summary.totalAmount)} />
                  <OverviewField label="Discount Given" value={formatCurrency(summary.discountAmount)} />
                  <OverviewField label="Net Amount (After Discount)" value={formatCurrency(summary.netAmount)} />
                  <OverviewField label="Amount Already Paid" value={formatCurrency(summary.paidAmount)} />
                  <OverviewField label="Amount Still Pending" value={formatCurrency(summary.pendingAmount)} />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Status</p>
                    <Badge className={`font-black text-[10px] tracking-wider border ${paymentStatusBadgeClass(summary.paymentStatus)}`}>
                      {summary.paymentStatus.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fully Paid</p>
                    <Badge
                      className={
                        summary.isPaid
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }
                    >
                      {summary.isPaid ? 'YES' : 'NO'}
                    </Badge>
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-emerald-200 bg-emerald-50/40 shadow-sm space-y-3">
                <h2 className="text-sm font-black text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                  <ArrowRightCircle size={16} />
                  Next Action
                </h2>
                <div className="text-sm text-slate-700 font-semibold leading-relaxed">{summary.nextAction || '—'}</div>
                <div className="pt-2 border-t border-emerald-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <IndianRupee size={14} className="text-emerald-600" />
                  Net payable: <span className="font-black text-slate-900">{formatCurrency(summary.netAmount)}</span>
                </div>
                {!summary.isPaid && summary.pendingAmount > 0 ? (
                  <Link href={`/diagnosis/invoice-list?payOrderId=${summary.orderId}`}>
                    <Button
                      type="button"
                      className="w-full mt-2 rounded-xl custom-gradient text-white font-bold gap-2"
                    >
                      <CreditCard size={14} />
                      Process payment
                    </Button>
                  </Link>
                ) : null}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
