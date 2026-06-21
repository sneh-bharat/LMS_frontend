import axios from 'axios';

/**
 * Blood collector API client — `NEXT_PUBLIC_API_Booking`.
 * Bearer token from localStorage when present.
 */
const slaMonitoringAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_Booking,
  headers: {
    'Content-Type': 'application/json',
  },
});

slaMonitoringAxios.interceptors.request.use(
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

slaMonitoringAxios.interceptors.response.use(
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
  }
);

export default slaMonitoringAxios;
