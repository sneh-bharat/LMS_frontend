import axios from 'axios';

/**
 * Referring doctor API client — `NEXT_PUBLIC_API_URL1` (lims-patient).
 * Bearer token from localStorage when present.
 */
const referrerAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
});

referrerAxios.interceptors.request.use(
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

referrerAxios.interceptors.response.use(
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

export default referrerAxios;
