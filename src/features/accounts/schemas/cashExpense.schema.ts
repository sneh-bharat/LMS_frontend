import { z } from 'zod';

/**
 * Zod schema for the cash-expense form. Replaces the manual `if (!field)` checks that
 * lived in `Addnew.tsx` (audit §6). The form type is inferred from the schema, so the
 * form shape and its validation can never drift apart.
 */
export const cashExpenseSchema = z.object({
  expenseCategory: z.string().min(1, 'Expense category is required'),
  payeePartyName: z.string().optional().default(''),
  amount: z.coerce
    .number({ message: 'Valid amount is required' })
    .positive('Valid amount is required'),
  date: z.string().min(1, 'Date is required'),
  mode: z.enum(['cash', 'cheque', 'online', 'card']),
  expenseNote: z.string().optional().default(''),
});

export type CashExpenseFormValues = z.infer<typeof cashExpenseSchema>;

// Re-exported for back-compat; the canonical helper lives in `@/lib/zod`.
export { zodFieldErrors as toFieldErrors } from '@/lib/zod';
