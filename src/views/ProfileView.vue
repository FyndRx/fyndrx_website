<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import LazyImage from '@/components/LazyImage.vue';

const router = useRouter();
const authStore = useAuthStore();
const user = computed(() => authStore.user);
</script>

<template>
  <div class="container px-4 mx-auto py-36">
    <div class="max-w-4xl mx-auto">
      <div class="flex items-center justify-between mb-8">
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
      
      <div class="p-8 transition-colors duration-300 bg-white shadow-lg dark:bg-gray-800 rounded-xl">
        <div class="flex flex-col items-center mb-8 space-y-6 md:flex-row md:items-start md:space-y-0 md:space-x-8">
          <div class="relative group">
            <div class="flex items-center justify-center w-40 h-40 overflow-hidden rounded-full bg-primary/10 dark:bg-primary/20 ring-4 ring-primary/20 dark:ring-primary/30">
              <!-- <img
                v-if="user?.profile_picture"
                :src="user.profile_picture_full || user.profile_picture"
                :alt="`${user?.firstname} ${user?.lastname}`"
                class="object-cover w-full h-full"
              /> -->
              <LazyImage
                v-if="user?.profile_picture"
                :src="user?.profile_picture_full || user?.profile_picture || ''"
                :alt="`${user?.firstname} ${user?.lastname}`"
                :aspectRatio="'square'"
                class="object-cover w-full h-full rounded-full"
              />
              <span v-else class="text-5xl font-medium text-primary dark:text-primary/80">
                {{ authStore.userInitials }}
              </span>
            </div>
            <div class="absolute inset-0 flex items-center justify-center transition-opacity duration-300 rounded-full opacity-0 bg-black/50 group-hover:opacity-100">
              <button
                @click="router.push('/profile/edit')"
                class="text-sm font-medium text-white transition-colors hover:text-primary/90"
              >
                <i class="text-xl fas fa-camera"></i>
              </button>
            </div>
          </div>
          
          <div class="text-center md:text-left">
            <h2 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
              {{ user?.firstname }} {{ user?.lastname }}
            </h2>
            <p class="text-lg text-gray-600 dark:text-gray-300">{{ user?.email }}</p>
            <div class="inline-flex items-center px-4 py-2 mt-4 rounded-full bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary/80">
              <i class="mr-2 fas fa-id-card"></i>
              <span>{{ user?.member_id || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div class="space-y-6">
            <div class="p-6 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <i class="mr-2 fas fa-user-circle text-primary"></i>
                Personal Information
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">First Name</label>
                  <p class="mt-1 text-lg text-gray-900 dark:text-white">{{ user?.firstname }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Last Name</label>
                  <p class="mt-1 text-lg text-gray-900 dark:text-white">{{ user?.lastname }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                  <p class="mt-1 text-lg text-gray-900 dark:text-white">{{ user?.email }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="p-6 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              <h3 class="flex items-center mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                <i class="mr-2 fas fa-phone-alt text-primary"></i>
                Contact Information
              </h3>
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Phone Number</label>
                  <p class="mt-1 text-lg text-gray-900 dark:text-white">{{ user?.phone_number || 'Not provided' }}</p>
                </div>
                
                <div>
                  <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Member ID</label>
                  <p class="mt-1 text-lg text-gray-900 dark:text-white">{{ user?.member_id || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 