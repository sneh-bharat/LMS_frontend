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
  MoreVertical,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
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
    <div className="w-full overflow-hidden rounded-[1.5rem] bg-white border border-slate-300  backdrop-blur-md shadow-sm">
      <Table className="border-collapse">
        <TableHeader className="bg-teal-600  border-b border-slate-100">
          <TableRow className="hover:bg-transparent border-none">
            {selectionEnabled ? (
              <TableHead className="w-12 px-4 py-4 text-center">
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
              </TableHead>
            ) : null}
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
              Invoice Code
            </TableHead>
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
              Patient Name
            </TableHead>
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
              Tests
            </TableHead>
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
              Collection Centre
            </TableHead>
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
              Reception Date
            </TableHead>
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
              Amount
            </TableHead>
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest">
              Status
            </TableHead>
            <TableHead className="px-6 py-2.5 text-[10px] font-black text-white uppercase tracking-widest text-center">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-slate-50">
          {isLoading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COL_COUNT} className="px-6 py-12 text-center text-slate-400">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin h-8 w-8 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full" />
                  <span className="text-xs font-bold uppercase tracking-widest">Gathering Invoices...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : !hasLoadedRows ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COL_COUNT} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <Database size={32} strokeWidth={1} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-0.5">No test orders found</h4>
                    <p className="text-xs font-semibold text-slate-500 tracking-tight">Create a booking to get started.</p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : invoices.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={COL_COUNT} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                    <AlertCircle size={32} strokeWidth={1} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-0.5">No results match</h4>
                    <p className="text-xs font-semibold text-slate-500 tracking-tight">
                      {emptyMessage ?? (searchActive ? 'Try adjusting your search or filters.' : 'No invoices on this page.')}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => {
              const testsLabel = invoice.tests.length > 0 ? invoice.tests.join(', ') : 'No tests listed';
              const displayStatus = invoice.paymentStatus || invoice.orderStatus || '—';
              const isSelected = selectedSet.has(invoice.id);
              const isCancelled = invoice.orderStatus?.toUpperCase() === 'CANCELLED';
              const canCollectPayment =
                !isCancelled &&
                ((invoice.dueAmount ?? 0) > 0 ||
                  invoice.paymentStatus?.toUpperCase() === 'UNPAID' ||
                  invoice.paymentStatus?.toUpperCase() === 'PARTIAL');

              return (
                <TableRow
                  key={invoice.id}
                  className={cn(
                    "hover:bg-emerald-50/30 text-white transition-all group cursor-pointer border-none",
                    isSelected && "bg-emerald-50/60"
                  )}
                  onClick={() => handleView(invoice)}
                >
                  {selectionEnabled ? (
                    <TableCell
                      className="w-12 px-4 py-5 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelect?.(invoice.id)}
                        disabled={isDeleting}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer rounded border-slate-300 transition-all"
                        aria-label={`Select ${invoice.invoiceBarcode}`}
                      />
                    </TableCell>
                  ) : null}
                  <TableCell className="px-6 py-5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleView(invoice);
                      }}
                      className="text-xs font-bold text-slate-500 font-mono hover:text-emerald-600 transition-colors text-left"
                    >
                      {invoice.invoiceBarcode}
                    </button>
                  </TableCell>

                  <TableCell className="px-6 py-5" onClick={(e) => handleEditOrder(invoice, e)}>
                    <div className="flex items-center gap-3.5">
                      
                      <div>
                        <button
                          type="button"
                          onClick={(e) => handleEditOrder(invoice, e)}
                          className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm mb-0.5 text-left hover:underline decoration-emerald-500/30 underline-offset-4"
                        >
                          {invoice.patientName}
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                            {[
                              invoice.patientCode,
                              invoice.mobile !== '—' ? invoice.mobile : null,
                              invoice.age > 0 ? `${invoice.age}Y` : null,
                              invoice.gender !== 'Other' ? invoice.gender : null,
                            ]
                              .filter(Boolean)
                              .join(' · ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5 max-w-[220px]">
                    <span className="text-xs font-semibold text-slate-600 line-clamp-2 leading-relaxed" title={testsLabel}>
                      {testsLabel}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold text-slate-900 line-clamp-1 tracking-tight">
                        {invoice.collectionCentre}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold line-clamp-1 uppercase tracking-wider">
                        Dr. {invoice.refDoctor}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <span className="text-sm font-black text-slate-800 font-mono whitespace-nowrap">
                      {formatReceptionDate(invoice.receptionDate)}
                    </span>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-black text-slate-900 tracking-tight font-mono">
                        {formatCurrency(invoice.totalAmount)}
                      </span>
                      {(invoice.dueAmount ?? 0) > 0 ? (
                        <span className="text-[10px] font-black text-rose-500 font-mono flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-rose-500 animate-pulse" />
                          Due {formatCurrency(invoice.dueAmount)}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black text-emerald-500 font-mono">
                          Paid {formatCurrency(invoice.paidAmount)}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <Badge variant={statusBadgeVariant(displayStatus)} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 w-fit">
                        {displayStatus}
                      </Badge>
                      {invoice.priority ? (
                        <Badge variant="secondary" className="text-[8px] font-black uppercase tracking-[0.15em] px-2 py-0 w-fit bg-slate-100 text-slate-500 border-none">
                          {invoice.priority}
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>

                  <TableCell className="px-6 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-emerald-600 hover:bg-white hover:shadow-xl hover:shadow-emerald-100 transition-all duration-300"
                        title="View details"
                        aria-label="View booking details"
                        onClick={() => handleView(invoice)}
                      >
                        <ArrowRightCircle size={15} strokeWidth={2} />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              type="button"
                              className="p-1.5 h-auto bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-xl hover:shadow-slate-100 transition-all duration-300"
                              title="More actions"
                              aria-label="More actions"
                            >
                              <MoreVertical size={15} strokeWidth={2} />
                            </Button>
                          }
                        />
                        <DropdownMenuContent className="min-w-56 p-1.5 rounded-xl border-slate-100 shadow-2xl">
                          {onRegisterSample && !isCancelled && (
                            <DropdownMenuItem onClick={() => onRegisterSample(invoice)} className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-teal-700">
                              <FlaskConical size={16} className="mr-3 text-teal-500" />
                              <span>Register Sample</span>
                            </DropdownMenuItem>
                          )}
                          {onProcessPayment && canCollectPayment && (
                            <DropdownMenuItem onClick={() => onProcessPayment(invoice)} className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-700">
                              <CreditCard size={16} className="mr-3 text-emerald-500" />
                              <span>Process Payment</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="my-1.5 bg-slate-50" />
                          {onTrackOrderLifecycle && (
                            <DropdownMenuItem onClick={() => onTrackOrderLifecycle(invoice)} className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-blue-700">
                              <Activity size={16} className="mr-3 text-blue-500" />
                              <span>Track Lifecycle</span>
                            </DropdownMenuItem>
                          )}
                          {onViewTransactions && (
                            <DropdownMenuItem onClick={() => onViewTransactions(invoice)} className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-indigo-700">
                              <Receipt size={16} className="mr-3 text-indigo-500" />
                              <span>View Transactions</span>
                            </DropdownMenuItem>
                          )}
                          {onViewPaymentSummary && (
                            <DropdownMenuItem onClick={() => onViewPaymentSummary(invoice)} className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-emerald-800">
                              <Wallet size={16} className="mr-3 text-emerald-600" />
                              <span>Payment Summary</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator className="my-1.5 bg-slate-50" />
                          {onCancelInvoice && !isCancelled && (
                            <DropdownMenuItem onClick={() => onCancelInvoice(invoice)} className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-amber-700">
                              <Ban size={16} className="mr-3 text-amber-500" />
                              <span>Cancel Order</span>
                            </DropdownMenuItem>
                          )}
                          {onViewCancellationDetails && isCancelled && (
                            <DropdownMenuItem onClick={() => onViewCancellationDetails(invoice)} className="rounded-lg py-2.5 font-bold text-slate-600 hover:text-rose-700">
                              <ClipboardList size={16} className="mr-3 text-rose-500" />
                              <span>Cancellation Details</span>
                            </DropdownMenuItem>
                          )}
                          {onDeleteInvoice && (
                            <DropdownMenuItem
                              onClick={() => onDeleteInvoice(invoice)}
                              className="rounded-lg py-2.5 font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700 hover:bg-rose-50"
                            >
                              <Trash2 size={16} className="mr-3" />
                              <span>Delete Booking</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

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
