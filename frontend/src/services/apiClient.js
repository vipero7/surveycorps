import axios from 'axios';
import Cookies from 'universal-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  config => {
    const cookies = new Cookies();

    // First try to get token from cookie (preferred by Django backend)
    let token = cookies.get('access_token');

    // Fallback to localStorage if cookie doesn't exist
    if (!token) {
      token = localStorage.getItem('access_token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== '/auth/login/' &&
      originalRequest.url !== '/auth/refresh-token/'
    ) {
      originalRequest._retry = true;

      const cookies = new Cookies();
      const refreshToken = cookies.get('refresh_token') || localStorage.getItem('refresh_token');

      if (refreshToken) {
        try {
          // Attempt to refresh the token
          const response = await apiClient.post('/auth/refresh-token/', {
            refresh: refreshToken,
          });

          const newAccessToken = response.data.data?.access || response.data.access;

          if (newAccessToken) {
            // Update both cookie and localStorage
            cookies.set('access_token', newAccessToken, { path: '/' });
            localStorage.setItem('access_token', newAccessToken);

            // Retry the original request
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }

      // If refresh fails, clear auth data and redirect
      cookies.remove('access_token', { path: '/' });
      cookies.remove('refresh_token', { path: '/' });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');

      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
