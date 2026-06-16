'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowRightLeft,
  Clock,
  XCircle,
  CheckCircle,
  FileText,
  Calendar,
  Building2,
  TrendingUp,
  Activity,
  Loader2,
  IndianRupee,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Table from '@/components/ui/table';
import {
  useAllPayments,
  usePaymentSearch,
  usePaymentStatistics,
  usePaymentsByMode,
  usePaymentTransactionsByInvoice,
} from '@/app/Apis/booking/usePayments';
import {
  looksLikeInvoiceNumber,
  mapInvoiceTransactionsToRecords,
  normalizePaymentModeLabel,
  type PaymentSearchRecord,
  type PaymentTransactionsByInvoiceData,
} from '@/app/Apis/booking/payment-history';
import { usePatientsByIds } from '@/app/Apis/Patients/usePatientsByIds';
import { formatPatientFullName } from '@/app/Apis/Patients/patientDisplayUtils';

// ─── Data Types ──────────────────────────────────────────────────────────────

export interface PaymentHistory {
  id: number;

  // Patient Info
  patientId: number;
  patientName: string;
  patientCode: string;

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
  paymentType?: string;
  receiptNumber?: string;
  collectedBy?: string;
}

const PAGE_SIZE = 10;

function normalizePaymentStatus(status: string | null | undefined): PaymentHistory['status'] {
  const s = status?.toUpperCase() ?? '';
  if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'PAID') return 'Paid';
  if (s === 'PENDING') return 'Pending';
  if (s === 'FAILED' || s === 'REJECTED') return 'Failed';
  if (s === 'REFUNDED' || s === 'REFUND') return 'Refunded';
  return 'Paid';
}

function formatPaymentTypeLabel(type: string | null | undefined): string | undefined {
  const t = type?.trim();
  if (!t) return undefined;
  return t
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function mapPaymentRecordToHistory(
  record: PaymentSearchRecord,
  context?: { patientId?: number; patientName?: string; invoiceNumber?: string }
): PaymentHistory {
  const paymentDate = record.paymentDate ?? record.paymentDateTime ?? '';
  const paymentMode = normalizePaymentModeLabel(record.paymentMode) as PaymentHistory['paymentMode'];
  const isRefund =
    record.isRefund === true ||
    record.paymentType?.toUpperCase() === 'REFUND' ||
    record.paymentStatus?.toUpperCase() === 'REFUNDED';
  const displayAmount =
    isRefund && record.refundAmount != null && record.refundAmount > 0
      ? record.refundAmount
      : record.amount;
  const paymentTypeLabel = formatPaymentTypeLabel(record.paymentType);
  return {
    id: record.id,
    patientId: context?.patientId ?? record.patientId ?? 0,
    patientName: context?.patientName ?? record.patientName ?? '—',
    patientCode: record.patientCode ?? '—',
    invoiceId:
      context?.invoiceNumber ??
      record.invoiceNumber ??
      record.orderNumber ??
      (record.orderId ? `ORD-${record.orderId}` : '—'),
    visitType:
      record.visitType === 'OPD' || record.visitType === 'Diagnostic'
        ? record.visitType
        : 'Diagnostic',
    amount: displayAmount,
    paymentMode,
    transactionId:
      record.transactionId ?? record.receiptNumber ?? record.referenceNumber ?? undefined,
    discount: record.discount ?? undefined,
    tax: record.tax ?? undefined,
    netAmount: record.netAmount ?? displayAmount,
    paymentDate,
    createdAt: paymentDate,
    status: isRefund ? 'Refunded' : normalizePaymentStatus(record.paymentStatus),
    remarks:
      record.remarks ??
      record.refundReason ??
      record.paymentDescription ??
      undefined,
    paymentType: paymentTypeLabel,
    receiptNumber: record.receiptNumber ?? undefined,
    collectedBy: record.collectedBy ?? undefined,
  };
}

function mapInvoiceDetailToHistory(
  data: PaymentTransactionsByInvoiceData,
  patientName?: string
): PaymentHistory[] {
  const context = {
    patientId: data.patientId,
    patientName,
    invoiceNumber: data.invoiceNumber,
  };
  return mapInvoiceTransactionsToRecords(data).map((record) =>
    mapPaymentRecordToHistory(record, context)
  );
}

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

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function defaultStatisticsRange() {
  const year = new Date().getFullYear();
  return {
    startDate: `${year}-01-01`,
    endDate: todayIsoDate(),
  };
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
  const defaultRange = useMemo(() => defaultStatisticsRange(), []);
  const [search, setSearch] = useState('');
  const [visitTypeFilter, setVisitTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [paymentModeFilter, setPaymentModeFilter] = useState<string>('All');
  const [pageNo, setPageNo] = useState(0);
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const useModeApi = paymentModeFilter !== 'All';
  const invoiceSearchTerm =
    !useModeApi && debouncedSearch && looksLikeInvoiceNumber(debouncedSearch)
      ? debouncedSearch
      : null;
  const useInvoiceApi = Boolean(invoiceSearchTerm);
  const useSearchApi =
    !useModeApi && !useInvoiceApi && Boolean(debouncedSearch);

  const modeParams = useModeApi
    ? { paymentMode: paymentModeFilter, pageNo, pageSize: PAGE_SIZE }
    : null;

  const allParams =
    !useModeApi && !useSearchApi && !useInvoiceApi
      ? { pageNo, pageSize: PAGE_SIZE }
      : null;

  const searchParams = useSearchApi
    ? { searchTerm: debouncedSearch, pageNo, pageSize: PAGE_SIZE }
    : null;

  useEffect(() => {
    setPageNo(0);
  }, [paymentModeFilter, debouncedSearch]);

  const {
    data: allRes,
    isLoading: isAllLoading,
    isFetching: isAllFetching,
    isError: isAllError,
    error: allError,
  } = useAllPayments(allParams);

  const {
    data: searchRes,
    isLoading: isSearchLoading,
    isFetching: isSearchFetching,
    isError: isSearchError,
    error: searchError,
  } = usePaymentSearch(searchParams);

  const {
    data: modeRes,
    isLoading: isModeLoading,
    isFetching: isModeFetching,
    isError: isModeError,
    error: modeError,
  } = usePaymentsByMode(modeParams);

  const {
    data: invoiceRes,
    isLoading: isInvoiceLoading,
    isFetching: isInvoiceFetching,
    isError: isInvoiceError,
    error: invoiceError,
  } = usePaymentTransactionsByInvoice(invoiceSearchTerm);

  const invoiceDetail = invoiceRes?.data ?? null;
  const invoicePatientIds = useMemo(
    () => (invoiceDetail?.patientId ? [invoiceDetail.patientId] : []),
    [invoiceDetail?.patientId]
  );
  const { patientsById, isFetching: isFetchingInvoicePatient } =
    usePatientsByIds(invoicePatientIds);

  const invoicePatientName = useMemo(() => {
    if (!invoiceDetail?.patientId) return undefined;
    const patient = patientsById.get(invoiceDetail.patientId);
    return patient ? formatPatientFullName(patient) : undefined;
  }, [invoiceDetail?.patientId, patientsById]);

  const listRes = useModeApi
    ? modeRes
    : useInvoiceApi
      ? null
      : useSearchApi
        ? searchRes
        : allRes;
  const listPage =
    listRes?.data && !Array.isArray(listRes.data) ? listRes.data : null;

  const apiHistory = useMemo(() => {
    if (useInvoiceApi && invoiceDetail) {
      return mapInvoiceDetailToHistory(invoiceDetail, invoicePatientName);
    }
    return (listPage?.content ?? []).map((record) => mapPaymentRecordToHistory(record));
  }, [useInvoiceApi, invoiceDetail, invoicePatientName, listPage?.content]);

  const isListLoading = useModeApi
    ? isModeLoading
    : useInvoiceApi
      ? isInvoiceLoading
      : useSearchApi
        ? isSearchLoading
        : isAllLoading;
  const isListFetching = useModeApi
    ? isModeFetching
    : useInvoiceApi
      ? isInvoiceFetching || isFetchingInvoicePatient
      : useSearchApi
        ? isSearchFetching
        : isAllFetching;
  const isListError = useModeApi
    ? isModeError
    : useInvoiceApi
      ? isInvoiceError
      : useSearchApi
        ? isSearchError
        : isAllError;
  const listError = useModeApi
    ? modeError
    : useInvoiceApi
      ? invoiceError
      : useSearchApi
        ? searchError
        : allError;

  const dateRangeInvalid = Boolean(startDate && endDate) && startDate > endDate;
  const statisticsParams =
    startDate && endDate && !dateRangeInvalid ? { startDate, endDate } : null;

  const {
    data: statisticsRes,
    isLoading: isStatisticsLoading,
    isFetching: isStatisticsFetching,
    isError: isStatisticsError,
    error: statisticsError,
    refetch: refetchStatistics,
  } = usePaymentStatistics(statisticsParams);

  const statistics = statisticsRes?.data ?? null;

  const filteredHistory = apiHistory.filter((record) => {
    const matchesSearch =
      !search.trim() ||
      useSearchApi ||
      useInvoiceApi ||
      record.patientName.toLowerCase().includes(search.toLowerCase()) ||
      record.patientCode?.toLowerCase().includes(search.toLowerCase()) ||
      record.invoiceId?.toLowerCase().includes(search.toLowerCase()) ||
      record.transactionId?.toLowerCase().includes(search.toLowerCase()) ||
      record.remarks?.toLowerCase().includes(search.toLowerCase());

    const matchesVisitType = visitTypeFilter === 'All' || record.visitType === visitTypeFilter;
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;

    return matchesSearch && matchesVisitType && matchesStatus;
  });

  const totalElements = useInvoiceApi
    ? filteredHistory.length
    : (listPage?.totalElements ?? filteredHistory.length);
  const totalPages = useInvoiceApi ? 1 : (listPage?.totalPages ?? 0);
  const canPrev = !useInvoiceApi && pageNo > 0;
  const canNext =
    !useInvoiceApi &&
    (listPage?.last != null ? !listPage.last : pageNo + 1 < totalPages);

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
          <div className="text-xs text-slate-500">{row.patientCode}</div>
        </div>
      ),
    },
    {
      key: 'invoiceId',
      label: 'Invoice',
      render: (value: string, row: PaymentHistory) => (
        <div>
          <div className="font-bold text-slate-900 text-sm">{value}</div>
          <div className="text-xs text-slate-500">
            {row.paymentType ? row.paymentType : row.visitType}
            {row.receiptNumber ? ` · ${row.receiptNumber}` : ''}
          </div>
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
          <div
            className={`text-sm font-black ${
              row.status === 'Refunded' ? 'text-blue-600' : 'text-emerald-600'
            }`}
          >
            {row.status === 'Refunded' && value > 0 ? '−' : ''}
            {formatCurrency(value)}
          </div>
          {row.discount ? (
            <div className="text-xs text-slate-500">
              Discount: {formatCurrency(row.discount)}
            </div>
          ) : null}
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

  const statCards = [
    {
      label: 'Net Collection',
      value: statistics ? formatCurrency(statistics.netCollection) : '—',
      icon: IndianRupee,
      tone: 'text-emerald-600',
      bg: 'bg-emerald-400/30',
    },
    {
      label: 'Total Collected',
      value: statistics ? formatCurrency(statistics.totalCollected) : '—',
      icon: TrendingUp,
      tone: 'text-emerald-700',
      bg: 'bg-emerald-400/30',
    },
    {
      label: 'Total Transactions',
      value: statistics != null ? String(statistics.totalTransactions) : '—',
      icon: Activity,
      tone: 'text-[#FF671F]',
      bg: 'bg-blue-400/30',
    },
    {
      label: 'Successful',
      value: statistics != null ? String(statistics.successfulTransactions) : '—',
      icon: CheckCircle,
      tone: 'text-green-700',
      bg: 'bg-green-400/30',
    },
    {
      label: 'Failed',
      value: statistics != null ? String(statistics.failedTransactions) : '—',
      icon: XCircle,
      tone: 'text-rose-600',
      bg: 'bg-rose-400/30',
    },
    {
      label: 'Total Refunded',
      value: statistics ? formatCurrency(statistics.totalRefunded) : '—',
      icon: ArrowDownLeft,
      tone: 'text-blue-700',
      bg: 'bg-blue-400/30',
    },
    {
      label: 'Refund Transactions',
      value: statistics != null ? String(statistics.refundTransactions) : '—',
      icon: RefreshCcw,
      tone: 'text-indigo-700',
      bg: 'bg-indigo-400/30',
    },
  ];

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

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-end gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              max={endDate || todayIsoDate()}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-refined w-full py-2.5 px-4 font-bold"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              max={todayIsoDate()}
              onChange={(e) => setEndDate(e.target.value)}
              className="input-refined w-full py-2.5 px-4 font-bold"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => void refetchStatistics()}
          disabled={!statisticsParams || isStatisticsFetching}
          className="inline-flex items-center justify-center gap-2 rounded-xl custom-gradient text-white font-bold px-5 py-2.5 disabled:opacity-60"
        >
          {isStatisticsFetching ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
          Refresh stats
        </button>
      </div>

      {dateRangeInvalid ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          Start date must be on or before end date.
        </div>
      ) : null}

      {isStatisticsError ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          {statisticsError instanceof Error
            ? statisticsError.message
            : 'Failed to load payment statistics.'}
        </div>
      ) : null}

      {/* Stats — single row inside one panel */}
      <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/20 shadow-sm mb-6">
        {isStatisticsLoading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-slate-400">
            <Loader2 size={20} className="animate-spin" />
            <span className="text-sm font-semibold">Loading statistics…</span>
          </div>
        ) : (
          <div className="flex flex-nowrap items-stretch gap-0 overflow-x-auto pb-1 scrollbar-thin">
            {statCards.map((card, index) => {
              const Icon = card.icon;
              const isMoney =
                card.label.includes('Refunded') ||
                card.label.includes('Collected') ||
                card.label === 'Net Collection';
              return (
                <div
                  key={card.label}
                  className={`flex min-w-[9.5rem] flex-1 flex-col items-center justify-center px-3 py-1 text-center sm:min-w-0 ${
                    index < statCards.length - 1
                      ? 'border-r border-slate-200/70'
                      : ''
                  }`}
                >
                  <div className={`mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${card.bg}`}>
                    <Icon size={18} className={card.tone} />
                  </div>
                  <span className="mb-1 text-[10px] font-bold uppercase leading-tight tracking-wider text-slate-500">
                    {card.label}
                  </span>
                  <span
                    className={`text-lg font-black leading-none sm:text-xl ${
                      isMoney ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {card.value}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center gap-4 mb-6">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by invoice (e.g. DCL-INV-2026-001), patient, or phone..."
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
              onChange={(e) => {
                setPaymentModeFilter(e.target.value);
                setPageNo(0);
              }}
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

      {useInvoiceApi && invoiceDetail ? (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                Invoice payment summary
              </p>
              <p className="mt-1 font-mono text-lg font-bold text-slate-900">
                {invoiceDetail.invoiceNumber}
              </p>
              <p className="text-xs font-medium text-slate-500">
                Order #{invoiceDetail.orderId}
                {invoiceDetail.orderDate ? ` · ${formatDate(invoiceDetail.orderDate)}` : ''}
                {invoicePatientName ? ` · ${invoicePatientName}` : ''}
              </p>
            </div>
            <Badge
              className={`${getStatusColor(
                normalizePaymentStatus(invoiceDetail.paymentStatus)
              )} border font-bold`}
            >
              {invoiceDetail.paymentStatus ?? '—'}
            </Badge>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { label: 'Total', value: invoiceDetail.totalAmount },
              { label: 'Net', value: invoiceDetail.netAmount },
              { label: 'Paid', value: invoiceDetail.paidAmount },
              { label: 'Pending', value: invoiceDetail.pendingAmount ?? 0 },
              { label: 'Refunded', value: invoiceDetail.refundedAmount ?? 0 },
              { label: 'Discount', value: invoiceDetail.discountAmount ?? 0 },
              { label: 'Concession', value: invoiceDetail.concessionAmount ?? 0 },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-white/80 bg-white px-3 py-2 text-center"
              >
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {item.label}
                </p>
                <p className="text-sm font-black text-slate-900">{formatCurrency(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {isListError ? (
          <div className="px-6 py-10 text-center text-sm font-semibold text-rose-600">
            {listError instanceof Error ? listError.message : 'Failed to load payments.'}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filteredHistory}
            loading={isListLoading || isListFetching}
          />
        )}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredHistory.length} of {totalElements} payments
            {useModeApi
              ? ` (${paymentModeFilter})`
              : useInvoiceApi
                ? ` (invoice: ${invoiceSearchTerm})`
                : useSearchApi
                  ? ' (search)'
                  : ''}
          </span>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500">
              Total Collected:{' '}
              <span className="text-emerald-600">
                {formatCurrency(
                  filteredHistory.reduce(
                    (sum, h) =>
                      h.status === 'Refunded' ? sum - h.netAmount : sum + h.netAmount,
                    0
                  )
                )}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageNo((p) => Math.max(0, p - 1))}
                disabled={!canPrev || isListFetching}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Page {pageNo + 1} of {Math.max(totalPages, 1)}
              </span>
              <button
                type="button"
                onClick={() => setPageNo((p) => p + 1)}
                disabled={!canNext || isListFetching}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}