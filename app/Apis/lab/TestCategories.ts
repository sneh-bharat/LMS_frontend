/**
 * Test Categories API Service
 * API Endpoints:
 * - GET    /test-categories           - Get all categories (paginated)
 * - GET    /test-categories/{id}      - Get category by ID
 * - POST   /test-categories           - Create new category
 * - PUT    /test-categories/{id}      - Update category
 * - DELETE /test-categories/{id}      - Delete category
 */

import departmentClient from './axios';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TestCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  description: string;
  departmentId: number;
  departmentName?: string;
  displayOrder: number;
  isActive: boolean;
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

export interface CreateCategoryInput {
  categoryCode: string;
  categoryName: string;
  description?: string;
  departmentId?: number;
  branchId?: number;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  categoryName?: string;
  description?: string;
  departmentId?: number;
  branchId?: number;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * GET TEST CATEGORY BY CODE - Fetch category by its code
 * Endpoint: GET /api/v1/test-categories/code/{categoryCode}
 */
export async function fetchTestCategoryByCode(
  categoryCode: string
): Promise<ApiResponse<TestCategory>> {
  const response = await departmentClient.get<ApiResponse<TestCategory>>(
    `/api/v1/test-categories/code/${categoryCode}`
  );
  return response.data;
}

/**
 * SEARCH CATEGORIES BY NAME - Search categories with filters
 * Endpoint: GET /api/v1/test-categories/search?categoryName=Hematology&pageNo=0&pageSize=10
 */
export async function searchTestCategoriesByName(
  categoryName: string,
  pageNo: number = 0,
  pageSize: number = 10,
  sort: string = 'categoryId,asc'
): Promise<ApiResponse<PaginatedResponse<TestCategory>>> {
  const params = new URLSearchParams({
    categoryName: categoryName.trim(),
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
  });

  if (sort) {
    params.append('sort', sort);
  }

  const response = await departmentClient.get<ApiResponse<PaginatedResponse<TestCategory>>>(
    `/api/v1/test-categories/search?${params}`
  );
  return response.data;
}

/**
 * GET ACTIVE TEST CATEGORIES - Fetch active categories with filters
 * Endpoint: GET /api/v1/test-categories/active?pageNo=0&pageSize=1000
 */
export async function fetchActiveTestCategories(
  pageNo: number = 0,
  pageSize: number = 1000,
  search?: string,
  statusFilter?: string
): Promise<ApiResponse<PaginatedResponse<TestCategory>>> {
  const params = new URLSearchParams({
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
  });

  if (search && search.trim()) {
    params.append('search', search.trim());
  }

  if (statusFilter && statusFilter !== 'All') {
    params.append('status', statusFilter);
  }

  const response = await departmentClient.get<ApiResponse<PaginatedResponse<TestCategory>>>(
    `/api/v1/test-categories/active?${params}`
  );
  return response.data;
}

/**
 * GET ALL TEST CATEGORIES - Fetch all categories with pagination
 * Endpoint: GET /api/v1/test-categories?pageNo=0&pageSize=1000
 */
export async function fetchTestCategories(
  pageNo: number = 0,
  pageSize: number = 1000,
  statusFilter?: string
): Promise<ApiResponse<PaginatedResponse<TestCategory>>> {
  const params = new URLSearchParams({
    pageNo: pageNo.toString(),
    pageSize: pageSize.toString(),
  });

  if (statusFilter && statusFilter !== 'All') {
    params.append('status', statusFilter);
  }

  const response = await departmentClient.get<ApiResponse<PaginatedResponse<TestCategory>>>(
    `/api/v1/test-categories?${params}`
  );
  return response.data;
}

/**
 * GET CATEGORY BY ID - Fetch a single test category
 * Endpoint: GET /api/v1/test-categories/{categoryId}
 */
export async function fetchTestCategoryById(id: number): Promise<ApiResponse<TestCategory>> {
  const response = await departmentClient.get<ApiResponse<TestCategory>>(
    `/api/v1/test-categories/${id}`
  );
  return response.data;
}

/**
 * CREATE CATEGORY - Create a new test category
 * Endpoint: POST /test-categories
 */
export async function createTestCategory(
  input: CreateCategoryInput
): Promise<ApiResponse<TestCategory>> {
  const requestBody = {
    categoryCode: input.categoryCode,
    categoryName: input.categoryName,
    description: input.description || '',
    departmentId: input.departmentId || 1,
    branchId: input.branchId || 1,
    displayOrder: input.displayOrder || 0,
    isActive: input.isActive !== undefined ? input.isActive : true,
  };

  const response = await departmentClient.post<ApiResponse<TestCategory>>(
    '/api/v1/test-categories',
    requestBody
  );
  return response.data;
}

/**
 * UPDATE CATEGORY - Update an existing test category
 * Endpoint: PUT /test-categories/{categoryId}
 */
export async function updateTestCategory(
  id: number,
  input: UpdateCategoryInput
): Promise<ApiResponse<TestCategory>> {
  const requestBody = {
    categoryName: input.categoryName,
    description: input.description || '',
    departmentId: input.departmentId || 1,
    branchId: input.branchId || 1,
    displayOrder: input.displayOrder || 0,
    isActive: input.isActive !== undefined ? input.isActive : true,
  };

  const response = await departmentClient.put<ApiResponse<TestCategory>>(
    `/api/v1/test-categories/${id}`,
    requestBody
  );
  return response.data;
}

/**
 * DELETE CATEGORY - Delete a test category
 * Endpoint: DELETE /api/v1/test-categories/{id}
 */
export async function deleteTestCategory(id: number): Promise<ApiResponse<void>> {
  const response = await departmentClient.delete<ApiResponse<void>>(
    `/api/v1/test-categories/${id}`
  );
  return response.data;
}

/**
 * Toggle category active status (Optional - if you need this feature)
 * Endpoint: PATCH /api/v1/test-categories/{id}/status
 */
export async function toggleCategoryStatus(
  id: number,
  isActive: boolean
): Promise<ApiResponse<TestCategory>> {
  const response = await departmentClient.patch<ApiResponse<TestCategory>>(
    `/api/v1/test-categories/${id}/status`,
    { isActive }
  );
  return response.data;
}

// ─── Helper Functions ───────────────────────────────────────────────────────

export function validateCategoryData(data: Partial<CreateCategoryInput>): string[] {
  const errors: string[] = [];

  if (!data.categoryCode || data.categoryCode.trim() === '') {
    errors.push('Category code is required');
  }

  if (!data.categoryName || data.categoryName.trim() === '') {
    errors.push('Category name is required');
  }

  if (data.displayOrder !== undefined && data.displayOrder < 0) {
    errors.push('Display order must be a non-negative number');
  }

  return errors;
}