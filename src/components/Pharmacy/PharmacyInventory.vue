<script setup lang="ts">
import { formatCurrency } from '@/utils/currency';
import Pagination from '@/components/Pagination.vue';
import LazyImage from '@/components/LazyImage.vue';
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;
</script>

<template>
  <div id="inventory" class="mt-16 space-y-8 pb-12">
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-3">
          <div class="w-1 h-8 bg-[#246BFD] rounded-full"></div>
          <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-none">Inventory Explorer</h2>
        </div>
        <p class="text-sm text-gray-500 font-medium tracking-tight">Browse and secure medications available at this facility.</p>
      </div>

      <!-- Search bar -->
      <div class="flex items-center gap-3 flex-1 max-w-xl">
        <div class="relative flex-1 group">
          <input
            v-model="pharmacyState.medicationSearchQuery.value"
            type="text"
            placeholder="Search medications at this facility..."
            class="w-full h-12 pl-12 pr-4 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-[#246BFD]/20 text-sm font-semibold transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
          <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-[#246BFD] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <!-- Filter toggle -->
        <button
          @click="pharmacyState.showFilters.value = !pharmacyState.showFilters.value"
          class="h-12 px-4 flex items-center gap-2 rounded-full border transition-all text-sm font-bold flex-shrink-0"
          :class="pharmacyState.hasActiveFilters.value
            ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-md shadow-blue-500/20'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD]'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          Filters
          <span v-if="pharmacyState.hasActiveFilters.value" class="w-2 h-2 rounded-full bg-white/80 inline-block"></span>
        </button>
      </div>
    </div>

    <!-- ── Filter panel ── -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div v-show="pharmacyState.showFilters.value" class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-lg p-5 space-y-5">

        <div class="flex flex-wrap gap-6">

          <!-- Form type pills -->
          <div v-if="pharmacyState.availableForms.value.length > 0" class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Form</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="form in pharmacyState.availableForms.value"
                :key="form"
                @click="pharmacyState.toggleForm(form)"
                class="px-3.5 py-2 rounded-full text-xs font-bold transition-all"
                :class="pharmacyState.drugFormFilter.value.includes(form)
                  ? 'bg-[#246BFD] text-white shadow-sm shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#246BFD]/10 hover:text-[#246BFD]'"
              >{{ form }}</button>
            </div>
          </div>

          <!-- Stock -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Stock</p>
            <div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                v-for="opt in [{ key: 'all', label: 'All' }, { key: 'in_stock', label: 'In Stock' }, { key: 'out_of_stock', label: 'Out of Stock' }]"
                :key="opt.key"
                @click="pharmacyState.stockFilter.value = opt.key as any"
                class="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all"
                :class="pharmacyState.stockFilter.value === opt.key
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'"
              >{{ opt.label }}</button>
            </div>
          </div>

          <!-- Branch -->
          <div v-if="pharmacyState.availableBranches.value.length > 1">
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Branch</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                @click="pharmacyState.branchFilter.value = null"
                class="px-3.5 py-2 rounded-full text-xs font-bold transition-all"
                :class="pharmacyState.branchFilter.value === null
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
              >All Branches</button>
              <button
                v-for="b in pharmacyState.availableBranches.value"
                :key="b.id"
                @click="pharmacyState.branchFilter.value = b.id"
                class="px-3.5 py-2 rounded-full text-xs font-bold transition-all"
                :class="pharmacyState.branchFilter.value === b.id
                  ? 'bg-[#246BFD] text-white shadow-sm shadow-blue-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-[#246BFD]/10 hover:text-[#246BFD]'"
              >{{ b.name }}</button>
            </div>
          </div>

          <!-- Sort -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5">Sort by</p>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="opt in [
                  { key: 'default', label: 'Default' },
                  { key: 'name_asc', label: 'Name A–Z' },
                  { key: 'price_asc', label: 'Price ↑' },
                  { key: 'price_desc', label: 'Price ↓' }
                ]"
                :key="opt.key"
                @click="pharmacyState.sortBy.value = opt.key as any"
                class="px-3.5 py-2 rounded-full text-xs font-bold transition-all"
                :class="pharmacyState.sortBy.value === opt.key
                  ? 'bg-violet-600 text-white shadow-sm shadow-violet-500/20'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-violet-50 hover:text-violet-600 dark:hover:bg-violet-900/20 dark:hover:text-violet-400'"
              >{{ opt.label }}</button>
            </div>
          </div>

        </div>

        <!-- Active filter chips + clear -->
        <div v-if="pharmacyState.hasActiveFilters.value" class="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex-wrap">
          <span class="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-1">Active:</span>
          <span v-if="pharmacyState.medicationSearchQuery.value.trim()" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            "{{ pharmacyState.medicationSearchQuery.value }}"
            <button @click="pharmacyState.medicationSearchQuery.value = ''" class="hover:text-red-500 transition-colors">×</button>
          </span>
          <span v-for="form in pharmacyState.drugFormFilter.value" :key="form" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-[#246BFD]/10 text-[#246BFD]">
            {{ form }}
            <button @click="pharmacyState.toggleForm(form)" class="hover:text-red-500 transition-colors">×</button>
          </span>
          <span v-if="pharmacyState.stockFilter.value !== 'all'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            {{ pharmacyState.stockFilter.value === 'in_stock' ? 'In Stock' : 'Out of Stock' }}
            <button @click="pharmacyState.stockFilter.value = 'all'" class="hover:text-red-500 transition-colors">×</button>
          </span>
          <span v-if="pharmacyState.branchFilter.value" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            {{ pharmacyState.availableBranches.value.find(b => b.id === pharmacyState.branchFilter.value)?.name ?? pharmacyState.branchFilter.value }}
            <button @click="pharmacyState.branchFilter.value = null" class="hover:text-red-500 transition-colors">×</button>
          </span>
          <span v-if="pharmacyState.sortBy.value !== 'default'" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400">
            {{ pharmacyState.sortBy.value === 'name_asc' ? 'Name A–Z' : pharmacyState.sortBy.value === 'price_asc' ? 'Price ↑' : 'Price ↓' }}
            <button @click="pharmacyState.sortBy.value = 'default'" class="hover:text-red-500 transition-colors">×</button>
          </span>
          <button @click="pharmacyState.clearFilters" class="ml-auto text-xs font-bold text-red-500 hover:text-red-600 transition-colors">Clear all</button>
        </div>

        <!-- Result count -->
        <p class="text-xs font-semibold text-gray-400">
          <span class="text-gray-900 dark:text-white font-bold">{{ pharmacyState.totalPrices.value }}</span> {{ pharmacyState.totalPrices.value === 1 ? 'item' : 'items' }}
        </p>
      </div>
    </Transition>

    <div v-if="pharmacyState.loading.value" class="space-y-4 animate-pulse py-4">
      <div v-for="i in 4" :key="i" class="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
        <div class="h-32 bg-gray-200 dark:bg-gray-700"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div class="flex justify-between items-center pt-1">
            <div class="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
            <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl w-20"></div>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div v-if="pharmacyState.pharmacyPrices.value.length > 0">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="price in pharmacyState.pharmacyPrices.value"
            :key="price.id"
            @click="pharmacyState.viewMedicationDetails(price)"
            class="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 overflow-hidden border border-gray-100 dark:border-gray-700/50 hover:-translate-y-1 relative cursor-pointer"
          >
           <!-- Stock Badge Overlay -->
           <div class="absolute top-3 left-3 z-10">
             <div 
               class="px-2.5 py-1 backdrop-blur-md rounded-lg shadow-md border flex items-center gap-1.5"
               :class="price.in_stock ? 'bg-green-500/90 border-green-400/20 text-white' : 'bg-red-500/90 border-red-400/20 text-white'"
             >
                <span class="w-1.5 h-1.5 rounded-full animate-pulse bg-white"></span>
                <span class="text-[10px] font-semibold uppercase tracking-wider text-white">
                  {{ price.in_stock ? 'In Stock' : 'Restocking' }}
                </span>
             </div>
           </div>

           <!-- Image Section -->
           <div class="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
             <LazyImage
               :src="price.image || price.medication_image || (price as any).drug_image || '/placeholder-med.png'"
               :alt="price.name || ''"
               aspectRatio="square"
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
             />
             <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
           </div>

           <!-- Content Section -->
           <div class="p-6 space-y-4">
             <div>
                <div class="flex items-start justify-between gap-2 mb-1">
                   <h4 class="text-base font-bold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors line-clamp-3">
                     {{ price.name }}
                   </h4>
                   <span v-if="price.requires_prescription" class="px-1.5 py-0.5 text-[9px] font-bold text-[#246BFD] bg-blue-50 dark:bg-blue-900/30 rounded border border-[#246BFD]/20 flex-shrink-0">Rx</span>
                </div>
                <!-- Branch name + distance -->
                <div v-if="price.branch_name" class="flex items-center gap-1.5 mt-1">
                  <svg class="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <span class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ price.branch_name }}</span>
                  <span v-if="pharmacyState.branchDistanceLabel(price)" class="flex-shrink-0 inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#246BFD] bg-[#246BFD]/8 px-1.5 py-0.5 rounded-full">
                    <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                    {{ pharmacyState.branchDistanceLabel(price) }}
                  </span>
                </div>
             </div>

             <!-- Pricing & Stock Hub -->
             <div class="pt-3.5 border-t border-gray-100 dark:border-gray-700/50">
                <span class="text-xs font-semibold text-gray-400 block mb-1">Price per unit</span>
                <div class="flex items-center justify-between">
                  <div class="flex items-baseline gap-1.5">
                    <span class="text-xl font-bold text-[#246BFD] tracking-tight">
                      {{ formatCurrency(price.discount_price || price.price) }}
                    </span>
                    <span v-if="price.discount_price" class="text-xs font-medium text-gray-400 line-through">
                      {{ formatCurrency(price.price) }}
                    </span>
                  </div>
                  
                  <!-- Inline Stock Indicator -->
                  <span 
                    class="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                    :class="price.in_stock ? 'bg-green-50 border-green-100 text-green-700 dark:bg-green-900/10 dark:border-green-800' : 'bg-red-50 border-red-100 text-red-700 dark:bg-red-900/10 dark:border-red-800'"
                  >
                    {{ price.in_stock ? (price.stock_quantity !== undefined ? `Stock: ${price.stock_quantity}` : 'In Stock') : 'Out of Stock' }}
                  </span>
                </div>
             </div>

             <!-- Add to Cart Control -->
             <div class="pt-4 border-t border-gray-50 dark:border-gray-700/50 flex flex-col gap-2.5" @click.stop>
                <div class="flex gap-3">
                  <div class="bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-center px-1 h-10 w-28 border border-gray-100 dark:border-gray-700">
                    <button 
                      @click="pharmacyState.setCustomQuantity(price.id || '', Math.max(1, (pharmacyState.customQuantities.value[price.id || ''] || 1) - 1))"
                      class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#246BFD] transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 12H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                    </button>
                    <input 
                      type="number"
                      :value="pharmacyState.customQuantities.value[price.id || ''] || 1"
                      @input="pharmacyState.setCustomQuantity(price.id || '', Math.max(1, parseInt(($event.target as HTMLInputElement).value) || 1))"
                      class="w-full bg-transparent text-center text-xs font-bold text-gray-900 dark:text-white border-none focus:ring-0 p-0"
                    />
                    <button 
                      @click="pharmacyState.setCustomQuantity(price.id || '', (pharmacyState.customQuantities.value[price.id || ''] || 1) + 1)"
                      class="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-[#246BFD] transition-colors"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                    </button>
                  </div>
                  
                  <button 
                    @click="pharmacyState.addToCart(price)"
                    :disabled="!price.in_stock || (price.stock_quantity !== undefined && (pharmacyState.customQuantities.value[price.id || ''] || 1) > price.stock_quantity)"
                    class="flex-1 h-10 bg-[#246BFD] hover:bg-[#1a56d6] text-white rounded-lg text-xs font-bold shadow-md hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-30 disabled:translate-y-0 flex items-center justify-center gap-1.5"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>

                <!-- Stock Error Message -->
                <p 
                  v-if="price.stock_quantity !== undefined && (pharmacyState.customQuantities.value[price.id || ''] || 1) > price.stock_quantity"
                  class="text-[10px] font-semibold text-red-500 animate-pulse text-center"
                >
                  Maximum available: {{ price.stock_quantity }} units
                </p>
             </div>
           </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700/50">
          <Pagination
            :current-page="pharmacyState.currentPage.value"
            :total-pages="pharmacyState.totalPages.value"
            :total-items="pharmacyState.totalPrices.value"
            :per-page="pharmacyState.itemsPerPage.value"
            @update:page="pharmacyState.handlePageChange"
            @update:per-page="(val) => { pharmacyState.itemsPerPage.value = val; pharmacyState.loadPrices(1); }"
          />
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="py-24 text-center bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-50 dark:border-gray-700/50">
        <div class="w-20 h-20 bg-[#246BFD]/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-10 h-10 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">No Matching Assets</h3>
        <p class="text-sm text-gray-500 font-medium tracking-tight">Adjust your search query to explore other inventory items.</p>
      </div>
    </div>
  </div>
</template>
