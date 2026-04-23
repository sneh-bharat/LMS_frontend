/**
 * Family Link Service API
 * 
 * Handles all family link-related API operations including:
 * - Creating family links between patients
 * - Fetching family links for a patient
 * - Updating family links
 * - Deleting family links
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.5:9040/api/v1';

// ─── Logger Utility ──────────────────────────────────────────────────────────

const logger = {
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error);
  },
  warn: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data);
    }
  },
};

// ─── Error Handler Utility ──────────────────────────────────────────────────

class ApiErrorHandler {
  static handle(response: Response, responseText: string): { code: string; message: string; details?: unknown } {
    try {
      const data = JSON.parse(responseText);
      return {
        code: data.code || `HTTP_${response.status}`,
        message: data.message || data.error || this.getStatusMessage(response.status),
        details: data,
      };
    } catch {
      return {
        code: `HTTP_${response.status}`,
        message: responseText || this.getStatusMessage(response.status),
        details: null,
      };
    }
  }

  static isNetworkError(error: unknown): boolean {
    return error instanceof TypeError && (error as any).message === 'Failed to fetch';
  }

  private static getStatusMessage(status: number): string {
    const messages: { [key: number]: string } = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      409: 'Conflict',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable',
    };
    return messages[status] || `HTTP ${status}: An error occurred`;
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface FamilyLink {
  id?: number;
  patientId: number;
  patientName: string;
  familyMemberId: number;
  familyMemberName: string;
  relation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  response: boolean;
  status: string;
  timestamp: string;
  code?: number;
}

export interface CreateFamilyLinkInput {
  patientId: number;
  patientName: string;
  familyMemberId: number;
  familyMemberName: string;
  relation: string;
}

export interface UpdateFamilyLinkInput {
  id: number;
  patientId?: number;
  patientName?: string;
  familyMemberId?: number;
  familyMemberName?: string;
  relation?: string;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * CREATE FAMILY LINK - Create a new family link between patients
 * 
 * @param input - Family link creation data
 * @returns Created family link with ID
 */
export async function createFamilyLink(
  input: CreateFamilyLinkInput
): Promise<ApiResponse<FamilyLink>> {
  try {
    const url = `${API_BASE_URL}/family-links`;
    logger.debug('Creating family link', { 
      patientId: input.patientId,
      patientName: input.patientName,
      familyMemberId: input.familyMemberId,
      relation: input.relation,
    });

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
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to create family link', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully created family link', { 
      id: responseData.data?.id,
      patientId: input.patientId,
    });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      const message = `Network Error: Unable to connect to API at ${API_BASE_URL}. Please check your internet connection and ensure the backend server is running.`;
      logger.error(message);
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * GET FAMILY LINKS BY PATIENT ID - Fetch all family links for a specific patient
 * 
 * @param patientId - Patient ID to fetch family links for
 * @returns List of family links for the patient
 */
export async function getFamilyLinksByPatientId(
  patientId: number
): Promise<ApiResponse<FamilyLink[]>> {
  try {
    const url = `${API_BASE_URL}/family-links/patient/${patientId}`;
    logger.debug('Fetching family links for patient', { patientId });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to fetch family links', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully fetched family links', {
      count: responseData.data?.length || 0,
      patientId,
    });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      const message = `Network Error: Unable to connect to API at ${API_BASE_URL}. Please check your internet connection.`;
      logger.error(message);
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * GET FAMILY LINK BY ID - Fetch a single family link
 * 
 * @param familyLinkId - Family link ID to fetch
 * @returns Family link with detailed information
 */
export async function getFamilyLinkById(
  familyLinkId: number
): Promise<ApiResponse<FamilyLink>> {
  try {
    const url = `${API_BASE_URL}/family-links/${familyLinkId}`;
    logger.debug('Fetching family link details', { familyLinkId });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to fetch family link details', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully fetched family link details', {
      familyLinkId,
    });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      const message = `Network Error: Unable to connect to API at ${API_BASE_URL}. Please check your internet connection.`;
      logger.error(message);
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * UPDATE FAMILY LINK - Update an existing family link
 * 
 * @param familyLinkId - ID of family link to update
 * @param input - Family link data to update
 * @returns Updated family link data
 */
export async function updateFamilyLink(
  familyLinkId: number,
  input: UpdateFamilyLinkInput
): Promise<ApiResponse<FamilyLink>> {
  try {
    const url = `${API_BASE_URL}/family-links/${familyLinkId}`;
    logger.debug('Updating family link', { 
      familyLinkId,
      ...input,
    });

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
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to update family link', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully updated family link', { 
      familyLinkId,
    });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      const message = `Network Error: Unable to connect to API at ${API_BASE_URL}. Please check your internet connection.`;
      logger.error(message);
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * DELETE FAMILY LINK - Delete a family link
 * 
 * @param familyLinkId - ID of family link to delete
 * @returns Void response on success
 */
export async function deleteFamilyLink(
  familyLinkId: number
): Promise<ApiResponse<void>> {
  try {
    const url = `${API_BASE_URL}/family-links/${familyLinkId}`;
    logger.debug('Deleting family link', { familyLinkId });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to delete family link', error);
      throw new Error(error.message);
    }

    const responseData = responseText ? JSON.parse(responseText) : { data: null };
    logger.debug('Successfully deleted family link', { familyLinkId });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      const message = `Network Error: Unable to connect to API at ${API_BASE_URL}. Please check your internet connection.`;
      logger.error(message);
      throw new Error(message);
    }
    throw error;
  }
}

// ─── Validation Helper ──────────────────────────────────────────────────────

export function validateFamilyLinkData(data: Partial<CreateFamilyLinkInput>): string[] {
  const errors: string[] = [];

  // Patient ID
  if (!data.patientId || data.patientId <= 0) {
    errors.push('Patient ID is required and must be a positive number');
  }

  // Patient Name
  if (!data.patientName?.trim()) {
    errors.push('Patient name is required');
  } else if (data.patientName.length > 200) {
    errors.push('Patient name must be 200 characters or less');
  }

  // Family Member ID
  if (!data.familyMemberId || data.familyMemberId <= 0) {
    errors.push('Family member ID is required and must be a positive number');
  }

  // Family Member Name
  if (!data.familyMemberName?.trim()) {
    errors.push('Family member name is required');
  } else if (data.familyMemberName.length > 200) {
    errors.push('Family member name must be 200 characters or less');
  }

  // Relation
  if (!data.relation?.trim()) {
    errors.push('Relation is required');
  } else if (data.relation.length > 100) {
    errors.push('Relation must be 100 characters or less');
  }

  return errors;
}

/**
 * Type guard to check if data is a FamilyLink array
 */
export function isFamilyLinkArray(data: unknown): data is FamilyLink[] {
  return (
    Array.isArray(data) &&
    data.every(item =>
      typeof item === 'object' &&
      item !== null &&
      'patientId' in item &&
      'patientName' in item &&
      'familyMemberId' in item &&
      'familyMemberName' in item &&
      'relation' in item
    )
  );
}
