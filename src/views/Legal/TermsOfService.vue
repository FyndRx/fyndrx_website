<script setup lang="ts">
import { ref } from 'vue';

const sections = ref([
  {
    title: '1. Acceptance of Terms',
    content: 'By accessing and using FyndRx, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.'
  },
  {
    title: '2. Use License',
    content: 'Permission is granted to temporarily download one copy of the materials (information or software) on FyndRx\'s website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose, or for any public display (commercial or non-commercial); attempt to decompile or reverse engineer any software contained on FyndRx\'s website; remove any copyright or other proprietary notations from the materials; or transfer the materials to another person or "mirror" the materials on any other server.'
  },
  {
    title: '3. Medical Disclaimer',
    content: 'The information provided on FyndRx is for general informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.'
  },
  {
    title: '4. User Account',
    content: 'To access certain features of FyndRx, you may be required to create an account. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.'
  },
  {
    title: '5. Prescription Requirements',
    content: 'For prescription medications, you must provide a valid prescription from a licensed healthcare provider. FyndRx reserves the right to verify prescriptions and may refuse to fill prescriptions that appear to be invalid or fraudulent.'
  },
  {
    title: '6. Pricing and Payment',
    content: 'All prices are subject to change without notice. We reserve the right to modify or discontinue any product or service without notice. We shall not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the service.'
  },
  {
    title: '7. Delivery and Shipping',
    content: 'Delivery times may vary depending on your location and the availability of the medication. While we strive to deliver medications promptly, we cannot guarantee delivery times. You are responsible for providing accurate delivery information.'
  },
  {
    title: '8. Privacy',
    content: 'Your use of FyndRx is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the site and informs users of our data collection practices.'
  },
  {
    title: '9. Limitation of Liability',
    content: 'In no event shall FyndRx or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on FyndRx\'s website.'
  },
  {
    title: '10. Revisions and Errata',
    content: 'The materials appearing on FyndRx\'s website could include technical, typographical, or photographic errors. FyndRx does not warrant that any of the materials on its website are accurate, complete, or current. FyndRx may make changes to the materials contained on its website at any time without notice.'
  },
  {
    title: '11. Links',
    content: 'FyndRx has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by FyndRx of the site. Use of any such linked website is at the user\'s own risk.'
  },
  {
    title: '12. Modifications',
    content: 'FyndRx may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.'
  },
  {
    title: '13. Governing Law',
    content: 'These terms and conditions are governed by and construed in accordance with the laws of Ghana and you irrevocably submit to the exclusive jurisdiction of the courts in that location.'
  }
]);
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Terms of Service</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Last updated: {{ new Date().toLocaleDateString() }}
        </p>
      </div>

      <!-- Terms Content -->
      <div class="p-6 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <div class="prose dark:prose-invert max-w-none">
          <div v-for="(section, index) in sections" :key="index" class="mb-8 last:mb-0">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{{ section.title }}</h2>
            <p class="text-gray-600 dark:text-gray-300 leading-relaxed">{{ section.content }}</p>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="p-4 mt-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h3 class="mb-2 text-lg font-semibold text-gray-900 dark:text-white">Contact Us</h3>
          <p class="text-gray-600 dark:text-gray-300">
            If you have any questions about these Terms of Service, please contact us at:
          </p>
          <div class="mt-4 space-y-2">
            <p class="flex items-center text-gray-600 dark:text-gray-300">
              <svg class="w-5 h-5 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              legal@fyndrx.com
            </p>
            <p class="flex items-center text-gray-600 dark:text-gray-300">
              <svg class="w-5 h-5 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              +233 24 399 6999
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prose :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  color: rgb(17 24 39);
  margin-bottom: 1rem;
}

.dark .prose :deep(h2) {
  color: white;
}

.prose :deep(p) {
  color: rgb(75 85 99);
  line-height: 1.75;
}

.dark .prose :deep(p) {
  color: rgb(209 213 219);
}
</style> 