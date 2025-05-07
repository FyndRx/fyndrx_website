import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { User, UserCredentials } from "@/models/User";
import { userController } from "@/controllers/UserController";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  const login = async (credentials: UserCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await userController.login(credentials);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem("token", response.token);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Login failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const register = async (userData: UserCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      const response = await userController.register(userData);
      user.value = response.user;
      token.value = response.token;
      localStorage.setItem("token", response.token);
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Registration failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;
      user.value = null;
      token.value = null;
      localStorage.removeItem("token");
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Logout failed";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const checkAuth = async () => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        loading.value = true;
        error.value = null;
        token.value = storedToken;
        const response = await userController.getUserProfile();
        user.value = response;
      } catch (err) {
        error.value =
          err instanceof Error ? err.message : "Authentication check failed";
        token.value = null;
        localStorage.removeItem("token");
      } finally {
        loading.value = false;
      }
    }
  };

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
  };
});
