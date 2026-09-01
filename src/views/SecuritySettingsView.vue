<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useNotification } from '@/composables/useNotification';
import TextInput from '@/components/TextInput.vue';
import VerifyContactCard from '@/components/VerifyContactCard.vue';

const authStore = useAuthStore();
const toast = useNotification();

const hasPassword = computed(() => authStore.user?.has_password ?? true);

// ── Change / set password ────────────────────────────────────────────────
const currentPassword = ref('');
const newPassword = ref('');
const newPasswordConfirmation = ref('');
const passwordError = ref('');
const passwordSubmitting = ref(false);

const canSubmitPassword = computed(() =>
  (!hasPassword.value || !!currentPassword.value) &&
  newPassword.value.length >= 8 &&
  newPassword.value === newPasswordConfirmation.value
);

const submitPassword = async () => {
  passwordError.value = '';

  if (newPassword.value.length < 8) {
    passwordError.value = 'New password must be at least 8 characters.';
    return;
  }
  if (newPassword.value !== newPasswordConfirmation.value) {
    passwordError.value = 'New password and confirmation do not match.';
    return;
  }

  passwordSubmitting.value = true;
  try {
    const response = await authStore.changePassword({
      current_password: hasPassword.value ? currentPassword.value : undefined,
      new_password: newPassword.value,
      new_password_confirmation: newPasswordConfirmation.value,
    });
    currentPassword.value = '';
    newPassword.value = '';
    newPasswordConfirmation.value = '';
    toast.success(hasPassword.value ? 'Password changed' : 'Password set', response.message);
  } catch (err: any) {
    passwordError.value = err?.message || 'Failed to change password. Please try again.';
  } finally {
    passwordSubmitting.value = false;
  }
};

// ── Connected accounts ───────────────────────────────────────────────────
type Provider = 'google' | 'facebook';
const unlinkingProvider = ref<Provider | null>(null);

const PROVIDERS: { key: Provider; label: string }[] = [
  { key: 'google', label: 'Google' },
  { key: 'facebook', label: 'Facebook' },
];

const isLinked = (provider: Provider) =>
  provider === 'google' ? !!authStore.user?.google_linked : !!authStore.user?.facebook_linked;

const unlink = async (provider: Provider) => {
  const label = PROVIDERS.find((p) => p.key === provider)?.label ?? provider;
  if (!confirm(`Unlink your ${label} account? You'll no longer be able to sign in with it.`)) return;

  unlinkingProvider.value = provider;
  try {
    const response = await authStore.unlinkProvider(provider);
    toast.success(`${label} unlinked`, response.message);
  } catch (err: any) {
    toast.error(`Couldn't unlink ${label}`, err?.message || 'Please try again.');
  } finally {
    unlinkingProvider.value = null;
  }
};
</script>

<template>
  <div class="pb-20">
    <div class="container mx-auto px-4 max-w-2xl">

      <div class="mb-8">
        <h1 class="text-3xl font-black text-gray-900 dark:text-white">Security</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Manage your password and connected sign-in methods.</p>
      </div>

      <!-- Verify Email / Phone -->
      <div
        v-if="!authStore.user?.email_verified || !authStore.user?.phone_verified"
        class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 mb-6"
      >
        <h2 class="font-bold text-gray-900 dark:text-white mb-1">Verify Your Account</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Confirm your email and phone number so we can reach you about orders and help you recover your account.
        </p>
        <div class="space-y-3">
          <VerifyContactCard
            channel="email"
            :value="authStore.user?.email ?? null"
            :verified="!!authStore.user?.email_verified"
          />
          <VerifyContactCard
            channel="phone"
            :value="authStore.user?.phone_number ?? null"
            :verified="!!authStore.user?.phone_verified"
          />
        </div>
      </div>

      <!-- Change / Set Password -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8 mb-6">
        <h2 class="font-bold text-gray-900 dark:text-white mb-1">
          {{ hasPassword ? 'Change Password' : 'Set a Password' }}
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {{ hasPassword
            ? 'Choose a strong, unique password you don\'t use anywhere else.'
            : 'Your account currently signs in via a social provider only. Set a password to also enable email/phone sign-in and unlock unlinking your social account.' }}
        </p>

        <form class="space-y-4" @submit.prevent="submitPassword">
          <TextInput
            v-if="hasPassword"
            v-model="currentPassword"
            type="password"
            label="Current Password"
            placeholder="Enter your current password"
            autocomplete="current-password"
            required
          />
          <TextInput
            v-model="newPassword"
            type="password"
            label="New Password"
            placeholder="At least 8 characters"
            autocomplete="new-password"
            required
          />
          <TextInput
            v-model="newPasswordConfirmation"
            type="password"
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            autocomplete="new-password"
            required
          />

          <p v-if="passwordError" class="text-sm font-medium text-red-500">{{ passwordError }}</p>

          <button
            type="submit"
            :disabled="!canSubmitPassword || passwordSubmitting"
            class="px-6 py-2.5 rounded-full bg-[#246BFD] text-white font-bold hover:bg-[#5089FF] shadow-lg shadow-[#246BFD]/20 hover:shadow-[#246BFD]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {{ passwordSubmitting ? 'Saving…' : hasPassword ? 'Change Password' : 'Set Password' }}
          </button>
        </form>

        <p v-if="hasPassword" class="mt-5 text-xs text-gray-400 dark:text-gray-500">
          Changing your password signs out every other device — this one stays signed in.
        </p>
      </div>

      <!-- Connected Accounts -->
      <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 md:p-8">
        <h2 class="font-bold text-gray-900 dark:text-white mb-1">Connected Accounts</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">Social providers linked for sign-in.</p>

        <div class="space-y-3">
          <div
            v-for="provider in PROVIDERS"
            :key="provider.key"
            class="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 dark:border-gray-700"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gray-50 dark:bg-gray-900">
              <svg v-if="provider.key === 'google'" class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.42-.22-2.05H12v3.72h6.62c-.13 1.1-.86 2.76-2.47 3.87l-.02.15 3.59 2.78.25.02c2.28-2.1 3.55-5.2 3.55-8.49" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.07 7.94-2.9l-3.78-2.94c-1.02.7-2.4 1.19-4.16 1.19-3.18 0-5.88-2.1-6.84-5.02l-.14.01-3.73 2.89-.05.13C3.24 21.3 7.28 24 12 24" />
                <path fill="#FBBC05" d="M5.16 14.33A7.35 7.35 0 014.77 12c0-.81.14-1.6.38-2.33L5.14 9.5 1.36 6.56l-.12.06A11.96 11.96 0 000 12c0 1.93.46 3.76 1.24 5.38l3.92-3.05" />
                <path fill="#EA4335" d="M12 4.75c2.26 0 3.78.97 4.65 1.79l3.39-3.31C17.93 1.19 15.24 0 12 0 7.28 0 3.24 2.7 1.24 6.62l3.9 3.05C6.12 6.85 8.82 4.75 12 4.75" />
              </svg>
              <svg v-else class="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <p class="font-bold text-gray-900 dark:text-white text-sm">{{ provider.label }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ isLinked(provider.key) ? 'Connected' : `Sign in with ${provider.label} using this email to link it automatically.` }}
              </p>
            </div>

            <span
              v-if="isLinked(provider.key)"
              class="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shrink-0"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Connected
            </span>

            <button
              v-if="isLinked(provider.key)"
              type="button"
              :disabled="unlinkingProvider === provider.key"
              class="shrink-0 px-4 py-2 text-sm font-bold rounded-full text-red-500 bg-red-50 dark:bg-red-900/10 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
              @click="unlink(provider.key)"
            >
              {{ unlinkingProvider === provider.key ? 'Unlinking…' : 'Unlink' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
