<script setup lang="ts">
import { ref } from 'vue';

const sections = ref([
  {
    title: '1. Information We Collect',
    content: 'We collect information that you provide directly to us, including but not limited to: name, email address, phone number, address, prescription information, and payment details. We also collect information about your use of our services, such as browsing history, search queries, and interactions with our website and mobile app.'
  },
  {
    title: '2. How We Use Your Information',
    content: 'We use the information we collect to: provide, maintain, and improve our services; process and fulfill your orders; communicate with you about your orders, account, or our services; send you technical notices, updates, security alerts, and support messages; respond to your comments, questions, and requests; and monitor and analyze trends, usage, and activities in connection with our services.'
  },
  {
    title: '3. Information Sharing',
    content: 'We may share your information with: healthcare providers and pharmacies to fulfill your orders; service providers who perform services on our behalf; business partners with whom we jointly offer products or services; and in connection with a business transaction such as a merger, sale, or acquisition.'
  },
  {
    title: '4. Data Security',
    content: 'We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure.'
  },
  {
    title: '5. Your Rights',
    content: 'You have the right to: access your personal information; correct inaccurate information; request deletion of your information; object to processing of your information; and request restriction of processing your information. To exercise these rights, please contact us using the information provided below.'
  },
  {
    title: '6. Cookies and Tracking Technologies',
    content: 'We use cookies and similar tracking technologies to track activity on our website and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.'
  },
  {
    title: '7. Third-Party Services',
    content: 'Our services may contain links to third-party websites and services. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policies of any third-party sites you visit.'
  },
  {
    title: '8. Children\'s Privacy',
    content: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If we learn we have collected personal information from a child under 13, we will delete that information.'
  },
  {
    title: '9. Changes to This Policy',
    content: 'We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last Updated" date. You are advised to review this privacy policy periodically for any changes.'
  },
  {
    title: '10. International Data Transfers',
    content: 'Your information may be transferred to and processed in countries other than your country of residence. These countries may have different data protection laws. We will take appropriate steps to ensure your information receives an adequate level of protection.'
  }
]);
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
        <p class="text-lg text-gray-600 dark:text-gray-300">
          Last updated: {{ new Date().toLocaleDateString() }}
        </p>
      </div>

      <!-- Privacy Policy Content -->
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
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <div class="mt-4 space-y-2">
            <p class="flex items-center text-gray-600 dark:text-gray-300">
              <svg class="w-5 h-5 mr-2 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              privacy@fyndrx.com
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