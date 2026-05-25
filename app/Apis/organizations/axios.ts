import axios, { AxiosHeaders } from 'axios';
import { getOrganizationServiceBaseUrl } from './organizationServiceBaseUrl';

export const ORGANIZATION_AUTH_STORAGE_KEY = 'token' as const;

export function readAuthTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ORGANIZATION_AUTH_STORAGE_KEY);
}

/**
 * Organization API client — Bearer token from `localStorage.token`.
 */
const organizationClient = axios.create({
  baseURL: getOrganizationServiceBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

organizationClient.interceptors.request.use((config) => {
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
  }

  if (axiosError.response?.status) {
    return `Request failed with status code ${axiosError.response.status}`;
  }

  return axiosError.message || 'Request failed';
}

organizationClient.interceptors.response.use(
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

export default organizationClient;
