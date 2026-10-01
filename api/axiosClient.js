import axios from 'axios';

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:5000';

const apiClient = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request Interceptor
 * - Automatically injects Bearer token from localStorage (if available)
 */
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * - Standardizes response handling
 * - Handles token expiry / unauthorized (401)
 * - Formats consistent error messages
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle 401 Unauthorized (expired or invalid token)
      if (status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        // Optional: Redirect to signin if not already there
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/signin') && !currentPath.includes('/signup')) {
          window.location.href = `/signin?redirect=${encodeURIComponent(currentPath)}`;
        }
      }

      // Extract user-friendly error message if available
      const message =
        data?.message ||
        data?.error ||
        (status === 500
          ? 'Internal server error. Please try again later.'
          : 'Something went wrong. Please try again.');

      return Promise.reject(new Error(message));
    } else if (error.request) {
      // Network error or server not reachable
      return Promise.reject(new Error('Network error. Please check your internet connection or server status.'));
    }

    return Promise.reject(error);
  }
);

export default apiClient;
