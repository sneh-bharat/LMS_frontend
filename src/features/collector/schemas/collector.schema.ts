import { z } from 'zod';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Add-collector validation (mirrors the original validate()). */
export const collectorSchema = z.object({
  branchId: z.coerce.number().refine((v) => v >= 1, 'Branch is required.'),
  fullName: z.string().trim().min(1, 'Full name is required.'),
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().min(1, 'Password is required.').min(6, 'Password must be at least 6 characters.'),
  phone: z.string().trim().min(1, 'Phone is required.'),
  email: z.string().trim().min(1, 'Email is required.').regex(EMAIL_RE, 'Enter a valid email.'),
});

/** Edit-collector validation — password optional, but if present must be >= 6 chars. */
export const editCollectorSchema = z.object({
  branchId: z.coerce.number().refine((v) => v >= 1, 'Branch is required.'),
  fullName: z.string().trim().min(1, 'Full name is required.'),
  username: z.string().trim().min(1, 'Username is required.'),
  password: z.string().refine((v) => !v.trim() || v.length >= 6, 'Password must be at least 6 characters.'),
  phone: z.string().trim().min(1, 'Phone is required.'),
  email: z.string().trim().min(1, 'Email is required.').regex(EMAIL_RE, 'Enter a valid email.'),
});
