/**
 * FyndRx map brand kit — the one place that decides how every map in the project looks:
 * the base map styling (light + dark) and the marker artwork. Overlays/popups live in
 * `mapOverlays.ts`; both read the colours from here so a rebrand is a one-file change.
 */

export const MAP_COLORS = {
  brand: '#246BFD',
  brandDeep: '#1A56D6',
  accent: '#FE9615',
  open: '#10B981',
  closed: '#94A3B8',
  closedPin: '#7C8AA5',
} as const;

type StyleRule = { featureType?: string; elementType?: string; stylers: Record<string, string>[] };

/**
 * Soft blue-tinted base map: pale land, brand-tinted water, white roads with warm (accent)
 * highways. POIs and transit are hidden so our own markers are the only thing competing for
 * attention. Dark mode is a navy variant of the same map.
 */
export function brandMapStyles(dark: boolean): StyleRule[] {
  const c = dark
    ? {
        land: '#0f1a2e', text: '#8da2c4', stroke: '#0b1220',
        road: '#1b2b4a', roadLine: '#14223c', highway: '#4a3a1d', highwayLine: '#3a2d15',
        water: '#0a2a5a', waterText: '#5f84c4', park: '#10281f', admin: '#2a3b5c',
      }
    : {
        land: '#eef3fb', text: '#5b6b86', stroke: '#ffffff',
        road: '#ffffff', roadLine: '#dbe5f5', highway: '#ffe4b8', highwayLine: '#f6cf93',
        water: '#b9d3ff', waterText: '#6f8fc7', park: '#dcefe3', admin: '#c5d2e8',
      };

  return [
    { elementType: 'geometry', stylers: [{ color: c.land }] },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: c.text }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: c.stroke }, { weight: '3' }] },
    { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: c.admin }] },
    { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
    { featureType: 'administrative.neighborhood', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
    { featureType: 'poi', stylers: [{ visibility: 'off' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'on' }, { color: c.park }] },
    { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: c.road }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: c.roadLine }] },
    { featureType: 'road.highway', elementType: 'geometry.fill', stylers: [{ color: c.highway }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: c.highwayLine }] },
    { featureType: 'transit', stylers: [{ visibility: 'off' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: c.water }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: c.waterText }] },
  ];
}

// ── Marker artwork ───────────────────────────────────────────────────────────

/** Map-pin silhouette (36×46 box, tip at the bottom centre). */
const PIN_PATH = 'M18 45C18 45 3 29.6 3 17.5 3 9 9.7 2 18 2s15 7 15 15.5C33 29.6 18 45 18 45z';

export const PIN_WIDTH = 36;
export const PIN_HEIGHT = 46;

/** Pharmacy pin: brand-blue drop with a white medical cross. Closed pharmacies are muted. */
export function pharmacyPinSvg(open = true): string {
  const fill = open ? MAP_COLORS.brand : MAP_COLORS.closedPin;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 36 46" aria-hidden="true">
    <path d="${PIN_PATH}" fill="${fill}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="18" cy="17.5" r="9.5" fill="#fff"/>
    <path d="M18 12v11M12.5 17.5h11" stroke="${fill}" stroke-width="3.4" stroke-linecap="round"/>
  </svg>`;
}

/** Delivery / drop-off pin: accent-orange drop with a house glyph. */
export function destinationPinSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${PIN_WIDTH}" height="${PIN_HEIGHT}" viewBox="0 0 36 46" aria-hidden="true">
    <path d="${PIN_PATH}" fill="${MAP_COLORS.accent}" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="18" cy="17.5" r="9.5" fill="#fff"/>
    <path d="M12.8 18.2 18 13.4l5.2 4.8M14.3 17.4v5h7.4v-5" fill="none" stroke="${MAP_COLORS.accent}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

const toDataUrl = (svg: string) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

/**
 * Icon configs for the classic `google.maps.Marker` (tracking map, address picker). Must be
 * called after the Maps script has loaded. The overlay-based multi-pin map draws the same
 * artwork through `pharmacyPinSvg` directly.
 */
export function pharmacyPinIcon(open = true) {
  const maps = (window as any).google.maps;
  return {
    url: toDataUrl(pharmacyPinSvg(open)),
    scaledSize: new maps.Size(PIN_WIDTH, PIN_HEIGHT),
    anchor: new maps.Point(PIN_WIDTH / 2, PIN_HEIGHT - 1),
    // Lets a marker label float above the pin instead of over it
    labelOrigin: new maps.Point(PIN_WIDTH / 2, -12),
  };
}

export function destinationPinIcon() {
  const maps = (window as any).google.maps;
  return {
    url: toDataUrl(destinationPinSvg()),
    scaledSize: new maps.Size(PIN_WIDTH, PIN_HEIGHT),
    anchor: new maps.Point(PIN_WIDTH / 2, PIN_HEIGHT - 1),
    labelOrigin: new maps.Point(PIN_WIDTH / 2, -12),
  };
}

/** Google applies Roboto inside every map, so classic marker labels must name the brand font explicitly. */
export const MAP_FONT_FAMILY = "MADEOkineSans, system-ui, -apple-system, 'Segoe UI', sans-serif";

/** Class list for a classic-marker label chip, matching the popup/pin look. */
export const MARKER_LABEL_CLASS =
  'rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-brand-600 shadow-card ring-1 ring-black/5 whitespace-nowrap';
