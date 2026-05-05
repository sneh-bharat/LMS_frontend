import { Invoice } from './types';

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
    totalAmount: 1800.00,
    paidAmount: 500.00,
    dueAmount: 0.00,
    balanceAmount: 1300.00,
    receptionDate: '2026-05-05 12:59 PM'
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
    totalAmount: 2200.00,
    paidAmount: 500.00,
    dueAmount: 0.00,
    balanceAmount: 1700.00,
    receptionDate: '2026-05-05 11:08 AM',
    paymentLink: 'Get Online Payment'
  }
];

export const SEARCH_OPTIONS = [
  'Invoice Barcode',
  'Patient Name',
  'Mobile Number',
  'UHID',
  'Vial Barcode',
] as const;

export const CENTRE_OPTIONS = [
  'Select centre',
  'HO(IP)',
  'Cash',
  'Credit',
  'Credit Franchise',
  'sv prasad hospital',
  'Wallet',
  'wallet flexibility',
] as const;

export const STATUS_OPTIONS = [
  'All',
  'Adv Booking',
  'Adv Booking All',
  'Paid Invoices',
  'Due Invoices',
  'Urgent Processing',
] as const;
