<script setup lang="ts">
import { onMounted } from 'vue';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import { useRouter } from 'vue-router';

const router = useRouter();
const { registerElement } = useScrollAnimation();

onMounted(() => {
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

const goToUploadPrescription = () => {
  router.push('/upload-prescription');
};

const goToPharmacies = () => {
  router.push('/pharmacies');
};
</script>

<script lang="ts">
export default {
  name: 'CTA',
}
</script>

<template>
  <section class="py-20 bg-gradient-to-br from-[#246BFD] via-[#5089FF] to-[#246BFD] relative overflow-hidden">
    <div class="absolute inset-0 opacity-10">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-[#FE9615] rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
      <div class="absolute -bottom-24 left-1/2 w-96 h-96 bg-white rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
    </div>

    <div class="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="text-center scroll-animate slide-up">
        <h2 class="mb-6 text-4xl font-medium text-white md:text-5xl">
          Ready to Experience the Future of <br class="hidden md:block" />
          <span class="text-[#FE9615]">Healthcare Shopping?</span>
        </h2>
        <p class="mb-10 text-xl text-blue-100 max-w-3xl mx-auto">
          Join thousands of satisfied customers who trust FyndRx for their medication needs. 
          Get started today and experience convenient, secure, and reliable pharmacy services.
        </p>

        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            @click="goToUploadPrescription"
            class="px-10 py-4 rounded-full bg-white text-[#246BFD] font-semibold hover:bg-gray-100 transition-all duration-300 shadow-2xl hover:shadow-white/20 hover:scale-105 flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span>Upload Prescription</span>
          </button>
          
          <button
            @click="goToPharmacies"
            class="px-10 py-4 rounded-full bg-transparent text-white font-semibold border-2 border-white hover:bg-white hover:text-[#246BFD] transition-all duration-300 hover:scale-105 flex items-center space-x-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <span>Browse Pharmacies</span>
          </button>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-8 mt-12 scroll-animate slide-up delay-300">
          <div class="flex items-center space-x-2">
            <svg class="w-6 h-6 text-[#FE9615]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div class="text-left">
              <p class="text-2xl font-bold text-white">4.9/5</p>
              <p class="text-sm text-blue-200">Customer Rating</p>
            </div>
          </div>
          
          <div class="hidden h-12 w-px bg-white/30 sm:block"></div>
          
          <div class="flex items-center space-x-2">
            <svg class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <div class="text-left">
              <p class="text-2xl font-bold text-white">100%</p>
              <p class="text-sm text-blue-200">Verified Pharmacies</p>
            </div>
          </div>
          
          <div class="hidden h-12 w-px bg-white/30 sm:block"></div>
          
          <div class="flex items-center space-x-2">
            <svg class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div class="text-left">
              <p class="text-2xl font-bold text-white">24/7</p>
              <p class="text-sm text-blue-200">Support Available</p>
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

@keyframes blob {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

.animate-blob {
  animation: blob 10s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>

