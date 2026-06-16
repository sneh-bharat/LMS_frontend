import type { CashExpense } from '../types/accounts.types';

export const CASH_EXPENSE_CATEGORIES = [
  'Electrical Maintenance',
  'Bio-medical Waste',
  'Doctor IP Pay',
  'Doctor Payment',
  'DTH Bill',
  'Electricity Bill',
  'EPF Payment',
  'Food Expenses',
  'Franchise Wallet Recharge',
  'Franchise Wallet Refund',
  'Fuel Expenses',
  'Internet Bill',
  'Lab Machinery Maintenance',
  'Medical Supplies',
  'Equipment',
  'Staff Salaries',
  'Utilities',
  'Maintenance',
  'Travel',
  'Consumables',
  'Other',
] as const;

export const CASH_EXPENSE_PAYMENT_MODES = ['Cash', 'Cheque', 'Online', 'Card'] as const;

/** TODO: replace with API — fixture preserved from the original page. */
export const SAMPLE_CASH_EXPENSES: CashExpense[] = [
  {
    id: 1,
    expenseCategory: 'Medical Supplies',
    payeePartyName: 'Apollo Medical Store',
    amount: 5000,
    date: '2024-02-25',
    mode: 'cash',
    expenseNote: 'Monthly medical supplies purchase for clinic',
    createdAt: '2024-02-25',
  },
  {
    id: 2,
    expenseCategory: 'Equipment',
    payeePartyName: 'Tech Services Inc.',
    amount: 2500,
    date: '2024-02-24',
    mode: 'cheque',
    expenseNote: 'Equipment maintenance and calibration service',
    createdAt: '2024-02-24',
  },
  {
    id: 3,
    expenseCategory: 'Utilities',
    payeePartyName: 'Electricity Board',
    amount: 8500,
    date: '2024-02-23',
    mode: 'online',
    expenseNote: 'Monthly electricity bill payment',
    createdAt: '2024-02-23',
  },
  {
    id: 4,
    expenseCategory: 'Travel',
    payeePartyName: 'Staff Transportation',
    amount: 3000,
    date: '2024-02-22',
    mode: 'cash',
    expenseNote: 'Monthly travel allowance for staff',
    createdAt: '2024-02-22',
  },
];
