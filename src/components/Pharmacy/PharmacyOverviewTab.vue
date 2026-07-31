<script setup lang="ts">
import { sanitizeHtml } from '@/utils/sanitize';
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;
</script>

<template>
  <div v-if="pharmacyState.pharmacy.value" class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="space-y-4">
      <div class="flex items-center gap-2.5">
        <div class="w-1 h-6 bg-[#246BFD] rounded-full"></div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">Facility Profile</h3>
      </div>
      <div class="prose prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-gray-700/50 leading-relaxed" v-html="sanitizeHtml(pharmacyState.pharmacy.value.description)"></div>
    </div>

    <div class="space-y-10">
      <!-- Operating Hours (Full Width Stacked) -->
      <div class="space-y-4">
        <div class="flex items-center gap-2.5">
          <div class="w-1 h-6 bg-green-500 rounded-full"></div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Operating Hours</h3>
        </div>
        <div class="space-y-2 bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-700/50">
          <div
            v-for="(hours, day) in pharmacyState.pharmacy.value.workingHours"
            :key="day"
            class="flex justify-between items-center group p-2 rounded-xl transition-all"
            :class="[
              day === pharmacyState.currentDayName.value
                ? 'bg-blue-50/70 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 shadow-sm'
                : 'border border-transparent'
            ]"
          >
            <span
              class="font-semibold text-sm transition-colors flex items-center gap-2"
              :class="[
                day === pharmacyState.currentDayName.value
                  ? 'text-[#246BFD]'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-[#246BFD]'
              ]"
            >
              <span class="capitalize">{{ day }}</span>
              <span v-if="day === pharmacyState.currentDayName.value" class="text-[9px] lowercase font-semibold text-white bg-[#246BFD] px-2 py-0.5 rounded-full">today</span>
            </span>
            <div class="h-0 flex-1 mx-4 border-dashed border-t border-gray-300/50 dark:border-gray-600/50"></div>
            <span
              class="font-bold text-sm transition-colors"
              :class="[
                hours.toLowerCase() === 'closed'
                  ? 'text-red-500 dark:text-red-400'
                  : (day === pharmacyState.currentDayName.value ? 'text-[#246BFD]' : 'text-gray-900 dark:text-white')
              ]"
            >
              {{ hours }}
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Connect (Side-by-side Grid) -->
      <div class="space-y-4">
        <div class="flex items-center gap-2.5">
          <div class="w-1 h-6 bg-orange-500 rounded-full"></div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">Quick Connect</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a :href="`tel:${pharmacyState.pharmacy.value.phone}`" class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
             <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-[#246BFD] flex items-center justify-center group-hover:bg-[#246BFD] group-hover:text-white transition-colors">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
             </div>
             <div>
               <p class="text-xs font-semibold text-gray-400">Phone</p>
               <p class="font-bold text-gray-900 dark:text-white">{{ pharmacyState.pharmacy.value.phone }}</p>
             </div>
          </a>
          <a :href="`mailto:${pharmacyState.pharmacy.value.email}`" class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
             <div class="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
               <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
             </div>
             <div>
               <p class="text-xs font-semibold text-gray-400">Email</p>
               <p class="font-bold text-gray-900 dark:text-white truncate max-w-[150px] md:max-w-none">{{ pharmacyState.pharmacy.value.email }}</p>
             </div>
          </a>
          <!-- WhatsApp -->
          <a
            v-if="pharmacyState.pharmacy.value.whatsappNumber"
            :href="`https://wa.me/${pharmacyState.pharmacy.value.whatsappNumber.replace(/\D/g, '')}`"
            target="_blank"
            class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400">WhatsApp</p>
              <p class="font-bold text-gray-900 dark:text-white">{{ pharmacyState.pharmacy.value.whatsappNumber }}</p>
            </div>
          </a>
          <!-- Website -->
          <a
            v-if="pharmacyState.pharmacy.value.website"
            :href="pharmacyState.pharmacy.value.website"
            target="_blank"
            class="flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div class="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold text-gray-400">Website</p>
              <p class="font-bold text-gray-900 dark:text-white truncate">{{ pharmacyState.pharmacy.value.website.replace(/^https?:\/\//, '') }}</p>
            </div>
          </a>
        </div>
      </div>

      <!-- At a Glance: capabilities, delivery, payments -->
      <div class="space-y-4">
        <div class="flex items-center gap-2.5">
          <div class="w-1 h-6 bg-violet-500 rounded-full"></div>
          <h3 class="text-lg font-bold text-gray-900 dark:text-white">At a Glance</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <!-- Online prescriptions -->
          <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="pharmacyState.pharmacy.value.acceptsOnlinePrescriptions ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400">Online Prescriptions</p>
              <p class="font-bold text-sm" :class="pharmacyState.pharmacy.value.acceptsOnlinePrescriptions ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'">
                {{ pharmacyState.pharmacy.value.acceptsOnlinePrescriptions ? 'Accepted' : 'Not accepted' }}
              </p>
            </div>
          </div>

          <!-- Delivery -->
          <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              :class="pharmacyState.pharmacy.value.deliveryInfo?.available ? 'bg-blue-100 dark:bg-blue-900/30 text-[#246BFD]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400">Home Delivery</p>
              <p v-if="pharmacyState.pharmacy.value.deliveryInfo?.available" class="font-bold text-sm text-[#246BFD]">
                From GHS {{ pharmacyState.pharmacy.value.deliveryInfo.baseFee?.toFixed(0) ?? '–' }}
                <span v-if="pharmacyState.pharmacy.value.deliveryInfo.radiusKm" class="text-gray-400 font-normal"> · {{ pharmacyState.pharmacy.value.deliveryInfo.radiusKm }} km radius</span>
              </p>
              <p v-else class="font-bold text-sm text-gray-500 dark:text-gray-400">Not available</p>
            </div>
          </div>

          <!-- Payment methods -->
          <div v-if="(pharmacyState.pharmacy.value.acceptedPaymentLabels ?? []).length > 0" class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
            <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400">Payment Methods</p>
              <p class="font-bold text-sm text-gray-900 dark:text-white">{{ pharmacyState.pharmacy.value.acceptedPaymentLabels!.join(' · ') }}</p>
            </div>
          </div>

          <!-- Languages -->
          <div v-if="(pharmacyState.pharmacy.value.languages ?? []).length > 0" class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50">
            <div class="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400">Languages Spoken</p>
              <p class="font-bold text-sm text-gray-900 dark:text-white">{{ pharmacyState.pharmacy.value.languages!.join(' · ') }}</p>
            </div>
          </div>

          <!-- Special Storage -->
          <div v-if="(pharmacyState.pharmacy.value.specialStorage ?? []).length > 0" class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/50 sm:col-span-2">
            <div class="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2v-4M9 21H5a2 2 0 01-2-2v-4m0 0h18"/></svg>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400">Special Storage</p>
              <div class="flex flex-wrap gap-1.5 mt-1">
                <span
                  v-for="s in pharmacyState.pharmacy.value.specialStorage"
                  :key="s"
                  class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800/30"
                >
                  {{ s === 'cold_chain' ? 'Cold Chain' : s === 'controlled_vault' ? 'Controlled Vault' : s }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
