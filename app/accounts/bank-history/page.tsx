'use client';

import { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Clock,
  XCircle,
  CheckCircle,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Table from '@/components/ui/table';
// ─── Data Types ──────────────────────────────────────────────────────────────

export interface BankHistory {
  id: number;

  // Bank Info
  bankId: number;
  bankName: string;

  // Transaction Info
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;

  // Transfer-specific (optional)
  fromBank?: string;
  toBank?: string;

  // Details
  referenceNumber?: string;
  description?: string;

  // Dates
  transactionDate: string; // ISO format
  createdAt: string;

  // Status
  status: 'Success' | 'Pending' | 'Failed';

  // Balance Tracking
  balanceAfterTransaction?: number;
}

export const SAMPLE_BANK_HISTORY: BankHistory[] = [
  {
    id: 1,
    bankId: 1,
    bankName: 'State Bank of India',
    type: 'Deposit',
    amount: 5000,
    referenceNumber: 'TXN12345',
    description: 'Patient payment deposit',
    transactionDate: '2026-03-25T10:30:00Z',
    createdAt: '2026-03-25T10:30:00Z',
    status: 'Success',
    balanceAfterTransaction: 15000,
  },
  {
    id: 2,
    bankId: 1,
    bankName: 'State Bank of India',
    type: 'Withdrawal',
    amount: 2000,
    referenceNumber: 'TXN12346',
    description: 'Lab equipment purchase',
    transactionDate: '2026-03-25T12:00:00Z',
    createdAt: '2026-03-25T12:00:00Z',
    status: 'Success',
    balanceAfterTransaction: 13000,
  },
  {
    id: 3,
    bankId: 2,
    bankName: 'HDFC Bank',
    type: 'Transfer',
    amount: 3000,
    fromBank: 'HDFC Bank',
    toBank: 'ICICI Bank',
    referenceNumber: 'TXN12347',
    description: 'Fund transfer',
    transactionDate: '2026-03-25T14:00:00Z',
    createdAt: '2026-03-25T14:00:00Z',
    status: 'Pending',
    balanceAfterTransaction: 7000,
  },
];
// ─── Utilities ────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'Success': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Failed': return 'bg-rose-100 text-rose-700 border-rose-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'Deposit': return 'text-emerald-600';
    case 'Withdrawal': return 'text-rose-600';
    case 'Transfer': return 'text-blue-600';
    default: return 'text-slate-600';
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTransactionIcon(type: string) {
  switch (type) {
    case 'Deposit': return <ArrowDownLeft size={16} />;
    case 'Withdrawal': return <ArrowUpRight size={16} />;
    case 'Transfer': return <ArrowRightLeft size={16} />;
    default: return <Activity size={16} />;
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function BankHistoryPage() {
  const [history, setHistory] = useState<BankHistory[]>(SAMPLE_BANK_HISTORY);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('All');

  const filteredHistory = history.filter(record => {
    const matchesSearch =
      record.bankName.toLowerCase().includes(search.toLowerCase()) ||
      record.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      record.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'All' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    const matchesDateRange = dateRangeFilter === 'All'; // Can be enhanced with actual date range logic
    
    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  });

  const columns = [
    {
      key: 'transactionDate',
      label: 'Date & Time',
      render: (value: string, row: BankHistory) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-slate-400" />
            <span className="font-bold text-slate-900 text-sm">{formatDate(value)}</span>
          </div>
          <div className="text-xs text-slate-500">
            {new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (value: string, row: BankHistory) => (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-slate-100 ${getTypeColor(value)}`}>
            {getTransactionIcon(value)}
          </div>
          <span className="font-bold text-slate-900">{value}</span>
        </div>
      ),
    },
    {
      key: 'bankName',
      label: 'Bank Details',
      render: (_: any, row: BankHistory) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={14} className="text-slate-400" />
            <span className="font-bold text-slate-900">{row.bankName}</span>
          </div>
          {row.type === 'Transfer' && row.fromBank && row.toBank && (
            <div className="text-[10px] text-slate-500">
              {row.fromBank} → {row.toBank}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (value: string, row: BankHistory) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{value || '—'}</div>
          {row.referenceNumber && (
            <div className="text-[10px] text-slate-500 font-mono">
              Ref: {row.referenceNumber}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right' as const,
      render: (value: number, row: BankHistory) => (
        <div className="text-right">
          <div className={`text-sm font-black ${getTypeColor(row.type)}`}>
            {row.type === 'Deposit' ? '+' : '-'}{formatCurrency(value)}
          </div>
        </div>
      ),
    },
    {
      key: 'balanceAfterTransaction',
      label: 'Balance After',
      align: 'right' as const,
      render: (value: number) => (
        <div className="text-right">
          <div className="text-sm font-black text-slate-900">
            {formatCurrency(value)}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (value: string, row: BankHistory) => (
        <Badge className={`${getStatusColor(value)} border font-bold`}>
          {value === 'Success' && <CheckCircle size={12} className="mr-1" />}
          {value === 'Pending' && <Clock size={12} className="mr-1" />}
          {value === 'Failed' && <XCircle size={12} className="mr-1" />}
          {value}
        </Badge>
      ),
    },
  ];

  const stats = {
    totalTransactions: history.length,
    totalDeposits: history.filter(h => h.type === 'Deposit').reduce((sum, h) => sum + h.amount, 0),
    totalWithdrawals: history.filter(h => h.type === 'Withdrawal').reduce((sum, h) => sum + h.amount, 0),
    pendingTransactions: history.filter(h => h.status === 'Pending').length,
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <FileText size={28} className="text-emerald-600" />
            Bank Transaction History
          </h1>
          <p className="text-sm text-slate-500">Track all bank transactions and transfers</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/30 flex items-center justify-center">
              <Activity size={20} className="text-blue-600" />
            </div>
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Total Transactions</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalTransactions}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Total Deposits</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalDeposits)}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-rose-400/30 flex items-center justify-center">
              <TrendingDown size={20} className="text-rose-600" />
            </div>
            <span className="text-rose-700 font-bold text-xs uppercase tracking-wider">Total Withdrawals</span>
          </div>
          <div className="text-2xl font-black text-rose-600">{formatCurrency(stats.totalWithdrawals)}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.pendingTransactions}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by bank, reference, or description..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Types</option>
              <option value="Deposit">Deposit</option>
              <option value="Withdrawal">Withdrawal</option>
              <option value="Transfer">Transfer</option>
            </select>
          </div>
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Status</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <Table columns={columns} data={filteredHistory} />
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredHistory.length} of {history.length} Transactions
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            Net Flow: <span className={stats.totalDeposits >= stats.totalWithdrawals ? 'text-emerald-600' : 'text-rose-600'}>
              {formatCurrency(stats.totalDeposits - stats.totalWithdrawals)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}