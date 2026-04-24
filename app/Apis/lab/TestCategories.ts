/**
 * Test Categories API Service
 * 
 * This service handles all API operations for Test Category management.
 * 
 * API Endpoints:
 * - GET    /test-categories           - Get all categories (paginated)
 * - GET    /test-categories/{id}      - Get category by ID
 * - POST   /test-categories           - Create new category
 * - PUT    /test-categories/{id}      - Update category
 * - DELETE /test-categories/{id}      - Delete category
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TestCategory {
  id: number;
  categoryCode: string;
  categoryName: string;
  description: string;
  departmentId: number;
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
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  categoryName?: string;
  description?: string;
  departmentId?: number;
  displayOrder?: number;
  isActive?: boolean;
}

/**
 * GET TEST CATEGORY BY CODE - Fetch category by its code
 * Endpoint: GET /test-categories/code/{categoryCode}
 */
export async function fetchTestCategoryByCode(
  categoryCode: string
): Promise<ApiResponse<TestCategory>> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-categories/code/${categoryCode}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch test category by code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching test category by code:', error);
    throw error;
  }
}

/**
 * SEARCH CATEGORIES BY NAME - Search categories with filters
 * Endpoint: GET /test-categories/search?categoryName=Hematology&page=0&size=10&sort=categoryId,asc
 */
export async function searchTestCategoriesByName(
  categoryName: string,
  page: number = 0,
  size: number = 10,
  sort: string = 'categoryId,asc'
): Promise<ApiResponse<PaginatedResponse<TestCategory>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: sort,
    });

    if (categoryName && categoryName.trim()) {
      params.append('categoryName', categoryName.trim());
    }

    const response = await fetch(`${API_BASE_URL}/test-categories/search?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to search test categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching test categories:', error);
    throw error;
  }
}

/**
 * GET ACTIVE TEST CATEGORIES - Fetch active categories with filters
 * Endpoint: GET /test-categories/active?page=0&size=10
 */
export async function fetchActiveTestCategories(
  page: number = 0,
  size: number = 10,
  search?: string,
  statusFilter?: string
): Promise<ApiResponse<PaginatedResponse<TestCategory>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    if (statusFilter && statusFilter !== 'All') {
      params.append('status', statusFilter);
    }

    const response = await fetch(`${API_BASE_URL}/test-categories/active?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch active test categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching active test categories:', error);
    throw error;
  }
}

// Line 56-81 in TestCategories.ts
export async function fetchTestCategories(
  page: number = 0,
  size: number = 10,
  search?: string,
  statusFilter?: string
): Promise<ApiResponse<PaginatedResponse<TestCategory>>> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    if (statusFilter && statusFilter !== 'All') {
      params.append('status', statusFilter);
    }

    const response = await fetch(`${API_BASE_URL}/test-categories?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch test categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching test categories:', error);
    throw error;
  }
}

/**
 * GET CATEGORY BY ID - Fetch a single test category
 * Endpoint: GET /test-categories/{categoryId}
 */
export async function fetchTestCategoryById(id: number): Promise<ApiResponse<TestCategory>> {
  try {
    const response = await fetch(`${API_BASE_URL}/test-categories/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch test category');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching test category:', error);
    throw error;
  }
}

/**
 * CREATE CATEGORY - Create a new test category
 * Endpoint: POST /test-categories
 */
export async function createTestCategory(
  input: CreateCategoryInput
): Promise<ApiResponse<TestCategory>> {
  try {
    const requestBody = {
      categoryCode: input.categoryCode,
      categoryName: input.categoryName,
      description: input.description || '',
      departmentId: input.departmentId || 1,
      displayOrder: input.displayOrder || 0,
      isActive: input.isActive !== undefined ? input.isActive : true,
    };

    console.log('=== CREATE CATEGORY DEBUG ===');
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    console.log('API URL:', `${API_BASE_URL}/test-categories`);
    console.log('Environment variable NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(`${API_BASE_URL}/test-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response status text:', response.statusText);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Try to get raw text first to see what backend actually returns
    const responseText = await response.text();
    console.log('Raw response text:', responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log('Parsed JSON response:', responseData);
    } catch (e) {
      console.error('Failed to parse response as JSON:', e);
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      console.error('=== ERROR DETAILS ===');
      console.error('Status:', response.status);
      console.error('Status text:', response.statusText);
      console.error('Response data:', responseData);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const errorMessage = responseData?.message || responseData?.error || responseData?.message || `HTTP ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    console.log('=== SUCCESS ===');
    console.log('Created category:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error creating test category:', error);
    throw error;
  }
}

/**
 * UPDATE CATEGORY - Update an existing test category
 * Endpoint: PUT /test-categories/{categoryId}
 */
export async function updateTestCategory(
  id: number,
  input: UpdateCategoryInput
): Promise<ApiResponse<TestCategory>> {
  try {
    console.log('Updating category:', id, 'with data:', input);
    console.log('API URL:', `${API_BASE_URL}/test-categories/${id}`);

    const response = await fetch(`${API_BASE_URL}/test-categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    console.log('Response status:', response.status);

    const responseData = await response.json();
    console.log('Response data:', responseData);

    if (!response.ok) {
      throw new Error(responseData.message || responseData.error || 'Failed to update category');
    }

    return responseData;
  } catch (error) {
    console.error('Error updating test category:', error);
    throw error;
  }
}

/**
 * DELETE CATEGORY - Delete a test category
 * Endpoint: DELETE /reference-ranges/{id}
 */
export async function deleteTestCategory(id: number): Promise<ApiResponse<void>> {
  try {
    console.log('Deleting category with ID:', id);
    console.log('API URL:', `${API_BASE_URL}/test-categories/${id}`);


    const response = await fetch(`${API_BASE_URL}/test-categories/${id}`, {
      method: 'DELETE',
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete error response:', errorData);
      throw new Error(errorData.message || errorData.error || 'Failed to delete category');
    }

    const responseData = await response.json();
    console.log('Delete response:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error deleting test category:', error);
    throw error;
  }
}

/**
 * Toggle category active status (Optional - if you need this feature)
 * Endpoint: PATCH /test-categories/{id}/status
 */
export async function toggleCategoryStatus(
  id: number,
  isActive: boolean
): Promise<ApiResponse<TestCategory>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/test-categories/${id}/status`,
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

    return await response.json();
  } catch (error) {
    console.error('Error toggling category status:', error);
    throw error;
  }
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