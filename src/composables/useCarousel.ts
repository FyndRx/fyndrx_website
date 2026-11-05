import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/**
 * Scroll-edge awareness for a horizontally scrolling card row.
 *
 * Exposes whether the row can still scroll each way (to disable arrows at the
 * ends), a one-card scroll helper, and an inline style that drives an edge-fade
 * mask: only a side with more content to reveal gets a fade.
 *
 * The container is usually rendered conditionally (after data loads), so call
 * `update()` once it exists, and bind it to the container's `scroll` event.
 */
export function useCarousel(container: Ref<HTMLElement | null>, gap = 24, fadeSize = '2.5rem') {
  const canScrollLeft = ref(false);
  const canScrollRight = ref(false);

  const update = () => {
    const el = container.value;
    if (!el) {
      canScrollLeft.value = false;
      canScrollRight.value = false;
      return;
    }
    canScrollLeft.value = el.scrollLeft > 4;
    canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4;
  };

  const scrollByCard = (direction: 1 | -1) => {
    const el = container.value;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + gap : 400;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: direction * step, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const fadeStyle = computed(() => ({
    '--fl': canScrollLeft.value ? fadeSize : '0px',
    '--fr': canScrollRight.value ? fadeSize : '0px',
  }));

  onMounted(() => window.addEventListener('resize', update, { passive: true }));
  onBeforeUnmount(() => window.removeEventListener('resize', update));

  return { canScrollLeft, canScrollRight, update, scrollByCard, fadeStyle };
}
