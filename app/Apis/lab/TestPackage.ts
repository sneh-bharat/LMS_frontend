/**
 * Test Package API Service - COMPLETE FIXED VERSION
 * 
 * Features:
 * - Proper response structure handling (nested & flat)
 * - Standardized error handling
 * - Logging utility for debugging
 * - Type-safe API calls
 * - Server-side filtering support
 */

import labClient from '@/app/Apis/lab/axios';

// ─── Logger Utility ──────────────────────────────────────────────────────────

const logger = {
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data);
    }
  },
};

// ─── Error Handler Utility ──────────────────────────────────────────────────

class ApiErrorHandler {
  static handle(response: Response, responseText: string): { code: string; message: string; details?: unknown } {
    try {
      const data = JSON.parse(responseText);
      return {
        code: data.code || `HTTP_${response.status}`,
        message: data.message || data.error || this.getStatusMessage(response.status),
        details: data,
      };
    } catch {
      return {
        code: `HTTP_${response.status}`,
        message: responseText || this.getStatusMessage(response.status),
        details: null,
      };
    }
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && (error as any).message === 'Failed to fetch';
  }

  private static getStatusMessage(status: number): string {
    const messages: { [key: number]: string } = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return messages[status] || `HTTP ${status}: An error occurred`;
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TestPackageItem {
  testId: number;
  displayOrder?: number;
}

export interface TestDetailItem extends TestPackageItem {
  testName: string;
  testCode: string;
  category: string;
  displayOrder?: number;
  discount?: number;
}

export interface TestPackage {
  id?: number;
  packageCode: string;
  packageName: string;
  description?: string;
  packagePrice: number;
  specialInstructions?: string;
  isActive: boolean;
  tests?: TestPackageItem[];
}

// ✅ Separate interface for detailed response with full test info
export interface TestPackageDetail {
  id: number;
  packageCode: string;
  packageName: string;
  description?: string;
  packagePrice: number;
  specialInstructions?: string;
  isActive: boolean;
  tests: TestDetailItem[];
}

// ✅ API response structure for detail endpoint
interface PackageInfoResponse {
  id: number;
  packageCode: string;
  packageName: string;
  description?: string;
  packagePrice: number;
  specialInstructions?: string;
  isActive: boolean;
}

interface TestPackageDetailResponse {
  packageInfo: PackageInfoResponse;
  tests: TestDetailItem[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  last: boolean;
  pageNo: number;
  totalPages: number;
  pageSize: number;
  content: T[];
  first: boolean;
  totalElements: number;
}

export interface CreateTestPackageInput {
  packageCode: string;
  packageName: string;
  description?: string;
  packagePrice: number;
  specialInstructions?: string;
  isActive: boolean;
  branchId: number;
  tests: Array<{
    testId: number;
    displayOrder?: number;
  }>;
}

export interface UpdateTestPackageInput {
  packageCode: string;
  packageName: string;
  description?: string;
  packagePrice: number;
  specialInstructions?: string;
  isActive: boolean;
  branchId: number;
  tests: Array<{
    testId: number;
    displayOrder?: number;
  }>;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * GET ALL TEST PACKAGES - Fetch packages with pagination, search, and filtering
 * 
 * @param pageNo - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @param search - Optional search term for package name or code
 * @param category - Optional category filter
 * @returns Paginated list of test packages
 */
export async function fetchTestPackages(
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string,
  category?: string
): Promise<ApiResponse<PaginatedResponse<TestPackage>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    if (category && category !== 'All') {
      params.append('category', category);
    }

    const url = `/api/v1/test-packages?${params}`;
    logger.debug('Fetching test packages', { pageNo, pageSize, search, category });

    const response = await labClient.get<ApiResponse<PaginatedResponse<TestPackage>>>(url) as any;
    
    logger.debug('Successfully fetched test packages', {
      count: response.data?.content?.length,
      totalElements: response.data?.totalElements,
      totalPages: response.data?.totalPages,
    });

    return response;
  } catch (error) {
    logger.error('Failed to fetch test packages', error);
    throw error;
  }
}

/**
 * GET TEST PACKAGE BY ID - Fetch single package with full test details
 * 
 * @param packageId - Package ID to fetch
 * @returns Test package with detailed test information
 */
export async function fetchTestPackageById(
  packageId: number
): Promise<ApiResponse<TestPackageDetail>> {
  try {
    const url = `/api/v1/test-packages/${packageId}`;
    logger.debug('Fetching test package details', { packageId, url });

    // Axios interceptor unwraps response.data, so 'response' is already the unwrapped data
    const response: ApiResponse<any> = await labClient.get<ApiResponse<any>>(url) as any;
    
    logger.debug('Raw response from API', { response });

    // Check if the response indicates an error
    if (response.response === false) {
      throw new Error(response.message || 'Failed to fetch test package');
    }

    const detail = response.data;

    if (!detail) {
      throw new Error(`No data returned for package ID: ${packageId}`);
    }

    logger.debug('Package detail data', { detail });

    // ✅ Handle both nested (packageInfo + tests) and flat structures
    let packageInfo: PackageInfoResponse;
    let tests: TestDetailItem[] = [];

    if (detail.packageInfo) {
      // Nested structure
      logger.debug('Using nested structure');
      packageInfo = detail.packageInfo;
      tests = detail.tests || [];
    } else {
      // Flat structure - assume the whole detail is the package info
      logger.debug('Using flat structure');
      packageInfo = {
        id: detail.id,
        packageCode: detail.packageCode,
        packageName: detail.packageName,
        description: detail.description,
        packagePrice: detail.packagePrice,
        specialInstructions: detail.specialInstructions,
        isActive: detail.isActive,
      };
      tests = detail.tests || [];
    }

    const transformedData: TestPackageDetail = {
      id: packageInfo.id,
      packageCode: packageInfo.packageCode,
      packageName: packageInfo.packageName,
      description: packageInfo.description,
      packagePrice: packageInfo.packagePrice,
      specialInstructions: packageInfo.specialInstructions,
      isActive: packageInfo.isActive,
      tests: tests,
    };

    logger.debug('Successfully fetched test package details', {
      packageId,
      packageName: packageInfo.packageName,
      testCount: tests.length,
    });

    // Return transformed data while preserving the API response structure
    return {
      ...response,
      data: transformedData,
    };
  } catch (error: any) {
    logger.error('Failed to fetch test package details', {
      packageId,
      error: error.message || error,
      response: error.response?.data,
    });
    throw error;
  }
}

/**
 * CREATE TEST PACKAGE - Create a new test package
 * 
 * @param input - Package creation data including tests
 * @returns Created package with ID
 */
export async function createTestPackage(
  input: CreateTestPackageInput
): Promise<ApiResponse<TestPackage>> {
  try {
    // Validate input before sending
    const validationErrors = validateTestPackageData(input);
    if (validationErrors.length > 0) {
      logger.warn('Validation errors in package data', validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const url = `/api/v1/test-packages`;
    logger.debug('Creating test package', { 
      packageCode: input.packageCode,
      packageName: input.packageName,
      testCount: input.tests.length,
    });

    const response = await labClient.post<ApiResponse<TestPackage>>(url, input) as any;
    
    logger.debug('Successfully created test package', { 
      id: response.data?.id,
      packageCode: input.packageCode,
    });

    return response;
  } catch (error) {
    logger.error('Failed to create test package', error);
    throw error;
  }
}

/**
 * UPDATE TEST PACKAGE - Update an existing test package
 * 
 * PUT /api/v1/test-packages/{packageId}
 * 
 * Request Body:
 * - packageCode (required)
 * - packageName (required)
 * - description (optional)
 * - packagePrice (required)
 * - specialInstructions (optional)
 * - isActive (required)
 * - branchId (required)
 * - tests (required) - Array of { testId, displayOrder }
 * 
 * @param packageId - ID of package to update
 * @param input - Updated package data
 * @returns Updated package
 */
export async function updateTestPackage(
  packageId: number,
  input: UpdateTestPackageInput
): Promise<ApiResponse<TestPackage>> {
  try {
    const url = `/api/v1/test-packages/${packageId}`;
    
    logger.debug('Updating test package', { 
      packageId,
      url,
      payload: input,
      hasName: !!input.packageName,
      hasDescription: !!input.description,
      hasPrice: input.packagePrice !== undefined,
      hasInstructions: !!input.specialInstructions,
      hasIsActive: input.isActive !== undefined,
      testCount: input.tests?.length || 0,
      tests: input.tests,
    });

    const response: ApiResponse<TestPackage> = await labClient.put<ApiResponse<TestPackage>>(url, input) as any;
    
    // Check if the response indicates an error
    if (response.response === false) {
      throw new Error(response.message || 'Failed to update test package');
    }
    
    logger.debug('Successfully updated test package', { 
      packageId,
      updatedData: response.data,
    });

    return response;
  } catch (error: any) {
    logger.error('Failed to update test package', { 
      packageId,
      error: error.message || error,
      response: error.response?.data,
      payload: input,
    });
    throw error;
  }
}

/**
 * DELETE TEST PACKAGE - Delete a test package
 * 
 * @param packageId - ID of package to delete
 * @returns Void response on success
 */
export async function deleteTestPackage(
  packageId: number
): Promise<ApiResponse<void>> {
  try {
    const url = `/api/v1/test-packages/${packageId}`;
    logger.debug('Deleting test package', { packageId });

    const response = await labClient.delete<ApiResponse<void>>(url) as any;
    
    logger.debug('Successfully deleted test package', { packageId });

    return response;
  } catch (error) {
    logger.error('Failed to delete test package', error);
    throw error;
  }
}

// ─── Validation Helper ──────────────────────────────────────────────────────

export function validateTestPackageData(data: Partial<CreateTestPackageInput>): string[] {
  const errors: string[] = [];

  // Package Code
  if (!data.packageCode?.trim()) {
    errors.push('Package code is required');
  } else if (data.packageCode.length > 20) {
    errors.push('Package code must be 20 characters or less');
  }

  // Package Name
  if (!data.packageName?.trim()) {
    errors.push('Package name is required');
  } else if (data.packageName.length > 100) {
    errors.push('Package name must be 100 characters or less');
  }

  // Price
  if (data.packagePrice === undefined || data.packagePrice === null) {
    errors.push('Package price is required');
  } else if (typeof data.packagePrice !== 'number') {
    errors.push('Package price must be a number');
  } else if (data.packagePrice < 0) {
    errors.push('Package price cannot be negative');
  } else if (data.packagePrice === 0) {
    errors.push('Package price must be greater than 0');
  }

  // Active Status
  if (typeof data.isActive !== 'boolean') {
    errors.push('Active status is required');
  }

  // Branch ID
  if (!data.branchId || data.branchId <= 0) {
    errors.push('Branch ID is required and must be a positive number');
  }

  // Tests
  if (!data.tests || !Array.isArray(data.tests)) {
    errors.push('Tests array is required');
  } else if (data.tests.length === 0) {
    errors.push('At least one test must be included in the package');
  } else {
    const testIds = new Set<number>();
    
    data.tests.forEach((test, index) => {
      // Check for duplicate tests
      if (testIds.has(test.testId)) {
        errors.push(`Duplicate test at index ${index}: Test ID ${test.testId} is already included`);
      }
      testIds.add(test.testId);

      // Validate test ID
      if (!test.testId || typeof test.testId !== 'number') {
        errors.push(`Test ID is required and must be a number (index ${index})`);
      }

      // Validate displayOrder (optional, but must be positive if provided)
      if (test.displayOrder !== undefined && test.displayOrder !== null) {
        if (typeof test.displayOrder !== 'number') {
          errors.push(`Display order must be a number (test index ${index})`);
        } else if (test.displayOrder < 1) {
          errors.push(`Display order must be at least 1 (test index ${index})`);
        }
      }
    });
  }

  return errors;
}

/**
 * Validate update package data
 */
export function validateUpdateTestPackageData(data: Partial<UpdateTestPackageInput>): string[] {
  const errors: string[] = [];

  // Package Code
  if (!data.packageCode?.trim()) {
    errors.push('Package code is required');
  } else if (data.packageCode.length > 20) {
    errors.push('Package code must be 20 characters or less');
  }

  // Package Name
  if (!data.packageName?.trim()) {
    errors.push('Package name is required');
  } else if (data.packageName.length > 100) {
    errors.push('Package name must be 100 characters or less');
  }

  // Price
  if (data.packagePrice === undefined || data.packagePrice === null) {
    errors.push('Package price is required');
  } else if (typeof data.packagePrice !== 'number') {
    errors.push('Package price must be a number');
  } else if (data.packagePrice < 0) {
    errors.push('Package price cannot be negative');
  } else if (data.packagePrice === 0) {
    errors.push('Package price must be greater than 0');
  }

  // Active Status
  if (typeof data.isActive !== 'boolean') {
    errors.push('Active status is required');
  }

  // Branch ID
  if (!data.branchId || data.branchId <= 0) {
    errors.push('Branch ID is required and must be a positive number');
  }

  // Tests
  if (!data.tests || !Array.isArray(data.tests)) {
    errors.push('Tests array is required');
  } else if (data.tests.length === 0) {
    errors.push('At least one test must be included in the package');
  } else {
    const testIds = new Set<number>();
    
    data.tests.forEach((test, index) => {
      // Check for duplicate tests
      if (testIds.has(test.testId)) {
        errors.push(`Duplicate test at index ${index}: Test ID ${test.testId} is already included`);
      }
      testIds.add(test.testId);

      // Validate test ID
      if (!test.testId || typeof test.testId !== 'number') {
        errors.push(`Test ID is required and must be a number (index ${index})`);
      }

      // Validate displayOrder (optional, but must be positive if provided)
      if (test.displayOrder !== undefined && test.displayOrder !== null) {
        if (typeof test.displayOrder !== 'number') {
          errors.push(`Display order must be a number (test index ${index})`);
        } else if (test.displayOrder < 1) {
          errors.push(`Display order must be at least 1 (test index ${index})`);
        }
      }
    });
  }

  return errors;
}

/**
 * Type guard to check if data is a TestPackageArray
 */
export function isTestPackageArray(data: unknown): data is TestPackage[] {
  return (
    Array.isArray(data) &&
    data.every(item =>
      typeof item === 'object' &&
      item !== null &&
      'packageCode' in item &&
      'packageName' in item &&
      'packagePrice' in item &&
      'isActive' in item
    )
  );
}

/**
 * Type guard for TestPackageDetail
 */
export function isTestPackageDetail(data: unknown): data is TestPackageDetail {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'packageCode' in data &&
    'packageName' in data &&
    'packagePrice' in data &&
    'tests' in data &&
    Array.isArray((data as any).tests)
  );
}