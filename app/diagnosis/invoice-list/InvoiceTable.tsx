'use client';

import { useRouter } from 'next/navigation';
import {
  FileText,
  ArrowRightCircle,
  Trash2,
  Ban,
  ClipboardList,
  AlertCircle,
  Database,
  Activity,
  CreditCard,
  Wallet,
  Receipt,
  FlaskConical,
} from 'lucide-react';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { Invoice } from './types';

export interface InvoiceTablePagination {
  pageNo: number;
  totalPages: number;
  totalElements: number;
  canPrev: boolean;
  canNext: boolean;
  isFetching?: boolean;
  onPrev: () => void;
  onNext: () => void;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  hasLoadedRows?: boolean;
  searchActive?: boolean;
  emptyMessage?: string;
  pagination?: InvoiceTablePagination;
  onViewInvoice?: (invoice: Invoice) => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
  onCancelInvoice?: (invoice: Invoice) => void;
  onViewCancellationDetails?: (invoice: Invoice) => void;
  onTrackOrderLifecycle?: (invoice: Invoice) => void;
  onViewPaymentSummary?: (invoice: Invoice) => void;
  onViewTransactions?: (invoice: Invoice) => void;
  onProcessPayment?: (invoice: Invoice) => void;
  onRegisterSample?: (invoice: Invoice) => void;
  isDeleting?: boolean;
  isProcessingPayment?: boolean;
  selectedIds?: number[];
  onToggleSelect?: (invoiceId: number) => void;
  onToggleSelectAll?: () => void;
  allPageSelected?: boolean;
  somePageSelected?: boolean;
}

const COL_COUNT = 9;

function statusBadgeVariant(status?: string) {
  const s = status?.toUpperCase();
  if (s === 'PAID' || s === 'COMPLETED' || s === 'ACTIVE') return 'success';
  if (s === 'UNPAID') return 'destructive';
  if (s === 'PENDING') return 'warning';
  return 'secondary';
}

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatReceptionDate(value: string) {
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

export default function InvoiceTable({
  invoices,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  hasLoadedRows,
  searchActive,
  emptyMessage,
  pagination,
  onViewInvoice,
  onDeleteInvoice,
  onCancelInvoice,
  onViewCancellationDetails,
  onTrackOrderLifecycle,
  onViewPaymentSummary,
  onViewTransactions,
  onProcessPayment,
  onRegisterSample,
  isDeleting,
  isProcessingPayment,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  allPageSelected = false,
  somePageSelected = false,
}: InvoiceTableProps) {
  const router = useRouter();
  const selectionEnabled = Boolean(onToggleSelect && onToggleSelectAll);
  const selectedSet = new Set(selectedIds);

  const handleView = (invoice: Invoice) => {
    if (onViewInvoice) {
      onViewInvoice(invoice);
      return;
    }
    router.push(`/diagnosis/invoice-details?id=${encodeURIComponent(invoice.invoiceBarcode)}`);
  };

  const handleEditOrder = (invoice: Invoice, e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams({ orderId: String(invoice.id) });
    if (invoice.branchId != null && invoice.branchId > 0) {
      params.set('branchId', String(invoice.branchId));
    }
    router.push(`/diagnosis/diagnostic-booking/booking?${params.toString()}`);
  };

  if (isError) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex flex-wrap items-center gap-3 text-sm text-rose-800">
        <AlertCircle size={18} className="shrink-0" aria-hidden />
        <span className="font-medium">{errorMessage || 'Failed to load invoices.'}</span>
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" className="ml-auto font-bold" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {selectionEnabled ? (
                <th className="w-12 px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = somePageSelected;
                    }}
                    onChange={onToggleSelectAll}
                    disabled={isDeleting || invoices.length === 0}
                    className="w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-300"
                    aria-label="Select all on this page"
                  />
                </th>
              ) : null}
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Invoice Code
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Patient Name
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Tests
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Collection Centre
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Reception Date
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Amount
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan={COL_COUNT} className="px-6 py-12 text-center text-slate-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full" />
                    <span>Loading invoices…</span>
                  </div>
                </td>
              </tr>
            ) : !hasLoadedRows ? (
              <tr>
                <td colSpan={COL_COUNT} className="px-6 py-12 text-center text-slate-500">
                  No test orders found. Create a booking to get started.
                </td>
              </tr>
            ) : invoices.length === 0 ? (
              <tr>
                <td colSpan={COL_COUNT} className="px-6 py-12 text-center text-slate-500">
                  {emptyMessage ??
                    (searchActive
                      ? 'No invoices match your search or filters. Try adjusting criteria.'
                      : 'No invoices on this page.')}
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const testsLabel =
                  invoice.tests.length > 0 ? invoice.tests.join(', ') : 'No tests listed';
                const displayStatus = invoice.paymentStatus || invoice.orderStatus || '—';
                const isSelected = selectedSet.has(invoice.id);
                const isCancelled =
                  invoice.orderStatus?.toUpperCase() === 'CANCELLED';
                const canCollectPayment =
                  !isCancelled &&
                  ((invoice.dueAmount ?? 0) > 0 ||
                    invoice.paymentStatus?.toUpperCase() === 'UNPAID' ||
                    invoice.paymentStatus?.toUpperCase() === 'PARTIAL');

                return (
                  <tr
                    key={invoice.id}
                    className={`hover:bg-slate-50 transition-colors group cursor-pointer ${
                      isSelected ? 'bg-emerald-50/60' : ''
                    }`}
                    onClick={() => handleView(invoice)}
                  >
                    {selectionEnabled ? (
                      <td
                        className="w-12 px-4 py-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect?.(invoice.id)}
                          disabled={isDeleting}
                          className="w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-300"
                          aria-label={`Select ${invoice.invoiceBarcode}`}
                        />
                      </td>
                    ) : null}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleView(invoice);
                        }}
                        className="text-xs font-bold text-slate-600 font-mono hover:text-emerald-600 transition-colors text-left"
                      >
                        {invoice.invoiceBarcode}
                      </button>
                    </td>

                    <td className="px-6 py-4" onClick={(e) => handleEditOrder(invoice, e)}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-all shrink-0">
                          <FileText size={20} aria-hidden />
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={(e) => handleEditOrder(invoice, e)}
                            className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm mb-0.5 text-left hover:underline"
                          >
                            {invoice.patientName}
                          </button>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {[
                              invoice.patientCode,
                              invoice.mobile !== '—' ? invoice.mobile : null,
                              invoice.age > 0 ? `${invoice.age}Y` : null,
                              invoice.gender !== 'Other' ? invoice.gender : null,
                            ]
                              .filter(Boolean)
                              .join(' · ') || '—'}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 max-w-[220px]">
                      <span className="text-sm text-slate-600 line-clamp-2" title={testsLabel}>
                        {testsLabel}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {invoice.collectionCentre}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium line-clamp-1">
                          Dr. {invoice.refDoctor}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900 font-mono whitespace-nowrap">
                        {formatReceptionDate(invoice.receptionDate)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-slate-900 tracking-tight font-mono">
                          {formatCurrency(invoice.totalAmount)}
                        </span>
                        {(invoice.dueAmount ?? 0) > 0 ? (
                          <span className="text-[10px] font-bold text-rose-600 font-mono">
                            Due {formatCurrency(invoice.dueAmount)}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-600 font-mono">
                            Paid {formatCurrency(invoice.paidAmount)}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={statusBadgeVariant(displayStatus)} className="text-[10px] font-bold">
                        {displayStatus}
                      </Badge>
                      {invoice.priority ? (
                        <Badge variant="secondary" className="mt-1 text-[9px] font-bold block w-fit">
                          {invoice.priority}
                        </Badge>
                      ) : null}
                    </td>

                    <td className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <Button
                          type="button"
                          className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all"
                          title="View details"
                          aria-label="View booking details"
                          onClick={() => handleView(invoice)}
                        >
                          <ArrowRightCircle size={14} />
                        </Button>
                        {onCancelInvoice && !isCancelled ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Cancel order"
                            aria-label="Cancel order"
                            disabled={isDeleting}
                            onClick={() => onCancelInvoice(invoice)}
                          >
                            <Ban size={14} />
                          </Button>
                        ) : null}
                        {onViewCancellationDetails && isCancelled ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto rounded-lg border border-[#CF142B]/20 bg-[#CF142B]/5 text-[#CF142B] hover:bg-[#CF142B]/10 hover:border-[#CF142B]/40 hover:shadow-sm transition-all"
                            title="View cancellation details"
                            aria-label="View cancellation details"
                            onClick={() => onViewCancellationDetails(invoice)}
                          >
                            <ClipboardList size={14} />
                          </Button>
                        ) : null}
                        {onRegisterSample && !isCancelled ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Register sample"
                            aria-label="Register sample for this order"
                            disabled={isDeleting}
                            onClick={() => onRegisterSample(invoice)}
                          >
                            <FlaskConical size={14} />
                          </Button>
                        ) : null}
                        {onProcessPayment && canCollectPayment ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Process payment"
                            aria-label="Process payment"
                            disabled={isDeleting || isProcessingPayment}
                            onClick={() => onProcessPayment(invoice)}
                          >
                            <CreditCard size={14} />
                          </Button>
                        ) : null}
                        {onViewTransactions ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all"
                            title="View payment transactions"
                            aria-label="View payment transactions"
                            disabled={isDeleting}
                            onClick={() => onViewTransactions(invoice)}
                          >
                            <Receipt size={14} />
                          </Button>
                        ) : null}
                        {onViewPaymentSummary ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-white hover:shadow-sm transition-all"
                            title="View payment summary"
                            aria-label="View payment summary"
                            disabled={isDeleting}
                            onClick={() => onViewPaymentSummary(invoice)}
                          >
                            <Wallet size={14} />
                          </Button>
                        ) : null}
                        {onTrackOrderLifecycle ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Track order lifecycle"
                            aria-label="Track order lifecycle"
                            disabled={isDeleting}
                            onClick={() => onTrackOrderLifecycle(invoice)}
                          >
                            <Activity size={14} />
                          </Button>
                        ) : null}
                        {onDeleteInvoice ? (
                          <Button
                            type="button"
                            className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm transition-all"
                            title="Delete booking"
                            aria-label="Delete booking"
                            disabled={isDeleting}
                            onClick={() => onDeleteInvoice(invoice)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination ? (
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Database size={14} className="text-emerald-600 shrink-0" aria-hidden />
            <span>
              Page {pagination.pageNo + 1} of {Math.max(pagination.totalPages, 1)}
              <span className="text-slate-400 mx-2">·</span>
              {pagination.totalElements} total orders
            </span>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200"
              disabled={!pagination.canPrev || pagination.isFetching}
              onClick={pagination.onPrev}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-bold border-slate-200"
              disabled={!pagination.canNext || pagination.isFetching}
              onClick={pagination.onNext}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
