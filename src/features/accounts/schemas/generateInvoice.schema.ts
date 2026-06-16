import { z } from 'zod';

/** Zod schema for the "Generate Invoice" form (replaces manual validation in genaret.tsx). */
export const generateInvoiceSchema = z
  .object({
    b2b: z.string().min(1, 'Please select a B2B'),
    startDate: z.string().min(1, 'Start date required'),
    endDate: z.string().min(1, 'End date required'),
    invoiceType: z.string().min(1),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: 'End date cannot be before start date',
    path: ['endDate'],
  });

export type GenerateInvoiceFormValues = z.infer<typeof generateInvoiceSchema>;
