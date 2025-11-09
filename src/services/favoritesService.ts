import { reactive } from 'vue';
import { apiService } from './api';
import type { MedicationApiResponse } from '@/models/api';
import { transformMedication } from '@/utils/responseTransformers';

export interface SavedDrug {
  id: number;
  drug_id: number;
  brand_id: number;
  user_id: number;
  created_at: string;
  drug?: MedicationApiResponse;
  brand?: any;
}

// Reactive state for favorites
const state = reactive({
  savedDrugIds: new Set<number>(),
  initialized: false
});

export const favoritesService = {
  /**
   * Initialize favorites service by fetching user's saved drugs
   */
  async initialize(): Promise<void> {
    if (state.initialized) return;

    try {
      const saved = await this.getSavedDrugs();
      state.savedDrugIds.clear();
      saved.forEach(item => {
        // We track by drug_id for now as the UI seems to favor medications
        state.savedDrugIds.add(item.drug_id);
      });
      state.initialized = true;
    } catch (error) {
      console.error('Failed to initialize favorites:', error);
    }
  },

  /**
   * Get user's saved drugs
   * @returns Array of saved drugs
   */
  async getSavedDrugs(): Promise<SavedDrug[]> {
    const response = await apiService.getAuth<SavedDrug[]>('/user-saved-drugs');
    // Transform nested drug if present
    if (Array.isArray(response)) {
      return response.map(item => ({
        ...item,
        drug: item.drug ? transformMedication(item.drug) : undefined
      }));
    }
    return [];
  },

  /**
   * Save a drug to favorites
   * @param drugId - Drug ID
   * @param brandId - Brand ID
   * @returns Success response
   */
  async saveDrug(drugId: number, brandId: number): Promise<any> {
    return await apiService.getAuth<any>(`/store-saved-drug/${drugId}/${brandId}`);
  },

  /**
   * Check if a drug is saved (async version)
   * @param drugId - Drug ID
   * @param brandId - Brand ID
   * @returns True if drug is saved
   */
  async isSaved(drugId: number, brandId: number): Promise<boolean> {
    try {
      const saved = await this.getSavedDrugs();
      return saved.some(item => item.drug_id === drugId && item.brand_id === brandId);
    } catch {
      return false;
    }
  },

  /**
   * Check if an item is favorited (synchronous check against local state)
   * @param type - Type of item ('medication' or 'pharmacy')
   * @param itemId - ID of the item
   */
  isFavorite(type: 'medication' | 'pharmacy', itemId: number): boolean {
    if (type === 'medication') {
      return state.savedDrugIds.has(itemId);
    }
    // Pharmacy favorites not yet implemented in state
    return false;
  },

  /**
   * Toggle favorite status for an item
   * @param type - Type of item ('medication' or 'pharmacy')
   * @param itemId - ID of the item
   * @returns New favorite state (true = favorited, false = unfavorited)
   */
  toggleFavorite(type: 'medication' | 'pharmacy', itemId: number): boolean {
    if (type === 'medication') {
      const isCurrentlySaved = state.savedDrugIds.has(itemId);
      const newState = !isCurrentlySaved;

      // Optimistic update
      if (newState) {
        state.savedDrugIds.add(itemId);
        // We default to brandId 0 for generic medication favorite if not specified
        // TODO: If brand context is needed, this method signature needs to change
        this.saveDrug(itemId, 0).catch(err => {
          console.error('Failed to save drug:', err);
          // Revert on failure
          state.savedDrugIds.delete(itemId);
        });
      } else {
        state.savedDrugIds.delete(itemId);
        // TODO: Implement remove endpoint when available
        // For now we just update local state as we don't have a clear remove endpoint
        console.warn('Remove favorite endpoint not confirmed, only updating local state');
      }

      return newState;
    }

    return false;
  }
};
