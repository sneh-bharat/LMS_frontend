import axios from 'axios';

const baseURL = `${(process.env.NEXT_PUBLIC_API_Booking || '').replace(/\/+$/, '')}/api/v1`;

const testRequestClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

testRequestClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

testRequestClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/login';
    }

    const message =
      error.response?.data?.message || error.message || 'Request failed';
    return Promise.reject(new Error(message));
  }
);

export default testRequestClient;
