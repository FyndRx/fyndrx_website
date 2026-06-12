<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { favoritesService } from '@/services/favoritesService';
import type { FavoriteDrug } from '@/services/favoritesService';
import type { Pharmacy } from '@/models/Pharmacy';
import { formatDate } from '@/utils/date';
import LazyImage from '@/components/LazyImage.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import EmptyState from '@/components/EmptyState.vue';

const router = useRouter();

const drugs = ref<FavoriteDrug[]>([]);
const pharmacies = ref<Pharmacy[]>([]);
const totalDrugs = ref(0);
const totalPharmacies = ref(0);
const loading = ref(true);
const activeTab = ref<'all' | 'medications' | 'pharmacies'>('all');
const isClearing = ref(false);

const totalFavorites = computed(() => totalDrugs.value + totalPharmacies.value);
const displayedMeds = computed(() => activeTab.value === 'pharmacies' ? [] : drugs.value);
const displayedPharmacies = computed(() => activeTab.value === 'medications' ? [] : pharmacies.value);

// ─── Medication helpers ───────────────────────────────────────────────────────

const drugName = (d: FavoriteDrug) => d.product?.name ?? d.drug?.name ?? 'Unknown medication';
const drugImage = (d: FavoriteDrug) => d.product?.image ?? null;
const drugDescription = (d: FavoriteDrug) => d.product?.description ?? null;
const drugPharmacyCount = (d: FavoriteDrug) => d.product?.pharmacy_count ?? null;
const drugItemId = (d: FavoriteDrug) => d.product?.id ?? d.drug?.id ?? d.id;
const requiresPrescription = (d: FavoriteDrug) =>
  d.product?.requires_prescription ?? d.drug?.requires_prescription ?? false;

// ─── Pharmacy helpers ─────────────────────────────────────────────────────────


const SERVICE_COLORS: Record<string, string> = {
  consultation: 'bg-teal-50 text-teal-700 dark:bg-teal-900/20 dark:text-teal-400',
  delivery:     'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  maternal:     'bg-pink-50 text-pink-700 dark:bg-pink-900/20 dark:text-pink-400',
  vaccination:  'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400',
  diagnostic:   'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
  insurance:    'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
  '24/7':       'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
};

const nearestBranch = (p: Pharmacy) => (p as any).branches?.[0] ?? null;

// ─── Data loading ─────────────────────────────────────────────────────────────

const loadFavorites = async () => {
  loading.value = true;
  try {
    const [drugsResult, pharmsResult] = await Promise.all([
      favoritesService.getFavoriteDrugs(),
      favoritesService.getFavoritePharmacies(),
    ]);
    drugs.value = drugsResult.data;
    totalDrugs.value = drugsResult.total;
    pharmacies.value = pharmsResult.data;
    totalPharmacies.value = pharmsResult.total;
  } catch (err) {
    console.error('Failed to load favorites:', err);
  } finally {
    loading.value = false;
  }
};

// ─── Actions ──────────────────────────────────────────────────────────────────

const viewMedication = (d: FavoriteDrug) => {
  const id = d.product?.id ?? d.drug?.id;
  if (id) router.push({ name: 'MedicationDetail', params: { id } });
};

const viewPharmacy = (p: Pharmacy) => {
  router.push({ name: 'pharmacy', params: { id: p.id } });
};

const onDrugToggled = (d: FavoriteDrug, favorited: boolean) => {
  if (!favorited) {
    drugs.value = drugs.value.filter(x => x.id !== d.id);
    totalDrugs.value = Math.max(0, totalDrugs.value - 1);
  }
};

const onPharmacyToggled = (p: Pharmacy, favorited: boolean) => {
  if (!favorited) {
    pharmacies.value = pharmacies.value.filter(x => x.id !== p.id);
    totalPharmacies.value = Math.max(0, totalPharmacies.value - 1);
  }
};

const clearAllMedications = async () => {
  if (!drugs.value.length || !confirm('Remove all saved medications?')) return;
  isClearing.value = true;
  try {
    await favoritesService.bulkRemoveDrugs(drugs.value.map(d => d.id));
    drugs.value = [];
    totalDrugs.value = 0;
  } finally {
    isClearing.value = false;
  }
};

onMounted(() => { loadFavorites(); });
</script>

<template>
  <div class="min-h-screen pt-20 pb-16 bg-gray-50 dark:bg-gray-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

      <!-- ── Header ── -->
      <div class="mb-8">
        <div class="flex items-start justify-between mb-6">
          <div class="flex items-center gap-4">
            <div class="p-3 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-2xl shadow-sm">
              <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white">My Favorites</h1>
              <p class="text-gray-500 dark:text-gray-400 mt-0.5">
                <span v-if="!loading">{{ totalFavorites }} {{ totalFavorites === 1 ? 'item' : 'items' }} saved</span>
                <span v-else class="inline-block w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
              </p>
            </div>
          </div>
          <button
            v-if="drugs.length > 0 && activeTab !== 'pharmacies'"
            @click="clearAllMedications"
            :disabled="isClearing"
            class="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {{ isClearing ? 'Clearing…' : 'Clear medications' }}
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 p-1 bg-white dark:bg-gray-800 rounded-2xl shadow-sm w-full max-w-sm">
          <button
            v-for="tab in [
              { key: 'all', label: 'All', count: totalFavorites },
              { key: 'medications', label: 'Medications', count: totalDrugs },
              { key: 'pharmacies', label: 'Pharmacies', count: totalPharmacies },
            ]"
            :key="tab.key"
            @click="activeTab = tab.key as typeof activeTab"
            :class="[
              'flex-1 px-3 py-2 text-xs font-bold rounded-xl transition-all',
              activeTab === tab.key
                ? 'bg-[#246BFD] text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white',
            ]"
          >
            {{ tab.label }} <span class="opacity-70">({{ tab.count }})</span>
          </button>
        </div>
      </div>

      <!-- ── Loading skeleton ── -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden animate-pulse">
          <div class="h-44 bg-gray-200 dark:bg-gray-700"></div>
          <div class="p-5 space-y-3">
            <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div class="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5"></div>
          </div>
        </div>
      </div>

      <!-- ── Empty state ── -->
      <EmptyState
        v-else-if="totalFavorites === 0"
        type="favorites"
        message="Nothing saved yet. Browse medications and pharmacies to add favorites."
        @action="router.push({ name: 'medications' })"
      />

      <template v-else>

        <!-- ════════════ MEDICATION CARDS ════════════ -->
        <section v-if="displayedMeds.length" class="mb-14">
          <h2 class="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white mb-5">
            <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Medications
            <span class="text-sm font-normal text-gray-400">({{ totalDrugs }})</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="drug in displayedMeds"
              :key="drug.id"
              @click="viewMedication(drug)"
              class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 flex flex-col"
            >
              <!-- ── Image section ── -->
              <div class="relative h-44 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-700 dark:to-gray-700 overflow-hidden shrink-0">
                <LazyImage
                  v-if="drugImage(drug)"
                  :src="drugImage(drug)!"
                  :alt="drugName(drug)"
                  aspectRatio="landscape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <!-- Placeholder -->
                <div v-else class="absolute inset-0 flex flex-col items-center justify-center gap-2">
                  <svg class="w-14 h-14 text-blue-200 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>

                <!-- Gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                <!-- Top-left: favourite button -->
                <div class="absolute top-3 left-3 z-10" @click.stop>
                  <FavoriteButton type="medication" :item-id="drugItemId(drug)" size="small" @toggled="(v) => onDrugToggled(drug, v)" />
                </div>

                <!-- Top-right: Rx badge -->
                <div v-if="requiresPrescription(drug)" class="absolute top-3 right-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black rounded-full bg-amber-500 text-white shadow-sm uppercase tracking-wide">
                    <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>
                    Rx
                  </span>
                </div>

                <!-- Bottom: pharmacy count -->
                <div v-if="drugPharmacyCount(drug)" class="absolute bottom-3 right-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full bg-white/90 dark:bg-gray-900/80 text-gray-800 dark:text-white shadow-sm backdrop-blur-sm">
                    <svg class="w-3 h-3 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    {{ drugPharmacyCount(drug) }} {{ drugPharmacyCount(drug) === 1 ? 'pharmacy' : 'pharmacies' }}
                  </span>
                </div>
              </div>

              <!-- ── Content section ── -->
              <div class="flex flex-col flex-1 p-5">
                <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors leading-snug mb-2 line-clamp-2">
                  {{ drugName(drug) }}
                </h3>

                <p v-if="drugDescription(drug)" class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
                  {{ drugDescription(drug) }}
                </p>
                <p v-else class="text-sm text-gray-400 dark:text-gray-500 italic flex-1">No description available.</p>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-3 mt-3 border-t border-gray-100 dark:border-gray-700">
                  <div class="flex items-center gap-1 text-[11px] text-gray-400 dark:text-gray-500">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                    Saved {{ formatDate(drug.saved_at) }}
                  </div>
                  <button
                    @click.stop="viewMedication(drug)"
                    class="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#246BFD] text-white hover:bg-[#5089FF] transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Medications empty state -->
        <div v-else-if="activeTab === 'medications'" class="text-center py-16">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-4">No saved medications yet</p>
          <button @click="router.push({ name: 'medications' })" class="px-5 py-2.5 bg-[#246BFD] text-white text-sm font-semibold rounded-xl hover:bg-[#5089FF] transition-colors">Browse Medications</button>
        </div>

        <!-- ════════════ PHARMACY CARDS ════════════ -->
        <section v-if="displayedPharmacies.length" class="mb-14">
          <h2 class="flex items-center gap-2 text-lg font-bold text-gray-800 dark:text-white mb-5">
            <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Pharmacies
            <span class="text-sm font-normal text-gray-400">({{ totalPharmacies }})</span>
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article
              v-for="pharmacy in displayedPharmacies"
              :key="pharmacy.id"
              @click="viewPharmacy(pharmacy)"
              class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 flex flex-col"
            >
              <!-- ── Banner image ── -->
              <div class="relative h-44 shrink-0 overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-100 dark:from-gray-700 dark:to-gray-700">
                <LazyImage
                  v-if="pharmacy.image"
                  :src="pharmacy.image"
                  :alt="pharmacy.name"
                  aspectRatio="landscape"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <!-- Placeholder -->
                <div v-else class="absolute inset-0 flex items-center justify-center">
                  <svg class="w-16 h-16 text-emerald-200 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>

                <!-- Gradient overlay -->
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

                <!-- Top-left: favourite button -->
                <div class="absolute top-3 left-3 z-10" @click.stop>
                  <FavoriteButton type="pharmacy" :item-id="pharmacy.id" size="small" @toggled="(v) => onPharmacyToggled(pharmacy, v)" />
                </div>

                <!-- Top-right: Open/Closed + 24/7 -->
                <div class="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black rounded-full shadow backdrop-blur-sm"
                    :class="pharmacy.isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-white" :class="pharmacy.isOpen ? 'animate-pulse' : 'opacity-50'"></span>
                    {{ pharmacy.isOpen ? 'Open now' : 'Closed' }}
                  </span>
                  <span v-if="pharmacy.services?.some(s => s.slug === '24/7' || s.name === '24/7')" class="px-2.5 py-1 text-[11px] font-black rounded-full bg-amber-500 text-white shadow">24/7</span>
                </div>

                <!-- Bottom-left: pharmacy logo -->
                <div class="absolute bottom-3 left-3">
                  <div class="w-12 h-12 rounded-xl overflow-hidden ring-2 ring-white dark:ring-gray-800 bg-white dark:bg-gray-800 shadow-md flex items-center justify-center">
                    <img v-if="pharmacy.logo" :src="pharmacy.logo" :alt="pharmacy.name" class="w-full h-full object-cover" />
                    <svg v-else class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>

                <!-- Bottom-right: rating + distance -->
                <div class="absolute bottom-3 right-3 flex items-center gap-1.5">
                  <span v-if="pharmacy.rating" class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <svg class="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    {{ pharmacy.rating?.toFixed(1) }}
                  </span>
                  <span v-if="pharmacy.distance" class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-black/50 text-white backdrop-blur-sm">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    {{ pharmacy.distance }}
                  </span>
                </div>
              </div>

              <!-- ── Content section ── -->
              <div class="flex flex-col flex-1 p-5">

                <!-- Name + address -->
                <h3 class="font-bold text-gray-900 dark:text-white group-hover:text-[#246BFD] transition-colors leading-snug mb-1">
                  {{ pharmacy.name }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1 mb-4">
                  <svg class="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  <span class="line-clamp-2">{{ pharmacy.address }}</span>
                </p>

                <!-- Services — all of them -->
                <div v-if="pharmacy.services?.length" class="flex flex-wrap gap-1.5 mb-4">
                  <span
                    v-for="svc in pharmacy.services.filter(s => s.slug !== '24/7' && s.name !== '24/7')"
                    :key="svc.slug || svc.id"
                    :class="['px-2 py-0.5 text-[11px] font-semibold rounded-full', SERVICE_COLORS[svc.category] ?? SERVICE_COLORS[svc.slug] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300']"
                  >
                    {{ svc.name }}
                  </span>
                </div>

                <!-- Nearest branch -->
                <div
                  v-if="nearestBranch(pharmacy)"
                  class="flex items-start gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-4"
                >
                  <svg class="w-4 h-4 text-[#246BFD] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <div class="min-w-0">
                    <p class="text-[10px] font-black text-[#246BFD] uppercase tracking-wide leading-none mb-0.5">
                      Nearest Branch{{ (pharmacy as any).branchesCount > 1 ? ` · ${(pharmacy as any).branchesCount} total` : '' }}
                    </p>
                    <p class="text-xs text-gray-700 dark:text-gray-300 font-medium truncate">
                      {{ nearestBranch(pharmacy).branchName ?? nearestBranch(pharmacy).branch_name }}
                    </p>
                    <p v-if="nearestBranch(pharmacy).address" class="text-[11px] text-gray-400 truncate">
                      {{ nearestBranch(pharmacy).address }}
                    </p>
                  </div>
                </div>
                <div
                  v-else-if="pharmacy.branchesCount > 0"
                  class="flex items-center gap-2 px-2.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 mb-4"
                >
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                  <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">{{ pharmacy.branchesCount }} branch{{ pharmacy.branchesCount > 1 ? 'es' : '' }}</span>
                </div>

                <!-- Footer -->
                <div class="flex items-center justify-between pt-3 mt-auto border-t border-gray-100 dark:border-gray-700">
                  <div v-if="pharmacy.totalReviews" class="text-[11px] text-gray-400">
                    {{ pharmacy.totalReviews }} review{{ pharmacy.totalReviews !== 1 ? 's' : '' }}
                  </div>
                  <div v-else class="text-[11px] text-gray-400">Saved pharmacy</div>
                  <button
                    @click.stop="viewPharmacy(pharmacy)"
                    class="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#246BFD] text-white hover:bg-[#5089FF] transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </article>
          </div>
        </section>

        <!-- Pharmacies empty state -->
        <div v-else-if="activeTab === 'pharmacies'" class="text-center py-16">
          <svg class="w-16 h-16 mx-auto mb-4 text-gray-200 dark:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p class="text-gray-500 dark:text-gray-400 mb-4">No saved pharmacies yet</p>
          <button @click="router.push({ name: 'pharmacies' })" class="px-5 py-2.5 bg-[#246BFD] text-white text-sm font-semibold rounded-xl hover:bg-[#5089FF] transition-colors">Browse Pharmacies</button>
        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
