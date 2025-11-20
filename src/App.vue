<script setup lang="ts">
import MainLayout from '@/layouts/MainLayout.vue';
import NotificationContainer from '@/components/NotificationContainer.vue';
import { onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';
import { favoritesService } from '@/services/favoritesService';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.checkAuth();
  if (authStore.isAuthenticated) {
    await favoritesService.initialize();
  }
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
