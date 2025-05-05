import axios from 'axios';
import { USER_API_END_POINT, JOB_API_END_POINT, COMPANY_API_END_POINT, APPLICATION_API_END_POINT } from './constant';
import { extractTokenFromStorage, extractTokenFromCookies } from './tokenUtils';

// Enhanced function to get token from multiple sources
const getTokenFromMultipleSources = () => {
  // First try direct localStorage item (most reliable)
  try {
    const directToken = localStorage.getItem('authToken');
    if (directToken) {
      console.log("Using token from direct localStorage item for API request");
      return directToken;
    }
  } catch (error) {
    console.error("Error accessing direct localStorage token:", error);
  }

  // Then try Redux persist storage
  const storageToken = extractTokenFromStorage();
  if (storageToken) {
    console.log("Using token from Redux storage for API request");
    return storageToken;
  }

  // Then try cookies
  const cookieToken = extractTokenFromCookies();
  if (cookieToken) {
    console.log("Using token from cookies for API request");
    return cookieToken;
  }

  // If we have a user in localStorage but no token, create a manual token
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (persistRoot) {
      const parsedRoot = JSON.parse(persistRoot);
      const auth = JSON.parse(parsedRoot.auth || '{}');
      if (auth.user) {
        const user = JSON.parse(auth.user);
        if (user && user._id) {
          const manualToken = `manual_${user._id}_${Date.now()}`;
          console.log("Created manual token for API request:", manualToken);
          return manualToken;
        }
      }
    }
  } catch (error) {
    console.error('Error creating manual token:', error);
  }

  console.log("No token found in any source for API request");
  return null;
};

// Create a custom axios instance with credentials enabled
const api = axios.create({
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include Authorization header if available
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);

    const token = getTokenFromMultipleSources();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Added Authorization header with token: ${token.substring(0, 10)}...`);

      // As a fallback for some environments, also add token as a query parameter
      const url = new URL(config.url, window.location.origin);
      url.searchParams.append('token', token);
      config.url = url.toString();
      console.log(`Also added token as query parameter to URL: ${config.url}`);
    } else {
      console.log("No token available for request");
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

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
      console.log("Fetching companies...");
      const response = await api.get(`${COMPANY_API_END_POINT}/get`);
      console.log("Companies fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Get companies error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for fetching companies...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.get(`${COMPANY_API_END_POINT}/get?token=${token}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Companies fetched successfully with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

      throw error;
    }
  },

  getCompanyById: async (companyId) => {
    try {
      console.log(`Fetching company with ID: ${companyId}...`);
      const response = await api.get(`${COMPANY_API_END_POINT}/get/${companyId}`);
      console.log("Company fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Get company by ID error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for fetching company...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.get(`${COMPANY_API_END_POINT}/get/${companyId}?token=${token}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Company fetched successfully with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

      throw error;
    }
  },

  registerCompany: async (companyData) => {
    try {
      console.log("Registering company with data:", companyData);
      const response = await api.post(`${COMPANY_API_END_POINT}/register`, companyData);
      console.log("Company registered successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Register company error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for registering company...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.post(
              `${COMPANY_API_END_POINT}/register?token=${token}`,
              companyData,
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              }
            );
            console.log("Company registered successfully with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

      throw error;
    }
  },

  updateCompany: async (companyId, formData) => {
    try {
      console.log(`Updating company with ID: ${companyId}...`);
      const response = await api.put(`${COMPANY_API_END_POINT}/update/${companyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log("Company updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Update company error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for updating company...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            // Create a new FormData with the token
            const formDataWithToken = new FormData();
            for (const [key, value] of formData.entries()) {
              formDataWithToken.append(key, value);
            }

            const fallbackResponse = await axios.put(
              `${COMPANY_API_END_POINT}/update/${companyId}?token=${token}`,
              formDataWithToken,
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'multipart/form-data',
                  Authorization: `Bearer ${token}`
                }
              }
            );
            console.log("Company updated successfully with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

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
