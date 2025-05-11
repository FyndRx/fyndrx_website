<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>

<template>
  <div class="container mx-auto px-4 py-36">
    <div class="max-w-4xl mx-auto">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <div class="flex space-x-4">
          <button
            @click="router.push('/dashboard')"
            class="px-6 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 flex items-center space-x-2"
          >
            <i class="fas fa-arrow-left"></i>
            <span>Back to Dashboard</span>
          </button>
          <button
            @click="router.push('/profile/edit')"
            class="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-primary/20 flex items-center space-x-2"
          >
            <i class="fas fa-edit"></i>
            <span>Edit Profile</span>
          </button>
        </div>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 transition-colors duration-300">
        <div class="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8 mb-8">
          <div class="relative group">
            <div class="w-40 h-40 rounded-full overflow-hidden bg-primary/10 dark:bg-primary/20 flex items-center justify-center ring-4 ring-primary/20 dark:ring-primary/30">
              <img
                v-if="user?.profile_picture"
                :src="user.profile_picture_full || user.profile_picture"
                :alt="`${user?.firstname} ${user?.lastname}`"
                class="w-full h-full object-cover"
              />
              <span v-else class="text-5xl text-primary dark:text-primary/80 font-medium">
                {{ authStore.userInitials }}
              </span>
            </div>
            <div class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                @click="router.push('/profile/edit')"
                class="text-white text-sm font-medium hover:text-primary/90 transition-colors"
              >
                <i class="fas fa-camera text-xl"></i>
              </button>
            </div>
          </div>
          
          <div class="text-center md:text-left">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {{ user?.firstname }} {{ user?.lastname }}
            </h2>
            <p class="text-gray-600 dark:text-gray-300 text-lg">{{ user?.email }}</p>
            <div class="mt-4 inline-flex items-center px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/80">
              <i class="fas fa-id-card mr-2"></i>
              <span>{{ user?.member_id || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-user-circle mr-2 text-primary"></i>
                Personal Information
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">First Name</label>
                  <p class="mt-1 text-gray-900 dark:text-white text-lg">{{ user?.firstname }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Last Name</label>
                  <p class="mt-1 text-gray-900 dark:text-white text-lg">{{ user?.lastname }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p class="mt-1 text-gray-900 dark:text-white text-lg">{{ user?.email }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <i class="fas fa-phone-alt mr-2 text-primary"></i>
                Contact Information
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                  <p class="mt-1 text-gray-900 dark:text-white text-lg">{{ user?.phone_number || 'Not provided' }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Member ID</label>
                  <p class="mt-1 text-gray-900 dark:text-white text-lg">{{ user?.member_id || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 