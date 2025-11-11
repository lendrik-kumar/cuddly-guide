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
    // Redirect to login on 401 (Unauthorized)
    if (error.response?.status === 401 && window.location.pathname !== '/') {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

