<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <div class="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome, {{ user?.firstname }}!
        </h1>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Quick Stats -->
          <div class="bg-primary-50 dark:bg-primary-900 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-primary-900 dark:text-primary-100">
              Your Profile
            </h3>
            <p class="mt-2 text-primary-700 dark:text-primary-300">
              {{ user?.email }}
            </p>
          </div>
          
          <!-- Recent Activity -->
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <p class="mt-2 text-gray-600 dark:text-gray-300">
              No recent activity
            </p>
          </div>
          
          <!-- Quick Actions -->
          <div class="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 class="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
            <div class="mt-2 space-y-2">
              <button
                class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
              >
                Update Profile
              </button>
              <button
                class="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
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