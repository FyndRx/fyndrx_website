<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { favoritesService } from '@/services/favoritesService';
import { useNotification } from '@/composables/useNotification';

interface Props {
  type: 'medication' | 'pharmacy';
  itemId: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showLabel: false
});

const notification = useNotification();
const isFavorite = ref(false);

const sizeClasses = {
  small: 'w-8 h-8',
  medium: 'w-10 h-10',
  large: 'w-12 h-12'
};

const iconSizes = {
  small: 'w-4 h-4',
  medium: 'w-5 h-5',
  large: 'w-6 h-6'
};

const toggleFavorite = (e: Event) => {
  e.stopPropagation();
  const newState = favoritesService.toggleFavorite(props.type, props.itemId);
  isFavorite.value = newState;
  
  if (newState) {
    notification.success(
      'Added to Favorites', 
      `This ${props.type} has been added to your favorites.`
    );
  } else {
    notification.info(
      'Removed from Favorites', 
      `This ${props.type} has been removed from your favorites.`
    );
  }
};

onMounted(() => {
  isFavorite.value = favoritesService.isFavorite(props.type, props.itemId);
});
</script>

<template>
  <button
    @click="toggleFavorite"
    :class="[
      'flex items-center justify-center rounded-full transition-all duration-300',
      sizeClasses[size],
      isFavorite
        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-red-600 dark:hover:text-red-400'
    ]"
    :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
  >
    <svg 
      :class="[iconSizes[size], 'transition-transform', isFavorite ? 'scale-110' : '']" 
      :fill="isFavorite ? 'currentColor' : 'none'" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      ></path>
    </svg>
    <span v-if="showLabel" class="ml-2 text-sm font-medium">
      {{ isFavorite ? 'Favorited' : 'Favorite' }}
    </span>
  </button>
</template>

