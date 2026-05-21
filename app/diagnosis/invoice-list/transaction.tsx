'use client';

import { useMemo, useState } from 'react';
import { Loader2, Receipt } from 'lucide-react';
import { toast } from 'sonner';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Table } from '@/components/ui';
import type { TestOrder } from '@/app/Apis/booking/testOrderApi';
import {
  usePaymentTransactions,
  useProcessPaymentRefund,
} from '@/app/Apis/booking/usePayments';
import type { PaymentTransaction } from '@/app/Apis/booking/paymentApi';
import Refunds, { type RefundFormValues } from './refunds';

export interface TransactionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  order: TestOrder | null;
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

function formatCurrency(amount: number, currency = 'INR') {
  if (currency === 'INR') {
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `${currency} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function paymentStatusVariant(status: string | null | undefined) {
  const s = status?.toUpperCase() ?? '';
  if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'PAID') return 'success' as const;
  if (s === 'PENDING') return 'warning' as const;
  if (s === 'FAILED' || s === 'REJECTED') return 'destructive' as const;
  return 'secondary' as const;
}

function canRefund(txn: PaymentTransaction) {
  if (txn.isRefund) return false;
  const status = txn.paymentStatus?.toUpperCase() ?? '';
  return status === 'SUCCESS' || status === 'COMPLETED' || status === 'PAID';
}

function TransactionCard({
  txn,
  onRefund,
}: {
  txn: PaymentTransaction;
  onRefund: (transactionId: number, amount: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction ID</p>
          <p className="text-sm font-bold font-mono text-slate-900 mt-1">{txn.transactionId || `#${txn.id}`}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canRefund(txn) ? (
            <>
              <input type="hidden" name="transactionId" value={txn.id} readOnly />
              <input type="hidden" name="transactionAmount" value={txn.amount} readOnly />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-slate-200 text-slate-600 font-bold"
                onClick={() => onRefund(txn.id, txn.amount)}
              >
                Refund
              </Button>
            </>
          ) : null}
          <Badge variant={paymentStatusVariant(txn.paymentStatus)} className="text-[10px] font-bold">
            {txn.paymentStatus}
          </Badge>
          {txn.isRefund ? (
            <Badge variant="destructive" className="text-[10px] font-bold">
              REFUND
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</p>
          <p className="font-black text-slate-900 mt-1">{formatCurrency(txn.amount, txn.currency)}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Mode</p>
          <p className="font-bold text-slate-900 mt-1">{txn.paymentMode || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Type</p>
          <p className="font-bold text-slate-900 mt-1">{txn.paymentType || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Payment Date</p>
          <p className="font-bold text-slate-900 mt-1">{formatDateTime(txn.paymentDate)}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collected By</p>
          <p className="font-bold text-slate-900 mt-1">{txn.collectedBy || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt Number</p>
          <p className="font-bold font-mono text-slate-900 mt-1">{txn.receiptNumber || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reference Number</p>
          <p className="font-bold font-mono text-slate-900 mt-1">{txn.referenceNumber || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Currency</p>
          <p className="font-bold text-slate-900 mt-1">{txn.currency || '—'}</p>
        </div>
      </div>

      {txn.paymentDescription ? (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</p>
          <p className="text-sm font-semibold text-slate-700 mt-1">{txn.paymentDescription}</p>
        </div>
      ) : null}
    </div>
  );
}

export function TransactionDetails({ isOpen, onClose, order }: TransactionDetailsProps) {
  const orderId = order?.id ?? null;
  const [refundTransactionId, setRefundTransactionId] = useState<number | null>(null);
  const [refundTransactionAmount, setRefundTransactionAmount] = useState<number | null>(null);
  const [refundOpen, setRefundOpen] = useState(false);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = usePaymentTransactions(orderId, isOpen);

  const processRefundMutation = useProcessPaymentRefund();
  const isRefunding = processRefundMutation.isPending;

  const transactions = response?.data ?? [];

  const selectedTransaction = useMemo(
    () => transactions.find((t) => t.id === refundTransactionId) ?? null,
    [transactions, refundTransactionId]
  );

  const openRefund = (transactionId: number, amount: number) => {
    setRefundTransactionId(transactionId);
    setRefundTransactionAmount(amount);
    setRefundOpen(true);
  };

  const closeRefundDrawer = () => {
    if (isRefunding) return;
    setRefundOpen(false);
    setRefundTransactionId(null);
    setRefundTransactionAmount(null);
  };

  const handleConfirmRefund = async (values: RefundFormValues) => {
    if (!order?.id || !refundTransactionId) return;

    const refundAmount = Number(values.refundAmount);
    if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
      throw new Error('Refund amount must be greater than zero.');
    }

    const apiResponse = await processRefundMutation.mutateAsync({
      transactionId: refundTransactionId,
      orderId: order.id,
      refundAmount,
      refundReason: values.refundReason,
      processedBy: values.processedBy,
      remarks: values.remarks || undefined,
    });

    if (apiResponse.response === false) {
      throw new Error(apiResponse.message || 'Failed to process refund.');
    }

    toast.success(
      apiResponse.message?.trim() ||
        `Refund processed for transaction #${refundTransactionId}.`
    );
    setRefundOpen(false);
    setRefundTransactionId(null);
    setRefundTransactionAmount(null);
    void refetch();
  };

  return (
    <>
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Receipt className="text-white" size={22} />
          <span>
            Payment <span className="text-emerald-200">Transactions</span>
          </span>
        </div>
      }
      description={`Order: ${order?.orderNumber ?? '—'}`}
      maxWidth="xl"
      footer={
        <div className="flex flex-wrap gap-3 w-full justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isRefunding}
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
          <p className="text-sm font-medium">Loading payment transactions…</p>
        </div>
      ) : isError ? (
        <div className="py-12 text-center space-y-3">
          <p className="text-sm font-semibold text-rose-600">
            {error instanceof Error ? error.message : 'Failed to load payment transactions.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-slate-200">
          <Receipt className="mx-auto text-slate-200 mb-3" size={36} />
          <p className="text-sm font-semibold text-slate-500">No payment transactions found for this order.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Mode</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Receipt</th>
                  <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(txn.paymentDate)}</td>
                    <td className="px-4 py-3 text-sm font-black text-slate-900">{formatCurrency(txn.amount, txn.currency)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{txn.paymentMode}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{txn.paymentType}</td>
                    <td className="px-4 py-3">
                      <Badge variant={paymentStatusVariant(txn.paymentStatus)} className="text-[9px] font-bold">
                        {txn.paymentStatus}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-600">{txn.receiptNumber || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      {canRefund(txn) ? (
                        <>
                          <Button 
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-slate-200 text-slate-600 font-bold"
                            onClick={() => openRefund(txn.id, txn.amount)}
                          >
                            Refund
                          </Button>
                        </>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Transaction Details</h3>
            {transactions.map((txn) => (
              <TransactionCard key={`detail-${txn.id}`} txn={txn} onRefund={openRefund} />
            ))}
          </div>
        </div>
      )}
    </RightDrawer>

      <Refunds
        isOpen={refundOpen}
        onClose={closeRefundDrawer}
        order={order}
        transactionId={refundTransactionId}
        transactionAmount={refundTransactionAmount}
        selectedTransaction={selectedTransaction}
        isSubmitting={isRefunding}
        onSubmit={handleConfirmRefund}
      />
    </>
  );
}

export default TransactionDetails;
