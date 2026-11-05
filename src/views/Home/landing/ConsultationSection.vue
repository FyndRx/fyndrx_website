<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useInView } from '@/composables/useInView';
import LazyImage from '@/components/LazyImage.vue';
import doctorImage from '@/assets/images/telemedicine_doctor.png';

const router = useRouter();
const authStore = useAuthStore();
const sectionRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.2 });

const features = [
  {
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    title: '24/7 Availability',
    description: 'Submit your health assessment anytime, day or night.',
  },
  {
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    title: 'Instant Prescriptions',
    description: 'Get digital prescriptions sent directly to your phone.',
  },
  {
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
    title: 'Secure & Private',
    description: 'Your health data is encrypted and 100% confidential.',
  },
];

const bookConsultation = () =>
  router.push({ name: authStore.isAuthenticated ? 'create-consultation' : 'public-create-consultation' });
</script>

<script lang="ts">
export default {
  name: 'ConsultationSection',
};
</script>

<template>
  <section ref="sectionRef" class="py-16 sm:py-20" :class="{ 'is-in': inView }">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="grid items-center grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
        <!-- Image column (below the copy on small screens) -->
        <div class="relative order-2 lg:order-1 reveal-left">
          <!-- Orange offset blocks: the hero's photo treatment, owned here by orange -->
          <div class="absolute hidden sm:block -z-10 rounded-[2rem] bg-accent-500 -bottom-4 -right-4 h-2/3 w-2/3" aria-hidden="true"></div>
          <div class="absolute hidden sm:block -z-10 rounded-[2rem] bg-brand-500 -top-4 -left-4 h-1/2 w-1/2" aria-hidden="true"></div>

          <div class="relative overflow-hidden rounded-[2rem] shadow-float group">
            <LazyImage
              :src="doctorImage"
              alt="Doctor on digital consultation"
              aspectRatio="landscape"
              className="w-full h-[320px] sm:h-[440px] lg:h-[580px] object-cover transform transition-transform duration-700 ease-out-quart group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
          </div>
        </div>

        <!-- Content column -->
        <div class="order-1 lg:order-2 reveal-right">
          <h2 class="mb-5 text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white">
            Expert Medical Advice
            <span class="block text-transparent bg-clip-text bg-gradient-to-r from-accent-600 to-accent-500">
              From Comfort of Home
            </span>
          </h2>
          <p class="mb-8 text-lg text-gray-600 dark:text-gray-300">
            Skip the waiting room. Connect with licensed doctors within minutes for diagnosis, treatment plans, and prescriptions. Quality healthcare has never been this accessible.
          </p>

          <!-- One frosted card, three rows -->
          <ul class="mb-10 divide-y rounded-3xl bg-white/70 backdrop-blur-md shadow-card ring-1 ring-white/70 divide-gray-900/5 dark:bg-gray-800/60 dark:ring-white/10 dark:divide-white/10">
            <li
              v-for="(feature, index) in features"
              :key="feature.title"
              class="flex items-center gap-4 p-4 sm:p-5 reveal-row"
              :style="{ '--i': index }"
            >
              <span class="flex items-center justify-center w-12 h-12 text-white shrink-0 rounded-2xl bg-gradient-to-br from-accent-500 to-accent-400 shadow-glow-accent">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon" />
                </svg>
              </span>
              <div>
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  {{ feature.title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400">
                  {{ feature.description }}
                </p>
              </div>
            </li>
          </ul>

          <div class="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <button
              type="button"
              class="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white transition duration-200 rounded-full bg-accent-500 shadow-glow-accent ease-out-quart hover:bg-accent-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30"
              @click="bookConsultation"
            >
              <span>Book Consultation</span>
              <svg
                class="w-5 h-5 transition-transform duration-200 ease-out-quart group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </button>
            <button
              type="button"
              class="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold transition duration-200 border-2 rounded-full text-accent-700 border-accent-500 bg-white/70 backdrop-blur ease-out-quart hover:bg-accent-500 hover:text-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30 dark:bg-white/5 dark:text-accent-400 dark:hover:text-white"
              @click="router.push('/telehealth')"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scroll-in, triggered once via `.is-in` (useInView). Image slides from the left, copy from the right,
   list rows stagger. Reduced motion shows everything at once. */
.reveal-left,
.reveal-right,
.reveal-row {
  opacity: 0;
  transition:
    opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.7s cubic-bezier(0.25, 1, 0.5, 1);
}

.reveal-left {
  transform: translateX(-28px);
}

.reveal-right {
  transform: translateX(28px);
  transition-delay: 0.1s;
}

.reveal-row {
  transform: translateY(10px);
  transition-delay: calc(0.35s + var(--i) * 0.1s);
}

.is-in .reveal-left,
.is-in .reveal-right,
.is-in .reveal-row {
  opacity: 1;
  transform: none;
}

@media (max-width: 1023px) {
  /* Single column: slide vertically instead of sideways so nothing starts off-screen */
  .reveal-left,
  .reveal-right {
    transform: translateY(20px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal-left,
  .reveal-right,
  .reveal-row {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
