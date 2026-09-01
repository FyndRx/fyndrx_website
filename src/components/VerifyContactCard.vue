<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useNotification } from '@/composables/useNotification';

const props = defineProps<{
  channel: 'email' | 'phone';
  value: string | null;
  verified: boolean;
}>();

const authStore = useAuthStore();
const toast = useNotification();

const label = computed(() => (props.channel === 'email' ? 'Email Address' : 'Phone Number'));
const noun = computed(() => (props.channel === 'email' ? 'email' : 'phone number'));

const expanded = ref(false);
const sending = ref(false);
const confirming = ref(false);
const otp = ref('');
const otpError = ref('');
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

const sendCode = async () => {
  sending.value = true;
  otpError.value = '';
  try {
    await (props.channel === 'email'
      ? authStore.sendEmailVerificationOtp()
      : authStore.sendPhoneVerificationOtp());
    expanded.value = true;
    startCountdown();
    toast.success('Code sent', `We sent a verification code to your ${noun.value}.`);
  } catch (err: any) {
    toast.error(`Couldn't send code`, err?.message || 'Please try again.');
  } finally {
    sending.value = false;
  }
};

const cancel = () => {
  expanded.value = false;
  otp.value = '';
  otpError.value = '';
  clearInterval(countdownTimer);
  resendDisabled.value = false;
};

const confirmCode = async () => {
  otpError.value = '';
  const trimmed = otp.value.trim();
  if (!/^\d{4,6}$/.test(trimmed)) {
    otpError.value = 'Enter the numeric code we sent you.';
    return;
  }

  confirming.value = true;
  try {
    await (props.channel === 'email'
      ? authStore.confirmEmailVerification(trimmed)
      : authStore.confirmPhoneVerification(trimmed));
    toast.success('Verified', `Your ${noun.value} is now verified.`);
    cancel();
  } catch (err: any) {
    otpError.value = err?.message || 'Invalid or expired code.';
  } finally {
    confirming.value = false;
  }
};
</script>

<template>
  <div class="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
    <div class="flex items-center gap-4 p-4">
      <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-50 dark:bg-gray-900">
        <svg v-if="channel === 'email'" class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"></path>
        </svg>
        <svg v-else class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </div>

      <div class="flex-1 min-w-0">
        <p class="font-bold text-gray-900 dark:text-white text-sm">{{ label }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ value || '—' }}</p>
      </div>

      <span
        v-if="verified"
        class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0"
      >
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        Verified
      </span>

      <template v-else>
        <span class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs font-bold shrink-0">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Unverified
        </span>
        <button
          v-if="!expanded"
          type="button"
          :disabled="sending || !value"
          :aria-busy="sending"
          class="shrink-0 px-4 py-2 text-sm font-bold rounded-full text-[#246BFD] bg-[#246BFD]/10 hover:bg-[#246BFD] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          @click="sendCode"
        >
          {{ sending ? 'Sending…' : 'Verify' }}
        </button>
      </template>
    </div>

    <div v-if="!verified && expanded" class="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700">
      <form class="flex flex-col sm:flex-row gap-3 items-start sm:items-center mt-3" @submit.prevent="confirmCode">
        <div class="flex-1 w-full">
          <input
            v-model="otp"
            type="text"
            inputmode="numeric"
            maxlength="6"
            autocomplete="one-time-code"
            placeholder="Enter the code"
            class="w-full px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#246BFD] focus:ring-opacity-50"
            :class="{ 'border-red-500': otpError }"
          />
          <p v-if="otpError" class="mt-1.5 text-xs font-medium text-red-500">{{ otpError }}</p>
        </div>
        <div class="flex gap-2 shrink-0">
          <button
            type="submit"
            :disabled="confirming"
            :aria-busy="confirming"
            class="px-5 py-2.5 rounded-full bg-[#246BFD] text-white text-sm font-bold hover:bg-[#5089FF] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ confirming ? 'Verifying…' : 'Confirm' }}
          </button>
          <button
            type="button"
            :disabled="confirming"
            class="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50"
            @click="cancel"
          >
            Cancel
          </button>
        </div>
      </form>
      <button
        type="button"
        :disabled="resendDisabled || sending"
        class="mt-2 text-xs font-medium text-[#246BFD] hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
        @click="sendCode"
      >
        {{ resendDisabled ? `Resend code in ${resendCountdown}s` : "Didn't get it? Resend code" }}
      </button>
    </div>
  </div>
</template>
