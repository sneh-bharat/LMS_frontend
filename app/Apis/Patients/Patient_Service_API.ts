/**
 * Patient Service API - FIXED VERSION
 * 
 * Handles all patient-related API operations including:
 * - Fetching patient lists with pagination and filtering
 * - Creating new patients with photo upload
 * - Updating patient information with photo support
 * - Deleting patients
 * - Fetching individual patient details
 * - Fetching patient photos with proper blob conversion
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Serialization Helper ──────────────────────────────────────────────────

function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(
      value,
      (_key, currentValue) => {
        if (currentValue instanceof Error) {
          return {
            name: currentValue.name,
            message: currentValue.message,
            stack: currentValue.stack,
          };
        }
        if (typeof File !== 'undefined' && currentValue instanceof File) {
          return {
            type: 'File',
            name: currentValue.name,
            size: currentValue.size,
            mimeType: currentValue.type,
          };
        }
        if (typeof Blob !== 'undefined' && currentValue instanceof Blob) {
          return {
            type: 'Blob',
            size: currentValue.size,
            mimeType: currentValue.type,
          };
        }
        return currentValue;
      },
      2
    );
  } catch {
    return String(value);
  }
}

// ─── Logger Utility ────────────────────────────────────────────────────────

const logger = {
  debug: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  error: (message: string, error?: unknown) => {
    const normalizedError =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error;
    console.error(`[ERROR] ${message}\n${safeSerialize(normalizedError)}`);
  },
  warn: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[WARN] ${message}`, data);
    }
  },
};

// ─── Error Handler Utility ─────────────────────────────────────────────────

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

// ─── Types ────────────────────────────────────────────────────────────────

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
  notedBy: number | string;
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
  bloodGroup:
    | 'A_POS'
    | 'A_NEG'
    | 'B_POS'
    | 'B_NEG'
    | 'AB_POS'
    | 'AB_NEG'
    | 'O_POS'
    | 'O_NEG';
  mobilePrimary: string;
  mobileAlternate?: string;
  email?: string;
  abhaId?: string;
  patientCategory: 'GENERAL' | 'REGULAR' | 'VIP' | 'CORPORATE' | 'TPA' | 'CGHS' | 'ECHS' | 'ESI' | 'BPL' | 'STAFF';
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
  patientCategory: 'GENERAL' | 'REGULAR' | 'VIP' | 'CORPORATE' | 'TPA' | 'CGHS' | 'ECHS' | 'ESI' | 'BPL' | 'STAFF';
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

// ─── Blood Group Normalization ─────────────────────────────────────────────

/**
 * Normalize blood group from UI format to API format
 * UI: A_POSITIVE, A_NEGATIVE, etc.
 * API: A_POS, A_NEG, etc.
 */
export function normalizeBloodGroup(value?: string): string {
  if (!value) return '';
  
  const map: Record<string, string> = {
    // Long format → short format
    'A_POSITIVE': 'A_POS',
    'A_NEGATIVE': 'A_NEG',
    'B_POSITIVE': 'B_POS',
    'B_NEGATIVE': 'B_NEG',
    'AB_POSITIVE': 'AB_POS',
    'AB_NEGATIVE': 'AB_NEG',
    'O_POSITIVE': 'O_POS',
    'O_NEGATIVE': 'O_NEG',
    // Pass-through for short format
    'A_POS': 'A_POS',
    'A_NEG': 'A_NEG',
    'B_POS': 'B_POS',
    'B_NEG': 'B_NEG',
    'AB_POS': 'AB_POS',
    'AB_NEG': 'AB_NEG',
    'O_POS': 'O_POS',
    'O_NEG': 'O_NEG',
  };
  
  return map[value] || value;
}

/**
 * Denormalize blood group from API format to UI format
 * API: A_POS, A_NEG, etc.
 * UI: A_POSITIVE, A_NEGATIVE, etc.
 */
export function denormalizeBloodGroup(value?: string): string {
  if (!value) return '';
  
  const map: Record<string, string> = {
    'A_POS': 'A_POSITIVE',
    'A_NEG': 'A_NEGATIVE',
    'B_POS': 'B_POSITIVE',
    'B_NEG': 'B_NEGATIVE',
    'AB_POS': 'AB_POSITIVE',
    'AB_NEG': 'AB_NEGATIVE',
    'O_POS': 'O_POSITIVE',
    'O_NEG': 'O_NEGATIVE',
    // Pass-through for long format
    'A_POSITIVE': 'A_POSITIVE',
    'A_NEGATIVE': 'A_NEGATIVE',
    'B_POSITIVE': 'B_POSITIVE',
    'B_NEGATIVE': 'B_NEGATIVE',
    'AB_POSITIVE': 'AB_POSITIVE',
    'AB_NEGATIVE': 'AB_NEGATIVE',
    'O_POSITIVE': 'O_POSITIVE',
    'O_NEGATIVE': 'O_NEGATIVE',
  };
  
  return map[value] || value;
}

// ─── Severity Normalization ────────────────────────────────────────────────

export function normalizeSeverity(value?: string): 'Mild' | 'Moderate' | 'Severe' {
  if (!value) return 'Mild';
  
  const map: Record<string, 'Mild' | 'Moderate' | 'Severe'> = {
    'LOW': 'Mild',
    'MEDIUM': 'Moderate',
    'HIGH': 'Severe',
    'Mild': 'Mild',
    'Moderate': 'Moderate',
    'Severe': 'Severe',
  };
  
  return map[value] || 'Mild';
}

export function denormalizeSeverity(value?: string): string {
  if (!value) return 'MEDIUM';
  
  const map: Record<string, string> = {
    'Mild': 'LOW',
    'Moderate': 'MEDIUM',
    'Severe': 'HIGH',
    'LOW': 'LOW',
    'MEDIUM': 'MEDIUM',
    'HIGH': 'HIGH',
  };
  
  return map[value] || 'MEDIUM';
}

// ─── Address Type Normalization ────────────────────────────────────────────

export function normalizeAddressType(value?: string): string {
  if (!value) return 'Home';
  
  const map: Record<string, string> = {
    'HOME': 'Home',
    'PERMANENT': 'Home',
    'COMMUNICATION': 'Home',
    'OFFICE': 'Office',
    'Home': 'Home',
    'Office': 'Office',
    'Permanent': 'Home',
    'Communication': 'Home',
  };
  
  return map[value] || 'Home';
}

// ─── API Functions ────────────────────────────────────────────────────────

/**
 * GET ALL PATIENTS - Fetch patients with pagination, search, and filtering
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
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to fetch patients', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully fetched patients', {
      count: responseData.data?.content?.length,
      totalElements: responseData.data?.totalElements,
    });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      const message = `Network Error: Unable to connect to API at ${API_BASE_URL}`;
      logger.error(message);
      throw new Error(message);
    }
    throw error;
  }
}

/**
 * SEARCH PATIENTS BY NAME - Search patients by name with pagination
 * 
 * @param searchKey - Search term for patient name
 * @param pageNo - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @returns List of patients matching the search criteria
 */
export async function searchPatientsByName(
  searchKey: string,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<Patient[]>> {
  try {
    const params = new URLSearchParams({
      searchKey: searchKey.trim(),
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    const url = `${API_BASE_URL}/patients/search/name?${params}`;
    logger.debug('Searching patients by name', { searchKey, pageNo, pageSize });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to search patients by name', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully searched patients by name', {
      count: responseData.data?.length || 0,
      searchKey,
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
 * SEARCH PATIENTS BY TYPE - Search patients with different search types (NAME, PHONE, EMAIL)
 * 
 * @param searchType - Type of search (NAME, PHONE, EMAIL)
 * @param value - Search value
 * @param pageNo - Page number (0-indexed)
 * @param pageSize - Number of items per page
 * @returns Paginated list of patients matching the search criteria
 */
export async function searchPatientsByType(
  searchType: string,
  value: string,
  pageNo: number = 0,
  pageSize: number = 10
): Promise<ApiResponse<PaginatedResponse<Patient>>> {
  try {
    const params = new URLSearchParams({
      searchType: searchType,
      value: value.trim(),
      pageNo: pageNo.toString(),
      pageSize: pageSize.toString(),
    });

    const url = `${API_BASE_URL}/patients/search/by-type?${params}`;
    logger.debug('Searching patients by type', { searchType, value, pageNo, pageSize });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to search patients by type', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully searched patients by type', {
      searchType,
      value,
      count: responseData.data?.content?.length || 0,
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
 * GET PATIENT BY ID - Fetch single patient with full details
 */
export async function fetchPatientById(patientId: number): Promise<ApiResponse<Patient>> {
  try {
    const url = `${API_BASE_URL}/patients/${patientId}`;
    logger.debug('Fetching patient details', { patientId });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to fetch patient details', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully fetched patient details', { patientId });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      throw new Error(`Network Error: Unable to connect to API`);
    }
    throw error;
  }
}

/**
 * FETCH PATIENT PHOTO - Get patient photo as binary image blob
 * Returns blob or null if no photo available
 */
export async function fetchPatientPhoto(
  patientId: number
): Promise<{ imageBlob: Blob; contentType: string } | null> {
  try {
    const url = `${API_BASE_URL}/patients/image/${patientId}`;
    logger.debug('Fetching patient photo', { patientId });

    const response = await fetch(url, {
      method: 'GET',
    });

    // Handle "no photo" responses gracefully
    if (!response.ok) {
      if (response.status === 404 || response.status === 204 || response.status === 400) {
        logger.debug('Patient photo not available', { patientId, status: response.status });
        return null;
      }

      const errorText = await response.text();
      logger.warn('Failed to fetch patient photo', { patientId, status: response.status });
      return null;
    }

    // Response should be JSON with base64 image data
    const responseData = await response.json();

    // Extract base64 data from response
    let base64Data = '';
    let contentType = 'image/jpeg';

    if (responseData.data && typeof responseData.data === 'string') {
      base64Data = responseData.data;
      contentType = responseData.contentType || 'image/jpeg';
    } else if (typeof responseData === 'string') {
      base64Data = responseData;
    } else {
      logger.warn('No image data in photo response', { patientId });
      return null;
    }

    // Convert base64 to blob
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const imageBlob = new Blob([byteArray], { type: contentType });

      if (imageBlob.size === 0) {
        logger.warn('Received empty image blob', { patientId });
        return null;
      }

      logger.debug('Successfully fetched patient photo', {
        patientId,
        contentType,
        size: imageBlob.size,
      });

      return { imageBlob, contentType };
    } catch (conversionError) {
      logger.error('Failed to convert base64 to blob', conversionError);
      return null;
    }
  } catch (error) {
    logger.error('Error fetching patient photo', error);
    return null;
  }
}

/**
 * CREATE PATIENT - Create new patient with optional photo
 * 
 * The API expects:
 * - patientRequestDTO: JSON object (sent as form field, not file)
 * - photoUrl: file (optional)
 */
export async function createPatient(
  input: CreatePatientInput & { photoFile?: File }
): Promise<ApiResponse<Patient>> {
  try {
    const validationErrors = validatePatientData(input as CreatePatientInput);
    if (validationErrors.length > 0) {
      logger.warn('Validation errors', validationErrors);
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const url = `${API_BASE_URL}/patients`;
    logger.debug('Creating patient', {
      firstName: input.firstName,
      lastName: input.lastName,
    });

    // Separate photo file from patient data
    const { photoFile, ...patientDTO } = input;

    // Create FormData for multipart request
    const formData = new FormData();

    // Add patient DTO as JSON blob
    const jsonBlob = new Blob([JSON.stringify(patientDTO)], {
      type: 'application/json',
    });
    formData.append('patientRequestDTO', jsonBlob);

    // Add photo file if provided
    if (photoFile) {
      formData.append('photoUrl', photoFile, photoFile.name);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // DO NOT set Content-Type header - browser will set it with boundary
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to create patient', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully created patient', { id: responseData.data?.id });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      throw new Error(`Network Error: Unable to connect to API`);
    }
    throw error;
  }
}

/**
 * UPDATE PATIENT - Update existing patient
 * 
 * The API expects:
 * - patientUpdateDTO: JSON object (sent as form field, not file)
 * - photoUrl: file (optional)
 */
export async function updatePatient(
  patientId: number,
  input: CreatePatientInput & { photoFile?: File }
): Promise<ApiResponse<Patient>> {
  try {
    const url = `${API_BASE_URL}/patients/${patientId}`;
    logger.debug('Updating patient', { patientId });

    // Separate photo file from patient data
    const { photoFile, ...patientDTO } = input;

    // Create FormData for multipart request
    const formData = new FormData();

    // Add patient DTO as JSON blob
    const jsonBlob = new Blob([JSON.stringify(patientDTO)], {
      type: 'application/json',
    });
    formData.append('patientUpdateDTO', jsonBlob);

    // Add photo file if provided
    if (photoFile) {
      formData.append('photoUrl', photoFile, photoFile.name);
    }

    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
      // DO NOT set Content-Type header - browser will set it with boundary
    });

    const responseText = await response.text();

    if (!response.ok) {
      const error = ApiErrorHandler.handle(response, responseText);
      logger.error('Failed to update patient', error);
      throw new Error(error.message);
    }

    const responseData = JSON.parse(responseText);
    logger.debug('Successfully updated patient', { patientId });

    return responseData;
  } catch (error) {
    if (ApiErrorHandler.isNetworkError(error)) {
      throw new Error(`Network Error: Unable to connect to API`);
    }
    throw error;
  }
}

/**
 * DELETE PATIENT - Delete a patient record
 */
export async function deletePatient(patientId: number): Promise<ApiResponse<void>> {
  try {
    const url = `${API_BASE_URL}/patients/${patientId}`;
    logger.debug('Deleting patient', { patientId });

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
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
      throw new Error(`Network Error: Unable to connect to API`);
    }
    throw error;
  }
}

// ─── Validation Helper ────────────────────────────────────────────────────

export function validatePatientData(data: Partial<CreatePatientInput>): string[] {
  const errors: string[] = [];

  if (!data.firstName?.trim()) {
    errors.push('First name is required');
  } else if (data.firstName.length > 100) {
    errors.push('First name must be 100 characters or less');
  }

  if (!data.lastName?.trim()) {
    errors.push('Last name is required');
  } else if (data.lastName.length > 100) {
    errors.push('Last name must be 100 characters or less');
  }

  if (!data.dateOfBirth) {
    errors.push('Date of birth is required');
  }

  if (!data.gender) {
    errors.push('Gender is required');
  }

  if (!data.bloodGroup) {
    errors.push('Blood group is required');
  }

  if (!data.mobilePrimary?.trim()) {
    errors.push('Primary mobile number is required');
  } else if (!/^\d{10}$/.test(data.mobilePrimary.replace(/\D/g, ''))) {
    errors.push('Primary mobile number must be 10 digits');
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  if (!data.clinicId) {
    errors.push('Clinic ID is required');
  }

  if (typeof data.isActive !== 'boolean') {
    errors.push('Active status is required');
  }

  if (!data.patientCategory?.trim()) {
    errors.push('Patient category is required');
  }

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