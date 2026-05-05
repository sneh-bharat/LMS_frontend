/**
 * COMPLETE Test API Service
 * 
 * This is the improved version with ALL functions that NewTest.tsx needs
 * Includes: createSampleRequirement, updateSampleRequirement, createTestVersion, createTestParameter
 * 
 * Replace your current TestApis.ts with this file
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ;

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
    effectiveTo?: string;
  };
  parameters?: Array<{
    parameterName: string;
    unit: string;
    criticalLow?: number;
    criticalHigh?: number;
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
  }>;
}

export interface CreateSampleRequirementInput {
  sampleType: string;
  volumeMl: number;
  containerColor: string;
  storageCondition: string;
}

export interface UpdateSampleRequirementInput {
  sampleType?: string;
  volumeMl?: number;
  containerColor?: string;
  storageCondition?: string;
}

export interface SampleRequirementResponse {
  id?: number;
  sampleType: string;
  volumeMl: number;
  containerColor: string;
  storageCondition: string;
  testId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateParameterInput {
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
}

export interface ParameterResponse {
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
  testId?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * GET ALL TESTS - Fetch all tests with pagination and filters
 */
export async function fetchTests(
  page: number = 0,
  size: number = 10,
  search?: string,
  status?: string
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const normalizedBaseUrl = API_BASE_URL?.trim().replace(/\/+$/, '');
    if (!normalizedBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const url = `${normalizedBaseUrl}/tests?${params.toString()}`;
    console.log('=== FETCH TESTS DEBUG ===');
    console.log('API_BASE_URL:', normalizedBaseUrl);
    console.log('Full URL:', url);
    console.log('Environment variable:', process.env.NEXT_PUBLIC_API_URL);
    console.log('Request params:', { page, size, search, status });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response type:', response.type);
    console.log('Response URL:', response.url);
    
    const responseText = await response.text();
    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    let parsedData: unknown = null;

    if (responseText.trim().length > 0) {
      const looksLikeJson =
        contentType.includes('application/json') ||
        responseText.trim().startsWith('{') ||
        responseText.trim().startsWith('[');

      if (looksLikeJson) {
        try {
          parsedData = JSON.parse(responseText);
        } catch {
          parsedData = null;
        }
      }
    }
    console.log('Response text (first 200 chars):', responseText.substring(0, 200));

    if (!response.ok) {
      const errorData =
        parsedData && typeof parsedData === 'object'
          ? (parsedData as Record<string, unknown>)
          : { raw: responseText };
      const errorMessage =
        typeof errorData.message === 'string'
          ? errorData.message
          : typeof errorData.error === 'string'
            ? errorData.error
            : 'Failed to fetch tests';

      console.error('❌ ERROR FETCHING TESTS');
      console.error('HTTP Status:', response.status);
      console.error('HTTP Status Text:', response.statusText);
      console.error('Error data:', errorData);
      throw new Error(`[${response.status}] ${errorMessage}`);
    }

    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error(
        `Invalid response format from /tests (status ${response.status}). Expected JSON object.`
      );
    }

    const responseData = parsedData as ApiResponse<PaginatedResponse<Test>>;
    console.log('✅ Tests loaded successfully');
    console.log('Tests count:', responseData.data?.content?.length || 0);
    
    return responseData;
  } catch (error) {
    console.error('=== FETCH TESTS ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'N/A');
    
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const debugBaseUrl = API_BASE_URL?.trim().replace(/\/+$/, '') || 'API_BASE_URL_MISSING';
      console.error('\n🔌 NETWORK ERROR DETECTED:');
      console.error('- The server might be unreachable');
      console.error('- Check if the backend server is running');
      console.error('- Check your internet connection');
      console.error('- Check if CORS is configured on the server');
      console.error('- Try accessing the API directly in browser:', `${debugBaseUrl}/tests`);
    }
    
    throw error;
  }
}

/**
 * GET ACTIVE TESTS - Fetch active tests only
 * Endpoint: GET /tests/active?page=0&size=10
 */
export async function fetchActiveTests(
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const normalizedBaseUrl = API_BASE_URL?.trim().replace(/\/+$/, '');
    if (!normalizedBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    const url = `${normalizedBaseUrl}/tests/active?${params.toString()}`;
    console.log('=== FETCH ACTIVE TESTS DEBUG ===');
    console.log('API_BASE_URL:', normalizedBaseUrl);
    console.log('Full URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const responseText = await response.text();
    if (!response.ok) {
      let errorData: Record<string, unknown> = { raw: responseText };
      try {
        errorData = JSON.parse(responseText);
      } catch {
        // keep raw response for error context
      }
      console.error('❌ ERROR FETCHING ACTIVE TESTS');
      console.error('HTTP Status:', response.status);
      console.error('Error data:', errorData);
      throw new Error(`[${response.status}] Failed to fetch active tests`);
    }

    if (!responseText || responseText.trim() === '') {
      return {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageNo: page,
          pageSize: size,
          first: page === 0,
          last: true,
        },
        message: 'No active tests found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    return JSON.parse(responseText) as ApiResponse<PaginatedResponse<Test>>;
  } catch (error) {
    console.error('Error fetching active tests:', error);
    throw error;
  }
}

/**
 * GET TEST BY ID
 */
export async function fetchTestById(testId: number): Promise<ApiResponse<Test>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}`;
    console.log('📡 Fetching test:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const responseText = await response.text();
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error fetching test:', response.status);
      throw new Error(`[${response.status}] Failed to fetch test`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Test loaded');
    return responseData;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
}

/**
 * GET TEST BY CODE
 * Endpoint: GET /tests/code/{testCode}
 */
export async function fetchTestByCode(testCode: string): Promise<ApiResponse<Test | null>> {
  try {
    const normalizedBaseUrl = API_BASE_URL?.trim().replace(/\/+$/, '');
    if (!normalizedBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const encodedCode = encodeURIComponent(testCode.trim());
    const url = `${normalizedBaseUrl}/tests/code/${encodedCode}`;
    console.log('📡 Fetching test by code:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const responseText = await response.text();

    if (response.status === 404) {
      return {
        data: null,
        message: 'Test not found',
        response: true,
        status: '404',
        timestamp: new Date().toISOString(),
      };
    }

    if (!response.ok) {
      console.error('❌ Error fetching test by code:', response.status);
      throw new Error(`[${response.status}] Failed to fetch test by code`);
    }

    if (!responseText || responseText.trim() === '') {
      return {
        data: null,
        message: 'Test not found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    return JSON.parse(responseText) as ApiResponse<Test>;
  } catch (error) {
    console.error('Error fetching test by code:', error);
    throw error;
  }
}

/**
 * SEARCH TESTS BY NAME
 * Endpoint: GET /tests/search?name={name}&page=0&size=10&sort=testId,asc
 */
export async function searchTestsByName(
  name: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const normalizedBaseUrl = API_BASE_URL?.trim().replace(/\/+$/, '');
    if (!normalizedBaseUrl) {
      throw new Error('NEXT_PUBLIC_API_URL is not configured');
    }

    const params = new URLSearchParams({
      name: name.trim(),
      page: page.toString(),
      size: size.toString(),
      sort: 'testId,asc',
    });

    const url = `${normalizedBaseUrl}/tests/search?${params.toString()}`;
    console.log('📡 Searching tests by name:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const responseText = await response.text();
    if (!response.ok) {
      let errorData: Record<string, unknown> = { raw: responseText };
      try {
        errorData = JSON.parse(responseText);
      } catch {
        // keep raw
      }
      console.error('❌ Error searching tests by name:', response.status, errorData);
      throw new Error(`[${response.status}] Failed to search tests by name`);
    }

    if (!responseText || responseText.trim() === '') {
      return {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          pageNo: page,
          pageSize: size,
          first: page === 0,
          last: true,
        },
        message: 'No tests found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    return JSON.parse(responseText) as ApiResponse<PaginatedResponse<Test>>;
  } catch (error) {
    console.error('Error searching tests by name:', error);
    throw error;
  }
}

/**
 * CREATE TEST
 */
export async function createTest(
  input: CreateTestInput
): Promise<ApiResponse<Test>> {
  try {
    const url = `${API_BASE_URL}/tests`;
    console.log('📡 Creating test...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error creating test:', response.status);
      throw new Error(`[${response.status}] Failed to create test`);
    }

    const responseData = responseText?.trim()
      ? JSON.parse(responseText)
      : {
          data: null,
          message: 'Test created successfully',
          response: true,
          status: String(response.status),
          timestamp: new Date().toISOString(),
        };

    // Some backend variants return success with data: null.
    // Resolve and normalize created test so callers reliably receive an ID.
    const existingId =
      responseData?.data?.id ||
      responseData?.data?.testId;

    if (!existingId) {
      const locationHeader = response.headers.get('location');
      const locationIdMatch = locationHeader?.match(/\/tests\/(\d+)(?:\/|$)/);
      const locationId = locationIdMatch ? Number(locationIdMatch[1]) : undefined;

      if (locationId) {
        try {
          const byIdResponse = await fetchTestById(locationId);
          responseData.data = byIdResponse?.data || responseData.data;
        } catch (lookupByIdError) {
          console.warn('⚠️ Could not resolve created test from Location header:', lookupByIdError);
        }
      }
    }

    if (!responseData?.data?.id && input.testCode) {
      try {
        const lookupResponse = await fetchTests(0, 20, input.testCode);
        const matched = lookupResponse?.data?.content?.find(
          (item) => item?.testCode?.toLowerCase?.() === input.testCode.toLowerCase()
        );
        if (matched?.id) {
          responseData.data = matched;
        }
      } catch (lookupError) {
        console.warn('⚠️ Could not resolve created test by search:', lookupError);
      }
    }

    console.log('✅ Test created');
    return responseData;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
}

/**
 * UPDATE TEST
 */
export async function updateTest(
  testId: number,
  input: UpdateTestInput
): Promise<ApiResponse<Test>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}`;
    console.log('📡 Updating test...');

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error updating test:', response.status);
      throw new Error(`[${response.status}] Failed to update test`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Test updated');
    return responseData;
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
}

/**
 * DELETE TEST
 */
export async function deleteTest(testId: number): Promise<ApiResponse<void>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}`;
    console.log('📡 Deleting test...');

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error deleting test:', response.status);
      throw new Error(`[${response.status}] Failed to delete test`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Test deleted');
    return responseData;
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
}

/**
 * TOGGLE TEST STATUS
 */
export async function toggleTestStatus(
  testId: number,
  isActive: boolean
): Promise<ApiResponse<Test>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/status`;
    console.log('📡 Toggling status...');
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error toggling status:', response.status);
      throw new Error(`[${response.status}] Failed to toggle status`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Status toggled');
    return responseData;
  } catch (error) {
    console.error('Error toggling status:', error);
    throw error;
  }
}

// ─── Sample Requirements ─────────────────────────────────────────────────────

/**
 * FETCH SAMPLE REQUIREMENTS
 */
export async function fetchSampleRequirements(
  testId: number
): Promise<ApiResponse<any>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/sample-requirements`;
    console.log('📡 Fetching sample requirements...');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    const responseText = await response.text();

    if (response.status === 404) {
      console.warn('⚠️  No sample requirements found');
      return {
        data: [],
        message: 'No sample requirements found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error fetching sample requirements:', response.status);
      throw new Error(`[${response.status}] Failed to fetch sample requirements`);
    }

    if (!responseText || responseText.trim() === '') {
      return {
        data: [],
        message: 'No sample requirements found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Sample requirements loaded');
    return responseData;
  } catch (error) {
    console.error('Error fetching sample requirements:', error);
    throw error;
  }
}

/**
 * CREATE SAMPLE REQUIREMENT
 */
export async function createSampleRequirement(
  testId: number,
  input: CreateSampleRequirementInput
): Promise<ApiResponse<SampleRequirementResponse>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/sample-requirements`;
    console.log('📡 Creating sample requirement...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error creating sample requirement:', response.status);
      throw new Error(`[${response.status}] Failed to create sample requirement`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Sample requirement created');
    return responseData;
  } catch (error) {
    console.error('Error creating sample requirement:', error);
    throw error;
  }
}

/**
 * UPDATE SAMPLE REQUIREMENT
 */
export async function updateSampleRequirement(
  testId: number,
  requirementId: number,
  input: UpdateSampleRequirementInput
): Promise<ApiResponse<SampleRequirementResponse>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/sample-requirements/${requirementId}`;
    console.log('📡 Updating sample requirement...');

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error updating sample requirement:', response.status);
      throw new Error(`[${response.status}] Failed to update sample requirement`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Sample requirement updated');
    return responseData;
  } catch (error) {
    console.error('Error updating sample requirement:', error);
    throw error;
  }
}

/**
 * DELETE SAMPLE REQUIREMENT
 */
export async function deleteSampleRequirement(
  testId: number,
  requirementId: number
): Promise<ApiResponse<void>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/sample-requirements/${requirementId}`;
    console.log('📡 Deleting sample requirement...');

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error deleting sample requirement:', response.status);
      throw new Error(`[${response.status}] Failed to delete sample requirement`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Sample requirement deleted');
    return responseData;
  } catch (error) {
    console.error('Error deleting sample requirement:', error);
    throw error;
  }
}

// ─── Test Versions ──────────────────────────────────────────────────────────

/**
 * FETCH TEST VERSIONS
 */
export async function fetchTestVersions(testId: number): Promise<ApiResponse<TestVersion[]>> {
  try {
    const params = new URLSearchParams({
      pageNo: '0',
      pageSize: '10',
    });
    const url = `${API_BASE_URL}/tests/${testId}/versions?${params.toString()}`;
    console.log('📡 Fetching test versions...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (response.status === 404) {
      console.warn('⚠️  No versions found');
      return {
        data: [],
        message: 'No versions found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error fetching versions:', response.status);
      throw new Error(`[${response.status}] Failed to fetch versions`);
    }

    if (!responseText || responseText.trim() === '') {
      return {
        data: [],
        message: 'No versions found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Versions loaded');
    return responseData;
  } catch (error) {
    console.error('Error fetching versions:', error);
    throw error;
  }
}

/**
 * CREATE TEST VERSION
 */
export async function createTestVersion(
  testId: number,
  input: {
    versionNo: number;
    method: string;
    unit: string;
    price: number;
    cghsPrice?: number;
    effectiveFrom: string;
    effectiveTo?: string;
  }
): Promise<ApiResponse<TestVersion>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/versions`;
    console.log('📡 Creating test version...');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error creating version:', response.status);
      throw new Error(`[${response.status}] Failed to create version`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Version created');
    return responseData;
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
}

// ─── Test Parameters ────────────────────────────────────────────────────────

/**
 * FETCH TEST PARAMETERS
 */
export async function fetchTestParameters(testId: number): Promise<ApiResponse<ParameterResponse[]>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/parameters`;
    console.log('📡 Fetching test parameters...');

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (response.status === 404) {
      console.warn('⚠️  No parameters found');
      return {
        data: [],
        message: 'No parameters found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error fetching parameters:', response.status);
      throw new Error(`[${response.status}] Failed to fetch parameters`);
    }

    if (!responseText || responseText.trim() === '') {
      return {
        data: [],
        message: 'No parameters found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Parameters loaded');
    return responseData;
  } catch (error) {
    console.error('Error fetching parameters:', error);
    throw error;
  }
}

/**
 * CREATE TEST PARAMETER
 */
export async function createTestParameter(
  testId: number,
  input: CreateParameterInput
): Promise<ApiResponse<ParameterResponse>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/parameters`;
    console.log('📡 Creating test parameter...');

    // Send only fields commonly accepted by backend DTOs.
    // Avoid empty arrays / undefined values that can trigger 500 on strict validators.
    const payload: Record<string, unknown> = {
      parameterName: input.parameterName?.trim(),
      unit: input.unit?.trim(),
      resultType: input.resultType,
      isCalculated: Boolean(input.isCalculated),
    };

    if (typeof input.criticalLow === 'number' && Number.isFinite(input.criticalLow)) {
      payload.criticalLow = input.criticalLow;
    }
    if (typeof input.criticalHigh === 'number' && Number.isFinite(input.criticalHigh)) {
      payload.criticalHigh = input.criticalHigh;
    }
    if (input.isCalculated && input.calculationFormula?.trim()) {
      payload.calculationFormula = input.calculationFormula.trim();
    }
    if (typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder)) {
      payload.sortOrder = input.sortOrder;
    }
    if (Array.isArray(input.referenceRanges) && input.referenceRanges.length > 0) {
      payload.referenceRanges = input.referenceRanges
        .map((range) => ({
          gender: range.gender,
          ageMin: range.ageMin,
          ageMax: range.ageMax,
          minValue: range.minValue,
          maxValue: range.maxValue,
          unit: range.unit,
        }))
        .filter(
          (range) =>
            typeof range.ageMin === 'number' &&
            typeof range.ageMax === 'number' &&
            typeof range.minValue === 'number' &&
            typeof range.maxValue === 'number'
        );
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error creating parameter:', response.status);
      console.error('Parameter payload:', payload);
      console.error('Error response body:', errorData);
      throw new Error(`[${response.status}] Failed to create parameter`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Parameter created');
    return responseData;
  } catch (error) {
    console.error('Error creating parameter:', error);
    throw error;
  }
}

/**
 * UPDATE TEST PARAMETER
 */
export async function updateTestParameter(
  testId: number,
  parameterId: number,
  input: CreateParameterInput
): Promise<ApiResponse<ParameterResponse>> {
  try {
    const url = `${API_BASE_URL}/tests/${testId}/parameters/${parameterId}`;
    console.log('📡 Updating test parameter...');

    const payload: Record<string, unknown> = {
      parameterName: input.parameterName?.trim(),
      unit: input.unit?.trim(),
      resultType: input.resultType,
      isCalculated: Boolean(input.isCalculated),
    };

    if (typeof input.criticalLow === 'number' && Number.isFinite(input.criticalLow)) {
      payload.criticalLow = input.criticalLow;
    }
    if (typeof input.criticalHigh === 'number' && Number.isFinite(input.criticalHigh)) {
      payload.criticalHigh = input.criticalHigh;
    }
    if (input.isCalculated && input.calculationFormula?.trim()) {
      payload.calculationFormula = input.calculationFormula.trim();
    }
    if (typeof input.sortOrder === 'number' && Number.isFinite(input.sortOrder)) {
      payload.sortOrder = input.sortOrder;
    }
    if (Array.isArray(input.referenceRanges) && input.referenceRanges.length > 0) {
      payload.referenceRanges = input.referenceRanges
        .map((range) => ({
          gender: range.gender,
          ageMin: range.ageMin,
          ageMax: range.ageMax,
          minValue: range.minValue,
          maxValue: range.maxValue,
          unit: range.unit,
        }))
        .filter(
          (range) =>
            typeof range.ageMin === 'number' &&
            typeof range.ageMax === 'number' &&
            typeof range.minValue === 'number' &&
            typeof range.maxValue === 'number'
        );
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { raw: responseText };
      }
      console.error('❌ Error updating parameter:', response.status);
      console.error('Parameter payload:', payload);
      console.error('Error response body:', errorData);
      throw new Error(`[${response.status}] Failed to update parameter`);
    }

    const responseData = JSON.parse(responseText);
    console.log('✅ Parameter updated');
    return responseData;
  } catch (error) {
    console.error('Error updating parameter:', error);
    throw error;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────────

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
  }

  return errors;
}