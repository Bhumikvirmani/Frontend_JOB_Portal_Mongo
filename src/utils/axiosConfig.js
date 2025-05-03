import axios from 'axios';
import { BACKEND_URL } from './constant';

// Create an axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default axiosInstance;
