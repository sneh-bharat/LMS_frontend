import axios from 'axios';

/**
 * Department API Client - Axios Instance
 * Centralized HTTP client with authentication interceptors for department APIs
 */
const departmentClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_Test,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach token from localStorage
departmentClient.interceptors.request.use(
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
departmentClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // Handle 401 Unauthorized globally (redirect to login)
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

export default departmentClient;
