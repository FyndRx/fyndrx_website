<script setup lang="ts">
import { onMounted, provide } from 'vue';
import { usePharmacy } from '@/composables/usePharmacy';
import { useChatStore } from '@/store/chat';

import PharmacyViewSkeleton from '@/components/skeletons/PharmacyViewSkeleton.vue';
import NotFoundState from '@/components/NotFoundState.vue';
import AddReviewModal from '@/components/AddReviewModal.vue';
import PharmacyMap from '@/components/PharmacyMap.vue';

import PharmacyHeader from '@/components/Pharmacy/PharmacyHeader.vue';
import PharmacyTabs from '@/components/Pharmacy/PharmacyTabs.vue';
import PharmacyInventory from '@/components/Pharmacy/PharmacyInventory.vue';

const pharmacyState = usePharmacy();
provide('pharmacyState', pharmacyState);

const chatStore = useChatStore();

onMounted(() => {
  pharmacyState.initializeData();
});
</script>

<template>
  <div class="relative min-h-screen pt-24 pb-16 isolate overflow-x-clip">
    <!-- Same pastel canvas as the rest of the site -->
    <div class="absolute inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <div class="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-accent-50/70 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950"></div>
      <div class="absolute top-[4%] -right-72 h-[40rem] w-[40rem] rounded-full bg-brand-200/40 blur-[130px] dark:bg-brand-500/10"></div>
      <div class="absolute top-[40%] -left-72 h-[40rem] w-[40rem] rounded-full bg-accent-200/40 blur-[130px] dark:bg-transparent"></div>
      <div class="absolute top-[78%] -right-72 h-[40rem] w-[40rem] rounded-full bg-brand-200/35 blur-[130px] dark:bg-brand-500/8"></div>
    </div>
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
        class="px-6 py-3 font-medium text-white rounded-full shadow-glow-brand transition duration-200 bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
      >
        Try Again
      </button>
    </div>

    <!-- Pharmacy Content -->
    <div v-else-if="pharmacyState.pharmacy.value" class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Back Button -->
      <div class="mb-6">
        <button
          type="button"
          @click="pharmacyState.router.push({ name: 'pharmacies' })"
          class="inline-flex items-center gap-2 py-2 pl-3 pr-4 text-sm font-medium text-gray-700 transition duration-200 rounded-full ring-1 bg-white/70 ring-gray-200 backdrop-blur ease-out-quart dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 hover:text-brand-600 hover:ring-brand-500 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Back to Pharmacies
        </button>
      </div>

      <!-- Hero Section -->
      <PharmacyHeader />

      <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <!-- Main Content -->
        <div class="space-y-8 lg:col-span-2">
          
          <!-- Information & Tabs -->
          <PharmacyTabs />

        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Compliance & Trust -->
          <div class="relative p-6 overflow-hidden text-white rounded-3xl shadow-float bg-gradient-to-br from-brand-950 via-brand-900 to-gray-900 sm:p-8 group">
             <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full transition-transform group-hover:scale-110"></div>
             <h3 class="relative z-10 mb-6 text-lg font-semibold">Facility Trust</h3>
             
             <div class="space-y-6 relative z-10">
               <div v-if="pharmacyState.pharmacy.value.licenseNumber" class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-green-400">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">License Verified</p>
                   <p class="font-semibold text-sm text-white">{{ pharmacyState.pharmacy.value.licenseNumber }}</p>
                 </div>
               </div>

               <div class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-brand-300">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M18 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-12-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-12v6m0 0a3 3 0 0 0 3 3h3m0 0a3 3 0 0 0 3-3v-3" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">Branch Network</p>
                   <p class="font-semibold text-sm text-white">{{ pharmacyState.pharmacy.value.branchesCount || 1 }} Active Locations</p>
                 </div>
               </div>

               <!-- Digital address / location -->
               <div v-if="pharmacyState.pharmacy.value.digitalAddress || pharmacyState.pharmacy.value.city" class="flex items-start gap-4">
                 <div class="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-accent-400 flex-shrink-0">
                   <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                 </div>
                 <div>
                   <p class="text-xs font-semibold text-gray-400">Location</p>
                   <p class="font-semibold text-sm text-white">{{ [pharmacyState.pharmacy.value.city, pharmacyState.pharmacy.value.region].filter(Boolean).join(', ') || pharmacyState.pharmacy.value.address }}</p>
                   <p v-if="pharmacyState.pharmacy.value.digitalAddress" class="text-xs text-accent-300 font-mono mt-0.5">{{ pharmacyState.pharmacy.value.digitalAddress }}</p>
                 </div>
               </div>

               <div class="pt-5 border-t border-white/10">
                 <p class="text-xs font-medium text-gray-400 leading-relaxed">Ensuring you receive only genuine, certified medications through our verified pharmacy network.</p>
               </div>
             </div>
          </div>

          <!-- Help Widget -->
          <div class="p-6 text-white rounded-3xl shadow-glow-brand bg-gradient-to-br from-brand-500 to-brand-400 sm:p-8">
             <h3 class="mb-3 text-lg font-semibold">Need Help?</h3>
             <p class="mb-6 text-sm text-brand-50">Our support team is available to assist you with your orders and health inquiries.</p>
             <button @click="chatStore.open()" type="button" class="w-full py-3 text-sm font-semibold transition duration-200 bg-white rounded-full text-brand-600 ease-out-quart hover:bg-brand-50 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60">Start Chat</button>
          </div>
        </div>
      </div>

      <!-- Full Width Location Hub -->
      <div class="mt-12 overflow-hidden rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
        <div class="grid grid-cols-1 lg:grid-cols-2">
          <div class="p-6 sm:p-8 lg:p-12 space-y-8">
            <div class="space-y-4">
              <h2 class="text-2xl font-semibold leading-tight text-gray-900 md:text-3xl dark:text-white">Find us</h2>
              <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">Visit our primary location, or explore the branch network across the region.</p>
            </div>

            <div class="space-y-6">
              <div class="flex items-center gap-5 p-5 rounded-2xl bg-white/60 ring-1 ring-gray-200/70 dark:bg-white/5 dark:ring-white/10">
                 <div class="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-500 flex-shrink-0">
                   <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
                 </div>
                 <div>
                   <p class="text-sm font-medium text-brand-600 dark:text-brand-300 mb-1">Primary location</p>
                   <p class="text-base font-semibold text-gray-900 dark:text-white leading-tight">{{ pharmacyState.pharmacy.value.address }}</p>
                   <p v-if="pharmacyState.pharmacy.value.city || pharmacyState.pharmacy.value.region" class="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{{ [pharmacyState.pharmacy.value.city, pharmacyState.pharmacy.value.region].filter(Boolean).join(', ') }}</p>
                   <p v-if="pharmacyState.pharmacy.value.digitalAddress" class="text-xs font-medium text-brand-600/80 dark:text-brand-300 mt-1">{{ pharmacyState.pharmacy.value.digitalAddress }}</p>
                 </div>
              </div>

              <div class="flex gap-4">
                <a 
                  :href="pharmacyState.pharmacy.value.location ? `https://www.google.com/maps/dir/?api=1&destination=${pharmacyState.pharmacy.value.location.lat},${pharmacyState.pharmacy.value.location.lng}` : '#'" 
                  target="_blank"
                  class="flex-1 py-3 text-sm font-semibold text-center text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                >
                  Get directions
                </a>
              </div>
            </div>
          </div>

          <div class="h-[420px] lg:h-auto min-h-[380px] p-3 lg:p-4 lg:pl-0">
            <PharmacyMap
              v-if="pharmacyState.pharmacy.value.location && (pharmacyState.pharmacy.value.location.lat || pharmacyState.pharmacy.value.location.lng)"
              :location="pharmacyState.pharmacy.value.location"
              :pharmacy-name="pharmacyState.pharmacy.value.name"
              :is-open="pharmacyState.pharmacy.value.isOpen"
              :delivery-available="pharmacyState.pharmacy.value.deliveryInfo?.available ?? false"
              class="w-full h-full"
            />
            <div v-else class="flex flex-col items-center justify-center w-full h-full rounded-2xl bg-white/60 ring-1 ring-gray-200/70 dark:bg-white/5 dark:ring-white/10 gap-4">
              <div class="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center text-brand-500">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400 text-center px-6">Location map not available for this pharmacy.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width Inventory Explorer -->
      <PharmacyInventory />

    </div>

    <!-- Not Found State -->
    <div v-else class="flex flex-col items-center justify-center min-h-[60vh]">
      <div class="p-8 mx-auto max-w-lg text-center rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:ring-white/10">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>
        <h2 class="mb-3 text-2xl font-semibold text-gray-900 dark:text-white">Pharmacy Not Found</h2>
        <p class="mb-6 text-sm leading-relaxed text-gray-500 dark:text-gray-400">The pharmacy profile you're looking for might have been moved or removed from our network.</p>
        <button 
          @click="pharmacyState.router.push({ name: 'pharmacies' })"
          class="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 hover:-translate-y-0.5 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
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
