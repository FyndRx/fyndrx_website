<script setup lang="ts">
import { formatCurrency } from '@/utils/currency';
import Pagination from '@/components/Pagination.vue';
import LazyImage from '@/components/LazyImage.vue';
import { inject } from 'vue';
import type { usePharmacy } from '@/composables/usePharmacy';

const pharmacyState = inject<ReturnType<typeof usePharmacy>>('pharmacyState')!;

// Shared styling for the filter pills so the four groups stay identical
const pill =
  'px-4 py-2 text-sm font-medium rounded-full transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30';
const pillOn = 'bg-brand-500 text-white shadow-glow-brand';
const pillOff =
  'bg-white text-gray-700 ring-1 ring-gray-200 hover:ring-brand-500 hover:text-brand-600 dark:bg-white/5 dark:text-gray-200 dark:ring-white/10 dark:hover:text-brand-300';
const chip =
  'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300';
const chipX = 'rounded-full hover:text-red-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40';
</script>

<template>
  <section
    id="inventory"
    class="p-5 mt-12 rounded-3xl bg-white/70 shadow-card ring-1 ring-white/70 backdrop-blur-md sm:p-8 dark:bg-gray-800/60 dark:ring-white/10"
    aria-labelledby="inventory-title"
  >
    <!-- Header + search -->
    <div class="flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div class="space-y-1">
        <h2 id="inventory-title" class="text-2xl font-semibold text-gray-900 md:text-3xl dark:text-white">Inventory Explorer</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Browse and order medications available at this pharmacy.</p>
      </div>

      <div class="flex items-center flex-1 max-w-xl gap-3">
        <div class="relative flex-1 group">
          <input
            v-model="pharmacyState.medicationSearchQuery.value"
            type="search"
            aria-label="Search medications at this pharmacy"
            placeholder="Search medications at this pharmacy…"
            class="w-full h-12 pr-4 text-sm text-gray-900 transition bg-white border border-gray-200 rounded-full pl-11 placeholder:text-gray-400 dark:bg-gray-900/60 dark:border-white/10 dark:text-white focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/20"
          />
          <svg class="absolute w-5 h-5 text-gray-400 -translate-y-1/2 pointer-events-none left-4 top-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        <button
          type="button"
          @click="pharmacyState.showFilters.value = !pharmacyState.showFilters.value"
          :aria-expanded="pharmacyState.showFilters.value"
          aria-controls="inventory-filters"
          class="flex items-center flex-shrink-0 h-12 gap-2 px-5 text-sm font-medium transition duration-200 border rounded-full ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          :class="pharmacyState.hasActiveFilters.value
            ? 'bg-brand-500 border-transparent text-white shadow-glow-brand'
            : 'bg-white border-gray-200 text-gray-700 hover:border-brand-500 hover:text-brand-600 dark:bg-white/5 dark:border-white/10 dark:text-gray-200 dark:hover:text-brand-300'"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
          Filters
          <span v-if="pharmacyState.hasActiveFilters.value" class="inline-block w-2 h-2 rounded-full bg-white/90" aria-label="Filters active"></span>
        </button>
      </div>
    </div>

    <!-- ── Filter panel ── -->
    <Transition
      enter-active-class="transition duration-300 ease-out motion-reduce:transition-none"
      enter-from-class="opacity-0 -translate-y-3"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-3"
    >
      <div
        v-show="pharmacyState.showFilters.value"
        id="inventory-filters"
        class="p-5 mt-6 space-y-5 rounded-2xl bg-white/60 ring-1 ring-gray-200/70 dark:bg-white/5 dark:ring-white/10"
      >
        <div class="flex flex-wrap gap-x-8 gap-y-5">

          <!-- Form -->
          <div v-if="pharmacyState.availableForms.value.length > 0" class="min-w-0">
            <p class="mb-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">Form</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="form in pharmacyState.availableForms.value"
                :key="form"
                type="button"
                :aria-pressed="pharmacyState.drugFormFilter.value.includes(form)"
                @click="pharmacyState.toggleForm(form)"
                :class="[pill, pharmacyState.drugFormFilter.value.includes(form) ? pillOn : pillOff]"
              >{{ form }}</button>
            </div>
          </div>

          <!-- Stock -->
          <div>
            <p class="mb-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">Stock</p>
            <div class="inline-flex gap-1 p-1 rounded-full bg-white ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10" role="group" aria-label="Stock">
              <button
                v-for="opt in [{ key: 'all', label: 'All' }, { key: 'in_stock', label: 'In stock' }, { key: 'out_of_stock', label: 'Out of stock' }]"
                :key="opt.key"
                type="button"
                :aria-pressed="pharmacyState.stockFilter.value === opt.key"
                @click="pharmacyState.stockFilter.value = opt.key as any"
                class="px-4 py-1.5 text-sm font-medium rounded-full transition duration-200 ease-out-quart focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                :class="pharmacyState.stockFilter.value === opt.key
                  ? 'bg-brand-500 text-white shadow-glow-brand'
                  : 'text-gray-600 hover:text-brand-600 dark:text-gray-300 dark:hover:text-brand-300'"
              >{{ opt.label }}</button>
            </div>
          </div>

          <!-- Branch -->
          <div v-if="pharmacyState.availableBranches.value.length > 1">
            <p class="mb-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">Branch</p>
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                :aria-pressed="pharmacyState.branchFilter.value === null"
                @click="pharmacyState.branchFilter.value = null"
                :class="[pill, pharmacyState.branchFilter.value === null ? pillOn : pillOff]"
              >All branches</button>
              <button
                v-for="b in pharmacyState.availableBranches.value"
                :key="b.id"
                type="button"
                :aria-pressed="pharmacyState.branchFilter.value === b.id"
                @click="pharmacyState.branchFilter.value = b.id"
                :class="[pill, pharmacyState.branchFilter.value === b.id ? pillOn : pillOff]"
              >{{ b.name }}</button>
            </div>
          </div>

          <!-- Sort -->
          <div>
            <p class="mb-2.5 text-sm font-medium text-gray-500 dark:text-gray-400">Sort by</p>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="opt in [
                  { key: 'default', label: 'Default' },
                  { key: 'name_asc', label: 'Name A–Z' },
                  { key: 'price_asc', label: 'Price ↑' },
                  { key: 'price_desc', label: 'Price ↓' }
                ]"
                :key="opt.key"
                type="button"
                :aria-pressed="pharmacyState.sortBy.value === opt.key"
                @click="pharmacyState.sortBy.value = opt.key as any"
                :class="[pill, pharmacyState.sortBy.value === opt.key ? pillOn : pillOff]"
              >{{ opt.label }}</button>
            </div>
          </div>

        </div>

        <!-- Active filter chips + clear -->
        <div v-if="pharmacyState.hasActiveFilters.value" class="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200/70 dark:border-white/10">
          <span class="mr-1 text-sm font-medium text-gray-500 dark:text-gray-400">Active:</span>
          <span v-if="pharmacyState.medicationSearchQuery.value.trim()" :class="chip">
            “{{ pharmacyState.medicationSearchQuery.value }}”
            <button type="button" aria-label="Clear search" @click="pharmacyState.medicationSearchQuery.value = ''" :class="chipX">×</button>
          </span>
          <span v-for="form in pharmacyState.drugFormFilter.value" :key="form" :class="chip">
            {{ form }}
            <button type="button" :aria-label="`Remove ${form}`" @click="pharmacyState.toggleForm(form)" :class="chipX">×</button>
          </span>
          <span v-if="pharmacyState.stockFilter.value !== 'all'" :class="chip">
            {{ pharmacyState.stockFilter.value === 'in_stock' ? 'In stock' : 'Out of stock' }}
            <button type="button" aria-label="Remove stock filter" @click="pharmacyState.stockFilter.value = 'all'" :class="chipX">×</button>
          </span>
          <span v-if="pharmacyState.branchFilter.value" :class="chip">
            {{ pharmacyState.availableBranches.value.find(b => b.id === pharmacyState.branchFilter.value)?.name ?? pharmacyState.branchFilter.value }}
            <button type="button" aria-label="Remove branch filter" @click="pharmacyState.branchFilter.value = null" :class="chipX">×</button>
          </span>
          <span v-if="pharmacyState.sortBy.value !== 'default'" :class="chip">
            {{ pharmacyState.sortBy.value === 'name_asc' ? 'Name A–Z' : pharmacyState.sortBy.value === 'price_asc' ? 'Price ↑' : 'Price ↓' }}
            <button type="button" aria-label="Reset sort" @click="pharmacyState.sortBy.value = 'default'" :class="chipX">×</button>
          </span>
          <button type="button" @click="pharmacyState.clearFilters" class="ml-auto text-sm font-medium text-red-600 transition-colors rounded-full hover:text-red-700 dark:text-red-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20">Clear all</button>
        </div>

        <!-- Result count -->
        <p class="text-sm text-gray-500 dark:text-gray-400" role="status">
          <span class="font-semibold text-gray-900 dark:text-white">{{ pharmacyState.totalPrices.value }}</span> {{ pharmacyState.totalPrices.value === 1 ? 'item' : 'items' }}
        </p>
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="pharmacyState.loading.value" class="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2 lg:grid-cols-3 animate-pulse" aria-hidden="true">
      <div v-for="i in 6" :key="i" class="overflow-hidden rounded-3xl bg-white/60 ring-1 ring-gray-200/70 dark:bg-white/5 dark:ring-white/10">
        <div class="p-3 pb-0"><div class="h-44 bg-gray-200 rounded-2xl dark:bg-gray-700"></div></div>
        <div class="p-5 space-y-3">
          <div class="w-3/4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div class="w-1/2 h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div class="flex items-center justify-between pt-3">
            <div class="w-20 h-6 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div class="w-24 h-6 bg-gray-200 rounded-full dark:bg-gray-700"></div>
          </div>
          <div class="h-11 bg-gray-200 rounded-full dark:bg-gray-700"></div>
        </div>
      </div>
    </div>

    <div v-else class="mt-8">
      <div v-if="pharmacyState.pharmacyPrices.value.length > 0">
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="price in pharmacyState.pharmacyPrices.value"
            :key="price.id"
            @click="pharmacyState.viewMedicationDetails(price)"
            class="relative overflow-hidden transition duration-300 cursor-pointer group ease-out-quart rounded-3xl bg-white/80 shadow-card ring-1 ring-white/70 hover:-translate-y-1 hover:shadow-card-hover dark:bg-gray-800/70 dark:ring-white/10"
          >
            <!-- Image -->
            <div class="p-3 pb-0">
              <div class="relative h-44 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900/60">
                <LazyImage
                  :src="price.image || price.medication_image || (price as any).drug_image || '/placeholder-med.png'"
                  :alt="price.name || ''"
                  aspectRatio="square"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105 motion-reduce:transition-none"
                />
                <!-- Stock badge -->
                <span
                  class="absolute inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-card top-3 left-3"
                  :class="price.in_stock ? 'bg-emerald-600' : 'bg-red-600'"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-white" :class="price.in_stock ? 'motion-safe:animate-pulse' : ''" aria-hidden="true"></span>
                  {{ price.in_stock ? 'In stock' : 'Restocking' }}
                </span>
              </div>
            </div>

            <!-- Content -->
            <div class="p-5 space-y-4">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h3
                    class="text-base font-semibold leading-snug transition-colors line-clamp-3 group-hover:text-brand-500"
                    :class="price.name ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 italic font-normal'"
                  >
                    {{ price.name || 'Unnamed product' }}
                  </h3>
                  <span v-if="price.requires_prescription" class="flex-shrink-0 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-accent-500/15 text-accent-700 dark:text-accent-300">Rx</span>
                </div>
                <!-- Branch + distance -->
                <div v-if="price.branch_name" class="flex items-center gap-1.5 mt-1.5">
                  <svg class="flex-shrink-0 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <span class="text-sm text-gray-500 truncate dark:text-gray-400">{{ price.branch_name }}</span>
                  <span v-if="pharmacyState.branchDistanceLabel(price)" class="inline-flex items-center flex-shrink-0 gap-1 px-2 py-0.5 text-xs font-medium rounded-full text-brand-600 bg-brand-500/10 dark:text-brand-300">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
                    {{ pharmacyState.branchDistanceLabel(price) }}
                  </span>
                </div>
              </div>

              <!-- Price + stock -->
              <div class="pt-4 border-t border-gray-200/70 dark:border-white/10">
                <span class="block mb-1 text-sm text-gray-500 dark:text-gray-400">Price per unit</span>
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-xl font-semibold text-brand-500 dark:text-brand-300">
                      {{ formatCurrency(price.discount_price || price.price) }}
                    </span>
                    <span v-if="price.discount_price" class="text-sm text-gray-400 line-through">
                      {{ formatCurrency(price.price) }}
                    </span>
                  </div>
                  <span
                    class="px-2.5 py-1 text-xs font-medium rounded-full"
                    :class="price.in_stock ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'"
                  >
                    {{ price.in_stock ? (price.stock_quantity !== undefined ? `Stock: ${price.stock_quantity}` : 'In stock') : 'Out of stock' }}
                  </span>
                </div>
              </div>

              <!-- Add to cart -->
              <div class="flex flex-col gap-2 pt-4 border-t border-gray-200/70 dark:border-white/10" @click.stop>
                <div class="flex gap-3">
                  <div class="flex items-center h-11 px-1 bg-white rounded-full w-28 ring-1 ring-gray-200 dark:bg-white/5 dark:ring-white/10">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      @click="pharmacyState.setCustomQuantity(price.id || '', Math.max(1, (pharmacyState.customQuantities.value[price.id || ''] || 1) - 1))"
                      class="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors rounded-full hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                    </button>
                    <input
                      type="number"
                      min="1"
                      aria-label="Quantity"
                      :value="pharmacyState.customQuantities.value[price.id || ''] || 1"
                      @input="pharmacyState.setCustomQuantity(price.id || '', Math.max(1, parseInt(($event.target as HTMLInputElement).value) || 1))"
                      class="w-full p-0 text-sm font-semibold text-center text-gray-900 bg-transparent border-none dark:text-white focus:ring-0"
                    />
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      @click="pharmacyState.setCustomQuantity(price.id || '', (pharmacyState.customQuantities.value[price.id || ''] || 1) + 1)"
                      class="flex items-center justify-center w-8 h-8 text-gray-500 transition-colors rounded-full hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
                    >
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v16m8-8H4" stroke-linecap="round" stroke-linejoin="round" stroke-width="3"/></svg>
                    </button>
                  </div>

                  <button
                    type="button"
                    @click="pharmacyState.addToCart(price)"
                    :disabled="!price.in_stock || (price.stock_quantity !== undefined && (pharmacyState.customQuantities.value[price.id || ''] || 1) > price.stock_quantity)"
                    class="flex items-center justify-center flex-1 h-11 gap-2 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart
                  </button>
                </div>

                <p
                  v-if="price.stock_quantity !== undefined && (pharmacyState.customQuantities.value[price.id || ''] || 1) > price.stock_quantity"
                  class="text-xs font-medium text-center text-red-600 dark:text-red-400"
                  role="alert"
                >
                  Maximum available: {{ price.stock_quantity }} units
                </p>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div class="pt-8 mt-10 border-t border-gray-200/70 dark:border-white/10">
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

      <!-- Empty -->
      <div v-else class="px-6 py-16 text-center rounded-2xl bg-white/60 ring-1 ring-gray-200/70 dark:bg-white/5 dark:ring-white/10">
        <div class="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-brand-500/10">
          <svg class="w-10 h-10 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/></svg>
        </div>
        <h3 class="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No medications found</h3>
        <p class="max-w-sm mx-auto text-sm text-gray-500 dark:text-gray-400">
          {{ pharmacyState.hasActiveFilters.value ? 'Nothing matches your search or filters.' : 'This pharmacy has no medications listed yet.' }}
        </p>
        <button
          v-if="pharmacyState.hasActiveFilters.value"
          type="button"
          @click="pharmacyState.clearFilters"
          class="px-6 py-3 mt-6 text-sm font-medium text-white transition duration-200 rounded-full shadow-glow-brand bg-brand-500 ease-out-quart hover:bg-brand-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
        >Clear filters</button>
      </div>
    </div>
  </section>
</template>
