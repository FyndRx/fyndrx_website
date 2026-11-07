import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * "Tuck on scroll": reports whether a floating control should step out of the way.
 *
 * Scrolling down through content tucks it (it stops covering text); scrolling up, or being near
 * the top or bottom of the page, brings it back. Only active below the `md` breakpoint, where a
 * fixed button actually competes with the content for space.
 */
export function useScrollTuck(options: { threshold?: number; edge?: number } = {}) {
  const threshold = options.threshold ?? 10; // px of movement before we react
  const edge = options.edge ?? 160; // px from top/bottom where the control always shows

  const tucked = ref(false);
  let lastY = 0;
  let frame = 0;
  let mobile: MediaQueryList | null = null;

  const evaluate = () => {
    frame = 0;
    if (!mobile?.matches) {
      tucked.value = false;
      return;
    }
    const y = window.scrollY;
    const nearTop = y < edge;
    const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - edge;
    const delta = y - lastY;

    if (nearTop || nearBottom) {
      tucked.value = false;
      lastY = y;
    } else if (delta > threshold) {
      tucked.value = true;
      lastY = y;
    } else if (delta < -threshold) {
      tucked.value = false;
      lastY = y;
    }
  };

  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(evaluate);
  };

  onMounted(() => {
    mobile = window.matchMedia('(max-width: 767px)');
    lastY = window.scrollY;
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll);
    if (frame) cancelAnimationFrame(frame);
  });

  return { tucked };
}
