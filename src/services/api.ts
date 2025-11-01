import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { handleApiError, isAuthError, isNetworkError } from '@/utils/errorHandler';
import serverConfig from '@/config/server';

class ApiService {
  private api: AxiosInstance;
  private authApi: AxiosInstance;

  constructor() {
    const baseConfig = {
      baseURL: serverConfig.baseURL,
      timeout: serverConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
        'X-App-Version': serverConfig.version,
      },
    };

    // Base API instance without auth
    this.api = axios.create(baseConfig);

    // Auth API instance with interceptor for Bearer token
    this.authApi = axios.create(baseConfig);

    // Add request interceptor for auth API
    this.authApi.interceptors.request.use(
      config => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(handleApiError(error));
      }
    );

    // Add response interceptor for auth API
    this.authApi.interceptors.response.use(
      response => response,
      async error => {
        if (isAuthError(error)) {
          // Handle unauthorized access
          localStorage.removeItem('access_token');
          window.location.href = '/login';
        }
        return Promise.reject(handleApiError(error));
      }
    );

    // Add response interceptor for base API
    this.api.interceptors.response.use(
      response => response,
      error => {
        return Promise.reject(handleApiError(error));
      }
    );
  }

  private async handleRequest<T>(
    request: () => Promise<T>,
    // errorMessage = 'An error occurred'
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      if (isNetworkError(error)) {
        throw new Error('Network error. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Generic GET request without auth
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.api.get<T>(url, config).then(response => response.data)
    );
  }

  // Generic POST request without auth
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.api.post<T>(url, data, config).then(response => response.data)
    );
  }

  // Generic PUT request without auth
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.api.put<T>(url, data, config).then(response => response.data)
    );
  }

  // Generic DELETE request without auth
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.api.delete<T>(url, config).then(response => response.data)
    );
  }

  // Generic GET request with auth
  async getAuth<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.authApi.get<T>(url, config).then(response => {
        console.log('Response:', response.data);
        return response.data;
      })
    );
  }

  // Generic POST request with auth
  async postAuth<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.authApi.post<T>(url, data, config).then(response => response.data)
    );
  }

  // Generic PUT request with auth
  async putAuth<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.authApi.put<T>(url, data, config).then(response => response.data)
    );
  }

  // Generic DELETE request with auth
  async deleteAuth<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.handleRequest<T>(() =>
      this.authApi.delete<T>(url, config).then(response => response.data)
    );
  }
}

export const apiService = new ApiService();
