import axios, { AxiosHeaders } from 'axios';
import { getBookingServiceBaseUrl } from './bookingServiceBaseUrl';

export const BOOKING_AUTH_STORAGE_KEY = 'token' as const;

export function readAuthTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(BOOKING_AUTH_STORAGE_KEY);
}

/**
 * Test-order routes on the booking service (`NEXT_PUBLIC_API_Booking` + `/api/v1`).
 * Sends `Authorization: Bearer <token>` from localStorage when present.
 */
export const bookingAxios = axios.create({
  baseURL: getBookingServiceBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

bookingAxios.interceptors.request.use((config) => {
  const token = readAuthTokenFromLocalStorage();
  if (!token) return config;

  const headers = AxiosHeaders.from(config.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  config.headers = headers;
  return config;
});

function extractApiErrorMessage(error: unknown): string {
  if (!error || typeof error !== 'object') {
    return 'Request failed';
  }

  const axiosError = error as {
    response?: { data?: unknown; status?: number };
    message?: string;
  };
  const data = axiosError.response?.data;

  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const body = data as Record<string, unknown>;
    if (typeof body.message === 'string' && body.message.trim()) {
      return body.message;
    }
    if (typeof body.error === 'string' && body.error.trim()) {
      return body.error;
    }
    if (typeof body.detail === 'string' && body.detail.trim()) {
      return body.detail;
    }
    if (Array.isArray(body.errors)) {
      const joined = body.errors
        .map((e) => (typeof e === 'string' ? e : JSON.stringify(e)))
        .filter(Boolean)
        .join(', ');
      if (joined) return joined;
    }
    if (body.data && typeof body.data === 'object') {
      const nested = body.data as Record<string, unknown>;
      if (typeof nested.message === 'string' && nested.message.trim()) {
        return nested.message;
      }
    }
  }

  if (axiosError.response?.status === 409) {
    return (
      (typeof data === 'object' && data && (data as Record<string, unknown>).message
        ? String((data as Record<string, unknown>).message)
        : null) ||
      'Conflict: this action could not be completed (duplicate or conflicting record).'
    );
  }

  if (axiosError.response?.status) {
    return `Request failed with status code ${axiosError.response.status}`;
  }

  return axiosError.message || 'Request failed';
}

bookingAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(extractApiErrorMessage(error)));
  }
);

export default bookingAxios;
