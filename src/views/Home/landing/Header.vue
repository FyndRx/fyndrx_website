<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import UserAvatar from '@/components/UserAvatar.vue';
import DarkModeToggle from '@/components/DarkModeToggle.vue';
import NotificationDropdown from '@/components/NotificationDropdown.vue';
import { useAuthStore } from '@/store/auth';
import { useCartStore } from '@/store/cart';
import { useSettingsStore } from '@/store/settings';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';

const authStore = useAuthStore();
const cartStore = useCartStore();
const settingsStore = useSettingsStore();
const route = useRoute();
const isAuthenticated = computed(() => authStore.isAuthenticated);

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Medications', to: '/medications' },
  { label: 'Pharmacies', to: '/pharmacies' },
  { label: 'Blog', to: '/blog' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const isLinkActive = (to: string) =>
  to === '/' ? route.path === '/' : route.path === to || route.path.startsWith(`${to}/`);

const activeIndex = computed(() => navLinks.findIndex((link) => isLinkActive(link.to)));

// ── Sliding nav pill ─────────────────────────────────────────────────────────
// One highlight that rests on the current page and glides to whichever link is hovered or focused.
const navEl = ref<HTMLElement | null>(null);
const linkEls = ref<HTMLElement[]>([]);
const hoverIndex = ref<number | null>(null);
const pill = ref({ x: 0, w: 0, visible: false, ready: false });
let resizeObserver: ResizeObserver | null = null;

const setLinkEl = (el: unknown, index: number) => {
  if (el) linkEls.value[index] = el as HTMLElement;
};

const targetIndex = computed(() => hoverIndex.value ?? activeIndex.value);

const measurePill = () => {
  const el = linkEls.value[targetIndex.value];
  if (targetIndex.value < 0 || !el) {
    pill.value = { ...pill.value, visible: false };
    return;
  }
  pill.value = { ...pill.value, x: el.offsetLeft, w: el.offsetWidth, visible: true };
};

watch(targetIndex, () => nextTick(measurePill));
watch(
  () => route.path,
  () => {
    isMobileMenuOpen.value = false;
    hoverIndex.value = null;
  },
);

// ── Scroll + keyboard ────────────────────────────────────────────────────────
const handleScroll = () => {
  isScrolled.value = window.scrollY > 24;
};

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isMobileMenuOpen.value) isMobileMenuOpen.value = false;
};

onMounted(() => {
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('keydown', onKeydown);

  nextTick(() => {
    measurePill();
    // Enable the glide only after the first placement, so the pill doesn't slide in on load.
    requestAnimationFrame(() => (pill.value = { ...pill.value, ready: true }));
  });
  // Remeasure when the nav's size changes (breakpoints, font load).
  if (navEl.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(measurePill);
    resizeObserver.observe(navEl.value);
  }
  document.fonts?.ready.then(measurePill);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', onKeydown);
  resizeObserver?.disconnect();
});

// Reusable button treatments, written out in full so Tailwind can see them.
const iconButton =
  'relative flex items-center justify-center w-11 h-11 rounded-full text-gray-700 transition duration-200 ease-out-quart hover:bg-gray-900/5 hover:text-brand-600 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:text-gray-200 dark:hover:bg-white/10 dark:hover:text-white';
const focusRing = 'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30';
</script>

<script lang="ts">
export default {
  name: 'Header',
};
</script>

<template>
  <header class="print:hidden fixed top-0 left-0 right-0 z-50">
    <!-- Skip link: first tab stop, jumps past the nav -->
    <a
      href="#main-content"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-[70] focus:rounded-full focus:bg-brand-500 focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white focus:shadow-glow-brand focus:outline-none focus:ring-4 focus:ring-white/60"
    >
      Skip to content
    </a>

    <!-- At the top the bar is transparent; on scroll (or with the menu open) it becomes a floating glass capsule. -->
    <nav
      class="transition-all duration-300 ease-out-quart motion-reduce:transition-none"
      :class="
        isScrolled || isMobileMenuOpen
          ? [
              'mt-2 sm:mt-3 mx-3 sm:mx-6 lg:mx-auto max-w-7xl rounded-[2rem] backdrop-blur-xl shadow-card ring-1 ring-gray-900/5 dark:ring-white/10',
              isMobileMenuOpen ? 'bg-white/95 dark:bg-gray-900/95' : 'bg-white/75 dark:bg-gray-900/70',
            ]
          : 'mx-auto max-w-7xl'
      "
      aria-label="Main"
    >
      <div class="px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between transition-[height] duration-300 ease-out-quart motion-reduce:transition-none" :class="isScrolled ? 'h-16' : 'h-20'">
          <!-- Logo -->
          <router-link to="/" class="flex items-center rounded-xl shrink-0 group" :class="focusRing" aria-label="FyndRx home">
            <img
              :src="logoBlueOrange"
              alt="FyndRx"
              class="h-10 mr-3 transition-transform duration-300 ease-out-quart group-hover:rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 dark:hidden"
            />
            <img
              :src="logoWhiteOrange"
              alt="FyndRx"
              class="hidden h-10 mr-3 transition-transform duration-300 ease-out-quart group-hover:rotate-6 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 dark:block"
            />
          </router-link>

          <!-- Desktop navigation (lg+) -->
          <div
            ref="navEl"
            class="relative items-center hidden gap-1 mx-4 lg:flex"
            @mouseleave="hoverIndex = null"
          >
            <!-- Sliding pill -->
            <span
              class="absolute top-0 left-0 h-full rounded-full pointer-events-none bg-brand-500/10 dark:bg-brand-400/15"
              :class="pill.ready ? 'transition-[transform,width,opacity] duration-300 ease-out-quart motion-reduce:transition-none' : ''"
              :style="{ width: `${pill.w}px`, transform: `translateX(${pill.x}px)`, opacity: pill.visible ? 1 : 0 }"
              aria-hidden="true"
            ></span>

            <router-link
              v-for="(link, index) in navLinks"
              :key="link.label"
              :to="link.to"
              custom
              v-slot="{ href, navigate }"
            >
              <a
                :ref="(el) => setLinkEl(el, index)"
                :href="href"
                class="relative px-3.5 py-2 text-sm font-medium transition-colors duration-200 rounded-full xl:text-base whitespace-nowrap"
                :class="[
                  focusRing,
                  isLinkActive(link.to)
                    ? 'text-brand-600 font-semibold dark:text-brand-300'
                    : 'text-gray-700 hover:text-brand-600 dark:text-gray-200 dark:hover:text-white',
                ]"
                :aria-current="isLinkActive(link.to) ? 'page' : undefined"
                @click="navigate"
                @mouseenter="hoverIndex = index"
                @focus="hoverIndex = index"
                @blur="hoverIndex = null"
              >
                {{ link.label }}
              </a>
            </router-link>
          </div>

          <!-- Right-hand actions (lg+). Hierarchy: one solid orange (Upload Rx), one solid blue (Register), the rest quiet. -->
          <div class="items-center hidden gap-1.5 lg:flex xl:gap-2 shrink-0">
            <router-link
              v-if="settingsStore.aiChatEnabled"
              to="/chat"
              class="flex items-center gap-2 px-3.5 h-11 rounded-full bg-brand-500/10 text-brand-600 font-medium transition duration-200 ease-out-quart hover:bg-brand-500 hover:text-white active:scale-95 dark:bg-brand-400/15 dark:text-brand-300 dark:hover:bg-brand-500 dark:hover:text-white"
              :class="focusRing"
              aria-label="Chat with Fynda"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span class="hidden text-sm xl:inline whitespace-nowrap">Chat</span>
            </router-link>

            <router-link
              to="/upload-prescription"
              class="flex items-center gap-2 px-3.5 h-11 rounded-full bg-accent-500 text-white font-medium shadow-glow-accent transition duration-200 ease-out-quart hover:bg-accent-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
              :class="focusRing"
              aria-label="Upload prescription"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="hidden text-sm xl:inline whitespace-nowrap">Upload Rx</span>
            </router-link>

            <router-link to="/cart" :class="iconButton" aria-label="Shopping cart">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span
                v-if="cartStore.cartItemsCount > 0"
                class="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-accent-500 rounded-full ring-2 ring-white dark:ring-gray-900"
              >
                {{ cartStore.cartItemsCount > 99 ? '99+' : cartStore.cartItemsCount }}
              </span>
            </router-link>

            <NotificationDropdown v-if="isAuthenticated" />
            <DarkModeToggle />

            <template v-if="!isAuthenticated">
              <router-link
                to="/login"
                class="flex items-center h-11 px-5 text-sm font-semibold transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 ease-out-quart whitespace-nowrap hover:bg-brand-500 hover:text-white active:scale-95 dark:text-brand-300 dark:hover:text-white"
                :class="focusRing"
              >
                Sign In
              </router-link>
              <router-link
                to="/register"
                class="items-center hidden h-11 px-5 text-sm font-semibold text-white transition duration-200 rounded-full xl:flex bg-brand-500 shadow-glow-brand ease-out-quart whitespace-nowrap hover:bg-brand-400 hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                :class="focusRing"
              >
                Register
              </router-link>
            </template>
            <UserAvatar v-else />
          </div>

          <!-- Mobile / tablet actions (below lg) -->
          <div class="flex items-center gap-1 ml-auto mr-1 lg:hidden sm:gap-1.5 sm:mr-2">
            <router-link
              v-if="settingsStore.aiChatEnabled"
              to="/chat"
              class="hidden min-[400px]:flex items-center justify-center w-11 h-11 rounded-full bg-brand-500/10 text-brand-600 transition duration-200 hover:bg-brand-500 hover:text-white active:scale-95 dark:bg-brand-400/15 dark:text-brand-300"
              :class="focusRing"
              aria-label="Chat with Fynda"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </router-link>

            <router-link
              to="/upload-prescription"
              class="hidden min-[400px]:flex items-center justify-center w-11 h-11 rounded-full bg-accent-500/10 text-accent-600 transition duration-200 hover:bg-accent-500 hover:text-white active:scale-95 dark:text-accent-400"
              :class="focusRing"
              aria-label="Upload prescription"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </router-link>

            <router-link to="/cart" :class="iconButton" aria-label="Shopping cart">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span
                v-if="cartStore.cartItemsCount > 0"
                class="absolute top-0.5 right-0.5 flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-bold text-white bg-accent-500 rounded-full ring-2 ring-white dark:ring-gray-900"
              >
                {{ cartStore.cartItemsCount > 99 ? '99+' : cartStore.cartItemsCount }}
              </span>
            </router-link>

            <NotificationDropdown v-if="isAuthenticated" />

            <router-link
              v-if="!isAuthenticated"
              to="/login"
              class="flex items-center justify-center w-11 h-11 rounded-full bg-brand-500/10 text-brand-600 transition duration-200 hover:bg-brand-500 hover:text-white active:scale-95 dark:bg-brand-400/15 dark:text-brand-300"
              :class="focusRing"
              aria-label="Sign in"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </router-link>
            <div v-else class="relative z-[60]">
              <UserAvatar />
            </div>
          </div>

          <!-- Hamburger (below lg) -->
          <button
            type="button"
            class="flex items-center justify-center w-11 h-11 transition duration-200 rounded-full lg:hidden hover:bg-gray-900/5 active:scale-95 dark:hover:bg-white/10"
            :class="focusRing"
            :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'"
            :aria-expanded="isMobileMenuOpen"
            aria-controls="mobile-menu"
            @click="isMobileMenuOpen = !isMobileMenuOpen"
          >
            <svg class="w-6 h-6 text-gray-700 dark:text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
              <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Mobile / tablet menu: every action is reachable here, even where the top-row icons are hidden -->
      <Transition
        enter-active-class="transition duration-300 ease-out motion-reduce:duration-0"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-200 ease-in motion-reduce:duration-0"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div
          v-if="isMobileMenuOpen"
          id="mobile-menu"
          class="px-4 pt-1 pb-5 overflow-y-auto sm:px-6 lg:hidden max-h-[calc(100svh-6rem)]"
        >
          <ul class="space-y-1">
            <li v-for="link in navLinks" :key="link.label">
              <router-link
                :to="link.to"
                class="flex items-center px-4 py-3 text-lg font-medium transition-colors rounded-2xl"
                :class="[
                  focusRing,
                  isLinkActive(link.to)
                    ? 'bg-brand-500/10 text-brand-600 font-semibold dark:bg-brand-400/15 dark:text-brand-300'
                    : 'text-gray-700 hover:bg-gray-900/5 dark:text-gray-200 dark:hover:bg-white/10',
                ]"
                :aria-current="isLinkActive(link.to) ? 'page' : undefined"
                @click="isMobileMenuOpen = false"
              >
                {{ link.label }}
              </router-link>
            </li>
          </ul>

          <div class="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-gray-900/5 dark:border-white/10">
            <router-link
              to="/upload-prescription"
              class="flex items-center justify-center col-span-2 gap-2 px-5 py-3.5 font-semibold text-white transition duration-200 rounded-full bg-accent-500 shadow-glow-accent active:scale-[0.98]"
              :class="focusRing"
              @click="isMobileMenuOpen = false"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Prescription
            </router-link>

            <router-link
              v-if="settingsStore.aiChatEnabled"
              to="/chat"
              class="flex items-center justify-center col-span-2 gap-2 px-5 py-3 font-semibold transition duration-200 rounded-full bg-brand-500/10 text-brand-600 active:scale-[0.98] dark:bg-brand-400/15 dark:text-brand-300"
              :class="focusRing"
              @click="isMobileMenuOpen = false"
            >
              Chat with Fynda
            </router-link>

            <template v-if="!isAuthenticated">
              <router-link
                to="/login"
                class="flex items-center justify-center px-5 py-3 font-semibold transition duration-200 border-2 rounded-full text-brand-600 border-brand-500 active:scale-[0.98] dark:text-brand-300"
                :class="focusRing"
                @click="isMobileMenuOpen = false"
              >
                Sign In
              </router-link>
              <router-link
                to="/register"
                class="flex items-center justify-center px-5 py-3 font-semibold text-white transition duration-200 rounded-full bg-brand-500 shadow-glow-brand active:scale-[0.98]"
                :class="focusRing"
                @click="isMobileMenuOpen = false"
              >
                Register
              </router-link>
            </template>
          </div>

          <div class="flex items-center justify-between px-4 pt-4 mt-2">
            <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Appearance</span>
            <DarkModeToggle />
          </div>
        </div>
      </Transition>
    </nav>
  </header>
</template>
