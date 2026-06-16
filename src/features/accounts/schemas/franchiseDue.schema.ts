import { z } from 'zod';

/** Zod schema for the franchise-due form (replaces manual validation in AddNewFranchiseDue.tsx). */
export const franchiseDueSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  patientName: z.string().min(1, 'Patient name is required'),
  ageDays: z.coerce.number().min(0).default(0),
  due: z.coerce.number({ message: 'Valid due amount is required' }).positive('Valid due amount is required'),
  franchise: z.string().min(1, 'Franchise is required'),
  status: z.enum(['pending', 'partial', 'overdue']),
});

export type FranchiseDueFormValues = z.infer<typeof franchiseDueSchema>;
