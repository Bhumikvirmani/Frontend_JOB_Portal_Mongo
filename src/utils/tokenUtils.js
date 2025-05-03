import { setToken } from '../redux/authSlice';

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

// Function to get token from any available source
export const getToken = () => {
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

  console.log("No token found in any source");
  return null;
};

// Function to store token in Redux
export const storeTokenInRedux = (dispatch) => {
  const token = getToken();
  if (token) {
    dispatch(setToken(token));
    return true;
  }
  return false;
};

// Function to manually set Authorization header for a specific request
export const addAuthHeader = (config) => {
  const token = getToken();
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
