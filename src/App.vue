<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import DashboardLayout from '@/layouts/DashboardLayout.vue';
import NotificationContainer from '@/components/NotificationContainer.vue';
import MaintenanceOverlay from '@/components/MaintenanceOverlay.vue';
import RateLimitWarning from '@/components/RateLimitWarning.vue';
import ChatWidget from '@/components/AiChat/ChatWidget.vue';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore } from '@/store/settings';
import { useAdsStore } from '@/store/ads';
import { favoritesService } from '@/services/favoritesService';
import { priceAlertService } from '@/services/priceAlertService';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const adsStore = useAdsStore();

// Every requiresAuth route uses the dashboard shell (sidebar + header); everything
// else (public/marketing pages, and logged-out-only pages like /login) keeps the
// existing site chrome. Driven off `requiresAuth` directly rather than a parallel
// `layout` field so the two can never drift out of sync.
const layoutComponent = computed(() => (route.meta.requiresAuth ? DashboardLayout : MainLayout));

const handleUnauthorized = async () => {
  // Only redirect if not already on login page
  if (router.currentRoute.value.name !== 'login') {
    await authStore.logout();
    router.push({ name: 'login' });
  }
};

onMounted(async () => {
  try {
    // Global event listener for 401 Unauthorized
    window.addEventListener('auth:unauthorized', handleUnauthorized);

    // Load platform settings (maintenance mode, fees, etc.)
    await settingsStore.fetchSettings();
    
    await authStore.checkAuth();
    if (authStore.isAuthenticated) {
      await favoritesService.initialize();
      await priceAlertService.initialize();
    }

    // First ad slot to mount also triggers a load(); this just keeps the
    // catalog fresh afterwards (interval + on app-foreground).
    adsStore.initAutoRefresh();
  } catch (err) {
    console.error('Error during app initialization:', err);
  }
});

onUnmounted(() => {
  window.removeEventListener('auth:unauthorized', handleUnauthorized);
});
</script>

<template>
  <component :is="layoutComponent">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" :key="route.fullPath" />
      </transition>
    </router-view>
  </component>
  <NotificationContainer />
  <MaintenanceOverlay />
  <RateLimitWarning />
  <ChatWidget />
</template>

<style scoped>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
