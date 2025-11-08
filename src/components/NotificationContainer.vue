<script setup lang="ts">
import { useNotification } from '@/composables/useNotification';

const { notifications, removeNotification } = useNotification();

const getIcon = (type: string) => {
  switch (type) {
    case 'success':
      return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    case 'error':
      return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    case 'warning':
      return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>`;
    case 'info':
      return `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>`;
    default:
      return '';
  }
};

const getColorClasses = (type: string) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
        icon: 'text-green-500 dark:text-green-400',
        title: 'text-green-800 dark:text-green-200',
        message: 'text-green-700 dark:text-green-300'
      };
    case 'error':
      return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        icon: 'text-red-500 dark:text-red-400',
        title: 'text-red-800 dark:text-red-200',
        message: 'text-red-700 dark:text-red-300'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: 'text-yellow-500 dark:text-yellow-400',
        title: 'text-yellow-800 dark:text-yellow-200',
        message: 'text-yellow-700 dark:text-yellow-300'
      };
    case 'info':
      return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: 'text-blue-500 dark:text-blue-400',
        title: 'text-blue-800 dark:text-blue-200',
        message: 'text-blue-700 dark:text-blue-300'
      };
    default:
      return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        icon: 'text-gray-500 dark:text-gray-400',
        title: 'text-gray-800 dark:text-gray-200',
        message: 'text-gray-700 dark:text-gray-300'
      };
  }
};
</script>

<template>
  <div class="fixed top-20 right-4 z-50 space-y-4 pointer-events-none">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'pointer-events-auto max-w-sm w-full rounded-xl shadow-2xl border-2 p-4 backdrop-blur-sm transition-all duration-300',
          getColorClasses(notification.type).bg,
          getColorClasses(notification.type).border
        ]"
      >
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg
              class="w-6 h-6"
              :class="getColorClasses(notification.type).icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              v-html="getIcon(notification.type)"
            ></svg>
          </div>
          <div class="flex-1 ml-3">
            <p
              class="text-sm font-medium"
              :class="getColorClasses(notification.type).title"
            >
              {{ notification.title }}
            </p>
            <p
              class="mt-1 text-sm"
              :class="getColorClasses(notification.type).message"
            >
              {{ notification.message }}
            </p>
          </div>
          <button
            @click="removeNotification(notification.id)"
            class="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.notification-enter-active {
  animation: slide-in 0.3s ease-out;
}

.notification-leave-active {
  animation: slide-out 0.3s ease-in;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slide-out {
  from {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
  to {
    transform: translateX(100%) scale(0.9);
    opacity: 0;
  }
}
</style>

