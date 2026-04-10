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

export interface PaymentHistory {
  id: number;

  // Patient Info
  patientId: number;
  patientName: string;
  mobileNumber: string;

  // Invoice Info
  invoiceId: string;
  visitType: 'OPD' | 'Diagnostic';

  // Payment Details
  amount: number;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Bank Transfer';
  transactionId?: string;

  // Optional Breakdown
  discount?: number;
  tax?: number;
  netAmount: number;

  // Dates
  paymentDate: string; // ISO format
  createdAt: string;

  // Status
  status: 'Paid' | 'Pending' | 'Failed' | 'Refunded';

  // Extra Info
  remarks?: string;
}

export const SAMPLE_PAYMENT_HISTORY: PaymentHistory[] = [
  {
    id: 1,
    patientId: 101,
    patientName: 'Rahul Sharma',
    mobileNumber: '9876543210',
    invoiceId: 'INV-1001',
    visitType: 'Diagnostic',
    amount: 1500,
    paymentMode: 'UPI',
    transactionId: 'UPI123456',
    discount: 100,
    tax: 50,
    netAmount: 1450,
    paymentDate: '2026-03-25T10:00:00Z',
    createdAt: '2026-03-25T10:00:00Z',
    status: 'Paid',
    remarks: 'Blood test payment',
  },
  {
    id: 2,
    patientId: 102,
    patientName: 'Priya Das',
    mobileNumber: '9123456780',
    invoiceId: 'INV-1002',
    visitType: 'OPD',
    amount: 500,
    paymentMode: 'Cash',
    netAmount: 500,
    paymentDate: '2026-03-25T11:30:00Z',
    createdAt: '2026-03-25T11:30:00Z',
    status: 'Paid',
  },
  {
    id: 3,
    patientId: 103,
    patientName: 'Amit Khan',
    mobileNumber: '9988776655',
    invoiceId: 'INV-1003',
    visitType: 'Diagnostic',
    amount: 2000,
    paymentMode: 'Card',
    transactionId: 'CARD78910',
    netAmount: 2000,
    paymentDate: '2026-03-25T12:45:00Z',
    createdAt: '2026-03-25T12:45:00Z',
    status: 'Pending',
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'Paid': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Failed': return 'bg-rose-100 text-rose-700 border-rose-200';
    case 'Refunded': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-slate-100 text-slate-600 border-slate-200';
  }
}

function getPaymentModeColor(mode: string): string {
  switch (mode) {
    case 'Cash': return 'text-green-600';
    case 'Card': return 'text-blue-600';
    case 'UPI': return 'text-purple-600';
    case 'Bank Transfer': return 'text-indigo-600';
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
  });
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentModeIcon(mode: string) {
  switch (mode) {
    case 'Cash': return <ArrowDownLeft size={16} />;
    case 'Card': return <ArrowRightLeft size={16} />;
    case 'UPI': return <Activity size={16} />;
    case 'Bank Transfer': return <Building2 size={16} />;
    default: return <Activity size={16} />;
  }
}

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PaymentHistoryPage() {
  const [history, setHistory] = useState<PaymentHistory[]>(SAMPLE_PAYMENT_HISTORY);
  const [search, setSearch] = useState('');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('All');

  const filteredHistory = history.filter(record => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(search.toLowerCase()) ||
      record.mobileNumber?.toLowerCase().includes(search.toLowerCase()) ||
      record.invoiceId?.toLowerCase().includes(search.toLowerCase());
    
    const matchesVisitType = visitTypeFilter === 'All' || record.visitType === visitTypeFilter;
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    const matchesPaymentMode = paymentModeFilter === 'All' || record.paymentMode === paymentModeFilter;
    
    return matchesSearch && matchesVisitType && matchesStatus && matchesPaymentMode;
  });

  const columns = [
    {
      key: 'paymentDate',
      label: 'Date & Time',
      render: (value: string, row: PaymentHistory) => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={14} className="text-slate-400" />
            <span className="font-bold text-slate-900 text-sm">{formatDate(value)}</span>
          </div>
          <div className="text-xs text-slate-500">
            {formatTime(value)}
          </div>
        </div>
      ),
    },
    {
      key: 'patientName',
      label: 'Patient Name',
      render: (value: string, row: PaymentHistory) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{value}</div>
          <div className="text-xs text-slate-500">{row.mobileNumber}</div>
        </div>
      ),
    },
    {
      key: 'invoiceId',
      label: 'Invoice',
      render: (value: string, row: PaymentHistory) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{value}</div>
          <div className="text-xs text-slate-500">{row.visitType}</div>
        </div>
      ),
    },
    {
      key: 'paymentMode',
      label: 'Payment Mode',
      render: (value: string, row: PaymentHistory) => (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-slate-100 ${getPaymentModeColor(value)}`}>
            {getPaymentModeIcon(value)}
          </div>
          <span className="font-bold text-slate-900 text-sm">{value}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      align: 'right' as const,
      render: (value: number, row: PaymentHistory) => (
        <div className="text-right">
          <div className="text-sm font-black text-emerald-600">
            {formatCurrency(value)}
          </div>
          {row.discount && (
            <div className="text-xs text-slate-500">
              Discount: {formatCurrency(row.discount)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'netAmount',
      label: 'Net Amount',
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
      render: (value: string, row: PaymentHistory) => (
        <Badge className={`${getStatusColor(value)} border font-bold`}>
          {value === 'Paid' && <CheckCircle size={12} className="mr-1" />}
          {value === 'Pending' && <Clock size={12} className="mr-1" />}
          {value === 'Failed' && <XCircle size={12} className="mr-1" />}
          {value === 'Refunded' && <ArrowDownLeft size={12} className="mr-1" />}
          {value}
        </Badge>
      ),
    },
  ];

  const stats = {
    totalPayments: history.length,
    totalAmount: history.reduce((sum, h) => sum + h.netAmount, 0),
    paidPayments: history.filter(h => h.status === 'Paid').length,
    pendingPayments: history.filter(h => h.status === 'Pending').length,
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1 flex items-center gap-2">
            <FileText size={28} className="text-[#FF671F]" />
            Payment History
          </h1>
          <p className="text-sm text-slate-500">Track all patient payments and invoices</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-400/30 flex items-center justify-center">
              <Activity size={20} className="text-[#FF671F]" />
            </div>
            <span className="text-blue-700 font-bold text-xs uppercase tracking-wider">Total Payments</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.totalPayments}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-[#FF671F]" />
            </div>
            <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">Total Amount</span>
          </div>
          <div className="text-2xl font-black text-emerald-600">{formatCurrency(stats.totalAmount)}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-400/30 flex items-center justify-center">
              <CheckCircle size={20} className="text-[#FF671F]" />
            </div>
            <span className="text-green-700 font-bold text-xs uppercase tracking-wider">Paid</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.paidPayments}</div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/30 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <span className="text-amber-700 font-bold text-xs uppercase tracking-wider">Pending</span>
          </div>
          <div className="text-3xl font-black text-slate-900">{stats.pendingPayments}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, phone, or invoice..."
            className="input-refined w-full py-2.5 pl-12 pr-4 font-bold"
          />
        </div>
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={visitTypeFilter}
              onChange={(e) => setVisitTypeFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Visit Types</option>
              <option value="OPD">OPD</option>
              <option value="Diagnostic">Diagnostic</option>
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
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>
          <div className="relative flex-1 lg:w-40 group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <select
              value={paymentModeFilter}
              onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="input-refined w-full py-2.5 pl-10 pr-10 text-[10px] font-bold uppercase tracking-wider appearance-none"
            >
              <option value="All">All Payment Modes</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <Table columns={columns} data={filteredHistory} />
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredHistory.length} of {history.length} Payments
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            Total Collected: <span className='text-emerald-600'>
              {formatCurrency(filteredHistory.reduce((sum, h) => sum + h.netAmount, 0))}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}