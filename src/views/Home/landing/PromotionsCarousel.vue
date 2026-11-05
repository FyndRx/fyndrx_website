<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  HeartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline';
import { useAds } from '@/composables/useAds';
import { useAdsStore } from '@/store/ads';
import { useAdSession } from '@/composables/useAdSession';
import AdLabel from '@/components/ads/AdLabel.vue';
import { useMobileGestures } from '@/composables/useMobileGestures';

const adsStore = useAdsStore();
const adSession = useAdSession();
const { resolved: heroAd } = useAds({ zone: 'Z1-hero-carousel', route: 'home', isAuthed: false });

onMounted(() => adsStore.load());

const currentSlide = ref(0);

// Autoplay is driven by the active dot's progress animation (see template/CSS): it advances on
// `animationend`, pauses via `animation-play-state`, and never runs under prefers-reduced-motion.
const isPaused = ref(false);

// Total slide count includes the sponsored slide when an ad is active
const totalSlides = computed(() => heroAd.value ? slides.length + 1 : slides.length);
const sponsoredSlideIndex = computed(() => heroAd.value ? slides.length : -1);

// Themes stay inside the brand family (deep blue, vivid blue, warm dark) with orange accents.
const slides = [
  {
    id: 1,
    tag: 'New In-Person Service',
    title: 'Sexual & Reproductive',
    highlight: 'Health Counseling',
    description: 'Professional, confidential, and judgment-free support for your well-being. Talk to our specialists in a private setting.',
    theme: {
      bg: 'from-brand-950 to-brand-800',
      accent: '#FE9615',
      secondary: '#5089FF',
      text_gradient: 'from-accent-500 to-accent-300'
    },
    topics: [
      { text: 'Family Planning Methods', icon: HeartIcon },
      { text: 'Pregnancies', icon: SparklesIcon },
      { text: 'Sexual & Genital Infections', icon: ShieldCheckIcon }
    ],
    details: {
      days: 'Tuesday • Wednesday • Thursday',
      time: '10:00 AM - 5:00 PM',
      location: 'Behind Nahda Basic School. Nyohini-Yepala, Tamale'
    }
  },
  {
    id: 2,
    tag: 'Vaccination Drive',
    title: 'Immunization &',
    highlight: 'Travel Vaccines',
    description: 'Protect yourself and your family. Walk-ins available for flu shots, Hepatitis B, and travel immunizations.',
    theme: {
      bg: 'from-brand-700 to-brand-500',
      accent: '#FFB547',
      secondary: '#BCD3FF',
      text_gradient: 'from-accent-400 to-accent-200'
    },
    topics: [
      { text: 'Flu Shots', icon: ShieldCheckIcon },
      { text: 'Travel Vaccines', icon: MapPinIcon },
      { text: 'Hepatitis B', icon: SparklesIcon }
    ],
    details: {
      days: 'Monday - Friday',
      time: '9:00 AM - 6:00 PM',
      location: 'Behind Nahda Basic School. Nyohini-Yepala, Tamale'
    }
  },
  {
    id: 3,
    tag: 'Chronic Care',
    title: 'Diabetes & Hypertension',
    highlight: 'Management Program',
    description: 'Get personalized support, medication reviews, and lifestyle coaching to manage your chronic conditions effectively.',
    theme: {
      bg: 'from-gray-900 to-accent-900',
      accent: '#FFA52E',
      secondary: '#FFB547',
      text_gradient: 'from-accent-400 to-accent-300'
    },
    topics: [
      { text: 'Blood Glucose Monitoring', icon: HeartIcon },
      { text: 'BP Checks', icon: ClockIcon },
      { text: 'Medication Review', icon: ShieldCheckIcon }
    ],
    details: {
      days: 'By Appointment',
      time: 'Weekdays & Saturdays',
      location: 'Behind Nahda Basic School. Nyohini-Yepala, Tamale'
    }
  }
];

const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % totalSlides.value;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + totalSlides.value) % totalSlides.value;
};

const goToSlide = (index: number) => {
  currentSlide.value = index;
};

const isAdSlide = computed(() => heroAd.value && currentSlide.value === sponsoredSlideIndex.value);

watch(isAdSlide, isVisible => {
  if (isVisible && heroAd.value) {
    adSession.recordImpression(heroAd.value.id, 'Z1-hero-carousel');
  }
});

const handleAdClick = () => {
  if (heroAd.value) adSession.recordClick(heroAd.value.id, 'Z1-hero-carousel');
};

// Swipe between slides on touch
const { handleTouchStart, handleTouchMove, handleTouchEnd } = useMobileGestures({
  threshold: 50,
  onSwipeLeft: nextSlide,
  onSwipeRight: prevSlide,
});
</script>

<template>
  <section class="py-16 sm:py-20" aria-label="In-person clinical services">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mb-8 sm:mb-10">
        <h2 class="text-3xl font-bold text-gray-900 sm:text-4xl dark:text-white">
          In-Person <span class="text-brand-500">Clinical Services</span>
        </h2>
        <p class="mt-3 text-lg text-gray-600 dark:text-gray-400">
          Specialist health programs available at our partner clinic locations
        </p>
      </div>

      <div
        class="relative flex flex-col overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] shadow-float transition-colors duration-700 ease-in-out"
        :class="isAdSlide ? 'bg-gradient-to-br from-[#0D1529] to-[#131E38]' : `bg-gradient-to-br ${slides[currentSlide].theme.bg}`"
        role="group"
        aria-roledescription="carousel"
        @mouseenter="isPaused = true"
        @mouseleave="isPaused = false"
        @focusin="isPaused = true"
        @focusout="isPaused = false"
        @touchstart.passive="handleTouchStart"
        @touchmove.passive="handleTouchMove"
        @touchend="handleTouchEnd"
      >
        <!-- Background decorations (colour follows the slide) -->
        <div
          class="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 transition-colors duration-700 opacity-20 pointer-events-none"
          :style="{ backgroundColor: isAdSlide ? (heroAd?.creative.accentColor ?? '#246BFD') : slides[currentSlide].theme.accent }"
          aria-hidden="true"
        ></div>
        <div
          class="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 transition-colors duration-700 opacity-20 pointer-events-none"
          :style="{ backgroundColor: isAdSlide ? (heroAd?.creative.accentColor ?? '#FE9615') : slides[currentSlide].theme.secondary }"
          aria-hidden="true"
        ></div>

        <!-- Slide content -->
        <div
          class="relative z-10 flex items-center px-5 pt-10 pb-6 sm:px-10 sm:pt-14 lg:px-20 lg:pt-16 min-h-[520px] lg:min-h-[560px]"
          :aria-live="isPaused ? 'polite' : 'off'"
        >
          <Transition
            mode="out-in"
            enter-active-class="duration-500 ease-out motion-reduce:duration-0"
            enter-from-class="opacity-0 translate-x-4"
            enter-to-class="opacity-100 translate-x-0"
            leave-active-class="duration-300 ease-in motion-reduce:duration-0"
            leave-from-class="opacity-100 translate-x-0"
            leave-to-class="opacity-0 -translate-x-4"
          >
            <!-- Sponsored ad slide -->
            <div v-if="isAdSlide && heroAd" :key="'ad-slide'" class="w-full">
              <div class="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                <div class="space-y-6">
                  <div class="flex flex-wrap items-center gap-3">
                    <div class="inline-flex items-center gap-2 px-4 py-2 border rounded-full bg-white/5 border-white/10 backdrop-blur-sm">
                      <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: heroAd.creative.accentColor ?? '#FE9615' }"></span>
                      <span class="text-xs font-bold tracking-wider text-white/90 uppercase">
                        {{ heroAd.advertiser }}
                      </span>
                    </div>
                    <AdLabel variant="sponsored" />
                  </div>
                  <h3 class="text-3xl font-bold leading-tight text-white md:text-5xl">
                    {{ heroAd.creative.headline }}
                  </h3>
                  <p v-if="heroAd.creative.subline" class="max-w-xl text-lg leading-relaxed text-white/80">
                    {{ heroAd.creative.subline }}
                  </p>
                  <a
                    :href="heroAd.creative.cta.href"
                    :target="heroAd.creative.cta.external ? '_blank' : undefined"
                    :rel="heroAd.creative.cta.external ? 'noopener noreferrer' : undefined"
                    class="inline-flex items-center gap-2 px-6 py-3 font-bold text-white transition duration-200 rounded-full ease-out-quart hover:-translate-y-0.5 hover:shadow-xl active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                    :style="{ backgroundColor: heroAd.creative.accentColor ?? '#FE9615' }"
                    @click="handleAdClick"
                  >
                    {{ heroAd.creative.cta.label }}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
                <div v-if="heroAd.creative.imageUrl" class="lg:pl-10">
                  <div class="overflow-hidden border shadow-2xl rounded-3xl border-white/10">
                    <img :src="heroAd.creative.imageUrl" :alt="heroAd.creative.headline" class="object-cover w-full h-56 sm:h-64" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Regular slides -->
            <div v-else :key="currentSlide" class="w-full">
              <div class="grid items-center grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
                <!-- Content -->
                <div class="space-y-6 sm:space-y-8">
                  <p class="flex items-center gap-2 text-xs font-bold tracking-wider uppercase" :style="{ color: slides[currentSlide].theme.accent }">
                    <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: slides[currentSlide].theme.accent }" aria-hidden="true"></span>
                    {{ slides[currentSlide].tag }}
                  </p>

                  <h3 class="text-3xl font-bold leading-tight text-white md:text-5xl">
                    {{ slides[currentSlide].title }}
                    <span class="block text-transparent bg-clip-text bg-gradient-to-r" :class="slides[currentSlide].theme.text_gradient">
                      {{ slides[currentSlide].highlight }}
                    </span>
                  </h3>

                  <p class="max-w-xl text-lg leading-relaxed text-white/80">
                    {{ slides[currentSlide].description }}
                  </p>

                  <ul class="flex flex-wrap gap-3">
                    <li
                      v-for="(topic, idx) in slides[currentSlide].topics"
                      :key="idx"
                      class="flex items-center gap-2 px-4 py-2 text-white transition-colors border rounded-xl bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10"
                    >
                      <component :is="topic.icon" class="w-5 h-5" :style="{ color: slides[currentSlide].theme.accent }" aria-hidden="true" />
                      <span>{{ topic.text }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Session details -->
                <div class="lg:pl-10">
                  <div class="relative p-6 overflow-hidden border sm:p-8 bg-white/5 border-white/10 rounded-3xl backdrop-blur-md">
                    <h4 class="flex items-center gap-3 mb-6 text-xl font-bold text-white">
                      <MapPinIcon class="w-6 h-6" :style="{ color: slides[currentSlide].theme.accent }" aria-hidden="true" />
                      Session Details
                    </h4>

                    <dl class="space-y-6">
                      <div class="flex items-start gap-4">
                        <span class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 shrink-0">
                          <CalendarIcon class="w-5 h-5" :style="{ color: slides[currentSlide].theme.accent }" aria-hidden="true" />
                        </span>
                        <div>
                          <dt class="mb-1 text-xs font-bold text-white/60 uppercase">When</dt>
                          <dd class="font-medium text-white">{{ slides[currentSlide].details.days }}</dd>
                        </div>
                      </div>

                      <div class="flex items-start gap-4">
                        <span class="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 shrink-0">
                          <ClockIcon class="w-5 h-5" :style="{ color: slides[currentSlide].theme.secondary }" aria-hidden="true" />
                        </span>
                        <div>
                          <dt class="mb-1 text-xs font-bold text-white/60 uppercase">Time</dt>
                          <dd class="font-medium text-white">{{ slides[currentSlide].details.time }}</dd>
                        </div>
                      </div>

                      <div class="pt-4 border-t border-white/10">
                        <dt class="mb-1 text-xs font-bold text-white/60 uppercase">Where</dt>
                        <dd class="text-lg font-bold text-white">{{ slides[currentSlide].details.location }}</dd>
                        <dd class="text-sm text-white/60">(Physical Office)</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Controls: in flow, so they can never overlap the slide on small screens -->
        <div class="relative z-20 flex items-center justify-center gap-3 pb-7 sm:gap-4 sm:pb-8">
          <button
            type="button"
            aria-label="Previous slide"
            class="flex items-center justify-center text-white transition duration-200 rounded-full w-11 h-11 bg-white/10 backdrop-blur-sm ease-out-quart hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            @click="prevSlide"
          >
            <ChevronLeftIcon class="w-5 h-5" />
          </button>

          <div class="flex items-center gap-2">
            <button
              v-for="index in totalSlides"
              :key="index - 1"
              type="button"
              :aria-label="`Go to slide ${index}`"
              :aria-current="currentSlide === index - 1 ? 'true' : undefined"
              class="relative h-2.5 overflow-hidden transition-all duration-300 rounded-full ease-out-quart focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              :class="currentSlide === index - 1 ? 'w-10 bg-white/30' : 'w-2.5 bg-white/30 hover:bg-white/50'"
              @click="goToSlide(index - 1)"
            >
              <!-- Autoplay progress. Advancing on animationend keeps the bar and the slide change in lockstep. -->
              <span
                v-if="currentSlide === index - 1"
                :key="`progress-${currentSlide}`"
                class="absolute inset-y-0 left-0 bg-white rounded-full promo-progress"
                :class="{ 'promo-paused': isPaused }"
                @animationend="nextSlide"
              ></span>
            </button>
          </div>

          <button
            type="button"
            aria-label="Next slide"
            class="flex items-center justify-center text-white transition duration-200 rounded-full w-11 h-11 bg-white/10 backdrop-blur-sm ease-out-quart hover:bg-white/20 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
            @click="nextSlide"
          >
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* The active dot fills over 8s, then the carousel advances. Hover/focus pauses it. */
.promo-progress {
  width: 100%;
  transform-origin: left;
  animation: promo-fill 8s linear forwards;
}

.promo-paused {
  animation-play-state: paused;
}

@keyframes promo-fill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

/* Reduced motion: no autoplay. The active dot is simply full and slides change only on request. */
@media (prefers-reduced-motion: reduce) {
  .promo-progress {
    animation: none;
    transform: none;
  }
}
</style>
