import axios from 'axios';

/**
 * Commission API client — `NEXT_PUBLIC_API_Test`.
 * Bearer token from localStorage when present.
 */
const commissionAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_Test,
  headers: {
    'Content-Type': 'application/json',
  },
});

commissionAxios.interceptors.request.use(
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

commissionAxios.interceptors.response.use(
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

export default commissionAxios;
