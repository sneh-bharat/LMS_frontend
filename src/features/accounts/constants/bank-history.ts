import type { BankHistory } from '../types/accounts.types';

/** Tailwind classes for a transaction status badge. */
export const TRANSACTION_STATUS_COLORS: Record<string, string> = {
  Success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-100 text-amber-700 border-amber-200',
  Failed: 'bg-rose-100 text-rose-700 border-rose-200',
};

/** Tailwind text color for a transaction type. */
export const TRANSACTION_TYPE_COLORS: Record<string, string> = {
  Deposit: 'text-emerald-600',
  Withdrawal: 'text-rose-600',
  Transfer: 'text-blue-600',
};

export const TRANSACTION_TYPE_OPTIONS = [
  { label: 'All Types', value: 'All' },
  { label: 'Deposit', value: 'Deposit' },
  { label: 'Withdrawal', value: 'Withdrawal' },
  { label: 'Transfer', value: 'Transfer' },
];

export const TRANSACTION_STATUS_OPTIONS = [
  { label: 'All Status', value: 'All' },
  { label: 'Success', value: 'Success' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
];

/**
 * TODO: replace with API — temporary fixture preserved from the original page so the
 * screen keeps rendering until the bank-history endpoint is wired through
 * `accounts.service.ts`.
 */
export const SAMPLE_BANK_HISTORY: BankHistory[] = [
  {
    id: 1,
    bankId: 1,
    bankName: 'State Bank of India',
    type: 'Deposit',
    amount: 5000,
    referenceNumber: 'TXN12345',
    description: 'Patient payment deposit',
    transactionDate: '2026-03-25T10:30:00Z',
    createdAt: '2026-03-25T10:30:00Z',
    status: 'Success',
    balanceAfterTransaction: 15000,
  },
  {
    id: 2,
    bankId: 1,
    bankName: 'State Bank of India',
    type: 'Withdrawal',
    amount: 2000,
    referenceNumber: 'TXN12346',
    description: 'Lab equipment purchase',
    transactionDate: '2026-03-25T12:00:00Z',
    createdAt: '2026-03-25T12:00:00Z',
    status: 'Success',
    balanceAfterTransaction: 13000,
  },
  {
    id: 3,
    bankId: 2,
    bankName: 'HDFC Bank',
    type: 'Transfer',
    amount: 3000,
    fromBank: 'HDFC Bank',
    toBank: 'ICICI Bank',
    referenceNumber: 'TXN12347',
    description: 'Fund transfer',
    transactionDate: '2026-03-25T14:00:00Z',
    createdAt: '2026-03-25T14:00:00Z',
    status: 'Pending',
    balanceAfterTransaction: 7000,
  },
];
