<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useSeoMeta } from '@/composables/useSeoMeta';
import { informationService, type HelpArticle } from '@/services/informationService';

const { registerElement } = useScrollAnimation();

useSeoMeta({
  title: 'Frequently Asked Questions | FyndRx',
  description: 'Find answers to common questions about FyndRx — how it works, ordering, prescriptions, delivery, payments, and more. We are here to help.',
  keywords: 'FyndRx FAQ, frequently asked questions, online pharmacy help, how does FyndRx work, prescription upload help, delivery questions',
  ogType: 'website',
});

const activeIndex = ref<number | null>(null);
const allFaqs = ref<HelpArticle[]>([]);
const loading = ref(true);

const categories = ref([
  {
    id: 'General',
    name: 'General',
    icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    id: 'Orders & Delivery',
    name: 'Orders & Delivery',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
  },
  {
    id: 'Prescriptions',
    name: 'Prescriptions',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    id: 'Payments & Security',
    name: 'Payments & Security',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
  }
]);

const selectedCategory = ref('General');

const staticFaqs: HelpArticle[] = [
  // General
  { id: 1, slug: 'what-is-fyndrx', is_faq: true, title: 'What is FyndRx?', content: 'FyndRx is Ghana\'s most convenient online pharmacy platform. You can search for medications, compare prices across verified partner pharmacies, upload prescriptions, book teleconsultations with licensed doctors, and have your medications delivered to your doorstep — all in one place.', category: 'General' },
  { id: 2, slug: 'fyndrx-availability', is_faq: true, title: 'Is FyndRx available across Ghana?', content: 'Yes. FyndRx partners with licensed pharmacies across multiple cities in Ghana including Accra, Kumasi, Tamale, Takoradi, and more. Coverage is expanding continuously. You can use the Pharmacy Finder to locate partners near you.', category: 'General' },
  { id: 3, slug: 'account-required', is_faq: true, title: 'Do I need an account to use FyndRx?', content: 'You can browse medications and pharmacies without an account. However, placing orders, uploading prescriptions, booking consultations, and tracking orders requires a free FyndRx account. Creating an account takes less than a minute.', category: 'General' },
  { id: 4, slug: 'is-fyndrx-safe', is_faq: true, title: 'Is FyndRx safe to use?', content: 'Yes. All partner pharmacies are licensed by the Ghana Pharmacy Council and the Food and Drugs Authority (FDA). Your personal and health data is encrypted and handled in compliance with the Ghana Data Protection Act, 2012 (Act 843). We never sell your data.', category: 'General' },
  // Orders & Delivery
  { id: 5, slug: 'how-to-place-order', is_faq: true, title: 'How do I place an order?', content: 'Search for your medication, select your preferred pharmacy, add it to your cart, and proceed to checkout. Choose between home delivery and pharmacy pickup. Complete payment and you\'ll receive an order confirmation immediately.', category: 'Orders & Delivery' },
  { id: 6, slug: 'delivery-time', is_faq: true, title: 'How long does delivery take?', content: 'Delivery timelines depend on your location and the pharmacy. Most orders within the same city are delivered within 2–4 hours. Same-day delivery is available at participating pharmacies. You will receive estimated delivery time at checkout.', category: 'Orders & Delivery' },
  { id: 7, slug: 'track-order', is_faq: true, title: 'How do I track my order?', content: 'Once your order is confirmed, you can track it in real-time from your FyndRx dashboard under "My Orders". You will also receive SMS and push notifications at each stage: order confirmed, dispensed, out for delivery, and delivered.', category: 'Orders & Delivery' },
  { id: 8, slug: 'wrong-or-missing-order', is_faq: true, title: 'What if my order doesn\'t arrive or is incorrect?', content: 'Contact our support team within 48 hours via the Help Center, email support@fyndrx.com, or call us on +233 53 051 0839. For incorrect items, we will arrange a replacement at no cost. Please do not return opened medication packaging before contacting us.', category: 'Orders & Delivery' },
  // Prescriptions
  { id: 9, slug: 'prescription-required', is_faq: true, title: 'Which medications require a prescription?', content: 'Prescription-only medicines (POM) — such as antibiotics, controlled pain medications, certain antimalarials, and chronic disease medications — require a valid prescription from a licensed Ghanaian medical practitioner before they can be dispensed.', category: 'Prescriptions' },
  { id: 10, slug: 'upload-prescription', is_faq: true, title: 'How do I upload my prescription?', content: 'Go to "Upload Prescription" from the home page or your dashboard. Take a clear photo or scan of your prescription and upload it. A pharmacist will verify it, typically within 1–3 hours. You will be notified once it\'s approved and ready to fulfill.', category: 'Prescriptions' },
  { id: 11, slug: 'prescription-privacy', is_faq: true, title: 'Is my prescription data kept private?', content: 'Absolutely. Your prescription images and medical information are encrypted, stored securely, and are only shared with the pharmacist or doctor fulfilling or reviewing your order. We never share health data with third parties for advertising purposes.', category: 'Prescriptions' },
  { id: 12, slug: 'prescription-refill', is_faq: true, title: 'Can I get a refill through FyndRx?', content: 'Yes. Your prescription history is saved in your account under "My Prescriptions". For repeat prescriptions, you can request a refill directly from your history. Your prescribing doctor or our teleconsultation service can issue a new prescription if yours has expired.', category: 'Prescriptions' },
  // Payments & Security
  { id: 13, slug: 'payment-methods', is_faq: true, title: 'What payment methods does FyndRx accept?', content: 'We accept MTN Mobile Money, Vodafone Cash, AirtelTigo Money, Visa, Mastercard, and bank transfers. Payment is required at the time of order placement to confirm your order. All transactions are processed through regulated, secure payment gateways.', category: 'Payments & Security' },
  { id: 14, slug: 'safe-to-pay-online', is_faq: true, title: 'Is it safe to pay online on FyndRx?', content: 'Yes. We use TLS/SSL encryption for all transactions and do not store card or mobile money credentials on our servers. Payments are processed by PCI-DSS compliant third-party gateways. Look for the padlock icon in your browser address bar to confirm a secure connection.', category: 'Payments & Security' },
  { id: 15, slug: 'refund-policy', is_faq: true, title: 'Can I get a refund?', content: 'Refunds are available for orders where the wrong item was delivered, items arrived damaged, or the pharmacy could not fulfil the order. Due to health and safety regulations, opened medication packaging cannot be returned. Submit refund requests within 48 hours to support@fyndrx.com.', category: 'Payments & Security' },
  { id: 16, slug: 'payment-problem', is_faq: true, title: 'How do I report a payment problem?', content: 'If you were charged but did not receive a confirmation, or if a payment failed but your account was debited, contact us immediately at support@fyndrx.com with your transaction reference. We resolve payment disputes within 3–5 business days.', category: 'Payments & Security' },
];

onMounted(async () => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));

  try {
    const fetched = await informationService.getFAQs();
    allFaqs.value = fetched.length > 0 ? fetched : staticFaqs;
  } catch (error) {
    console.error('Failed to load FAQs:', error);
    allFaqs.value = staticFaqs;
  } finally {
    loading.value = false;
  }
});

const toggleFAQ = (index: number) => {
  activeIndex.value = activeIndex.value === index ? null : index;
};

const filteredFAQs = computed(() => {
  if (!selectedCategory.value) return allFaqs.value;
  return allFaqs.value.filter(faq => faq.category === selectedCategory.value);
});

const filterByCategory = (category: string) => {
  selectedCategory.value = category;
  activeIndex.value = null;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="py-20 bg-gradient-to-br from-[#246BFD] to-[#5089FF]">
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="mb-4 text-5xl font-bold text-white">
            Frequently Asked Questions
          </h1>
          <p class="text-xl text-blue-100">
            Find answers to common questions about FyndRx
          </p>
        </div>
      </div>
    </div>

    <div class="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="flex flex-col gap-8 lg:flex-row">
        <div class="lg:w-64 flex-shrink-0">
          <div class="sticky top-24 p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Categories</h3>
            <nav class="space-y-2">
              <button
                v-for="category in categories"
                :key="category.id"
                @click="filterByCategory(category.id)"
                :class="[
                  'w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  selectedCategory === category.id
                    ? 'bg-[#246BFD] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                ]"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="category.icon"></path>
                </svg>
                <span class="font-medium">{{ category.name }}</span>
              </button>
            </nav>
          </div>
        </div>

        <div class="flex-1">
          <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#246BFD]"></div>
          </div>

          <div v-else-if="filteredFAQs.length === 0" class="text-center py-12 text-gray-500">
            No FAQs found for this category.
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="(faq, index) in filteredFAQs"
              :key="faq.id"
              class="scroll-animate slide-up visible"
            >
              <div class="overflow-hidden transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl">
                <button
                  @click="toggleFAQ(index)"
                  class="flex items-center justify-between w-full p-6 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span class="text-lg font-medium text-gray-900 dark:text-white pr-8">
                    {{ faq.title }}
                  </span>
                  <svg
                    class="flex-shrink-0 w-6 h-6 text-[#246BFD] transition-transform duration-300"
                    :class="{ 'rotate-180': activeIndex === index }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                
                <div v-show="activeIndex === index" class="overflow-hidden transition-all duration-300">
                  <div class="px-6 pb-6 text-gray-600 dark:text-gray-300 prose dark:prose-invert max-w-none" v-html="faq.content">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-12 p-8 bg-gradient-to-br from-[#246BFD]/10 to-[#FE9615]/10 dark:from-[#246BFD]/20 dark:to-[#FE9615]/20 rounded-2xl">
            <h3 class="mb-2 text-2xl font-semibold text-center text-gray-900 dark:text-white">
              Still have questions?
            </h3>
            <p class="mb-6 text-center text-gray-600 dark:text-gray-300">
              Our support team is here to help you 24/7
            </p>
            <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <router-link
                to="/help"
                class="inline-flex items-center px-8 py-3 space-x-2 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                <span>Help Center</span>
              </router-link>
              <router-link
                to="/contact"
                class="inline-flex items-center px-8 py-3 space-x-2 rounded-full bg-white text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>Contact Us</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}

.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}
</style>












