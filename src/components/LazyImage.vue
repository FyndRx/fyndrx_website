<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import squarePlaceholder from '@/assets/placeholder/square.png';
import landscapePlaceholder from '@/assets/placeholder/landscape.png';

interface Props {
  src: string;
  alt: string;
  aspectRatio?: 'square' | 'landscape';
  className?: string;
  placeholder?: string;
}

const props = withDefaults(defineProps<Props>(), {
  aspectRatio: 'landscape',
  className: '',
  placeholder: '',
});

const imageLoaded = ref(false);
const imageError = ref(false);
const imageRef = ref<HTMLImageElement | null>(null);

// One light placeholder for both themes. In dark mode CSS inverts it and blends it into the
// container (see `placeholderClass`), so it takes the surface colour behind it instead of
// showing a flat grey tile. A custom `placeholder` prop is shown untouched.
const placeholderSrc = computed(() => {
  if (props.placeholder) return props.placeholder;
  return props.aspectRatio === 'square' ? squarePlaceholder : landscapePlaceholder;
});

const placeholderClass = computed(() =>
  props.placeholder ? '' : 'mix-blend-multiply dark:invert dark:mix-blend-screen dark:opacity-70',
);

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
      class="object-cover w-full h-full"
      :class="placeholderClass"
    />
    
    <!-- Actual Image -->
    <img
      ref="imageRef"
      :src="imageError ? placeholderSrc : src"
      :alt="alt"
      class="object-cover w-full h-full transition-opacity duration-300"
      :class="[
        imageLoaded ? 'opacity-100' : 'opacity-0',
        imageError ? placeholderClass : '',
      ]"
      @load="handleImageLoad"
      @error="handleImageError"
    />
  </div>
</template> 