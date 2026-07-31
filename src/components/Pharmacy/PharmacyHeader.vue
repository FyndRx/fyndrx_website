<script setup lang="ts">
import LazyImage from '@/components/LazyImage.vue';
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;
</script>

<template>
  <div v-if="pharmacyState.pharmacy.value" class="mb-12 overflow-hidden bg-white shadow-2xl dark:bg-gray-800 rounded-[2rem]">
    <div class="relative h-[450px]">
      <div class="absolute inset-0">
        <LazyImage
          :src="pharmacyState.pharmacy.value.image"
          :alt="pharmacyState.pharmacy.value.name"
          aspectRatio="landscape"
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
      </div>
      
      <!-- Badges Overlay -->
      <div class="absolute top-8 right-8 flex gap-3">
        <span
          class="px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-white/20 shadow-xl"
          :class="pharmacyState.pharmacy.value.isOpen 
            ? 'bg-green-500/90 text-white' 
            : 'bg-red-500/90 text-white'"
        >
          <span class="inline-block w-2 h-2 mr-2 rounded-full animate-pulse bg-white"></span>
          {{ pharmacyState.pharmacy.value.isOpen ? 'Open Now' : 'Closed' }}
        </span>
        <span v-if="pharmacyState.pharmacy.value.services.some(s => s.slug === '24/7' || s.slug === '24-7' || s.name === '24/7')" class="px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-md bg-[#246BFD]/90 text-white border border-white/20 shadow-xl">
           24/7 Service
        </span>
      </div>

      <!-- Pharmacy Info Overlay -->
      <div class="absolute bottom-0 left-0 right-0 p-10 text-white">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div class="flex-1 space-y-4">
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-white shadow-2xl overflow-hidden shrink-0">
                <LazyImage 
                  :src="pharmacyState.pharmacy.value.logo || '/images/pharmacies/default-pharmacy.jpg'" 
                  :alt="pharmacyState.pharmacy.value.name" 
                  aspectRatio="square"
                  className="w-full h-full object-contain" 
                />
              </div>
              <h1 class="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                {{ pharmacyState.pharmacy.value.name }}
              </h1>
            </div>
            
            <div class="flex flex-wrap items-center gap-6">
              <div class="flex items-center gap-2 text-gray-200">
                <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span class="font-medium tracking-tight">{{ pharmacyState.pharmacy.value.address }}<span v-if="pharmacyState.pharmacy.value.city || pharmacyState.pharmacy.value.region" class="text-gray-300"> · {{ [pharmacyState.pharmacy.value.city, pharmacyState.pharmacy.value.region].filter(Boolean).join(', ') }}</span></span>
              </div>
              
              <div class="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-2 px-5 border border-white/10 shadow-xl">
                <div class="flex items-center gap-1">
                  <svg v-for="i in 5" :key="i" class="w-5 h-5" :class="i <= Math.round(pharmacyState.pharmacy.value.rating) ? 'text-yellow-400' : 'text-gray-400/50'" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <span class="font-black text-xl tracking-tighter">{{ pharmacyState.pharmacy.value.rating.toFixed(1) }}</span>
                <span class="text-sm font-bold text-gray-300 border-l border-white/20 pl-4 uppercase tracking-widest">{{ pharmacyState.pharmacy.value.totalReviews || pharmacyState.pharmacy.value.reviews?.length || 0 }} reviews</span>
              </div>
            </div>
          </div>
          
          <div class="flex gap-4">
             <button 
              @click="pharmacyState.showAddReviewModal.value = true"
              class="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-2xl"
            >
              Rate this Facility
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
