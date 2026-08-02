<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { usePharmacy } from '@/composables/usePharmacy';

import PharmacyViewSkeleton from '@/components/skeletons/PharmacyViewSkeleton.vue';
import NotFoundState from '@/components/NotFoundState.vue';
import AddReviewModal from '@/components/AddReviewModal.vue';
import PharmacyMap from '@/components/PharmacyMap.vue';

import PharmacyHeader from '@/components/Pharmacy/PharmacyHeader.vue';
import PharmacyTabs from '@/components/Pharmacy/PharmacyTabs.vue';
import PharmacyInventory from '@/components/Pharmacy/PharmacyInventory.vue';

const pharmacyState = usePharmacy();
provide('pharmacyState', pharmacyState);

onMounted(() => {
  pharmacyState.initializeData();
  const elements = document.querySelectorAll('.scroll-animate');
  elements.forEach((element) => pharmacyState.registerElement(element as HTMLElement));
});
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <!-- Loading State -->
    <PharmacyViewSkeleton v-if="pharmacyState.loading.value" />

    <!-- 404 Error State -->
    <NotFoundState 
      v-else-if="pharmacyState.error.value === '404'"
      title="Pharmacy Not Found"
      message="We couldn't find the pharmacy you're looking for. It may have been removed or you might have followed a broken link."
      actionText="Browse Pharmacies"
      :actionRoute="{ name: 'pharmacies' }"
    />

    <!-- General Error State -->
    <div v-else-if="pharmacyState.error.value" class="flex flex-col items-center justify-center min-h-[50vh]">
      <svg class="w-16 h-16 mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
      <p class="mb-4 text-xl font-medium text-gray-900 dark:text-white">{{ pharmacyState.error.value }}</p>
      <button 
        @click="pharmacyState.loadPharmacy()"
        class="px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors"
      >
        Try Again
      </button>
    </div>

    <!-- Pharmacy Content -->
    <div v-else-if="pharmacyState.pharmacy.value" class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Back Button -->
      <div class="mb-6">
        <button
          @click="pharmacyState.router.push({ name: 'pharmacies' })"
          class="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#246BFD] transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Pharmacies
        </button>
      </div>

      <!-- Hero Section -->
      <PharmacyHeader />

      <div class="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="lg:col-span-2 space-y-12">
          
          <!-- Information & Tabs -->
          <PharmacyTabs />

        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Compliance & Trust -->
          <div class="bg-gray-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden group">
             <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
             <h3 class="text-lg font-bold mb-6 relative z-10">Facility Trust</h3>
             
             <div class="space-y-6 relative z-10">
               <div v-if="pharmacyState.pharmacy.value.licenseNumber" class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-green-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">License Verified</p>
                   <p class="font-bold text-sm text-white tracking-tight">{{ pharmacyState.pharmacy.value.licenseNumber }}</p>
                 </div>
               </div>

               <div class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#246BFD]">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-12-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-12v6m0 0a3 3 0 0 0 3 3h3m0 0a3 3 0 0 0 3-3v-3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">Branch Network</p>
                   <p class="font-bold text-sm text-white tracking-tight">{{ pharmacyState.pharmacy.value.branchesCount || 1 }} Active Locations</p>
                 </div>
               </div>

               <!-- Digital address / location -->
               <div v-if="pharmacyState.pharmacy.value.digitalAddress || pharmacyState.pharmacy.value.city" class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">Location</p>
                   <p class="font-bold text-sm text-white tracking-tight">{{ [pharmacyState.pharmacy.value.city, pharmacyState.pharmacy.value.region].filter(Boolean).join(', ') || pharmacyState.pharmacy.value.address }}</p>
                   <p v-if="pharmacyState.pharmacy.value.digitalAddress" class="text-xs text-amber-400 font-mono mt-0.5">{{ pharmacyState.pharmacy.value.digitalAddress }}</p>
                 </div>
               </div>

               <div class="pt-5 border-t border-white/10">
                 <p class="text-xs font-medium text-gray-400 leading-relaxed">Ensuring you receive only genuine, certified medications through our verified pharmacy network.</p>
               </div>
             </div>
          </div>

          <!-- Help Widget -->
          <div class="bg-[#246BFD] p-6 sm:p-8 rounded-3xl text-white shadow-lg shadow-blue-500/10">
             <h3 class="text-lg font-bold mb-3">Need Help?</h3>
             <p class="text-sm font-medium mb-6 text-blue-100">Our support team is available to assist you with your orders and health inquiries.</p>
             <button class="w-full py-2.5 bg-white text-[#246BFD] rounded-xl font-bold text-sm hover:bg-blue-50 active:scale-95 transition-all">Start Chat</button>
          </div>
        </div>
      </div>

      <!-- Full Width Location Hub -->
      <div class="mt-16 bg-white dark:bg-gray-800 rounded-3xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 lg:p-12 space-y-8">
            <div class="space-y-4">
              <div class="flex items-center gap-3">
                <div class="w-1 h-8 bg-[#246BFD] rounded-full"></div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">Presence Hub</h2>
              </div>
              <p class="text-base text-gray-500 dark:text-gray-400 font-medium leading-relaxed">Visit us at our primary location or navigate through our extensive branch network across the region.</p>
            </div>

            <div class="space-y-6">
              <div class="flex items-center gap-5 p-6 bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-gray-100 dark:border-gray-700/50">
                 <div class="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-[#246BFD] flex-shrink-0">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-[#246BFD] mb-1">Primary Headquarters</p>
                   <p class="text-base font-bold text-gray-900 dark:text-white leading-tight">{{ pharmacyState.pharmacy.value.address }}</p>
                   <p v-if="pharmacyState.pharmacy.value.city || pharmacyState.pharmacy.value.region" class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ [pharmacyState.pharmacy.value.city, pharmacyState.pharmacy.value.region].filter(Boolean).join(', ') }}</p>
                   <p v-if="pharmacyState.pharmacy.value.digitalAddress" class="text-xs font-bold text-[#246BFD]/70 mt-1 tracking-wide">{{ pharmacyState.pharmacy.value.digitalAddress }}</p>
                 </div>
              </div>

              <div class="flex gap-4">
                <a 
                  :href="pharmacyState.pharmacy.value.location ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacyState.pharmacy.value.location.lat},${pharmacyState.pharmacy.value.location.lng}` : '#'" 
                  target="_blank"
                  class="flex-1 py-3 bg-[#246BFD] hover:bg-[#1a56d6] text-white rounded-xl text-sm font-bold text-center shadow-md hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95 transition-all"
                >
                  Launch Navigation
                </a>
              </div>
            </div>
          </div>

          <div class="h-[500px] lg:h-auto min-h-[400px] border-l border-gray-100 dark:border-gray-700/50">
            <PharmacyMap
              v-if="pharmacyState.pharmacy.value.location && (pharmacyState.pharmacy.value.location.lat || pharmacyState.pharmacy.value.location.lng)"
              :location="pharmacyState.pharmacy.value.location"
              :pharmacy-name="pharmacyState.pharmacy.value.name"
              class="w-full h-full"
            />
            <div v-else class="flex flex-col items-center justify-center w-full h-full bg-gray-50 dark:bg-gray-900/40 gap-4">
              <div class="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-gray-400">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              </div>
              <p class="text-sm font-medium text-gray-500 dark:text-gray-400 text-center px-6">Location map not available for this pharmacy.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width Inventory Explorer -->
      <PharmacyInventory />

    </div>

    <!-- Not Found State -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="p-8 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700/50 max-w-lg mx-auto">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-3">Pharmacy Not Found</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 font-medium mb-6 leading-relaxed">The pharmacy profile you're looking for might have been moved or removed from our network.</p>
        <button 
          @click="pharmacyState.router.push({ name: 'pharmacies' })"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-[#246BFD] text-white text-sm font-bold rounded-xl shadow-md hover:-translate-y-0.5 transition-all"
        >
          Explore All Pharmacies
        </button>
      </div>
    </div>

    <AddReviewModal
      :show="pharmacyState.showAddReviewModal.value"
      :target-type="'pharmacy'"
      :target-id="pharmacyState.pharmacy.value ? String(pharmacyState.pharmacy.value.id) : ''"
      :target-name="pharmacyState.pharmacy.value ? pharmacyState.pharmacy.value.name : ''"
      @close="pharmacyState.showAddReviewModal.value = false"
      @submit="pharmacyState.handleAddReview"
    />

  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

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