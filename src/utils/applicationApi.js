import { APPLICATION_API_END_POINT } from './constant';
import { authenticatedRequest } from './authUtils';
import { addAuthHeader } from './tokenUtils';
import axios from 'axios';

// Apply for a job
export const applyForJob = async (jobId) => {
  try {
    // First try with authenticatedRequest
    try {
      const data = await authenticatedRequest('get', `${APPLICATION_API_END_POINT}/apply/${jobId}`);
      return data;
    } catch (authError) {
      console.log('Trying with direct axios call with auth header');
      // If that fails, try with direct axios call with manually added auth header
      const config = addAuthHeader({
        method: 'get',
        url: `${APPLICATION_API_END_POINT}/apply/${jobId}`,
        withCredentials: true
      });
      const response = await axios(config);
      return response.data;
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
