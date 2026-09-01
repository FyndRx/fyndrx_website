<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import MaintenanceBanner from '@/components/MaintenanceBanner.vue';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar.vue';
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue';

const route = useRoute();
const sidebarOpen = ref(false);

// Close the mobile drawer whenever navigation happens (clicking a nav link already
// does this, but this also covers back/forward and programmatic router.push calls).
watch(() => route.fullPath, () => {
  sidebarOpen.value = false;
});
</script>

<script lang="ts">
export default {
  name: 'DashboardLayout'
};
</script>

<template>
  <div class="h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
    <MaintenanceBanner />

    <div class="flex flex-1 min-h-0">
      <DashboardSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

      <div class="flex-1 flex flex-col min-w-0">
        <DashboardHeader @toggle-sidebar="sidebarOpen = !sidebarOpen" />

        <!-- pt-8: breathing room below the in-flow header — pages themselves only
             carry horizontal container padding + bottom padding, not top, since the
             old floating public-site header (which needed pt-20/24/28 to clear) no
             longer applies here. -->
        <main class="flex-1 overflow-y-auto pt-8">
          <slot></slot>
        </main>
      </div>
    </div>
  </div>
</template>
