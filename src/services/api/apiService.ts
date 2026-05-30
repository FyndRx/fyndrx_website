import axios, { type AxiosInstance } from "axios";
import { getAccessToken, setAccessToken } from "@/services/api";

const baseURL = "/api/v1";

const apiService: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "8c3436fcf398bab6c635c6985839d174defb666de992d76ab7a28a03484445c4",
  },
});

// Request interceptor
apiService.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAccessToken(null);
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export { apiService };
