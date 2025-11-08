<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref<'medication' | 'pharmacy'>('medication');
const medicationQuery = ref('');
const pharmacyQuery = ref('');
const location = ref('');

const switchTab = (tab: 'medication' | 'pharmacy') => {
  activeTab.value = tab;
};

const searchMedication = () => {
  if (medicationQuery.value.trim()) {
    router.push(`/medications?search=${medicationQuery.value}`);
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
  <section class="py-16 bg-white dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mx-auto max-w-4xl">
        <div class="mb-12 text-center">
          <h2 class="mb-3 text-3xl font-semibold text-gray-900 dark:text-white">
            What are you looking for?
          </h2>
          <p class="text-lg text-gray-600 dark:text-gray-300">
            Search for medications or find pharmacies near you
          </p>
        </div>

        <div class="overflow-hidden bg-gray-50 rounded-3xl shadow-2xl dark:bg-gray-800">
          <div class="flex border-b border-gray-200 dark:border-gray-700">
            <button
              @click="switchTab('medication')"
              :class="[
                'flex-1 px-6 py-4 text-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2',
                activeTab === 'medication'
                  ? 'bg-white dark:bg-gray-900 text-[#246BFD] border-b-4 border-[#246BFD]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
              </svg>
              <span>Find Medication</span>
            </button>
            <button
              @click="switchTab('pharmacy')"
              :class="[
                'flex-1 px-6 py-4 text-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2',
                activeTab === 'pharmacy'
                  ? 'bg-white dark:bg-gray-900 text-[#246BFD] border-b-4 border-[#246BFD]'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              ]"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span>Find Pharmacy</span>
            </button>
          </div>

          <div class="p-8 bg-white dark:bg-gray-900">
            <div v-if="activeTab === 'medication'" class="space-y-6">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search by drug name, brand, or condition
                </label>
                <div class="relative">
                  <input
                    v-model="medicationQuery"
                    type="text"
                    placeholder="e.g., Amoxicillin, Paracetamol, or Diabetes"
                    class="w-full px-6 py-4 pr-32 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#246BFD] focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    @keyup.enter="searchMedication"
                  />
                  <button
                    @click="searchMedication"
                    class="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2.5 rounded-lg bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-all duration-300 flex items-center space-x-2"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                    <span>Search</span>
                  </button>
                </div>
              </div>

              <div class="flex flex-wrap gap-2">
                <span class="text-sm text-gray-600 dark:text-gray-400">Popular searches:</span>
                <button
                  v-for="term in ['Paracetamol', 'Amoxicillin', 'Ibuprofen', 'Omeprazole']"
                  :key="term"
                  @click="medicationQuery = term; searchMedication()"
                  class="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-[#246BFD] hover:text-white transition-all duration-200"
                >
                  {{ term }}
                </button>
              </div>

              <div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#246BFD]/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">Compare Prices</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Across pharmacies</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#246BFD]/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">Check Stock</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Real-time availability</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#246BFD]/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">Quick Order</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Easy checkout</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-6">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Pharmacy Name (Optional)
                  </label>
                  <input
                    v-model="pharmacyQuery"
                    type="text"
                    placeholder="e.g., HealthPlus Pharmacy"
                    class="w-full px-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#246BFD] focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    @keyup.enter="searchPharmacy"
                  />
                </div>
                <div>
                  <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Location
                  </label>
                  <input
                    v-model="location"
                    type="text"
                    placeholder="e.g., Accra, Kumasi"
                    class="w-full px-4 py-3 text-lg border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#246BFD] focus:border-transparent bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    @keyup.enter="searchPharmacy"
                  />
                </div>
              </div>

              <button
                @click="searchPharmacy"
                class="w-full px-6 py-4 rounded-xl bg-[#246BFD] text-white font-semibold text-lg hover:bg-[#5089FF] transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Find Pharmacies</span>
              </button>

              <div class="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FE9615]/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">Verified</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Licensed pharmacies</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FE9615]/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">Hours</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Operating times</p>
                  </div>
                </div>
                <div class="flex items-start space-x-3">
                  <div class="flex-shrink-0 w-10 h-10 rounded-lg bg-[#FE9615]/10 flex items-center justify-center">
                    <svg class="w-5 h-5 text-[#FE9615]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">Reviews</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-400">Customer ratings</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-8 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Need help? 
            <router-link to="/upload-prescription" class="text-[#246BFD] hover:underline font-medium">
              Upload your prescription
            </router-link>
            and we'll help you find what you need
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>

</style>


