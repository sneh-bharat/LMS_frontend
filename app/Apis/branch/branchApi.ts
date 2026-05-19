import branchClient from '@/app/Apis/branch/axios';
import labClient from '@/app/Apis/lab/axios';
import { authApiPath } from '@/app/Apis/Auth/authServiceBaseUrl';
import { testCatalogApiPath } from '@/app/Apis/lab/testCatalogBaseUrl';

function resolveTenantId(tenantId?: number): number {
  if (tenantId != null && tenantId > 0) return tenantId;
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('tenantId');
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
  }
  return 1;
}


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

export interface BranchPriceConfigInput {
  importBranchId: number;
  branchId: number;
  mrpPricePercentage: number;
  cghsPercentage: number;
  b2bPricePercentage: number;
  ipPercentage: number;
}

export interface BranchTestPriceItem {
  id: number;
  testId: number;
  testCode: string;
  testName: string;
  branchId: number;
  branchName: string;
  branchType: string;
  tenantId: number;
  price: number;
  cghsPrice: number;
  b2bPrice: number;
  ipPrice: number;
  isActive: boolean;
}

export interface BranchPricePercentageInfo {
  cghsPercentage: number;
  mrpPricePercentage: number;
  ipPercentage: number;
  b2bPricePercentage: number;
}

export interface BranchTestPricesData {
  last: boolean;
  pageNo: number;
  totalPages: number;
  pageSize: number;
  percentageInfo: BranchPricePercentageInfo;
  content: BranchTestPriceItem[];
  first: boolean;
  totalElements: number;
}

export interface BranchTestPricesQueryParams {
  pageNo?: number;
  pageSize?: number;
}

export interface UpdateTestPriceInput {
  testId: number;
  branchId: number;
  price: number;
  cghsPrice: number;
  b2bPrice: number;
  isActive: boolean;
  ipPrice?: number;
  description?: string;
  termsAndConditions?: string;
}

// ─── API Service Functions ──────────────────────────────────────────────────

/**
 * GET ALL BRANCHES - Fetch branches with pagination, search, and filtering
 * Endpoint: GET /api/v1/tenants/{tenantId}/branches/search
 */
export const branchApi = {
  getAllBranches: async (params: BranchQueryParams = {}): Promise<ApiResponse<PaginatedResponse<Branch>>> => {
    const { pageNo = 0, pageSize = 10, term, search, status, tenantId } = params;
    const searchTerm = term || search;
    
    const queryParams: any = { pageNo, pageSize };
    
    if (searchTerm && searchTerm.trim()) {
      queryParams.term = searchTerm.trim();
    }
    
    if (status && status !== 'All') {
      queryParams.status = status;
    }

    const validTenantId = resolveTenantId(tenantId);

    return branchClient.get(
      authApiPath(`/tenants/${validTenantId}/branches/search`),
      { params: queryParams }
    );
  },

  /**
   * GET ACTIVE BRANCHES - Fetch active branches only
   * Endpoint: GET /api/v1/tenants/{tenantId}/branches/active
   */
  getActiveBranches: async (params: { pageNo?: number; pageSize?: number; search?: string; tenantId?: number } = {}): Promise<ApiResponse<PaginatedResponse<Branch>>> => {
    const { pageNo = 0, pageSize = 10, search, tenantId } = params;
    
    const queryParams: any = { pageNo, pageSize };
    
    if (search && search.trim()) {
      queryParams.search = search.trim();
    }

    const validTenantId = resolveTenantId(tenantId);

    return branchClient.get(
      authApiPath(`/tenants/${validTenantId}/branches/active`),
      { params: queryParams }
    );
  },

  /**
   * GET BRANCH BY ID - Fetch a single branch details
   * Endpoint: GET /api/v1/tenants/{tenantId}/branches/{id}
   */
  getBranchById: async (id: number, tenantId?: number): Promise<ApiResponse<BranchDetails>> => {
    const validTenantId = resolveTenantId(tenantId);
    return branchClient.get(authApiPath(`/tenants/${validTenantId}/branches/${id}`));
  },

  /**
   * CREATE BRANCH - Create a new branch
   * Endpoint: POST /api/v1/tenants/{tenantId}/branches/create
   */
  createBranch: async (input: CreateBranchInput, tenantId?: number): Promise<ApiResponse<Branch>> => {
    const validTenantId = resolveTenantId(tenantId);
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

    return branchClient.post(authApiPath(`/tenants/${validTenantId}/branches/create`), requestBody);
  },

  /**
   * UPDATE BRANCH - Update an existing branch
   * Endpoint: PUT /api/v1/tenants/{tenantId}/branches/{id}
   */
  updateBranch: async (id: number, input: UpdateBranchInput, tenantId?: number): Promise<ApiResponse<Branch>> => {
    const validTenantId = resolveTenantId(tenantId);
    return branchClient.put(authApiPath(`/tenants/${validTenantId}/branches/${id}`), input);
  },

  /**
   * DELETE BRANCH - Delete a branch
   * Endpoint: DELETE /api/v1/tenants/{tenantId}/branches/{id}
   */
  deleteBranch: async (id: number, tenantId?: number): Promise<ApiResponse<void>> => {
    const validTenantId = resolveTenantId(tenantId);
    return branchClient.delete(authApiPath(`/tenants/${validTenantId}/branches/${id}`));
  },

  /**
   * TOGGLE BRANCH STATUS - Toggle active/inactive status
   * Endpoint: PATCH /api/v1/tenants/{tenantId}/branches/{id}/status
   */
  toggleBranchStatus: async (id: number, isActive: boolean, tenantId?: number): Promise<ApiResponse<Branch>> => {
    const validTenantId = resolveTenantId(tenantId);
    return branchClient.patch(authApiPath(`/tenants/${validTenantId}/branches/${id}/status`), { isActive });
  },

  /**
   * APPLY PERCENTAGE PRICING - Import branch prices with percentage adjustments
   * Endpoint: POST /api/v1/test-prices/apply-percentage-pricing
   */
  createBranchPriceConfiguration: async (
    input: BranchPriceConfigInput
  ): Promise<ApiResponse<unknown>> => {
    return labClient.post(
      testCatalogApiPath('/test-prices/apply-percentage-pricing'),
      input
    );
  },

  /**
   * GET TEST PRICES BY TEST ID - All branch prices for a test
   * Endpoint: GET /api/v1/test-prices/test/{testId}?pageNo=0&pageSize=20
   * Response: { data: BranchTestPriceItem[] }
   */
  getTestPricesByTestId: async (
    testId: number,
    params: BranchTestPricesQueryParams = {}
  ): Promise<ApiResponse<BranchTestPriceItem[]>> => {
    const { pageNo = 0, pageSize = 20 } = params;
    return labClient.get(testCatalogApiPath(`/test-prices/test/${testId}`), {
      params: { pageNo, pageSize },
    });
  },

  /**
   * GET BRANCH TEST PRICES - Paginated price list for a branch
   * Endpoint: GET /api/v1/test-prices/branch/{branchId}?pageNo=0&pageSize=20
   */
  getBranchTestPrices: async (
    branchId: number,
    params: BranchTestPricesQueryParams = {}
  ): Promise<ApiResponse<BranchTestPricesData>> => {
    const { pageNo = 0, pageSize = 20 } = params;
    return labClient.get(testCatalogApiPath(`/test-prices/branch/${branchId}`), {
      params: { pageNo, pageSize },
    });
  },

  /**
   * CHECK BRANCH HAS TEST PRICES - Whether /test-prices/branch/{branchId} has any records
   */
  hasBranchTestPrices: async (branchId: number): Promise<boolean> => {
    try {
      const response = await labClient.get(
        testCatalogApiPath(`/test-prices/branch/${branchId}`),
        { params: { pageNo: 0, pageSize: 1 } }
      );
      return (response.data?.totalElements ?? 0) > 0;
    } catch {
      return false;
    }
  },

  /**
   * CREATE TEST PRICE - Create a test price for a branch
   * Endpoint: POST /api/v1/test-prices
   */
  createTestPrice: async (
    input: UpdateTestPriceInput
  ): Promise<ApiResponse<BranchTestPriceItem>> => {
    return labClient.post(testCatalogApiPath('/test-prices'), input);
  },

  /**
   * UPDATE TEST PRICE - Update a single branch test price record
   * Endpoint: PUT /api/v1/test-prices/{id}
   */
  updateTestPrice: async (
    id: number,
    input: UpdateTestPriceInput
  ): Promise<ApiResponse<BranchTestPriceItem>> => {
    return labClient.put(testCatalogApiPath(`/test-prices/${id}`), input);
  },
};