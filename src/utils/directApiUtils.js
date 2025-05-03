import axios from 'axios';
import { USER_API_END_POINT, JOB_API_END_POINT, COMPANY_API_END_POINT, APPLICATION_API_END_POINT } from './constant';

// Create a custom axios instance with credentials enabled
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// User API functions
export const userApi = {
  login: async (credentials) => {
    try {
      const response = await api.post(`${USER_API_END_POINT}/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (formData) => {
    try {
      const response = await api.post(`${USER_API_END_POINT}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.get(`${USER_API_END_POINT}/logout`);
      return response.data;
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  updateProfile: async (formData) => {
    try {
      const response = await api.post(`${USER_API_END_POINT}/profile/update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

// Job API functions
export const jobApi = {
  getAllJobs: async (keyword = '') => {
    try {
      // Try with authentication first
      try {
        const response = await api.get(`${JOB_API_END_POINT}/get?keyword=${keyword}`);
        return response.data;
      } catch (authError) {
        // If authentication fails, try without authentication
        const response = await axios.get(`${JOB_API_END_POINT}/get?keyword=${keyword}`);
        return response.data;
      }
    } catch (error) {
      console.error('Get all jobs error:', error);
      throw error;
    }
  },
  
  getJobById: async (jobId) => {
    try {
      // Try with authentication first
      try {
        const response = await api.get(`${JOB_API_END_POINT}/get/${jobId}`);
        return response.data;
      } catch (authError) {
        // If authentication fails, try without authentication
        const response = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`);
        return response.data;
      }
    } catch (error) {
      console.error('Get job by ID error:', error);
      throw error;
    }
  },
  
  getAdminJobs: async () => {
    try {
      const response = await api.get(`${JOB_API_END_POINT}/getadminjobs`);
      return response.data;
    } catch (error) {
      console.error('Get admin jobs error:', error);
      throw error;
    }
  },
  
  postJob: async (jobData) => {
    try {
      const response = await api.post(`${JOB_API_END_POINT}/post`, jobData);
      return response.data;
    } catch (error) {
      console.error('Post job error:', error);
      throw error;
    }
  }
};

// Company API functions
export const companyApi = {
  getCompanies: async () => {
    try {
      const response = await api.get(`${COMPANY_API_END_POINT}/get`);
      return response.data;
    } catch (error) {
      console.error('Get companies error:', error);
      throw error;
    }
  },
  
  getCompanyById: async (companyId) => {
    try {
      const response = await api.get(`${COMPANY_API_END_POINT}/get/${companyId}`);
      return response.data;
    } catch (error) {
      console.error('Get company by ID error:', error);
      throw error;
    }
  },
  
  registerCompany: async (companyData) => {
    try {
      const response = await api.post(`${COMPANY_API_END_POINT}/register`, companyData);
      return response.data;
    } catch (error) {
      console.error('Register company error:', error);
      throw error;
    }
  },
  
  updateCompany: async (companyId, formData) => {
    try {
      const response = await api.put(`${COMPANY_API_END_POINT}/update/${companyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Update company error:', error);
      throw error;
    }
  }
};

// Application API functions
export const applicationApi = {
  applyForJob: async (jobId) => {
    try {
      const response = await api.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Apply for job error:', error);
      throw error;
    }
  },
  
  getAppliedJobs: async () => {
    try {
      const response = await api.get(`${APPLICATION_API_END_POINT}/get`);
      return response.data;
    } catch (error) {
      console.error('Get applied jobs error:', error);
      throw error;
    }
  },
  
  getJobApplicants: async (jobId) => {
    try {
      const response = await api.get(`${APPLICATION_API_END_POINT}/${jobId}/applicants`);
      return response.data;
    } catch (error) {
      console.error('Get job applicants error:', error);
      throw error;
    }
  },
  
  updateApplicationStatus: async (applicationId, statusData) => {
    try {
      const response = await api.post(`${APPLICATION_API_END_POINT}/status/${applicationId}/update`, statusData);
      return response.data;
    } catch (error) {
      console.error('Update application status error:', error);
      throw error;
    }
  }
};

// Function to check if user is logged in based on localStorage
export const isUserLoggedIn = () => {
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (!persistRoot) return false;
    
    const parsedRoot = JSON.parse(persistRoot);
    const auth = JSON.parse(parsedRoot.auth || '{}');
    return !!auth.user;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Function to get current user from localStorage
export const getCurrentUser = () => {
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (!persistRoot) return null;
    
    const parsedRoot = JSON.parse(persistRoot);
    const auth = JSON.parse(parsedRoot.auth || '{}');
    return auth.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
