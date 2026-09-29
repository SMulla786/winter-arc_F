import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach JWT Access Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => Promise.reject(error)
);

// Response Interceptor: Standardize error payloads
apiClient.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred.';
    
    if (status === 401) {
      // Clear token on 401 Unauthorized
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
    }

    return Promise.reject({
      status: status || 500,
      message,
      data: error.response?.data,
    });
  }
);

export default apiClient;
