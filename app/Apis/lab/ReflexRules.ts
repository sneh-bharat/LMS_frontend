/**
 * Reflex Rules API Service
 * API Endpoints for managing laboratory reflex testing rules
 * 
 * Reflex Rules: "If Test A gives a certain result, automatically order or perform Test B"
 */

import departmentClient from './axios';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ReflexRule {
  id: number;
  tenantId: number;
  testId: number;
  testCode: string;
  testName: string;
  reflexTestId: number;
  reflexTestCode: string;
  reflexTestName: string;
  conditionType: 'ABOVE' | 'BELOW' | 'BETWEEN' | 'EQUALS' | 'NOT_EQUALS' | 'POSITIVE' | 'NEGATIVE' | 'ABNORMAL' | 'CRITICAL' | 'ALWAYS';
  thresholdValue: number | null;
  thresholdLow: number | null;
  thresholdHigh: number | null;
  logicOperator: 'AND' | 'OR';
  priority: number;
  autoOrder: boolean;
  notifyPhysician: boolean;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  ageMin: number | null;
  ageMax: number | null;
  parameterId: number | null;
  parameterName: string | null;
  branchId: number | null;
  clinicalRationale: string | null;
  technicianNotes: string | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
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

export interface CreateReflexRuleInput {
  testId: number;
  reflexTestId: number;
  conditionType: 'ABOVE' | 'BELOW' | 'BETWEEN' | 'EQUALS' | 'NOT_EQUALS' | 'POSITIVE' | 'NEGATIVE' | 'ABNORMAL' | 'CRITICAL' | 'ALWAYS';
  thresholdValue?: number;
  thresholdLow?: number;
  thresholdHigh?: number;
  logicOperator?: 'AND' | 'OR';
  priority?: number;
  autoOrder?: boolean;
  notifyPhysician?: boolean;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  ageMin?: number;
  ageMax?: number;
  parameterId?: number;
  branchId?: number;
  clinicalRationale?: string;
  technicianNotes?: string;
  isActive?: boolean;
}

export interface UpdateReflexRuleInput {
  testId?: number;
  reflexTestId?: number;
  conditionType?: 'ABOVE' | 'BELOW' | 'BETWEEN' | 'EQUALS' | 'NOT_EQUALS' | 'POSITIVE' | 'NEGATIVE' | 'ABNORMAL' | 'CRITICAL' | 'ALWAYS';
  thresholdValue?: number;
  thresholdLow?: number;
  thresholdHigh?: number;
  logicOperator?: 'AND' | 'OR';
  priority?: number;
  autoOrder?: boolean;
  notifyPhysician?: boolean;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  ageMin?: number;
  ageMax?: number;
  parameterId?: number;
  branchId?: number;
  clinicalRationale?: string;
  technicianNotes?: string;
  isActive?: boolean;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * Fetch all reflex rules with pagination
 */
export async function fetchReflexRules(
  pageNo: number = 0,
  pageSize: number = 20,
  search?: string,
  statusFilter?: string
): Promise<ApiResponse<PaginatedResponse<ReflexRule>>> {
  try {
    const params: any = {
      pageNo,
      pageSize,
    };

    if (search) {
      params.search = search;
    }

    if (statusFilter && statusFilter !== 'All') {
      params.isActive = statusFilter === 'Active' ? 'true' : 'false';
    }

    const response = await departmentClient.get('/api/v1/reflex-rules', { params });
    return response as any;
  } catch (error) {
    console.error('Failed to fetch reflex rules:', error);
    throw error;
  }
}

/**
 * Fetch reflex rule by ID
 */
export async function fetchReflexRuleById(
  id: number
): Promise<ApiResponse<ReflexRule>> {
  try {
    const response = await departmentClient.get(`/api/v1/reflex-rules/${id}`);
    return response as any;
  } catch (error) {
    console.error('Failed to fetch reflex rule:', error);
    throw error;
  }
}

/**
 * Create new reflex rule
 */
export async function createReflexRule(
  input: CreateReflexRuleInput
): Promise<ApiResponse<ReflexRule>> {
  try {
    const response = await departmentClient.post('/api/v1/reflex-rules', input);
    return response as any;
  } catch (error) {
    console.error('Failed to create reflex rule:', error);
    throw error;
  }
}

/**
 * Update existing reflex rule
 */
export async function updateReflexRule(
  id: number,
  input: UpdateReflexRuleInput
): Promise<ApiResponse<ReflexRule>> {
  try {
    const response = await departmentClient.put(`/api/v1/reflex-rules/${id}`, input);
    return response as any;
  } catch (error) {
    console.error('Failed to update reflex rule:', error);
    throw error;
  }
}

/**
 * Delete reflex rule
 */
export async function deleteReflexRule(
  id: number
): Promise<ApiResponse<void>> {
  try {
    const response = await departmentClient.delete(`/api/v1/reflex-rules/${id}`);
    return response as any;
  } catch (error) {
    console.error('Failed to delete reflex rule:', error);
    throw error;
  }
}

/**
 * Toggle reflex rule active status
 */
export async function toggleReflexRuleStatus(
  id: number,
  isActive: boolean
): Promise<ApiResponse<ReflexRule>> {
  try {
    const response = await departmentClient.patch(`/api/v1/reflex-rules/${id}/status`, { isActive });
    return response as any;
  } catch (error) {
    console.error('Failed to toggle reflex rule status:', error);
    throw error;
  }
}
