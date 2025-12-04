import axios, { type AxiosInstance } from "axios";

const baseURL = "http://localhost:8000/api/v1";

const apiService: AxiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
    "X-API-Key": "8c3436fcf398bab6c635c6985839d174defb666de992d76ab7a28a03484445c4",
  },
});

// Request interceptor
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export { apiService };
