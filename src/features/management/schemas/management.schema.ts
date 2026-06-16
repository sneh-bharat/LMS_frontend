import { z } from 'zod';

export const mgmtBranchSchema = z.object({
  branchId: z.string().trim().min(1, 'Branch ID is required'),
  branchName: z.string().trim().min(1, 'Branch name is required'),
  location: z.string().trim().min(1, 'Location is required'),
  address: z.string().trim().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().trim().min(1, 'Zip code is required'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required'),
  email: z.string().trim().min(1, 'Email is required'),
  manager: z.string().trim().min(1, 'Manager name is required'),
});

export const mgmtDoctorSchema = z.object({
  name: z.string().trim().min(1, 'Doctor name is required'),
  specialization: z.string().trim().min(1, 'Specialization is required'),
  phone: z.string().trim().min(1, 'Phone is required'),
  email: z.string().trim().min(1, 'Email is required'),
  consultationFee: z
    .union([z.string(), z.number()])
    .refine((v) => v !== '' && Number(v) > 0, 'Valid consultation fee is required'),
});

export const mgmtLabTestSchema = z.object({
  branchId: z.string().trim().min(1, 'Branch ID is required'),
  testName: z.string().trim().min(1, 'Test name is required'),
  doctor: z.string().trim().min(1, 'Doctor name is required'),
});
