<script setup lang="ts">
import Header from '@/views/Home/landing/Header.vue';
import Footer from '@/views/Home/landing/Footer.vue';
import MaintenanceBanner from '@/components/MaintenanceBanner.vue';
</script>

<script lang="ts">
export default {
  name: 'MainLayout'
};
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <MaintenanceBanner />
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