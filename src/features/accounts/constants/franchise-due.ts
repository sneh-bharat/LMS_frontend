import type { FranchiseDue } from '../types/accounts.types';

export const FRANCHISE_OPTIONS = [
  'Cash',
  'HO(IP)',
  'Credit',
  'Credit Franchise',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
];

export const DATE_FILTER_OPTIONS = ['Last 15 Days', 'Last 45 Days', 'Last 90 Days', 'All'];
export const FRANCHISE_PAYMENT_MODES = ['Cash', 'Cheque', 'Card', 'UPI', 'Net Banking', 'eSeva'];
export const FRANCHISE_DUE_STATUS_OPTIONS = ['pending', 'partial', 'overdue'] as const;

export const FRANCHISE_DUE_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  partial: 'bg-blue-100 text-blue-700',
  overdue: 'bg-rose-100 text-rose-700',
};

/** Tailwind classes for the age pill based on days outstanding. */
export function agePillClass(days: number): string {
  if (days >= 250) return 'bg-rose-100 text-rose-700';
  if (days >= 200) return 'bg-orange-100 text-orange-700';
  return 'bg-amber-100 text-amber-700';
}

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_DUE_RECORDS: FranchiseDue[] = [
  { id: 1, date: '2025-06-18', invoiceNumber: 'TL-INV-42', patientName: 'Cash Franchise', ageDays: 258, due: 200.0, franchise: 'Cash', status: 'overdue', createdAt: '2025-06-18' },
  { id: 2, date: '2025-07-02', invoiceNumber: 'TL-INV-56', patientName: 'Shanti', ageDays: 244, due: 92.0, franchise: 'Credit', status: 'pending', createdAt: '2025-07-02' },
  { id: 3, date: '2025-07-09', invoiceNumber: 'TL-INV-69', patientName: 'MOHAMMED BURHANUDDIN SABER', ageDays: 237, due: 1650.0, franchise: 'Cash', status: 'overdue', createdAt: '2025-07-09' },
  { id: 4, date: '2025-07-15', invoiceNumber: 'TL-INV-75', patientName: 'Ramesh Kumar', ageDays: 200, due: 450.0, franchise: 'HO(IP)', status: 'partial', createdAt: '2025-07-15' },
];
