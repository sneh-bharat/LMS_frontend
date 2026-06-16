import { z } from 'zod';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s\-+()]+$/;

/**
 * Branch form schema. Mirrors the original `validate()` exactly: only `branchName`
 * is required; email/phone are optional but format-checked when present.
 */
export const branchSchema = z.object({
  branchName: z.string().trim().min(1, 'Branch name is required'),
  branchType: z.string(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  postalCode: z.string(),
  contactEmail: z
    .string()
    .refine((v) => !v || EMAIL_RE.test(v), 'Invalid email format'),
  contactPhone: z
    .string()
    .refine((v) => !v || PHONE_RE.test(v), 'Invalid phone number format'),
  isActive: z.boolean(),
});

export type BranchFormValues = z.infer<typeof branchSchema>;
