import router from '@/router';

/**
 * A location card that sits directly on the map, pointing at its coordinate via a tail —
 * used by every map surface that plots a pharmacy/branch (the multi-pin map and the
 * single-location map on a pharmacy's own page) so they all look and behave the same way.
 */
export interface PharmacyCardPin {
  id: string;
  name: string;
  /** e.g. the parent chain name for a branch pin. Omitted on single-location maps. */
  subtitle?: string;
  isOpen: boolean;
  deliveryAvailable: boolean;
  /** Internal SPA route the whole card navigates to on click. */
  navigateHref?: string;
  /** External URL (e.g. a directions link) opened in a new tab instead of navigating internally. */
  externalHref?: string;
}

function escapeHtml(value: string): string {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

export function cardInnerHtml(pin: PharmacyCardPin): string {
  const dot = pin.isOpen ? 'bg-emerald-500' : 'bg-gray-400';
  const statusColor = pin.isOpen ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400';
  const subtitle = pin.subtitle
    ? `<p class="text-[10px] text-gray-500 dark:text-gray-400 truncate leading-tight">${escapeHtml(pin.subtitle)}</p>`
    : '';
  const deliveryChip = pin.deliveryAvailable
    ? `<span class="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#246BFD]">
         <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
         Delivers
       </span>`
    : '';

  return `
    <div class="relative flex flex-col gap-1 rounded-2xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl ring-1 ring-black/5 dark:ring-white/10 px-3.5 py-2.5 min-w-[150px] max-w-[230px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5">
      <div class="flex items-center gap-1.5">
        <span class="w-2 h-2 rounded-full flex-shrink-0 ${dot} ${pin.isOpen ? 'animate-pulse' : ''}"></span>
        <p class="text-xs font-bold text-gray-900 dark:text-white truncate flex-1 leading-tight">${escapeHtml(pin.name)}</p>
      </div>
      ${subtitle}
      <div class="flex items-center gap-2">
        <span class="text-[10px] font-semibold ${statusColor}">${pin.isOpen ? 'Open Now' : 'Closed'}</span>
        ${deliveryChip}
      </div>
      <span class="pointer-events-none absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-gray-800 ring-1 ring-black/5 dark:ring-white/10"></span>
    </div>
  `;
}

export function buildCardElement(pin: PharmacyCardPin): HTMLDivElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'absolute -translate-x-1/2 -translate-y-full z-10';
  wrapper.innerHTML = cardInnerHtml(pin);
  wrapper.addEventListener('click', (e) => {
    e.stopPropagation();
    if (pin.externalHref) {
      window.open(pin.externalHref, '_blank');
    } else if (pin.navigateHref) {
      router.push(pin.navigateHref);
    }
  });
  return wrapper;
}

/**
 * Lazily builds the OverlayView subclass — google.maps.OverlayView only exists once the
 * Maps script has loaded, so this must be called after that, not at module-eval time.
 */
export function createCardOverlayClass() {
  const maps: any = google.maps;

  return class PharmacyCardOverlay extends maps.OverlayView {
    private div: HTMLDivElement;
    private position: { lat: number; lng: number };

    constructor(position: { lat: number; lng: number }, div: HTMLDivElement) {
      super();
      this.position = position;
      this.div = div;
    }

    onAdd() {
      this.getPanes().floatPane.appendChild(this.div);
      maps.OverlayView.preventMapHitsAndGesturesFrom(this.div);
    }

    draw() {
      const projection = this.getProjection();
      if (!projection) return;
      const point = projection.fromLatLngToDivPixel(new maps.LatLng(this.position.lat, this.position.lng));
      if (point) {
        this.div.style.left = `${point.x}px`;
        this.div.style.top = `${point.y}px`;
      }
    }

    onRemove() {
      this.div.parentNode?.removeChild(this.div);
    }
  };
}
