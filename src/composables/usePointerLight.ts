import { onBeforeUnmount, onMounted, type Ref } from 'vue';

/**
 * Drives a "light source" over a surface from the pointer position.
 *
 * Writes four CSS custom properties on the target element:
 *   --mx / --my : light position in %  (0–100)
 *   --px / --py : normalised offset from centre (-1–1), handy for parallax
 *   --glow-on   : 1 while the pointer is over the surface, 0 otherwise, so a
 *                 light layer can fade in/out and be absent at rest / on touch
 *
 * The values are eased toward the pointer in a rAF loop that stops itself once
 * settled, so an idle page costs nothing. With reduced motion or a coarse
 * pointer (touch) the light simply rests at its default position.
 */
export function usePointerLight(
  target: Ref<HTMLElement | null>,
  rest: { x: number; y: number } = { x: 70, y: 22 },
  ease = 0.08,
) {
  let frame = 0;
  let current = { ...rest };
  let goal = { ...rest };
  let cleanup: (() => void) | null = null;

  const write = () => {
    const el = target.value;
    if (!el) return;
    el.style.setProperty('--mx', `${current.x.toFixed(2)}%`);
    el.style.setProperty('--my', `${current.y.toFixed(2)}%`);
    el.style.setProperty('--px', ((current.x - 50) / 50).toFixed(3));
    el.style.setProperty('--py', ((current.y - 50) / 50).toFixed(3));
  };

  const tick = () => {
    const dx = goal.x - current.x;
    const dy = goal.y - current.y;
    current = { x: current.x + dx * ease, y: current.y + dy * ease };
    write();
    frame = Math.abs(dx) + Math.abs(dy) > 0.05 ? requestAnimationFrame(tick) : 0;
  };

  const kick = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  onMounted(() => {
    write();
    const el = target.value;
    if (!el) return;
    el.style.setProperty('--glow-on', '0');

    const canTrack =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canTrack) return;

    const onMove = (e: PointerEvent) => {
      el.style.setProperty('--glow-on', '1');
      const rect = el.getBoundingClientRect();
      goal = {
        x: Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100)),
        y: Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100)),
      };
      kick();
    };
    const onLeave = () => {
      el.style.setProperty('--glow-on', '0');
      goal = { ...rest };
      kick();
    };

    el.addEventListener('pointermove', onMove, { passive: true });
    el.addEventListener('pointerleave', onLeave);
    cleanup = () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  });

  onBeforeUnmount(() => {
    cleanup?.();
    if (frame) cancelAnimationFrame(frame);
  });
}
