import api from '../lib/axios';

/**
 * Authenticate user with backend
 */

export const authenticateUserWithToken = async (idToken) => {
  // Send token in Authorization header — backend should read it from req.headers.authorization
  const response = await api.post(
    '/users/auth',
    {}, // no body required if you use header token, backend can accept either
    {
      headers: {
        Authorization: `${idToken}`,
      },
      withCredentials: true,
    }
  );
  return response.data;
}

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

