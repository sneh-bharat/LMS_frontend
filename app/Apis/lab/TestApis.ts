

import labClient from '@/app/Apis/lab/axios';


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
  method?: string | null;
  unit?: string | null;
  price: number;
  cghsPrice?: number | null;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
  tenantId?: number;
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
  testCode?: string; // Optional - backend will auto-generate
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

// Legacy interfaces for backward compatibility (deprecated)
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

/** Unwrap list from API (array, paginated content, or single object). */
export function unwrapParametersList(payload: unknown): any[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.content)) return record.content;
    if (Array.isArray(record.data)) return record.data;
  }
  return payload ? [payload] : [];
}

export function normalizeReferenceRange(range: any): ReferenceRange {
  return {
    id: range?.id,
    gender: range?.gender ?? 'ALL',
    ageMin: Number(range?.ageMin ?? range?.age_min ?? 0),
    ageMax: Number(range?.ageMax ?? range?.age_max ?? 100),
    minValue: range?.minValue ?? range?.min_value ?? '',
    maxValue: range?.maxValue ?? range?.max_value ?? '',
    unit: range?.unit ?? '',
  };
}

/** Map API parameter shape to form state (reference ranges included). */
export function normalizeParameterForForm(param: any) {
  const ranges = param?.referenceRanges ?? param?.reference_ranges ?? [];
  return {
    id: param?.id,
    parameterCode: param?.parameterCode ?? param?.parameter_code ?? '',
    parameterName: param?.parameterName ?? param?.parameter_name ?? '',
    displayOrder: param?.displayOrder ?? param?.sortOrder ?? param?.sort_order ?? 0,
    unit: param?.unit ?? '',
    decimalPlaces: param?.decimalPlaces ?? param?.decimal_places ?? 0,
    criticalLow: param?.criticalLow ?? param?.critical_low ?? 0,
    criticalHigh: param?.criticalHigh ?? param?.critical_high ?? 0,
    resultType: param?.resultType ?? param?.result_type ?? 'NUMERIC',
    isCalculated: Boolean(param?.isCalculated ?? param?.is_calculated),
    calculationFormula: param?.calculationFormula ?? param?.calculation_formula,
    referenceRanges: Array.isArray(ranges) ? ranges.map(normalizeReferenceRange) : [],
  };
}

function mapReferenceRangesForPayload(
  ranges: CreateParameterInput['referenceRanges'],
  defaultUnit?: string
) {
  if (!Array.isArray(ranges) || ranges.length === 0) return undefined;

  const mapped = ranges
    .map((range) => {
      const minValue = Number(range.minValue);
      const maxValue = Number(range.maxValue);
      const ageMin = Number(range.ageMin);
      const ageMax = Number(range.ageMax);
      if (
        !Number.isFinite(minValue) ||
        !Number.isFinite(maxValue) ||
        !Number.isFinite(ageMin) ||
        !Number.isFinite(ageMax)
      ) {
        return null;
      }
      return {
        gender: range.gender,
        ageMin,
        ageMax,
        minValue,
        maxValue,
        unit: range.unit || defaultUnit || '',
      };
    })
    .filter((range): range is NonNullable<typeof range> => range !== null);

  return mapped.length > 0 ? mapped : undefined;
}

// ─── API Functions ──────────────────────────────────────────────────────────

export interface FetchTestsOptions {
  sortBy?: string;
  /** e.g. `asc`, `ASC`, `ascending` */
  sortDirection?: string;
  branchId?: number;
}

/**
 * GET tests for booking catalog — paginated, name ascending.
 * Endpoint: GET /api/v1/tests?pageNo=0&pageSize=10&ascending
 */
export async function fetchTestsAscending(
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string,
  options?: Pick<FetchTestsOptions, 'branchId'>
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (search?.trim()) params.append('search', search.trim());
    if (options?.branchId != null && options.branchId > 0) {
      params.append('branchId', String(options.branchId));
    }

    const url = `/api/v1/tests/ascending?${params.toString()}`;

    const response = (await labClient.get<ApiResponse<PaginatedResponse<Test>>>(url)) as any;
    return response;
  } catch (error) {
    console.error('Error fetching tests (ascending):', error);
    throw error;
  }
}

/**
 * GET ALL TESTS - Fetch all tests with pagination and filters
 * Endpoint: GET /api/v1/tests?pageNo=0&pageSize=10
 * Optional: `search`, `status`, `sortBy`, `sortDirection`, `branchId`.
 */
export async function fetchTests(
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string,
  status?: string,
  options?: FetchTestsOptions
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) params.append('search', search);
    if (status) params.append('status', status);
    if (options?.sortBy) params.append('sortBy', options.sortBy);
    if (options?.sortDirection) params.append('sortDirection', options.sortDirection);
    if (options?.branchId != null && options.branchId > 0) {
      params.append('branchId', String(options.branchId));
    }

    const url = `/api/v1/tests?${params.toString()}`;

    const response = await labClient.get<ApiResponse<PaginatedResponse<Test>>>(url) as any;
    
    return response;
  } catch (error) {
    console.error('=== FETCH TESTS ERROR ===');
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * GET TESTS BY DEPARTMENT
 * Endpoint: GET /api/v1/tests/department/{departmentId}?pageNo=0&pageSize=10
 */
export async function fetchTestsByDepartment(
  departmentId: number,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    const url = `/api/v1/tests/department/${departmentId}?${params.toString()}`;

    const response = await labClient.get<ApiResponse<PaginatedResponse<Test>>>(url) as any;

    return response;
  } catch (error) {
    console.error('Error fetching tests by department:', error);
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

    const response = await labClient.get<ApiResponse<PaginatedResponse<Test>>>(url) as any;
    
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

    const response = await labClient.get<ApiResponse<Test>>(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching test:', error);
    throw error;
  }
}

/**
 * Best-effort test lookup for list enrichment. Returns null when the test is missing
 * (e.g. booking order references an id not in the lab catalog) instead of throwing.
 */
export async function fetchTestByIdOptional(testId: number): Promise<Test | null> {
  try {
    const res = (await labClient.get(`/api/v1/tests/${testId}`)) as ApiResponse<Test>;
    if (res?.response === false || !res?.data) return null;
    return res.data;
  } catch {
    return null;
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

    const response = await labClient.get<ApiResponse<Test>>(url);
    
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
 * Endpoint: GET /api/v1/tests/search?name={name}&pageNo=0&pageSize=10
 */
export async function searchTestsByName(
  name: string,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Test>>> {
  try {
    const params = new URLSearchParams({
      name: name.trim(),
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    const url = `/api/v1/tests/search?${params.toString()}`;

    const response = await labClient.get<ApiResponse<PaginatedResponse<Test>>>(url) as any;
    
    return response;
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

    const response = await labClient.post<ApiResponse<Test>>(url, input) as any;
    
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

    const response = await labClient.put<ApiResponse<Test>>(url, input) as any;
    
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

    const response = await labClient.delete<ApiResponse<void>>(url) as any;
    
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
    
    const response = await labClient.patch<ApiResponse<Test>>(url, { isActive }) as any;
    
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
    
    const response = await labClient.get<ApiResponse<any>>(url) as any;
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

    const response = await labClient.post<ApiResponse<SampleRequirementResponse>>(url, input) as any;
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

    const response = await labClient.put<ApiResponse<SampleRequirementResponse>>(url, input) as any;
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

    const response = await labClient.delete<ApiResponse<void>>(url) as any;
    return response;
  } catch (error) {
    console.error('Error deleting sample requirement:', error);
    throw error;
  }
}

// ─── Test Parameters ────────────────────────────────────────────────────────

/**
 * FETCH ALL PARAMETERS - Get All Parameters with pagination
 * Endpoint: GET /api/v1/tests/parameters?pageNo=0&pageSize=10
 */
export async function fetchAllParameters(
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string
): Promise<ApiResponse<PaginatedResponse<ParameterResponse>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (search) {
      params.append('search', search);
    }

    const url = `/api/v1/tests/parameters?${params.toString()}`;

    const response = await labClient.get<ApiResponse<PaginatedResponse<ParameterResponse>>>(url) as any;
    return response;
  } catch (error) {
    console.error('Error fetching all parameters:', error);
    throw error;
  }
}

/**
 * FETCH TEST PARAMETERS
 * Endpoint: GET /api/v1/tests/{testId}/parameters
 */
export async function fetchTestParameters(testId: number): Promise<ApiResponse<ParameterResponse[]>> {
  try {
    const url = `/api/v1/tests/${testId}/parameters`;

    const response = await labClient.get<ApiResponse<ParameterResponse[]>>(url) as any;
    const list = unwrapParametersList(response?.data);
    return { ...response, data: list };
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
 * 
 * Note: branchId is required for ADMIN/SUPER_ADMIN roles
 */
export async function createTestParameter(
  testId: number,
  input: CreateParameterInput,
  branchId: number
): Promise<ApiResponse<ParameterResponse>> {
  const url = `/api/v1/tests/${testId}/parameters`;
  
  try {

    // Validate branchId (required for ADMIN/SUPER_ADMIN)
    if (!branchId || branchId <= 0) {
      throw new Error(`Invalid branchId: ${branchId}. Branch ID is required for ADMIN/SUPER_ADMIN roles.`);
    }

    // Send only fields commonly accepted by backend DTOs.
    // Avoid empty arrays / undefined values that can trigger 500 on strict validators.
    const payload: Record<string, unknown> = {
      branchId: branchId,  // Required for ADMIN/SUPER_ADMIN
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
    const referenceRanges = mapReferenceRangesForPayload(
      input.referenceRanges,
      input.unit?.trim()
    );
    if (referenceRanges) {
      payload.referenceRanges = referenceRanges;
    }


    const response = await labClient.post<ApiResponse<ParameterResponse>>(url, payload) as any;
    return response;
  } catch (error: any) {
    const status = error?.response?.status;
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unknown error';
    console.error(
      `❌ Error creating parameter [testId=${testId}, branchId=${branchId}]:`,
      `\n  Status: ${status || 'N/A'}`,
      `\n  Message: ${serverMessage}`,
      error?.response?.data ? `\n  Response: ${JSON.stringify(error.response.data)}` : '',
      error
    );
    throw error;
  }
}

/**
 * UPDATE TEST PARAMETER
 * Endpoint: PUT /api/v1/tests/parameters/{parameterId}
 *
 * Note: branchId is required for ADMIN/SUPER_ADMIN roles
 */
export async function updateTestParameter(
  parameterId: number,
  input: CreateParameterInput,
  branchId: number
): Promise<ApiResponse<ParameterResponse>> {
  try {
    const url = `/api/v1/tests/parameters/${parameterId}`;
   

    // Validate required IDs
    if (!parameterId || parameterId <= 0) {
      throw new Error(`Invalid parameterId: ${parameterId}. Parameter ID must be a positive number.`);
    }
    if (!branchId || branchId <= 0) {
      throw new Error(`Invalid branchId: ${branchId}. Branch ID is required for ADMIN/SUPER_ADMIN roles.`);
    }

    // Send only the fields that the API expects for update
    const payload: Record<string, unknown> = {
      branchId: branchId,  // Required for ADMIN/SUPER_ADMIN
      parameterName: input.parameterName?.trim(),
      unit: input.unit?.trim(),
      resultType: input.resultType,
      isCalculated: Boolean(input.isCalculated),
    };

    // Include optional numeric fields only if they are valid numbers
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

    const referenceRanges = mapReferenceRangesForPayload(
      input.referenceRanges,
      input.unit?.trim()
    );
    if (referenceRanges) {
      payload.referenceRanges = referenceRanges;
    }

    
    const response = await labClient.put<ApiResponse<ParameterResponse>>(url, payload) as any;
    
    return response;
  } catch (error: any) {
    const status = error?.response?.status;
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Unknown error';
    console.error(
      `❌ Error updating parameter [parameterId=${parameterId}, branchId=${branchId}]:`,
      `\n  Status: ${status || 'N/A'}`,
      `\n  Message: ${serverMessage}`,
      error?.response?.data ? `\n  Response: ${JSON.stringify(error.response.data)}` : '',
      error
    );
    throw error;
  }
}

// ─── Validation ─────────────────────────────────────────────────────────────

export function validateTestData(data: Partial<CreateTestInput>): string[] {
  const errors: string[] = [];

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