import { z } from 'zod';

/** Credentials entered in the login form. Replaces the manual `if (!username || !password)`. */
export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
