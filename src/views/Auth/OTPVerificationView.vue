<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
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
let countdownTimer: ReturnType<typeof setInterval> | undefined;

const startResendCountdown = () => {
  resendDisabled.value = true;
  resendCountdown.value = 60;
  clearInterval(countdownTimer);
  countdownTimer = setInterval(() => {
    resendCountdown.value -= 1;
    if (resendCountdown.value <= 0) {
      clearInterval(countdownTimer);
      resendDisabled.value = false;
    }
  }, 1000);
};

onMounted(() => {
  // Get email from route query params
  const emailParam = route.query.email as string;
  if (!emailParam) {
    router.push('/register');
    return;
  }
  email.value = emailParam;
  startResendCountdown();
});

onUnmounted(() => {
  clearInterval(countdownTimer);
});

const handleSubmit = async () => {
  try {
    if (!otp.value.trim()) {
      error.value = 'Please enter the OTP';
      return;
    }
    if (!/^\d{4,6}$/.test(otp.value.trim())) {
      error.value = 'Please enter the numeric code sent to your email';
      return;
    }

    loading.value = true;
    error.value = null;

    const response = await authService.verifyOTP({
      email: route.query.email as string,
      otp: otp.value.trim(),
    });

    // Store access_token using the store for reactivity
    authStore.setToken((response as any).access_token);

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
    await authService.sendOTP({ email: email.value });
    startResendCountdown();
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
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              required
              class="appearance-none rounded-full relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
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
            :aria-busy="loading"
            :aria-disabled="loading"
            class="group relative w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-full text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="loading"
              class="animate-spin -ml-1 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span v-if="loading">Verifying...</span>
            <span v-else>Verify Email</span>
          </button>
        </div>

        <div class="text-center">
          <button
            type="button"
            :disabled="resendDisabled || resendLoading"
            :aria-busy="resendLoading"
            @click="handleResendOTP"
            class="text-sm text-primary hover:text-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ resendLoading ? 'Sending...' : resendDisabled ? `Resend code in ${resendCountdown}s` : 'Resend code' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template> 