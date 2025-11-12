// lib/axios.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If a request explicitly opted out of redirect behavior by setting `skipAuthRedirect`,
    // don't redirect. (We will not set this flag except in special cases.)
    if (error.config && error.config.skipAuthRedirect) {
      return Promise.reject(error);
    }

    // Only redirect on 401 if we are not already on auth route.
    if (
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/'
    ) {
      // Optionally show a toast here, but avoid infinite redirect loops
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;