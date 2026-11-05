<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInView } from '@/composables/useInView';

const router = useRouter();
const sectionRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.2 });

const goToUploadPrescription = () => router.push('/upload-prescription');
const goToPharmacies = () => router.push('/pharmacies');

const proof = [
  {
    value: '4.9/5',
    label: 'Customer Rating',
    icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z',
  },
  {
    value: '100%',
    label: 'Verified Pharmacies',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    value: '24/7',
    label: 'Support Available',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
];
</script>

<script lang="ts">
export default {
  name: 'CTA',
};
</script>

<template>
  <section
    ref="sectionRef"
    class="cta-panel relative overflow-hidden mx-4 sm:mx-6 lg:mx-auto lg:max-w-7xl my-10 py-14 sm:py-20 rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-brand-600 to-brand-500 shadow-float"
    :class="{ 'is-in': inView }"
  >
    <!-- Static light: a soft white bloom top-left and a warm one bottom-right (no moving parts) -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
      <div class="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full bg-white/15 blur-3xl"></div>
      <div class="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent-500/25 blur-3xl"></div>
    </div>

    <div class="relative px-5 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="text-center">
        <h2 class="mb-6 text-3xl font-medium text-white sm:text-4xl md:text-5xl reveal">
          Ready to Experience the Future of
          <span class="block text-accent-300">Healthcare Shopping?</span>
        </h2>
        <p class="max-w-3xl mx-auto mb-10 text-lg sm:text-xl text-white/85 reveal" style="--d: 0.08s">
          Join thousands of satisfied customers who trust FyndRx for their medication needs.
          Get started today and experience convenient, secure, and reliable pharmacy services.
        </p>

        <div class="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 reveal" style="--d: 0.16s">
          <button
            type="button"
            class="group inline-flex items-center justify-center w-full gap-2 px-10 py-4 font-semibold transition duration-200 bg-white rounded-full sm:w-auto text-brand-600 shadow-2xl ease-out-quart hover:-translate-y-0.5 hover:bg-gray-50 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            @click="goToUploadPrescription"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Prescription</span>
          </button>

          <button
            type="button"
            class="group inline-flex items-center justify-center w-full gap-2 px-10 py-4 font-semibold text-white transition duration-200 border-2 border-white/80 rounded-full sm:w-auto ease-out-quart hover:-translate-y-0.5 hover:bg-white hover:text-brand-600 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/50"
            @click="goToPharmacies"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Browse Pharmacies</span>
          </button>
        </div>

        <!-- Proof points: three equal columns that stay side by side on phones -->
        <dl class="grid grid-cols-3 max-w-2xl gap-2 mx-auto mt-12 sm:gap-8 reveal" style="--d: 0.28s">
          <div
            v-for="(item, index) in proof"
            :key="item.label"
            class="flex flex-col items-center gap-1.5 px-1 sm:flex-row sm:justify-center sm:gap-3"
            :class="index > 0 ? 'sm:border-l sm:border-white/25' : ''"
          >
            <svg class="w-6 h-6 text-accent-300 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
            <div class="flex flex-col-reverse text-center sm:text-left">
              <dt class="text-xs sm:text-sm text-white/75">{{ item.label }}</dt>
              <dd class="text-xl font-bold text-white sm:text-2xl">{{ item.value }}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scroll-in via `.is-in` (useInView), staggered by --d. */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s);
}

.is-in .reveal {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
