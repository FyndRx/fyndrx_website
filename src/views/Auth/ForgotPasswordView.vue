<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';
import TextInput from '@/components/TextInput.vue';
import { authService } from '@/services/auth.service';

const router = useRouter();

type Method = 'email' | 'phone';
const method = ref<Method>('email');

const switchMethod = (next: Method) => {
  method.value = next;
  // Reset both flows' messages so switching tabs never leaves a stale error/success visible.
  validationError.value = '';
  successMessage.value = '';
  phoneStep.value = 1;
  phoneError.value = '';
  otpError.value = '';
};

// ── Email link flow (existing) ───────────────────────────────────────────
const loading = ref(false);
const email = ref('');
const validationError = ref('');
const successMessage = ref('');
const emailFormatValid = ref(true);

const handleSubmit = async () => {
  validationError.value = '';
  successMessage.value = '';

  if (!email.value.trim()) {
    validationError.value = 'Email is required';
    return;
  }
  if (email.value.trim().length > 254) {
    validationError.value = 'Email is too long';
    return;
  }
  if (!emailFormatValid.value) {
    validationError.value = 'Please enter a valid email address';
    return;
  }

  try {
    loading.value = true;
    await authService.requestPasswordReset(email.value.trim());
    successMessage.value = 'If an account exists with this email, you will receive password reset instructions.';
  } catch (error) {
    console.error('Password reset request failed:', error);
    validationError.value = 'Failed to process request. Please try again.';
  } finally {
    loading.value = false;
  }
};

const handleEmailValidation = (isValid: boolean) => {
  emailFormatValid.value = isValid;
  if (!isValid && email.value) {
    validationError.value = 'Please enter a valid email address';
  } else {
    validationError.value = '';
  }
};

// ── Text-me-a-code flow (new — reuses the backend's existing OTP password-reset
// endpoint, which was already fully built but never wired up to any view) ──────
const phoneStep = ref<1 | 2>(1);
const phoneNumber = ref('');
const phoneFormatValid = ref(true);
const phoneError = ref('');
const phoneSending = ref(false);

const otp = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const otpError = ref('');
const otpSubmitting = ref(false);
const phoneSuccess = ref('');

const resendDisabled = ref(false);
const resendCountdown = ref(60);
let countdownTimer: ReturnType<typeof setInterval> | undefined;

const startCountdown = () => {
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

onUnmounted(() => clearInterval(countdownTimer));

const handlePhoneValidation = (isValid: boolean) => {
  phoneFormatValid.value = isValid;
  if (!isValid && phoneNumber.value) {
    phoneError.value = 'Please enter a valid Ghana phone number';
  } else {
    phoneError.value = '';
  }
};

// Requires at least one letter and one number, 8-72 chars (72 = common bcrypt input cap)
const isStrongPassword = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(value);

const requestPhoneCode = async () => {
  phoneError.value = '';

  if (!phoneNumber.value.trim()) {
    phoneError.value = 'Phone number is required';
    return;
  }
  if (!phoneFormatValid.value) {
    phoneError.value = 'Please enter a valid Ghana phone number';
    return;
  }

  phoneSending.value = true;
  try {
    await authService.sendOTP({ phone_number: phoneNumber.value.trim(), reset_password: true });
    phoneStep.value = 2;
    startCountdown();
  } catch (err: any) {
    phoneError.value = err?.message || 'Failed to send code. Please try again.';
  } finally {
    phoneSending.value = false;
  }
};

const resendPhoneCode = async () => {
  if (resendDisabled.value) return;
  phoneSending.value = true;
  otpError.value = '';
  try {
    await authService.sendOTP({ phone_number: phoneNumber.value.trim(), reset_password: true });
    startCountdown();
  } catch (err: any) {
    otpError.value = err?.message || 'Failed to resend code. Please try again.';
  } finally {
    phoneSending.value = false;
  }
};

const changePhoneNumber = () => {
  phoneStep.value = 1;
  otp.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  otpError.value = '';
  clearInterval(countdownTimer);
  resendDisabled.value = false;
};

const submitPhoneReset = async () => {
  otpError.value = '';

  const trimmedOtp = otp.value.trim();
  if (!/^\d{4,6}$/.test(trimmedOtp)) {
    otpError.value = 'Enter the numeric code we sent you.';
    return;
  }
  if (!isStrongPassword(newPassword.value)) {
    otpError.value = 'Password must be 8+ characters and include at least one letter and one number.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    otpError.value = 'Passwords do not match.';
    return;
  }

  otpSubmitting.value = true;
  try {
    await authService.resetPassword({
      phone_number: phoneNumber.value.trim(),
      otp: trimmedOtp,
      password: newPassword.value,
      password_confirmation: confirmPassword.value,
    });
    phoneSuccess.value = 'Your password has been reset successfully. Redirecting to sign in…';
    clearInterval(countdownTimer);
    setTimeout(() => router.push('/login'), 2000);
  } catch (err: any) {
    otpError.value = err?.message || 'That code is invalid or has expired. Please try again.';
  } finally {
    otpSubmitting.value = false;
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
          Choose how you'd like to reset it.
        </p>
      </div>

      <!-- Forgot Password Form -->
      <div class="px-4 py-8 mt-8 bg-white shadow-xl dark:bg-gray-800 rounded-2xl sm:px-10">

        <!-- Method toggle -->
        <div class="grid grid-cols-2 gap-2 p-1 mb-6 bg-gray-100 dark:bg-gray-900 rounded-full">
          <button
            type="button"
            class="py-2 text-sm font-semibold rounded-full transition-all duration-300"
            :class="method === 'email' ? 'bg-white dark:bg-gray-700 text-[#246BFD] shadow-sm' : 'text-gray-500 dark:text-gray-400'"
            @click="switchMethod('email')"
          >
            Email link
          </button>
          <button
            type="button"
            class="py-2 text-sm font-semibold rounded-full transition-all duration-300"
            :class="method === 'phone' ? 'bg-white dark:bg-gray-700 text-[#246BFD] shadow-sm' : 'text-gray-500 dark:text-gray-400'"
            @click="switchMethod('phone')"
          >
            Text me a code
          </button>
        </div>

        <!-- ── Email link flow ────────────────────────────────────────── -->
        <form v-if="method === 'email'" class="space-y-6" @submit.prevent="handleSubmit">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>

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
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#246BFD] hover:bg-[#5089FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
              :aria-busy="loading"
              :aria-disabled="loading"
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
        </form>

        <!-- ── Text-me-a-code flow ────────────────────────────────────── -->
        <div v-else>
          <!-- Step 1: phone number -->
          <form v-if="phoneStep === 1" class="space-y-6" @submit.prevent="requestPhoneCode">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              Enter the phone number on your account and we'll text you a code to reset your password.
            </p>

            <TextInput
              v-model="phoneNumber"
              type="tel"
              label="Phone Number"
              placeholder="Enter your phone number"
              required
              autocomplete="tel"
              acceptPhone
              :error="phoneError"
              @validation="handlePhoneValidation"
            />

            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#246BFD] hover:bg-[#5089FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="phoneSending"
              :aria-busy="phoneSending"
              :aria-disabled="phoneSending"
            >
              {{ phoneSending ? 'Sending code...' : 'Send Code' }}
            </button>
          </form>

          <!-- Step 2: code + new password -->
          <form v-else class="space-y-6" @submit.prevent="submitPhoneReset">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              We sent a code to {{ phoneNumber }}.
              <button type="button" class="text-[#246BFD] hover:underline" @click="changePhoneNumber">Change</button>
            </p>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
              <input
                v-model="otp"
                type="text"
                inputmode="numeric"
                maxlength="6"
                autocomplete="one-time-code"
                placeholder="Enter the code"
                required
                class="w-full px-5 py-3 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50"
              />
            </div>

            <TextInput
              v-model="newPassword"
              type="password"
              label="New Password"
              placeholder="Enter your new password"
              required
              autocomplete="new-password"
              helper="At least 8 characters, with one letter and one number"
            />

            <TextInput
              v-model="confirmPassword"
              type="password"
              label="Confirm New Password"
              placeholder="Confirm your new password"
              required
              autocomplete="new-password"
            />

            <p v-if="otpError" class="text-sm font-medium text-red-500">{{ otpError }}</p>

            <div v-if="phoneSuccess" class="p-4 rounded-md bg-green-50 dark:bg-green-900">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="w-5 h-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="ml-3">
                  <p class="text-sm font-medium text-green-800 dark:text-green-200">{{ phoneSuccess }}</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              class="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#246BFD] hover:bg-[#5089FF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#246BFD] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="otpSubmitting || !!phoneSuccess"
              :aria-busy="otpSubmitting"
              :aria-disabled="otpSubmitting || !!phoneSuccess"
            >
              {{ otpSubmitting ? 'Resetting...' : 'Reset Password' }}
            </button>

            <button
              type="button"
              :disabled="resendDisabled || phoneSending"
              class="w-full text-center text-xs font-medium text-[#246BFD] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
              @click="resendPhoneCode"
            >
              {{ resendDisabled ? `Resend code in ${resendCountdown}s` : "Didn't get it? Resend code" }}
            </button>
          </form>
        </div>

        <div class="mt-6 text-center">
          <router-link
            to="/login"
            class="font-medium text-[#246BFD] hover:text-[#5089FF] dark:text-[#5089FF] dark:hover:text-[#246BFD]"
          >
            Back to login
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>
