<script setup lang="ts">
import { inject } from 'vue';
import { useRouter } from 'vue-router';
import LazyImage from '@/components/LazyImage.vue';
import { formatCurrency } from '@/utils/currency';
import type { useBranchDetail } from '@/composables/useBranchDetail';

const branchState = inject<ReturnType<typeof useBranchDetail>>('branchState')!;
const router = useRouter();
</script>

<template>
  <section>
    <div class="flex items-center gap-3 mb-5">
      <div class="w-1 h-7 bg-pink-500 rounded-full"></div>
      <h2 class="text-xl font-black text-gray-900 dark:text-white">Available Medications</h2>
      <span v-if="!branchState.drugsLoading.value && branchState.totalDrugs.value > 0" class="text-sm font-bold text-gray-400">{{ branchState.totalDrugs.value }}</span>
    </div>

    <!-- Search + filter bar -->
    <div v-if="!branchState.drugsLoading.value && (branchState.totalDrugs.value > 0 || branchState.hasActiveDrugFilters.value)" class="space-y-3 mb-5">
      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative flex-1 group">
          <input v-model="branchState.drugSearch.value" type="text" placeholder="Search medications…"
            class="w-full h-11 pl-10 pr-4 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-[#246BFD]/20 text-sm font-semibold placeholder:text-gray-400 transition-all"
          />
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <!-- Filter toggle -->
        <button @click="branchState.showFilters.value = !branchState.showFilters.value"
          class="h-11 px-4 flex items-center gap-2 rounded-full border text-sm font-bold transition-all flex-shrink-0"
          :class="branchState.hasActiveDrugFilters.value
            ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-md shadow-blue-500/20'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD]'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          Filters
          <span v-if="branchState.hasActiveDrugFilters.value" class="w-2 h-2 rounded-full bg-white/80"></span>
        </button>
      </div>

      <!-- Filter panel -->
      <Transition
        enter-active-class="transition-all duration-250 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-show="branchState.showFilters.value" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-lg p-5 space-y-5">
          <div class="flex flex-wrap gap-6">
            <!-- Form pills -->
            <div v-if="branchState.availableForms.value.length > 0">
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Form</p>
              <div class="flex flex-wrap gap-1.5">
                <button v-for="f in branchState.availableForms.value" :key="f" @click="branchState.toggleForm(f)"
                  class="px-3.5 py-2 rounded-full text-xs font-bold transition-all"
                  :class="branchState.formFilter.value.includes(f) ? 'bg-[#246BFD] text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#246BFD]/10 hover:text-[#246BFD]'"
                >{{ f }}</button>
              </div>
            </div>
            <!-- Stock -->
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Stock</p>
              <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                <button v-for="opt in [{ key: 'all', label: 'All' }, { key: 'in_stock', label: 'In Stock' }, { key: 'out_of_stock', label: 'Out of Stock' }]"
                  :key="opt.key" @click="branchState.stockFilter.value = opt.key as any"
                  class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                  :class="branchState.stockFilter.value === opt.key ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'"
                >{{ opt.label }}</button>
              </div>
            </div>
            <!-- Sort -->
            <div>
              <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Sort by</p>
              <div class="flex flex-wrap gap-1.5">
                <button v-for="opt in [{ key: 'default', label: 'Default' }, { key: 'name_asc', label: 'Name A–Z' }, { key: 'price_asc', label: 'Price ↑' }, { key: 'price_desc', label: 'Price ↓' }]"
                  :key="opt.key" @click="branchState.sortBy.value = opt.key as any"
                  class="px-3.5 py-2 rounded-full text-xs font-bold transition-all"
                  :class="branchState.sortBy.value === opt.key ? 'bg-violet-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20'"
                >{{ opt.label }}</button>
              </div>
            </div>
          </div>
          <!-- Active chips -->
          <div v-if="branchState.hasActiveDrugFilters.value" class="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex-wrap">
            <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">Active:</span>
            <span v-if="branchState.drugSearch.value.trim()" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">"{{ branchState.drugSearch.value }}" <button @click="branchState.drugSearch.value = ''" class="hover:text-red-500">×</button></span>
            <span v-for="f in branchState.formFilter.value" :key="f" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#246BFD]/10 text-[#246BFD]">{{ f }} <button @click="branchState.toggleForm(f)" class="hover:text-red-500">×</button></span>
            <span v-if="branchState.stockFilter.value !== 'all'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">{{ branchState.stockFilter.value === 'in_stock' ? 'In Stock' : 'Out of Stock' }} <button @click="branchState.stockFilter.value = 'all'" class="hover:text-red-500">×</button></span>
            <span v-if="branchState.sortBy.value !== 'default'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">{{ branchState.sortBy.value === 'name_asc' ? 'Name A–Z' : branchState.sortBy.value === 'price_asc' ? 'Price ↑' : 'Price ↓' }} <button @click="branchState.sortBy.value = 'default'" class="hover:text-red-500">×</button></span>
            <button @click="branchState.clearDrugFilters" class="ml-auto text-xs font-bold text-red-500 hover:text-red-600">Clear all</button>
          </div>
          <p class="text-xs font-semibold text-gray-400"><span class="font-bold text-gray-900 dark:text-white">{{ branchState.totalDrugs.value }}</span> {{ branchState.totalDrugs.value === 1 ? 'result' : 'results' }}</p>
        </div>
      </Transition>
    </div>

    <!-- Loading skeleton -->
    <div v-if="branchState.drugsLoading.value" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="n in 6" :key="n" class="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-pulse">
        <div class="h-36 bg-gray-200 dark:bg-gray-700"></div>
        <div class="p-4 space-y-2"><div class="h-4 bg-gray-100 dark:bg-gray-600 rounded w-3/4"></div><div class="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/2"></div><div class="h-5 bg-gray-100 dark:bg-gray-600 rounded w-1/3 mt-3"></div></div>
      </div>
    </div>

    <!-- Drug grid -->
    <div v-else-if="branchState.drugs.value.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="price in branchState.drugs.value" :key="price.id"
        class="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 dark:border-gray-700/50 transition-all duration-300 overflow-hidden flex flex-col"
      >
        <!-- Image -->
        <div class="relative h-40 bg-gray-100 dark:bg-gray-900 overflow-hidden flex-shrink-0 cursor-pointer"
          @click="price.product_id && router.push({ name: 'MedicationDetail', params: { id: price.product_id } })"
        >
          <LazyImage :src="price.image || price.medication_image || (price as any).drug_image || ''" :alt="price.name || ''" aspect-ratio="square" class-name="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <!-- Badges -->
          <div class="absolute top-2.5 left-2.5 flex flex-col gap-1">
            <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold backdrop-blur-sm border"
              :class="price.in_stock ? 'bg-green-500/90 border-green-400/20 text-white' : 'bg-red-500/90 border-red-400/20 text-white'">
              <span class="w-1.5 h-1.5 rounded-full bg-white" :class="price.in_stock ? 'animate-pulse' : ''"></span>
              {{ price.in_stock ? 'In Stock' : 'Restocking' }}
            </span>
            <span v-if="price.requires_prescription" class="inline-flex items-center px-2 py-1 text-[10px] font-bold rounded-lg bg-[#246BFD]/90 backdrop-blur-sm border border-[#246BFD]/20 text-white">Rx Required</span>
          </div>
        </div>

        <!-- Body -->
        <div class="p-4 flex flex-col flex-1">
          <div class="flex-1">
            <h4
              class="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors line-clamp-3 leading-snug mb-1 cursor-pointer"
              @click="price.product_id && router.push({ name: 'MedicationDetail', params: { id: price.product_id } })"
            >{{ price.name }}</h4>
          </div>

          <!-- Price -->
          <div class="flex items-baseline gap-1.5 mt-3 mb-3">
            <span class="text-lg font-black text-[#246BFD]">{{ formatCurrency(price.discount_price || price.price) }}</span>
            <span v-if="price.discount_price" class="text-xs text-gray-400 line-through">{{ formatCurrency(price.price) }}</span>
            <span v-if="price.discount_price" class="ml-auto text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full">
              -{{ Math.round(((price.price - price.discount_price) / price.price) * 100) }}%
            </span>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/50">
            <button
              v-if="price.product_id"
              @click="router.push({ name: 'MedicationDetail', params: { id: price.product_id } })"
              class="flex-1 h-9 rounded-full border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD] transition-all flex items-center justify-center gap-1.5"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              Details
            </button>
            <button
              @click="branchState.addToCart(price)"
              :disabled="!price.in_stock"
              class="flex-1 h-9 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              :class="price.in_stock
                ? 'bg-[#246BFD] text-white hover:bg-[#1a56d6] shadow-sm shadow-blue-500/20 active:scale-95'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
              {{ price.in_stock ? 'Add to Cart' : 'Unavailable' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!branchState.drugsLoading.value && branchState.totalDrugPages.value > 1" class="flex items-center justify-between mt-8 gap-4">
      <p class="text-xs font-semibold text-gray-400 hidden sm:block">
        Showing {{ (branchState.currentDrugPage.value - 1) * branchState.DRUGS_PER_PAGE + 1 }}–{{ Math.min(branchState.currentDrugPage.value * branchState.DRUGS_PER_PAGE, branchState.totalDrugs.value) }} of {{ branchState.totalDrugs.value }}
      </p>
      <div class="flex items-center gap-1.5 mx-auto sm:mx-0">
        <button
          @click="branchState.goToDrugPage(branchState.currentDrugPage.value - 1)"
          :disabled="branchState.currentDrugPage.value === 1"
          class="h-9 w-9 flex items-center justify-center rounded-full border font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          :class="branchState.currentDrugPage.value === 1 ? 'border-gray-200 dark:border-gray-700 text-gray-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD]'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <template v-for="p in branchState.totalDrugPages.value" :key="p">
          <button
            v-if="p === 1 || p === branchState.totalDrugPages.value || Math.abs(p - branchState.currentDrugPage.value) <= 1"
            @click="branchState.goToDrugPage(p)"
            class="h-9 min-w-[2.25rem] px-2 flex items-center justify-center rounded-full border text-sm font-bold transition-all"
            :class="p === branchState.currentDrugPage.value
              ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-md shadow-blue-500/20'
              : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD]'"
          >{{ p }}</button>
          <span
            v-else-if="p === 2 && branchState.currentDrugPage.value > 3 || p === branchState.totalDrugPages.value - 1 && branchState.currentDrugPage.value < branchState.totalDrugPages.value - 2"
            class="h-9 w-9 flex items-center justify-center text-gray-400 text-sm select-none"
          >…</span>
        </template>
        <button
          @click="branchState.goToDrugPage(branchState.currentDrugPage.value + 1)"
          :disabled="branchState.currentDrugPage.value === branchState.totalDrugPages.value"
          class="h-9 w-9 flex items-center justify-center rounded-full border font-bold text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          :class="branchState.currentDrugPage.value === branchState.totalDrugPages.value ? 'border-gray-200 dark:border-gray-700 text-gray-400' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-[#246BFD] hover:text-[#246BFD]'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <!-- Empty / no match -->
    <div v-if="!branchState.drugsLoading.value && branchState.drugs.value.length === 0" class="py-16 text-center">
      <div class="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
      </div>
      <p class="text-sm font-semibold text-gray-400">{{ branchState.hasActiveDrugFilters.value ? 'No medications match your filters.' : 'No medications listed for this branch.' }}</p>
      <button v-if="branchState.hasActiveDrugFilters.value" @click="branchState.clearDrugFilters" class="mt-3 text-xs font-bold text-[#246BFD] hover:underline">Clear filters</button>
    </div>
  </section>
</template>
