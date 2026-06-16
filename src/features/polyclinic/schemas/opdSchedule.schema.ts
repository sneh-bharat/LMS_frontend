import { z } from 'zod';

/** Mirrors the manual validation in AddOpdSchedule. */
export const opdScheduleSchema = z
  .object({
    doctorId: z.coerce.number().refine((v) => v > 0, 'Please select a doctor'),
    center: z.string().min(1, 'Please select a center'),
    days: z.array(z.string()).min(1, 'Select at least one day'),
    startTime: z.string().min(1, 'Start time is required'),
    endTime: z.string().min(1, 'End time is required'),
    maxPatients: z.coerce.number().min(1, 'Must be at least 1'),
  })
  .refine((d) => !d.startTime || !d.endTime || d.endTime > d.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });
