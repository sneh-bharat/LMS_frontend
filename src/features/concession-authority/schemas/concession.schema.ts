import { z } from 'zod';

export const concessionSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  allowedPercentage: z.coerce.number().min(1).max(16),
});

export type ConcessionFormValues = z.infer<typeof concessionSchema>;
