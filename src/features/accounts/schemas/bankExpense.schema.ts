import { z } from 'zod';

/** Zod schema for the bank-expense form (replaces manual validation in Addnewbank.tsx). */
export const bankExpenseSchema = z.object({
  expenseCategory: z.string().min(1, 'Expense category is required'),
  bankAccount: z.string().min(1, 'Bank account is required'),
  mode: z.enum(['cash', 'cheque', 'online', 'card', 'transfer']),
  payeePartyName: z.string().optional().default(''),
  amount: z.coerce.number({ message: 'Valid amount is required' }).positive('Valid amount is required'),
  date: z.string().min(1, 'Date is required'),
  expenseNote: z.string().optional().default(''),
});

export type BankExpenseFormValues = z.infer<typeof bankExpenseSchema>;
