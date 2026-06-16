import { z } from 'zod';

/** Mirrors the original `validate()` in NewAppointment exactly. */
export const appointmentSchema = z.object({
  consultingType: z.string().min(1, 'Required'),
  department: z.string().min(1, 'Required'),
  selectedTest: z.string().min(1, 'Required'),
  slot: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  patientName: z.string().trim().min(1, 'Required'),
  age: z.string().refine((v) => !!v && !Number.isNaN(Number(v)), 'Invalid'),
  phone: z.string().refine((v) => v.trim().length >= 10, 'Invalid'),
});
