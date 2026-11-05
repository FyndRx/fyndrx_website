<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { pharmacyService } from '@/services/pharmacyService';
import type { Pharmacy } from '@/models/Pharmacy';
import PharmacyCard from '@/components/PharmacyCard.vue';
import { useInView } from '@/composables/useInView';
import { useCarousel } from '@/composables/useCarousel';

const pharmacies = ref<Pharmacy[]>([]);
const isLoading = ref(true);
const sectionRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.1 });
const { canScrollLeft, canScrollRight, update: updateEdges, scrollByCard, fadeStyle } = useCarousel(containerRef);

const loadPharmacies = async () => {
  isLoading.value = true;
  try {
    const allPharmacies = await pharmacyService.getAllPharmacies();
    pharmacies.value = allPharmacies.slice(0, 6);
  } catch (err) {
    console.error('Error loading pharmacies:', err);
    pharmacies.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await loadPharmacies();
  await nextTick();
  updateEdges();
});
</script>

<script lang="ts">
export default {
  name: 'PharmacyList',
};
</script>

<template>
  <section ref="sectionRef" class="py-16 sm:py-20" :class="{ 'is-in': inView }">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Header with carousel controls -->
      <div class="flex flex-col gap-6 mb-10 md:flex-row md:items-end md:justify-between reveal">
        <div class="max-w-2xl">
          <h2 class="text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">
            Featured <span class="text-brand-500">Pharmacy</span> Partners
          </h2>
          <p class="mt-3 text-lg text-gray-600 sm:text-xl dark:text-gray-300">
            Browse our trusted and verified pharmacy partners across Ghana
          </p>
        </div>

        <div v-if="pharmacies.length > 1" class="hidden gap-2 md:flex">
          <button
            type="button"
            aria-label="Previous pharmacies"
            :disabled="!canScrollLeft"
            class="flex items-center justify-center transition duration-200 border rounded-full w-11 h-11 border-gray-200 bg-white/70 text-gray-600 backdrop-blur ease-out-quart hover:border-brand-500 hover:text-brand-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            @click="scrollByCard(-1)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next pharmacies"
            :disabled="!canScrollRight"
            class="flex items-center justify-center transition duration-200 border rounded-full w-11 h-11 border-gray-200 bg-white/70 text-gray-600 backdrop-blur ease-out-quart hover:border-brand-500 hover:text-brand-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
            @click="scrollByCard(1)"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading skeletons -->
      <div v-if="isLoading" class="flex gap-6 pb-8 overflow-hidden" aria-hidden="true">
        <div
          v-for="n in 3"
          :key="n"
          class="flex-none h-[440px] basis-[85%] sm:basis-[360px] md:basis-[385px] rounded-3xl bg-white/60 shadow-card ring-1 ring-white/70 animate-pulse motion-reduce:animate-none dark:bg-gray-800/40 dark:ring-white/10"
        ></div>
      </div>

      <!-- Empty / failed state -->
      <div
        v-else-if="pharmacies.length === 0"
        class="flex flex-col items-center px-6 py-14 text-center rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10"
      >
        <span class="flex items-center justify-center w-14 h-14 mb-4 rounded-2xl bg-brand-500/10 text-brand-500">
          <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </span>
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">We couldn't load our pharmacy partners</h3>
        <p class="max-w-md mt-2 text-gray-600 dark:text-gray-300">
          Browse the full directory instead, or try again in a moment.
        </p>
        <button
          type="button"
          class="mt-6 px-6 py-3 font-medium transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 ease-out-quart hover:bg-brand-500 hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-brand-300 dark:hover:text-white"
          @click="loadPharmacies"
        >
          Try again
        </button>
      </div>

      <!-- Pharmacy carousel. Bleeds to the screen edge on phones so cards can scroll flush. -->
      <div
        v-else
        ref="containerRef"
        class="pharmacy-scroller flex gap-6 pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-px-4 sm:scroll-px-6 lg:scroll-px-0"
        :style="fadeStyle"
        @scroll.passive="updateEdges"
      >
        <div
          v-for="(pharmacy, index) in pharmacies"
          :key="pharmacy.id"
          class="flex-none basis-[85%] sm:basis-[360px] md:basis-[385px] snap-start pharmacy-card-enter"
          :style="{ '--i': index }"
        >
          <PharmacyCard :pharmacy="pharmacy" />
        </div>
      </div>

      <!-- View all -->
      <div class="mt-6 text-center sm:mt-10 reveal" style="--d: 0.3s">
        <router-link
          to="/pharmacies"
          class="group inline-flex items-center justify-center gap-2 px-8 py-4 font-medium transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 bg-white/70 backdrop-blur ease-out-quart hover:bg-brand-500 hover:text-white hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:bg-white/5 dark:text-brand-300 dark:hover:text-white"
        >
          View All Pharmacies
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
        </router-link>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scroll-in via `.is-in` (useInView); cards stagger. Reduced motion shows everything at once. */
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

.pharmacy-card-enter {
  opacity: 0;
}

.is-in .pharmacy-card-enter {
  animation: card-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) calc(var(--i) * 80ms) both;
}

@keyframes card-enter {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Edge fades: only the side that still has content gets one (values set from scroll state) */
.pharmacy-scroller {
  -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--fl, 0px), #000 calc(100% - var(--fr, 0px)), transparent 100%);
  mask-image: linear-gradient(to right, transparent 0, #000 var(--fl, 0px), #000 calc(100% - var(--fr, 0px)), transparent 100%);
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .pharmacy-card-enter,
  .is-in .pharmacy-card-enter {
    opacity: 1;
    animation: none;
  }
}
</style>
