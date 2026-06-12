<script setup lang="ts">
import { ref } from 'vue';
import TextInput from '@/components/TextInput.vue';
import Dropdown from '@/components/Dropdown.vue';
import { informationService } from '@/services/informationService';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Share Feedback | FyndRx',
  description: 'Share your experience with FyndRx. Your feedback helps us improve our online pharmacy platform, delivery service, and teleconsultation quality.',
  keywords: 'FyndRx feedback, share experience, rate FyndRx, online pharmacy review Ghana',
  ogType: 'website',
});

const feedbackType = ref('');
const feedback = ref('');
const name = ref('');
const email = ref('');
const rating = ref(5);
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const errorMessage = ref('');

const feedbackTypes = [
  { label: 'Suggestion', value: 'Suggestion' },
  { label: 'Bug Report', value: 'Bug Report' },
  { label: 'Complaint', value: 'Complaint' },
  { label: 'Praise', value: 'Praise' },
  { label: 'Other', value: 'Other' }
];

const handleSubmit = async () => {
  if (!feedbackType.value || !feedback.value) return;

  try {
    isSubmitting.value = true;
    errorMessage.value = '';
    
    await informationService.submitFeedback({
      name: name.value || 'Anonymous',
      email: email.value || 'no-email@fyndrx.com',
      subject: feedbackType.value,
      message: feedback.value,
      rating: rating.value
    });
    
    // Reset form
    feedbackType.value = '';
    feedback.value = '';
    name.value = '';
    email.value = '';
    rating.value = 5;
    
    submitSuccess.value = true;
    
    // Hide success message after 5 seconds
    setTimeout(() => {
      submitSuccess.value = false;
    }, 5000);
  } catch (error: any) {
    console.error('Feedback submission failed:', error);
    errorMessage.value = error.message || 'Failed to submit feedback. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">

    <!-- Hero -->
    <div class="py-16 bg-gradient-to-br from-[#FE9615] to-[#f97316]">
      <div class="px-4 mx-auto max-w-3xl sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-white mb-3">Share Your Feedback</h1>
        <p class="text-orange-100 text-lg">
          Every piece of feedback shapes how we build FyndRx. Tell us what's working and what isn't.
        </p>
      </div>
    </div>

    <div class="max-w-3xl px-4 mx-auto sm:px-6 lg:px-8 py-12">

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
 
      <!-- Error Message -->
      <div
        v-if="errorMessage"
        class="p-4 mb-8 border border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-800 rounded-2xl"
      >
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="w-5 h-5 text-red-400 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-red-800 dark:text-red-200">
              {{ errorMessage }}
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