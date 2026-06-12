import axios from 'axios';

/**
 * Professional Axios Instance
 * Centralized configuration for API calls with interceptors for auth and errors.
 */
const doctorClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_AUTH,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach tokens if available
doctorClient.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('doctor-token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Global error handling
doctorClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle 401 Unauthorized globally (e.g., redirect to login)
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                ['token','refreshToken','role','tenantId','fullName'].forEach(k => localStorage.removeItem(k));
                window.location.href = '/doctor-login';
            }
        }

        // Extract meaningful message from backend response
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        return Promise.reject({ ...error, message });
    }
);

export default doctorClient;
