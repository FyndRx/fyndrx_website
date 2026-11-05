<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useInView } from '@/composables/useInView';

const router = useRouter();
const sectionRef = ref<HTMLElement | null>(null);
const { inView } = useInView(sectionRef, { threshold: 0.2 });

type Tone = 'brand' | 'accent';

// Static class strings so Tailwind can see them. Steps 1–2 are blue, 3–4 orange,
// matching the line's blue → orange progression.
const tone: Record<Tone, { node: string; badge: string; chip: string; stem: string }> = {
  brand: {
    node: 'bg-brand-500 shadow-glow-brand',
    badge: 'text-brand-600',
    chip: 'bg-brand-500 text-white',
    stem: 'bg-brand-500/40',
  },
  accent: {
    node: 'bg-accent-500 shadow-glow-accent',
    badge: 'text-accent-600',
    chip: 'bg-accent-500 text-white',
    stem: 'bg-accent-500/40',
  },
};

const steps: {
  id: number;
  title: string;
  description: string;
  icon: string;
  tone: Tone;
}[] = [
  {
    id: 1,
    title: 'Search for Drugs',
    description: 'Search by drug name, brand, or medical condition — compare prices across all partner pharmacies instantly.',
    icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    tone: 'brand',
  },
  {
    id: 2,
    title: 'Upload Prescription',
    description: 'Upload your prescription securely. A licensed pharmacist verifies it before your order is processed.',
    icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
    tone: 'brand',
  },
  {
    id: 3,
    title: 'Add to Cart & Checkout',
    description: 'Select your preferred pharmacy, add items to cart, and complete payment with multiple secure options.',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z',
    tone: 'accent',
  },
  {
    id: 4,
    title: 'Track Your Order',
    description: 'Get SMS and push notifications at every step — from order confirmation to delivery at your doorstep.',
    icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    tone: 'accent',
  },
];
</script>

<script lang="ts">
export default {
  name: 'HowItWorks',
};
</script>

<template>
  <section ref="sectionRef" class="py-20" :class="{ 'is-in': inView }">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mb-16 text-center reveal">
        <h2 class="mb-4 text-4xl font-medium text-gray-900 dark:text-white">
          How It <span class="text-brand-500">Works</span>
        </h2>
        <p class="text-xl text-gray-600 dark:text-gray-300">
          Get your medications delivered in just a few simple steps
        </p>
      </div>

      <!-- Journey -->
      <div class="relative">
        <!-- Path through the nodes (desktop). Runs from the centre of node 1 to the centre of node 4. -->
        <div
          class="absolute hidden lg:block top-8 left-[12.5%] right-[12.5%] h-0.5 -translate-y-1/2 rounded-full bg-gray-900/10 dark:bg-white/10"
          aria-hidden="true"
        >
          <div class="hiw-line absolute inset-0 rounded-full bg-gradient-to-r from-brand-500 via-brand-400 to-accent-500"></div>
        </div>

        <ol class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <li
            v-for="(step, index) in steps"
            :key="step.id"
            class="relative flex flex-col"
            :style="{ '--i': index }"
          >
            <!-- Node (desktop): sits on the path, with a short stem hanging down to its card -->
            <div class="flex-col items-center hidden lg:flex hiw-node" aria-hidden="true">
              <div class="relative z-10">
                <div class="flex items-center justify-center w-16 h-16 text-white rounded-full ring-4 ring-white dark:ring-gray-900" :class="tone[step.tone].node">
                  <svg class="w-7 h-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="step.icon" />
                  </svg>
                </div>
                <span
                  class="absolute flex items-center justify-center w-6 h-6 text-xs font-bold bg-white rounded-full shadow-card -top-1 -right-1"
                  :class="tone[step.tone].badge"
                >
                  {{ step.id }}
                </span>
              </div>
              <span class="w-px h-6" :class="tone[step.tone].stem"></span>
            </div>

            <!-- Card -->
            <div class="reveal-card flex-1 p-7 rounded-3xl bg-white/70 backdrop-blur-md shadow-card ring-1 ring-white/70 transition duration-300 ease-out-quart hover:-translate-y-1 hover:shadow-card-hover motion-reduce:transition-none dark:bg-gray-800/60 dark:ring-white/10 lg:text-center">
              <!-- Icon chip (tablet / mobile, where there is no path) -->
              <div class="flex items-center gap-3 mb-5 lg:hidden">
                <span class="flex items-center justify-center w-12 h-12 rounded-2xl" :class="tone[step.tone].chip">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="step.icon" />
                  </svg>
                </span>
                <span class="text-sm font-semibold text-gray-400 dark:text-gray-500">Step {{ step.id }}</span>
              </div>

              <h3 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
                {{ step.title }}
              </h3>
              <p class="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {{ step.description }}
              </p>
            </div>
          </li>
        </ol>
      </div>

      <!-- CTA -->
      <div class="mt-14 text-center reveal" style="--d: 0.9s">
        <button
          type="button"
          class="group inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-white transition duration-200 rounded-full bg-brand-500 shadow-glow-brand ease-out-quart hover:bg-brand-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
          @click="router.push('/medications')"
        >
          Get Started
          <svg
            class="w-5 h-5 transition-transform duration-200 ease-out-quart group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Scroll-triggered entrance, driven by `.is-in` on the section (useInView).
 * Sequence per step i (0–3): the line reaches the node, the node pops, the card rises.
 * Strong ease-out so each piece starts fast and settles gently.
 */
.reveal {
  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) var(--d, 0s);
}

.hiw-line {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 1.5s cubic-bezier(0.25, 1, 0.5, 1) 0.2s;
}

.hiw-node {
  opacity: 0;
  transform: scale(0.5);
  transition:
    opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1) calc(0.25s + var(--i) * 0.38s),
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) calc(0.25s + var(--i) * 0.38s);
}

.reveal-card {
  opacity: 0;
  transform: translateY(18px);
  transition:
    opacity 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.35s + var(--i) * 0.38s),
    transform 0.6s cubic-bezier(0.25, 1, 0.5, 1) calc(0.35s + var(--i) * 0.38s),
    box-shadow 0.3s cubic-bezier(0.25, 1, 0.5, 1);
}

.is-in .reveal {
  opacity: 1;
  transform: none;
}

.is-in .hiw-line {
  transform: scaleX(1);
}

.is-in .hiw-node {
  opacity: 1;
  transform: scale(1);
}

.is-in .reveal-card {
  opacity: 1;
  transform: none;
}

/* The card's own hover lift must win over the entrance transform once it has played. */
.is-in .reveal-card:hover {
  transform: translateY(-4px);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .hiw-line,
  .hiw-node,
  .reveal-card {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
