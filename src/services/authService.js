import api from '../lib/axios';

/**
 * Authenticate user with backend
 */
export const authenticateUser = async (uid, email) => {
  const response = await api.post('/users/auth', { uid, email });
  return response.data;
};

/**
 * Logout user - clears session cookie
 */
export const logoutUser = async () => {
  const response = await api.post('/users/logout');
  return response.data;
};

/**
 * Get team registration data
 */
export const getTeamRegistration = async () => {
  const response = await api.get('/users/about');
  return response.data;
};

