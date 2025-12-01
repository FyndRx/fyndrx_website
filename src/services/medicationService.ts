import type { Medication } from '@/models/Medication';
import { apiService } from './api';
import type { 
  LiveSearchApiResponse, 
  MedicationDetailApiResponse, 
  MultipleMedicationsApiResponse,
  MedicationApiResponse 
} from '@/models/api';
import type { PaginationMeta } from '@/models/api/ApiResponse';
import { 
  unwrapApiResponse, 
  unwrapArrayResponse,
  transformMedication, 
  transformMedications 
} from '@/utils/responseTransformers';

export interface LiveSearchFilters {
  query: string;
  category?: string;
  form?: string;
  brand?: string;
  requiresPrescription?: 'yes' | 'no';
  sort?: string;
  page?: number;
  perPage?: number;
}

export interface LiveSearchResult {
  medications: Medication[];
  meta?: PaginationMeta;
}

export const medicationService = {
  /**
   * Live search for medications
   * @param params - Search query string or filter object
   * @returns Medications plus optional pagination meta
   */
  async liveSearch(params: string | LiveSearchFilters): Promise<LiveSearchResult> {
    console.log('medicationService.liveSearch called with:', params);
    try {
      const filters: LiveSearchFilters = typeof params === 'string' ? { query: params } : params;
      const query = filters.query?.trim() || '';
      
      const searchParams = new URLSearchParams();
      // Only add query param if it's not empty, otherwise API should return all medications
      if (query.length > 0) {
        searchParams.set('q', query);
      }
      
      if (filters.page && filters.page > 0) {
        searchParams.set('page', String(filters.page));
      }
      
      if (filters.perPage && filters.perPage > 0) {
        searchParams.set('per_page', String(filters.perPage));
      }
      
      if (filters.category && filters.category !== 'all') {
        searchParams.set('category', filters.category);
      }
      
      if (filters.form && filters.form !== 'all') {
        searchParams.set('form', filters.form);
      }
      
      if (filters.brand && filters.brand !== 'all') {
        searchParams.set('brand', filters.brand);
      }
      
      if (filters.requiresPrescription) {
        searchParams.set('requires_prescription', filters.requiresPrescription);
      }
      
      if (filters.sort) {
        searchParams.set('sort_by', filters.sort);
      }
      
      const url = `/drug/live-search?${searchParams.toString()}`;
      console.log('Fetching from URL:', url);

      const response = await apiService.get<LiveSearchApiResponse>(url);
      console.log('Raw API response:', response);
      
      const apiMeds = unwrapArrayResponse(response);
      const meta = !Array.isArray(response) && 'meta' in response ? response.meta : undefined;
      
      const transformed = transformMedications(apiMeds);
      console.log('Transformed medications:', transformed);

      return {
        medications: transformed,
        meta,
      };
    } catch (error) {
      console.error('Error in medicationService.liveSearch:', error);
      throw error;
    }
  },

  /**
   * Get a single medication by ID
   * @param id - Medication ID
   * @returns Medication details
   */
  async getMedicationById(id: number): Promise<Medication> {
    const response = await apiService.get<MedicationDetailApiResponse>(`/drugs/${id}`);
    const apiMed = unwrapApiResponse(response);
    return transformMedication(apiMed);
  },

  /**
   * Get multiple medications by IDs
   * @param drugIds - Array of medication IDs
   * @returns Array of medications
   */
  async getMultipleMedications(drugIds: number[]): Promise<Medication[]> {
    if (!drugIds || drugIds.length === 0) {
      return [];
    }
    
    const params = drugIds.map(id => `drug_ids[]=${id}`).join('&');
    const response = await apiService.get<MultipleMedicationsApiResponse>(
      `/drugs/show/multiple?${params}`
    );
    
    // Handle different response formats
    let apiMeds: MedicationApiResponse[] = [];
    
    if (Array.isArray(response)) {
      apiMeds = response;
    } else if (typeof response === 'object') {
      // Handle { data: [...] } format
      if ('data' in response && Array.isArray(response.data)) {
        apiMeds = response.data;
      } else {
        // Handle { 1: {...}, 2: {...} } format
        apiMeds = Object.values(response) as MedicationApiResponse[];
      }
    }
    
    return transformMedications(apiMeds);
  }
};


