<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import LazyImage from '@/components/LazyImage.vue';
import { informationService, type AppSettings } from '@/services/informationService';
import { usePointerLight } from '@/composables/usePointerLight';

const router = useRouter();
const authStore = useAuthStore();

const heroImage =
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2940&auto=format&fit=crop';

const appSettings = ref<AppSettings | null>(null);

const heroRef = ref<HTMLElement | null>(null);
usePointerLight(heroRef);

const hasAppStoreLink = computed(() => {
  const link = appSettings.value?.links.app_store;
  return !!link && link !== '#';
});

const goToMedications = () => router.push({ name: 'medications' });

const goToConsultation = () =>
  router.push({
    name: authStore.isAuthenticated ? 'create-consultation' : 'public-create-consultation',
  });

const scrollToContent = () => {
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
};

onMounted(async () => {
  try {
    appSettings.value = await informationService.getAppSettings();
  } catch (error) {
    console.error('Failed to load app settings:', error);
  }
});
</script>

<script lang="ts">
export default {
  name: 'Hero',
};
</script>

<template>
  <div
    ref="heroRef"
    class="relative flex items-center min-h-screen isolate"
  >
    <!-- Luminous brand surface. Masked so it dissolves into the next section. -->
    <div
      class="aura-stage absolute inset-0 -z-10 overflow-hidden pointer-events-none [--glow-core:rgb(255_255_255/0.55)] [--glow-brand:rgb(36_107_253/0.13)] [--glow-accent:rgb(254_150_21/0.07)] dark:[--glow-core:rgb(255_255_255/0)] dark:[--glow-brand:rgb(36_107_253/0.16)] dark:[--glow-accent:rgb(254_150_21/0)]"
      aria-hidden="true"
    >

      <!-- Orbs: outer wrapper = pointer parallax, inner = slow ambient drift.
           Pastel tints at a huge blur and partly off-canvas, so they read as colour in the air, not as blobs. -->
      <div class="aura-orb absolute -top-72 -left-72" style="--depth: 40">
        <div class="aura-drift h-[44rem] w-[44rem] rounded-full bg-brand-200/60 blur-[120px] dark:bg-brand-500/15"></div>
      </div>
      <div class="aura-orb absolute -bottom-96 -right-72" style="--depth: -34">
        <div class="aura-drift aura-drift-slow h-[42rem] w-[42rem] rounded-full bg-accent-100/50 blur-[140px] dark:bg-accent-600/5"></div>
      </div>
      <div class="aura-orb absolute top-[18%] right-[6%] hidden lg:block" style="--depth: 24">
        <div class="aura-drift h-[26rem] w-[26rem] rounded-full bg-brand-100/30 blur-[120px] dark:bg-transparent"></div>
      </div>

      <!-- Soft light that follows the pointer -->
      <div class="aura-glow absolute inset-0"></div>
    </div>

    <div class="relative z-10 w-full px-4 pt-28 pb-40 mx-auto max-w-7xl sm:px-6 lg:px-8 md:pt-24">
      <div class="grid items-center grid-cols-1 gap-14 lg:gap-16 lg:grid-cols-2">
        <!-- Left column -->
        <div class="space-y-7 md:space-y-8">
          <h1
            class="text-4xl font-medium leading-[1.08] tracking-tight text-gray-900 sm:text-5xl md:text-6xl lg:text-[4rem] dark:text-white motion-safe:animate-fade-up"
            style="animation-delay: 80ms"
          >
            Your Trusted
            <span class="relative inline-block text-brand-500">
              ePharmacy
              <svg
                class="absolute left-0 w-full h-3 -bottom-2 text-accent-500"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 8.5C40 2.5 110 1.5 198 6"
                  stroke="currentColor"
                  stroke-width="3.5"
                  stroke-linecap="round"
                  class="hero-underline"
                />
              </svg>
            </span>
            Platform
          </h1>

          <p
            class="max-w-xl text-lg font-light leading-relaxed text-gray-600 sm:text-xl dark:text-gray-300 motion-safe:animate-fade-up"
            style="animation-delay: 160ms"
          >
            Order medications online with ease. Search for drugs, upload prescriptions, compare
            prices across pharmacies, and get your medications delivered to your doorstep.
          </p>

          <!-- CTAs -->
          <div
            class="flex flex-col gap-3 sm:flex-row motion-safe:animate-fade-up"
            style="animation-delay: 240ms"
          >
            <button
              type="button"
              class="group inline-flex items-center justify-center gap-2 px-8 py-4 font-medium text-white transition duration-200 rounded-full bg-brand-500 shadow-glow-brand ease-out-quart hover:bg-brand-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30"
              @click="goToMedications"
            >
              Shop Medications
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
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 px-8 py-4 font-medium transition duration-200 bg-white/70 backdrop-blur border-2 rounded-full text-accent-700 border-accent-500 dark:bg-white/5 dark:text-accent-400 ease-out-quart hover:bg-accent-500 hover:text-white hover:-translate-y-0.5 hover:shadow-glow-accent active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent-500/30"
              @click="goToConsultation"
            >
              Book Consultation
            </button>
          </div>

          <!-- Trust row -->
          <div
            class="flex items-center w-fit gap-6 px-5 py-3 border shadow-card rounded-2xl border-white/80 bg-white/60 backdrop-blur-md motion-safe:animate-fade-up dark:border-white/10 dark:bg-white/5"
            style="animation-delay: 320ms"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-11 h-11 rounded-xl bg-accent-500 text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div class="leading-tight">
                <p class="text-xl font-medium text-gray-900 dark:text-white">100+</p>
                <p class="text-sm font-light text-gray-600 dark:text-gray-300">Verified Pharmacies</p>
              </div>
            </div>
            <div class="w-px h-10 bg-gray-200 dark:bg-white/10" aria-hidden="true"></div>
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-11 h-11 rounded-xl bg-brand-500 text-white"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="leading-tight">
                <p class="text-xl font-medium text-gray-900 dark:text-white">Fast</p>
                <p class="text-sm font-light text-gray-600 dark:text-gray-300">Delivery</p>
              </div>
            </div>
          </div>

          <!-- App badges -->
          <div
            class="flex flex-wrap items-center gap-3 motion-safe:animate-fade-up"
            style="animation-delay: 400ms"
          >
            <a
              :href="appSettings?.links.play_store || '#'"
              target="_blank"
              rel="noopener noreferrer"
              class="transition duration-200 ease-out-quart hover:-translate-y-0.5"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Get it on Google Play"
                class="h-10 sm:h-11"
              />
            </a>
            <component
              :is="hasAppStoreLink ? 'a' : 'div'"
              v-bind="hasAppStoreLink ? { href: appSettings?.links.app_store, target: '_blank', rel: 'noopener noreferrer' } : {}"
              class="relative transition duration-200 ease-out-quart"
              :class="hasAppStoreLink ? 'hover:-translate-y-0.5' : 'cursor-default'"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                alt="Download on the App Store"
                class="h-10 sm:h-11"
                :class="{ 'opacity-50 grayscale': !hasAppStoreLink }"
              />
              <span
                v-if="!hasAppStoreLink"
                class="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 text-[10px] sm:text-xs font-semibold text-white backdrop-blur-sm"
              >
                Coming Soon
              </span>
            </component>
          </div>
        </div>

        <!-- Right column: photo framed by brand blocks -->
        <div class="relative motion-safe:animate-fade-up" style="animation-delay: 200ms">
          <div class="absolute hidden rounded-[2rem] bg-brand-500 -z-10 sm:block -bottom-4 -left-4 h-2/3 w-2/3" aria-hidden="true"></div>
          <div class="absolute hidden rounded-[2rem] bg-accent-500 -z-10 sm:block -top-4 -right-4 h-1/2 w-1/2" aria-hidden="true"></div>
          <div
            class="relative w-full h-[380px] sm:h-[480px] lg:h-[560px] rounded-[2rem] overflow-hidden shadow-float"
          >
            <LazyImage
              :src="heroImage"
              alt="Doctor providing healthcare services"
              aspectRatio="landscape"
              className="w-full h-full object-cover"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-brand-900/40 via-transparent to-transparent" aria-hidden="true"></div>
          </div>

        </div>
      </div>
    </div>

    <!-- Scroll cue -->
    <button
      type="button"
      class="absolute z-20 hidden p-2 text-gray-500 transition-colors -translate-x-1/2 rounded-full md:block bottom-6 left-1/2 hover:text-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:text-gray-400"
      aria-label="Scroll to content"
      @click="scrollToContent"
    >
      <svg class="w-6 h-6 motion-safe:animate-bounce" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
/* ───────── Luminous brand surface ─────────
   usePointerLight writes --mx/--my (%) and --px/--py (-1..1) on the hero root; do NOT redeclare
   them on a descendant or they shadow the live values. */
.aura-stage {
  -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 10rem), transparent 100%);
  mask-image: linear-gradient(to bottom, #000 calc(100% - 10rem), transparent 100%);
}

/* Pointer parallax; each orb moves by its own depth */
.aura-orb {
  transform: translate3d(calc(var(--px, 0) * var(--depth) * 1px), calc(var(--py, 0) * var(--depth) * 0.7px), 0);
  will-change: transform;
}

/* Slow ambient drift so the surface feels alive even without a pointer */
.aura-drift {
  animation: aura-drift 22s ease-in-out infinite alternate;
}
.aura-drift-slow {
  animation-duration: 30s;
  animation-direction: alternate-reverse;
}

@keyframes aura-drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(36px, -28px, 0) scale(1.08); }
}

/* Light under the cursor, present only while the pointer is over the hero: a bright core, a brand-blue pool, and an orange echo at the mirrored spot */
.aura-glow {
  opacity: var(--glow-on, 0);
  transition: opacity 0.7s cubic-bezier(0.25, 1, 0.5, 1);
  background:
    radial-gradient(circle 16rem at var(--mx, 70%) var(--my, 22%), var(--glow-core), transparent 70%),
    radial-gradient(circle 30rem at var(--mx, 70%) var(--my, 22%), var(--glow-brand), transparent 70%),
    radial-gradient(circle 24rem at calc(100% - var(--mx, 70%)) calc(100% - var(--my, 22%)), var(--glow-accent), transparent 70%);
}

@media (prefers-reduced-motion: reduce) {
  .aura-drift {
    animation: none;
  }
}

/* Hand-drawn underline draws itself once after the headline lands */
.hero-underline {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  animation: draw-underline 0.9s cubic-bezier(0.25, 1, 0.5, 1) 0.7s forwards;
}

@keyframes draw-underline {
  to {
    stroke-dashoffset: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-underline {
    animation: none;
    stroke-dashoffset: 0;
  }
}
</style>
