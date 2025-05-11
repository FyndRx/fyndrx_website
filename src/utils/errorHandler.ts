import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    // Handle Axios errors
    const response = error.response;
    if (response) {
      // Server responded with an error
      return {
        message: response.data?.message || 'An error occurred',
        code: response.data?.code,
        status: response.status,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        message: 'No response from server. Please check your internet connection.',
        code: 'NETWORK_ERROR',
      };
    }
  }

  // Handle other types of errors
  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  // Fallback for unknown errors
  return {
    message: 'An unexpected error occurred',
  };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return !error.response && error.request;
  }
  return false;
}

export function isAuthError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  return false;
}

export function isValidationError(error: unknown): boolean {
  if (error instanceof AxiosError) {
    return error.response?.status === 422;
  }
  return false;
}
