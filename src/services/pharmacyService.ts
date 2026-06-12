import { apiService } from './api';
import type { Pharmacy, PharmacyDeliveryOptions, PharmacyServiceGroup } from '@/models/Pharmacy';
import type { PharmacyPrice } from '@/models/PharmacyPrice';
import type { Medication } from '@/models/Medication';
import type {
  PharmaciesApiResponse,
  PharmacyDetailApiResponse,
  PharmacyPricesApiResponse,
  PharmacyPricesByPharmacyApiResponse,
  PharmacyPricesByDrugApiResponse,
  PharmacyDrugsApiResponse,
  PharmacyDrugApiResponse,
  PaginatedRelatedDrugsResponse
} from '@/models/api';
import {
  unwrapApiResponse,
  unwrapArrayResponse,
  transformPharmacy,
  transformPharmacies,
  transformPharmacyPrices,
  transformPharmacyPrice,
  transformPharmacyDrug,
  transformBranch
} from '@/utils/responseTransformers';

export interface DrugSearchQuery {
  drug_id: number;
  brand_id: number;
  form_id: number;
  dosage_id: number;
}

// Re-export PharmacyPrice from model
export type { PharmacyPrice } from '@/models/PharmacyPrice';

export const pharmacyService = {
  async getAllPharmacies(): Promise<Pharmacy[]> {
    const response = await apiService.get<PharmaciesApiResponse>('/pharmacies');
    const apiPharmacies = unwrapArrayResponse(response);
    return transformPharmacies(apiPharmacies);
  },

  /**
   * Search pharmacies by drugs (with drugs parameter)
   * @param drugs - Array of drug search queries
   * @returns Array of pharmacies that have the specified drugs
   */
  async searchPharmaciesByDrugs(drugs: DrugSearchQuery[]): Promise<Pharmacy[]> {
    // If no drugs specified, try to get all pharmacies
    if (!drugs || drugs.length === 0) {
      return await this.getAllPharmacies();
    }

    const drugsObject = drugs.reduce((acc, drug, index) => {
      acc[index] = drug;
      return acc;
    }, {} as Record<number, DrugSearchQuery>);

    const drugsParam = encodeURIComponent(JSON.stringify(drugsObject));
    const response = await apiService.get<PharmaciesApiResponse>(
      `/pharmacies?drugs=${drugsParam}`
    );

    const apiPharmacies = unwrapArrayResponse(response);
    return transformPharmacies(apiPharmacies);
  },

  /**
   * Get pharmacy details by ID
   * @param id - Pharmacy ID
   * @returns Pharmacy details
   */
  async getPharmacy(id: string | number): Promise<Pharmacy> {
    try {
      const response = await apiService.get<PharmacyDetailApiResponse>(`/pharmacies/${id}`);
      const apiPharmacy = unwrapApiResponse(response);
      return transformPharmacy(apiPharmacy);
    } catch (error: any) {
      if (error?.response?.status === 404 || error?.message?.includes('404')) {
        throw new Error(`Pharmacy with id ${id} not found`);
      }
      throw error;
    }
  },

  async getPharmacyBranch(pharmacyId: string | number, branchId: string): Promise<import('@/models/Pharmacy').PharmacyBranch> {
    const response = await apiService.get<any>(`/pharmacies/${pharmacyId}/branches/${branchId}`);
    const data = (response as any).data ?? response;
    return transformBranch(data);
  },

  /**
   * Get all branches for a pharmacy, with full details (services, hours, delivery, payment).
   */
  async getPharmacyBranches(pharmacyId: string | number): Promise<import('@/models/Pharmacy').PharmacyBranch[]> {
    const response = await apiService.get<{ data: any[] }>(`/pharmacies/${pharmacyId}/branches`);
    const arr = (response as any).data ?? [];
    return arr.map(transformBranch);
  },

  /**
   * Get delivery options for a pharmacy, with optional distance-based fee estimates.
   * Returns pickup (always free), pharmacy self-delivery, and FyndRx platform delivery.
   * @param pharmacyId - Pharmacy ID
   * @param lat - User latitude (for fee estimation)
   * @param lng - User longitude (for fee estimation)
   */
  async getDeliveryOptions(pharmacyId: string | number, lat?: number, lng?: number): Promise<PharmacyDeliveryOptions> {
    let url = `/pharmacies/${pharmacyId}/delivery-options`;
    const params = new URLSearchParams();
    if (lat !== undefined) params.set('lat', String(lat));
    if (lng !== undefined) params.set('lng', String(lng));
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const response = await apiService.get<{ data: any }>(url);
    const d = (response as any).data ?? response;

    const mapOption = (raw: any) => ({
      available: Boolean(raw.available),
      fee: raw.fee !== null && raw.fee !== undefined ? Number(raw.fee) : null,
      baseFee: raw.base_fee !== undefined ? Number(raw.base_fee) : undefined,
      feePerKm: raw.fee_per_km !== undefined ? Number(raw.fee_per_km) : undefined,
      radiusKm: raw.radius_km !== undefined ? (raw.radius_km !== null ? Number(raw.radius_km) : null) : undefined,
      maxRadiusKm: raw.max_radius_km !== undefined ? Number(raw.max_radius_km) : undefined,
      distanceKm: raw.distance_km !== null && raw.distance_km !== undefined ? Number(raw.distance_km) : null,
      label: raw.label ?? '',
      note: raw.note,
      unavailableReason: raw.unavailable_reason ?? null,
    });

    // Response: { data: { pharmacy_id, pharmacy_name, distance_km, options: { pickup, pharmacy_delivery, fyndrx_delivery } } }
    const opts = d.options ?? d; // backwards-compat if options not yet nested
    return {
      pharmacyId: d.pharmacy_id,
      pharmacyName: d.pharmacy_name,
      pickup: mapOption(opts.pickup ?? {}),
      pharmacyDelivery: mapOption(opts.pharmacy_delivery ?? {}),
      fyndrxDelivery: mapOption(opts.fyndrx_delivery ?? {}),
    };
  },

  /**
   * Get the full pharmacy services catalog grouped by category.
   * Call once on boot to populate service pickers.
   */
  async getServicesCatalog(): Promise<PharmacyServiceGroup[]> {
    const response = await apiService.get<{ data: any[] }>('/pharmacies/services');
    const groups = (response as any).data ?? [];
    return groups.map((g: any) => ({
      category: g.category,
      label: g.label,
      services: (g.services ?? []).map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        category: s.category ?? g.category,
        description: s.description,
        icon: s.icon,
      })),
    }));
  },

  /**
   * Get all pharmacy prices
   * @returns Array of all pharmacy prices
   */
  async getAllPharmacyPrices(): Promise<PharmacyPrice[]> {
    const response = await apiService.get<PharmacyPricesApiResponse>('/pharmacy-prices');
    const apiPrices = unwrapArrayResponse(response);
    return transformPharmacyPrices(apiPrices);
  },

  /**
   * Get prices for a specific pharmacy
   * @param pharmacyId - Pharmacy ID
   * @returns Array of prices for the pharmacy
   */
  async getPricesByPharmacy(pharmacyId: string | number, params?: Record<string, any>): Promise<PharmacyPrice[]> {
    let url = `/pharmacy-prices/${pharmacyId}`;
    if (params) {
      const queryString = new URLSearchParams(params).toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    const response = await apiService.get<PharmacyPricesByPharmacyApiResponse>(url);
    const apiPrices = unwrapArrayResponse(response);
    return transformPharmacyPrices(apiPrices);
  },

  /**
   * Get prices for a specific drug across all pharmacies
   * @param drugId - Drug ID
   * @param filters - Optional filters for form, dosage, and strength
   * @returns Array of prices for the drug
   */
  async getPricesByDrug(
    drugId: number,
    filters?: {
      brand_id?: number | string;
      form_id?: number | string;
      strength_id?: number | string;
      uom_id?: number | string;
      q?: string;
      sort?: string;
      include_pharmacy?: boolean;
      lat?: number;
      lng?: number;
      page?: number;
      per_page?: number;
      services?: string[];
      product_id?: number | string;
    }
  ): Promise<PharmacyPricesByDrugApiResponse['data']> {
    let url = `/prices`; // NEW ENDPOINT
    const params = new URLSearchParams();
    
    // Support both legacy drugId and new productId
    if (filters?.product_id) {
      params.append('product_id', filters.product_id.toString());
    } else {
      params.append('drug_id', drugId.toString());
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (key === 'product_id') return; // already handled
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(`${key}[]`, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await apiService.get<PharmacyPricesByDrugApiResponse>(url);
    // Return the structured object: { exact_match, related_drugs? }
    return response.data;
  },

  /**
   * Get all medication categories
   */
  async getCategories(): Promise<any[]> {
    try {
      const response = await apiService.get<any>('/categories');
      return unwrapArrayResponse(response);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },

  /**
   * Get related variants/substitutes for a drug
   * @param drugId - Drug ID
   * @param filters - Same filters as prices to find alternatives
   * @returns Paginated related drugs
   */
  async getRelatedDrugs(
    drugId: number,
    filters?: {
      brand_id?: number | string;
      form_id?: number | string;
      strength_id?: number | string;
      uom_id?: number | string;
      q?: string;
      sort?: string;
      page?: number;
      per_page?: number;
    }
  ): Promise<PaginatedRelatedDrugsResponse> {
    let url = `/drugs/${drugId}/related`;
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await apiService.get<PaginatedRelatedDrugsResponse>(url);
    return response;
  },

  /**
   * Get medications available at a pharmacy
   * 
   * Uses the /pharmacy-drugs endpoint. If pharmacyId is provided, it's added to the path.
   * 
   * @param pharmacyId - Pharmacy ID (optional, for filtering)
   * @returns Array of medications available at the pharmacy
   */
  async getPharmacyMedications(pharmacyId?: string | number): Promise<Medication[]> {
    try {
      let url = '/pharmacy-drugs';
      if (pharmacyId) {
        url += `/${pharmacyId}`;
      }

      const response = await apiService.get<PharmacyDrugsApiResponse>(url);
      const drugs = unwrapArrayResponse<PharmacyDrugApiResponse>(response);

      return drugs.map(transformPharmacyDrug);
    } catch (error) {
      console.error('Error in getPharmacyMedications:', error);
      return [];
    }
  },

  /**
   * Get consolidated medication details and pricing hierarchy
   * 
   * This method acts as a Backend-for-Frontend (BFF) adapter.
   * It fetches the static medication details and the dynamic pricing list,
   * then merges them into a hierarchy where the structure (Brand -> Form -> Variant)
   * is driven by what is ACTUALLY available in the pricing list (inventory).
   * 
   * @param drugId - Drug ID
   * @returns Hierarchical data structure
   */
  async getMedicationDetailsWithPrices(drugId: number, filters?: any): Promise<MedicationPricingHierarchy> {
    const [medication, responseData]: [Medication, PharmacyPricesByDrugApiResponse['data']] = await Promise.all([
      import('@/services/medicationService').then(m => m.medicationService.getMedicationById(drugId)),
      this.getPricesByDrug(drugId, filters)
    ]);

    // Construct flat prices list from exact_match
    const prices: PharmacyPrice[] = [];
    
    if (responseData.exact_match) {
      const match = responseData.exact_match;
      // Handle structure where pharmacies is an object with { data, meta }
      const pharmaciesList = Array.isArray(match.pharmacies) 
        ? match.pharmacies 
        : (match.pharmacies as any).data || [];

      pharmaciesList.forEach((p: any) => {
        prices.push(transformPharmacyPrice({
          ...match,
          ...p,
          id: p.pharmacy_id
        } as any));
      });
    }

    const hierarchyBrands = new Map<number, {
      id: number;
      name: string;
      forms: Map<number, HierarchyForm>;
    }>();

    // 1. Process exact match into hierarchy
    prices.forEach(price => {
      const brandId = price.brand_id;
      if (!brandId) return;

      if (!hierarchyBrands.has(brandId)) {
        hierarchyBrands.set(brandId, {
          id: brandId,
          name: price.brand_name || (price as any).brand || 'Unknown Brand',
          forms: new Map()
        });
      }
      const brandNode = hierarchyBrands.get(brandId)!;

      const formId = price.form_id;
      if (!formId) return;

      if (!brandNode.forms.has(formId)) {
        brandNode.forms.set(formId, {
          id: formId,
          name: price.form_name || (price as any).form || 'Unknown Form',
          variants: []
        });
      }
      const formNode = brandNode.forms.get(formId)!;

      const strengthId = price.strength_id;
      const uomId = price.uom_id;

      const existingVariant = formNode.variants.find(v =>
        v.strengthId === strengthId &&
        v.uomId === uomId
      );

      if (existingVariant) {
        existingVariant.pharmacyCount++;
        existingVariant.minPrice = Math.min(existingVariant.minPrice, price.price);
        existingVariant.maxPrice = Math.max(existingVariant.maxPrice, price.price);
      } else {
        formNode.variants.push({
          strengthId: strengthId || 0,
          strength: price.strength || '',
          uomId: uomId || 0,
          uom: price.uom || '',
          label: `${price.form_name || ''} ${price.strength || ''} ${price.uom || ''}`.trim(),
          value: `${formId}_${strengthId}_${uomId}`,
          pharmacyCount: 1,
          minPrice: price.price,
          maxPrice: price.price
        });
      }
    });

    // 2. Process related drugs into hierarchy (to show all options in dropdowns)
    if (responseData.related_drugs) {
      responseData.related_drugs.forEach(related => {
        const brandId = related.brand_id;
        if (!brandId) return;

        if (!hierarchyBrands.has(brandId)) {
          hierarchyBrands.set(brandId, {
            id: brandId,
            name: related.brand_name || 'Unknown Brand',
            forms: new Map()
          });
        }
        const brandNode = hierarchyBrands.get(brandId)!;

        const formId = related.form_id;
        if (!formId) return;

        if (!brandNode.forms.has(formId)) {
          brandNode.forms.set(formId, {
            id: formId,
            name: related.form_name || 'Unknown Form',
            variants: []
          });
        }
        const formNode = brandNode.forms.get(formId)!;

        const existingVariant = formNode.variants.find(v =>
          v.strengthId === related.strength_id &&
          v.uomId === related.uom_id
        );

        if (!existingVariant) {
          formNode.variants.push({
            strengthId: related.strength_id ?? 0,
            strength: related.strength || '',
            uomId: related.uom_id ?? 0,
            uom: related.uom || '',
            label: `${related.form_name || ''} ${related.strength || ''} ${related.uom || ''}`.trim(),
            value: `${formId}_${related.strength_id ?? 0}_${related.uom_id ?? 0}`,
            pharmacyCount: 0, // Unknown from summary
            minPrice: related.price,
            maxPrice: related.price
          });
        }
      });
    }

    // 3. Convert Maps to Arrays and Sort
    const brands: HierarchyBrand[] = Array.from(hierarchyBrands.values()).map(b => ({
      id: b.id,
      name: b.name,
      forms: Array.from(b.forms.values()) // Convert Map to Array for final output
    }));

    return {
      medication,
      pricing: prices,
      hierarchy: {
        brands
      }
    };
  }
};

// -- New Interfaces --

export interface HierarchyVariant {
  strengthId: number;
  strength: string;
  uomId: number;
  uom: string;
  label: string;
  value: string; // "formId_strengthId_uomId"
  pharmacyCount: number;
  minPrice: number;
  maxPrice: number;
}

export interface HierarchyForm {
  id: number;
  name: string;
  variants: HierarchyVariant[];
}

export type HierarchyFormMap = Map<number, HierarchyForm>;

export interface HierarchyBrand {
  id: number;
  name: string;
  forms: HierarchyForm[]; // Final output is Array, not Map
}

export interface MedicationPricingHierarchy {
  medication: Medication;
  pricing: PharmacyPrice[]; // The raw flat list for filtering
  hierarchy: {
    brands: HierarchyBrand[];
  };
}
