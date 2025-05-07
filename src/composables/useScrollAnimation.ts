import { ref, onMounted, onUnmounted } from 'vue';

export function useScrollAnimation() {
  const elements = ref<HTMLElement[]>([]);

  const handleScroll = () => {
    elements.value.forEach(element => {
      const rect = element.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight * 0.8;

      if (isVisible) {
        element.classList.add('visible');
      }
    });
  };

  const registerElement = (element: HTMLElement) => {
    if (!elements.value.includes(element)) {
      elements.value.push(element);
      element.classList.add('animate-on-scroll');
    }
  };

  onMounted(() => {
    window.addEventListener('scroll', handleScroll);
    // Initial check for elements in view
    handleScroll();
  });

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  return {
    registerElement,
  };
}
