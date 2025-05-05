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

    // Ensure we have the latest token for each request
    const token = getTokenFromMultipleSources();

    if (token) {
      // Always add the Authorization header for all requests
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Added Authorization header with token: ${token.substring(0, 10)}...`);

      // For GET requests, also add token as query parameter as a fallback
      if (config.method === 'get' || !config.method) {
        try {
          // Check if the URL is absolute or relative
          const isAbsoluteUrl = config.url.startsWith('http://') || config.url.startsWith('https://');

          if (isAbsoluteUrl) {
            // For absolute URLs, use the URL constructor
            const url = new URL(config.url);
            if (!url.searchParams.has('token')) {
              url.searchParams.append('token', token);
              config.url = url.toString();
              console.log(`Added token as query parameter to GET URL: ${config.url}`);
            }
          }
        } catch (urlError) {
          console.error("Error adding token to URL:", urlError);
        }
      } else {
        console.log(`Not adding token as query parameter for ${config.method?.toUpperCase()} request to avoid issues`);
      }
    } else {
      console.warn("⚠️ No authentication token available for request. This may cause authorization failures.");
    }

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // Successful response
    return response;
  },
  (error) => {
    // Handle error responses
    if (error.response) {
      const { status, data } = error.response;

      console.error(`API Error ${status}:`, data);

      // Handle specific status codes
      if (status === 401) {
        console.error("Authentication error. Token may be invalid or expired.");
      } else if (status === 403) {
        console.error("Authorization error. User may not have permission for this action.");
      } else if (status === 404) {
        console.error("Resource not found. The requested endpoint may not exist.");
      } else if (status === 500) {
        console.error("Server error. Please try again later.");
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error("No response received from server:", error.request);
    } else {
      // Error in setting up the request
      console.error("Error setting up request:", error.message);
    }

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
      console.log("Fetching admin jobs...");
      const response = await api.get(`${JOB_API_END_POINT}/getadminjobs`);
      console.log("Admin jobs fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Get admin jobs error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for fetching admin jobs...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.get(`${JOB_API_END_POINT}/getadminjobs?token=${token}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Admin jobs fetched successfully with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

      throw error;
    }
  },

  postJob: async (jobData) => {
    try {
      console.log("Posting job with data:", jobData);

      // Ensure we have a valid companyId
      if (!jobData.companyId) {
        console.error("Missing companyId in job data");
        throw new Error("Company ID is required");
      }

      // Format the data to match backend expectations
      // The backend controller expects 'companyId' in the request
      const formattedJobData = {
        title: jobData.title || "",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        salary: jobData.salary || "0",
        location: jobData.location || "",
        jobType: jobData.jobType || "",
        experience: jobData.experience || "0",
        position: jobData.position || "0",
        companyId: jobData.companyId || ""
      };

      // Log the request details
      console.log(`Making POST request to ${JOB_API_END_POINT}/post with data:`, JSON.stringify(formattedJobData));

      // Try with a direct axios call first with explicit content type and token
      const token = getTokenFromMultipleSources();
      if (!token) {
        console.error("No authentication token available");
        throw new Error("Authentication required. Please log in again.");
      }

      console.log("Using direct axios POST call with token");
      try {
        const response = await axios({
          method: 'post',
          url: `${JOB_API_END_POINT}/post`,
          data: formattedJobData,
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log("Job posted successfully:", response.data);
        return response.data;
      } catch (directError) {
        console.error('Direct axios call failed:', directError);

        // If direct call fails, try with the api instance
        console.log("Trying with api instance as fallback");
        const fallbackResponse = await api.post(`${JOB_API_END_POINT}/post`, formattedJobData);
        console.log("Job posted successfully with api instance:", fallbackResponse.data);
        return fallbackResponse.data;
      }
    } catch (error) {
      console.error('Post job error:', error);

      // Provide more detailed error information
      const errorMessage = error.response?.data?.message || error.message || 'Failed to post job';
      const errorDetails = {
        message: errorMessage,
        status: error.response?.status,
        data: error.response?.data
      };

      console.error("Error details:", errorDetails);

      // Check if it's a network error
      if (error.message && error.message.includes('Network Error')) {
        console.error("Network error detected. Server might be down or CORS issue.");
      }

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
      console.log(`Applying for job with ID: ${jobId}...`);
      const response = await api.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`);
      console.log("Job application successful:", response.data);
      return response.data;
    } catch (error) {
      console.error('Apply for job error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for applying to job...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}?token=${token}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Job application successful with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

      throw error;
    }
  },

  getAppliedJobs: async () => {
    try {
      console.log("Fetching applied jobs...");
      const response = await api.get(`${APPLICATION_API_END_POINT}/get`);
      console.log("Applied jobs fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Get applied jobs error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for fetching applied jobs...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.get(`${APPLICATION_API_END_POINT}/get?token=${token}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Applied jobs fetched successfully with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

      throw error;
    }
  },

  getJobApplicants: async (jobId) => {
    try {
      console.log(`Fetching applicants for job with ID: ${jobId}...`);
      const response = await api.get(`${APPLICATION_API_END_POINT}/${jobId}/applicants`);
      console.log("Job applicants fetched successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Get job applicants error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for fetching job applicants...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.get(`${APPLICATION_API_END_POINT}/${jobId}/applicants?token=${token}`, {
              withCredentials: true,
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Job applicants fetched successfully with fallback method:", fallbackResponse.data);
            return fallbackResponse.data;
          }
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
        }
      }

      throw error;
    }
  },

  updateApplicationStatus: async (applicationId, statusData) => {
    try {
      console.log(`Updating application status for ID: ${applicationId}...`);
      const response = await api.post(`${APPLICATION_API_END_POINT}/status/${applicationId}/update`, statusData);
      console.log("Application status updated successfully:", response.data);
      return response.data;
    } catch (error) {
      console.error('Update application status error:', error);

      // If we get a 401, try to make the request with a direct axios call and token in query param
      if (error.response && error.response.status === 401) {
        console.log("Trying alternative method for updating application status...");
        try {
          const token = getTokenFromMultipleSources();
          if (token) {
            const fallbackResponse = await axios.post(
              `${APPLICATION_API_END_POINT}/status/${applicationId}/update?token=${token}`,
              statusData,
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`
                }
              }
            );
            console.log("Application status updated successfully with fallback method:", fallbackResponse.data);
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
    // First try direct localStorage item
    const directUser = localStorage.getItem('currentUser');
    if (directUser) {
      console.log("Found user in direct localStorage item");
      return directUser;
    }

    // Then try Redux persist storage
    const persistRoot = localStorage.getItem('persist:root');
    if (!persistRoot) {
      console.log("No persist:root found in localStorage");
      return null;
    }

    const parsedRoot = JSON.parse(persistRoot);
    const auth = JSON.parse(parsedRoot.auth || '{}');

    if (!auth.user) {
      console.log("No user found in auth object");
      return null;
    }

    // Store in direct localStorage for future use
    try {
      localStorage.setItem('currentUser', auth.user);
    } catch (storageError) {
      console.error("Failed to store user in localStorage:", storageError);
    }

    return auth.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
