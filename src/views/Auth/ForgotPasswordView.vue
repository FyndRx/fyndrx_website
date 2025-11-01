<script setup lang="ts">
import { ref } from 'vue';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';
import TextInput from '@/components/TextInput.vue';

const loading = ref(false);
const email = ref('');
const validationError = ref('');
const successMessage = ref('');

const handleSubmit = async () => {
  validationError.value = '';
  successMessage.value = '';

  if (!email.value) {
    validationError.value = 'Email is required';
    return;
  }

  try {
    loading.value = true;
    // TODO: Implement the actual password reset request logic here
    // await authStore.requestPasswordReset(email.value);
    successMessage.value = 'If an account exists with this email, you will receive password reset instructions.';
  } catch (error) {
    console.error('Password reset request failed:', error);
    validationError.value = 'Failed to process request. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleEmailValidation = (isValid: boolean) => {
  if (!isValid && email.value) {
    validationError.value = 'Please enter a valid email address';
  } else {
    validationError.value = '';
  }
};
</script>

<template>
  <div class="flex items-center justify-center min-h-screen px-4 py-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
    <div class="w-full max-w-xl space-y-8">
      <!-- Logo -->
      <div class="text-center">
        <img 
          :src="logoBlueOrange" 
          alt="FyndRx Logo" 
          class="w-auto h-12 mx-auto dark:hidden"
        />
        <img 
          :src="logoWhiteOrange" 
          alt="FyndRx Logo" 
          class="hidden w-auto h-12 mx-auto dark:block"
        />
        <h2 class="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <!-- Forgot Password Form -->
      <div class="px-4 py-8 mt-8 bg-white shadow-xl dark:bg-gray-800 rounded-2xl sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <TextInput
            v-model="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email address"
            required
            autocomplete="email"
            :error="validationError"
            @validation="handleEmailValidation"
          />

          <div v-if="successMessage" class="p-4 rounded-md bg-green-50 dark:bg-green-900">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="w-5 h-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
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
                class="w-5 h-5 mr-3 -ml-1 text-white animate-spin"
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
              {{ loading ? 'Sending...' : 'Send Reset Instructions' }}
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