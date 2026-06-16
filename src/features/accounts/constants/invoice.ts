import type { OneInvoiceRecord } from '../types/accounts.types';

export const INVOICE_B2B_OPTIONS = [
  'Credit Franchise',
  'HO(IP)',
  'Cash',
  'Credit',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
];

export const INVOICE_TYPE_OPTIONS = ['Due Invoices', 'All Invoices', 'Paid Invoices', 'Partial Invoices'];
export const INVOICE_PAYMENT_MODES = ['Cash', 'Cheque', 'Card', 'UPI', 'Net Banking', 'eSeva'];

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_INVOICE_RECORDS: OneInvoiceRecord[] = [
  { id: 1, b2bDetails: 'Credit Franchise', startDate: '2025-01-07', endDate: '2025-01-07', invoiceCount: 1, totalAmount: 2640, paidAmount: 2000, invoiceType: 'Due Invoices' },
  { id: 2, b2bDetails: 'Credit Franchise', startDate: '2025-01-06', endDate: '2025-01-06', invoiceCount: 1, totalAmount: 138, paidAmount: 0, invoiceType: 'Due Invoices' },
  { id: 3, b2bDetails: 'Credit Franchise', startDate: '2025-01-06', endDate: '2025-01-06', invoiceCount: 1, totalAmount: 148, paidAmount: 0, invoiceType: 'Due Invoices' },
  { id: 4, b2bDetails: 'Credit Franchise', startDate: '2025-01-06', endDate: '2025-01-06', invoiceCount: 3, totalAmount: 1043, paidAmount: 500, invoiceType: 'Due Invoices' },
];
