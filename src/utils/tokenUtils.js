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

// Function to store token in Redux
export const storeTokenInRedux = (dispatch) => {
  const token = extractTokenFromCookies();
  if (token) {
    dispatch(setToken(token));
    return true;
  }
  return false;
};

// Function to manually set Authorization header for a specific request
export const addAuthHeader = (config) => {
  const token = extractTokenFromCookies();
  if (token) {
    if (!config.headers) {
      config.headers = {};
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};
