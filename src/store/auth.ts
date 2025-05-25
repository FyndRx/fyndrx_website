import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '@/services/auth.service';
import type { User } from '@/models/User';
import type { LoginCredentials, RegisterCredentials } from '@/services/auth.service';
import { handleApiError, isNetworkError } from '@/utils/errorHandler';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(localStorage.getItem('access_token'));
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
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      await authService.register(credentials);
    } catch (err) {
      const apiError = handleApiError(err);
      if (isNetworkError(err)) {
        error.value = 'Network error. Please check your internet connection.';
      } else {
        error.value = apiError.message || 'Registration failed. Please try again.';
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
    logout,
    checkAuth,
    fetchUserDetails,
    setToken,
  };
});
