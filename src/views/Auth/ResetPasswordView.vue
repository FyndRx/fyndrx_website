<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import TextInput from '@/components/TextInput.vue';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const form = ref({
  password: '',
  confirmPassword: '',
});
const validationErrors = ref({
  password: '',
  confirmPassword: '',
});
const successMessage = ref('');

const handleSubmit = async () => {
  // Reset validation errors
  validationErrors.value = {
    password: '',
    confirmPassword: '',
  };

  // Validate form
  if (!form.value.password) {
    validationErrors.value.password = 'Password is required';
    return;
  }
  if (form.value.password.length < 8) {
    validationErrors.value.password = 'Password must be at least 8 characters long';
    return;
  }
  if (form.value.password !== form.value.confirmPassword) {
    validationErrors.value.confirmPassword = 'Passwords do not match';
    return;
  }

  try {
    loading.value = true;
    // TODO: Implement the actual password reset logic here
    // await authStore.resetPassword({
    //   token: route.query.token as string,
    //   password: form.value.password,
    // });
    successMessage.value = 'Your password has been reset successfully.';
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    console.error('Password reset failed:', error);
    validationErrors.value.password = 'Failed to reset password. Please try again.';
  } finally {
    loading.value = false;
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
          Reset your password
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Please enter your new password below.
        </p>
      </div>

      <!-- Reset Password Form -->
      <div class="mt-8 bg-white dark:bg-gray-800 py-8 px-4 shadow-xl rounded-2xl sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <TextInput
            v-model="form.password"
            type="password"
            label="New Password"
            placeholder="Enter your new password"
            required
            autocomplete="new-password"
            :error="validationErrors.password"
          />

          <TextInput
            v-model="form.confirmPassword"
            type="password"
            label="Confirm New Password"
            placeholder="Confirm your new password"
            required
            autocomplete="new-password"
            :error="validationErrors.confirmPassword"
          />

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
              {{ loading ? 'Resetting...' : 'Reset Password' }}
            </button>
          </div>

          <div class="text-center">
            <router-link
              to="/login"
              class="font-medium text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]"
            >
              Back to login
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template> 