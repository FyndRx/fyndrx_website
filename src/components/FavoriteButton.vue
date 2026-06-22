<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { favoritesService } from '@/services/favoritesService';
import { useNotification } from '@/composables/useNotification';

interface Props {
  type: 'medication' | 'pharmacy';
  itemId: string | number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  showLabel: false,
});

const emit = defineEmits<{ toggled: [favorited: boolean] }>();

const notification = useNotification();
const isFavorite = ref(false);
const isLoading = ref(false);

const sizeClasses = {
  small:  'w-8 h-8',
  medium: 'w-10 h-10',
  large:  'w-12 h-12',
};

const iconSizes = {
  small:  'w-4 h-4',
  medium: 'w-5 h-5',
  large:  'w-6 h-6',
};

const toggle = async (e: Event) => {
  e.stopPropagation();
  if (isLoading.value) return;
  isLoading.value = true;

  // Optimistic update
  const prev = isFavorite.value;
  isFavorite.value = !prev;

  try {
    await favoritesService.toggleFavorite(props.type, props.itemId);
    emit('toggled', isFavorite.value);

    if (isFavorite.value) {
      notification.success('Added to Favorites', `Saved to your favorites.`);
    } else {
      notification.info('Removed from Favorites', `Removed from your favorites.`);
    }
  } catch {
    // Revert on failure
    isFavorite.value = prev;
    notification.error('Error', 'Could not update favorites. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  isFavorite.value = favoritesService.isFavorite(props.type, props.itemId);
});
</script>

<template>
  <button
    @click="toggle"
    :disabled="isLoading"
    :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
    :aria-label="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
    :class="[
      'flex items-center justify-center rounded-full transition-all duration-200',
      sizeClasses[size],
      isFavorite
        ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500',
      isLoading ? 'opacity-60 cursor-wait' : 'cursor-pointer',
    ]"
  >
    <!-- Spinner while loading -->
    <svg v-if="isLoading" :class="[iconSizes[size], 'animate-spin']" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>

    <!-- Heart icon -->
    <svg
      v-else
      :class="[iconSizes[size], 'transition-transform duration-200', isFavorite ? 'scale-110' : '']"
      :fill="isFavorite ? 'currentColor' : 'none'"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>

    <span v-if="showLabel" class="ml-2 text-sm font-medium">
      {{ isLoading ? '…' : isFavorite ? 'Saved' : 'Save' }}
    </span>
  </button>
</template>
