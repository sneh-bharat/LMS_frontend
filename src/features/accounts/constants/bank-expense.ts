import type { BankExpense } from '../types/accounts.types';

export { CASH_EXPENSE_CATEGORIES as BANK_EXPENSE_CATEGORIES } from './cash-expense';

export const BANK_EXPENSE_PAYMENT_MODES = ['Cash', 'Cheque', 'Online', 'Card', 'Transfer'] as const;

export const BANK_ACCOUNTS = [
  'Primary Account - HDFC Bank (XXXX1234)',
  'Secondary Account - ICICI Bank (XXXX5678)',
  'Operational Account - SBI Bank (XXXX9012)',
  'Savings Account - Axis Bank (XXXX3456)',
] as const;

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_BANK_EXPENSES: BankExpense[] = [
  {
    id: 1,
    expenseCategory: 'Equipment',
    bankAccount: 'Primary Account - HDFC Bank (XXXX1234)',
    mode: 'transfer',
    payeePartyName: 'Medical Equipment Suppliers Ltd.',
    amount: 125000,
    date: '2024-02-25',
    expenseNote: 'Purchase of medical diagnostic equipment for cardiology department',
    createdAt: '2024-02-25',
  },
  {
    id: 2,
    expenseCategory: 'Staff Salaries',
    bankAccount: 'Operational Account - SBI Bank (XXXX9012)',
    mode: 'transfer',
    payeePartyName: 'Staff Payroll System',
    amount: 850000,
    date: '2024-02-24',
    expenseNote: 'Monthly staff salaries for February 2024',
    createdAt: '2024-02-24',
  },
  {
    id: 3,
    expenseCategory: 'Electricity Bill',
    bankAccount: 'Primary Account - HDFC Bank (XXXX1234)',
    mode: 'online',
    payeePartyName: 'WBSEDCL',
    amount: 45000,
    date: '2024-02-23',
    expenseNote: 'Monthly electricity bill payment',
    createdAt: '2024-02-23',
  },
  {
    id: 4,
    expenseCategory: 'Maintenance',
    bankAccount: 'Secondary Account - ICICI Bank (XXXX5678)',
    mode: 'cheque',
    payeePartyName: 'Building Maintenance Services',
    amount: 35000,
    date: '2024-02-22',
    expenseNote: 'Quarterly building maintenance and repair services',
    createdAt: '2024-02-22',
  },
];
