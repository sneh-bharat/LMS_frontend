/**
 * Account-domain types.
 *
 * Extracted from the inline `interface` declarations that previously lived inside
 * the account page components (audit §4). These are the single source of truth for
 * the accounts feature.
 */

// ─── Shared unions ──────────────────────────────────────────────────────────────

export type TransactionStatus = 'Success' | 'Pending' | 'Failed';
export type BankTransactionType = 'Deposit' | 'Withdrawal' | 'Transfer';
export type ExpensePaymentMode = 'Cash' | 'Cheque' | 'Online' | 'Card' | 'Transfer';
export type FranchiseDueStatus = 'pending' | 'partial' | 'overdue';

// ─── Bank ───────────────────────────────────────────────────────────────────────

export type BankStatus = 'Active' | 'Inactive';

export interface Bank {
  id: number;
  bankName: string;
  branch: string;
  accountNumber: string;
  ifscCode: string;
  contactNumber: string;
  email: string;
  accountHolderName: string;
  status: BankStatus;
  openingBalance?: number;
  currentBalance?: number;
  createdDate?: string;
}

export interface BankHistory {
  id: number;
  bankId: number;
  bankName: string;
  type: BankTransactionType;
  amount: number;
  fromBank?: string;
  toBank?: string;
  referenceNumber?: string;
  description?: string;
  transactionDate: string;
  createdAt: string;
  status: TransactionStatus;
  balanceAfterTransaction?: number;
}

// ─── Expenses ────────────────────────────────────────────────────────────────────

export type CashExpenseMode = 'cash' | 'cheque' | 'online' | 'card';

export interface CashExpense {
  id: number;
  expenseCategory: string;
  payeePartyName: string;
  amount: number;
  date: string;
  mode: CashExpenseMode;
  expenseNote: string;
  createdAt: string;
}

export type BankExpenseMode = 'cash' | 'cheque' | 'online' | 'card' | 'transfer';

export interface BankExpense {
  id: number;
  expenseCategory: string;
  bankAccount: string;
  mode: BankExpenseMode;
  payeePartyName: string;
  amount: number;
  date: string;
  expenseNote: string;
  createdAt: string;
}

// ─── Franchise ───────────────────────────────────────────────────────────────────

export interface FranchiseDue {
  id: number;
  date: string;
  invoiceNumber: string;
  patientName: string;
  ageDays: number;
  due: number;
  franchise: string;
  status: FranchiseDueStatus;
  createdAt: string;
}

export interface FranchiseLedgerRecord {
  sl: number;
  date: string;
  inv: string;
  doctor: string;
  patientName: string;
  investigation: string;
  price: number;
  oChrg: number;
  paid: number;
  dis: number;
  due: number;
}

// ─── Invoice ─────────────────────────────────────────────────────────────────────

export interface OneInvoiceRecord {
  id: number;
  b2bDetails: string;
  startDate: string;
  endDate: string;
  invoiceCount: number;
  totalAmount: number;
  paidAmount: number;
  invoiceType: string;
}
