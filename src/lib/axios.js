import axios from 'axios';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if:
    // 1. Not already on login page
    // 2. Not during initial auth (AuthContext handles this)
    // 3. The error is not from the auth endpoint itself
    const isAuthEndpoint = error.config?.url?.includes('/users/auth');
    const isOnLoginPage = window.location.pathname === '/';
    
    if (error.response?.status === 401 && !isOnLoginPage && !isAuthEndpoint) {
      // Only redirect if we're on a protected route and not during auth flow
      console.log('[AXIOS] Redirecting to login due to 401');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

