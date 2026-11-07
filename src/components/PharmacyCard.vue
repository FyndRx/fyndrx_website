<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import type { Pharmacy } from '@/models/Pharmacy';
import LazyImage from '@/components/LazyImage.vue';
import RatingStars from '@/components/RatingStars.vue';
import FavoriteButton from '@/components/FavoriteButton.vue';
import { reviewService } from '@/services/reviewService';

interface Props {
  pharmacy: Pharmacy;
  /**
   * 'default' is the full card used on the Pharmacies listing.
   * 'compact' is a lighter card for featured rows (e.g. the home page): fewer badges, at most three
   * chips, and no per-card review request (it uses the rating already on the list payload).
   */
  variant?: 'default' | 'compact';
}

const props = withDefaults(defineProps<Props>(), { variant: 'default' });
const isCompact = computed(() => props.variant === 'compact');

const rating = ref<{ average: number; count: number }>({ average: 0, count: 0 });

const loadRating = async () => {
  try {
    const stats = await reviewService.getReviewStats('pharmacy', props.pharmacy.id);
    rating.value = { average: stats.averageRating || 0, count: stats.totalReviews || 0 };
  } catch { /* use static rating */ }
};

const pharmacyRating = computed(() => rating.value);

// A featured row of cards would otherwise fire one review-stats request per card.
onMounted(() => {
  if (!isCompact.value) loadRating();
});

const is24_7Service = (s: { slug?: string; name?: string }) => s.slug === '24/7' || s.slug === '24-7' || s.name === '24/7';
const has24_7 = computed(() => (props.pharmacy.services ?? []).some(is24_7Service));

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
  return 'Delivery available';
});

// Only offer directions when we actually know where the pharmacy is (never route to 0,0).
const hasCoordinates = computed(() => {
  const l = props.pharmacy.location;
  return !!l && Number.isFinite(l.lat) && Number.isFinite(l.lng) && !(l.lat === 0 && l.lng === 0);
});

const directionsUrl = computed(
  () => `https://www.google.com/maps/dir/?api=1&destination=${props.pharmacy.location?.lat},${props.pharmacy.location?.lng}`,
);

const whatsappUrl = computed(() =>
  props.pharmacy.whatsappNumber ? `https://wa.me/${props.pharmacy.whatsappNumber.replace(/\D/g, '')}` : null,
);

const statusLabel = computed(() => {
  if (!props.pharmacy.isOpen) return 'Closed';
  return isCompact.value && has24_7.value ? 'Open 24/7' : 'Open Now';
});

// Compact variant: at most three chips, led by the capability that matters most when ordering.
const compactChips = computed(() => {
  const chips: { label: string; brand: boolean }[] = [];
  if (props.pharmacy.acceptsOnlinePrescriptions) chips.push({ label: 'Online Rx', brand: false });
  for (const service of props.pharmacy.services ?? []) {
    if (chips.length >= 3) break;
    if (is24_7Service(service)) continue; // already shown in the status badge
    chips.push({ label: service.name, brand: true });
  }
  return chips;
});

const chipNeutral =
  'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-gray-900/5 text-gray-700 dark:bg-white/10 dark:text-gray-200';
const chipBrand =
  'inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-brand-500/10 text-brand-700 dark:bg-brand-400/15 dark:text-brand-300';
const iconAction =
  'relative z-20 flex items-center justify-center w-11 h-11 shrink-0 rounded-2xl transition duration-200 ease-out-quart active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30';
</script>

<template>
  <!-- Single root on purpose: callers pass class/style (entrance animation) through to it. -->
  <article
    class="group relative flex flex-col h-full overflow-hidden transition duration-300 ease-out-quart rounded-3xl bg-white/70 backdrop-blur-md shadow-card ring-1 ring-white/70 hover:shadow-card-hover motion-safe:hover:-translate-y-1 focus-within:ring-4 focus-within:ring-brand-500/30 dark:bg-gray-800/60 dark:ring-white/10"
  >
    <!-- Image -->
    <div class="relative overflow-hidden shrink-0" :class="isCompact ? 'h-40' : 'h-44'">
      <!-- No photo: LazyImage shows the FyndRx logo placeholder, as everywhere else on the site -->
      <LazyImage
        :src="pharmacy.image"
        :alt="pharmacy.name"
        aspectRatio="landscape"
        className="w-full h-full object-cover transition-transform duration-500 ease-out-quart group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <!-- Scrim for badge legibility, only over a real photo (it muddies the light placeholder) -->
      <div v-if="pharmacy.image" class="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" aria-hidden="true"></div>

      <!-- Status (and 24/7 on the full card) -->
      <div class="absolute flex flex-col items-end gap-1.5 top-3 right-3">
        <span
          class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white rounded-full shadow-card backdrop-blur-sm"
          :class="pharmacy.isOpen ? 'bg-emerald-600' : 'bg-red-600'"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-white" :class="pharmacy.isOpen ? 'motion-safe:animate-pulse' : ''" aria-hidden="true"></span>
          {{ statusLabel }}
        </span>
        <span
          v-if="!isCompact && has24_7"
          class="px-2.5 py-1 text-xs font-bold text-white rounded-full bg-accent-600 shadow-card"
        >
          24/7
        </span>
      </div>

      <!-- Favourite: sits above the card's stretched link -->
      <div class="absolute z-20 top-3 left-3" @click.stop>
        <FavoriteButton type="pharmacy" :item-id="pharmacy.id" size="small" />
      </div>
    </div>

    <!-- Body -->
    <div class="flex flex-col flex-1 gap-3 p-5">
      <!-- Name (the card's link) + place -->
      <div>
        <h3 class="text-lg font-bold leading-tight text-gray-900 dark:text-white line-clamp-2">
          <router-link
            :to="'/pharmacy/' + pharmacy.id"
            class="after:absolute after:inset-0 after:z-10 focus-visible:outline-none"
          >
            {{ pharmacy.name }}
          </router-link>
        </h3>
        <p v-if="!isCompact && pharmacy.address" class="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{{ pharmacy.address }}</p>
        <p v-if="locationLine" class="mt-0.5 text-sm font-medium text-brand-600 dark:text-brand-300">{{ locationLine }}</p>
      </div>

      <!-- Rating (+ digital address on the full card) -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center min-w-0 gap-1.5">
          <RatingStars
            v-if="(pharmacyRating.count > 0 || pharmacy.totalReviews > 0)"
            :rating="pharmacyRating.average || pharmacy.rating"
            :count="pharmacyRating.count || pharmacy.totalReviews"
            :show-count="true"
            size="sm"
          />
          <span v-else class="text-sm italic text-gray-500 dark:text-gray-400">No reviews yet</span>
        </div>
        <span
          v-if="!isCompact && pharmacy.digitalAddress"
          class="text-xs font-bold tracking-wider text-gray-500 uppercase shrink-0 dark:text-gray-400"
        >
          {{ pharmacy.digitalAddress }}
        </span>
      </div>

      <!-- Key facts: delivery and distance -->
      <ul v-if="deliveryFeeLabel || pharmacy.distance" class="flex flex-wrap items-center text-sm text-gray-700 gap-x-4 gap-y-1 dark:text-gray-200">
        <li v-if="deliveryFeeLabel" class="inline-flex items-center gap-1.5">
          <svg class="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
          </svg>
          {{ deliveryFeeLabel }}
        </li>
        <li v-if="pharmacy.distance" class="inline-flex items-center gap-1.5">
          <svg class="w-4 h-4 text-brand-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
          </svg>
          {{ pharmacy.distance }}
        </li>
      </ul>

      <!-- Compact: at most three chips -->
      <ul v-if="isCompact && compactChips.length" class="flex flex-wrap gap-1.5">
        <li v-for="chip in compactChips" :key="chip.label" :class="chip.brand ? chipBrand : chipNeutral">{{ chip.label }}</li>
      </ul>

      <!-- Full card: capabilities and services -->
      <template v-if="!isCompact">
        <ul
          v-if="pharmacy.acceptsOnlinePrescriptions || (pharmacy.specialStorage ?? []).length || (pharmacy.languages ?? []).length"
          class="flex flex-wrap gap-1.5"
        >
          <li v-if="pharmacy.acceptsOnlinePrescriptions" :class="chipNeutral">
            <svg class="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Online Rx
          </li>
          <li v-for="s in (pharmacy.specialStorage ?? []).slice(0, 2)" :key="s" :class="chipNeutral">
            {{ STORAGE_LABELS[s] ?? s }}
          </li>
          <li v-if="(pharmacy.languages ?? []).length > 0" :class="chipNeutral">
            {{ pharmacy.languages!.slice(0, 2).join(' · ') }}
          </li>
        </ul>

        <div v-if="(pharmacy.services ?? []).length > 0">
          <p class="mb-1.5 text-xs font-semibold tracking-wider text-gray-500 uppercase dark:text-gray-400">Services</p>
          <ul class="flex flex-wrap gap-1.5">
            <li v-for="service in (pharmacy.services ?? []).slice(0, 4)" :key="service.slug || service.id" :class="chipBrand">
              {{ service.name }}
            </li>
            <li
              v-if="(pharmacy.services ?? []).length > 4"
              class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-500 rounded-full bg-gray-900/5 dark:bg-white/10 dark:text-gray-400"
            >
              +{{ (pharmacy.services ?? []).length - 4 }}
            </li>
          </ul>
        </div>
      </template>

      <!-- Actions. The whole card is the link (via the name); the button is the visual affordance for it. -->
      <div class="flex gap-2 pt-2 mt-auto">
        <span
          class="flex items-center justify-center flex-1 py-3 text-sm font-semibold text-white transition duration-200 pointer-events-none rounded-2xl bg-brand-500 ease-out-quart group-hover:bg-brand-400"
          aria-hidden="true"
        >
          View Details
        </span>
        <a
          v-if="whatsappUrl"
          :href="whatsappUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="[iconAction, 'bg-emerald-500 text-white hover:bg-emerald-600']"
          :aria-label="`Message ${pharmacy.name} on WhatsApp`"
          title="WhatsApp"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.564 4.14 1.546 5.878L0 24l6.269-1.519A11.955 11.955 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.91 0-3.697-.504-5.244-1.383l-.374-.222-3.893.943.976-3.79-.244-.39A9.97 9.97 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
          </svg>
        </a>
        <a
          v-if="hasCoordinates"
          :href="directionsUrl"
          target="_blank"
          rel="noopener noreferrer"
          :class="[iconAction, 'bg-white text-gray-600 ring-1 ring-gray-200 hover:text-brand-600 hover:ring-brand-500 dark:bg-gray-700 dark:text-gray-300 dark:ring-gray-600']"
          :aria-label="`Get directions to ${pharmacy.name}`"
          title="Directions"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </a>
      </div>
    </div>
  </article>
</template>
