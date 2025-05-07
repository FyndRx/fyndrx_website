<template>
  <div
    :class="[
      'rounded-md p-4',
      {
        'bg-blue-50 dark:bg-blue-900/30': variant === 'info',
        'bg-green-50 dark:bg-green-900/30': variant === 'success',
        'bg-yellow-50 dark:bg-yellow-900/30': variant === 'warning',
        'bg-red-50 dark:bg-red-900/30': variant === 'error'
      }
    ]"
    role="alert"
  >
    <div class="flex">
      <div class="flex-shrink-0">
        <component
          :is="icon"
          :class="[
            'h-5 w-5',
            {
              'text-blue-400 dark:text-blue-300': variant === 'info',
              'text-green-400 dark:text-green-300': variant === 'success',
              'text-yellow-400 dark:text-yellow-300': variant === 'warning',
              'text-red-400 dark:text-red-300': variant === 'error'
            }
          ]"
        />
      </div>
      <div class="ml-3">
        <h3
          v-if="title"
          :class="[
            'text-sm font-medium',
            {
              'text-blue-800 dark:text-blue-200': variant === 'info',
              'text-green-800 dark:text-green-200': variant === 'success',
              'text-yellow-800 dark:text-yellow-200': variant === 'warning',
              'text-red-800 dark:text-red-200': variant === 'error'
            }
          ]"
        >
          {{ title }}
        </h3>
        <div
          :class="[
            'mt-2 text-sm',
            {
              'text-blue-700 dark:text-blue-300': variant === 'info',
              'text-green-700 dark:text-green-300': variant === 'success',
              'text-yellow-700 dark:text-yellow-300': variant === 'warning',
              'text-red-700 dark:text-red-300': variant === 'error'
            }
          ]"
        >
          <slot />
        </div>
      </div>
      <div v-if="closable" class="ml-auto pl-3">
        <div class="-mx-1.5 -my-1.5">
          <button
            type="button"
            :class="[
              'inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2',
              {
                'text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50': variant === 'info',
                'text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50 dark:text-green-400 dark:hover:bg-green-900/50': variant === 'success',
                'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-900/50': variant === 'warning',
                'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50 dark:text-red-400 dark:hover:bg-red-900/50': variant === 'error'
              }
            ]"
            @click="$emit('close')"
          >
            <span class="sr-only">Dismiss</span>
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { InformationCircleIcon, CheckCircleIcon, ExclamationTriangleIcon, ExclamationCircleIcon } from '@heroicons/vue/24/solid';

const props = defineProps<{
  variant?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  closable?: boolean;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const icon = computed(() => {
  switch (props.variant) {
    case 'success':
      return CheckCircleIcon;
    case 'warning':
      return ExclamationTriangleIcon;
    case 'error':
      return ExclamationCircleIcon;
    default:
      return InformationCircleIcon;
  }
});
</script> 