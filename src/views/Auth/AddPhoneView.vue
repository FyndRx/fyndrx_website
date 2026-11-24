<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';
import { handleApiError } from '@/utils/errorHandler';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const step = ref<1 | 2>(1); // 1: phone, 2: code
const phoneNumber = ref('');
const otp = ref('');
const phoneFormatValid = ref(true);
const loading = ref(false);
const error = ref('');
const phoneError = ref('');
const otpError = ref('');

const redirectTo = computed(() => {
  const target = route.query.redirect as string | undefined;
  // Same-origin paths only — never bounce to an arbitrary URL.
  return target && target.startsWith('/') && !target.startsWith('//') ? target : '/dashboard';
});

// Resend cooldown (server enforces it too; this just keeps the UI honest).
const cooldown = ref(0);
let cooldownTimer: ReturnType<typeof setInterval> | null = null;
const startCooldown = (seconds: number) => {
  cooldown.value = Math.max(0, Math.ceil(seconds));
  if (cooldownTimer) clearInterval(cooldownTimer);
  if (cooldown.value === 0) return;
  cooldownTimer = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0 && cooldownTimer) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
    }
  }, 1000);
};
onBeforeUnmount(() => { if (cooldownTimer) clearInterval(cooldownTimer); });

const retryAfterOf = (apiError: { data?: unknown }): number | null => {
  const v = (apiError.data as { retry_after?: number } | undefined)?.retry_after;
  return typeof v === 'number' ? v : null;
};

const handlePhoneValidation = (isValid: boolean) => {
  phoneFormatValid.value = isValid;
};

const sendCode = async () => {
  if (loading.value || cooldown.value > 0) return;
  error.value = '';
  phoneError.value = '';
  otpError.value = '';

  if (!phoneNumber.value.trim()) {
    phoneError.value = 'Phone number is required';
    return;
  }
  if (!phoneFormatValid.value) {
    phoneError.value = 'Please enter a valid phone number';
    return;
  }

  loading.value = true;
  try {
    const res = await authStore.sendAddPhoneOtp(phoneNumber.value.trim()) as { retry_after?: number };
    otp.value = '';
    step.value = 2;
    startCooldown(res?.retry_after ?? 60);
  } catch (err) {
    const apiError = handleApiError(err);
    const wait = retryAfterOf(apiError);
    if (wait) startCooldown(wait);
    if (apiError.errors?.phone_number && step.value === 1) phoneError.value = apiError.errors.phone_number[0];
    else error.value = apiError.message || 'Failed to send the code. Please try again.';
  } finally {
    loading.value = false;
  }
};

const confirmCode = async () => {
  error.value = '';
  otpError.value = '';

  if (loading.value) return;
  if (!/^\d{4,6}$/.test(otp.value.trim())) {
    otpError.value = 'Please enter the numeric code sent to you';
    return;
  }

  loading.value = true;
  try {
    await authStore.confirmAddPhone(phoneNumber.value.trim(), otp.value.trim());
    router.replace(redirectTo.value);
  } catch (err) {
    const apiError = handleApiError(err);
    if (apiError.errors?.otp) {
      otpError.value = apiError.errors.otp[0];
      if (apiError.status === 429) otp.value = '';
    } else if (apiError.errors?.phone_number) {
      // Number was taken (or changed) in the meantime — send the user back to fix it.
      phoneError.value = apiError.errors.phone_number[0];
      step.value = 1;
    } else {
      error.value = apiError.message || 'Invalid or expired code.';
    }
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  await authStore.logout();
  router.push({ name: 'login' });
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <img :src="logoBlueOrange" alt="FyndRx Logo" class="mx-auto h-12 w-auto dark:hidden" />
        <img :src="logoWhiteOrange" alt="FyndRx Logo" class="mx-auto h-12 w-auto hidden dark:block" />
        <h2 class="mt-6 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          {{ step === 1 ? 'Add your phone number' : 'Verify your phone number' }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          <template v-if="step === 1">
            A phone number is required for every FyndRx account. We'll text you a code to confirm it.
          </template>
          <template v-else>
            We sent a code to {{ phoneNumber }}
            <button type="button" class="text-[#246BFD] hover:underline ml-1" @click="step = 1; otp = ''">Change</button>
          </template>
        </p>
      </div>

      <div class="bg-white dark:bg-gray-800 py-6 sm:py-8 px-4 sm:px-6 shadow-xl rounded-2xl">
        <div v-if="error" class="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          {{ error }}
        </div>

        <form v-if="step === 1" class="space-y-6" @submit.prevent="sendCode">
          <TextInput
            v-model="phoneNumber"
            type="tel"
            label="Phone Number"
            placeholder="Enter your phone number"
            required
            autocomplete="tel"
            :error="phoneError"
            @validation="handlePhoneValidation"
          />
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 rounded-lg text-white font-medium bg-[#246BFD] hover:bg-[#5089FF] disabled:opacity-60"
          >
            {{ loading ? 'Sending...' : 'Send code' }}
          </button>
        </form>

        <form v-else class="space-y-6" @submit.prevent="confirmCode">
          <TextInput
            v-model="otp"
            type="text"
            label="Verification code"
            placeholder="Enter the code"
            required
            autocomplete="one-time-code"
            :error="otpError"
          />
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 rounded-lg text-white font-medium bg-[#246BFD] hover:bg-[#5089FF] disabled:opacity-60"
          >
            {{ loading ? 'Verifying...' : 'Verify and continue' }}
          </button>
          <button type="button" :disabled="loading || cooldown > 0" class="w-full text-sm text-[#246BFD] hover:underline disabled:opacity-50 disabled:no-underline" @click="sendCode">
            {{ cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code' }}
          </button>
        </form>
      </div>

      <p class="text-center text-sm text-gray-600 dark:text-gray-400">
        <button type="button" class="hover:underline" @click="handleLogout">Sign out</button>
      </p>
    </div>
  </div>
</template>
