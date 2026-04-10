/**
 * Test API Service
 * 
 * This service handles all API operations for Test management.
 * 
 * API Endpoints:
 * - GET    /tests?page=0&size=10       - Get all tests (paginated)
 * - GET    /tests/{testId}             - Get test by ID
 * - POST   /tests                       - Create new test
 * - PUT    /tests/{testId}              - Update test
 * - DELETE /tests/{testId}              - Delete test
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.29.228:8080/api/v1';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ReferenceRange {
  id?: number;
  gender: string;
  ageMin: number;
  ageMax: number;
  minValue: number;
  maxValue: number;
  unit: string;
}

export interface Parameter {
  id?: number;
  parameterName: string;
  unit: string;
  criticalLow: number;
  criticalHigh: number;
  resultType: string;
  isCalculated: boolean;
  calculationFormula?: string;
  sortOrder?: number;
  referenceRanges?: ReferenceRange[];
}

export interface SampleRequirement {
  id?: number;
  sampleType: string;
  volumeMl: number;
  containerColor: string;
  storageCondition: string;
  transportCondition: string;
}

export interface TestVersion {
  id?: number;
  versionNo: number;
  method: string;
  unit: string;
  price: number;
  cghsPrice?: number;
  effectiveFrom: string;
  effectiveTo: string;
}

export interface Test {
  id: number;
  testCode: string;
  testName: string;
  testNameShort?: string;
  description?: string;
  departmentId: number;
  categoryId: number;
  loincCode?: string;
  tatHours: number;
  isActive: boolean;
  isCalculated: boolean;
  version?: TestVersion;
  parameters?: Parameter[];
  sampleRequirements?: SampleRequirement[];
  createdAt: string;
  updatedAt: string;
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

export interface CreateTestInput {
  testCode: string;
  testName: string;
  description?: string;
  departmentId: number;
  categoryId: number;
  loincCode?: string;
  tatHours: number;
  isActive?: boolean;
  version: {
    versionNo: number;
    method: string;
    unit: string;
    price: number;
    cghsPrice?: number;
    effectiveFrom: string;
    effectiveTo: string;
  };
  parameters?: Array<{
    parameterName: string;
    unit: string;
    criticalLow: number;
    criticalHigh: number;
    resultType: string;
    isCalculated: boolean;
    calculationFormula?: string;
    sortOrder?: number;
    referenceRanges?: Array<{
      gender: string;
      ageMin: number;
      ageMax: number;
      minValue: number;
      maxValue: number;
      unit: string;
    }>;
  }>;
  sampleRequirements?: Array<{
    sampleType: string;
    volumeMl: number;
    containerColor: string;
    storageCondition: string;
    transportCondition: string;
  }>;
}

export interface UpdateTestInput {
  testCode?: string;
  testName?: string;
  description?: string;
  departmentId?: number;
  categoryId?: number;
  loincCode?: string;
  tatHours?: number;
  isActive?: boolean;
  version?: {
    versionNo: number;
    method: string;
    unit: string;
    price: number;
    cghsPrice?: number;
    effectiveFrom: string;
    effectiveTo: string;
  };
  parameters?: Array<{
    id?: number;
    parameterName: string;
    unit: string;
    criticalLow: number;
    criticalHigh: number;
    resultType: string;
    isCalculated: boolean;
    calculationFormula?: string;
    sortOrder?: number;
    referenceRanges?: Array<{
      id?: number;
      gender: string;
      ageMin: number;
      ageMax: number;
      minValue: number;
      maxValue: number;
      unit: string;
    }>;
  }>;
  sampleRequirements?: Array<{
    id?: number;
    sampleType: string;
    volumeMl: number;
    containerColor: string;
    storageCondition: string;
    transportCondition: string;
  }>;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * GET ALL TESTS - Fetch all tests with pagination and filters
 * Endpoint: GET /tests?page=0&size=10
 */
export async function fetchTests(
  page: number = 0,
  size: number = 10,
  search?: string,
  status?: string
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const url = `${API_BASE_URL}/tests?${params}`;
    console.log('=== FETCHING TESTS ===');
    console.log('API URL:', url);
    console.log('Params:', { page, size, search, status });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('=== ERROR FETCHING TESTS ===');
      console.error('Error response:', errorData);
      throw new Error(errorData?.message || errorData?.error || `HTTP ${response.status}: Failed to fetch tests`);
    }

    const responseData = JSON.parse(responseText);
    console.log('=== SUCCESS ===');
    console.log('Full API Response:', JSON.stringify(responseData, null, 2));
    console.log('Response data object:', responseData.data);
    console.log('Content array:', responseData.data?.content);
    console.log('Total elements:', responseData.data?.totalElements);
    console.log('Total pages:', responseData.data?.totalPages);
    console.log('Page number:', responseData.data?.pageNo);
    console.log('Page size:', responseData.data?.pageSize);
    console.log('Is first page:', responseData.data?.first);
    console.log('Is last page:', responseData.data?.last);
    
    if (responseData.data?.content) {
      console.log('Number of tests in content:', responseData.data.content.length);
      console.log('First test:', responseData.data.content[0]);
    }
    
    return responseData;
  } catch (error) {
    console.error('Error fetching tests:', error);
    throw error;
  }
}

/**
 * GET TEST BY ID - Fetch a single test
 * Endpoint: GET /tests/{testId}
 */
export async function fetchTestById(testId: number): Promise<ApiResponse<Test>> {
  try {
    console.log('=== FETCHING TEST BY ID ===');
    console.log('Test ID:', testId);
    console.log('API URL:', `${API_BASE_URL}/tests/${testId}`);
    
    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);

    const responseText = await response.text();
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('=== ERROR FETCHING TEST ===');
      console.error('Error response:', errorData);
      throw new Error(errorData?.message || errorData?.error || `HTTP ${response.status}: Failed to fetch test`);
    }

    const responseData = JSON.parse(responseText);
    console.log('=== SUCCESS ===');
    console.log('Test data:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
}

/**
 * CREATE TEST - Create a new test
 * Endpoint: POST /tests
 */
export async function createTest(
  input: CreateTestInput
): Promise<ApiResponse<Test>> {
  try {
    console.log('=== CREATING TEST ===');
    console.log('Request body:', JSON.stringify(input, null, 2));
    console.log('API URL:', `${API_BASE_URL}/tests`);

    const response = await fetch(`${API_BASE_URL}/tests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('=== ERROR CREATING TEST ===');
      console.error('Error response:', errorData);
      
      const errorMessage = errorData?.message || errorData?.error || `HTTP ${response.status}: Failed to create test`;
      throw new Error(errorMessage);
    }

    const responseData = JSON.parse(responseText);
    console.log('=== SUCCESS ===');
    console.log('Created test:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
}

/**
 * UPDATE TEST - Update an existing test
 * Endpoint: PUT /tests/{testId}
 */
export async function updateTest(
  testId: number,
  input: UpdateTestInput
): Promise<ApiResponse<Test>> {
  try {
    console.log('=== UPDATING TEST ===');
    console.log('Test ID:', testId);
    console.log('Request body:', JSON.stringify(input, null, 2));
    console.log('API URL:', `${API_BASE_URL}/tests/${testId}`);

    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('=== ERROR UPDATING TEST ===');
      console.error('Error response:', errorData);
      
      const errorMessage = errorData?.message || errorData?.error || `HTTP ${response.status}: Failed to update test`;
      throw new Error(errorMessage);
    }

    const responseData = JSON.parse(responseText);
    console.log('=== SUCCESS ===');
    console.log('Updated test:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
}

/**
 * DELETE TEST - Delete a test
 * Endpoint: DELETE /tests/{testId}
 */
export async function deleteTest(testId: number): Promise<ApiResponse<void>> {
  try {
    console.log('=== DELETING TEST ===');
    console.log('Test ID:', testId);
    console.log('API URL:', `${API_BASE_URL}/tests/${testId}`);

    const response = await fetch(`${API_BASE_URL}/tests/${testId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);

    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('=== ERROR DELETING TEST ===');
      console.error('Error response:', errorData);
      
      const errorMessage = errorData?.message || errorData?.error || `HTTP ${response.status}: Failed to delete test`;
      throw new Error(errorMessage);
    }

    const responseData = JSON.parse(responseText);
    console.log('=== SUCCESS ===');
    console.log('Delete response:', responseData);
    
    return responseData;
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
}

/**
 * Toggle test active status (Optional - if you need this feature)
 * Endpoint: PATCH /tests/{testId}/status
 */
export async function toggleTestStatus(
  testId: number,
  isActive: boolean
): Promise<ApiResponse<Test>> {
  try {
    console.log('=== TOGGLING TEST STATUS ===');
    console.log('Test ID:', testId);
    console.log('New status:', isActive);
    console.log('API URL:', `${API_BASE_URL}/tests/${testId}/status`);
    
    const response = await fetch(`${API_BASE_URL}/tests/${testId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    console.log('Response status:', response.status);

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('=== ERROR TOGGLING STATUS ===');
      console.error('Error response:', errorData);
      throw new Error(errorData?.message || errorData?.error || 'Failed to update status');
    }

    const responseData = JSON.parse(responseText);
    console.log('=== SUCCESS ===');
    console.log('Updated test:', JSON.stringify(responseData, null, 2));
    
    return responseData;
  } catch (error) {
    console.error('Error toggling test status:', error);
    throw error;
  }
}

// ─── Helper Functions ───────────────────────────────────────────────────────

export function validateTestData(data: Partial<CreateTestInput>): string[] {
  const errors: string[] = [];

  if (!data.testCode || data.testCode.trim() === '') {
    errors.push('Test code is required');
  }

  if (!data.testName || data.testName.trim() === '') {
    errors.push('Test name is required');
  }

  if (!data.departmentId) {
    errors.push('Department ID is required');
  }

  if (!data.categoryId) {
    errors.push('Category ID is required');
  }

  if (!data.tatHours || data.tatHours <= 0) {
    errors.push('Turnaround time must be a positive number');
  }

  if (!data.version) {
    errors.push('Test version information is required');
  } else {
    if (!data.version.method) {
      errors.push('Version method is required');
    }
    if (!data.version.unit) {
      errors.push('Version unit is required');
    }
    if (!data.version.price || data.version.price <= 0) {
      errors.push('Version price must be a positive number');
    }
    if (!data.version.effectiveFrom) {
      errors.push('Version effectiveFrom date is required');
    }
    if (!data.version.effectiveTo) {
      errors.push('Version effectiveTo date is required');
    }
  }

  return errors;
}