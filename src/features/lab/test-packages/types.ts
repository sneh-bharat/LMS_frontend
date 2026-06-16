/**
 * Test Packages Type Definitions
 */

export interface TestPackage {
  id: number;
  packageCode: string;
  packageName: string;
  description: string;
  price: number;
  isActive: boolean;
  tests: TestItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface TestItem {
  id: number;
  testName: string;
  testCode: string;
  category: string;
  method?: string;
  sampleType?: string;
  reportingTime?: string;
}

export interface PackageFormData {
  packageCode: string;
  packageName: string;
  description?: string;
  price: number;
  isActive: boolean;
  testIds: number[];
}
