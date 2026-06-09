import labClient from '@/app/Apis/lab/axios';
// ─── Types ──────────────────────────────────────────────────────────────────

export interface Department {
  id: number;
  branchId: number;
  branchName?: string; 
  departmentCode: string;
  departmentName: string;
  departmentNameShort: string | null;
  description: string;
  displayOrder: number | null;
  isActive: boolean;
  location: string | null;
  tenantId: number;
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

export interface CreateDepartmentInput {
  branchId?: number;
  departmentCode: string;
  departmentName: string;
  departmentNameShort?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  location?: string;
  tenantId?: number;
}

export interface UpdateDepartmentInput {
  branchId?: number;
  departmentCode?: string;
  departmentName?: string;
  departmentNameShort?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
  location?: string;
}

export interface DepartmentQueryParams {
  pageNo?: number;
  pageSize?: number;
  name?: string;
  status?: string;
}

// ─── API Service Functions ──────────────────────────────────────────────────

/**
 * GET ALL DEPARTMENTS - paginated list
 * Endpoint: GET /api/v1/departments?pageNo=0&pageSize=10
 *
 * SEARCH BY NAME - when `name` is set
 * Endpoint: GET /api/v1/departments/search?name=Hematology&pageNo=0&pageSize=10
 */
export const departmentApi = {
  getAllDepartments: async (params: DepartmentQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Department>>> => {
    const { pageNo = 0, pageSize = 10, name, status } = params;

    const queryParams: Record<string, string | number> = { pageNo, pageSize };

    if (status && status !== 'All') {
      queryParams.status = status;
    }

    const searchName = name?.trim();
    if (searchName) {
      queryParams.name = searchName;
      return labClient.get('/api/v1/departments/search', { params: queryParams });
    }

    return labClient.get('/api/v1/departments', { params: queryParams });
  },

  /** Search departments by name (explicit helper) */
  searchDepartmentsByName: async (
    name: string,
    params: { pageNo?: number; pageSize?: number; status?: string } = {}
  ): Promise<ApiResponse<PaginatedResponse<Department>>> => {
    const { pageNo = 0, pageSize = 10, status } = params;
    const queryParams: Record<string, string | number> = {
      pageNo,
      pageSize,
      name: name.trim(),
    };
    if (status && status !== 'All') {
      queryParams.status = status;
    }
    return labClient.get('/api/v1/departments/search', { params: queryParams });
  },

  /**
   * GET ACTIVE DEPARTMENTS
   * Endpoint: GET /api/v1/departments/active?pageNo=0&pageSize=10
   * Search: GET /api/v1/departments/search?name=...&pageNo=0&pageSize=10
   */
  getActiveDepartments: async (params: { pageNo?: number; pageSize?: number; name?: string } = {}): Promise<ApiResponse<PaginatedResponse<Department>>> => {
    const { pageNo = 0, pageSize = 10, name } = params;

    const searchName = name?.trim();
    if (searchName) {
      return labClient.get('/api/v1/departments/search', {
        params: { pageNo, pageSize, name: searchName, status: 'active' },
      });
    }

    return labClient.get('/api/v1/departments/active', { params: { pageNo, pageSize } });
  },

  /**
   * GET DEPARTMENT BY ID - Fetch a single department
   * Endpoint: GET /api/v1/departments/{id}
   */
  getDepartmentById: async (id: number): Promise<ApiResponse<Department>> => {
    return labClient.get(`/api/v1/departments/${id}`);
  },

  /**
   * CREATE DEPARTMENT - Create a new department
   * Endpoint: POST /api/v1/departments
   */
  createDepartment: async (input: CreateDepartmentInput): Promise<ApiResponse<Department>> => {
    const requestBody = {
      departmentCode: input.departmentCode,
      departmentName: input.departmentName,
      departmentNameShort: input.departmentNameShort || null,
      description: input.description || '',
      displayOrder: input.displayOrder || 0,
      isActive: input.isActive !== undefined ? input.isActive : true,
      location: input.location || null,
      branchId: input.branchId || 1,
      tenantId: input.tenantId || 2,
    };

    return labClient.post('/api/v1/departments', requestBody);
  },

  /**
   * UPDATE DEPARTMENT - Update an existing department
   * Endpoint: PUT /api/v1/departments/{id}
   */
  updateDepartment: async (id: number, input: UpdateDepartmentInput): Promise<ApiResponse<Department>> => {
    const requestBody = {
      departmentCode: input.departmentCode,
      departmentName: input.departmentName,
      departmentNameShort: input.departmentNameShort || null,
      description: input.description || '',
      displayOrder: input.displayOrder || 0,
      isActive: input.isActive !== undefined ? input.isActive : true,
      location: input.location || null,
      branchId: input.branchId || 1,
    };

    return labClient.put(`/api/v1/departments/${id}`, requestBody);
  },

  /**
   * DELETE DEPARTMENT - Delete a department
   * Endpoint: DELETE /api/v1/departments/{id}
   */
  deleteDepartment: async (id: number): Promise<ApiResponse<void>> => {
    return labClient.delete(`/api/v1/departments/${id}`);
  },

  /**
   * TOGGLE DEPARTMENT STATUS - Toggle active/inactive status
   * Endpoint: PATCH /api/v1/departments/{id}/status
   */
  toggleDepartmentStatus: async (id: number, isActive: boolean): Promise<ApiResponse<Department>> => {
    return labClient.patch(`/api/v1/departments/${id}/status`, { isActive });
  },
};
