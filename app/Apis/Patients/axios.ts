import axios from 'axios';
import { getPatientServiceBaseUrl } from './patientServiceBaseUrl';

/**
 * Axios client for the patient microservice (`NEXT_PUBLIC_API_URL1` + `/api/v1`).
 * Bearer token from `localStorage` is attached when present.
 */
export const patientServiceAxios = axios.create({
  baseURL: getPatientServiceBaseUrl(),
  headers: {
    Accept: 'application/json',
  },
});

patientServiceAxios.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

patientServiceAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Request failed';
    return Promise.reject(error instanceof Error ? error : new Error(message));
  }
);
