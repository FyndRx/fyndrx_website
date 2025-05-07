<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';
import Checkbox from '@/components/Checkbox.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const form = ref({
  email: '',
  password: '',
  rememberMe: false,
});

const validationErrors = ref({
  email: '',
  password: '',
});

const handleSubmit = async () => {
  // Reset validation errors
  validationErrors.value = {
    email: '',
    password: '',
  };

  // Validate form
  if (!form.value.email) {
    validationErrors.value.email = 'Email or phone number is required';
    return;
  }
  if (!form.value.password) {
    validationErrors.value.password = 'Password is required';
    return;
  }

  try {
    loading.value = true;
    await authStore.login({
      email: form.value.email,
      password: form.value.password,
    });
    router.push('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    validationErrors.value.email = 'Invalid email/phone or password';
  } finally {
    loading.value = false;
  }
};

const handleEmailValidation = (isValid: boolean) => {
  if (!isValid && form.value.email) {
    validationErrors.value.email = 'Please enter a valid email or Ghana phone number';
  } else {
    validationErrors.value.email = '';
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img 
          src="/src/assets/logo/logo_blue_orange.png" 
          alt="FyndRx Logo" 
          class="mx-auto h-12 w-auto dark:hidden"
        />
        <img 
          src="/src/assets/logo/logo_white_orange.png" 
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

      <!-- Login Form -->
      <div class="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <TextInput
            v-model="form.email"
            type="email"
            label="Email or Phone Number"
            placeholder="Enter your email or phone number"
            required
            autocomplete="email"
            acceptPhone
            :error="validationErrors.email"
            @validation="handleEmailValidation"
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
            <div class="flex items-center">
               <input
                id="remember-me"
                v-model="form.rememberMe"
                name="remember-me"
                type="checkbox"
                class="h-4 w-4 text-[#246BFD] focus:ring-[#246BFD] border-gray-300 dark:border-gray-600 rounded"
              /> 
              <label for="remember-me" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                Remember me
              </label>
            </div>

            <div class="text-sm">
              <a
                href="#"
                class="font-medium text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]"
              >
                Forgot your password?
              </a>
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