import axios from 'axios';
import { USER_API_END_POINT } from './constant';

// Function to check if user is logged in
export const isUserLoggedIn = () => {
  const userString = localStorage.getItem('persist:root');
  if (!userString) return false;
  
  try {
    const parsed = JSON.parse(userString);
    const authState = JSON.parse(parsed.auth || '{}');
    return !!authState.user;
  } catch (error) {
    console.error('Error checking login status:', error);
    return false;
  }
};

// Function to get the current user
export const getCurrentUser = () => {
  const userString = localStorage.getItem('persist:root');
  if (!userString) return null;
  
  try {
    const parsed = JSON.parse(userString);
    const authState = JSON.parse(parsed.auth || '{}');
    return authState.user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Function to handle login
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${USER_API_END_POINT}/login`, credentials, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to handle logout
export const logoutUser = async () => {
  try {
    const response = await axios.get(`${USER_API_END_POINT}/logout`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to make authenticated API requests
export const authenticatedRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
      withCredentials: true,
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    // If we get a 401 error, it means the user is not authenticated
    if (error.response && error.response.status === 401) {
      console.log('Authentication error:', error.response.data);
      // You could redirect to login page here or handle it in the component
    }
    throw error;
  }
};

// Function to make public API requests (no authentication required)
export const publicRequest = async (method, url, data = null) => {
  try {
    const config = {
      method,
      url,
      headers: {
        'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw error;
  }
};
