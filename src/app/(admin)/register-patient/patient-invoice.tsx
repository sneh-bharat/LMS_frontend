'use client';

import {
  FileText,
  Loader2,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  Calendar,
  Receipt,
} from 'lucide-react';
import { RightDrawer } from '@/components/ui/right-drawer';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import { usePatientInvoices } from '@/app/Apis/booking/useTestOrders';
import type { PatientInvoiceItem } from '@/app/Apis/booking/testOrderApi';

/** Load all invoices in one request (no pagination UI). */
const FETCH_PAGE_SIZE = 100;

export interface PatientInvoicesProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: number | null;
  patientName?: string;
  patientCode?: string;
}

function formatCurrency(amount: number | undefined) {
  return `₹${(amount ?? 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function parseApiDate(value: string | null | undefined) {
  if (!value) return null;
  const normalized = value.includes('T') ? value : value.replace(' ', 'T');
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';
  const d = parseApiDate(value);
  if (!d) return value;
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return '—';
  const d = parseApiDate(value);
  if (!d) return value;
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function paymentBadgeVariant(status?: string) {
  const s = status?.toUpperCase();
  if (s === 'PAID') return 'success' as const;
  if (s === 'UNPAID') return 'destructive' as const;
  if (s === 'PARTIAL') return 'warning' as const;
  return 'secondary' as const;
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-1">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-black text-slate-900 font-mono">{value}</p>
    </div>
  );
}

function InvoiceRow({ invoice }: { invoice: PatientInvoiceItem }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
      <td className="py-3 px-3">
        <p className="text-sm font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
          ID {invoice.id}
        </p>
      </td>
      <td className="py-3 px-3 text-sm font-semibold text-slate-700 whitespace-nowrap">
        {formatDate(invoice.orderDate)}
      </td>
      <td className="py-3 px-3">
        <Badge variant={paymentBadgeVariant(invoice.paymentStatus)}>
          {invoice.paymentStatus}
        </Badge>
      </td>
      <td className="py-3 px-3 text-sm font-bold text-slate-900 text-right font-mono whitespace-nowrap">
        {formatCurrency(invoice.total)}
      </td>
      <td className="py-3 px-3 text-sm font-bold text-emerald-700 text-right font-mono whitespace-nowrap">
        {formatCurrency(invoice.paid)}
      </td>
      <td className="py-3 px-3 text-sm font-bold text-amber-700 text-right font-mono whitespace-nowrap">
        {formatCurrency(invoice.pending)}
      </td>
    </tr>
  );
}

export function PatientInvoices({
  isOpen,
  onClose,
  patientId,
  patientName,
  patientCode,
}: PatientInvoicesProps) {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePatientInvoices(isOpen ? patientId : null, 0, FETCH_PAGE_SIZE);

  const page = data?.data;
  const invoices = page?.invoices ?? [];
  const totals = page?.totals;
  const apiPatient = page?.patient;
  const totalElements = page?.totalElements ?? invoices.length;

  const displayName =
    patientName?.trim() ||
    apiPatient?.fullName?.trim() ||
    [apiPatient?.firstName, apiPatient?.lastName].filter(Boolean).join(' ').trim() ||
    (patientId ? `Patient #${patientId}` : 'Patient');
  const displayCode =
    patientCode?.trim() ||
    apiPatient?.patientCode?.trim() ||
    (page?.patientId ? `ID ${page.patientId}` : '');

  return (
    <RightDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <Receipt className="text-white" size={24} />
          <span>
            Patient <span className="text-emerald-200">Invoices</span>
          </span>
        </div>
      }
      description={
        displayCode
          ? `${displayName} · ${displayCode}`
          : displayName
      }
      maxWidth="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {totalElements} invoice{totalElements === 1 ? '' : 's'}
            {data?.message?.trim() ? ` · ${data.message}` : ''}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200"
            onClick={() => refetch()}
            disabled={isLoading || isFetching}
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
            <p className="text-sm font-semibold">Loading invoices…</p>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center space-y-3">
            <AlertCircle className="mx-auto text-rose-500" size={28} />
            <p className="text-sm font-semibold text-rose-900">Could not load invoices</p>
            <p className="text-sm text-rose-700">{error?.message ?? 'Request failed'}</p>
            <Button type="button" variant="outline" size="sm" onClick={() => refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <>
            {totals ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <SummaryCard label="Total amount" value={formatCurrency(totals.totalAmount)} />
                <SummaryCard label="Total paid" value={formatCurrency(totals.totalPaid)} />
                <SummaryCard label="Pending" value={formatCurrency(totals.totalPending)} />
                <SummaryCard label="Discount" value={formatCurrency(totals.totalDiscount)} />
                <SummaryCard label="Refunded" value={formatCurrency(totals.totalRefunded)} />
              </div>
            ) : null}

            {invoices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center space-y-2">
                <FileText className="mx-auto text-slate-300" size={40} />
                <p className="text-sm font-semibold text-slate-600">No invoices found</p>
                <p className="text-xs text-slate-400">
                  This patient has no diagnostic billing records yet.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="py-2.5 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Invoice
                        </th>
                        <th className="py-2.5 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Order date
                        </th>
                        <th className="py-2.5 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          Status
                        </th>
                        <th className="py-2.5 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                          Total
                        </th>
                        <th className="py-2.5 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                          Paid
                        </th>
                        <th className="py-2.5 px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                          Pending
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <InvoiceRow key={invoice.id} invoice={invoice} />
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {invoices.length > 0 ? (
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <IndianRupee size={14} className="text-emerald-500" />
                  Invoice breakdown
                </h4>
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <div
                      key={`detail-${invoice.id}`}
                      className="p-4 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                        <div>
                          <p className="text-sm font-bold text-slate-900 font-mono">
                            {invoice.invoiceNumber}
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-1">
                            <Calendar size={10} />
                            Created {formatDateTime(invoice.createdAt)}
                          </p>
                        </div>
                        <Badge variant={paymentBadgeVariant(invoice.paymentStatus)}>
                          {invoice.isPaid ? 'Paid' : invoice.paymentStatus}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Net</span>
                          <p className="font-bold text-slate-900 font-mono">
                            {formatCurrency(invoice.netAmount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Discount</span>
                          <p className="font-bold text-slate-900 font-mono">
                            {formatCurrency(invoice.discount)}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Refunded</span>
                          <p className="font-bold text-slate-900 font-mono">
                            {formatCurrency(invoice.refunded)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </RightDrawer>
  );
}
