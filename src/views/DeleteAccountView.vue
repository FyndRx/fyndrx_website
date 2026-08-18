<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import TextInput from '@/components/TextInput.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';

const router = useRouter();
const authStore = useAuthStore();

const email = ref(authStore.user?.email || '');
const password = ref('');
const reason = ref('');
const confirmed = ref(false);

const loading = ref(false);
const errorMessage = ref('');
const validationErrors = ref({ email: '', password: '' });
const deleted = ref(false);

const consequences = [
  'Your order history, saved addresses, and payment records',
  'Your prescriptions and consultation history',
  'Your favorites, notifications, and saved medications',
  'Access to your FyndRx wallet and savings',
];

const canSubmit = computed(() =>
  !loading.value && !!email.value && !!password.value && confirmed.value
);

const handleSubmit = async () => {
  validationErrors.value = { email: '', password: '' };
  errorMessage.value = '';

  if (!email.value) {
    validationErrors.value.email = 'Email is required';
    return;
  }
  if (!password.value) {
    validationErrors.value.password = 'Password is required';
    return;
  }
  if (!confirmed.value) {
    errorMessage.value = 'Please confirm you understand this action is permanent.';
    return;
  }

  loading.value = true;
  try {
    await authStore.deleteAccount({
      email: email.value,
      password: password.value,
      delete_reason: reason.value,
    });
    deleted.value = true;
    setTimeout(() => {
      router.push('/');
    }, 2500);
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'Failed to delete account. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20">
    <div class="container mx-auto px-4 max-w-2xl">

      <router-link
        v-if="!deleted"
        to="/profile"
        class="inline-flex items-center gap-2 mb-6 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-[#246BFD] transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to profile
      </router-link>

      <!-- Success state -->
      <div v-if="deleted" class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-10 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30">
          <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 class="mb-2 text-2xl font-bold text-gray-900 dark:text-white">Your account has been deleted</h1>
        <p class="text-gray-500 dark:text-gray-400">We're sorry to see you go. Redirecting you home...</p>
      </div>

      <template v-else>
        <div class="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 md:p-10">
          <div class="flex items-center gap-4 mb-6">
            <div class="flex items-center justify-center w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex-shrink-0">
              <svg class="w-7 h-7 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Delete Your Account</h1>
              <p class="text-sm text-gray-500 dark:text-gray-400">This action is permanent and cannot be undone.</p>
            </div>
          </div>

          <div class="p-5 mb-8 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 rounded-2xl">
            <p class="mb-3 text-sm font-semibold text-red-800 dark:text-red-300">Deleting your account will permanently remove:</p>
            <ul class="space-y-2">
              <li v-for="item in consequences" :key="item" class="flex items-start gap-2 text-sm text-red-700 dark:text-red-300/90">
                <svg class="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>

          <div v-if="errorMessage" class="p-4 mb-6 border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-950/20 rounded-2xl">
            <p class="text-sm text-red-800 dark:text-red-300">{{ errorMessage }}</p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <TextInput
              v-model="email"
              type="email"
              label="Confirm your email"
              placeholder="Enter your account email"
              required
              autocomplete="email"
              :error="validationErrors.email"
            />

            <TextInput
              v-model="password"
              type="password"
              label="Confirm your password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
              :error="validationErrors.password"
            />

            <div>
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Tell us why you're leaving <span class="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                v-model="reason"
                rows="3"
                class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                placeholder="Your feedback helps us improve FyndRx for other users..."
              ></textarea>
            </div>

            <CustomCheckbox
              v-model="confirmed"
              color="danger"
              label="I understand this action is permanent and cannot be undone"
            />

            <div class="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <router-link
                to="/profile"
                class="flex-1 flex justify-center items-center py-3 px-4 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Cancel
              </router-link>
              <button
                type="submit"
                :disabled="!canSubmit"
                class="flex-1 flex justify-center items-center py-3 px-4 rounded-full bg-red-600 text-white font-medium hover:bg-red-700 shadow-sm shadow-red-600/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="loading"
                  class="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ loading ? 'Deleting...' : 'Permanently Delete My Account' }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>
