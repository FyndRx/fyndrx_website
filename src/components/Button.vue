<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  (e: 'click'): void;
}>();
</script>

<template>
  <button
    :type="type"
    :class="[
      'rounded-full font-medium transition-all duration-300 inline-flex items-center justify-center',
      variant === 'primary' ? 'bg-[#246BFD] text-white hover:bg-[#5089FF] hover:shadow-lg hover:shadow-[#246BFD]/20' : 
      variant === 'secondary' ? 'bg-white text-[#246BFD] border-2 border-[#246BFD] hover:bg-[#246BFD] hover:text-white' :
      variant === 'accent' ? 'bg-[#FE9615] text-white hover:bg-[#ffb547] hover:shadow-lg hover:shadow-[#FE9615]/20' : '',
      size === 'small' ? 'text-sm px-4 py-2' : 
      size === 'large' ? 'text-lg px-8 py-4' : 
      'px-6 py-3',
      { 'w-full': fullWidth },
      { 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot></slot>
  </button>
</template> 