import { USER_API_END_POINT } from './constant';
import { addAuthHeader, getToken } from './tokenUtils';
import axios from 'axios';

// Update user profile
export const updateUserProfile = async (formData) => {
  try {
    // First, try to get a fresh token
    console.log("Fetching fresh token for profile update");
    const token = await getToken(true); // Force refresh
    console.log("Fresh token available for profile update:", !!token);
    
    if (!token) {
      throw new Error("Could not obtain a valid authentication token");
    }
    
    // Try with direct axios call with the fresh token
    const config = await addAuthHeader({
      method: 'post',
      url: `${USER_API_END_POINT}/profile/update`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
    
    try {
      console.log("Making profile update request with fresh token");
      const response = await axios(config);
      return response.data;
    } catch (headerError) {
      console.log('Profile update with fresh token failed, trying with token in query parameter');
      
      // As a last resort, try with token in query parameter
      console.log(`Making profile update request with token in query parameter: ${token.substring(0, 10)}...`);
      
      // Create a new FormData object with the token
      const formDataWithToken = new FormData();
      
      // Copy all entries from the original formData
      for (const [key, value] of Object.entries(formData)) {
        formDataWithToken.append(key, value);
      }
      
      const response = await axios.post(
        `${USER_API_END_POINT}/profile/update?token=${token}`, 
        formDataWithToken,
        { 
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      return response.data;
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Login user
export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${USER_API_END_POINT}/login`, credentials, {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Register user
export const registerUser = async (formData) => {
  try {
    const response = await axios.post(`${USER_API_END_POINT}/register`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Logout user
export const logoutUser = async () => {
  try {
    const response = await axios.get(`${USER_API_END_POINT}/logout`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    console.error('Error logging out:', error);
    throw error;
  }
};
