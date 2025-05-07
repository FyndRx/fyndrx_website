<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import Header from '@/components/landing/Header.vue';
import Footer from '@/components/landing/Footer.vue';

const router = useRouter();
const authStore = useAuthStore();

const navigationItems = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Contact', path: '/contact' }
];

const showMobileMenu = ref(false);
const showUserMenu = ref(false);
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
</script>

<script lang="ts">
export default {
  name: 'MainLayout'
};
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <Header />
    <main class="flex-grow">
      <slot></slot>
    </main>
    <Footer />
  </div>
</template>

<style scoped>
/* Component-specific styles will go here */
</style> 