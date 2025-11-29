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
  transformPharmacyPrices
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
      drug_brand_form_id?: number;
      dosage_id?: number;
      strength_uom_id?: number;
      drug_brand_id?: number;
    }
  ): Promise<PharmacyPrice[]> {
    let url = `/pharmacy-prices/drug/${drugId}`;
    const params = new URLSearchParams();

    if (filters?.drug_brand_form_id) {
      params.append('drug_brand_form_id', filters.drug_brand_form_id.toString());
    }
    if (filters?.dosage_id) {
      params.append('dosage_id', filters.dosage_id.toString());
    }
    if (filters?.strength_uom_id) {
      params.append('strength_uom_id', filters.strength_uom_id.toString());
    }
    if (filters?.drug_brand_id) {
      params.append('drug_brand_id', filters.drug_brand_id.toString());
    }

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    const response = await apiService.get<PharmacyPricesByDrugApiResponse>(url);
    const apiPrices = unwrapArrayResponse(response);
    return transformPharmacyPrices(apiPrices);
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

      // Map pharmacy drug response to Medication model
      return drugs.map((drug): Medication => {
        // Parse predefinedQuantities from string array to number array
        const parsedQuantities: number[] = (drug.predefinedQuantities || []).map(qtyStr => {
          const num = parseInt(qtyStr.trim(), 10);
          return isNaN(num) ? 0 : num;
        }).filter(num => num > 0);

        // Map single brand to array
        const brands = drug.brand ? [{
          id: drug.brand.id,
          name: drug.brand.name,
        }] : [];

        // Map single form to array
        const forms = drug.form ? [{
          id: drug.form.id,
          form_name: drug.form.form_name,
          strengths: drug.strength ? [{
            id: drug.strength.id,
            strength: drug.strength.strength,
            uoms: drug.uom ? [{
              id: drug.uom.id,
              uom: drug.uom.uom
            }] : []
          }] : []
        }] : [];

        return {
          id: drug.drug_id,
          drug_name: drug.drug?.drug_name || '',
          description: drug.drug?.description || '',
          brands,
          forms,
          image: drug.drug?.image || '',
          predefinedQuantities: parsedQuantities,
          category: [], // Category not present in new response structure
          requiresPrescription: drug.drug?.requires_prescription || false,
        };
      });
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
  async getMedicationDetailsWithPrices(drugId: number): Promise<MedicationPricingHierarchy> {
    // 1. Fetch data in parallel
    // We need medicationService here, but since it's a circular dependency if imported at top level,
    // we can import it inline or assume it's passed. 
    // Ideally, we move this logic to a higher level or solve circular dep.
    // For now, let's use the exported instance from the module, checking for circularity.
    // If circular dependency is an issue, we might need to invoke apiService directly for the medication part
    // or rely on the caller to pass it. 

    // Better approach: Import medicationService at the top. 
    // If that fails, we can use the API implementation directly.
    /* 
       Note: We are importing medicationService at the top of the file.
       Runtime circular dependency is usually handled fine by webpack/vite for named exports 
       as long as we don't use them immediately at module evaluation time. 
       Since this is an async function called later, it should be fine.
    */

    const [medication, prices] = await Promise.all([
      import('@/services/medicationService').then(m => m.medicationService.getMedicationById(drugId)),
      this.getPricesByDrug(drugId)
    ]);

    // 2. Build the Hierarchy from PRICES first (Inventory-driven)
    // Use an internal map structure that is strictly typed for construction
    const hierarchyBrands = new Map<number, {
      id: number;
      name: string;
      forms: Map<number, HierarchyForm>;
    }>();

    prices.forEach(price => {
      // a. Brand
      const brandId = price.drug_brand_id;
      if (!hierarchyBrands.has(brandId)) {
        hierarchyBrands.set(brandId, {
          id: brandId,
          name: price.brand_name || 'Unknown Brand',
          forms: new Map()
        });
      }
      const brandNode = hierarchyBrands.get(brandId)!;

      // b. Form 
      // Use drug_brand_form_id as the reliable key from PharmacyPrice model
      // Use cast to any for fallback if dynamic API response contains untyped fields, but prefer typed field
      const formId = price.drug_brand_form_id || (price as any).form_id;

      if (!brandNode.forms.has(formId)) {
        brandNode.forms.set(formId, {
          id: formId,
          name: price.form_name || 'Unknown Form',
          variants: []
        });
      }
      const formNode = brandNode.forms.get(formId)!;

      // c. Variant (Strength + UOM)
      const existingVariant = formNode.variants.find(v =>
        v.strengthId === price.dosage_id &&
        v.uomId === price.strength_uom_id
      );

      if (existingVariant) {
        existingVariant.pharmacyCount++;
        existingVariant.minPrice = Math.min(existingVariant.minPrice, price.price);
        existingVariant.maxPrice = Math.max(existingVariant.maxPrice, price.price);
      } else {
        formNode.variants.push({
          strengthId: price.dosage_id,
          strength: price.strength || '',
          uomId: price.strength_uom_id,
          uom: price.uom || '',
          label: `${price.form_name} ${price.strength} ${price.uom || ''}`.trim(),
          value: `${formId}_${price.dosage_id}_${price.strength_uom_id}`, // UI value key
          pharmacyCount: 1,
          minPrice: price.price,
          maxPrice: price.price
        });
      }
    });

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
