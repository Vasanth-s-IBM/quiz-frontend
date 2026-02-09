import axios from 'axios';

const API_BASE_URL = 'https://quiz-backend-5agh.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – attach token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // 🔥 IMPORTANT: allow login errors to be handled in UI
    // Only hard-redirect on 401 for non-login requests
    if (status === 401 && !url?.includes('/auth/login')) {
      localStorage.clear();
      // Use replace so the user can't go back to the broken page
      window.location.replace('/login');
      return new Promise(() => {}); // prevent further .catch() handling
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
