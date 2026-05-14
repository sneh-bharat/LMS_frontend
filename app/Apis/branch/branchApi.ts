import branchClient from './axios';


// ─── Types ──────────────────────────────────────────────────────────────────

export interface Branch {
  id: number;
  branchCode: string;
  branchName: string;
  branchType: string;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  isActive: boolean;
  tenantId: number;
}

export interface BranchDetails {
  id: number;
  tenantId: number;
  branchCode: string;
  branchName: string;
  branchType: string;
  address: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  branchManagerName: string | null;
  branchManagerEmail: string | null;
  status: string;
  maxUsers: number;
  totalUsers: number;
  activeUsers: number;
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

export interface CreateBranchInput {
  branchName: string;
  branchType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
  tenantId?: number;
}

export interface UpdateBranchInput {
  branchName?: string;
  branchType?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  isActive?: boolean;
}

export interface BranchQueryParams {
  pageNo?: number;
  pageSize?: number;
  term?: string;
  search?: string;
  status?: string;
  tenantId?: number;
}

// ─── API Service Functions ──────────────────────────────────────────────────

/**
 * GET ALL BRANCHES - Fetch branches with pagination, search, and filtering
 * Endpoint: GET /api/v1/tenants/{tenantId}/branches/search
 */
export const branchApi = {
  getAllBranches: async (params: BranchQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Branch>>> => {
    const { pageNo = 0,  pageSize= 10, term, search, status, tenantId = 1 } = params;
    const searchTerm = term || search;
    
    const queryParams: any = { pageNo, pageSize };
    
    if (searchTerm && searchTerm.trim()) {
      queryParams.term = searchTerm.trim();
    }
    
    if (status && status !== 'All') {
      queryParams.status = status;
    }

    // Ensure tenantId is always provided and valid
    const validTenantId = tenantId || 1;
    
    return branchClient.get(`/api/v1/tenants/${validTenantId}/branches/search`, { params: queryParams });
  },

  /**
   * GET ACTIVE BRANCHES - Fetch active branches only
   * Endpoint: GET /api/v1/tenants/{tenantId}/branches/active
   */
  getActiveBranches: async (params: { pageNo?: number; pageSize?: number; search?: string; tenantId?: number } = {}): Promise<ApiResponse<PaginatedResponse<Branch>>> => {
    const { pageNo = 0, pageSize = 10, search, tenantId = 1 } = params;
    
    const queryParams: any = { pageNo, pageSize };
    
    if (search && search.trim()) {
      queryParams.search = search.trim();
    }

    const validTenantId = tenantId || 1;
    
    return branchClient.get(`/api/v1/tenants/${validTenantId}/branches/active`, { params: queryParams });
  },

  /**
   * GET BRANCH BY ID - Fetch a single branch details
   * Endpoint: GET /api/v1/tenants/{tenantId}/branches/{id}
   */
  getBranchById: async (id: number, tenantId: number = 1): Promise<ApiResponse<BranchDetails>> => {
    const validTenantId = tenantId || 1;
    return branchClient.get(`/api/v1/tenants/${validTenantId}/branches/${id}`);
  },

  /**
   * CREATE BRANCH - Create a new branch
   * Endpoint: POST /api/v1/tenants/{tenantId}/branches/create
   */
  createBranch: async (input: CreateBranchInput, tenantId: number = 1): Promise<ApiResponse<Branch>> => {
    const validTenantId = tenantId || 1;
    const requestBody = {
      branchName: input.branchName,
      branchType: input.branchType || 'MAIN',
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      country: input.country || null,
      postalCode: input.postalCode || null,
      contactEmail: input.contactEmail || null,
      contactPhone: input.contactPhone || null,
      isActive: input.isActive ?? true,
    };

    return branchClient.post(`/api/v1/tenants/${validTenantId}/branches/create`, requestBody);
  },

  /**
   * UPDATE BRANCH - Update an existing branch
   * Endpoint: PUT /api/v1/tenants/{tenantId}/branches/{id}
   */
  updateBranch: async (id: number, input: UpdateBranchInput, tenantId: number = 1): Promise<ApiResponse<Branch>> => {
    const validTenantId = tenantId || 1;
    return branchClient.put(`/api/v1/tenants/${validTenantId}/branches/${id}`, input);
  },

  /**
   * DELETE BRANCH - Delete a branch
   * Endpoint: DELETE /api/v1/tenants/{tenantId}/branches/{id}
   */
  deleteBranch: async (id: number, tenantId: number = 1): Promise<ApiResponse<void>> => {
    const validTenantId = tenantId || 1;
    return branchClient.delete(`/api/v1/tenants/${validTenantId}/branches/${id}`);
  },

  /**
   * TOGGLE BRANCH STATUS - Toggle active/inactive status
   * Endpoint: PATCH /api/v1/tenants/{tenantId}/branches/{id}/status
   */
  toggleBranchStatus: async (id: number, isActive: boolean, tenantId: number = 1): Promise<ApiResponse<Branch>> => {
    const validTenantId = tenantId || 1;
    return branchClient.patch(`/api/v1/tenants/${validTenantId}/branches/${id}/status`, { isActive });
  },
};