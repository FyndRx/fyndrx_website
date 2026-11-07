import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

/**
 * Reports when an element has scrolled into view, for scroll-triggered reveals.
 *
 * - `once` (default true): flips to true the first time and stays true, so the
 *   entrance plays once and never replays while scrolling back and forth.
 * - Falls back to `true` immediately where IntersectionObserver is unavailable,
 *   so content is never left hidden.
 *
 * Pair it with CSS keyed on a class (e.g. `.is-in`) and gate the motion behind
 * `prefers-reduced-motion` in the stylesheet.
 */
export function useInView(
  target: Ref<HTMLElement | null>,
  options: { threshold?: number; once?: boolean } = {},
) {
  const inView = ref(false);
  const once = options.once ?? true;
  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    const el = target.value;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      inView.value = true;
      return;
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          inView.value = true;
          if (once) observer?.disconnect();
        } else if (!once) {
          inView.value = false;
        }
      },
      { threshold: options.threshold ?? 0.25 },
    );
    observer.observe(el);
  });

  onBeforeUnmount(() => observer?.disconnect());

  return { inView };
}
