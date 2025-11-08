<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useScrollAnimation } from '@/composables/useScrollAnimation';
import LazyImage from '@/components/LazyImage.vue';

const router = useRouter();
const heroImage = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2940&auto=format&fit=crop';

const { registerElement } = useScrollAnimation();
const isVisible = ref(false);
const particles = ref<Array<{ id: number; x: number; y: number; size: number; duration: number; delay: number }>>([]);

const createParticles = () => {
  const particleCount = 30;
  particles.value = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 20 + 15,
    delay: Math.random() * 5
  }));
};

const scrollToContent = () => {
  const heroHeight = window.innerHeight;
  window.scrollTo({
    top: heroHeight,
    behavior: 'smooth'
  });
};

const goToMedications = () => {
  router.push({ name: 'medications' });
};

const goToUploadPrescription = () => {
  router.push({ name: 'upload-prescription' });
};

onMounted(() => {
  isVisible.value = true;
  createParticles();
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => registerElement(element as HTMLElement));
});

onUnmounted(() => {
  particles.value = [];
});
</script>

<script lang="ts">
  export default {
    name: 'Hero',
  }
</script>

<template>
  <div class="relative flex items-center min-h-screen">
    <!-- Animated Particles -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        v-for="particle in particles"
        :key="particle.id"
        class="absolute rounded-full particle"
        :style="{
          left: `${particle.x}%`,
          top: `${particle.y}%`,
          width: `${particle.size}px`,
          height: `${particle.size}px`,
          animationDuration: `${particle.duration}s`,
          animationDelay: `${particle.delay}s`
        }"
      ></div>
    </div>

    <!-- Background Elements with 3D Effect -->
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-0 left-0 w-96 h-96 bg-[#246BFD]/20 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-blob"></div>
      <div class="absolute top-0 right-0 w-96 h-96 bg-[#FE9615]/20 rounded-full filter blur-3xl transform translate-x-1/3 -translate-y-1/3 animate-blob animation-delay-2000"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-[#FE9615]/20 rounded-full filter blur-3xl transform translate-x-1/2 translate-y-1/2 animate-blob animation-delay-4000"></div>
      <div class="absolute bottom-0 left-0 w-96 h-96 bg-[#246BFD]/20 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/3 animate-blob animation-delay-3000"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="grid items-center grid-cols-1 gap-8 lg:gap-12 lg:grid-cols-2">
        <!-- Left Column -->
        <div class="mt-20 space-y-6 md:mt-0 md:space-y-8">
          <h1 class="text-4xl font-medium leading-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white scroll-animate slide-in-left">
            Your Trusted 
            <span class="text-[#246BFD]">ePharmacy</span> 
            Platform
          </h1>
          <p class="text-lg font-light text-gray-600 sm:text-xl delay-200 dark:text-gray-300 scroll-animate slide-in-left">
            Order medications online with ease. Search for drugs, upload prescriptions, compare prices across pharmacies, and get your medications delivered to your doorstep.
          </p>
          <div class="flex flex-col gap-4 delay-300 sm:flex-row scroll-animate slide-in-left">
            <button 
              @click="goToMedications"
              class="px-8 py-4 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 hover:shadow-lg hover:shadow-[#246BFD]/20 hover-lift"
            >
              Shop Medications
            </button>
            <button 
              @click="goToUploadPrescription"
              class="px-8 py-4 rounded-full bg-white text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300 hover-lift"
            >
              Upload Prescription
            </button>
          </div>

          <!-- App Store Badges -->
          <div class="flex flex-col gap-3 pt-4 md:pt-6 scroll-animate slide-in-left delay-350">
            <p class="text-sm font-medium text-gray-600 dark:text-gray-300">Download our mobile app</p>
            <div class="flex flex-wrap gap-3">
              <a 
                href="https://play.google.com/store/apps/details?id=com.aby.fyndrx" 
                target="_blank"
                rel="noopener noreferrer"
                class="group hover-lift"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" 
                  alt="Get it on Google Play" 
                  class="h-10 sm:h-12 transition-all duration-300 group-hover:scale-105"
                />
              </a>
              <a 
                href="#" 
                class="relative group hover-lift"
              >
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" 
                  alt="Download on the App Store" 
                  class="h-10 sm:h-12 transition-all duration-300 opacity-50 grayscale group-hover:scale-105"
                />
                <span class="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs font-semibold text-white bg-black/60 rounded-lg backdrop-blur-sm">
                  Coming Soon
                </span>
              </a>
            </div>
          </div>

          <div class="flex flex-col gap-4 pt-4 sm:flex-row sm:items-center sm:gap-8 md:pt-6 scroll-animate slide-in-left delay-400">
            <div class="flex items-center space-x-2 hover-scale">
              <div class="w-12 h-12 rounded-full bg-[#FE9615]/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-gray-900 dark:text-white">100+</p>
                <p class="font-light text-gray-600 dark:text-gray-300">Verified Pharmacies</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 hover-scale">
              <div class="w-12 h-12 rounded-full bg-[#246BFD]/10 flex items-center justify-center">
                <svg class="w-6 h-6 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <div>
                <p class="text-2xl font-medium text-gray-900 dark:text-white">Fast</p>
                <p class="font-light text-gray-600 dark:text-gray-300">Delivery</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="relative delay-300 scroll-animate slide-in-right">
          <!-- Hero Image with LazyImage -->
          <div class="relative w-full h-[350px] sm:h-[450px] md:h-[500px] rounded-2xl overflow-hidden hover:shadow-2xl hover-scale">
            <LazyImage
              :src="heroImage"
              alt="Black male doctor providing healthcare services"
              aspectRatio="landscape"
              className="w-full h-full object-cover"
            />
          </div>
          
          <!-- Floating Elements - Hidden on mobile for cleaner look -->
          <div class="absolute -top-8 -right-8 w-32 h-32 bg-[#FE9615]/10 rounded-full filter blur-xl hover-rotate hidden md:block"></div>
          <div class="absolute -bottom-8 -left-8 w-32 h-32 bg-[#246BFD]/10 rounded-full filter blur-xl hover-rotate hidden md:block"></div>
        </div>
      </div>
    </div>

    <!-- Scroll Indicator - Hidden on Mobile -->
    <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 hidden md:block">
      <button
        @click="scrollToContent"
        class="flex flex-col items-center space-y-2 text-gray-600 dark:text-gray-300 hover:text-[#246BFD] dark:hover:text-[#246BFD] transition-colors group"
        aria-label="Scroll down"
      >
        <span class="text-sm font-medium animate-bounce">Scroll Down</span>
        <div class="scroll-indicator">
          <div class="scroll-indicator-dot"></div>
        </div>
        <svg
          class="w-6 h-6 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>

/* Particle Animation */
.particle {
  background: #246BFD;
  opacity: 0.3;
  animation: particleFloat infinite ease-in-out;
}

@keyframes particleFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.3;
  }
  25% {
    transform: translate(20px, -30px) scale(1.2);
    opacity: 0.5;
  }
  50% {
    transform: translate(-15px, -60px) scale(0.8);
    opacity: 0.2;
  }
  75% {
    transform: translate(30px, -40px) scale(1.1);
    opacity: 0.4;
  }
}

/* Blob Animation */
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

.animation-delay-3000 {
  animation-delay: 3s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}

/* Scroll Indicator */
.scroll-indicator {
  width: 30px;
  height: 50px;
  border: 2px solid currentColor;
  border-radius: 25px;
  position: relative;
}

.scroll-indicator-dot {
  width: 6px;
  height: 6px;
  background: currentColor;
  border-radius: 50%;
  position: absolute;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  animation: scrollDot 2s infinite;
}

@keyframes scrollDot {
  0% {
    top: 8px;
    opacity: 1;
  }
  50% {
    top: 28px;
    opacity: 0.5;
  }
  100% {
    top: 8px;
    opacity: 1;
  }
}

/* Component-specific animations */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.floating {
  animation: float 3s ease-in-out infinite;
}

/* 3D Transform Effects */
.hover-scale {
  transition: transform 0.3s ease-in-out;
}

.hover-scale:hover {
  transform: scale(1.05) perspective(1000px) rotateY(5deg);
}

.hover-lift {
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.hover-lift:hover {
  transform: translateY(-5px) perspective(1000px) rotateX(5deg);
}

.hover-rotate {
  transition: transform 0.5s ease-in-out;
}

.hover-rotate:hover {
  transform: rotate(180deg);
}
</style> 