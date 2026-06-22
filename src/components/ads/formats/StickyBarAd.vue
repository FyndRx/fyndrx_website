<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { Ad } from '@/types/Ad';
import { useAdSession } from '@/composables/useAdSession';

const props = defineProps<{ ad: Ad; zone: string }>();
const session = useAdSession();
const visible = ref(false);
let timer: ReturnType<typeof setTimeout>;

onMounted(() => {
  // Show after 30 s — user has had time to engage with the page
  timer = setTimeout(() => {
    if (!session.isDismissed(props.ad.id) && !session.isOverCap(props.ad.id, props.zone)) {
      visible.value = true;
      session.recordImpression(props.ad.id, props.zone);
    }
  }, 30_000);
});

const dismiss = () => {
  visible.value = false;
  session.dismiss(props.ad.id);
  clearTimeout(timer);
};

const handleClick = () => session.recordClick(props.ad.id, props.zone);

const accent = props.ad.creative.accentColor ?? '#246BFD';
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-500 ease-out"
    enter-from-class="translate-y-full opacity-0"
    enter-to-class="translate-y-0 opacity-100"
    leave-active-class="transition-all duration-300 ease-in"
    leave-from-class="translate-y-0 opacity-100"
    leave-to-class="translate-y-full opacity-0"
  >
    <div
      v-if="visible"
      class="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-bottom"
      role="banner"
      aria-label="Advertisement"
    >
      <div
        class="mx-3 mb-3 rounded-2xl shadow-2xl border overflow-hidden flex items-center gap-3 px-4 py-3"
        :style="{ backgroundColor: 'white', borderColor: accent + '44' }"
        style="backdrop-filter: blur(12px);"
      >
        <!-- Accent left bar -->
        <div class="w-1 self-stretch rounded-full flex-shrink-0" :style="{ backgroundColor: accent }"></div>

        <!-- Text -->
        <div class="flex-1 min-w-0">
          <p class="text-xs font-semibold text-gray-800 leading-snug truncate">
            {{ ad.creative.headline }}
          </p>
          <p class="text-[10px] font-medium mt-0.5" :style="{ color: accent }">{{ ad.advertiser }}</p>
        </div>

        <!-- CTA -->
        <a
          :href="ad.creative.cta.href"
          :target="ad.creative.cta.external ? '_blank' : undefined"
          :rel="ad.creative.cta.external ? 'noopener noreferrer' : undefined"
          class="flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold text-white transition-all active:scale-95"
          :style="{ backgroundColor: accent }"
          @click="handleClick"
        >
          {{ ad.creative.cta.label }}
        </a>

        <!-- Dismiss -->
        <button
          @click="dismiss"
          class="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Dismiss ad"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </Transition>
</template>
