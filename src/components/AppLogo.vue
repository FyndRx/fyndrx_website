<script setup lang="ts">
import { useDarkMode } from '@/composables/useDarkMode';
import logoBlueOrange from '@/assets/logo/logo_blue_orange.png';
import logoWhiteOrange from '@/assets/logo/logo_white_orange.png';
import { computed } from 'vue';

// Check if dark mode is active
// We can use a prop to force a specific mode if needed, but default to system/app preference
const { isDark } = useDarkMode();

const props = defineProps({
  variant: {
    type: String as () => 'auto' | 'light' | 'dark',
    default: 'auto'
  }
});

const currentLogo = computed(() => {
  if (props.variant === 'light') return logoBlueOrange;
  if (props.variant === 'dark') return logoWhiteOrange;
  
  return isDark.value ? logoWhiteOrange : logoBlueOrange;
});
</script>

<template>
  <img 
    :src="currentLogo" 
    alt="FyndRx Logo" 
    v-bind="$attrs"
  />
</template>
