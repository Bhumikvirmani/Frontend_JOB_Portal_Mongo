import { APPLICATION_API_END_POINT } from './constant';
import { authenticatedRequest } from './authUtils';
import { addAuthHeader, getToken } from './tokenUtils';
import axios from 'axios';

// Apply for a job
export const applyForJob = async (jobId) => {
  try {
    // Get token from any available source
    const token = getToken();
    console.log("Token available for job application:", !!token);

    // First try with authenticatedRequest
    try {
      const data = await authenticatedRequest('get', `${APPLICATION_API_END_POINT}/apply/${jobId}`);
      return data;
    } catch (authError) {
      console.log('First attempt failed, trying with direct axios call with auth header');

      // If that fails, try with direct axios call with manually added auth header
      const config = addAuthHeader({
        method: 'get',
        url: `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        withCredentials: true
      });

      try {
        const response = await axios(config);
        return response.data;
      } catch (headerError) {
        console.log('Second attempt failed, trying with token in query parameter');

        // As a last resort, try with token in query parameter
        if (token) {
          const response = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}?token=${token}`, {
            withCredentials: true
          });
          return response.data;
        } else {
          throw new Error("No authentication token available");
        }
      }
    }
  } catch (error) {
    console.error('Error applying for job:', error);
    throw error;
  }
};

// Get all applied jobs for the logged-in user
export const getAppliedJobs = async () => {
  try {
    const data = await authenticatedRequest('get', `${APPLICATION_API_END_POINT}/get`);
    return data;
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    throw error;
  }
};

// Get all applicants for a specific job
export const getJobApplicants = async (jobId) => {
  try {
    const data = await authenticatedRequest('get', `${APPLICATION_API_END_POINT}/${jobId}/applicants`);
    return data;
  } catch (error) {
    console.error('Error fetching job applicants:', error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, statusData) => {
  try {
    const data = await authenticatedRequest('post', `${APPLICATION_API_END_POINT}/status/${applicationId}/update`, statusData);
    return data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};
