import { z } from 'zod';

/** Mirrors the manual validation in AddQueueModal. */
export const queueSchema = z.object({
  patientName: z.string().trim().min(1, 'Patient name is required'),
  mobile: z
    .string()
    .trim()
    .min(1, 'Mobile number is required')
    .regex(/^\d{10}$/, 'Invalid mobile number (10 digits required)'),
  department: z.string().min(1, 'Department is required'),
  doctorId: z.coerce.number().refine((v) => v > 0, 'Please select a doctor'),
});
