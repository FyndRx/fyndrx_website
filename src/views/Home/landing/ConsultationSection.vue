<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import LazyImage from '@/components/LazyImage.vue';

const router = useRouter();
const { registerElement } = useScrollAnimation();

const doctorImage = 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?q=80&w=2670&auto=format&fit=crop';

const features = [
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: '24/7 Availability',
    description: 'Submit your health assessment anytime, day or night.'
  },
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Instant Prescriptions',
    description: 'Get digital prescriptions sent directly to your phone.'
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Secure & Private',
    description: 'Your health data is encrypted and 100% confidential.'
  }
];

onMounted(() => {
  const elements = document.querySelectorAll('.consultation-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});
</script>

<script lang="ts">
export default {
    name: 'ConsultationSection',
}
</script>

<template>
  <section class="py-20 overflow-hidden bg-white dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
        
        <!-- Image Column -->
        <div class="relative order-2 lg:order-1 consultation-animate slide-in-left">
          <div class="relative rounded-3xl overflow-hidden shadow-2xl group">
            <LazyImage
              :src="doctorImage"
              alt="Doctor on digital consultation"
              aspectRatio="landscape"
              className="w-full h-[400px] lg:h-[600px] object-cover transform transition-transform duration-700 group-hover:scale-105"
            />
            
            <!-- Overlay Content Removed -->
          </div>

          <!-- Decorative Elements -->
          <div class="absolute -top-12 -left-12 w-64 h-64 bg-[#FE9615]/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <div class="absolute -bottom-12 -right-12 w-64 h-64 bg-[#246BFD]/10 rounded-full blur-3xl -z-10 animate-pulse delay-700"></div>
        </div>

        <!-- Content Column -->
        <div class="order-1 lg:order-2 consultation-animate slide-in-right">
          <span class="inline-block px-4 py-1 mb-6 text-sm font-semibold text-[#FE9615] bg-[#FE9615]/10 rounded-full">
            Telemedicine
          </span>
          <h2 class="mb-6 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            Expert Medical Advice <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#FE9615] to-[#FFB75E]">
              From Comfort of Home
            </span>
          </h2>
          <p class="mb-8 text-lg text-gray-600 dark:text-gray-300">
            Skip the waiting room. Connect with licensed doctors within minutes for diagnosis, treatment plans, and prescriptions. Quality healthcare has never been this accessible.
          </p>

          <div class="space-y-6 mb-10">
            <div 
              v-for="(feature, index) in features" 
              :key="index"
              class="flex items-start space-x-4 p-4 rounded-xl transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div class="flex-shrink-0">
                <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-[#FE9615]/10 text-[#FE9615]">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="feature.icon"></path>
                  </svg>
                </div>
              </div>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ feature.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ feature.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4">
            <button
              @click="router.push({ name: 'public-create-consultation' })"
              class="px-8 py-4 text-lg font-semibold text-white transition-all duration-300 bg-[#FE9615] rounded-full shadow-lg hover:bg-[#e88813] hover:shadow-xl hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <span>Book Consultation</span>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
              </svg>
            </button>
            <button
              @click="router.push('/telehealth')"
              class="px-8 py-4 text-lg font-semibold text-[#FE9615] transition-all duration-300 bg-transparent border-2 border-[#FE9615] rounded-full hover:bg-[#FE9615] hover:text-white flex items-center justify-center"
            >
              Learn More
            </button>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>
