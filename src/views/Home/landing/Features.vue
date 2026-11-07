<script setup lang="ts">
import { ref } from 'vue';
import { useInView } from '@/composables/useInView';

const sectionRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.15 });

/**
 * Bento layout. `kind` drives both span and treatment:
 *  - search : the headline feature, wide, with an illustration
 *  - trust  : the one saturated card (FDA verification is the differentiator)
 *  - wide   : compact card that spans two columns on desktop only
 *  - base   : compact card
 * Class strings are written out in full so Tailwind can see them.
 */
type Kind = 'search' | 'trust' | 'wide' | 'base';

const layout: Record<Kind, string> = {
  search: 'md:col-span-2 lg:col-span-2',
  trust: 'md:col-span-2 lg:col-span-1 lg:row-span-2',
  wide: 'lg:col-span-2',
  base: '',
};

const features: {
  id: number;
  kind: Kind;
  title: string;
  description: string;
  icon: string;
  color: string;
  spot: string;
  chips?: string[];
}[] = [
  {
    id: 1,
    kind: 'search',
    title: 'Smart Drug Search',
    description: 'Search for medications by name, brand, or medical condition. Get instant results with prices from nearby pharmacies.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    color: 'from-brand-500 to-brand-400',
    spot: 'rgb(36 107 253 / 0.12)',
  },
  {
    id: 6,
    kind: 'trust',
    title: 'FDA-Verified Pharmacies',
    description: 'Every partner pharmacy is licensed by the Ghana Food and Drugs Authority (FDA) and Ghana Pharmacy Council. Zero tolerance for counterfeit medications.',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    color: 'from-white/25 to-white/10',
    spot: 'rgb(255 255 255 / 0.18)',
    chips: ['Ghana FDA', 'Pharmacy Council'],
  },
  {
    id: 2,
    kind: 'base',
    title: 'Prescription Upload',
    description: 'Upload your prescription securely. Our partner pharmacists verify and process it quickly for accurate fulfillment.',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    color: 'from-accent-500 to-accent-300',
    spot: 'rgb(254 150 21 / 0.12)',
  },
  {
    id: 3,
    kind: 'base',
    title: 'Real-time Order Tracking',
    description: 'Track your order from processing to delivery. Get SMS and push notifications at every step of the journey.',
    icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    color: 'from-brand-600 to-brand-400',
    spot: 'rgb(36 107 253 / 0.12)',
  },
  {
    id: 4,
    kind: 'base',
    title: 'Secure Checkout',
    description: 'Multiple payment options with bank-grade security. Direct payments to pharmacies with instant confirmation.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    color: 'from-accent-600 to-accent-400',
    spot: 'rgb(254 150 21 / 0.12)',
  },
  {
    id: 5,
    kind: 'wide',
    title: 'Flexible Delivery',
    description: 'Choose pharmacy pickup or home delivery. Select the option that works best for your schedule and location.',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
    color: 'from-brand-500 to-brand-300',
    spot: 'rgb(36 107 253 / 0.12)',
    chips: ['Pharmacy pickup', 'Home delivery'],
  },
];

// Abstract "compare prices" illustration: skeleton rows only, no invented data.
const previewRows = ['w-2/3', 'w-1/2', 'w-3/5'];

// Pointer-following spotlight. Only fires on devices with a hovering pointer.
const onCardMove = (event: PointerEvent) => {
  if (event.pointerType === 'touch') return;
  const el = event.currentTarget as HTMLElement;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--sx', `${event.clientX - rect.left}px`);
  el.style.setProperty('--sy', `${event.clientY - rect.top}px`);
};
</script>

<script lang="ts">
export default {
  name: 'Features',
};
</script>

<template>
  <section ref="sectionRef" class="py-16 sm:py-20" :class="{ 'is-in': inView }">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <div class="mb-12 text-center sm:mb-16 reveal">
        <h2 class="mb-4 text-3xl font-medium text-gray-900 sm:text-4xl dark:text-white">
          Why Choose <span class="text-brand-500">FyndRx</span>?
        </h2>
        <p class="max-w-3xl mx-auto text-lg text-gray-600 sm:text-xl dark:text-gray-300">
          Your complete ePharmacy solution — FDA-compliant, secure, and built for the Ghanaian healthcare system
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(feature, index) in features"
          :key="feature.id"
          class="feature-card group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition duration-300 ease-out-quart motion-reduce:transition-none"
          :class="[
            layout[feature.kind],
            feature.kind === 'trust'
              ? 'bg-gradient-to-br from-brand-600 to-brand-500 text-white shadow-float'
              : 'bg-white/70 backdrop-blur-md shadow-card ring-1 ring-white/70 hover:shadow-card-hover dark:bg-gray-800/60 dark:ring-white/10',
          ]"
          :style="{ '--i': index, '--spot': feature.spot }"
          @pointermove="onCardMove"
        >
          <!-- Pointer spotlight -->
          <span class="feature-spot" aria-hidden="true"></span>

          <!-- Shield watermark on the trust card -->
          <svg
            v-if="feature.kind === 'trust'"
            class="absolute w-64 h-64 -bottom-10 -right-10 text-white/10"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon" />
          </svg>

          <div
            class="relative flex flex-col gap-6"
            :class="{
              'md:flex-row md:items-center md:gap-10': feature.kind === 'search',
              'lg:flex-row lg:items-center lg:gap-6': feature.kind === 'wide',
              'h-full': feature.kind === 'trust',
            }"
          >
            <div class="flex-1" :class="{ 'flex flex-col h-full': feature.kind === 'trust' }">
              <div
                class="flex items-center justify-center mb-5 transition-transform duration-300 ease-out-quart w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br group-hover:scale-105 motion-reduce:transition-none"
                :class="[feature.color, feature.kind === 'trust' ? 'ring-1 ring-white/30 backdrop-blur-sm' : '']"
              >
                <svg class="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon" />
                </svg>
              </div>

              <h3
                class="mb-3 font-semibold"
                :class="[
                  feature.kind === 'search' || feature.kind === 'trust' ? 'text-2xl' : 'text-xl',
                  feature.kind === 'trust' ? 'text-white' : 'text-gray-900 dark:text-white',
                ]"
              >
                {{ feature.title }}
              </h3>

              <p
                class="leading-relaxed"
                :class="feature.kind === 'trust' ? 'text-white/85' : 'text-gray-600 dark:text-gray-300'"
              >
                {{ feature.description }}
              </p>

              <ul v-if="feature.chips && feature.kind === 'trust'" class="flex flex-wrap gap-2 mt-auto pt-6">
                <li
                  v-for="chip in feature.chips"
                  :key="chip"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full bg-white/15 ring-1 ring-white/25"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {{ chip }}
                </li>
              </ul>
            </div>

            <!-- Wide card chips: right-hand side on desktop, under the text elsewhere -->
            <ul
              v-if="feature.chips && feature.kind === 'wide'"
              class="flex flex-wrap gap-2 lg:shrink-0 lg:flex-nowrap lg:justify-end"
            >
              <li
                v-for="chip in feature.chips"
                :key="chip"
                class="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-full text-brand-600 bg-brand-500/10 ring-1 ring-brand-500/20 dark:text-brand-300"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {{ chip }}
              </li>
            </ul>

            <!-- Search illustration (hidden on the smallest screens to keep the card compact) -->
            <div
              v-if="feature.kind === 'search'"
              class="hidden sm:block md:w-[46%] md:shrink-0"
              aria-hidden="true"
            >
              <div class="flex items-center gap-3 px-4 py-3 rounded-full shadow-inner bg-white/80 ring-1 ring-black/5 dark:bg-gray-900/60 dark:ring-white/10">
                <svg class="w-5 h-5 text-brand-500 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" :d="feature.icon" />
                </svg>
                <span class="h-2.5 w-2/5 rounded-full bg-gray-300/80 dark:bg-white/20"></span>
              </div>
              <div class="mt-3 space-y-2">
                <div
                  v-for="(width, i) in previewRows"
                  :key="width"
                  class="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/60 ring-1 ring-black/5 dark:bg-gray-900/40 dark:ring-white/10"
                  :class="{ 'ring-2 !ring-brand-500/50 bg-brand-500/5': i === 0 }"
                >
                  <span class="w-8 h-8 rounded-lg shrink-0" :class="i === 0 ? 'bg-brand-500' : 'bg-brand-500/15'"></span>
                  <span class="h-2.5 flex-1 rounded-full bg-gray-300/80 dark:bg-white/15" :class="width"></span>
                  <span
                    v-if="i === 0"
                    class="px-2.5 py-1 text-xs font-semibold text-white rounded-full bg-accent-500 shrink-0"
                  >
                    Lowest
                  </span>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Scroll-in: header first, then cards in a quick stagger. Triggered once via `.is-in` (useInView). */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.feature-card {
  opacity: 0;
  transform: translateY(20px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.08s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.15s + var(--i) * 0.08s),
    box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.is-in .reveal,
.is-in .feature-card {
  opacity: 1;
  transform: none;
}

/* Once entered, hover lift takes over with no entrance delay */
.is-in .feature-card:hover {
  transform: translateY(-4px);
  transition-delay: 0s;
}

/* Spotlight that follows the pointer (fine pointers only; touch never fires :hover moves) */
.feature-spot {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(20rem circle at var(--sx, 50%) var(--sy, 50%), var(--spot), transparent 65%);
  transition: opacity 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.feature-card:hover .feature-spot {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .feature-card {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .is-in .feature-card:hover {
    transform: none;
  }
}
</style>
