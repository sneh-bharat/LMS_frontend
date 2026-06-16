import type { Bank } from '../types/accounts.types';

export const BANK_STATUS_COLORS: Record<string, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const BANK_STATUS_OPTIONS = [
  { label: 'All Status', value: 'All' },
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_BANKS: Bank[] = [
  {
    id: 1,
    bankName: 'HDFC Bank',
    branch: 'Connaught Place',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    contactNumber: '+91 11 2345 6789',
    email: 'cp.branch@hdfcbank.com',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Active',
    openingBalance: 500000,
    currentBalance: 1250000,
    createdDate: '2023-06-15T10:30:00.000Z',
  },
  {
    id: 2,
    bankName: 'ICICI Bank',
    branch: 'Nehru Place',
    accountNumber: '002001567890',
    ifscCode: 'ICIC0000020',
    contactNumber: '+91 11 4567 8901',
    email: 'nehruplace@icicibank.com',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Active',
    openingBalance: 300000,
    currentBalance: 875000,
    createdDate: '2023-08-20T14:00:00.000Z',
  },
  {
    id: 3,
    bankName: 'State Bank of India',
    branch: 'Lajpat Nagar',
    accountNumber: '30567890123',
    ifscCode: 'SBIN0001234',
    contactNumber: '+91 11 2987 6543',
    email: 'lajpatnagar@sbi.co.in',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Active',
    openingBalance: 200000,
    currentBalance: 450000,
    createdDate: '2023-04-10T09:15:00.000Z',
  },
  {
    id: 4,
    bankName: 'Axis Bank',
    branch: 'South Extension',
    accountNumber: '912020067890123',
    ifscCode: 'UTIB0001234',
    contactNumber: '+91 11 4123 4567',
    email: 'southext@axisbank.com',
    accountHolderName: 'Think Lab Diagnostics Pvt Ltd',
    status: 'Inactive',
    openingBalance: 100000,
    currentBalance: 0,
    createdDate: '2022-12-05T11:45:00.000Z',
  },
];
