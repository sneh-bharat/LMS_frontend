'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Receipt } from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Table } from '@/components/ui';
import {
  formatMemberCardCurrency,
  formatMemberCardDate,
  formatMemberCardLabel,
  getMemberCardTransactionAmount,
  getMemberCardTransactionDate,
  getMemberCardTransactionDescription,
  getMemberCardTransactionReference,
  getMemberCardTransactionStatus,
  getMemberCardTransactionType,
  type MemberCardTransaction,
} from '@/app/Apis/membership/membership';
import { useMemberCardTransactions } from '@/app/Apis/membership/useMembership';

const PAGE_SIZE = 10;

export interface MemberCardTransactionsDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  cardId: number | null;
  cardLabel?: string;
}

function transactionStatusVariant(status: string) {
  const s = status.toUpperCase().replace(/\s+/g, '_');
  if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'ACTIVE' || s === 'CREDIT') {
    return 'success' as const;
  }
  if (s === 'PENDING' || s === 'PROCESSING') return 'warning' as const;
  if (s === 'FAILED' || s === 'REJECTED' || s === 'DEBIT' || s === 'CANCELLED') {
    return 'destructive' as const;
  }
  return 'secondary' as const;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  return formatMemberCardDate(value);
}

function TransactionCard({ txn }: { txn: MemberCardTransaction }) {
  const amount = getMemberCardTransactionAmount(txn);
  const status = getMemberCardTransactionStatus(txn);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Transaction reference
          </p>
          <p className="text-sm font-bold font-mono text-slate-900 mt-1">
            {getMemberCardTransactionReference(txn)}
          </p>
        </div>
        <Badge variant={transactionStatusVariant(status)} className="text-[10px] font-bold">
          {formatMemberCardLabel(status)}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</p>
          <p className="font-black text-slate-900 mt-1">
            {amount != null ? formatMemberCardCurrency(amount) : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</p>
          <p className="font-bold text-slate-900 mt-1">
            {formatMemberCardLabel(getMemberCardTransactionType(txn))}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p>
          <p className="font-bold text-slate-900 mt-1">
            {formatDateTime(getMemberCardTransactionDate(txn))}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Payment mode
          </p>
          <p className="font-bold text-slate-900 mt-1">{txn.paymentMode?.trim() || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Balance before
          </p>
          <p className="font-bold text-slate-900 mt-1">
            {txn.balanceBefore != null || txn.openingBalance != null
              ? formatMemberCardCurrency(txn.balanceBefore ?? txn.openingBalance)
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Balance after
          </p>
          <p className="font-bold text-slate-900 mt-1">
            {txn.balanceAfter != null || txn.closingBalance != null
              ? formatMemberCardCurrency(txn.balanceAfter ?? txn.closingBalance)
              : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Created by
          </p>
          <p className="font-bold text-slate-900 mt-1">
            {txn.createdByName?.trim() || txn.createdBy?.trim() || '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Currency
          </p>
          <p className="font-bold text-slate-900 mt-1">{txn.currency?.trim() || 'INR'}</p>
        </div>
      </div>

      {getMemberCardTransactionDescription(txn) !== '—' ? (
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Description
          </p>
          <p className="text-sm font-semibold text-slate-700 mt-1">
            {getMemberCardTransactionDescription(txn)}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default function MemberCardTransactionsDetails({
  isOpen,
  onClose,
  cardId,
  cardLabel,
}: MemberCardTransactionsDetailsProps) {
  const [pageNo, setPageNo] = useState(0);

  useEffect(() => {
    if (isOpen) setPageNo(0);
  }, [isOpen, cardId]);

  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useMemberCardTransactions(
    cardId,
    { pageNo, pageSize: PAGE_SIZE },
    { enabled: isOpen && cardId != null && cardId > 0 }
  );

  const page = response?.data;
  const transactions = page?.content ?? [];
  const totalPages = page?.totalPages ?? 1;
  const totalElements = page?.totalElements ?? 0;
  const canPrev = pageNo > 0;
  const canNext = page?.last != null ? !page.last : pageNo + 1 < totalPages;

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Receipt className="text-white" size={22} aria-hidden />
          <span>
            Card <span className="text-emerald-200">Transactions</span>
          </span>
        </div>
      }
      description={`Card: ${cardLabel ?? (cardId != null ? `#${cardId}` : '—')}`}
      maxWidth="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Page {pageNo + 1} of {Math.max(totalPages, 1)}
            <span className="text-slate-400 font-semibold normal-case tracking-normal ml-2">
              · {totalElements} transaction{totalElements === 1 ? '' : 's'}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200 bg-white"
              disabled={!canPrev || isFetching}
              onClick={() => setPageNo((p) => Math.max(0, p - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200 bg-white"
              disabled={!canNext || isFetching}
              onClick={() => setPageNo((p) => p + 1)}
            >
              Next
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 text-slate-600 font-bold"
            >
              Close
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
          <Loader2 size={32} className="animate-spin text-emerald-600" aria-hidden />
          <p className="text-sm font-medium">Loading card transactions…</p>
        </div>
      ) : isError ? (
        <div className="py-12 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-rose-500" aria-hidden />
          <p className="text-sm font-semibold text-rose-600">
            {error instanceof Error ? error.message : 'Failed to load card transactions.'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={() => void refetch()}>
            Retry
          </Button>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-slate-200">
          <Receipt className="mx-auto text-slate-200 mb-3" size={36} aria-hidden />
          <p className="text-sm font-semibold text-slate-500">
            No transactions found for this member card.
          </p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <Table>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Reference
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((txn) => {
                  const amount = getMemberCardTransactionAmount(txn);
                  const status = getMemberCardTransactionStatus(txn);
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDateTime(getMemberCardTransactionDate(txn))}
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-slate-900">
                        {amount != null ? formatMemberCardCurrency(amount) : '—'}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                        {formatMemberCardLabel(getMemberCardTransactionType(txn))}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={transactionStatusVariant(status)} className="text-[9px] font-bold">
                          {formatMemberCardLabel(status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-slate-600">
                        {getMemberCardTransactionReference(txn)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
              Transaction details
            </h3>
            {transactions.map((txn) => (
              <TransactionCard key={`detail-${txn.id}`} txn={txn} />
            ))}
          </div>
        </div>
      )}
    </RightDrawer>
  );
}
