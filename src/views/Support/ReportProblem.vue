<script setup lang="ts">
import { ref } from 'vue';
import TextInput from '@/components/TextInput.vue';
import Dropdown from '@/components/Dropdown.vue';

const problemType = ref('');
const description = ref('');
const steps = ref('');
const name = ref('');
const email = ref('');
const isSubmitting = ref(false);
const submitSuccess = ref(false);

const problemTypes = [
  { label: 'Technical Issue', value: 'technical' },
  { label: 'App Bug', value: 'bug' },
  { label: 'Service Problem', value: 'service' },
  { label: 'Account Issue', value: 'account' },
  { label: 'Other', value: 'other' }
];

const handleSubmit = async () => {
  isSubmitting.value = true;
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Reset form
  problemType.value = '';
  description.value = '';
  steps.value = '';
  name.value = '';
  email.value = '';
  
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
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Report a Problem</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Help us improve FyndRx by reporting any issues you encounter. Our team will review your report and take appropriate action.
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
              Thank you for your report! We'll review it and take appropriate action.
            </p>
          </div>
        </div>
      </div>

      <!-- Report Form -->
      <form @submit.prevent="handleSubmit" class="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <!-- Problem Type -->
        <div class="mb-6">
          <Dropdown
            v-model="problemType"
            :options="problemTypes"
            label="Type of Problem"
            placeholder="Select Problem Type"
            required
            searchable
          />
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Problem Description
          </label>
          <textarea
            v-model="description"
            required
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent"
            placeholder="Please describe the problem in detail..."
          ></textarea>
        </div>

        <!-- Steps to Reproduce -->
        <div class="mb-6">
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Steps to Reproduce (if applicable)
          </label>
          <textarea
            v-model="steps"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent"
            placeholder="1. First step&#10;2. Second step&#10;3. And so on..."
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
            <span v-else>Submit Report</span>
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