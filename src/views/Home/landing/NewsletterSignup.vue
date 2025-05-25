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
  <section class="py-20 bg-[#246BFD]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <!-- Left Column -->
        <div class="scroll-animate slide-in-left">
          <h2 class="text-4xl font-medium text-white mb-4">
            Stay Updated with the Latest Deals
          </h2>
          <p class="text-xl text-blue-100 mb-8">
            Subscribe to our newsletter and never miss out on exclusive pharmacy deals and savings tips.
          </p>
          <div class="flex items-center space-x-4">
            <div class="flex items-center space-x-2">
              <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-white">100+</p>
                <p class="text-blue-100 font-light">Pharmacies</p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-white">50%</p>
                <p class="text-blue-100 font-light">Average Savings</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="scroll-animate slide-in-right">
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