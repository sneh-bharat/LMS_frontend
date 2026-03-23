/**
 * Test Packages API Service
 * 
 * This service handles all API operations for Test Package management.
 * Replace the mock implementations with actual API calls when integrating with backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// ─── Types ──────────────────────────────────────────────────────────────────
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
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CreatePackageInput {
  packageCode: string;
  packageName: string;
  description?: string;
  price: number;
  isActive?: boolean;
  testIds?: number[];
}

export interface UpdatePackageInput extends Partial<CreatePackageInput> {}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Fetch all test packages with pagination and filters
 */
export async function fetchPackages(
  page: number = 0,
  size: number = 10,
  search?: string,
  category?: string
): Promise<PaginatedResponse<TestPackage>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      ...(search && { search }),
      ...(category && { category }),
    });

    const response = await fetch(`${API_BASE_URL}/test-packages?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching packages:', error);
    throw error;
  }
}

/**
 * Fetch a single test package by ID
 */
export async function fetchPackageById(id: number): Promise<TestPackage> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-packages/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch package');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching package:', error);
    throw error;
  }
}

/**
 * Create a new test package
 */
export async function createPackage(
  input: CreatePackageInput
): Promise<ApiResponse<TestPackage>> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create package');
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Package created successfully',
    };
  } catch (error) {
    console.error('Error creating package:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update an existing test package
 */
export async function updatePackage(
  id: number,
  input: UpdatePackageInput
): Promise<ApiResponse<TestPackage>> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-packages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update package');
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Package updated successfully',
    };
  } catch (error) {
    console.error('Error updating package:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Delete a test package
 */
export async function deletePackage(id: number): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-packages/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete package');
    }

    return {
      success: true,
      message: 'Package deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting package:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Toggle package active status
 */
export async function togglePackageStatus(
  id: number,
  isActive: boolean
): Promise<ApiResponse<TestPackage>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/test-packages/${id}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update status');
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Status updated successfully',
    };
  } catch (error) {
    console.error('Error toggling package status:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add tests to a package
 */
export async function addTestsToPackage(
  packageId: number,
  testIds: number[]
): Promise<ApiResponse<TestPackage>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/test-packages/${packageId}/tests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testIds }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add tests');
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Tests added successfully',
    };
  } catch (error) {
    console.error('Error adding tests to package:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Remove tests from a package
 */
export async function removeTestsFromPackage(
  packageId: number,
  testIds: number[]
): Promise<ApiResponse<TestPackage>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/test-packages/${packageId}/tests`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testIds }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove tests');
    }

    const data = await response.json();
    return {
      success: true,
      data,
      message: 'Tests removed successfully',
    };
  } catch (error) {
    console.error('Error removing tests from package:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Fetch available tests for package creation
 */
export async function fetchAvailableTests(
  category?: string
): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      ...(category && { category }),
    });

    const response = await fetch(`${API_BASE_URL}/tests?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch tests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tests:', error);
    return [];
  }
}

// ─── Mock Data for Development ──────────────────────────────────────────────

export const MOCK_PACKAGES: TestPackage[] = [
  {
    id: 1,
    packageCode: 'PKG001',
    packageName: 'Basic Health Checkup',
    description: 'Comprehensive basic health screening including CBC, Lipid Profile, Liver Function',
    price: 2500,
    isActive: true,
    tests: [
      { id: 1, testName: 'Complete Blood Count', testCode: 'CBC', category: 'Hematology' },
      { id: 2, testName: 'Lipid Profile', testCode: 'LP', category: 'Biochemistry' },
      { id: 3, testName: 'Liver Function Test', testCode: 'LFT', category: 'Biochemistry' },
    ],
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    packageCode: 'PKG002',
    packageName: 'Advanced Cardiac Risk Profile',
    description: 'Detailed cardiac risk assessment with Troponin, NT-proBNP, Homocysteine',
    price: 4500,
    isActive: true,
    tests: [
      { id: 4, testName: 'Troponin T', testCode: 'TNT', category: 'Cardiology' },
      { id: 5, testName: 'NT-proBNP', testCode: 'NTBNP', category: 'Cardiology' },
      { id: 6, testName: 'Homocysteine', testCode: 'HCY', category: 'Biochemistry' },
    ],
    createdAt: '2024-01-20T10:00:00Z',
  },
];

// ─── Helper Functions ───────────────────────────────────────────────────────

export function validatePackageData(data: Partial<TestPackage>): string[] {
  const errors: string[] = [];

  if (!data.packageCode || data.packageCode.trim() === '') {
    errors.push('Package code is required');
  }

  if (!data.packageName || data.packageName.trim() === '') {
    errors.push('Package name is required');
  }

  if (!data.price || data.price <= 0) {
    errors.push('Price must be greater than 0');
  }

  if (data.tests && data.tests.length === 0) {
    errors.push('At least one test should be included in the package');
  }

  return errors;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}
