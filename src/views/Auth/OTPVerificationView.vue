<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth.service';
import { handleApiError, isNetworkError } from '@/utils/errorHandler';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const loading = ref(false);
const resendLoading = ref(false);
const email = ref('');
const otp = ref('');
const error = ref<string | null>(null);
const resendDisabled = ref(false);
const resendCountdown = ref(60);

onMounted(() => {
  // Get email from route query params
  const emailParam = route.query.email as string;
  if (!emailParam) {
    router.push('/register');
    return;
  }
  email.value = emailParam;
});

const handleSubmit = async () => {
  try {
    if (!otp.value) {
      error.value = 'Please enter the OTP';
      return;
    }

    loading.value = true;
    error.value = null;

    const response = await authService.verifyOTP({
      email: route.query.email as string,
      otp: otp.value,
    });

    // Store access_token using the store for reactivity
    authStore.setToken(response.access_token);

    // Fetch user details
    await authStore.fetchUserDetails();

    // Redirect to dashboard
    router.push('/dashboard');
  } catch (err) {
    if (isNetworkError(err)) {
      error.value = 'Network error. Please check your connection.';
    } else {
      error.value = handleApiError(err).message;
    }
  } finally {
    loading.value = false;
  }
};

const handleResendOTP = async () => {
  try {
    resendLoading.value = true;
    error.value = '';
    await authService.resendOTP(email.value);
  } catch (err: any) {
    const apiError = handleApiError(err);
    if (isNetworkError(err)) {
      error.value = 'Network error. Please check your internet connection.';
    } else {
      error.value = apiError.message;
    }
  } finally {
    resendLoading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify Your Email
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          We've sent a verification code to your email
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="otp" class="sr-only">Verification Code</label>
            <input
              id="otp"
              v-model="otp"
              type="text"
              required
              class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
              placeholder="Enter verification code"
            />
          </div>
        </div>

        <div v-if="error" class="text-red-600 text-sm text-center">
          {{ error }}
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span v-if="loading">Verifying...</span>
            <span v-else>Verify Email</span>
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            :disabled="resendDisabled"
            @click="handleResendOTP"
            class="text-sm text-primary hover:text-primary/90"
          >
            {{ resendDisabled ? `Resend code in ${resendCountdown}s` : 'Resend code' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 