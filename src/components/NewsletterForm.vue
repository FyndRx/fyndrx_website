<script setup lang="ts">
import { ref, reactive } from 'vue';
import { newsletterService } from '@/services/newsletter';
import { validationRules as globalValidationRules, validateForm, type ValidationError } from '@/utils/validation';

const email = ref('');
const loading = ref(false);
const success = ref<string | null>(null);
const error = ref<string | null>(null);
const fieldErrors = reactive<Record<string, string>>({});

const formValidationRules = {
  email: [
    globalValidationRules.required,
    globalValidationRules.email,
  ],
};

const handleSubmit = async () => {
  try {
    // Reset states
    loading.value = true;
    error.value = null;
    success.value = null;
    Object.keys(fieldErrors).forEach(key => delete fieldErrors[key]);

    // Validate form
    const errors = validateForm({ email: email.value }, formValidationRules);
    if (errors.length > 0) {
      errors.forEach(err => {
        fieldErrors[err.field] = err.message;
      });
      return;
    }

    // Submit form
    await newsletterService.subscribe(email.value);
    success.value = 'Thank you for subscribing to our newsletter!';
    email.value = '';
  } catch (err: any) {
    if (err.response?.data?.message) {
      error.value = err.response.data.message;
    } else {
      error.value = err instanceof Error ? err.message : 'Failed to subscribe to newsletter';
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
    <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
      Subscribe to Our Newsletter
    </h3>
    <p class="text-gray-600 dark:text-gray-400 mb-6">
      Stay updated with our latest news, offers, and healthcare tips.
    </p>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          :class="[
            'w-full px-4 py-2 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors',
            fieldErrors.email
              ? 'border-red-500 dark:border-red-500'
              : 'border-gray-300 dark:border-gray-600'
          ]"
          placeholder="Enter your email"
        />
        <p v-if="fieldErrors.email" class="mt-1 text-sm text-red-600 dark:text-red-400">
          {{ fieldErrors.email }}
        </p>
      </div>

      <div v-if="error" class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
        {{ error }}
      </div>

      <div v-if="success" class="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm">
        {{ success }}
      </div>

      <button
        type="submit"
        class="w-full px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        :disabled="loading"
      >
        <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
        <span>{{ loading ? 'Subscribing...' : 'Subscribe' }}</span>
      </button>
    </form>
  </div>
</template> 