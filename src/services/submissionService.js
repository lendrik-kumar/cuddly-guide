import api from '../lib/axios';

/**
 * Submit team data to Google Sheets
 */
export const submitTeamData = async (submissionData) => {
  const response = await api.post('/users/submit', submissionData);
  return response.data;
};

/**
 * Get existing submission data
 */
export const getSubmission = async () => {
  const response = await api.get('/users/submission');
  return response.data;
};

