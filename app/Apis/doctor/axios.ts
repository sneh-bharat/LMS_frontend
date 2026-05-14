import axios, { AxiosHeaders } from 'axios';
import { getPatientServiceBaseUrl } from '@/app/Apis/Patients/patientServiceBaseUrl';

/** Same key used after staff login (`Login.tsx` / `apiClient`). */
export const REFERRING_DOCTOR_AUTH_STORAGE_KEY = 'token' as const;

/**
 * Reads the JWT/access token from `localStorage` (browser only).
 */
export function readAuthTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFERRING_DOCTOR_AUTH_STORAGE_KEY);
}

/**
 * Referring-doctor routes live on the same patient service base (`NEXT_PUBLIC_API_URL1` + `/api/v1`).
 * Every request sends `Authorization: Bearer <token>` when a token is stored.
 * Response interceptor returns `response.data` (standard API envelope).
 */
export const referringDoctorAxios = axios.create({
  baseURL: getPatientServiceBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

referringDoctorAxios.interceptors.request.use((config) => {
  const token = readAuthTokenFromLocalStorage();
  if (!token) return config;

  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;
  return config;
});

referringDoctorAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed';
    return Promise.reject(error instanceof Error ? error : new Error(String(message)));
  }
);

export default referringDoctorAxios;
