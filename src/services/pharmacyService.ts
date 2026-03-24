import { apiService } from './api';
import type { Pharmacy } from '@/models/Pharmacy';
import type { PharmacyPrice } from '@/models/PharmacyPrice';
import type { Medication } from '@/models/Medication';
import type {
  PharmaciesApiResponse,
  PharmacyDetailApiResponse,
  PharmacyPricesApiResponse,
  PharmacyPricesByPharmacyApiResponse,
  PharmacyPricesByDrugApiResponse,
  PharmacyDrugsApiResponse,
  PharmacyDrugApiResponse
} from '@/models/api';
import {
  unwrapApiResponse,
  unwrapArrayResponse,
  transformPharmacy,
  transformPharmacies,
  transformPharmacyPrices,
  transformPharmacyPrice,
  transformPharmacyDrug
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
  /**
   * Get all pharmacies (without drugs parameter)
   * Note: This endpoint may not exist - API might require drugs parameter
   */
  async getAllPharmacies(): Promise<Pharmacy[]> {
    try {
      const response = await apiService.get<PharmaciesApiResponse>('/pharmacies');
      const apiPharmacies = unwrapArrayResponse(response);
      return transformPharmacies(apiPharmacies);
    } catch (error: any) {
      // If endpoint doesn't exist or requires drugs parameter, return empty array
      if (error?.response?.status === 404 || error?.message?.includes('404')) {
        return [];
      }
      throw error;
    }
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
  async getPharmacy(id: number): Promise<Pharmacy> {
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
  async getPricesByPharmacy(pharmacyId: number, params?: Record<string, any>): Promise<PharmacyPrice[]> {
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
      include_pharmacy?: boolean;
      lat?: number;
      lng?: number;
    }
  ): Promise<PharmacyPricesByDrugApiResponse['data']> {
    let url = `/pharmacy-prices/drug/${drugId}`;
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

    const response = await apiService.get<PharmacyPricesByDrugApiResponse>(url);
    // Return the structured object: { exact_match, related_drugs }
    return response.data;
  },

  /**
   * Get medications available at a pharmacy
   * 
   * Uses the /pharmacy-drugs endpoint. If pharmacyId is provided, it's added to the path.
   * 
   * @param pharmacyId - Pharmacy ID (optional, for filtering)
   * @returns Array of medications available at the pharmacy
   */
  async getPharmacyMedications(pharmacyId?: number): Promise<Medication[]> {
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
    const [medication, responseData] = await Promise.all([
      import('@/services/medicationService').then(m => m.medicationService.getMedicationById(drugId)),
      this.getPricesByDrug(drugId, filters)
    ]);

    // Construct flat prices list from exact_match
    const prices: PharmacyPrice[] = [];
    
    if (responseData.exact_match) {
      const match = responseData.exact_match;
      match.pharmacies.forEach(p => {
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
      const brandId = price.drug_brand_id || (price as any).brand_id;
      if (!brandId) return;

      if (!hierarchyBrands.has(brandId)) {
        hierarchyBrands.set(brandId, {
          id: brandId,
          name: price.brand_name || (price as any).brand || 'Unknown Brand',
          forms: new Map()
        });
      }
      const brandNode = hierarchyBrands.get(brandId)!;

      const formId = price.drug_brand_form_id || (price as any).form_id;
      if (!formId) return;

      if (!brandNode.forms.has(formId)) {
        brandNode.forms.set(formId, {
          id: formId,
          name: price.form_name || (price as any).form || 'Unknown Form',
          variants: []
        });
      }
      const formNode = brandNode.forms.get(formId)!;

      const strengthId = price.dosage_id || (price as any).strength_id;
      const uomId = price.strength_uom_id || (price as any).uom_id;

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
        if (!hierarchyBrands.has(brandId)) {
          hierarchyBrands.set(brandId, {
            id: brandId,
            name: related.brand || 'Unknown Brand',
            forms: new Map()
          });
        }
        const brandNode = hierarchyBrands.get(brandId)!;

        const formId = related.form_id;
        if (!brandNode.forms.has(formId)) {
          brandNode.forms.set(formId, {
            id: formId,
            name: related.form || 'Unknown Form',
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
            strengthId: related.strength_id,
            strength: related.strength || '',
            uomId: related.uom_id,
            uom: related.uom || '',
            label: `${related.form} ${related.strength} ${related.uom || ''}`.trim(),
            value: `${formId}_${related.strength_id}_${related.uom_id}`,
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
