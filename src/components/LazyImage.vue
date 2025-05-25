<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface Props {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'landscape';
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 'landscape',
  className: '',
});

const imageLoaded = ref(false);
const imageError = ref(false);
const imageRef = ref<HTMLImageElement | null>(null);

const placeholderSrc = computed(() => {
  return `/src/assets/placeholder/${props.aspectRatio}.png`;
});

const handleImageLoad = () => {
  imageLoaded.value = true;
};

const handleImageError = () => {
  imageError.value = true;
  imageLoaded.value = true;
};

onMounted(() => {
  if (imageRef.value) {
    if ('loading' in HTMLImageElement.prototype) {
      imageRef.value.loading = 'lazy';
    } else {
      // Fallback for browsers that don't support native lazy loading
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = props.src;
            observer.unobserve(img);
          }
        });
      });
      observer.observe(imageRef.value);
    }
  }
});
</script>

<script lang="ts">
export default {
  name: 'LazyImage'
};
</script>

<template>
  <div 
    class="relative overflow-hidden bg-gray-100 dark:bg-gray-800"
    :class="[
      aspectRatio === 'square' ? 'aspect-square' : 'aspect-video',
      className
    ]"
  >
    <!-- Placeholder -->
    <img
      v-if="!imageLoaded"
      :src="placeholderSrc"
      :alt="alt"
      class="w-full h-full object-cover"
    />
    
    <!-- Actual Image -->
    <img
      ref="imageRef"
      :src="imageError ? placeholderSrc : src"
      :alt="alt"
      class="w-full h-full object-cover transition-opacity duration-300"
      :class="{ 'opacity-0': !imageLoaded, 'opacity-100': imageLoaded }"
      @load="handleImageLoad"
      @error="handleImageError"
    />
  </div>
</template> 