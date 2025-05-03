import axios from 'axios';
import { JOB_API_END_POINT } from './constant';
import { authenticatedRequest, publicRequest } from './authUtils';

// Get all jobs (public endpoint)
export const getAllJobs = async (keyword = '') => {
  try {
    // First try with authentication
    try {
      const data = await authenticatedRequest('get', `${JOB_API_END_POINT}/get?keyword=${keyword}`);
      return data;
    } catch (authError) {
      // If authentication fails, try without authentication
      console.log('Trying without authentication');
      const data = await publicRequest('get', `${JOB_API_END_POINT}/get?keyword=${keyword}`);
      return data;
    }
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Get job by ID (works for both authenticated and non-authenticated users)
export const getJobById = async (jobId) => {
  try {
    // First try with authentication
    try {
      const data = await authenticatedRequest('get', `${JOB_API_END_POINT}/get/${jobId}`);
      return data;
    } catch (authError) {
      // If authentication fails, try without authentication
      console.log('Trying without authentication for job details');
      
      // Direct axios call as a fallback
      const response = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`);
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching job details:', error);
    throw error;
  }
};

// Get admin jobs (authenticated endpoint)
export const getAdminJobs = async () => {
  try {
    const data = await authenticatedRequest('get', `${JOB_API_END_POINT}/getadminjobs`);
    return data;
  } catch (error) {
    console.error('Error fetching admin jobs:', error);
    throw error;
  }
};

// Post a new job (authenticated endpoint)
export const postJob = async (jobData) => {
  try {
    const data = await authenticatedRequest('post', `${JOB_API_END_POINT}/post`, jobData);
    return data;
  } catch (error) {
    console.error('Error posting job:', error);
    throw error;
  }
};
