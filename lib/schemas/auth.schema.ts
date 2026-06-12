// Requires: npm install zod
import { z } from 'zod';

export const LoginPayloadSchema = z.object({
  username: z.string().min(1, 'Username is required').max(100),
  password: z.string().min(1, 'Password is required').max(200),
  deviceTypes: z.literal('BROWSER'),
  deviceId: z.string().uuid('Invalid device ID'),
});

export const LoginDetailsSchema = z.object({
  id: z.number().int().positive(),
  fullName: z.string().nullable(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  role: z.string().min(1),
  adminType: z.string().nullable().optional(),
  branchId: z.number().int().nullable(),
  tenantId: z.number().int().nullable(),
});

export const LoginResponseSchema = z.object({
  data: z.object({
    token: z.string().min(1),
    refreshToken: z.string().min(1),
    loginDetails: LoginDetailsSchema,
  }),
  message: z.string(),
  response: z.boolean(),
  status: z.string(),
  timestamp: z.string(),
});

export const DoctorProfileSchema = z.object({
  id: z.number().int().positive(),
  doctorName: z.string(),
  doctorEmail: z.string().email().optional(),
  doctorPhone: z.string().optional(),
  username: z.string(),
  role: z.literal('DOCTOR'),
  specialization: z.string().optional(),
  branchId: z.number().int().nullable(),
  branchName: z.string().nullable().optional(),
  isActive: z.boolean(),
  isVerified: z.boolean(),
  deviceId: z.string().nullable().optional(),
  deviceTypes: z.string().nullable().optional(),
  tenantId: z.number().int().nullable().optional(),
  hospitalName: z.string().nullable().optional(),
});

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    message: z.string(),
    response: z.boolean(),
    status: z.string(),
    timestamp: z.string().optional(),
  });

export type LoginPayload = z.infer<typeof LoginPayloadSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type DoctorProfile = z.infer<typeof DoctorProfileSchema>;
