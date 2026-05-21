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

import axios from 'axios';
import { getPatientServiceBaseUrl } from './patientServiceBaseUrl';
import { patientServiceAxios } from './axios';

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

/** Matches backend allergy severity (see patient update DTO / curl). */
export type AllergySeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface PatientAllergy {
  id?: number;
  allergyName: string;
  severity: AllergySeverityLevel;
  /** Staff id (number) or free text (e.g. doctor name) per API. */
  notedBy?: number | string;
  remarks?: string;
}

/** Map API or legacy UI values to the enum sent on create/update. */
export function normalizeAllergySeverity(raw: string | undefined): AllergySeverityLevel {
  const s = (raw || '').trim().toUpperCase();
  if (s === 'LOW' || s === 'MILD') return 'LOW';
  if (s === 'HIGH' || s === 'SEVERE') return 'HIGH';
  if (s === 'MEDIUM' || s === 'MODERATE') return 'MEDIUM';
  return 'MEDIUM';
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
  patientCategory: 'REGULAR' | 'VIP' | 'CORPORATE' | 'TPA' | 'CGHS' | 'ECHS' | 'ESI' | 'BPL' | 'STAFF' | 'GENERAL';
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
  patientCategory: 'REGULAR' | 'VIP' | 'CORPORATE' | 'TPA' | 'CGHS' | 'ECHS' | 'ESI' | 'BPL' | 'STAFF' | 'GENERAL';
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

// ─── Axios patient microservice (same base URL + Bearer as other patient routes) ─

class AxiosPatientErrorHandler {
  static handle(status: number, responseText: string): { message: string } {
    try {
      const data = JSON.parse(responseText) as { message?: string; error?: string };
      if (data && typeof data === 'object') {
        return { message: data.message || data.error || `HTTP ${status}` };
      }
    } catch {
      /* ignore */
    }
    return { message: responseText || `HTTP ${status}` };
  }
}

async function getPatientByIdClient(patientId: number): Promise<ApiResponse<Patient>> {
  try {
    const { data } = await patientServiceAxios.get<ApiResponse<Patient>>(`/patients/${patientId}`);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      const body =
        typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data ?? {});
      const { message } = AxiosPatientErrorHandler.handle(e.response.status, body);
      throw new Error(message);
    }
    throw e instanceof Error ? e : new Error('Failed to fetch patient');
  }
}

function isMissingPatientImage(status: number, message: string): boolean {
  const m = message.toLowerCase();
  return (
    status === 404 ||
    m.includes('not found') ||
    m.includes('no image') ||
    m.includes('image not found')
  );
}

async function getPatientImageClient(patientId: number): Promise<ApiResponse<string>> {
  try {
    const { data } = await patientServiceAxios.get<ApiResponse<string>>(`/patients/image/${patientId}`);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      const status = e.response.status;
      const body =
        typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data ?? {});
      const { message } = AxiosPatientErrorHandler.handle(status, body);
      if (isMissingPatientImage(status, message)) {
        return {
          data: '',
          message: message || 'No profile image',
          response: false,
          status: 'OK',
          timestamp: new Date().toISOString(),
        };
      }
      throw new Error(message);
    }
    throw e instanceof Error ? e : new Error('Failed to fetch patient image');
  }
}

/**
 * Build the JSON string for the multipart DTO part. Patient fields stay JSON; when a new
 * photo file is sent, `photoUrl` is omitted from JSON so the image exists only as the binary
 * `photoUrl` form part (Spring-style `@RequestPart`).
 */
function jsonPartForPatientMultipart(
  fields: Record<string, unknown>,
  photoFile: File | undefined
): string {
  const dto = { ...fields };
  if (photoFile) {
    delete dto.photoUrl;
  }
  return JSON.stringify(dto);
}

/**
 * Multipart patient create/update:
 * - **JSON**: `patientRequestDTO` / `patientUpdateDTO` as a part with `Content-Type: application/json` (UTF-8 body).
 * - **Binary**: optional `photoUrl` part = raw file bytes (`File`), not base64 inside JSON.
 */
async function putPatientUpdateClient(
  patientId: number,
  input: CreatePatientInput & { photoFile?: File }
): Promise<ApiResponse<Patient>> {
  const { photoFile, ...rest } = input;
  const json = jsonPartForPatientMultipart({ ...(rest as Record<string, unknown>), id: patientId }, photoFile);

  const formData = new FormData();
  formData.append(
    'patientUpdateDTO',
    new Blob([json], { type: 'application/json' })
  );
  if (photoFile) {
    formData.append('photoUrl', photoFile, photoFile.name);
  }

  try {
    const { data } = await patientServiceAxios.put<ApiResponse<Patient>>(`/patients/${patientId}`, formData);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      const body =
        typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data ?? {});
      const { message } = AxiosPatientErrorHandler.handle(e.response.status, body);
      throw new Error(message);
    }
    throw e instanceof Error ? e : new Error('Failed to update patient');
  }
}

async function postPatientCreateClient(
  input: CreatePatientInput & { photoFile?: File }
): Promise<ApiResponse<Patient>> {
  const { photoFile, ...rest } = input;
  const json = jsonPartForPatientMultipart(rest as Record<string, unknown>, photoFile);

  const formData = new FormData();
  formData.append(
    'patientRequestDTO',
    new Blob([json], { type: 'application/json' })
  );
  if (photoFile) {
    formData.append('photoUrl', photoFile, photoFile.name);
  }

  try {
    const { data } = await patientServiceAxios.post<ApiResponse<Patient>>('/patients', formData);
    return data;
  } catch (e) {
    if (axios.isAxiosError(e) && e.response) {
      const body =
        typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data ?? {});
      const { message } = AxiosPatientErrorHandler.handle(e.response.status, body);
      throw new Error(message);
    }
    throw e instanceof Error ? e : new Error('Failed to create patient');
  }
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
  return getPatientByIdClient(patientId);
}

function normalizeMobileSearchPayload(raw: unknown): Patient | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    return (raw[0] as Patient) ?? null;
  }
  if (typeof raw === 'object' && raw !== null && 'content' in raw) {
    const content = (raw as PaginatedResponse<Patient>).content;
    return Array.isArray(content) ? content[0] ?? null : null;
  }
  if (typeof raw === 'object' && 'mobilePrimary' in (raw as Patient)) {
    return raw as Patient;
  }
  return null;
}

/**
 * SEARCH PATIENT BY MOBILE - GET /api/v1/patients/search/mobile?mobile=
 */
export async function searchPatientByMobile(
  mobile: string
): Promise<ApiResponse<Patient | null>> {
  const digits = mobile.replace(/\D/g, '');
  if (digits.length !== 10) {
    throw new Error('Enter a valid 10-digit mobile number');
  }

  try {
    const { data } = await patientServiceAxios.get<ApiResponse<unknown>>(
      '/patients/search/mobile',
      { params: { mobile: digits } }
    );
    const patient = normalizeMobileSearchPayload(data?.data);
    return {
      ...data,
      data: patient,
      response: Boolean(data?.response && patient),
    };
  } catch (e) {
    if (axios.isAxiosError(e) && e.response?.status === 404) {
      return {
        data: null,
        message: 'No patient found for this mobile number',
        response: false,
        status: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      };
    }
    if (axios.isAxiosError(e) && e.response?.status === 409) {
      try {
        const listRes = await fetchPatients(0, 20, digits, 'All');
        const matches =
          listRes.data?.content?.filter(
            (p) => p.mobilePrimary?.replace(/\D/g, '') === digits
          ) ?? [];
        if (matches.length === 1) {
          return {
            data: matches[0],
            message: 'Patient found',
            response: true,
            status: '200 OK',
            timestamp: new Date().toISOString(),
          };
        }
        if (matches.length > 1) {
          return {
            data: null,
            message:
              'Multiple patients use this mobile number. Search by patient name or UHID instead.',
            response: false,
            status: '409 CONFLICT',
            timestamp: new Date().toISOString(),
          };
        }
      } catch {
        /* fall through to generic conflict message */
      }
      const body =
        typeof e.response.data === 'string'
          ? e.response.data
          : JSON.stringify(e.response.data ?? {});
      const { message } = AxiosPatientErrorHandler.handle(409, body);
      throw new Error(
        message && message !== 'Conflict'
          ? message
          : 'Multiple patients may share this mobile number. Search by name or UHID.'
      );
    }
    if (axios.isAxiosError(e) && e.response) {
      const body =
        typeof e.response.data === 'string' ? e.response.data : JSON.stringify(e.response.data ?? {});
      const { message } = AxiosPatientErrorHandler.handle(e.response.status, body);
      throw new Error(message);
    }
    throw e instanceof Error ? e : new Error('Failed to search patient by mobile');
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

    logger.debug('Creating patient', {
      patientCode: input.patientCode,
      patientName: `${input.firstName} ${input.lastName}`,
    });

    const responseData = await postPatientCreateClient(input);
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
    return await putPatientUpdateClient(patientId, input);
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
      logger.error(
        `Failed to delete patient: ${error.message} (HTTP ${response.status}) ${url}`
      );
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
  return getPatientImageClient(patientId);
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