import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import type { User } from '@/models/User';
import type { LoginCredentials, RegisterCredentials } from '@/services/auth.service';
import { handleApiError, isNetworkError } from '@/utils/errorHandler';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('access_token') || localStorage.getItem('token'));
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastTokenRefresh = ref<number | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  const userInitials = computed(() => {
    if (!user.value) return '';
    return `${user.value.firstname?.[0] || ''}${user.value.lastname?.[0] || ''}`.toUpperCase();
  });

  const setToken = (newToken: string) => {
    accessToken.value = newToken;
    localStorage.setItem('access_token', newToken);
    lastTokenRefresh.value = Date.now();
    // console.log('Token set:', newToken);
  };

  const clearAuth = () => {
    user.value = null;
    accessToken.value = null;
    localStorage.removeItem('access_token');
    lastTokenRefresh.value = null;
  };

  const fetchUserDetails = async () => {
    try {
      const response = await authService.getUserDetails();
      // console.log('User details response:', response);
      user.value = response;
      // console.log('User set in store:', user.value);
    } catch (err) {
      const apiError = handleApiError(err);
      error.value = apiError.message;
      if (isNetworkError(err)) {
        error.value = 'Network error. Please check your internet connection.';
      }
      throw err;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await authService.login(credentials);      
      if (!response.access_token) {
        throw new Error('Invalid response from server');
      }

      setToken(response.access_token);
      await fetchUserDetails();
    } catch (err) {
      const apiError = handleApiError(err);
      if (isNetworkError(err)) {
        error.value = 'Network error. Please check your internet connection.';
      } else {
        error.value = apiError.message || 'Invalid email/phone or password';
      }
      throw new Error(error.value || 'An error occurred');
    } finally {
      loading.value = false;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    loading.value = true;
    error.value = null;
    try {
      // We don't save the token here anymore as registration might not return it directly or we want to login separately
      // But based on previous code it seems register returns a token. 
      // If the backend flow is: Register -> Token, then we keep it. 
      // If flow is Verify OTP -> Register -> Token, then we keep it.
      const response = await authService.register(credentials);
      if (response.access_token) {
        setToken(response.access_token);
        await fetchUserDetails();
      }
    } finally {
      loading.value = false;
    }
  };

  const sendOTP = async (credentials: { email: string; phone_number: string }) => {
    try {
      loading.value = true;
      error.value = null;
      await authService.sendOTP(credentials);
    } catch (err) {
      const apiError = handleApiError(err);
      if (isNetworkError(err)) {
        error.value = 'Network error. Please check your internet connection.';
      } else {
        error.value = apiError.message || 'Failed to send OTP.';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const verifyOTP = async (credentials: { email: string; otp: string }) => {
     try {
      loading.value = true;
      error.value = null;
      await authService.verifyOTP(credentials);
    } catch (err) {
      const apiError = handleApiError(err);
      if (isNetworkError(err)) {
        error.value = 'Network error. Please check your internet connection.';
      } else {
        error.value = apiError.message || 'Invalid OTP.';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;
      await authService.logout();
      clearAuth();
    } catch (err) {
      const apiError = handleApiError(err);
      error.value = apiError.message;
      // Still clear auth even if logout fails
      clearAuth();
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const checkAuth = async () => {
    if (!accessToken.value || !isAuthenticated.value) {
      clearAuth();
      return false;
    }
    try {
      await fetchUserDetails();
      return true;
    } catch {
      clearAuth();
      return false;
    }
  };

  return {
    user,
    accessToken,
    loading,
    error,
    isAuthenticated,
    userInitials,
    login,
    register,
    sendOTP,
    verifyOTP,
    logout,
    checkAuth,
    fetchUserDetails,
    setToken,
  };
});
