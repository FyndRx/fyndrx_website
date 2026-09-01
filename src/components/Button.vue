<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    :type="type"
    :class="[
      'rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center gap-2',
      variant === 'primary' ? 'bg-[#246BFD] text-white hover:bg-[#5089FF] hover:shadow-lg hover:shadow-[#246BFD]/20' :
      variant === 'secondary' ? 'bg-white text-[#246BFD] border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white' :
      variant === 'accent' ? 'bg-[#FE9615] text-white hover:bg-[#ffb547] hover:shadow-lg hover:shadow-[#FE9615]/20' : '',
      size === 'small' ? 'text-sm px-4 py-2' :
      size === 'large' ? 'text-lg px-8 py-4' :
      'px-6 py-3',
      { 'w-full': fullWidth || block },
      { 'opacity-50 cursor-not-allowed': disabled || loading }
    ]"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    :aria-disabled="disabled || loading ? 'true' : undefined"
    @click="$emit('click')"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot></slot>
  </button>
</template>
