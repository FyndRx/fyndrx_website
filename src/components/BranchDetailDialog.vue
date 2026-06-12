<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import type { PharmacyBranch } from '@/models/Pharmacy';
import { isPharmacyOpenNow } from '@/utils/responseTransformers';

const props = defineProps<{
  branch: PharmacyBranch;
  pharmacyName: string;
  pharmacyLogo?: string;
}>();

const emit = defineEmits<{ close: [] }>();

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close');
}
onMounted(() => {
  document.addEventListener('keydown', onKeydown);
  document.body.style.overflow = 'hidden';
});
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});

const DAYS_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const todayKey = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
);

const hoursRows = computed(() => {
  const wh = props.branch.workingHours;
  if (!wh) return [];
  return DAYS_ORDER.map(day => ({
    day: day.charAt(0).toUpperCase() + day.slice(1),
    key: day,
    value: (wh as any)[day] ?? '–',
  }));
});

const servicesByCategory = computed(() => {
  const services = props.branch.services ?? [];
  const map = new Map<string, typeof services>();
  for (const s of services) {
    const cat = s.category || 'other';
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(s);
  }
  return [...map.entries()].map(([cat, svcs]) => ({ cat, svcs }));
});

const CATEGORY_COLORS: Record<string, string> = {
  dispensing:  'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800/30',
  clinical:    'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-100 dark:border-teal-800/30',
  diagnostic:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-100 dark:border-amber-800/30',
  lab:         'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border-purple-100 dark:border-purple-800/30',
  delivery:    'bg-[#246BFD]/8 dark:bg-[#246BFD]/15 text-[#246BFD] border-[#246BFD]/15',
  wellness:    'bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300 border-pink-100 dark:border-pink-800/30',
  specialized: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800/30',
  operational: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600/30',
};

const STORAGE_LABELS: Record<string, string> = {
  cold_chain: 'Cold Chain',
  controlled_vault: 'Controlled Vault',
  refrigeration: 'Refrigerated',
  ambient: 'Ambient',
};

const isCurrentlyOpen = computed(() => {
  const wh = props.branch.workingHours;
  if (wh && Object.values(wh).some(v => v !== '')) return isPharmacyOpenNow(wh);
  return props.branch.isOpen ?? false;
});

const lat = computed(() => props.branch.location?.lat ?? (props.branch.latitude ? Number(props.branch.latitude) : null));
const lng = computed(() => props.branch.location?.lng ?? (props.branch.longitude ? Number(props.branch.longitude) : null));
const mapsUrl = computed(() =>
  lat.value && lng.value ? `https://www.google.com/maps/dir/?api=1&destination=${lat.value},${lng.value}` : null
);

const locationLine = computed(() => {
  const parts = [props.branch.city, props.branch.region].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
});

const whatsappUrl = computed(() =>
  props.branch.whatsappNumber
    ? `https://wa.me/${props.branch.whatsappNumber.replace(/\D/g, '')}`
    : null
);
</script>

<script lang="ts">
export default { name: 'BranchDetailDialog' }
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="$emit('close')"></div>

      <!-- Panel -->
      <div class="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <!-- ── Hero Banner ── -->
        <div class="flex-shrink-0">
          <div class="h-40 relative overflow-hidden" :class="!branch.bannerImage ? 'bg-gradient-to-br from-[#246BFD] to-[#5089FF]' : ''">
            <img
              v-if="branch.bannerImage"
              :src="branch.bannerImage"
              :alt="branch.branchName"
              class="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>

            <!-- Close -->
            <button
              @click="$emit('close')"
              class="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 flex items-center justify-center transition-colors z-10"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>

            <!-- Identity strip — inside banner so absolute stays scoped -->
            <div class="absolute bottom-0 left-0 right-0 px-6 pb-4 flex items-end gap-4">
              <!-- Pharmacy logo ring (no branch logo) -->
              <div class="w-14 h-14 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center flex-shrink-0 ring-2 ring-white/30 overflow-hidden">
                <img v-if="pharmacyLogo" :src="pharmacyLogo" class="w-full h-full object-cover" :alt="pharmacyName" />
                <svg v-else class="w-7 h-7 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                </svg>
              </div>
              <div class="pb-0.5 min-w-0 flex-1">
                <p class="text-[11px] font-semibold text-white/70 uppercase tracking-wider truncate">{{ pharmacyName }}</p>
                <h2 class="text-xl font-black text-white leading-tight truncate">{{ branch.branchName }}</h2>
              </div>
              <!-- Rating badge in banner -->
              <div v-if="(branch.rating ?? 0) > 0" class="flex-shrink-0 flex flex-col items-center justify-center bg-white/15 backdrop-blur-sm rounded-2xl px-3 py-2">
                <span class="text-xl font-black text-white leading-none">{{ branch.rating?.toFixed(1) }}</span>
                <div class="flex gap-px mt-0.5">
                  <svg v-for="i in 5" :key="i" class="w-2.5 h-2.5" :class="i <= Math.round(branch.rating ?? 0) ? 'text-amber-400 fill-amber-400' : 'text-white/40 fill-white/40'" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span class="text-[9px] text-white/60 mt-0.5">{{ branch.totalReviews }} reviews</span>
              </div>
            </div>
          </div>

          <!-- Status + capability strip -->
          <div class="px-6 pt-3 pb-3 flex items-center gap-2 flex-wrap bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full"
              :class="isCurrentlyOpen ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="isCurrentlyOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'"></span>
              {{ isCurrentlyOpen ? 'Open Now' : 'Closed' }}
            </span>

            <span v-if="branch.isActive === false" class="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              Inactive
            </span>

            <span
              v-if="branch.acceptsOnlinePrescriptions"
              class="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            >
              <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
              Online Rx
            </span>

            <span
              v-for="s in (branch.specialStorage ?? [])"
              :key="s"
              class="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400"
            >
              {{ STORAGE_LABELS[s] ?? s }}
            </span>

            <span v-if="branch.distance" class="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              📍 {{ branch.distance }}
            </span>

            <!-- Payment methods — pushed right -->
            <div v-if="(branch.acceptedPaymentMethods ?? []).length > 0" class="ml-auto flex gap-1.5">
              <span
                v-for="m in branch.acceptedPaymentMethods"
                :key="m"
                class="px-2.5 py-1 text-[10px] font-bold rounded-full"
                :class="m === 'platform' ? 'bg-[#246BFD]/10 text-[#246BFD]' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'"
              >{{ m === 'platform' ? 'Online Pay' : 'Cash / POS' }}</span>
            </div>
          </div>

          <!-- Description -->
          <p
            v-if="branch.description"
            class="px-6 py-3 text-sm text-gray-500 dark:text-gray-400 italic leading-relaxed border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50"
          >
            {{ branch.description }}
          </p>
        </div>

        <!-- ── Scrollable Body ── -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6 space-y-7">

            <!-- ── Contact & Location grid ── -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <!-- Address -->
              <div class="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
                <div class="w-9 h-9 rounded-xl bg-[#246BFD]/10 text-[#246BFD] flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Address</p>
                  <p class="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{{ branch.address }}</p>
                  <p v-if="locationLine" class="text-xs font-medium text-[#246BFD] mt-0.5">{{ locationLine }}</p>
                  <p v-if="branch.digitalAddress" class="text-xs font-mono text-gray-400 mt-0.5">{{ branch.digitalAddress }}</p>
                  <a v-if="mapsUrl" :href="mapsUrl" target="_blank" class="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#246BFD] hover:underline">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                    Get Directions
                  </a>
                </div>
              </div>

              <!-- Contact -->
              <div class="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
                <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Contact</p>
                  <a :href="`tel:${branch.phone}`" class="text-sm font-bold text-gray-900 dark:text-white hover:text-[#246BFD] transition-colors block">{{ branch.phone }}</a>
                  <a
                    v-if="branch.whatsappNumber"
                    :href="whatsappUrl!"
                    target="_blank"
                    class="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
                  >
                    <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                    WhatsApp
                  </a>
                  <a v-if="branch.email" :href="`mailto:${branch.email}`" class="text-xs text-gray-500 dark:text-gray-400 hover:text-[#246BFD] transition-colors block mt-0.5 truncate">{{ branch.email }}</a>
                  <a v-if="branch.website" :href="branch.website" target="_blank" class="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#246BFD] transition-colors mt-0.5">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                    Website
                  </a>
                </div>
              </div>

              <!-- Branch Manager — distinct purple card -->
              <div v-if="branch.managerName" class="flex items-start gap-3 p-4 rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30">
                <div class="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <div class="min-w-0">
                  <p class="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1">Branch Manager</p>
                  <p class="text-sm font-bold text-gray-900 dark:text-white">{{ branch.managerName }}</p>
                  <a v-if="branch.managerPhone" :href="`tel:${branch.managerPhone}`" class="text-xs text-purple-600 dark:text-purple-400 hover:underline mt-0.5 block">{{ branch.managerPhone }}</a>
                  <a v-if="branch.managerEmail" :href="`mailto:${branch.managerEmail}`" class="text-xs text-gray-500 dark:text-gray-400 hover:text-[#246BFD] transition-colors block mt-0.5 truncate">{{ branch.managerEmail }}</a>
                </div>
              </div>

              <!-- Languages -->
              <div v-if="(branch.languages ?? []).length > 0" class="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700/50">
                <div class="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center flex-shrink-0">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
                </div>
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Languages</p>
                  <div class="flex flex-wrap gap-1">
                    <span v-for="lang in branch.languages" :key="lang" class="px-2 py-0.5 text-xs font-semibold rounded-md bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300">{{ lang }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Delivery ── -->
            <div
              v-if="branch.deliveryInfo"
              class="rounded-2xl border overflow-hidden"
              :class="branch.deliveryInfo.available ? 'border-[#246BFD]/20' : 'border-gray-200 dark:border-gray-700'"
            >
              <div class="px-5 py-3 flex items-center gap-3" :class="branch.deliveryInfo.available ? 'bg-[#246BFD]/5 dark:bg-[#246BFD]/10' : 'bg-gray-50 dark:bg-gray-800'">
                <svg class="w-5 h-5 flex-shrink-0" :class="branch.deliveryInfo.available ? 'text-[#246BFD]' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/>
                </svg>
                <p class="font-bold text-sm" :class="branch.deliveryInfo.available ? 'text-[#246BFD]' : 'text-gray-500 dark:text-gray-400'">
                  {{ branch.deliveryInfo.available ? 'Home Delivery Available' : 'Pickup Only — No Home Delivery' }}
                </p>
              </div>
              <div v-if="branch.deliveryInfo.available" class="px-5 py-4 grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-700">
                <div class="text-center pr-4">
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Base Fee</p>
                  <p class="text-xl font-black text-gray-900 dark:text-white">₵{{ branch.deliveryInfo.baseFee?.toFixed(2) ?? '–' }}</p>
                </div>
                <div class="text-center px-4">
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Per km</p>
                  <p class="text-xl font-black text-gray-900 dark:text-white">₵{{ branch.deliveryInfo.feePerKm?.toFixed(2) ?? '–' }}</p>
                </div>
                <div class="text-center pl-4">
                  <p class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Radius</p>
                  <p class="text-xl font-black text-gray-900 dark:text-white">
                    {{ branch.deliveryInfo.radiusKm ?? '∞' }}<span class="text-sm font-normal text-gray-400"> km</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- ── Operating Hours ── -->
            <div v-if="hoursRows.length > 0">
              <h3 class="text-sm font-black uppercase tracking-widest text-gray-400 mb-3">Operating Hours</h3>
              <div class="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div
                  v-for="row in hoursRows"
                  :key="row.key"
                  class="flex items-center px-4 py-2.5 border-b last:border-b-0 border-gray-100 dark:border-gray-700/60 transition-colors"
                  :class="row.key === todayKey ? 'bg-[#246BFD]/5 dark:bg-[#246BFD]/10' : 'bg-white dark:bg-gray-800'"
                >
                  <div class="flex items-center gap-2 w-28 flex-shrink-0">
                    <span class="text-sm font-semibold capitalize" :class="row.key === todayKey ? 'text-[#246BFD]' : 'text-gray-700 dark:text-gray-300'">{{ row.day }}</span>
                    <span v-if="row.key === todayKey" class="text-[9px] font-black text-white bg-[#246BFD] px-1.5 py-0.5 rounded-full leading-none">TODAY</span>
                  </div>
                  <div class="flex-1 flex justify-end">
                    <span class="text-sm font-bold"
                      :class="[
                        row.value.toLowerCase() === 'closed' ? 'text-red-500 dark:text-red-400' :
                        row.value.toLowerCase().includes('24') ? 'text-emerald-600 dark:text-emerald-400' :
                        row.key === todayKey ? 'text-[#246BFD]' : 'text-gray-900 dark:text-white'
                      ]"
                    >{{ row.value }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ── Services — grouped by category ── -->
            <div v-if="(branch.services ?? []).length > 0">
              <h3 class="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Branch Services</h3>
              <div class="space-y-4">
                <div v-for="group in servicesByCategory" :key="group.cat">
                  <p class="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 capitalize">{{ group.cat }}</p>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="s in group.svcs"
                      :key="s.slug || s.id"
                      class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border"
                      :class="CATEGORY_COLORS[s.category] ?? CATEGORY_COLORS.operational"
                    >{{ s.name }}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- ── Footer ── -->
        <div class="flex-shrink-0 px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-white dark:bg-gray-900">
          <a
            :href="`tel:${branch.phone}`"
            class="flex-1 py-3 rounded-2xl bg-[#246BFD] text-white text-sm font-bold text-center hover:bg-[#1a56d6] active:scale-[0.98] transition-all shadow-lg shadow-blue-500/20"
          >
            Call Branch
          </a>
          <a
            v-if="whatsappUrl"
            :href="whatsappUrl"
            target="_blank"
            class="flex-1 py-3 rounded-2xl bg-emerald-500 text-white text-sm font-bold text-center hover:bg-emerald-600 active:scale-[0.98] transition-all"
          >
            WhatsApp
          </a>
          <a
            v-if="mapsUrl"
            :href="mapsUrl"
            target="_blank"
            class="flex-1 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-bold text-center border border-gray-200 dark:border-gray-700 hover:border-[#246BFD] hover:text-[#246BFD] active:scale-[0.98] transition-all"
          >
            Directions
          </a>
          <button
            @click="$emit('close')"
            class="py-3 px-5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-[0.98] transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>
