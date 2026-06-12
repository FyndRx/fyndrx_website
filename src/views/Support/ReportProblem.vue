<script setup lang="ts">
import { ref } from 'vue';
import TextInput from '@/components/TextInput.vue';
import Dropdown from '@/components/Dropdown.vue';
import { informationService } from '@/services/informationService';
import { useSeoMeta } from '@/composables/useSeoMeta';

useSeoMeta({
  title: 'Report a Problem | FyndRx',
  description: 'Encountered an issue on FyndRx? Report bugs, service problems, account issues, or pharmacy complaints here. Our team reviews every report.',
  keywords: 'FyndRx report problem, report bug, platform issue, pharmacy complaint',
  ogType: 'website',
});

const problemType = ref('');
const description = ref('');
const steps = ref('');
const name = ref('');
const email = ref('');
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const errorMessage = ref('');

const problemTypes = [
  { label: 'Technical Issue / App Bug', value: 'Technical Issue' },
  { label: 'Order Not Received', value: 'Order Not Received' },
  { label: 'Wrong Medication Dispensed', value: 'Wrong Medication Dispensed' },
  { label: 'Prescription Verification Delay', value: 'Prescription Verification Delay' },
  { label: 'Payment / Billing Problem', value: 'Payment Problem' },
  { label: 'Pharmacy Complaint', value: 'Pharmacy Complaint' },
  { label: 'Account Access Issue', value: 'Account Issue' },
  { label: 'Consultation Problem', value: 'Consultation Problem' },
  { label: 'Delivery Issue', value: 'Delivery Issue' },
  { label: 'Other', value: 'Other' },
];

const handleSubmit = async () => {
  if (!problemType.value || !description.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    const fullMessage = steps.value
      ? `${description.value}\n\nSteps to Reproduce:\n${steps.value}`
      : description.value;

    await informationService.submitFeedback({
      name: name.value || 'Anonymous',
      email: email.value || 'no-email@fyndrx.com',
      subject: `Problem Report: ${problemType.value}`,
      message: fullMessage,
      rating: 1,
    });

    problemType.value = '';
    description.value = '';
    steps.value = '';
    name.value = '';
    email.value = '';
    submitSuccess.value = true;

    setTimeout(() => { submitSuccess.value = false; }, 6000);
  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to submit your report. Please try again or email us directly at support@fyndrx.com.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Hero -->
    <div class="py-16 bg-gradient-to-br from-[#246BFD] to-[#5089FF]">
      <div class="px-4 mx-auto max-w-3xl sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white/10 mb-6">
          <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 class="text-4xl font-bold text-white mb-3">Report a Problem</h1>
        <p class="text-blue-100 text-lg">
          Something not working as expected? Tell us — every report is reviewed by our team.
        </p>
      </div>
    </div>

    <div class="max-w-3xl px-4 mx-auto sm:px-6 lg:px-8 py-12">

      <!-- Success Message -->
      <div v-if="submitSuccess" class="p-5 mb-8 border border-green-200 bg-green-50 dark:bg-green-900/30 dark:border-green-800 rounded-2xl">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p class="font-semibold text-green-800 dark:text-green-200">Report submitted successfully</p>
            <p class="text-sm text-green-700 dark:text-green-300 mt-1">Our team will review your report and follow up if contact details were provided. Thank you for helping us improve FyndRx.</p>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="p-5 mb-8 border border-red-200 bg-red-50 dark:bg-red-900/30 dark:border-red-800 rounded-2xl">
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-800 dark:text-red-200">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Report Form -->
      <form @submit.prevent="handleSubmit" class="p-8 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 space-y-6">

        <div>
          <Dropdown
            v-model="problemType"
            :options="problemTypes"
            label="Type of Problem"
            placeholder="Select the problem category"
            required
            searchable
          />
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Problem Description <span class="text-red-500">*</span>
          </label>
          <textarea
            v-model="description"
            required
            rows="5"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all resize-none"
            placeholder="Describe what happened and what you expected to happen..."
          ></textarea>
        </div>

        <div>
          <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Steps to Reproduce <span class="text-gray-400 font-normal">(optional — helps us fix it faster)</span>
          </label>
          <textarea
            v-model="steps"
            rows="4"
            class="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD] focus:border-transparent transition-all resize-none"
            placeholder="1. I opened the medications page&#10;2. I searched for Paracetamol&#10;3. The page returned an error..."
          ></textarea>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            v-model="name"
            type="text"
            label="Your Name (Optional)"
            placeholder="So we can address you personally"
          />
          <TextInput
            v-model="email"
            type="email"
            label="Your Email (Optional)"
            placeholder="To follow up on your report"
          />
        </div>

        <div class="flex items-center justify-between pt-2">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Urgent? Email us directly at
            <a href="mailto:support@fyndrx.com" class="text-[#246BFD] hover:underline">support@fyndrx.com</a>
          </p>
          <button
            type="submit"
            :disabled="isSubmitting || !problemType || !description"
            class="px-8 py-3 bg-[#246BFD] text-white font-medium rounded-full hover:bg-[#5089FF] hover:shadow-lg hover:shadow-[#246BFD]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Submitting...</span>
            <span v-else>Submit Report</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
