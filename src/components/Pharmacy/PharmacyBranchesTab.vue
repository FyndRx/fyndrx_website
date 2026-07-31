<script setup lang="ts">
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;
</script>

<template>
  <div v-if="pharmacyState.pharmacy.value" class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

    <!-- Loading skeleton -->
    <div v-if="pharmacyState.branchesLoading.value" class="space-y-4">
      <div v-for="n in (pharmacyState.pharmacy.value.branchesCount || 2)" :key="n" class="rounded-3xl bg-white dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700/50">
        <div class="h-24 bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
        <div class="p-6 space-y-3">
          <div class="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse w-1/2"></div>
          <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
          <div class="h-3 bg-gray-100 dark:bg-gray-700 rounded animate-pulse w-1/3"></div>
        </div>
      </div>
    </div>

    <div v-else-if="pharmacyState.branches.value.length > 0" class="space-y-5">
      <div
        v-for="branch in pharmacyState.branches.value"
        :key="branch.id"
        class="rounded-3xl bg-white dark:bg-gray-800 shadow-lg border border-gray-100 dark:border-gray-700/50 hover:shadow-xl transition-all duration-500 overflow-hidden"
      >
        <!-- Branch banner -->
        <div
          class="relative h-28 overflow-hidden"
          :class="!branch.bannerImage ? 'bg-gradient-to-r from-[#246BFD]/20 to-[#246BFD]/5 dark:from-[#246BFD]/10 dark:to-transparent' : ''"
        >
          <img v-if="branch.bannerImage" :src="branch.bannerImage" class="w-full h-full object-cover" :alt="branch.branchName" />
          <div v-if="branch.bannerImage" class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

          <!-- Identity: pharmacy logo + branch name -->
          <div class="absolute inset-0 flex items-end px-5 pb-3 gap-3">
            <div class="w-10 h-10 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img v-if="pharmacyState.pharmacy.value.logo" :src="pharmacyState.pharmacy.value.logo" class="w-full h-full object-cover" :alt="pharmacyState.pharmacy.value.name" />
              <svg v-else class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
            </div>
            <div class="min-w-0">
              <h4 class="text-base font-black leading-tight truncate" :class="branch.bannerImage ? 'text-white drop-shadow' : 'text-gray-900 dark:text-white'">{{ branch.branchName }}</h4>
              <div class="flex items-center gap-2 mt-0.5">
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full backdrop-blur-sm"
                  :class="branch.isOpen ? 'bg-emerald-100/90 text-emerald-700' : 'bg-red-100/90 text-red-700'"
                >
                  <span class="w-1.5 h-1.5 rounded-full" :class="branch.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
                  {{ branch.isOpen ? 'Open Now' : 'Closed' }}
                </span>
                <span v-if="branch.isActive === false" class="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100/90 text-gray-500">Inactive</span>
              </div>
            </div>
            <!-- Rating badge in card banner -->
            <div v-if="(branch.rating ?? 0) > 0" class="ml-auto flex-shrink-0 flex items-center gap-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-2.5 py-1.5">
              <svg class="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              <span class="text-xs font-bold text-gray-800 dark:text-white">{{ branch.rating?.toFixed(1) }}</span>
            </div>
          </div>
        </div>

        <!-- Branch body -->
        <div class="p-5 space-y-4">

          <!-- Description -->
          <p v-if="branch.description" class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{{ branch.description }}</p>

          <!-- Info grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <!-- Address -->
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
              <p class="font-semibold text-gray-900 dark:text-white leading-snug">{{ branch.address }}</p>
              <p v-if="branch.city || branch.region" class="text-xs font-medium text-[#246BFD] mt-0.5">
                {{ [branch.city, branch.region].filter(Boolean).join(', ') }}
              </p>
              <p v-if="branch.digitalAddress" class="text-xs font-mono text-gray-400 mt-0.5">{{ branch.digitalAddress }}</p>
            </div>
            <!-- Contact -->
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Contact</p>
              <a :href="`tel:${branch.phone}`" class="font-semibold text-gray-900 dark:text-white hover:text-[#246BFD] transition-colors block">{{ branch.phone }}</a>
              <p v-if="branch.managerName" class="text-xs text-gray-400 mt-0.5">Manager: {{ branch.managerName }}</p>
            </div>
            <!-- Languages -->
            <div v-if="(branch.languages ?? []).length > 0">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Languages</p>
              <p class="font-semibold text-gray-900 dark:text-white text-sm">{{ branch.languages!.join(' · ') }}</p>
            </div>
            <!-- Delivery -->
            <div v-if="branch.deliveryInfo">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery</p>
              <p v-if="branch.deliveryInfo.available" class="font-semibold text-[#246BFD] text-sm">
                From GHS {{ branch.deliveryInfo.baseFee?.toFixed(0) ?? '–' }}
                <span v-if="branch.deliveryInfo.radiusKm" class="text-gray-400 font-normal text-xs"> · {{ branch.deliveryInfo.radiusKm }} km</span>
              </p>
              <p v-else class="text-sm text-gray-500">Pickup only</p>
            </div>
          </div>

          <!-- Capability pills -->
          <div class="flex flex-wrap gap-1.5">
            <span v-if="branch.acceptsOnlinePrescriptions" class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30">
              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Online Rx
            </span>
            <span v-for="s in (branch.specialStorage ?? [])" :key="s" class="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-cyan-50 text-cyan-700 border border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400">{{ s }}</span>
          </div>

          <!-- Branch services chips -->
          <div v-if="(branch.services ?? []).length > 0">
            <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Services</p>
            <div class="flex flex-wrap gap-1.5">
              <span
                v-for="s in branch.services!.slice(0, 5)"
                :key="s.slug || s.id"
                class="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-[#246BFD]/8 text-[#246BFD] border border-[#246BFD]/15 dark:bg-[#246BFD]/10 dark:text-[#5089FF]"
              >{{ s.name }}</span>
              <span v-if="branch.services!.length > 5" class="px-2.5 py-0.5 text-[11px] text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full">+{{ branch.services!.length - 5 }}</span>
            </div>
          </div>

          <!-- Payment + actions -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
            <div v-if="(branch.acceptedPaymentMethods ?? []).length > 0" class="flex items-center gap-2">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                {{ branch.acceptedPaymentMethods!.map(m => m === 'platform' ? 'Online' : 'Cash/POS').join(' · ') }}
              </span>
            </div>
            <div class="flex gap-2 ml-auto">
              <a
                v-if="branch.whatsappNumber"
                :href="`https://wa.me/${branch.whatsappNumber.replace(/\D/g, '')}`"
                target="_blank"
                class="w-8 h-8 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all"
                title="WhatsApp"
              >
                <svg class="w-4 h-4 text-white fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              </a>
              <router-link
                :to="{ name: 'pharmacy-branch', params: { pharmacyId: pharmacyState.pharmacy.value.id, branchId: branch.id } }"
                class="px-4 py-2 rounded-xl bg-[#246BFD] text-white text-xs font-bold hover:bg-[#1a56d6] active:scale-95 transition-all flex items-center gap-1.5"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                View Details
              </router-link>
              <a :href="`tel:${branch.phone}`" class="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-700 dark:text-white text-xs font-bold border border-gray-200 dark:border-gray-700 hover:border-[#246BFD] hover:text-[#246BFD] active:scale-95 transition-all">Call</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!pharmacyState.branchesLoading.value" class="py-16 text-center">
      <p class="text-sm text-gray-400">No branch information available.</p>
    </div>
  </div>
</template>
