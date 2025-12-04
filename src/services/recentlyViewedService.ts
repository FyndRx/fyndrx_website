import { apiService } from './api';
import type { Medication } from '@/models/Medication';
import type { MedicationApiResponse } from '@/models/api';
import { unwrapArrayResponse, transformMedication } from '@/utils/responseTransformers';

export interface RecentlyViewedDrug {
  id: number;
  drug_id: number;
  user_id: number;
  viewed_at: string;
  drug?: MedicationApiResponse;
}

export const recentlyViewedService = {
  /**
   * Get user's recently viewed drugs
   * @returns Array of recently viewed drugs
   */
  async getRecentlyViewed(): Promise<RecentlyViewedDrug[]> {
    const response = await apiService.getAuth<RecentlyViewedDrug[]>('/recently-viewed');
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
   * Add a drug to recently viewed
   * @param drugId - Drug ID
   * @returns Success response
   */
  async addToRecentlyViewed(drugId: number): Promise<any> {
    return await apiService.postAuth<any>('/recently-viewed', { drug_id: drugId });
  },

  /**
   * Get recent drugs (public endpoint)
   * @returns Array of recent drugs
   */
  async getRecentDrugs(): Promise<Medication[]> {
    const response = await apiService.get<MedicationApiResponse[]>('/recent-drugs');
    const apiMeds = unwrapArrayResponse(response);
    return apiMeds.map(transformMedication);
  },

  /**
   * Get top searched drugs (public endpoint)
   * @returns Array of top searched drugs
   */
  async getTopSearched(): Promise<Medication[]> {
    const response = await apiService.get<MedicationApiResponse[]>('/top-searched-drugs');
    const apiMeds = unwrapArrayResponse(response);
    return apiMeds.map(transformMedication);
  }
};
