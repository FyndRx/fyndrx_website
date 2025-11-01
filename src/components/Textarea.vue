<script setup lang="ts">
defineProps<{
  id?: string;
  label?: string;
  modelValue: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  rows?: number;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <div class="relative">
    <label
      v-if="label"
      :for="id"
      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
    >
      {{ label }}
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :class="[
        'w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600',
        'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        { 'border-red-500': error }
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    ></textarea>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-if="helper" class="mt-1 text-sm text-gray-500 dark:text-gray-400">{{ helper }}</p>
  </div>
</template> 