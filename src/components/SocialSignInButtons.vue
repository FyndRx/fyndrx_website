<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useSocialAuth } from '@/composables/useSocialAuth';
import TextInput from '@/components/TextInput.vue';
import type { SocialProvider } from '@/services/auth.service';

const emit = defineEmits<{ success: []; error: [message: string] }>();

const authStore = useAuthStore();
const { renderGoogleButton, signInWithFacebook } = useSocialAuth();

const googleButtonEl = ref<HTMLElement | null>(null);
const googleReady = ref(true);
const facebookLoading = ref(false);

const pendingLink = ref<{ provider: SocialProvider; email: string; token: string } | null>(null);
const linkPassword = ref('');
const linkError = ref('');
const linkSubmitting = ref(false);

onMounted(async () => {
  if (!googleButtonEl.value) return;
  try {
    await renderGoogleButton(
      googleButtonEl.value,
      (idToken) => handleProviderToken('google', idToken),
      (err) => emit('error', err.message)
    );
  } catch (err: any) {
    googleReady.value = false;
    emit('error', err.message || 'Google sign-in is unavailable.');
  }
});

const handleProviderToken = async (provider: SocialProvider, token: string) => {
  try {
    const result = await authStore.loginWithSocialProvider(provider, token);
    if (result.requiresLinkConfirmation) {
      pendingLink.value = { provider: result.provider, email: result.email, token };
      linkPassword.value = '';
      linkError.value = '';
    } else {
      emit('success');
    }
  } catch (err: any) {
    emit('error', err.message || 'Sign-in failed. Please try again.');
  }
};

const handleFacebookClick = async () => {
  facebookLoading.value = true;
  try {
    const token = await signInWithFacebook();
    await handleProviderToken('facebook', token);
  } catch (err: any) {
    emit('error', err.message || 'Facebook sign-in failed.');
  } finally {
    facebookLoading.value = false;
  }
};

const submitLinkConfirmation = async () => {
  if (!pendingLink.value || !linkPassword.value) {
    linkError.value = 'Please enter your password.';
    return;
  }
  linkSubmitting.value = true;
  linkError.value = '';
  try {
    await authStore.confirmSocialLink(pendingLink.value.provider, pendingLink.value.token, linkPassword.value);
    pendingLink.value = null;
    emit('success');
  } catch (err: any) {
    linkError.value = err.message || 'Incorrect password.';
  } finally {
    linkSubmitting.value = false;
  }
};

const cancelLink = () => {
  pendingLink.value = null;
  linkPassword.value = '';
  linkError.value = '';
};
</script>

<template>
  <div>
    <div v-if="pendingLink" class="p-4 border border-[#246BFD]/30 bg-[#246BFD]/5 dark:bg-[#246BFD]/10 rounded-2xl space-y-3">
      <p class="text-sm text-gray-700 dark:text-gray-300">
        An account with <span class="font-medium">{{ pendingLink.email }}</span> already exists.
        Enter your password to link your {{ pendingLink.provider === 'google' ? 'Google' : 'Facebook' }} account.
      </p>
      <TextInput
        v-model="linkPassword"
        type="password"
        label="Password"
        placeholder="Enter your account password"
        autocomplete="current-password"
        :error="linkError"
      />
      <div class="flex gap-3">
        <button
          type="button"
          @click="submitLinkConfirmation"
          :disabled="linkSubmitting"
          class="flex-1 py-2.5 px-4 rounded-full text-sm font-medium text-white bg-[#246BFD] hover:bg-[#5089FF] transition-all duration-300 disabled:opacity-50"
        >
          {{ linkSubmitting ? 'Linking...' : 'Confirm & Link Account' }}
        </button>
        <button
          type="button"
          @click="cancelLink"
          class="py-2.5 px-4 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
        >
          Cancel
        </button>
      </div>
    </div>

    <template v-else>
      <div class="relative my-2">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">or continue with</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div ref="googleButtonEl" class="flex justify-center" :class="{ hidden: !googleReady }"></div>

        <button
          type="button"
          @click="handleFacebookClick"
          :disabled="facebookLoading"
          class="flex items-center justify-center gap-2 py-2.5 px-4 rounded-full border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
        >
          <svg class="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
          </svg>
          {{ facebookLoading ? 'Connecting...' : 'Continue with Facebook' }}
        </button>
      </div>
    </template>
  </div>
</template>
