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
  availableForms: string[];
  availableBrands: string[];
}

export const medicationService = {
  /**
   * Filterable/sortable/paginated catalog browsing — backs the medications grid.
   * Always hits `/search/smart?mode=browse`, which returns a flat paginated product
   * list whether or not a query is present (as opposed to `smartSearch`, which hits
   * the same endpoint's default confidence-scored autocomplete mode).
   * @param params - Search query string or filter object
   * @returns Medications plus pagination meta and filter-dropdown facets
   */
  async liveSearch(params: string | LiveSearchFilters): Promise<LiveSearchResult> {
    try {
      const filters: LiveSearchFilters = typeof params === 'string' ? { query: params } : params;
      const query = filters.query?.trim() || '';

      const searchParams = new URLSearchParams();
      searchParams.set('mode', 'browse');
      if (query.length > 0) searchParams.set('q', query);
      if (filters.page && filters.page > 0) searchParams.set('page', String(filters.page));
      if (filters.perPage && filters.perPage > 0) searchParams.set('per_page', String(filters.perPage));
      if (filters.category && filters.category !== 'all') searchParams.set('category', filters.category);
      if (filters.brand && filters.brand !== 'all') searchParams.set('brand', filters.brand);
      if (filters.form && filters.form !== 'all') searchParams.set('form', filters.form);
      if (filters.requiresPrescription) searchParams.set('requires_prescription', filters.requiresPrescription);
      if (filters.sort) searchParams.set('sort', filters.sort);

      const url = `/search/smart?${searchParams.toString()}`;
      const response = await apiService.get<any>(url);

      const apiMeds = unwrapArrayResponse(response) as any[];
      const meta = response?.meta;

      return {
        medications: transformMedications(apiMeds),
        meta: meta || {
          current_page: filters.page || 1,
          per_page: filters.perPage || 15,
          total: apiMeds.length,
          last_page: 1
        },
        availableForms: meta?.available_forms ?? [],
        availableBrands: meta?.available_brands ?? [],
      };
    } catch (error) {
      console.error('Error in medicationService.liveSearch (using smart search):', error);
      throw error;
    }
  },

  async smartSearch(query: string, track: boolean = false): Promise<SmartSearchResponse> {
    const trimmedQuery = query?.trim() || '';
    try {
      const searchParams = new URLSearchParams();
      if (trimmedQuery) {
        searchParams.set('q', trimmedQuery);
      }
      if (track) {
        searchParams.set('track', '1');
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
            discount_price: p.discount_price,
            categories: p.categories?.length ? p.categories : undefined
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
  async getMedicationById(id: string | number): Promise<Medication> {
    const response = await apiService.get<MedicationDetailApiResponse>(`/products/${id}`);
    const apiMed = unwrapApiResponse(response);
    return transformMedication(apiMed);
  },

  /** Fetch per-pharmacy prices for a product, sorted cheapest first. */
  async getProductPrices(productId: string | number): Promise<Array<{
    pharmacy_id: string;
    pharmacy_name: string;
    pharmacy_logo?: string | null;
    price: number;
    discount_price?: number | null;
    in_stock: boolean;
    is_open?: boolean;
    branch_name?: string | null;
  }>> {
    const response = await apiService.get<any>(`/prices?product_id=${productId}&sort=price`);
    return response?.data?.exact_match?.pharmacies?.data ?? [];
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
  },

  /**
   * Manually track a search event or selection
   */
  async trackSearch(query: string, matchType?: string, matchId?: number): Promise<void> {
    try {
      await apiService.post('/search/track', {
        query,
        match_type: matchType,
        match_id: matchId
      });
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  },

  /**
   * Get recent searches for the authenticated user
   */
  async getRecentSearches(): Promise<any[]> {
    try {
      const response = await apiService.get<any>('/recent-searches');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent searches:', error);
      return [];
    }
  },

  /**
   * Get global top searches
   */
  async getTopSearches(): Promise<any[]> {
    try {
      const response = await apiService.get<any>('/top-searches');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching top searches:', error);
      return [];
    }
  }
};


