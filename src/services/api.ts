import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { handleApiError, isNetworkError, isRateLimitError, isMaintenanceError } from '@/utils/errorHandler';
import serverConfig from '@/config/server';
import { useAuthStore } from '@/store/auth';

// In-memory access token storage
let accessTokenInMemory: string | null = null;

export function getAccessToken(): string | null {
  return accessTokenInMemory;
}

export function setAccessToken(token: string | null): void {
  accessTokenInMemory = token;
}

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

class ApiService {
  private api: AxiosInstance;
  private authApi: AxiosInstance;

  constructor() {
    const baseConfig = {
      baseURL: serverConfig.baseURL,
      timeout: serverConfig.timeout,
      withCredentials: true, // Crucial for sending/receiving HttpOnly cookies
      headers: {
        'Content-Type': 'application/json',
        'X-App-Version': serverConfig.version,
      },
    };

    // Base API instance without auth (for public endpoints with API key)
    this.api = axios.create(baseConfig);

    // Add API key to public endpoints
    this.api.interceptors.request.use(
      config => {
        if (serverConfig.apiKey) {
          config.headers['X-API-Key'] = serverConfig.apiKey;
        }
        return config;
      },
      error => {
        return Promise.reject(handleApiError(error));
      }
    );

    // Auth API instance with interceptor for Bearer token
    this.authApi = axios.create(baseConfig);

    // Add request interceptor for auth API
    this.authApi.interceptors.request.use(
      config => {
        const token = getAccessToken();
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          // console.log('Attached auth token:', token.substring(0, 10) + '...');
        }
        if (serverConfig.apiKey) {
          config.headers['X-API-Key'] = serverConfig.apiKey;
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
        const originalRequest = error.config;

        // Check if error is 401 and hasn't been retried yet, and isn't the refresh request itself
        if (
          error.response?.status === 401 && 
          originalRequest && 
          !originalRequest._retry && 
          !originalRequest.url?.includes('/auth/refresh')
        ) {
          if (isRefreshing) {
            return new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then(token => {
                originalRequest.headers['Authorization'] = `Bearer ${token}`;
                return this.authApi(originalRequest);
              })
              .catch(err => Promise.reject(err));
          }

          originalRequest._retry = true;
          isRefreshing = true;

          try {
            // Request a new short-lived access token using rotating refresh token cookie
            const response = await axios.post<{ success: boolean; access_token: string; message: string }>(
              `${serverConfig.baseURL}/auth/refresh`,
              {},
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json',
                  'X-App-Version': serverConfig.version,
                  'X-API-Key': serverConfig.apiKey,
                }
              }
            );

            const newAccessToken = response.data.access_token;
            setAccessToken(newAccessToken);

            // Update Pinia store
            try {
              const authStore = useAuthStore();
              authStore.setToken(newAccessToken);
            } catch (storeErr) {
              console.warn('Failed to update Pinia authStore token in interceptor:', storeErr);
            }

            processQueue(null, newAccessToken);
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return this.authApi(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            
            // Clear credentials
            setAccessToken(null);
            try {
              const authStore = useAuthStore();
              authStore.clearAuth();
            } catch (storeErr) {
              console.warn('Failed to clear Pinia authStore in interceptor:', storeErr);
            }

            // Dispatch global event to trigger logout / redirect
            window.dispatchEvent(new CustomEvent('auth:unauthorized'));
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }

        if (isRateLimitError(error)) {
          const retryAfter = error.response?.headers?.['retry-after'];
          window.dispatchEvent(new CustomEvent('api:rate-limit', { detail: { retryAfter } }));
        }
        if (isMaintenanceError(error)) {
          window.dispatchEvent(new CustomEvent('api:maintenance'));
        }
        return Promise.reject(handleApiError(error));
      }
    );

    // Add response interceptor for base API
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (isRateLimitError(error)) {
          const retryAfter = error.response?.headers?.['retry-after'];
          window.dispatchEvent(new CustomEvent('api:rate-limit', { detail: { retryAfter } }));
        }
        if (isMaintenanceError(error)) {
          window.dispatchEvent(new CustomEvent('api:maintenance'));
        }
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
      this.authApi.get<T>(url, config).then(response => response.data)
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
