'use client';

import * as React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Activity,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/common';
import { formatCurrency, formatDate, formatTime } from '@/lib/format';
import type { BankHistory } from '../types/accounts.types';
import { TRANSACTION_STATUS_COLORS, TRANSACTION_TYPE_COLORS } from '../constants/bank-history';

function transactionIcon(type: string) {
  switch (type) {
    case 'Deposit':
      return <ArrowDownLeft size={16} />;
    case 'Withdrawal':
      return <ArrowUpRight size={16} />;
    case 'Transfer':
      return <ArrowRightLeft size={16} />;
    default:
      return <Activity size={16} />;
  }
}

function statusIcon(status: string) {
  switch (status) {
    case 'Success':
      return <CheckCircle size={12} className="mr-1" />;
    case 'Pending':
      return <Clock size={12} className="mr-1" />;
    case 'Failed':
      return <XCircle size={12} className="mr-1" />;
    default:
      return null;
  }
}

export interface BankHistoryTableProps {
  data: BankHistory[];
  loading?: boolean;
}

export function BankHistoryTable({ data, loading }: BankHistoryTableProps) {
  const columns = React.useMemo<DataTableColumn<BankHistory>[]>(
    () => [
      {
        key: 'transactionDate',
        label: 'Date & Time',
        render: (row) => (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-sm font-bold text-slate-900">
                {formatDate(row.transactionDate)}
              </span>
            </div>
            <div className="text-xs text-slate-500">{formatTime(row.transactionDate)}</div>
          </div>
        ),
      },
      {
        key: 'type',
        label: 'Type',
        render: (row) => (
          <div className="flex items-center gap-2">
            <div className={`rounded-lg bg-slate-100 p-1.5 ${TRANSACTION_TYPE_COLORS[row.type] ?? ''}`}>
              {transactionIcon(row.type)}
            </div>
            <span className="font-bold text-slate-900">{row.type}</span>
          </div>
        ),
      },
      {
        key: 'bankName',
        label: 'Bank Details',
        render: (row) => (
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Building2 size={14} className="text-slate-400" />
              <span className="font-bold text-slate-900">{row.bankName}</span>
            </div>
            {row.type === 'Transfer' && row.fromBank && row.toBank ? (
              <div className="text-[10px] text-slate-500">
                {row.fromBank} → {row.toBank}
              </div>
            ) : null}
          </div>
        ),
      },
      {
        key: 'description',
        label: 'Description',
        render: (row) => (
          <div>
            <div className="text-sm font-bold text-slate-900">{row.description || '—'}</div>
            {row.referenceNumber ? (
              <div className="font-mono text-[10px] text-slate-500">Ref: {row.referenceNumber}</div>
            ) : null}
          </div>
        ),
      },
      {
        key: 'amount',
        label: 'Amount',
        align: 'right',
        render: (row) => (
          <div className={`text-sm font-black ${TRANSACTION_TYPE_COLORS[row.type] ?? ''}`}>
            {row.type === 'Deposit' ? '+' : '-'}
            {formatCurrency(row.amount)}
          </div>
        ),
      },
      {
        key: 'balanceAfterTransaction',
        label: 'Balance After',
        align: 'right',
        render: (row) => (
          <div className="text-sm font-black text-slate-900">
            {formatCurrency(row.balanceAfterTransaction)}
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => (
          <Badge className={`${TRANSACTION_STATUS_COLORS[row.status] ?? ''} border font-bold`}>
            {statusIcon(row.status)}
            {row.status}
          </Badge>
        ),
      },
    ],
    [],
  );

  return <DataTable columns={columns} data={data} loading={loading} rowKey={(row) => row.id} />;
}

export default BankHistoryTable;
