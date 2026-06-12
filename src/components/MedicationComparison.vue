<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useMedicationsStore } from '@/store/medications';
import { medicationService } from '@/services/medicationService';
import LazyImage from './LazyImage.vue';
import type { Medication } from '@/models/Medication';

const router = useRouter();
const medicationsStore = useMedicationsStore();
const { comparisonList, comparisonModalOpen } = storeToRefs(medicationsStore);

const clearAll = () => medicationsStore.clearComparison();
const removeFromComparison = (id: number) => medicationsStore.removeFromComparison(id);
const openComparison = () => medicationsStore.openComparisonModal();
const closeComparison = () => medicationsStore.closeComparisonModal();

const viewMedication = (med: Medication) => {
  closeComparison();
  router.push(`/medication/${med.product_id ?? med.id}`);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getCategoryNames = (category: Medication['category']): string[] => {
  if (!category) return [];
  const arr = Array.isArray(category) ? category : [category];
  return arr
    .map((c: any) => (typeof c === 'string' ? c : c?.name ?? ''))
    .filter(Boolean);
};

const effectivePrice = (med: Medication): number | null => {
  const p = med.discount_price ?? med.starting_price ?? med.price;
  return p != null && p > 0 ? p : null;
};

// ─── Computed highlights ──────────────────────────────────────────────────────

const lowestPrice = computed(() => {
  const prices = comparisonList.value
    .map(effectivePrice)
    .filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
});

const maxPharmacies = computed(() =>
  Math.max(...comparisonList.value.map(m => m.pharmacy_count ?? 0), 1)
);

const isBestValue = (med: Medication) => {
  const p = effectivePrice(med);
  return p !== null && lowestPrice.value !== null && p === lowestPrice.value;
};

const isMostAvailable = (med: Medication) =>
  (med.pharmacy_count ?? 0) > 0 && (med.pharmacy_count ?? 0) === maxPharmacies.value;



// Label column 180px, each medication column fixed at 210px
const gridCols = computed(
  () => `180px repeat(${comparisonList.value.length}, 210px)`
);

// ─── Pharmacy prices ──────────────────────────────────────────────────────────

type PharmacyPrice = {
  pharmacy_id: string;
  pharmacy_name: string;
  pharmacy_logo?: string | null;
  price: number;
  discount_price?: number | null;
  in_stock: boolean;
  is_open?: boolean;
  branch_name?: string | null;
};

const pharmacyPricesMap = ref<Map<number | string, PharmacyPrice[]>>(new Map());
const loadingPrices = ref(false);

watch(comparisonModalOpen, async (open) => {
  if (!open) return;
  loadingPrices.value = true;
  pharmacyPricesMap.value = new Map();

  await Promise.all(
    comparisonList.value.map(async (med) => {
      try {
        const prices = await medicationService.getProductPrices(med.product_id ?? med.id);
        pharmacyPricesMap.value.set(med.id, prices);
      } catch {
        pharmacyPricesMap.value.set(med.id, []);
      }
    })
  );

  loadingPrices.value = false;
});

const pharmaciesFor = (med: Medication) => pharmacyPricesMap.value.get(med.id) ?? null;

const effectivePriceFor = (p: PharmacyPrice) =>
  p.discount_price != null && p.discount_price < p.price ? p.discount_price : p.price;
</script>

<template>
  <div>
    <!-- ── Floating tray ── -->
    <Transition name="float-up">
      <div
        v-if="comparisonList.length > 0"
        class="fixed bottom-6 right-6 z-40 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 w-72"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <div class="p-1.5 bg-[#246BFD]/10 rounded-lg">
              <svg class="w-4 h-4 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span class="font-semibold text-sm text-gray-900 dark:text-white">
              Compare
              <span class="text-[#246BFD]">{{ comparisonList.length }}</span>/4
            </span>
          </div>
          <button @click="clearAll" class="text-xs text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium">
            Clear all
          </button>
        </div>

        <div class="space-y-1.5 mb-3">
          <div
            v-for="med in comparisonList"
            :key="med.id"
            class="flex items-center gap-2.5 p-2 bg-gray-50 dark:bg-gray-700/60 rounded-xl"
          >
            <LazyImage :src="med.image" :alt="med.name" aspectRatio="square" className="w-9 h-9 rounded-lg object-cover shrink-0" />
            <span class="flex-1 text-xs font-medium text-gray-800 dark:text-white truncate leading-tight">{{ med.name }}</span>
            <button @click="removeFromComparison(med.id)" class="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shrink-0">
              <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Add more prompt when only 1 item -->
        <p v-if="comparisonList.length === 1" class="text-xs text-center text-gray-400 mb-3">
          Add at least one more to compare
        </p>

        <button
          @click="openComparison"
          :disabled="comparisonList.length < 2"
          class="w-full py-2.5 rounded-xl bg-[#246BFD] text-white text-sm font-semibold hover:bg-[#5089FF] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-[#246BFD]/30"
        >
          Compare Now
        </button>
      </div>
    </Transition>

    <!-- ── Comparison modal ── -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="comparisonModalOpen"
          class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto"
          @click.self="closeComparison"
        >
          <div class="min-h-screen flex items-start justify-center p-4 py-10">
            <div class="relative w-full max-w-6xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden" @click.stop>

              <!-- Modal header -->
              <div class="bg-gradient-to-r from-[#246BFD] to-[#5089FF] px-8 py-6 flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold text-white">Medication Comparison</h2>
                  <p class="text-blue-100 text-sm mt-0.5">Comparing {{ comparisonList.length }} medication{{ comparisonList.length > 1 ? 's' : '' }} side by side</p>
                </div>
                <button @click="closeComparison" class="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="overflow-x-auto">
                <div class="min-w-max">

                  <!-- Medication header cards -->
                  <div class="grid border-b border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="p-6 bg-gray-50 dark:bg-gray-800/50"></div>
                    <div
                      v-for="med in comparisonList"
                      :key="`head-${med.id}`"
                      class="p-6 flex flex-col items-center gap-3 border-l border-gray-100 dark:border-gray-800 relative"
                    >
                      <!-- Best value badge -->
                      <div v-if="isBestValue(med)" class="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        Best Value
                      </div>

                      <div class="w-24 h-24 rounded-2xl overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700 bg-gray-50 dark:bg-gray-800 shrink-0">
                        <LazyImage :src="med.image" :alt="med.name" aspectRatio="square" className="w-full h-full object-cover" />
                      </div>
                      <div class="text-center">
                        <p class="font-bold text-gray-900 dark:text-white text-sm leading-snug">{{ med.name }}</p>
                        <p v-if="med.brand_name" class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{{ med.brand_name }}</p>
                      </div>
                      <button
                        @click="viewMedication(med)"
                        class="text-xs text-[#246BFD] hover:text-[#5089FF] font-semibold transition-colors"
                      >
                        View details →
                      </button>
                    </div>
                  </div>

                  <!-- ── Section: Pricing ── -->
                  <div class="px-6 pt-5 pb-2 bg-gray-50/60 dark:bg-gray-800/30">
                    <p class="text-[10px] uppercase font-black tracking-widest text-gray-400">Pricing</p>
                  </div>

                  <!-- Price from (cheapest across pharmacies, or fallback from list data) -->
                  <div class="grid border-b border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-4 flex items-center bg-gray-50/60 dark:bg-gray-800/30">
                      <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Price from</span>
                    </div>
                    <div
                      v-for="med in comparisonList"
                      :key="`price-${med.id}`"
                      class="px-6 py-4 flex flex-col items-center justify-center border-l border-gray-100 dark:border-gray-800"
                      :class="isBestValue(med) ? 'bg-emerald-50/50 dark:bg-emerald-900/10' : ''"
                    >
                      <!-- Use live price from cheapest pharmacy when loaded -->
                      <template v-if="pharmaciesFor(med)?.length">
                        <span class="text-2xl font-black" :class="isBestValue(med) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">
                          GH₵{{ effectivePriceFor(pharmaciesFor(med)![0]).toFixed(2) }}
                        </span>
                        <span v-if="isBestValue(med) && comparisonList.length > 1" class="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 uppercase tracking-wide">Lowest price</span>
                      </template>
                      <!-- Loading -->
                      <div v-else-if="loadingPrices" class="h-8 w-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                      <!-- Fallback to list data -->
                      <template v-else-if="effectivePrice(med) !== null">
                        <span class="text-2xl font-black" :class="isBestValue(med) ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">
                          GH₵{{ effectivePrice(med)!.toFixed(2) }}
                        </span>
                      </template>
                      <span v-else class="text-sm text-gray-400 italic">Visit branch</span>
                    </div>
                  </div>

                  <!-- ── Section: Availability & Pricing ── -->
                  <div class="px-6 pt-5 pb-2 bg-gray-50/60 dark:bg-gray-800/30">
                    <p class="text-[10px] uppercase font-black tracking-widest text-gray-400">Pharmacy Prices</p>
                  </div>

                  <!-- Live pharmacy prices -->
                  <div class="grid border-b border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-4 flex items-start bg-gray-50/60 dark:bg-gray-800/30">
                      <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Available At</span>
                    </div>
                    <div
                      v-for="med in comparisonList"
                      :key="`avail-${med.id}`"
                      class="px-4 py-4 border-l border-gray-100 dark:border-gray-800 flex flex-col gap-2"
                      :class="isMostAvailable(med) && comparisonList.length > 1 ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''"
                    >
                      <!-- Loading skeleton -->
                      <template v-if="loadingPrices && !pharmaciesFor(med)">
                        <div v-for="i in 3" :key="i" class="h-10 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse"></div>
                      </template>

                      <!-- Pharmacy rows -->
                      <template v-else-if="pharmaciesFor(med)?.length">
                        <div
                          v-for="p in pharmaciesFor(med)!.slice(0, 4)"
                          :key="p.pharmacy_id"
                          class="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                          :class="isBestValue(med) && effectivePriceFor(p) === lowestPrice ? 'border-emerald-200 dark:border-emerald-700/40 bg-emerald-50/50 dark:bg-emerald-900/10' : ''"
                        >
                          <!-- Pharmacy logo or initial -->
                          <div class="w-7 h-7 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 shrink-0 flex items-center justify-center">
                            <img v-if="p.pharmacy_logo" :src="p.pharmacy_logo" :alt="p.pharmacy_name" class="w-full h-full object-cover" />
                            <span v-else class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase">
                              {{ p.pharmacy_name?.charAt(0) }}
                            </span>
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="text-[11px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">{{ p.pharmacy_name }}</p>
                            <p v-if="p.branch_name" class="text-[9px] text-gray-400 truncate leading-tight">{{ p.branch_name }}</p>
                          </div>
                          <div class="text-right shrink-0">
                            <p class="text-xs font-black" :class="p.discount_price ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'">
                              GH₵{{ effectivePriceFor(p).toFixed(2) }}
                            </p>
                            <p v-if="p.discount_price" class="text-[9px] text-gray-400 line-through leading-tight">
                              GH₵{{ p.price.toFixed(2) }}
                            </p>
                          </div>
                        </div>

                        <!-- Overflow indicator -->
                        <p v-if="pharmaciesFor(med)!.length > 4" class="text-[10px] text-center text-gray-400 font-medium">
                          +{{ pharmaciesFor(med)!.length - 4 }} more {{ pharmaciesFor(med)!.length - 4 === 1 ? 'pharmacy' : 'pharmacies' }}
                        </p>

                        <!-- Widest reach label -->
                        <span v-if="isMostAvailable(med) && comparisonList.length > 1" class="text-[10px] text-[#246BFD] font-bold uppercase tracking-wide text-center">
                          Widest reach · {{ med.pharmacy_count }} {{ med.pharmacy_count === 1 ? 'pharmacy' : 'pharmacies' }}
                        </span>
                      </template>

                      <!-- No data -->
                      <template v-else>
                        <p class="text-xs text-gray-400 italic text-center py-2">No pharmacy data available</p>
                      </template>
                    </div>
                  </div>

                  <!-- ── Section: Clinical Details ── -->
                  <div class="px-6 pt-5 pb-2 bg-gray-50/60 dark:bg-gray-800/30">
                    <p class="text-[10px] uppercase font-black tracking-widest text-gray-400">Clinical Details</p>
                  </div>

                  <!-- Prescription required -->
                  <div class="grid border-b border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-4 flex items-center bg-gray-50/60 dark:bg-gray-800/30">
                      <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Prescription</span>
                    </div>
                    <div
                      v-for="med in comparisonList"
                      :key="`rx-${med.id}`"
                      class="px-6 py-4 flex items-center justify-center border-l border-gray-100 dark:border-gray-800"
                    >
                      <span v-if="med.requiresPrescription" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-200 dark:border-amber-700/40">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                        Required
                      </span>
                      <span v-else class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-700/40">
                        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        OTC
                      </span>
                    </div>
                  </div>

                  <!-- Categories -->
                  <div class="grid border-b border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-4 flex items-center bg-gray-50/60 dark:bg-gray-800/30">
                      <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Category</span>
                    </div>
                    <div
                      v-for="med in comparisonList"
                      :key="`cat-${med.id}`"
                      class="px-6 py-4 flex flex-wrap gap-1.5 justify-center items-center border-l border-gray-100 dark:border-gray-800"
                    >
                      <template v-if="getCategoryNames(med.category).length">
                        <span
                          v-for="name in getCategoryNames(med.category)"
                          :key="name"
                          class="px-2.5 py-1 text-xs font-medium rounded-full bg-[#246BFD]/10 text-[#246BFD] dark:bg-[#246BFD]/20"
                        >
                          {{ name }}
                        </span>
                      </template>
                      <span v-else class="text-xs text-gray-400 italic">—</span>
                    </div>
                  </div>

                  <!-- Available forms -->
                  <div class="grid border-b border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-4 flex items-center bg-gray-50/60 dark:bg-gray-800/30">
                      <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Available Forms</span>
                    </div>
                    <div
                      v-for="med in comparisonList"
                      :key="`forms-${med.id}`"
                      class="px-6 py-4 flex flex-wrap gap-1.5 justify-center items-center border-l border-gray-100 dark:border-gray-800"
                    >
                      <template v-if="med.forms?.length">
                        <span
                          v-for="form in med.forms.slice(0, 4)"
                          :key="form.id"
                          class="px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full font-medium"
                        >
                          {{ form.form_name }}
                        </span>
                        <span v-if="med.forms.length > 4" class="text-xs text-gray-400 font-medium">+{{ med.forms.length - 4 }} more</span>
                      </template>
                      <span v-else class="text-xs text-gray-400 italic">—</span>
                    </div>
                  </div>

                  <!-- Brands -->
                  <div class="grid border-b border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-4 flex items-center bg-gray-50/60 dark:bg-gray-800/30">
                      <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Brands</span>
                    </div>
                    <div
                      v-for="med in comparisonList"
                      :key="`brands-${med.id}`"
                      class="px-6 py-4 flex flex-wrap gap-1.5 justify-center items-center border-l border-gray-100 dark:border-gray-800"
                    >
                      <template v-if="med.brands?.length">
                        <span
                          v-for="brand in med.brands.slice(0, 3)"
                          :key="brand.id"
                          class="px-2.5 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-full font-medium"
                        >
                          {{ brand.name }}
                        </span>
                        <span v-if="med.brands.length > 3" class="text-xs text-gray-400 font-medium">+{{ med.brands.length - 3 }} more</span>
                      </template>
                      <span v-else class="text-xs text-gray-400 italic">—</span>
                    </div>
                  </div>

                  <!-- ── Section: About ── -->
                  <div class="px-6 pt-5 pb-2 bg-gray-50/60 dark:bg-gray-800/30">
                    <p class="text-[10px] uppercase font-black tracking-widest text-gray-400">About</p>
                  </div>

                  <!-- Description -->
                  <div class="grid" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-4 flex items-start bg-gray-50/60 dark:bg-gray-800/30">
                      <span class="text-sm font-semibold text-gray-600 dark:text-gray-400">Description</span>
                    </div>
                    <div
                      v-for="med in comparisonList"
                      :key="`desc-${med.id}`"
                      class="px-6 py-4 border-l border-gray-100 dark:border-gray-800"
                    >
                      <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
                        {{ med.description || 'No description available.' }}
                      </p>
                    </div>
                  </div>

                  <!-- Action row -->
                  <div class="grid bg-gray-50 dark:bg-gray-800/60 border-t-2 border-gray-100 dark:border-gray-800" :style="{ gridTemplateColumns: gridCols }">
                    <div class="px-6 py-5"></div>
                    <div
                      v-for="med in comparisonList"
                      :key="`action-${med.id}`"
                      class="px-6 py-5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800"
                    >
                      <button
                        @click="viewMedication(med)"
                        class="w-full max-w-[160px] py-2.5 rounded-xl text-sm font-bold transition-all"
                        :class="isBestValue(med)
                          ? 'bg-[#246BFD] text-white hover:bg-[#5089FF] shadow-md shadow-[#246BFD]/30'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-[#246BFD] hover:text-[#246BFD]'"
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.float-up-enter-active,
.float-up-leave-active { transition: all 0.3s cubic-bezier(.4,0,.2,1); }
.float-up-enter-from,
.float-up-leave-to { opacity: 0; transform: translateY(16px); }

.modal-enter-active,
.modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
