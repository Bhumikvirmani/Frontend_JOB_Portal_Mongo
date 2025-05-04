import { setToken } from '../redux/authSlice';
import axios from 'axios';
import { USER_API_END_POINT } from './constant';

// Function to extract token from cookies
export const extractTokenFromCookies = () => {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith('token=')) {
      return cookie.substring('token='.length, cookie.length);
    }
  }
  return null;
};

// Function to extract token from Redux store in localStorage
export const extractTokenFromStorage = () => {
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (!persistRoot) return null;

    const parsedRoot = JSON.parse(persistRoot);
    const auth = JSON.parse(parsedRoot.auth || '{}');
    return auth.token || null;
  } catch (error) {
    console.error('Error getting token from storage:', error);
    return null;
  }
};

// Function to get the current user ID from localStorage
export const getCurrentUserId = () => {
  try {
    const persistRoot = localStorage.getItem('persist:root');
    if (!persistRoot) return null;

    const parsedRoot = JSON.parse(persistRoot);
    const auth = JSON.parse(parsedRoot.auth || '{}');
    return auth.user ? JSON.parse(auth.user)._id : null;
  } catch (error) {
    console.error('Error getting user ID from storage:', error);
    return null;
  }
};

// Function to fetch a fresh token from the backend
export const fetchFreshToken = async () => {
  const userId = getCurrentUserId();
  if (!userId) {
    console.log("No user ID available to fetch token");
    return null;
  }

  try {
    console.log(`Fetching fresh token for user ${userId}`);
    const response = await axios.get(`${USER_API_END_POINT}/generate-token/${userId}`, {
      withCredentials: true
    });

    if (response.data.success && response.data.token) {
      console.log("Successfully fetched fresh token from backend");
      return response.data.token;
    }

    console.log("Token fetch response did not contain a token");
    return null;
  } catch (error) {
    console.error("Error fetching fresh token:", error);
    return null;
  }
};

// Function to get token from any available source
export const getToken = async (forceRefresh = false) => {
  // If forceRefresh is true, fetch a fresh token
  if (forceRefresh) {
    const freshToken = await fetchFreshToken();
    if (freshToken) {
      return freshToken;
    }
  }

  // First try cookies
  const cookieToken = extractTokenFromCookies();
  if (cookieToken) {
    console.log("Token found in cookies");
    return cookieToken;
  }

  // Then try localStorage
  const storageToken = extractTokenFromStorage();
  if (storageToken) {
    console.log("Token found in localStorage");
    return storageToken;
  }

  // If no token found, try to fetch a fresh one
  if (!forceRefresh) {
    console.log("No token found in any source, fetching fresh token");
    const freshToken = await fetchFreshToken();
    if (freshToken) {
      return freshToken;
    }
  }

  console.log("No token found in any source and failed to fetch fresh token");
  return null;
};

// Function to store token in Redux
export const storeTokenInRedux = async (dispatch) => {
  const token = await getToken();
  if (token) {
    dispatch(setToken(token));
    return true;
  }

  // If no token found, try to fetch a fresh one
  const freshToken = await fetchFreshToken();
  if (freshToken) {
    dispatch(setToken(freshToken));
    return true;
  }

  return false;
};

// Function to manually set Authorization header for a specific request
export const addAuthHeader = async (config) => {
  const token = await getToken();
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Added Authorization header with token");
  } else {
    console.log("No token available to add to Authorization header");
  }
  return config;
};
