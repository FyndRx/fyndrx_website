<script setup lang="ts">
import { ref, reactive } from 'vue';
import { newsletterService } from '@/services/newsletter';
import { validationRules as globalValidationRules, validateForm } from '@/utils/validation';

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

<script lang="ts">
  export default {
    name: 'NewsletterSignup',
  }
</script>

<template>
  <section class="py-20 bg-[#246BFD]">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="grid items-center grid-cols-1 gap-12 lg:grid-cols-2">
        <!-- Left Column -->
        <div class="scroll-animate slide-in-left">
          <h2 class="mb-4 text-4xl font-medium text-white">
            Stay Updated with FyndRx
          </h2>
          <p class="mb-8 text-xl text-blue-100">
            Join thousands of subscribers who get health tips, drug alerts, and exclusive offers delivered straight to their inbox.
          </p>
          <ul class="space-y-4">
            <li class="flex items-start space-x-3">
              <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mt-0.5">
                <svg class="w-5 h-5 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-white">Weekly health tips</p>
                <p class="text-sm text-blue-200">Expert-curated advice from licensed pharmacists</p>
              </div>
            </li>
            <li class="flex items-start space-x-3">
              <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mt-0.5">
                <svg class="w-5 h-5 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-white">Drug shortage alerts</p>
                <p class="text-sm text-blue-200">Be first to know when medications are restocked</p>
              </div>
            </li>
            <li class="flex items-start space-x-3">
              <div class="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mt-0.5">
                <svg class="w-5 h-5 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
              </div>
              <div>
                <p class="font-semibold text-white">Exclusive discounts</p>
                <p class="text-sm text-blue-200">Subscriber-only deals from partner pharmacies</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Right Column -->
        <div class="scroll-animate slide-in-right">
          <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-xl">
            <h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
              Subscribe to Our Newsletter
            </h3>
            <p class="mb-6 text-gray-600 dark:text-gray-400">
              Stay updated with our latest news, offers, and healthcare tips.
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div>
                <label for="email" class="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
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

              <div v-if="error" class="p-3 text-sm text-red-600 rounded-lg bg-red-50 dark:bg-red-900/20 dark:text-red-400">
                {{ error }}
              </div>

              <div v-if="success" class="p-3 text-sm text-green-600 rounded-lg bg-green-50 dark:bg-green-900/20 dark:text-green-400">
                {{ success }}
              </div>

              <button
                type="submit"
                class="w-full px-6 py-2.5 bg-[#246BFD] text-white rounded-lg hover:bg-[#246BFD]/90 transition-all duration-300 shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                :disabled="loading"
              >
                <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                <span>{{ loading ? 'Subscribing...' : 'Subscribe' }}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

