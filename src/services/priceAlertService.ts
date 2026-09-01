import { reactive } from 'vue';
import { apiService } from './api';
import type { PaginationMeta } from '@/models/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriceAlert {
  id: number;
  product: { id: string; name: string; image: string | null } | null;
  pharmacy: { id: string; name: string } | null;
  is_any_pharmacy: boolean;
  baseline_price: number;
  last_notified_price: number | null;
  last_notified_at: string | null;
  current_price: number | null;
  created_at: string;
}

// ─── Local state (for synchronous isWatching checks, mirrors favoritesService) ─

// Key: `${productId}:${pharmacyId ?? 'any'}` -> price_alerts.id, for instant lookup + removal.
const state = reactive({
  watchedMap: new Map<string, number>(),
  initialized: false,
  initializing: false,
});

const key = (productId: string | number, pharmacyId?: string | number | null) =>
  `${productId}:${pharmacyId ?? 'any'}`;

export const priceAlertService = {
  /** Populate local state from the API. Safe to call multiple times. */
  async initialize(): Promise<void> {
    if (state.initialized || state.initializing) return;
    state.initializing = true;
    try {
      const response = await apiService.getAuth<any>('/price-alerts?per_page=100');
      const alerts: PriceAlert[] = response?.data ?? [];

      state.watchedMap.clear();
      for (const alert of alerts) {
        if (alert.product?.id) {
          state.watchedMap.set(key(alert.product.id, alert.pharmacy?.id), alert.id);
        }
      }
      state.initialized = true;
    } catch (err) {
      console.error('Failed to initialize price alerts:', err);
    } finally {
      state.initializing = false;
    }
  },

  /** Force-refresh local state (call after bulk operations elsewhere). */
  async refresh(): Promise<void> {
    state.initialized = false;
    await this.initialize();
  },

  // ── Reads ────────────────────────────────────────────────────────────────

  isWatching(productId: string | number, pharmacyId?: string | number | null): boolean {
    return state.watchedMap.has(key(productId, pharmacyId));
  },

  /** Full paginated list with product/pharmacy details, for the Price Alerts page. */
  async list(page = 1, perPage = 20): Promise<{ data: PriceAlert[]; meta: PaginationMeta | null }> {
    const response = await apiService.getAuth<any>(`/price-alerts?page=${page}&per_page=${perPage}`);
    return {
      data: response?.data ?? [],
      meta: response?.meta ?? null,
    };
  },

  // ── Writes ───────────────────────────────────────────────────────────────

  /**
   * Start watching a product's price. Omit `pharmacyId` to watch it across any
   * pharmacy within the platform's configured radius of the user's saved location
   * — the backend rejects that mode (422) if the user has no location set.
   */
  async watch(productId: string | number, pharmacyId?: string | number | null): Promise<PriceAlert> {
    const response = await apiService.postAuth<any>('/price-alerts', {
      product_id: productId,
      pharmacy_id: pharmacyId ?? null,
    });
    const alert: PriceAlert = response?.data;
    if (alert) state.watchedMap.set(key(productId, pharmacyId), alert.id);
    return alert;
  },

  async unwatch(productId: string | number, pharmacyId?: string | number | null): Promise<void> {
    const k = key(productId, pharmacyId);
    const id = state.watchedMap.get(k);
    if (id === undefined) return;
    await apiService.deleteAuth(`/price-alerts/${id}`);
    state.watchedMap.delete(k);
  },

  /** Remove by the price_alerts row id directly — used by the management page,
   * where the id is already known from the list response. */
  async unwatchById(id: number, productId: string | number, pharmacyId?: string | number | null): Promise<void> {
    await apiService.deleteAuth(`/price-alerts/${id}`);
    state.watchedMap.delete(key(productId, pharmacyId));
  },

  async toggle(productId: string | number, pharmacyId?: string | number | null): Promise<boolean> {
    if (this.isWatching(productId, pharmacyId)) {
      await this.unwatch(productId, pharmacyId);
      return false;
    }
    await this.watch(productId, pharmacyId);
    return true;
  },
};
