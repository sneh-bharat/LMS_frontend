

import departmentClient from './axios';


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
  displayOrder?: number;
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
  testNameShort?: string | null;
  testDescription?: string | null;
  description?: string;
  branchId: number;
  departmentId: number;
  departmentName: string;
  categoryId: number;
  categoryName: string;
  loincCode?: string | null;
  tatHours: number;
  tatMinutes?: number;
  isActive: boolean;
  isCalculated: boolean;
  // Version fields (flat structure in response)
  method?: string | null;
  unit?: string | null;
  price: number;
  cghsPrice?: number | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  // Tenant and audit fields
  tenantId?: number;
  // Relationships (if included)
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
  testNameShort?: string | null;
  testDescription?: string | null;
  departmentId: number;
  categoryId: number;
  loincCode?: string | null;
  tatHours: number;
  tatMinutes?: number;
  method: string;
  unit?: string | null;
  price: number;
  cghsPrice?: number | null;
  effectiveFrom: string;
  effectiveTo?: string | null;
  branchId: number;
  isActive?: boolean;
  isCalculated?: boolean;
  parameters?: Array<{
    parameterCode: string;
    parameterName: string;
    displayOrder?: number;
    unit: string;
    decimalPlaces?: number;
    criticalLow?: number;
    criticalHigh?: number;
    isCalculated: boolean;
    resultType: string;
    calculationFormula?: string;
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
    isMandatory?: boolean;
  }>;
}

export interface UpdateTestInput {
  testCode?: string;
  testName?: string;
  testNameShort?: string | null;
  testDescription?: string | null;
  departmentId?: number;
  categoryId?: number;
  branchId?: number;
  loincCode?: string | null;
  tatHours?: number;
  tatMinutes?: number;
  method?: string;
  unit?: string | null;
  price?: number;
  cghsPrice?: number | null;
  effectiveFrom?: string;
  effectiveTo?: string | null;
  isActive?: boolean;
  isCalculated?: boolean;
  parameters?: Array<{
    id?: number;
    parameterCode?: string;
    parameterName: string;
    displayOrder?: number;
    unit: string;
    decimalPlaces?: number;
    criticalLow: number;
    criticalHigh: number;
    isCalculated: boolean;
    resultType: string;
    calculationFormula?: string;
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
    isMandatory?: boolean;
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
 * Endpoint: GET /api/v1/tests?pageNo=0&pageSize=10
 */
export async function fetchTests(
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string,
  status?: string
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);

    const url = `/api/v1/tests?${params.toString()}`;
    console.log('📡 Fetching tests from:', url);

    const response = await departmentClient.get<ApiResponse<PaginatedResponse<Test>>>(url) as any;
    console.log('✅ Tests loaded successfully');
    console.log('Tests count:', response?.content?.length || 0);
    
    return response;
  } catch (error) {
    console.error('=== FETCH TESTS ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * GET ACTIVE TESTS - Fetch active tests only
 * Endpoint: GET /api/v1/tests/active?pageNo=0&pageSize=10
 */
export async function fetchActiveTests(
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    const url = `/api/v1/tests/active?${params.toString()}`;
    console.log('📡 Fetching active tests from:', url);

    const response = await departmentClient.get<ApiResponse<PaginatedResponse<Test>>>(url) as any;
    console.log('✅ Active tests loaded successfully');
    
    return response;
  } catch (error) {
    console.error('Error fetching active tests:', error);
    throw error;
  }
}

/**
 * GET TEST BY ID
 * Endpoint: GET /api/v1/tests/{testId}
 */
export async function fetchTestById(testId: number): Promise<ApiResponse<Test>> {
  try {
    const url = `/api/v1/tests/${testId}`;
    console.log('📡 Fetching test from:', url);
    
    const response = await departmentClient.get<ApiResponse<Test>>(url);
    console.log('✅ Test loaded successfully');
    return response.data;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
}

/**
 * GET TEST BY CODE
 * Endpoint: GET /api/v1/tests/code/{testCode}
 */
export async function fetchTestByCode(testCode: string): Promise<ApiResponse<Test | null>> {
  try {
    const encodedCode = encodeURIComponent(testCode.trim());
    const url = `/api/v1/tests/code/${encodedCode}`;
    console.log('📡 Fetching test by code from:', url);

    const response = await departmentClient.get<ApiResponse<Test>>(url);
    console.log('✅ Test by code loaded successfully');
    
    return response.data;
  } catch (error: any) {
    // Return null for 404
    if (error.response?.status === 404) {
      return {
        data: null,
        message: 'Test not found',
        response: true,
        status: '404',
        timestamp: new Date().toISOString(),
      };
    }
    console.error('Error fetching test by code:', error);
    throw error;
  }
}

/**
 * SEARCH TESTS BY NAME
 * Endpoint: GET /api/v1/tests/search?categoryName={name}&pageNo=0&pageSize=10
 */
export async function searchTestsByName(
  name: string,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      categoryName: name.trim(),
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
      sort: 'categoryId,asc',
    });

    const url = `/api/v1/tests/search?${params.toString()}`;
    console.log('📡 Searching tests by name from:', url);

    const response = await departmentClient.get<ApiResponse<PaginatedResponse<Test>>>(url);
    console.log('✅ Search results loaded successfully');
    
    return response.data;
  } catch (error) {
    console.error('Error searching tests by name:', error);
    throw error;
  }
}

/**
 * CREATE TEST
 * Endpoint: POST /api/v1/tests
 */
export async function createTest(
  input: CreateTestInput
): Promise<ApiResponse<Test>> {
  try {
    const url = `/api/v1/tests`;
    console.log('📡 Creating test...');

    const response = await departmentClient.post<ApiResponse<Test>>(url, input) as any;
    console.log('✅ Test created successfully');
    
    return response;
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
}

/**
 * UPDATE TEST
 * Endpoint: PUT /api/v1/tests/{testId}
 */
export async function updateTest(
  testId: number,
  input: UpdateTestInput
): Promise<ApiResponse<Test>> {
  try {
    const url = `/api/v1/tests/${testId}`;
    console.log('📡 Updating test...');

    const response = await departmentClient.put<ApiResponse<Test>>(url, input) as any;
    console.log('✅ Test updated successfully');
    
    return response;
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
}

/**
 * DELETE TEST
 * Endpoint: DELETE /api/v1/tests/{testId}
 */
export async function deleteTest(testId: number): Promise<ApiResponse<void>> {
  try {
    const url = `/api/v1/tests/${testId}`;
    console.log('📡 Deleting test...');

    const response = await departmentClient.delete<ApiResponse<void>>(url) as any;
    console.log('✅ Test deleted successfully');
    
    return response;
  } catch (error) {
    console.error('Error deleting test:', error);
    throw error;
  }
}

/**
 * TOGGLE TEST STATUS
 * Endpoint: PATCH /api/v1/tests/{testId}/status
 */
export async function toggleTestStatus(
  testId: number,
  isActive: boolean
): Promise<ApiResponse<Test>> {
  try {
    const url = `/api/v1/tests/${testId}/status`;
    console.log('📡 Toggling status...');
    
    const response = await departmentClient.patch<ApiResponse<Test>>(url, { isActive }) as any;
    console.log('✅ Status toggled successfully');
    
    return response;
  } catch (error) {
    console.error('Error toggling status:', error);
    throw error;
  }
}

// ─── Sample Requirements ─────────────────────────────────────────────────────

/**
 * FETCH SAMPLE REQUIREMENTS
 * Endpoint: GET /api/v1/tests/{testId}/sample-requirements
 */
export async function fetchSampleRequirements(
  testId: number
): Promise<ApiResponse<any>> {
  try {
    const url = `/api/v1/tests/${testId}/sample-requirements`;
    console.log('📡 Fetching sample requirements from:', url);
    
    const response = await departmentClient.get<ApiResponse<any>>(url) as any;
    console.log('✅ Sample requirements loaded successfully');
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        data: [],
        message: 'No sample requirements found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }
    console.error('Error fetching sample requirements:', error);
    throw error;
  }
}

/**
 * CREATE SAMPLE REQUIREMENT
 * Endpoint: POST /api/v1/tests/{testId}/sample-requirements
 */
export async function createSampleRequirement(
  testId: number,
  input: CreateSampleRequirementInput
): Promise<ApiResponse<SampleRequirementResponse>> {
  try {
    const url = `/api/v1/tests/${testId}/sample-requirements`;
    console.log('📡 Creating sample requirement...');

    const response = await departmentClient.post<ApiResponse<SampleRequirementResponse>>(url, input) as any;
    console.log('✅ Sample requirement created successfully');
    return response;
  } catch (error) {
    console.error('Error creating sample requirement:', error);
    throw error;
  }
}

/**
 * UPDATE SAMPLE REQUIREMENT
 * Endpoint: PUT /api/v1/tests/{testId}/sample-requirements/{requirementId}
 */
export async function updateSampleRequirement(
  testId: number,
  requirementId: number,
  input: UpdateSampleRequirementInput
): Promise<ApiResponse<SampleRequirementResponse>> {
  try {
    const url = `/api/v1/tests/${testId}/sample-requirements/${requirementId}`;
    console.log('📡 Updating sample requirement...');

    const response = await departmentClient.put<ApiResponse<SampleRequirementResponse>>(url, input) as any;
    console.log('✅ Sample requirement updated successfully');
    return response;
  } catch (error) {
    console.error('Error updating sample requirement:', error);
    throw error;
  }
}

/**
 * DELETE SAMPLE REQUIREMENT
 * Endpoint: DELETE /api/v1/tests/{testId}/sample-requirements/{requirementId}
 */
export async function deleteSampleRequirement(
  testId: number,
  requirementId: number
): Promise<ApiResponse<void>> {
  try {
    const url = `/api/v1/tests/${testId}/sample-requirements/${requirementId}`;
    console.log('📡 Deleting sample requirement...');

    const response = await departmentClient.delete<ApiResponse<void>>(url) as any;
    console.log('✅ Sample requirement deleted successfully');
    return response;
  } catch (error) {
    console.error('Error deleting sample requirement:', error);
    throw error;
  }
}

// ─── Test Versions ──────────────────────────────────────────────────────────

/**
 * FETCH TEST VERSIONS
 * Endpoint: GET /api/v1/tests/{testId}/versions?pageNo=0&pageSize=10
 */
export async function fetchTestVersions(testId: number): Promise<ApiResponse<TestVersion[]>> {
  try {
    const params = new URLSearchParams({
      pageNo: '0',
      pageSize: '10',
    });
    const url = `/api/v1/tests/${testId}/versions?${params.toString()}`;
    console.log('📡 Fetching test versions from:', url);

    const response = await departmentClient.get<ApiResponse<TestVersion[]>>(url) as any;
    console.log('✅ Test versions loaded successfully');
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        data: [],
        message: 'No versions found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }
    console.error('Error fetching versions:', error);
    throw error;
  }
}

/**
 * CREATE TEST VERSION
 * Endpoint: POST /api/v1/tests/{testId}/versions
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
    const url = `/api/v1/tests/${testId}/versions`;
    console.log('📡 Creating test version...');

    const response = await departmentClient.post<ApiResponse<TestVersion>>(url, input) as any;
    console.log('✅ Test version created successfully');
    return response;
  } catch (error) {
    console.error('Error creating version:', error);
    throw error;
  }
}

// ─── Test Parameters ────────────────────────────────────────────────────────

/**
 * FETCH TEST PARAMETERS
 * Endpoint: GET /api/v1/tests/{testId}/parameters
 */
export async function fetchTestParameters(testId: number): Promise<ApiResponse<ParameterResponse[]>> {
  try {
    const url = `/api/v1/tests/${testId}/parameters`;
    console.log('📡 Fetching test parameters from:', url);

    const response = await departmentClient.get<ApiResponse<ParameterResponse[]>>(url) as any;
    console.log('✅ Test parameters loaded successfully');
    return response;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return {
        data: [],
        message: 'No parameters found',
        response: true,
        status: 'success',
        timestamp: new Date().toISOString(),
      };
    }
    console.error('Error fetching parameters:', error);
    throw error;
  }
}

/**
 * CREATE TEST PARAMETER
 * Endpoint: POST /api/v1/tests/{testId}/parameters
 */
export async function createTestParameter(
  testId: number,
  input: CreateParameterInput
): Promise<ApiResponse<ParameterResponse>> {
  try {
    const url = `/api/v1/tests/${testId}/parameters`;
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

    const response = await departmentClient.post<ApiResponse<ParameterResponse>>(url, payload) as any;
    console.log('✅ Test parameter created successfully');
    return response;
  } catch (error) {
    console.error('Error creating parameter:', error);
    throw error;
  }
}

/**
 * UPDATE TEST PARAMETER
 * Endpoint: PUT /api/v1/tests/{testId}/parameters/{parameterId}
 */
export async function updateTestParameter(
  testId: number,
  parameterId: number,
  input: CreateParameterInput
): Promise<ApiResponse<ParameterResponse>> {
  try {
    const url = `/api/v1/tests/${testId}/parameters/${parameterId}`;
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

    const response = await departmentClient.put<ApiResponse<ParameterResponse>>(url, payload) as any;
    console.log('✅ Test parameter updated successfully');
    return response;
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

  // Required fields validation (flat structure)
  if (!data.method) {
    errors.push('Method is required');
  }
  if (!data.unit) {
    errors.push('Unit is required');
  }
  if (!data.price || data.price <= 0) {
    errors.push('Price must be a positive number');
  }
  if (!data.effectiveFrom) {
    errors.push('Effective from date is required');
  }
  if (!data.branchId) {
    errors.push('Branch ID is required');
  }

  return errors;
}