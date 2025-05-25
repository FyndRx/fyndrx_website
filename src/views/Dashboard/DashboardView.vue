<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>

<template>
  <div class="min-h-screen px-4 pt-24 pb-12 bg-gray-50 dark:bg-gray-900 sm:px-6 lg:px-8">
    <div class="mx-auto max-w-7xl">
      <div class="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
        <h1 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Welcome, {{ user?.firstname }}!
        </h1>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <!-- Quick Stats -->
          <div class="p-4 rounded-lg bg-primary-50 dark:bg-primary-900">
            <h3 class="text-lg font-medium text-primary-900 dark:text-primary-100">
              Your Profile
            </h3>
            <p class="mt-2 text-primary-700 dark:text-primary-300">
              {{ user?.email }}
            </p>
          </div>
          
          <!-- Recent Activity -->
          <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              No recent activity
            </p>
          </div>
          
          <!-- Quick Actions -->
          <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div class="mt-2 space-y-2">
              <button
                class="w-full px-3 py-2 text-sm text-left text-gray-700 rounded dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Update Profile
              </button>
              <button
                class="w-full px-3 py-2 text-sm text-left text-gray-700 rounded dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                View Appointments
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 