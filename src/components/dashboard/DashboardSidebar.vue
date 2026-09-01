<script setup lang="ts">
import { useRoute } from 'vue-router';
import AppLogo from '@/components/AppLogo.vue';
import { useNotificationsStore } from '@/store/notifications';
import { DASHBOARD_NAV_GROUPS, DASHBOARD_UPLOAD_CTA, type DashboardNavItem } from '@/config/dashboardNav';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: 'close'): void }>();

const route = useRoute();
const notificationsStore = useNotificationsStore();

const isActive = (item: DashboardNavItem) => item.matchNames.includes((route.name as string) ?? '');

const badgeValue = (item: DashboardNavItem): number => {
  if (item.badge === 'unreadNotifications') return notificationsStore.unreadCount;
  return 0;
};
</script>

<template>
  <!-- Mobile backdrop -->
  <transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-40 bg-gray-900/50 lg:hidden print:hidden"
      @click="emit('close')"
    ></div>
  </transition>

  <aside
    class="fixed inset-y-0 left-0 z-50 w-72 shrink-0 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 transition-transform duration-300 lg:static lg:translate-x-0 lg:z-auto print:hidden"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand -->
    <div class="h-20 shrink-0 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
      <router-link to="/dashboard" class="flex items-center" @click="emit('close')">
        <AppLogo class="h-8 w-auto" />
      </router-link>
      <button
        class="lg:hidden p-2 -mr-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Primary CTA -->
    <div class="px-4 pt-5">
      <router-link
        :to="DASHBOARD_UPLOAD_CTA.to"
        class="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-2xl bg-[#FE9615] text-white font-bold text-sm hover:bg-[#ffb547] shadow-lg shadow-[#FE9615]/20 hover:shadow-[#FE9615]/30 transition-all"
        @click="emit('close')"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-for="d in DASHBOARD_UPLOAD_CTA.icon" :key="d" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="d" />
        </svg>
        {{ DASHBOARD_UPLOAD_CTA.label }}
      </router-link>
    </div>

    <!-- Nav -->
    <nav class="flex-1 overflow-y-auto px-4 py-5 space-y-6">
      <div v-for="group in DASHBOARD_NAV_GROUPS" :key="group.label ?? 'primary'">
        <p
          v-if="group.label"
          class="px-3 mb-2 text-[11px] font-black uppercase tracking-wider text-gray-400 dark:text-gray-500"
        >
          {{ group.label }}
        </p>
        <div class="space-y-1">
          <router-link
            v-for="item in group.items"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="isActive(item)
              ? 'bg-[#246BFD]/10 text-[#246BFD]'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'"
            @click="emit('close')"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-for="d in item.icon" :key="d" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" :d="d" />
            </svg>
            <span class="flex-1 truncate">{{ item.label }}</span>
            <span
              v-if="item.badge && badgeValue(item) > 0"
              class="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-black text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
            >
              {{ badgeValue(item) > 99 ? '99+' : badgeValue(item) }}
            </span>
          </router-link>
        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
