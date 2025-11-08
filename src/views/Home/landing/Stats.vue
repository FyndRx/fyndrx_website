<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';

const { registerElement } = useScrollAnimation();

onMounted(() => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

const stats = ref([
  {
    id: 1,
    value: '10,000+',
    label: 'Happy Customers',
    description: 'Trust FyndRx for their medication needs',
    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
  },
  {
    id: 2,
    value: '100+',
    label: 'Verified Pharmacies',
    description: 'Licensed and trusted partners',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
  },
  {
    id: 3,
    value: '50K+',
    label: 'Orders Delivered',
    description: 'Successfully completed orders',
    icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4'
  },
  {
    id: 4,
    value: '24/7',
    label: 'Customer Support',
    description: 'Always here to help you',
    icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
  }
]);
</script>

<script lang="ts">
export default {
  name: 'Stats',
}
</script>

<template>
  <section class="py-20 bg-gradient-to-br from-[#246BFD] to-[#5089FF] relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
    </div>

    <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-16 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-white">
          Our Impact in <span class="text-[#FE9615]">Numbers</span>
        </h2>
        <p class="text-xl text-blue-100">
          Join thousands of satisfied customers who trust FyndRx for their healthcare needs
        </p>
      </div>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="(stat, index) in stats"
          :key="stat.id"
          class="scroll-animate slide-up"
          :class="`delay-${(index + 1) * 100}`"
        >
          <div class="p-8 text-center transition-all duration-300 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 hover:scale-105">
            <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-white/20 rounded-2xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="stat.icon"></path>
              </svg>
            </div>
            
            <h3 class="mb-2 text-4xl font-bold text-white">
              {{ stat.value }}
            </h3>
            
            <p class="mb-1 text-lg font-medium text-blue-100">
              {{ stat.label }}
            </p>
            
            <p class="text-sm text-blue-200">
              {{ stat.description }}
            </p>
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



