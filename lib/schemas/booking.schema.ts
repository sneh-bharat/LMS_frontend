// Requires: npm install zod
import { z } from 'zod';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const TestOrderStatusSchema = z.enum([
  'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED',
]);

export const PaymentStatusSchema = z.enum(['PAID', 'UNPAID', 'PARTIAL']);

export const OrderPrioritySchema = z.enum(['ROUTINE', 'URGENT', 'STAT']);

export const ResultStatusSchema = z.enum(['DRAFT', 'VERIFIED', 'PUBLISHED']);

// ─── Test Order ───────────────────────────────────────────────────────────────

export const TestOrderItemSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  testId: z.number().int().positive(),
  testName: z.string().nullable().optional(),
  testPrice: z.number().nonnegative(),
  netPrice: z.number().nonnegative(),
  discountPercentage: z.number().min(0).max(100),
  unit: z.string().nullable().optional(),
  referenceRange: z.string().nullable().optional(),
  resultValue: z.string().nullable().optional(),
  resultStatus: z.string(),
  remarks: z.string().nullable().optional(),
  abnormalFlag: z.string().nullable().optional(),
  sampleId: z.number().int().nullable().optional(),
  isActive: z.boolean(),
  isCritical: z.boolean(),
});

export const TestOrderSchema = z.object({
  id: z.number().int().positive(),
  orderNumber: z.string(),
  patientId: z.number().int().positive(),
  patientName: z.string().nullable().optional(),
  referringDoctorId: z.number().int().nullable().optional(),
  referringDoctorName: z.string().nullable().optional(),
  referringHospitalId: z.number().int().nullable().optional(),
  referringHospitalName: z.string().nullable().optional(),
  orderDate: z.string(),
  priority: OrderPrioritySchema.or(z.string()),
  orderStatus: TestOrderStatusSchema.or(z.string()),
  paymentStatus: PaymentStatusSchema.or(z.string()),
  isActive: z.boolean(),
  isPaid: z.boolean(),
  isEmergency: z.boolean(),
  hasDiabetes: z.boolean(),
  hasHypertension: z.boolean(),
  hasAnaemia: z.boolean(),
  hasThyroid: z.boolean(),
  hasArthritis: z.boolean(),
  hasAsthma: z.boolean(),
  drugAllergy: z.string().optional(),
  otherPreExistingDisease: z.string().optional(),
  lmpDate: z.string().nullable().optional(),
  clinicalNotes: z.string().optional(),
  srfId: z.string().optional(),
  referrerName: z.string().optional(),
  testOrderItems: z.array(TestOrderItemSchema).optional(),
  totalAmount: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  netAmount: z.number().nonnegative().optional(),
  paidAmount: z.number().nonnegative().optional(),
  dueAmount: z.number().nonnegative().optional(),
});

// ─── Patient ──────────────────────────────────────────────────────────────────

export const GenderSchema = z.enum(['MALE', 'FEMALE', 'OTHER']);

export const PatientSchema = z.object({
  id: z.number().int().positive(),
  patientCode: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  gender: GenderSchema.or(z.string()),
  dateOfBirth: z.string().optional(),
  age: z.number().int().nonnegative().optional(),
  address: z.string().optional(),
  isActive: z.boolean(),
  tenantId: z.number().int().nullable().optional(),
});

// ─── Pagination ───────────────────────────────────────────────────────────────

export const PageableSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    number: z.number().int().nonnegative(),
    first: z.boolean(),
    last: z.boolean(),
  });

// ─── Exported types ───────────────────────────────────────────────────────────

export type TestOrder = z.infer<typeof TestOrderSchema>;
export type TestOrderItem = z.infer<typeof TestOrderItemSchema>;
export type Patient = z.infer<typeof PatientSchema>;
export type TestOrderStatus = z.infer<typeof TestOrderStatusSchema>;
export type PaymentStatus = z.infer<typeof PaymentStatusSchema>;
