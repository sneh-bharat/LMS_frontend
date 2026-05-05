'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import InvoiceHeader from './InvoiceHeader';
import InvoiceTable from './InvoiceTable';
import { SAMPLE_INVOICES } from './constants';
import { Invoice } from './types';

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const SEARCH_OPTIONS = [
  'Invoice Barcode',
  'Patient Name',
  'Mobile Number',
  'UHID',
  'Vial Barcode',
] as const;

const CENTRE_OPTIONS = [
  'Select centre',
  'HO(IP)',
  'Cash',
  'Credit',
  'Credit Franchise',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
] as const;

const STATUS_OPTIONS = [
  'All',
  'Adv Booking',
  'Adv Booking All',
  'Paid Invoices',
  'Due Invoices',
  'Urgent Processing',
] as const;

export default function InvoiceListPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Initialize invoices on client side to prevent hydration mismatch
  useEffect(() => {
    setInvoices(SAMPLE_INVOICES);
  }, []);

  // Simple search filter
  const [search, setSearch] = useState('');
  const filtered = invoices.filter(invoice => {
    if (!search) return true;
    const searchText = search.toLowerCase();
    return (
      invoice.invoiceBarcode.toLowerCase().includes(searchText) ||
      invoice.patientName.toLowerCase().includes(searchText) ||
      invoice.mobile.includes(searchText) ||
      invoice.patientId.toString().includes(searchText)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 w-full">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-100/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section with Search & Filters */}
        <InvoiceHeader />

        {/* Invoice Table */}
        <InvoiceTable invoices={filtered} />

        {/* Footer Info */}
        <div className="mt-6 flex items-center justify-between text-sm">
          <p className="text-slate-600">
            Showing <span className="font-bold text-slate-900">{filtered.length}</span> of{' '}
            <span className="font-bold text-slate-900">{invoices.length}</span> invoices
          </p>
          <Badge variant="success" className="gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            All systems operational
          </Badge>
        </div>
      </div>
    </div>
  );
}
