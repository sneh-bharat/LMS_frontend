import axios from 'axios';
import { getAuthServiceBaseUrl } from './authServiceBaseUrl';

/**
 * Auth API client (`NEXT_PUBLIC_API_AUTH` / lims-auth).
 */
const apiClient = axios.create({
    baseURL: getAuthServiceBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});


// Request Interceptor: Attach tokens if available
apiClient.interceptors.request.use(
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

// Response Interceptor: Global error handling
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle 401 Unauthorized globally (e.g., redirect to login)
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.clear();
                window.location.href = '/login';
            }
        }

        // Extract meaningful message from backend response
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        return Promise.reject({ ...error, message });
    }
);

export default apiClient;
