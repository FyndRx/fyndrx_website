<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { Pharmacy } from '@/models/Pharmacy';
import LazyImage from '@/components/LazyImage.vue';
import RatingStars from '@/components/RatingStars.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import { reviewService } from '@/services/reviewService';

interface Props {
  pharmacy: Pharmacy;
}

const props = defineProps<Props>();

const rating = ref<{ average: number; count: number }>({ average: 0, count: 0 });

const loadRating = async () => {
  try {
    const stats = await reviewService.getReviewStats('pharmacy', props.pharmacy.id);
    rating.value = { average: stats.averageRating || 0, count: stats.totalReviews || 0 };
  } catch { /* use static rating */ }
};

const pharmacyRating = computed(() => rating.value);

onMounted(loadRating);

const has24_7 = computed(() => (props.pharmacy.services ?? []).some(s => s.slug === '24/7' || s.slug === '24-7' || s.name === '24/7'));

const STORAGE_LABELS: Record<string, string> = {
  cold_chain: 'Cold Chain',
  controlled_vault: 'Controlled Vault',
  refrigeration: 'Refrigerated',
  ambient: 'Ambient',
};

const locationLine = computed(() => {
  const p = props.pharmacy;
  const parts = [p.city, p.region].filter(Boolean);
  return parts.length ? parts.join(', ') : null;
});

const deliveryFeeLabel = computed(() => {
  const d = props.pharmacy.deliveryInfo;
  if (!d?.available) return null;
  if (d.baseFee != null) return `From GHS ${d.baseFee.toFixed(0)}`;
  return 'Available';
});
</script>

<script lang="ts">
export default { name: 'PharmacyCard' }
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden transition-all duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-2xl hover:-translate-y-1.5 border border-gray-100 dark:border-gray-700/50">

    <!-- Image -->
    <div class="relative h-44 overflow-hidden flex-shrink-0">
      <LazyImage
        :src="pharmacy.image"
        :alt="pharmacy.name"
        aspectRatio="landscape"
        className="w-full h-full object-cover"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

      <!-- Top-right: open status + 24/7 -->
      <div class="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold rounded-full shadow backdrop-blur-sm"
          :class="pharmacy.isOpen ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-white" :class="pharmacy.isOpen ? 'animate-pulse' : ''"></span>
          {{ pharmacy.isOpen ? 'Open Now' : 'Closed' }}
        </span>
        <span
          v-if="has24_7"
          class="px-2.5 py-1 text-[11px] font-black rounded-full bg-amber-500 text-white shadow"
        >24/7</span>
      </div>

      <!-- Top-left: favourite + delivery badge -->
      <div class="absolute top-3 left-3 flex flex-col gap-1.5 items-start" @click.stop>
        <FavoriteButton type="pharmacy" :item-id="pharmacy.id" size="small" />
        <span
          v-if="pharmacy.deliveryInfo?.available"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#246BFD] text-white shadow"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
          {{ deliveryFeeLabel }}
        </span>
      </div>

      <!-- Bottom-left: distance if available -->
      <div v-if="pharmacy.distance" class="absolute bottom-3 left-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/></svg>
        {{ pharmacy.distance }}
      </div>
    </div>

    <!-- Body -->
    <div class="flex-1 flex flex-col p-5 gap-3">

      <!-- Name + location -->
      <div>
        <h3 class="text-base font-bold text-gray-900 dark:text-white leading-tight">{{ pharmacy.name }}</h3>
        <p class="mt-0.5 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{{ pharmacy.address }}</p>
        <p v-if="locationLine" class="text-[11px] font-medium text-[#246BFD] mt-0.5">{{ locationLine }}</p>
      </div>

      <!-- Rating + digital address row -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 min-w-0">
          <RatingStars
            v-if="(pharmacyRating.count > 0 || pharmacy.totalReviews > 0)"
            :rating="pharmacyRating.average || pharmacy.rating"
            :count="pharmacyRating.count || pharmacy.totalReviews"
            :show-count="true"
            size="sm"
          />
          <span v-else class="text-xs text-gray-400 dark:text-gray-500 italic">No reviews yet</span>
        </div>
        <span v-if="pharmacy.digitalAddress" class="flex-shrink-0 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          {{ pharmacy.digitalAddress }}
        </span>
      </div>

      <!-- Capability pills: prescriptions, special storage, languages -->
      <div class="flex flex-wrap gap-1">
        <span
          v-if="pharmacy.acceptsOnlinePrescriptions"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30"
        >
          <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
          Online Rx
        </span>
        <span
          v-for="s in (pharmacy.specialStorage ?? []).slice(0, 2)"
          :key="s"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-cyan-50 text-cyan-700 border border-cyan-100 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/30"
        >
          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
          {{ STORAGE_LABELS[s] ?? s }}
        </span>
        <span
          v-if="(pharmacy.languages ?? []).length > 0"
          class="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30"
        >
          <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
          {{ pharmacy.languages!.slice(0, 2).join(' · ') }}
        </span>
      </div>

      <!-- Services -->
      <div v-if="(pharmacy.services ?? []).length > 0">
        <p class="mb-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Services</p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="service in (pharmacy.services ?? []).slice(0, 4)"
            :key="service.slug || service.id"
            class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-[#246BFD] bg-[#246BFD]/5 border border-[#246BFD]/10 rounded-md dark:text-[#5089FF] dark:bg-[#246BFD]/10"
          >
            {{ service.name }}
          </span>
          <span
            v-if="(pharmacy.services ?? []).length > 4"
            class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-100 rounded-md dark:text-gray-500 dark:bg-gray-800 dark:border-gray-700"
          >
            +{{ (pharmacy.services ?? []).length - 4 }}
          </span>
        </div>
      </div>


      <!-- Actions -->
      <div class="mt-auto pt-2 flex gap-2">
        <router-link
          :to="'/pharmacy/' + pharmacy.id"
          class="flex-1 py-2.5 rounded-xl bg-[#246BFD] text-white text-xs font-bold text-center hover:bg-[#1a56d6] active:scale-95 transition-all"
        >
          View Details
        </router-link>
        <a
          v-if="pharmacy.whatsappNumber"
          :href="`https://wa.me/${pharmacy.whatsappNumber.replace(/\D/g, '')}`"
          target="_blank"
          class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all"
          title="WhatsApp"
        >
          <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
        </a>
        <a
          :href="`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location?.lat ?? 0},${pharmacy.location?.lng ?? 0}`"
          target="_blank"
          class="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-[#246BFD] hover:text-[#246BFD] active:scale-95 transition-all"
          title="Directions"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
        </a>
      </div>
    </div>
  </div>
</template>
