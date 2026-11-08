import router from '@/router';
import placeholderSquare from '@/assets/placeholder/square.png';
import { pharmacyPinSvg, PIN_HEIGHT } from '@/utils/mapBrand';

/**
 * HTML overlays for the FyndRx maps: branded pins, count clusters, the "you are here" dot and
 * the pharmacy popup. Every map that plots a pharmacy builds these through here, so they all
 * look and behave the same way. Class strings are literal on purpose — Tailwind only generates
 * the classes it can see in source.
 */

/** Stacking inside the overlay pane: pins (≤ ~95k, ordered by latitude) < clusters < the open pin. */
const Z_CLUSTER = 100_000;
const Z_ACTIVE = 500_000;

type LatLngLiteral = { lat: number; lng: number };

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

// ── Generic overlay ──────────────────────────────────────────────────────────

/**
 * Lazily builds the OverlayView subclass — google.maps.OverlayView only exists once the Maps
 * script has loaded, so call this after that, never at module-eval time.
 * `pane`: 'overlayMouseTarget' for clickable things, 'floatPane' to sit above them (popup),
 * 'overlayLayer' for non-interactive decoration.
 */
export function createHtmlOverlayClass() {
  const maps: any = (window as any).google.maps;

  return class HtmlOverlay extends maps.OverlayView {
    private el: HTMLElement;
    private position: LatLngLiteral;
    private pane: string;
    private disposed = false;

    constructor(position: LatLngLiteral, el: HTMLElement, pane = 'overlayMouseTarget') {
      super();
      this.position = position;
      this.el = el;
      this.pane = pane;
    }

    onAdd() {
      // Google calls onAdd asynchronously after setMap(map). If the overlay was already disposed
      // (rapid re-renders while zooming), appending now would leave an element nothing removes.
      if (this.disposed) return;
      this.getPanes()[this.pane].appendChild(this.el);
      maps.OverlayView.preventMapHitsAndGesturesFrom(this.el);
    }

    draw() {
      if (this.disposed) return;
      const projection = this.getProjection();
      if (!projection) return;
      const point = projection.fromLatLngToDivPixel(new maps.LatLng(this.position.lat, this.position.lng));
      if (point) {
        this.el.style.left = `${point.x}px`;
        this.el.style.top = `${point.y}px`;
      }
    }

    setPosition(position: LatLngLiteral) {
      this.position = position;
      this.draw();
    }

    onRemove() {
      this.el.parentNode?.removeChild(this.el);
    }

    /** Remove from the map for good. Always use this instead of `setMap(null)`. */
    dispose() {
      this.disposed = true;
      this.setMap(null);
      this.el.remove();
    }
  };
}

// ── Pin ──────────────────────────────────────────────────────────────────────

export interface PinElement {
  el: HTMLElement;
  setActive(active: boolean): void;
}

/** A pharmacy pin. The overlay position is the tip of the pin. */
export function buildPinElement(opts: {
  label: string;
  open: boolean;
  /** Stacking order among pins (southern pins sit in front of northern ones). */
  zIndex?: number;
  onSelect: () => void;
}): PinElement {
  const baseZ = String(opts.zIndex ?? 1);
  const wrapper = document.createElement('div');
  wrapper.className = 'absolute -translate-x-1/2 -translate-y-full';
  wrapper.style.zIndex = baseZ;

  const dot = opts.open ? 'bg-emerald-500' : 'bg-slate-400';
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `${opts.label}, ${opts.open ? 'open now' : 'closed'}`);
  button.title = opts.label;
  button.className =
    'group relative block origin-bottom cursor-pointer transition-transform duration-200 ease-out hover:scale-110 focus-visible:scale-110 focus-visible:outline-none motion-reduce:transition-none';
  button.innerHTML = `
    <span class="absolute bottom-0 left-1/2 h-1.5 w-4 -translate-x-1/2 rounded-full bg-slate-900/25 blur-[2px]"></span>
    <span class="relative block" style="filter: drop-shadow(0 5px 4px rgba(15,23,42,.28))">${pharmacyPinSvg(opts.open)}</span>
    <span class="absolute right-0 top-0 h-3.5 w-3.5 rounded-full ring-2 ring-white ${dot}"></span>
    <span class="pointer-events-none absolute -inset-1 hidden rounded-full ring-4 ring-brand-500/40 group-focus-visible:block"></span>
  `;
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    opts.onSelect();
  });
  wrapper.appendChild(button);

  return {
    el: wrapper,
    setActive(active) {
      button.classList.toggle('scale-125', active);
      wrapper.style.zIndex = active ? String(Z_ACTIVE) : baseZ;
    },
  };
}

// ── Cluster ──────────────────────────────────────────────────────────────────

/** A count bubble standing in for several nearby pins at low zoom. Overlay position is its centre. */
export function buildClusterElement(count: number, onSelect: () => void): HTMLElement {
  const size = 40 + Math.min(count, 60) / 60 * 18;
  const wrapper = document.createElement('div');
  wrapper.className = 'absolute -translate-x-1/2 -translate-y-1/2';
  wrapper.style.zIndex = String(Z_CLUSTER);

  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `${count} pharmacies here, zoom in`);
  button.className =
    'flex items-center justify-center rounded-full bg-brand-500 font-sans text-sm font-semibold text-white shadow-glow-brand ring-4 ring-white/80 transition-transform duration-200 ease-out hover:scale-110 focus-visible:outline-none focus-visible:ring-brand-500/50 motion-reduce:transition-none';
  button.style.width = `${size}px`;
  button.style.height = `${size}px`;
  button.textContent = String(count);
  button.addEventListener('click', (e) => {
    e.stopPropagation();
    onSelect();
  });
  wrapper.appendChild(button);
  return wrapper;
}

// ── User location ────────────────────────────────────────────────────────────

/** "You are here": a brand-blue dot with a soft pulse. Overlay position is its centre. */
export function buildUserDotElement(): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'pointer-events-none absolute -translate-x-1/2 -translate-y-1/2';
  wrapper.innerHTML = `
    <span class="absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/25 motion-safe:animate-ping"></span>
    <span class="relative block h-4 w-4 rounded-full bg-brand-500 ring-[3px] ring-white shadow-glow-brand"></span>
  `;
  wrapper.setAttribute('aria-hidden', 'true');
  return wrapper;
}

// ── Popup ────────────────────────────────────────────────────────────────────

export interface PharmacyPopupData {
  id: string;
  name: string;
  /** e.g. the parent chain for a branch. */
  subtitle?: string;
  logo?: string | null;
  rating?: number;
  isOpen: boolean;
  deliveryAvailable: boolean;
  phone?: string | null;
  /** Internal SPA route for the primary "View" action; omitted where the page is already that pharmacy. */
  viewHref?: string;
  directionsHref?: string;
}

const ICON_DIRECTIONS =
  '<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>';
const ICON_PHONE =
  '<svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z"/></svg>';
const ICON_DELIVERY =
  '<svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>';

const ACTION_BASE =
  'inline-flex h-10 items-center justify-center rounded-full text-sm font-semibold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 active:scale-95';

/**
 * The pharmacy popup. One element per open popup; the overlay position is the pin tip it points to.
 * `onClose` is called from the close button (the map itself closes it on a map click).
 */
export function buildPopupElement(data: PharmacyPopupData, onClose: () => void): { el: HTMLElement; animateIn(): void } {
  const wrapper = document.createElement('div');
  // Bottom padding lifts the card clear of the pin it belongs to.
  // font-sans: Google forces Roboto on everything inside the map, so the brand font must be set here
  wrapper.className = 'absolute -translate-x-1/2 -translate-y-full font-sans';
  wrapper.style.paddingBottom = `${PIN_HEIGHT + 8}px`;
  wrapper.style.zIndex = '2000';

  const status = data.isOpen
    ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400"><span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>Open now</span>'
    : '<span class="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300"><span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span>Closed</span>';
  const delivery = data.deliveryAvailable
    ? `<span class="inline-flex items-center gap-1 rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-600 dark:text-brand-300">${ICON_DELIVERY}Delivers</span>`
    : '';
  const rating =
    data.rating && data.rating > 0
      ? `<span class="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-200"><svg class="h-3.5 w-3.5 text-accent-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"><path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.07 3.29a1 1 0 00.95.69h3.46c.97 0 1.37 1.24.59 1.81l-2.8 2.03a1 1 0 00-.36 1.12l1.07 3.29c.3.92-.76 1.69-1.54 1.12l-2.8-2.03a1 1 0 00-1.18 0l-2.8 2.03c-.78.57-1.84-.2-1.54-1.12l1.07-3.29a1 1 0 00-.36-1.12L3.98 8.72c-.78-.57-.38-1.81.59-1.81h3.46a1 1 0 00.95-.69l1.07-3.29z"/></svg>${data.rating.toFixed(1)}</span>`
      : '';

  const view = data.viewHref
    ? `<a data-action="view" href="${escapeHtml(data.viewHref)}" class="${ACTION_BASE} flex-1 bg-brand-500 px-4 text-white shadow-glow-brand hover:bg-brand-600">View pharmacy</a>`
    : '';
  const directions = data.directionsHref
    ? `<a href="${escapeHtml(data.directionsHref)}" target="_blank" rel="noopener noreferrer" aria-label="Get directions" title="Directions" class="${ACTION_BASE} ${
        data.viewHref ? 'w-10 shrink-0 bg-white text-gray-600 ring-1 ring-gray-200 hover:text-brand-600 hover:ring-brand-500 dark:bg-gray-700 dark:text-gray-200 dark:ring-white/10' : 'flex-1 gap-2 bg-brand-500 px-4 text-white shadow-glow-brand hover:bg-brand-600'
      }">${ICON_DIRECTIONS}${data.viewHref ? '' : 'Get directions'}</a>`
    : '';
  const call = data.phone
    ? `<a href="tel:${escapeHtml(data.phone.replace(/[^\d+]/g, ''))}" aria-label="Call pharmacy" title="Call" class="${ACTION_BASE} w-10 shrink-0 bg-white text-gray-600 ring-1 ring-gray-200 hover:text-brand-600 hover:ring-brand-500 dark:bg-gray-700 dark:text-gray-200 dark:ring-white/10">${ICON_PHONE}</a>`
    : '';

  wrapper.innerHTML = `
    <div data-card role="dialog" aria-label="${escapeHtml(data.name)}" class="relative w-[288px] max-w-[calc(100vw-2rem)] rounded-3xl bg-white p-4 shadow-float ring-1 ring-black/5 dark:bg-gray-800 dark:ring-white/10">
      <button type="button" data-action="close" aria-label="Close" class="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 dark:hover:bg-white/10 dark:hover:text-gray-200">
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
      </button>
      <div class="flex items-center gap-3 pr-6">
        <div class="h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-gray-100 p-0.5 ring-1 ring-gray-200/70 dark:bg-gray-700 dark:ring-white/10">
          <img data-logo alt="" class="h-full w-full rounded-[10px] object-contain" />
        </div>
        <div class="min-w-0">
          <p class="truncate text-sm font-semibold leading-tight text-gray-900 dark:text-white">${escapeHtml(data.name)}</p>
          ${data.subtitle ? `<p class="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">${escapeHtml(data.subtitle)}</p>` : ''}
        </div>
      </div>
      <div class="mt-3 flex flex-wrap items-center gap-1.5">${status}${delivery}${rating}</div>
      ${view || directions || call ? `<div class="mt-3.5 flex items-center gap-2">${view}${directions}${call}</div>` : ''}
      <span class="pointer-events-none absolute -bottom-1.5 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] bg-white dark:bg-gray-800"></span>
    </div>
  `;

  const card = wrapper.querySelector<HTMLElement>('[data-card]')!;

  // Logo, with the FyndRx placeholder (blended into the tile in both themes) when missing or broken.
  const img = wrapper.querySelector<HTMLImageElement>('[data-logo]')!;
  const usePlaceholder = () => {
    img.src = placeholderSquare;
    img.classList.add('mix-blend-multiply', 'dark:invert', 'dark:mix-blend-screen', 'dark:opacity-70');
  };
  if (data.logo) {
    img.src = data.logo;
    img.addEventListener('error', usePlaceholder, { once: true });
  } else {
    usePlaceholder();
  }

  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]');
    if (!target) return;
    if (target.dataset.action === 'close') {
      onClose();
    } else if (target.dataset.action === 'view' && data.viewHref) {
      e.preventDefault();
      router.push(data.viewHref);
    }
  });

  return {
    el: wrapper,
    animateIn() {
      if (reducedMotion() || !card.animate) return;
      card.animate(
        [
          { opacity: 0, transform: 'translateY(8px) scale(0.97)' },
          { opacity: 1, transform: 'none' },
        ],
        { duration: 200, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' },
      );
    },
  };
}

/**
 * Nudges the map so a freshly opened popup isn't cut off by the map edge (or by UI floating
 * over the top of it). `inset` is how much room to keep clear on each side, in pixels.
 */
export function panPopupIntoView(
  map: any,
  popupEl: HTMLElement,
  container: HTMLElement,
  inset: { top?: number; right?: number; bottom?: number; left?: number } = {},
) {
  // Wait for Google to add and position the overlay (it does so asynchronously) before measuring.
  setTimeout(() => {
    const card = popupEl.querySelector<HTMLElement>('[data-card]') ?? popupEl;
    const r = card.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    const top = inset.top ?? 16;
    const side = (v?: number) => v ?? 16;
    let dx = 0;
    let dy = 0;
    if (r.top < c.top + top) dy = r.top - (c.top + top);
    if (r.left < c.left + side(inset.left)) dx = r.left - (c.left + side(inset.left));
    else if (r.right > c.right - side(inset.right)) dx = r.right - (c.right - side(inset.right));
    if (dx || dy) map.panBy(dx, dy);
  }, 220);
}
