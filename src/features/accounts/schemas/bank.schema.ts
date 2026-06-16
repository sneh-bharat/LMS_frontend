import { z } from 'zod';

/**
 * Zod schema for the bank account form. Replaces the manual `validateForm()` in
 * `AddNewBank.tsx`, including the email regex check.
 */
export const bankSchema = z.object({
  bankName: z.string().trim().min(1, 'Bank name is required'),
  branch: z.string().trim().min(1, 'Branch name is required'),
  accountNumber: z.string().trim().min(1, 'Account number is required'),
  ifscCode: z.string().trim().min(1, 'IFSC code is required'),
  contactNumber: z.string().trim().min(1, 'Contact number is required'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email format'),
  accountHolderName: z.string().trim().min(1, 'Account holder name is required'),
  status: z.enum(['Active', 'Inactive']),
  openingBalance: z.coerce.number().min(0, 'Opening balance cannot be negative').default(0),
  currentBalance: z.coerce.number().min(0, 'Current balance cannot be negative').default(0),
});

export type BankFormValues = z.infer<typeof bankSchema>;
