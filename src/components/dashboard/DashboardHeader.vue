<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '@/store/cart';
import UserAvatar from '@/components/UserAvatar.vue';
import DarkModeToggle from '@/components/DarkModeToggle.vue';
import NotificationDropdown from '@/components/NotificationDropdown.vue';
import { DASHBOARD_NAV_GROUPS } from '@/config/dashboardNav';

defineEmits<{ (e: 'toggle-sidebar'): void }>();

const route = useRoute();
const cartStore = useCartStore();

// Prefer the matching sidebar item's label (short, consistent); fall back to the
// route's <title> tag text with the " | FyndRx" site suffix stripped.
const pageTitle = computed(() => {
  const name = route.name as string;
  for (const group of DASHBOARD_NAV_GROUPS) {
    const match = group.items.find((item) => item.matchNames.includes(name));
    if (match) return match.label;
  }
  const title = (route.meta.title as string) ?? '';
  return title.replace(/\s*\|\s*FyndR[xX]\s*$/, '') || 'Dashboard';
});
</script>

<template>
  <header class="h-20 shrink-0 flex items-center gap-4 px-4 sm:px-6 lg:px-8 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 print:hidden">
    <button
      class="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
      @click="$emit('toggle-sidebar')"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <h1 class="flex-1 min-w-0 truncate text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
      {{ pageTitle }}
    </h1>

    <div class="flex items-center gap-1 sm:gap-2 shrink-0">
      <router-link
        to="/cart"
        class="relative p-2.5 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800 group"
        title="Shopping Cart"
      >
        <svg class="w-5 h-5 text-gray-700 dark:text-white transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <span
          v-if="cartStore.cartItemsCount > 0"
          class="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#FE9615] rounded-full animate-pulse"
        >
          {{ cartStore.cartItemsCount > 99 ? '99+' : cartStore.cartItemsCount }}
        </span>
      </router-link>

      <NotificationDropdown />
      <DarkModeToggle />
      <UserAvatar />
    </div>
  </header>
</template>
