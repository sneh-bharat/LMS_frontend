/**
 * Patient Service API - UPDATED WITH FULL EDIT SUPPORT
 * 
 * Handles all patient-related API operations including:
 * - Fetching patient lists with pagination and filtering
 * - Creating new patients
 * - Updating patient information
 * - Deleting patients
 * - Fetching individual patient details
 */

import { getPatientServiceBaseUrl } from './patientServiceBaseUrl';

const API_BASE_URL = getPatientServiceBaseUrl();

/** Same auth as `app/Apis/Auth/apiClient.ts` — backend requires Bearer for patient routes. */
function staffAuthHeaders(extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json', ...extra };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
}

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
      if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        return {
          code: `HTTP_${response.status}`,
          message: this.getStatusMessage(response.status),
          details: data,
        };
      }
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

export interface PatientAddress {
  id?: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  state: string;
  pinCode: string;
  addressType?: string;
  isPrimary: boolean;
}

export interface PatientAllergy {
  id?: number;
  allergyName: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  notedBy: number;
  remarks?: string;
}

export interface Patient {
  id?: number;
  patientCode: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'TRANSGENDER';
  bloodGroup: 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';
  mobilePrimary: string;
  mobileAlternate?: string;
  email?: string;
  abhaId?: string;
  patientCategory: 'REGULAR' | 'VIP' | 'CORPORATE' | 'TPA' | 'CGHS' | 'ECHS' | 'ESI' | 'BPL' | 'STAFF';
  clinicId: number;
  isActive: boolean;
  referringDoctorId?: number;
  insuranceCompany?: string;
  insurancePolicyNo?: string;
  whatsappConsent?: 'YES' | 'NO';
  reportLanguage?: string;
  photoUrl?: string;
  addresses?: PatientAddress[];
  allergies?: PatientAllergy[];
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

export interface PaginatedResponse<T> {
  last: boolean;
  pageNo: number;
  totalPages: number;
  pageSize: number;
  content: T[];
  first: boolean;
  totalElements: number;
}

export interface CreatePatientInput {
  patientCode?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'TRANSGENDER';
  bloodGroup: 'A_POS' | 'A_NEG' | 'B_POS' | 'B_NEG' | 'AB_POS' | 'AB_NEG' | 'O_POS' | 'O_NEG';
  mobilePrimary: string;
  mobileAlternate?: string;
  email?: string;
  abhaId?: string;
  patientCategory: 'REGULAR' | 'VIP' | 'CORPORATE' | 'TPA' | 'CGHS' | 'ECHS' | 'ESI' | 'BPL' | 'STAFF';
  clinicId: number;
  isActive?: boolean;
  referringDoctorId?: number;
  insuranceCompany?: string;
  insurancePolicyNo?: string;
  whatsappConsent?: 'YES' | 'NO';
  reportLanguage?: string;
  photoUrl?: string;
  addresses?: PatientAddress[];
  allergies?: PatientAllergy[];
}

export interface UpdatePatientInput extends CreatePatientInput {
  id?: number;
}

// ─── API Functions ──────────────────────────────────────────────────────────

/**
 * GET ALL PATIENTS - Fetch patients with pagination, search, and filtering
 * 
 * @param pageNo - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @param search - Optional search term for patient name or code
 * @param category - Optional patient category filter
 * @returns Paginated list of patients
 */
export async function fetchPatients(
  pageNo: number = 0,
  pageSize: number = 10,
  search?: string,
  category?: string
): Promise<ApiResponse<PaginatedResponse<Patient>>> {
  try {
    const params = new URLSearchParams({
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    if (category && category !== 'All') {
      params.append('category', category);
    }

    const url = `${API_BASE_URL}/patients?${params}`;
    logger.debug('Fetching patients', { pageNo, pageSize, search, category });

    const response = await fetch(url, {
      method: 'GET',
      headers: staffAuthHeaders(),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error(
        `Failed to fetch patients: ${error.message} (HTTP ${response.status}) ${url}`
      );
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully fetched patients', {
      count: responseData.data?.content?.length,
      totalElements: responseData.data?.totalElements,
      totalPages: responseData.data?.totalPages,
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
 * GET PATIENT BY ID - Fetch single patient with full details
 * 
 * @param patientId - Patient ID to fetch
 * @returns Patient with detailed information including addresses and allergies
 */
export async function fetchPatientById(
  patientId: number
): Promise<ApiResponse<Patient>> {
  try {
    const url = `${API_BASE_URL}/patients/${patientId}`;
    logger.debug('Fetching patient details', { patientId });

    const response = await fetch(url, {
      method: 'GET',
      headers: staffAuthHeaders(),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to fetch patient details', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully fetched patient details', {
      patientId,
      patientName: `${responseData.data?.firstName} ${responseData.data?.lastName}`,
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
 * CREATE PATIENT - Create a new patient record with FormData support
 * 
 * @param input - Patient creation data with optional photo file
 * @returns Created patient with ID
 */
export async function createPatient(
  input: CreatePatientInput & { photoFile?: File }
): Promise<ApiResponse<Patient>> {
  try {
    const validationErrors = validatePatientData(input as CreatePatientInput);
    if (validationErrors.length > 0) {
      logger.warn('Validation errors in patient data', validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const url = `${API_BASE_URL}/patients`;
    logger.debug('Creating patient', {
      patientCode: input.patientCode,
      patientName: `${input.firstName} ${input.lastName}`,
    });

    // Create patientRequestDTO object (exclude photoFile from the DTO)
    const { photoFile, ...patientDTO } = input;

    // Create FormData
    const formData = new FormData();

    // Add patientRequestDTO as JSON string with proper type
    formData.append('patientRequestDTO', new Blob([JSON.stringify(patientDTO)], { type: 'application/json' }));

    // Add photo file if provided with explicit field name
    if (photoFile) {
      formData.append('photoUrl', photoFile, photoFile.name);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: staffAuthHeaders(),
      body: formData,
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to create patient', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully created patient', {
      id: responseData.data?.id,
      patientCode: input.patientCode,
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
 * UPDATE PATIENT - Update an existing patient record
 * 
 * @param patientId - ID of patient to update
 * @param input - Patient data to update
 * @returns Updated patient data
 */
export async function updatePatient(
  patientId: number,
  input: CreatePatientInput & { photoFile?: File }
): Promise<ApiResponse<Patient>> {
  try {
    const url = `${API_BASE_URL}/patients/${patientId}`;

    // Separate photoFile from the DTO
    const { photoFile, ...patientDTO } = input;

    // Create FormData for multipart request
    const formData = new FormData();

    console.log('📤 SENDING UPDATE REQUEST');
    console.log('Patient ID:', patientId);
    console.log('Payload being sent:', JSON.stringify(patientDTO, null, 2));

    // IMPORTANT: Use 'patientUpdateDTO' as the field name (not 'patientRequestDTO')
    // This matches the backend expectation shown in the curl example
    formData.append('patientUpdateDTO', new Blob([JSON.stringify(patientDTO)], { type: 'application/json' }));

    // Add photo file if provided
    if (photoFile) {
      formData.append('photoUrl', photoFile, photoFile.name);
    }

    console.log('📦 FormData entries:');
    for (const [key, value] of formData.entries()) {
      const val = value as any;
      console.log(`  ${key}:`, val instanceof File ? `File: ${val.name}` : val instanceof Blob ? 'Blob (JSON)' : val);
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers: staffAuthHeaders(),
      body: formData,
      // DO NOT set Content-Type header - browser will auto-set multipart/form-data with boundary
    });

    const responseText = await response.text();

    console.log('📥 RESPONSE RECEIVED');
    console.log('Status:', response.status);
    console.log('Response Text:', responseText);

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to update patient', error);
      console.error('❌ UPDATE FAILED:', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully updated patient', {
      patientId,
      code: responseData.code,
    });
    console.log('✅ UPDATE SUCCESSFUL:', responseData);

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      const message = `Network Error: Unable to connect to API at ${API_BASE_URL}. Please check your internet connection.`;
      logger.error(message);
      console.error('🌐 NETWORK ERROR:', message);
      throw new Error(message);
    }
    console.error('💥 UNEXPECTED ERROR:', error);
    throw error;
  }
}

/**
 * DELETE PATIENT - Delete a patient record
 * 
 * @param patientId - ID of patient to delete
 * @returns Void response on success
 */
export async function deletePatient(
  patientId: number
): Promise<ApiResponse<void>> {
  try {
    const url = `${API_BASE_URL}/patients/${patientId}`;
    logger.debug('Deleting patient', { patientId });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: staffAuthHeaders(),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to delete patient', error);
      throw new Error(error.message);
    }

    const responseData = responseText ? JSON.parse(responseText) : { data: null };
    logger.debug('Successfully deleted patient', { patientId });

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
 * FETCH PATIENT IMAGE - Fetch patient profile image in base64 format
 * 
 * @param patientId - ID of patient to fetch image for
 * @returns ApiResponse containing base64 image data
 */
export async function fetchPatientImage(
  patientId: number
): Promise<ApiResponse<string>> {
  try {
    const url = `${API_BASE_URL}/patients/image/${patientId}`;
    logger.debug('Fetching patient image', { patientId });

    const response = await fetch(url, {
      method: 'GET',
      headers: staffAuthHeaders(),
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to fetch patient image', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully fetched patient image', { patientId });

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

export function validatePatientData(data: Partial<CreatePatientInput>): string[] {
  const errors: string[] = [];

  // First Name
  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  } else if (data.firstName.length > 100) {
    errors.push('First name must be 100 characters or less');
  }

  // Last Name
  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  } else if (data.lastName.length > 100) {
    errors.push('Last name must be 100 characters or less');
  }

  // Date of Birth
  if (!data.dateOfBirth) {
    errors.push('Date of birth is required');
  }

  // Gender
  if (!data.gender) {
    errors.push('Gender is required');
  }

  // Blood Group
  if (!data.bloodGroup) {
    errors.push('Blood group is required');
  }

  // Mobile Primary
  if (!data.mobilePrimary?.trim()) {
    errors.push('Primary mobile number is required');
  } else if (!/^\d{10}$/.test(data.mobilePrimary.replace(/\D/g, ''))) {
    errors.push('Primary mobile number must be 10 digits');
  }

  // Email (optional but validate format if provided)
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Clinic ID
  if (!data.clinicId) {
    errors.push('Clinic ID is required');
  }

  // Active Status
  if (typeof data.isActive !== 'boolean') {
    errors.push('Active status is required');
  }

  // Patient Category
  if (!data.patientCategory?.trim()) {
    errors.push('Patient category is required');
  }

  // WhatsApp Consent (optional but validate if provided)
  if (data.whatsappConsent && !['YES', 'NO'].includes(data.whatsappConsent)) {
    errors.push('WhatsApp consent must be YES or NO');
  }

  return errors;
}

/**
 * Type guard to check if data is a Patient array
 */
export function isPatientArray(data: unknown): data is Patient[] {
  return (
    Array.isArray(data) &&
    data.every(item =>
      typeof item === 'object' &&
      item !== null &&
      'patientCode' in item &&
      'firstName' in item &&
      'lastName' in item &&
      'mobilePrimary' in item
    )
  );
}