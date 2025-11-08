<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const successMessage = ref('');
const form = ref({
  login: '',
  password: '',
  rememberMe: false,
});

const validationErrors = ref({
  login: '',
  password: '',
});

const handleSubmit = async () => {
  // Reset validation errors and success message
  validationErrors.value = {
    login: '',
    password: '',
  };
  successMessage.value = '';

  // Validate form
  if (!form.value.login) {
    validationErrors.value.login = 'Email or phone number is required';
    return;
  }
  if (!form.value.password) {
    validationErrors.value.password = 'Password is required';
    return;
  }

  try {
    loading.value = true;
    await authStore.login({
      login: form.value.login,
      password: form.value.password,
    });
    successMessage.value = 'Login successful! Redirecting...';
    // Wait for the auth store to update and verify authentication
    await authStore.checkAuth();
    // Small delay to show success message
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Redirect based on user role
    const userRole = (authStore.user as any)?.role;
    if (userRole === 'pharmacy' || userRole === 'pharmacy_staff') {
      router.push({ name: 'pharmacy-dashboard' });
    } else {
      router.push({ name: 'dashboard' });
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Network error')) {
        validationErrors.value.login = 'Network error. Please check your internet connection.';
      } else {
        validationErrors.value.login = error.message || 'Invalid email/phone or password';
      }
    } else {
      validationErrors.value.login = 'An unexpected error occurred. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

const handleLoginValidation = (isValid: boolean) => {
  if (!isValid && form.value.login) {
    validationErrors.value.login = 'Please enter a valid email or Ghana phone number';
  } else {
    validationErrors.value.login = '';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-xl w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img 
          :src="logoBlueOrange" 
          alt="FyndRx Logo" 
          class="mx-auto h-12 w-auto dark:hidden"
        />
        <img 
          :src="logoWhiteOrange" 
          alt="FyndRx Logo" 
          class="mx-auto h-12 w-auto hidden dark:block"
        />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <router-link
            to="/register"
            class="font-medium text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]"
          >
            Create one now
          </router-link>
        </p>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="rounded-md bg-green-50 dark:bg-green-900 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800 dark:text-green-200">
              {{ successMessage }}
            </p>
          </div>
        </div>
      </div>

      <!-- Login Form -->
      <div class="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <TextInput
            v-model="form.login"
            type="text"
            label="Email or Phone Number"
            placeholder="Enter your email or phone number"
            required
            autocomplete="email"
            acceptPhone
            :error="validationErrors.login"
            @validation="handleLoginValidation"
          />

          <TextInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            required
            autocomplete="current-password"
            :error="validationErrors.password"
          />

          <div class="flex items-center justify-between">
            <!-- <Checkbox label="Remember me" v-model="form.rememberMe" /> -->
            <CustomCheckbox
              v-model="form.rememberMe"
              label="Remember me"
              size="small"
            />

            <div class="text-sm">
              <router-link
                to="/forgot-password"
                class="font-medium text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]"
              >
                Forgot your password?
              </router-link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#246BFD] hover:bg-[#5089FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] transition-all duration-300"
              :disabled="loading"
            >
              <svg
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {{ loading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 