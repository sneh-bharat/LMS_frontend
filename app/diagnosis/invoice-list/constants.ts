import { Invoice } from './types';

/** Fallback sample data for invoice-details until detail API is wired. */
export const SAMPLE_INVOICES: Invoice[] = [
  {
    id: 1,
    invoiceBarcode: 'WLDI-INV-4',
    patientName: 'Mrs. Disha Kundu',
    patientId: 4,
    age: 28,
    gender: 'Female',
    mobile: '+918584038097',
    address: '166, dum dum kolkata-700105',
    tests: ['CERVICAL/VAGINAL (SMEAR SENT)', '25 (OH) VITAMIN D3'],
    collectionCentre: 'MISHRA COLLECTION CENTRE(1)',
    refDoctor: 'Dr. D.das',
    totalAmount: 1800.0,
    paidAmount: 500.0,
    dueAmount: 0.0,
    balanceAmount: 1300.0,
    receptionDate: '2026-05-05 12:59 PM',
  },
  {
    id: 2,
    invoiceBarcode: 'WLDI-INV-3',
    patientName: 'Mrs. Sanghita  Kundu',
    patientId: 4,
    age: 28,
    gender: 'Female',
    mobile: '+918584038097',
    address: '166, dum dum kolkata-700105',
    tests: ['LIPID PROFILE', 'USG OF WHOLE ABDOMEN', 'URINE CULTURE AND SENSIVITY'],
    collectionCentre: 'HO(IP)(1)',
    refDoctor: 'Dr. Self',
    totalAmount: 2200.0,
    paidAmount: 500.0,
    dueAmount: 0.0,
    balanceAmount: 1700.0,
    receptionDate: '2026-05-05 11:08 AM',
    paymentLink: 'Get Online Payment',
  },
];

export const SEARCH_OPTIONS = ['Order Number', 'Patient ID'] as const;

export type InvoiceSearchType = (typeof SEARCH_OPTIONS)[number];

/** Placeholder value — dropdown shows “Type” until user picks a search mode. */
export const SEARCH_TYPE_PLACEHOLDER = '';

/** Default dropdown selection (shows label “Type”). */
export const DEFAULT_SEARCH_BY: '' | InvoiceSearchType = SEARCH_TYPE_PLACEHOLDER;

export type InvoiceSearchBy = typeof SEARCH_TYPE_PLACEHOLDER | InvoiceSearchType;

/** Default branch filter label (no branch selected). */
export const SELECT_BRANCH_LABEL = 'Select Branch';

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Default invoice list range: first day of current month through today. */
export function getDefaultInvoiceDateRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  return { startDate: toIsoDate(start), endDate: toIsoDate(today) };
}

export interface InvoiceBranchOption {
  branchId: number;
  branchName: string;
}

/** Values for GET `/test-orders/status/{status}`. */
export const ORDER_STATUS_API_OPTIONS = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
] as const;



export const STATUS_OPTIONS = [
  'Order Status',
  ...ORDER_STATUS_API_OPTIONS,
] as const;

export type InvoiceStatusFilter = (typeof STATUS_OPTIONS)[number];

/** Order status path segment for the status API (not payment filters). */
export type InvoiceOrderStatus = (typeof ORDER_STATUS_API_OPTIONS)[number];

export type InvoicePaymentStatusFilter = (typeof ORDER_STATUS_API_OPTIONS)[number];

export function isOrderStatusApiFilter(
  status: InvoiceStatusFilter
): status is InvoiceOrderStatus {
  return (ORDER_STATUS_API_OPTIONS as readonly string[]).includes(status);
}

export function isPaymentStatusFilter(
  status: InvoiceStatusFilter
): status is InvoicePaymentStatusFilter {
  return (ORDER_STATUS_API_OPTIONS as readonly string[]).includes(status);
}

/** Processing priority filter — GET `/test-orders/search?searchTerm=…` */
export const PROCESSING_TYPE_FILTER_OPTIONS = [
  'Processing Type',
  'Routine',
  'Urgent',
  'Emergency',
  'Timed Collection',
] as const;

export type InvoiceProcessingTypeFilter = (typeof PROCESSING_TYPE_FILTER_OPTIONS)[number];

export const DEFAULT_PROCESSING_TYPE_FILTER: InvoiceProcessingTypeFilter = 'Processing Type';

/** Maps UI label to `searchTerm` for GET `/test-orders/search`. */
export function processingTypeToSearchTerm(
  filter: InvoiceProcessingTypeFilter
): string | null {
  switch (filter) {
    case 'Routine':
      return 'Routine';
    case 'Urgent':
      return 'Urgent';
    case 'Emergency':
      return 'Emergency';
    case 'Timed Collection':
      return 'Timed';
    default:
      return null;
  }
}

export function isProcessingTypeApiFilter(
  filter: InvoiceProcessingTypeFilter
): filter is Exclude<InvoiceProcessingTypeFilter, 'Processing Type'> {
  return filter !== 'Processing Type';
}
