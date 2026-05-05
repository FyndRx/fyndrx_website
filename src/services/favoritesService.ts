import { reactive } from 'vue';
import { apiService } from './api';
import type { Pharmacy } from '@/models/Pharmacy';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FavoriteDrugProduct {
  id: number;
  name: string;
  image: string | null;
  drug_name: string;
  brand_name: string | null;
  form_name: string | null;
  strength: string | null;
  requires_prescription: boolean;
  description?: string | null;
  pharmacy_count?: number | null;
}

export interface FavoriteDrugGeneric {
  id: number;
  name: string;
  brand: string | null;
  form: string | null;
  strength: string | null;
  requires_prescription: boolean;
}

export interface FavoriteDrug {
  id: string;               // saved_drugs.id — use for DELETE
  type: 'product' | 'drug';
  saved_at: string;
  product?: FavoriteDrugProduct;
  drug?: FavoriteDrugGeneric;
  qty: number;
}

export interface FavoriteCounts {
  drugs: number;
  pharmacies: number;
  total: number;
}

// ─── Local state (for synchronous isFavorite checks) ─────────────────────────

const state = reactive({
  // Tracks product_id (UUID string) → saved_drug.id for quick lookup + deletion
  savedDrugMap: new Map<string, string>(),
  savedPharmacyIds: new Set<string>(),
  initialized: false,
  initializing: false,
});

// ─── Service ──────────────────────────────────────────────────────────────────

export const favoritesService = {
  /** Populate local state from the API. Safe to call multiple times. */
  async initialize(): Promise<void> {
    if (state.initialized || state.initializing) return;
    state.initializing = true;
    try {
      const response = await apiService.getAuth<any>('/favorites?type=all');
      const drugs: FavoriteDrug[] = response?.data?.drugs?.data ?? [];
      const pharmacies: any[] = response?.data?.pharmacies?.data ?? [];

      state.savedDrugMap.clear();
      for (const d of drugs) {
        const itemId = d.product?.id ?? d.drug?.id;
        if (itemId != null) state.savedDrugMap.set(String(itemId), String(d.id));
      }

      state.savedPharmacyIds.clear();
      for (const p of pharmacies) {
        if (p.id) state.savedPharmacyIds.add(String(p.id));
      }

      state.initialized = true;
    } catch (err) {
      console.error('Failed to initialize favorites:', err);
    } finally {
      state.initializing = false;
    }
  },

  /** Force-refresh local state (call after bulk operations). */
  async refresh(): Promise<void> {
    state.initialized = false;
    await this.initialize();
  },

  // ── Reads ────────────────────────────────────────────────────────────────

  isFavorite(type: 'medication' | 'pharmacy', itemId: string | number): boolean {
    const id = String(itemId);
    return type === 'medication'
      ? state.savedDrugMap.has(id)
      : state.savedPharmacyIds.has(id);
  },

  /** Fetch the full paginated favorite drug list with product details. */
  async getFavoriteDrugs(page = 1, perPage = 20): Promise<{ data: FavoriteDrug[]; total: number }> {
    const response = await apiService.getAuth<any>(`/favorites/drugs?page=${page}&per_page=${perPage}`);
    return {
      data: response?.data ?? [],
      total: response?.meta?.total ?? 0,
    };
  },

  /** Fetch the full paginated favorite pharmacy list. */
  async getFavoritePharmacies(page = 1, perPage = 20): Promise<{ data: Pharmacy[]; total: number }> {
    const response = await apiService.getAuth<any>(`/favorites/pharmacies?page=${page}&per_page=${perPage}`);
    return {
      data: response?.data ?? [],
      total: response?.meta?.total ?? 0,
    };
  },

  /** Aggregate counts only — cheap to call. */
  async getCounts(): Promise<FavoriteCounts> {
    const response = await apiService.getAuth<any>('/favorites/count');
    return response?.data ?? { drugs: 0, pharmacies: 0, total: 0 };
  },

  // ── Drug favorites ────────────────────────────────────────────────────────

  /** Add a medication (by product_id) to favorites. Returns the new record id. */
  async addDrug(productId: string): Promise<string> {
    const response = await apiService.postAuth<any>('/favorites/drugs', { product_id: productId });
    const savedId: string = String(response?.data?.id ?? response?.id ?? '');
    state.savedDrugMap.set(String(productId), savedId);
    return savedId;
  },

  /** Remove a drug favorite. Backend resolves by saved_drug.id, drug_id, OR product_id. */
  async removeDrug(productId: string): Promise<void> {
    await apiService.deleteAuth(`/favorites/drugs/${productId}`);
    state.savedDrugMap.delete(String(productId));
  },

  /** Bulk-remove by saved_drug ids. */
  async bulkRemoveDrugs(savedIds: string[]): Promise<void> {
    if (!savedIds.length) return;
    await apiService.postAuth('/favorites/drugs/bulk-remove', { ids: savedIds });
    for (const [itemId, recordId] of state.savedDrugMap.entries()) {
      if (savedIds.includes(recordId)) state.savedDrugMap.delete(itemId);
    }
  },

  // ── Pharmacy favorites ────────────────────────────────────────────────────

  async addPharmacy(pharmacyId: string): Promise<void> {
    await apiService.postAuth('/favorites/pharmacies', { pharmacy_id: pharmacyId });
    state.savedPharmacyIds.add(String(pharmacyId));
  },

  async removePharmacy(pharmacyId: string): Promise<void> {
    await apiService.deleteAuth(`/favorites/pharmacies/${pharmacyId}`);
    state.savedPharmacyIds.delete(String(pharmacyId));
  },

  // ── Unified toggle (used by FavoriteButton) ───────────────────────────────

  async toggleFavorite(type: 'medication' | 'pharmacy', itemId: string | number): Promise<boolean> {
    const currently = this.isFavorite(type, itemId);

    const id = String(itemId);
    if (type === 'medication') {
      if (currently) {
        await this.removeDrug(id);
      } else {
        await this.addDrug(id);
      }
    } else {
      if (currently) {
        await this.removePharmacy(id);
      } else {
        await this.addPharmacy(id);
      }
    }

    return !currently;
  },
};
