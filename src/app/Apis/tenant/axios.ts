import axios, { AxiosInstance } from 'axios';

/**
 * Tenant API client — axios instance for `/api/v1/tenant-config` and related tenant routes.
 *
 * - `Authorization: Bearer <token>` from `localStorage.getItem('token')` (staff login).
 * - Response interceptor returns `response.data` (same contract as branch / lab clients).
 *
 * Base URL: `NEXT_PUBLIC_API_URL1` (e.g. lims-patient gateway — same as patient service).
 */
const tenantClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL1 || '',
  headers: {
    'Content-Type': 'application/json',
  },
}) as AxiosInstance;

tenantClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

tenantClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        ['token','refreshToken','role','tenantId','fullName'].forEach(k => localStorage.removeItem(k));
        window.location.href = '/login';
      }
    }
    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  }
);

export default tenantClient;
