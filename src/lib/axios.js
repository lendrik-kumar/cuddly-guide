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

// Attach token from localStorage for localStorage-based auth flows.
// This allows clients that store JWT in localStorage to authenticate
// requests by sending `Authorization: Bearer <token>` automatically.
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        // Do not overwrite an existing Authorization header
        if (!config.headers.Authorization && !config.headers.authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      // localStorage may not be available in some environments; ignore safely
      console.warn('[AXIOS] Could not read token from localStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

