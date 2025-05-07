<template>
  <div class="flex items-center">
    <input
      :id="id"
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      :class="[
        'h-4 w-4 border-gray-300 dark:border-gray-600',
        'text-primary-600 focus:ring-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        { 'border-red-500': error }
      ]"
      @change="$emit('update:modelValue', value)"
    />
    <label
      v-if="label"
      :for="id"
      class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
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
  name: string;
  label?: string;
  value: string;
  modelValue: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script> 