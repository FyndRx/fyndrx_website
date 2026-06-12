<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { pharmacyService } from '@/services/pharmacyService';
import type { Pharmacy } from '@/models/Pharmacy';
import PharmacyCard from '@/components/PharmacyCard.vue';

const pharmacies = ref<Pharmacy[]>([]);
const sectionRef = ref<HTMLElement | null>(null);
const containerRef = ref<HTMLElement | null>(null);
let scrollObserver: IntersectionObserver | null = null;

const observeScrollElements = () => {
  if (scrollObserver) scrollObserver.disconnect();
  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver?.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
  );
  sectionRef.value?.querySelectorAll('.scroll-animate').forEach(el => {
    scrollObserver!.observe(el);
  });
};

const loadPharmacies = async () => {
  try {
    const allPharmacies = await pharmacyService.getAllPharmacies();
    pharmacies.value = allPharmacies.slice(0, 6);
  } catch (err) {
    console.error('Error loading pharmacies:', err);
    pharmacies.value = [];
  }
};

onMounted(async () => {
  await loadPharmacies();
  await nextTick();
  observeScrollElements();
});

onUnmounted(() => {
  scrollObserver?.disconnect();
});

const scrollLeft = () => {
  if (containerRef.value) {
    containerRef.value.scrollBy({
      left: -400,
      behavior: 'smooth'
    });
  }
};

const scrollRight = () => {
  if (containerRef.value) {
    containerRef.value.scrollBy({
      left: 400,
      behavior: 'smooth'
    });
  }
};
</script>

<script lang="ts">
  export default {
    name: 'PharmacyList',
  }
</script>

<template>
    <section ref="sectionRef" class="py-20 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      
      <div class="mb-12 text-center scroll-animate slide-up">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          Featured <span class="text-[#246BFD]">Pharmacy</span> Partners
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Browse our trusted and verified pharmacy partners across Ghana
        </p>
      </div>

      <!-- Horizontal Scroll Container -->
      <div class="relative">
        <!-- Scroll Buttons -->
        <button 
          @click="scrollLeft"
          class="absolute left-0 z-10 flex items-center justify-center w-12 h-12 -translate-x-6 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          @click="scrollRight"
          class="absolute right-0 z-10 flex items-center justify-center w-12 h-12 translate-x-6 -translate-y-1/2 bg-white rounded-full shadow-lg top-1/2 hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700"
        >
          <svg class="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <!-- Pharmacy List -->
        <div 
          ref="containerRef"
          class="flex gap-6 px-2 pb-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        >
          <div
            v-for="(pharmacy, index) in pharmacies"
            :key="pharmacy.id"
            class="flex-none w-[360px] md:w-[385px] pharmacy-card-enter snap-center"
            :style="{ animationDelay: `${index * 80}ms` }"
          >
            <PharmacyCard :pharmacy="pharmacy" />
          </div>
        </div>
      </div>
            <!-- View All Button -->
      <div class="mt-12 text-center delay-500 scroll-animate slide-up">
        <router-link 
          to="/pharmacies"
          class="inline-block px-8 py-4 rounded-full bg-white dark:bg-gray-800 text-[#246BFD] font-medium border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white transition-all duration-300"
        >
          View All Pharmacies
        </router-link>
      </div>
    </div>
</section>
</template>

<style scoped>
/* Static elements (section header, view-all button) use JS-triggered .visible */
.scroll-animate {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-out, transform 0.6s ease-out;
}
.scroll-animate.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Pharmacy cards: pure CSS keyframe, no JS dependency */
@keyframes cardEnter {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.pharmacy-card-enter {
  animation: cardEnter 0.45s ease-out both;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scrollbar-hide {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Snap scrolling */
.snap-x {
  scroll-snap-type: x mandatory;
}

.snap-center {
  scroll-snap-align: center;
}
</style> 