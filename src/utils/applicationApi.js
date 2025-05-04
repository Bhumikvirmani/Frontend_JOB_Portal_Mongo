import { APPLICATION_API_END_POINT } from './constant';
import { addAuthHeader, getToken } from './tokenUtils';
import axios from 'axios';

// Apply for a job
export const applyForJob = async (jobId) => {
  try {
    // First, try to get a fresh token
    console.log("Fetching fresh token for job application");
    const token = await getToken(true); // Force refresh
    console.log("Fresh token available for job application:", !!token);

    if (!token) {
      throw new Error("Could not obtain a valid authentication token");
    }

    // Try with direct axios call with the fresh token
    const config = await addAuthHeader({
      method: 'get',
      url: `${APPLICATION_API_END_POINT}/apply/${jobId}`,
      withCredentials: true
    });

    try {
      console.log("Making request with fresh token");
      const response = await axios(config);
      return response.data;
    } catch (headerError) {
      console.log('Request with fresh token failed, trying with token in query parameter');

      // As a last resort, try with token in query parameter
      console.log(`Making request with token in query parameter: ${token.substring(0, 10)}...`);
      const response = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}?token=${token}`, {
        withCredentials: true
      });
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
    // First, try to get a fresh token
    console.log("Fetching fresh token for getting applied jobs");
    const token = await getToken(true); // Force refresh
    console.log("Fresh token available for getting applied jobs:", !!token);

    if (!token) {
      throw new Error("Could not obtain a valid authentication token");
    }

    // Try with direct axios call with the fresh token
    const config = await addAuthHeader({
      method: 'get',
      url: `${APPLICATION_API_END_POINT}/get`,
      withCredentials: true
    });

    try {
      console.log("Making request with fresh token");
      const response = await axios(config);
      return response.data;
    } catch (headerError) {
      console.log('Request with fresh token failed, trying with token in query parameter');

      // As a last resort, try with token in query parameter
      console.log(`Making request with token in query parameter: ${token.substring(0, 10)}...`);
      const response = await axios.get(`${APPLICATION_API_END_POINT}/get?token=${token}`, {
        withCredentials: true
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching applied jobs:', error);
    throw error;
  }
};

// Get all applicants for a specific job
export const getJobApplicants = async (jobId) => {
  try {
    // First, try to get a fresh token
    console.log("Fetching fresh token for getting job applicants");
    const token = await getToken(true); // Force refresh
    console.log("Fresh token available for getting job applicants:", !!token);

    if (!token) {
      throw new Error("Could not obtain a valid authentication token");
    }

    // Try with direct axios call with the fresh token
    const config = await addAuthHeader({
      method: 'get',
      url: `${APPLICATION_API_END_POINT}/${jobId}/applicants`,
      withCredentials: true
    });

    try {
      console.log("Making request with fresh token");
      const response = await axios(config);
      return response.data;
    } catch (headerError) {
      console.log('Request with fresh token failed, trying with token in query parameter');

      // As a last resort, try with token in query parameter
      console.log(`Making request with token in query parameter: ${token.substring(0, 10)}...`);
      const response = await axios.get(`${APPLICATION_API_END_POINT}/${jobId}/applicants?token=${token}`, {
        withCredentials: true
      });
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching job applicants:', error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, statusData) => {
  try {
    // First, try to get a fresh token
    console.log("Fetching fresh token for updating application status");
    const token = await getToken(true); // Force refresh
    console.log("Fresh token available for updating application status:", !!token);

    if (!token) {
      throw new Error("Could not obtain a valid authentication token");
    }

    // Try with direct axios call with the fresh token
    const config = await addAuthHeader({
      method: 'post',
      url: `${APPLICATION_API_END_POINT}/status/${applicationId}/update`,
      data: statusData,
      withCredentials: true
    });

    try {
      console.log("Making request with fresh token");
      const response = await axios(config);
      return response.data;
    } catch (headerError) {
      console.log('Request with fresh token failed, trying with token in query parameter');

      // As a last resort, try with token in query parameter
      console.log(`Making request with token in query parameter: ${token.substring(0, 10)}...`);
      const response = await axios.post(
        `${APPLICATION_API_END_POINT}/status/${applicationId}/update?token=${token}`,
        statusData,
        { withCredentials: true }
      );
      return response.data;
    }
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
};
