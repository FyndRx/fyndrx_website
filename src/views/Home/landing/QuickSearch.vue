<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { medicationService } from '@/services/medicationService';
import SearchAutocomplete from '@/components/SearchAutocomplete.vue';

const router = useRouter();
const authStore = useAuthStore();
type Tab = 'medication' | 'pharmacy' | 'consultation';
const activeTab = ref<Tab>('medication');
const medicationQuery = ref('');
const pharmacyQuery = ref('');
const location = ref('');
const popularSearches = ref<string[]>([]);

onMounted(async () => {
  const topSearches = await medicationService.getTopSearches();
  if (topSearches && topSearches.length > 0) {
    // Map to query strings and take the top 4
    popularSearches.value = topSearches.slice(0, 4).map((item: any) => item.query);
  } else {
    // Fallback if API returns empty
    popularSearches.value = ['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Omeprazole'];
  }
});

const switchTab = (tab: Tab) => {
  activeTab.value = tab;
};

// Segmented control model: order drives the sliding thumb position.
const tabs: { id: Tab; label: string; icon: string }[] = [
  {
    id: 'medication',
    label: 'Find Medication',
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
  },
  {
    id: 'pharmacy',
    label: 'Find Pharmacy',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
  },
  {
    id: 'consultation',
    label: 'Consultation',
    icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
  },
];

const activeIndex = computed(() => tabs.findIndex((t) => t.id === activeTab.value));

// WAI-ARIA tabs: arrow keys move between tabs, Home/End jump to the ends.
const onTabKeydown = (event: KeyboardEvent) => {
  const last = tabs.length - 1;
  let next = activeIndex.value;
  if (event.key === 'ArrowRight') next = activeIndex.value === last ? 0 : activeIndex.value + 1;
  else if (event.key === 'ArrowLeft') next = activeIndex.value === 0 ? last : activeIndex.value - 1;
  else if (event.key === 'Home') next = 0;
  else if (event.key === 'End') next = last;
  else return;
  event.preventDefault();
  switchTab(tabs[next].id);
  document.getElementById(`qs-tab-${tabs[next].id}`)?.focus();
};

const benefitTone = {
  brand: 'bg-brand-500/10 text-brand-500',
  accent: 'bg-accent-500/10 text-accent-600 dark:text-accent-400',
} as const;

const benefits: Record<Tab, { tone: keyof typeof benefitTone; items: { title: string; text: string; icon: string }[] }> = {
  medication: {
    tone: 'brand',
    items: [
      { title: 'Compare Prices', text: 'Across pharmacies', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { title: 'Check Stock', text: 'Real-time availability', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
      { title: 'Quick Order', text: 'Easy checkout', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    ],
  },
  pharmacy: {
    tone: 'accent',
    items: [
      { title: 'Verified', text: 'Licensed pharmacies', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
      { title: 'Hours', text: 'Operating times', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { title: 'Reviews', text: 'Customer ratings', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    ],
  },
  consultation: {
    tone: 'accent',
    items: [
      { title: '24/7 Access', text: 'Doctors available anytime', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { title: 'Prescriptions', text: 'Digital prescriptions sent instantly', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
      { title: 'Secure Chat', text: 'Private and encrypted', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
    ],
  },
};

const goToConsultation = () =>
  router.push({ name: authStore.isAuthenticated ? 'create-consultation' : 'public-create-consultation' });

// Shared field styling so every input on this card matches.
const fieldClass =
  'w-full px-5 py-3.5 text-lg rounded-full border border-gray-200 bg-white/80 text-gray-900 placeholder-gray-400 shadow-inner transition focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 dark:border-white/10 dark:bg-gray-900/60 dark:text-white dark:placeholder-gray-500';

const searchMedication = (query?: string) => {
  const finalQuery = typeof query === 'string' ? query : medicationQuery.value;
  if (finalQuery.trim()) {
    router.push(`/medications?search=${encodeURIComponent(finalQuery.trim())}`);
  }
};

const searchPharmacy = () => {
  if (pharmacyQuery.value.trim() || location.value.trim()) {
    router.push(`/pharmacies?pharmacy=${pharmacyQuery.value}&location=${location.value}`);
  }
};
</script>

<script lang="ts">
export default {
  name: 'QuickSearch',
}
</script>

<template>
  <section class="py-16">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="mb-10 text-center">
          <h2 class="mb-3 text-3xl font-semibold text-gray-900 sm:text-4xl dark:text-white">
            What are you looking for?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Search for medications or find pharmacies near you
          </p>
        </div>

        <!-- No overflow-hidden here: the autocomplete dropdown must be able to escape the card. -->
        <div class="p-3 sm:p-4 rounded-[2rem] bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-xl dark:bg-gray-800/60 dark:ring-white/10">
          <!-- Segmented control with a sliding thumb -->
          <div
            role="tablist"
            aria-label="What would you like to do?"
            class="relative grid grid-cols-3 p-1.5 rounded-full bg-gray-900/5 dark:bg-white/5"
            @keydown="onTabKeydown"
          >
            <span
              aria-hidden="true"
              class="absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/3)] rounded-full transition-[transform,background-color,box-shadow] duration-300 ease-out-quart motion-reduce:transition-none"
              :class="activeTab === 'consultation' ? 'bg-accent-500 shadow-glow-accent' : 'bg-brand-500 shadow-glow-brand'"
              :style="{ transform: `translateX(${activeIndex * 100}%)` }"
            ></span>

            <button
              v-for="tab in tabs"
              :id="`qs-tab-${tab.id}`"
              :key="tab.id"
              type="button"
              role="tab"
              :aria-selected="activeTab === tab.id"
              :aria-controls="`qs-panel-${tab.id}`"
              :tabindex="activeTab === tab.id ? 0 : -1"
              class="relative z-10 flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium transition-colors duration-200 rounded-full sm:flex-row sm:gap-2.5 sm:px-4 sm:text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              :class="activeTab === tab.id ? 'text-white' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'"
              @click="switchTab(tab.id)"
            >
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" :d="tab.icon" />
              </svg>
              <span>{{ tab.label }}</span>
            </button>
          </div>

          <!-- Panels -->
          <div class="px-2 pt-8 pb-3 sm:px-6">
            <Transition name="qs-panel" mode="out-in">
              <!-- Medication -->
              <div
                v-if="activeTab === 'medication'"
                id="qs-panel-medication"
                key="medication"
                role="tabpanel"
                aria-labelledby="qs-tab-medication"
                class="space-y-6"
              >
                <div>
                  <label class="block mb-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Search by drug name, brand, or condition
                  </label>
                  <SearchAutocomplete
                    v-model="medicationQuery"
                    placeholder="e.g., Amoxicillin, Paracetamol, or Diabetes"
                    search-type="medications"
                    @search="searchMedication"
                    inputClass="bg-white/80 dark:bg-gray-900/60 pr-14 shadow-inner"
                  />
                </div>

                <div v-if="popularSearches.length > 0" class="flex flex-wrap items-center gap-2">
                  <span class="text-sm text-gray-500 dark:text-gray-400">Popular searches</span>
                  <button
                    v-for="term in popularSearches"
                    :key="term"
                    type="button"
                    class="px-3.5 py-1.5 text-sm font-medium text-brand-600 capitalize transition duration-200 rounded-full bg-brand-500/10 ease-out-quart hover:bg-brand-500 hover:text-white hover:-translate-y-0.5 active:translate-y-0 dark:text-brand-300 dark:hover:text-white"
                    @click="medicationQuery = term; searchMedication(term)"
                  >
                    {{ term }}
                  </button>
                </div>
              </div>

              <!-- Pharmacy -->
              <div
                v-else-if="activeTab === 'pharmacy'"
                id="qs-panel-pharmacy"
                key="pharmacy"
                role="tabpanel"
                aria-labelledby="qs-tab-pharmacy"
                class="space-y-6"
              >
                <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label for="qs-pharmacy-name" class="block mb-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Pharmacy Name (Optional)
                    </label>
                    <input
                      id="qs-pharmacy-name"
                      v-model="pharmacyQuery"
                      type="text"
                      placeholder="e.g., HealthPlus Pharmacy"
                      :class="fieldClass"
                      @keyup.enter="searchPharmacy"
                    />
                  </div>
                  <div>
                    <label for="qs-pharmacy-location" class="block mb-2.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Location
                    </label>
                    <input
                      id="qs-pharmacy-location"
                      v-model="location"
                      type="text"
                      placeholder="e.g., Accra, Kumasi"
                      :class="fieldClass"
                      @keyup.enter="searchPharmacy"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  class="inline-flex items-center justify-center w-full gap-2 px-6 py-4 text-lg font-semibold text-white transition duration-200 rounded-full bg-brand-500 shadow-glow-brand ease-out-quart hover:bg-brand-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                  @click="searchPharmacy"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Find Pharmacies</span>
                </button>
              </div>

              <!-- Consultation -->
              <div
                v-else
                id="qs-panel-consultation"
                key="consultation"
                role="tabpanel"
                aria-labelledby="qs-tab-consultation"
                class="flex flex-col items-center py-2 text-center"
              >
                <div class="flex items-center justify-center w-16 h-16 mb-5 rounded-2xl bg-accent-500 text-white shadow-glow-accent">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="tabs[2].icon" />
                  </svg>
                </div>
                <h3 class="mb-2 text-2xl font-semibold text-gray-900 dark:text-white">Speak with a Licensed Doctor</h3>
                <p class="max-w-md mx-auto mb-7 text-lg text-gray-600 dark:text-gray-300">
                  Get professional medical advice, prescriptions, and follow-ups from the comfort of your home.
                </p>
                <button
                  type="button"
                  class="inline-flex items-center justify-center w-full gap-2 px-8 py-4 text-lg font-semibold text-white transition duration-200 rounded-full sm:w-auto bg-accent-500 shadow-glow-accent ease-out-quart hover:bg-accent-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30"
                  @click="goToConsultation"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Book Consultation Now</span>
                </button>
              </div>
            </Transition>

            <!-- Benefits (data-driven, follows the active tab) -->
            <ul class="grid grid-cols-1 gap-4 pt-6 mt-8 border-t md:grid-cols-3 border-gray-900/5 dark:border-white/10">
              <li v-for="item in benefits[activeTab].items" :key="`${activeTab}-${item.title}`" class="flex items-center gap-3">
                <span class="flex items-center justify-center w-10 h-10 shrink-0 rounded-xl" :class="benefitTone[benefits[activeTab].tone]">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
                  </svg>
                </span>
                <span class="leading-tight">
                  <span class="block font-medium text-gray-900 dark:text-white">{{ item.title }}</span>
                  <span class="block text-sm text-gray-600 dark:text-gray-400">{{ item.text }}</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <!-- Help line -->
        <p class="mt-8 text-sm text-center text-gray-600 dark:text-gray-400">
          Need help?
          <router-link to="/upload-prescription" class="font-medium text-brand-500 hover:underline">Upload your prescription</router-link>
          or
          <router-link :to="{ name: 'public-create-consultation' }" class="font-medium text-accent-600 hover:underline dark:text-accent-400">Book a consultation</router-link>
          and we'll help you find what you need
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tab panels: quick fade + 8px rise on enter, fade on leave. Fast so it never blocks input. */
.qs-panel-enter-active {
  transition: opacity 0.22s cubic-bezier(0.25, 1, 0.5, 1), transform 0.22s cubic-bezier(0.25, 1, 0.5, 1);
}
.qs-panel-leave-active {
  transition: opacity 0.12s ease-in;
}
.qs-panel-enter-from {
  opacity: 0;
  transform: translateY(8px);
}
.qs-panel-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .qs-panel-enter-active,
  .qs-panel-leave-active {
    transition: none;
  }
}
</style>
