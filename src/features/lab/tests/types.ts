/**
 * Type definitions for Test management
 * 
 * This file re-exports types from TestApis.ts for use in the tests module
 */

import type { TestVersion, SampleRequirement, Parameter } from '@/features/lab/services/lab.service';

export type {
  Test,
  TestVersion,
  Parameter as TestParameter,
  SampleRequirement,
  ReferenceRange,
  ApiResponse,
  PaginatedResponse,
  CreateTestInput,
  UpdateTestInput,
  CreateSampleRequirementInput,
  UpdateSampleRequirementInput,
} from '@/features/lab/services/lab.service';

/**
 * Form data structure for NewTest component
 * This is different from the API Test type - it's the form state shape
 */
export interface TestItem {
  testCode: string;
  testName: string;
  departmentId: string;
  categoryId: string;
  loincCode: string;
  tatHours: string;
  isActive: boolean;
  // Flat structure (no nested version object)
  method: string;
  unit: string;
  price: string;
  cghsPrice: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  parameters: Parameter[];
  sampleRequirements: SampleRequirement[];
}
