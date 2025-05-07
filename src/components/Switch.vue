<template>
  <div class="flex items-center">
    <button
      type="button"
      :id="id"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="[
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        modelValue ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700',
        'disabled:opacity-50 disabled:cursor-not-allowed'
      ]"
      @click="$emit('update:modelValue', !modelValue)"
    >
      <span
        :class="[
          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0',
          'transition duration-200 ease-in-out',
          modelValue ? 'translate-x-5' : 'translate-x-0'
        ]"
      />
    </button>
    <label
      v-if="label"
      :for="id"
      class="ml-3 block text-sm text-gray-700 dark:text-gray-300"
    >
      {{ label }}
    </label>
  </div>
  <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
  <p v-if="helper" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ helper }}</p>
</template>

<script setup lang="ts">
defineProps<{
  id?: string;
  label?: string;
  modelValue: boolean;
  disabled?: boolean;
  error?: string;
  helper?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
}>();
</script> 