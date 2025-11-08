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
            Subscribe to our newsletter for health tips, medication updates, and platform news.
          </p>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-white">100+</p>
                <p class="font-light text-blue-100">Verified Pharmacies</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-white">Fast</p>
                <p class="font-light text-blue-100">Delivery</p>
              </div>
            </div>
          </div>
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

<style scoped>

.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 

<!-- Newsletter subscription and unsubscribe /api/newsletter/subscribe and /api/newsletter/unsubscribe respectively, the body takes 'email'. I need you to help me implement this -->