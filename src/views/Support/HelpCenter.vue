<script setup lang="ts">
import { ref, computed } from 'vue';
import TextInput from '@/components/TextInput.vue';

const faqs = ref([
  {
    question: 'How do I order medications?',
    answer: 'You can order medications through our app or website. Simply search for your medication, add it to cart, and proceed to checkout. You can also upload your prescription for prescription medications.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept various payment methods including mobile money (MTN, Vodafone, AirtelTigo), credit/debit cards, and bank transfers.'
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery times vary by location. In major cities, we offer same-day delivery. For other areas, delivery typically takes 1-3 business days.'
  },
  {
    question: 'Can I track my order?',
    answer: 'Yes, you can track your order through our app or website. You\'ll receive real-time updates on your order status and delivery progress.'
  },
  {
    question: 'What is your return policy?',
    answer: 'We accept returns within 7 days of delivery for unopened and undamaged products. Prescription medications cannot be returned for safety reasons.'
  }
]);

const activeFaq = ref<number | null>(null);
const searchQuery = ref('');

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index;
};

const filteredFaqs = computed(() => {
  if (!searchQuery.value) return faqs.value;
  const query = searchQuery.value.toLowerCase();
  return faqs.value.filter(faq => 
    faq.question.toLowerCase().includes(query) || 
    faq.answer.toLowerCase().includes(query)
  );
});
</script>

<template>
  <div class="min-h-screen py-12 mt-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-12 text-center">
        <h1 class="mb-4 text-4xl font-bold text-gray-900 dark:text-white">Help Center</h1>
        <p class="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Find answers to frequently asked questions and get support for your FyndRx experience.
        </p>
      </div>

      <!-- Search Bar -->
      <div class="max-w-2xl mx-auto mb-12">
        <TextInput
          v-model="searchQuery"
          type="search"
          placeholder="Search for help..."
          icon="search"
        />
      </div>

      <!-- FAQ Section -->
      <div class="max-w-3xl mx-auto">
        <h2 class="mb-6 text-2xl font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
        <div class="space-y-4">
          <div
            v-for="(faq, index) in filteredFaqs"
            :key="index"
            class="transition-all duration-300 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700 hover:shadow-md"
          >
            <button
              @click="toggleFaq(index)"
              class="w-full px-6 py-4 text-left focus:outline-none"
            >
              <div class="flex items-center justify-between">
                <span class="text-lg font-medium text-gray-900 dark:text-white">{{ faq.question }}</span>
                <svg
                  class="w-5 h-5 text-gray-500 transition-transform duration-300 transform dark:text-gray-400"
                  :class="{ 'rotate-180': activeFaq === index }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            <div
              v-show="activeFaq === index"
              class="px-6 pb-4 text-gray-600 dark:text-gray-300"
            >
              {{ faq.answer }}
            </div>
          </div>
        </div>
      </div>

      <!-- Contact Support -->
      <div class="max-w-3xl p-6 mx-auto mt-12 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
        <h2 class="mb-4 text-2xl font-semibold text-gray-900 dark:text-white">Still Need Help?</h2>
        <p class="mb-6 text-gray-600 dark:text-gray-300">
          Our support team is here to help you. Contact us through any of the following channels:
        </p>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-[#246BFD] dark:text-[#5089FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Email Support</h3>
              <p class="text-gray-600 dark:text-gray-300">support@fyndrx.com</p>
            </div>
          </div>
          <div class="flex items-start space-x-4">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-[#246BFD] dark:text-[#5089FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">Phone Support</h3>
              <p class="text-gray-600 dark:text-gray-300">+233 24 399 6999</p>
            </div>
          </div>
        </div>
      </div>
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