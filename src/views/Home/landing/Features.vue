<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const { registerElement } = useScrollAnimation();

onMounted(() => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

const features = ref([
  {
    id: 1,
    title: 'Smart Drug Search',
    description: 'Search for medications by name, brand, or medical condition. Get instant results with prices from nearby pharmacies.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    title: 'Prescription Upload',
    description: 'Upload your prescription securely. Our partner pharmacists verify and process it quickly for accurate fulfillment.',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 3,
    title: 'Real-time Order Tracking',
    description: 'Track your order from processing to delivery. Get SMS and push notifications at every step of the journey.',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    color: 'from-orange-500 to-red-500'
  },
  {
    id: 4,
    title: 'Secure Checkout',
    description: 'Multiple payment options with bank-grade security. Direct payments to pharmacies with instant confirmation.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 5,
    title: 'Flexible Delivery',
    description: 'Choose pharmacy pickup or home delivery. Select the option that works best for your schedule and location.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 6,
    title: 'Verified Pharmacies',
    description: 'All partner pharmacies are verified and licensed. Shop with confidence knowing you\'re getting authentic medications.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'from-teal-500 to-cyan-500'
  }
]);
</script>

<script lang="ts">
export default {
  name: 'Features',
}
</script>

<template>
  <section class="py-20 bg-white dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Why Choose <span class="text-[#246BFD]">FyndRx</span>?
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Your complete ePharmacy solution with everything you need for convenient healthcare
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="(feature, index) in features"
          :key="feature.id"
          class="group scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <div class="relative h-full p-8 transition-all duration-300 bg-white border border-gray-100 dark:bg-gray-800 dark:border-gray-700 rounded-2xl hover:shadow-2xl hover:-translate-y-2">
            <div class="absolute inset-0 bg-gradient-to-br opacity-0 rounded-2xl group-hover:opacity-5 transition-opacity" :class="feature.color"></div>
            
            <div class="relative">
              <div class="flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br" :class="feature.color">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon"></path>
                </svg>
              </div>

              <h3 class="mb-3 text-xl font-semibold text-gray-900 dark:text-white">
                {{ feature.title }}
              </h3>
              
              <p class="text-gray-600 dark:text-gray-300">
                {{ feature.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
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












