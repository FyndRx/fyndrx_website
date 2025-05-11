<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();
const isOpen = ref(false);

const user = computed(() => authStore.user);
const userInitials = computed(() => authStore.userInitials);

// console.log('User in avatar:', user.value);

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
};

// Close dropdown when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.relative')) {
      isOpen.value = false;
    }
  });
});

defineOptions({
  name: 'UserAvatar'
});
</script>

<script lang="ts">
export default {
  name: 'UserAvatar'
};
</script>

<template>
  <div class="relative">
    <button
      @click="isOpen = !isOpen"
      class="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors"
    >
      <span v-if="!user?.profile_picture" class="text-sm font-medium">
        {{ userInitials }}
      </span>
      <img
        v-else
        :src= "user.profile_picture_full || user.profile_picture"
        :alt="`${user.firstname} ${user.lastname}`"
        class="w-full h-full rounded-full object-cover"
      />
    </button>

    <!-- Dropdown Menu -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
    >
      <div class="py-1" role="menu" aria-orientation="vertical">
        <router-link
          to="/dashboard"
          class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          @click="isOpen = false"
        >
          <i class="fas fa-tachometer-alt mr-2"></i>
          Dashboard
        </router-link>

        <router-link
          to="/profile"
          class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          @click="isOpen = false"
        >
          <i class="fas fa-user mr-2"></i>
          Profile
        </router-link>

        <router-link
          to="/appointments"
          class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          @click="isOpen = false"
        >
          <i class="fas fa-calendar-alt mr-2"></i>
          Appointments
        </router-link>

        <router-link
          to="/prescriptions"
          class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          role="menuitem"
          @click="isOpen = false"
        >
          <i class="fas fa-prescription mr-2"></i>
          Prescriptions
        </router-link>

        <div class="border-t border-gray-100"></div>

        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
          role="menuitem"
        >
          <i class="fas fa-sign-out-alt mr-2"></i>
          Logout
        </button>
      </div>
    </div>
  </div>
</template> 