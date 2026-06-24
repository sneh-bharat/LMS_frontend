import axios from 'axios';
import { getBookingServiceBaseUrl } from '@/app/Apis/booking/bookingServiceBaseUrl';

/**
 * Report / booking API client — `NEXT_PUBLIC_API_Booking` + `/api/v1`.
 * Bearer token from localStorage when present.
 */
const reportBookingAxios = axios.create({
  baseURL: getBookingServiceBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

reportBookingAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

reportBookingAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  },
);

function getTestCatalogBaseUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_API_Test || '').trim().replace(/\/+$/, '');
  if (/\/api\/v\d+$/i.test(raw)) return raw;
  return `${raw}/api/v1`;
}

/**
 * Test catalog client — parameters with reference for result entry.
 */
export const reportLabAxios = axios.create({
  baseURL: getTestCatalogBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

reportLabAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

reportLabAxios.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject({ ...error, message });
  },
);

export default reportBookingAxios;
