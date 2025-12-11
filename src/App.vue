<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import NotificationContainer from '@/components/NotificationContainer.vue';
import { useAuthStore } from '@/store/auth';
import { favoritesService } from '@/services/favoritesService';

const router = useRouter();
const authStore = useAuthStore();

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

    console.log('App mounted, checking auth...');
    await authStore.checkAuth();
    if (authStore.isAuthenticated) {
      await favoritesService.initialize();
    }
  } catch (err) {
    console.error('Error during app initialization:', err);
  }
});

onUnmounted(() => {
  window.removeEventListener('auth:unauthorized', handleUnauthorized);
});
</script>

<template>
  <MainLayout>
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <NotificationContainer />
  </MainLayout>
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
