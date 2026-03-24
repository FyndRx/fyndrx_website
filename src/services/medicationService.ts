import type { Medication } from '@/models/Medication';
import { apiService } from './api';
import type {
  MedicationDetailApiResponse,
  MultipleMedicationsApiResponse,
  MedicationApiResponse
} from '@/models/api';
import type { SmartSearchResponse } from '@/models/api/SmartSearchResponse';
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
      if (query.length > 0) {
        searchParams.set('q', query);
      }

      // Preserve existing filters if the new API supports them
      if (filters.page && filters.page > 0) searchParams.set('page', String(filters.page));
      if (filters.perPage && filters.perPage > 0) searchParams.set('per_page', String(filters.perPage));
      if (filters.category && filters.category !== 'all') searchParams.set('category', filters.category);
      if (filters.brand && filters.brand !== 'all') searchParams.set('brand', filters.brand);

      const queryString = searchParams.toString();
      const url = `/search/smart${queryString ? `?${queryString}` : ''}`;
      console.log('Fetching from Smart Search URL:', url);

      const response = await apiService.get<any>(url);
      console.log('Raw API response:', response);

      let medications: Medication[] = [];
      const meta = response.meta;

      // Check if it's the grouped Smart Search structure (typically when q is present)
      if (response && response.results) {
        console.log('Processing as grouped Smart Search results');
        const products = response.results.products || [];
        const generics = response.results.generics || [];
        
        medications = [
          ...products.map((p: any) => transformMedication({
            id: p.id,
            name: p.name,
            description: p.detail || p.description || '',
            image: p.image || '',
            pharmacy_count: p.pharmacy_count || p.pharmacies_count,
            price: p.price,
            discount_price: p.discount_price,
            brands: p.brand ? [{ id: p.brand_id, name: p.brand }] : [],
          } as any)),
          ...transformMedications(generics)
        ];
      } else {
        // Standard paginated list structure (typically when no q is present)
        console.log('Processing as standard paginated list');
        const apiMeds = unwrapArrayResponse(response) as any[];
        medications = transformMedications(apiMeds);
      }

      return {
        medications,
        meta: meta || {
          current_page: filters.page || 1,
          per_page: filters.perPage || 15,
          total: medications.length,
          last_page: 1
        },
      };
    } catch (error) {
      console.error('Error in medicationService.liveSearch (using smart search):', error);
      throw error;
    }
  },

  async smartSearch(query: string): Promise<SmartSearchResponse> {
    const trimmedQuery = query?.trim() || '';
    try {
      const searchParams = new URLSearchParams();
      if (trimmedQuery) {
        searchParams.set('q', trimmedQuery);
      }
      
      const url = `/search/smart${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await apiService.get<any>(url);

      // If it's already in grouped format, return as is
      if (response && response.results) {
        return response as SmartSearchResponse;
      }

      // If it's a flat list, wrap it into the SmartSearchResponse structure
      const apiMeds = unwrapArrayResponse(response) as any[];
      return {
        query: trimmedQuery,
        results: {
          products: apiMeds.map((p: any) => ({
            id: p.id,
            name: p.name,
            detail: p.detail || p.description || '',
            brand: p.brand || '',
            brand_id: p.brand_id || 0,
            drug: p.drug || '',
            form: p.form || '',
            form_id: p.form_id || 0,
            strength: p.strength || '',
            strength_id: p.strength_id || 0,
            uom: p.uom || '',
            uom_id: p.uom_id || 0,
            image: p.image || null,
            requires_prescription: p.requires_prescription ?? false,
            pharmacy_count: p.pharmacy_count || p.pharmacies_count || 0,
            url: p.url || `/medication/${p.id}`,
            price: p.price,
            discount_price: p.discount_price
          })),
          brands: [],
          generics: [],
          categories: []
        },
        suggestions: []
      };
    } catch (error) {
      console.error('Error in smartSearch:', error);
      return {
        query: trimmedQuery,
        results: { products: [], brands: [], generics: [], categories: [] },
        suggestions: []
      };
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


