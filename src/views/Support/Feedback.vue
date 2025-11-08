<script setup lang="ts">
import { ref } from 'vue';
import TextInput from '@/components/TextInput.vue';
import Dropdown from '@/components/Dropdown.vue';

const feedbackType = ref('');
const feedback = ref('');
const name = ref('');
const email = ref('');
const rating = ref(0);
const isSubmitting = ref(false);
const submitSuccess = ref(false);

const feedbackTypes = [
  { label: 'Suggestion', value: 'suggestion' },
  { label: 'Bug Report', value: 'bug' },
  { label: 'Complaint', value: 'complaint' },
  { label: 'Praise', value: 'praise' },
  { label: 'Other', value: 'other' }
];

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Reset form
  feedbackType.value = '';
  feedback.value = '';
  name.value = '';
  email.value = '';
  rating.value = 0;
  
  isSubmitting.value = false;
  submitSuccess.value = true;
  
  // Hide success message after 5 seconds
  setTimeout(() => {
    submitSuccess.value = false;
  }, 5000);
};
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-3xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Feedback</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          We value your feedback! Help us improve FyndRx by sharing your thoughts and suggestions.
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="submitSuccess"
        class="p-4 mb-8 border border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-800 rounded-2xl"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-green-400 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-green-800 dark:text-green-200">
              Thank you for your feedback! We appreciate your input.
            </p>
          </div>
        </div>
      </div>

      <!-- Feedback Form -->
      <form @submit.prevent="handleSubmit" class="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <!-- Feedback Type -->
        <div class="mb-6">
          <Dropdown
            v-model="feedbackType"
            :options="feedbackTypes"
            label="Type of Feedback"
            placeholder="Select Feedback Type"
            required
            searchable
          />
        </div>

        <!-- Rating -->
        <div class="mb-6">
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            How would you rate your experience?
          </label>
          <div class="flex space-x-2">
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="rating = star"
              class="focus:outline-none"
            >
              <svg
                class="w-8 h-8"
                :class="star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Feedback Text -->
        <div class="mb-6">
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Your Feedback
          </label>
          <textarea
            v-model="feedback"
            required
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent"
            placeholder="Please share your thoughts, suggestions, or concerns..."
          ></textarea>
        </div>

        <!-- Name -->
        <div class="mb-6">
          <TextInput
            v-model="name"
            type="text"
            label="Your Name (Optional)"
            placeholder="John Doe"
          />
        </div>

        <!-- Email -->
        <div class="mb-6">
          <TextInput
            v-model="email"
            type="email"
            label="Your Email (Optional)"
            placeholder="john@example.com"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-6 py-3 bg-[#246BFD] text-white font-medium rounded-full hover:bg-[#5089FF] hover:shadow-lg hover:shadow-[#246BFD]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit Feedback</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 