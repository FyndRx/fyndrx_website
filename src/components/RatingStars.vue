<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCount?: boolean;
  count?: number;
  interactive?: boolean;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  maxStars: 5,
  size: 'md',
  showCount: false,
  interactive: false,
  readonly: false,
});

const emit = defineEmits<{
  (e: 'update:rating', value: number): void;
}>();

const hoverRating = ref<number | null>(null);

const sizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
  xl: 'w-6 h-6',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const displayRating = computed(() => {
  if (props.interactive && hoverRating.value !== null) {
    return hoverRating.value;
  }
  return props.rating;
});

const handleStarClick = (star: number) => {
  if (props.interactive && !props.readonly) {
    emit('update:rating', star);
  }
};

const handleStarHover = (star: number) => {
  if (props.interactive && !props.readonly) {
    hoverRating.value = star;
  }
};

const handleMouseLeave = () => {
  hoverRating.value = null;
};
</script>

<template>
  <div class="flex items-center gap-1">
    <div 
      class="flex items-center gap-0.5"
      :class="{ 'cursor-pointer': interactive && !readonly }"
      @mouseleave="handleMouseLeave"
    >
      <svg
        v-for="star in maxStars"
        :key="star"
        :class="[
          sizeClasses[size],
          star <= displayRating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600',
          { 'hover:scale-110 transition-transform': interactive && !readonly }
        ]"
        fill="currentColor"
        viewBox="0 0 20 20"
        @click="handleStarClick(star)"
        @mouseenter="handleStarHover(star)"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
      </svg>
    </div>
    
    <span 
      v-if="showCount && count !== undefined"
      :class="['font-medium text-gray-600 dark:text-gray-400 ml-1', textSizeClasses[size]]"
    >
      ({{ count }})
    </span>
    
    <span 
      v-if="!showCount"
      :class="['font-medium text-gray-900 dark:text-white ml-1', textSizeClasses[size]]"
    >
      {{ rating.toFixed(1) }}
    </span>
  </div>
</template>

