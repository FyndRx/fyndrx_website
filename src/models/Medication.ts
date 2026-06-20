export interface MedicationBrand {
  id: number;
  name: string;
  image?: string;
}

export interface MedicationUOM {
  id: number;
  uom: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface MedicationStrength {
  id: number;
  strength: string;
  uoms: MedicationUOM[];
}

export interface MedicationForm {
  id: number;
  form_name: string;
  strengths: MedicationStrength[];
}

export interface Medication {
  id: number;
  product_id?: string;
  drug_id?: number;
  name: string;
  description: string;
  brands: MedicationBrand[];
  forms: MedicationForm[];
  image: string;
  predefinedQuantities: number[];
  category: Category[] | string[] | string; // Can be Category objects, string array, or legacy single string
  requiresPrescription: boolean;
  pharmacy_count?: number;
  price?: number;
  discount_price?: number;
  discount_percentage?: number;
  brand_id?: number;
  brand_name?: string;
  form_id?: number;
  form_name?: string;
  strength_id?: number;
  strength?: string;
  uom_id?: number;
  uom?: string;
  starting_price?: number;
  pharmacy_id?: string;
  pharmacy_name?: string;
  pharmacy_logo?: string;
  branch_id?: string;
  branch_name?: string;
  is_open?: boolean;
}

export interface PharmacyMedicationPrice {
  pharmacyId: number;
  medicationId: number;
  brandId?: number;
  formId: number;
  strengthId: number;
  price: number;
  discountPrice?: number;
  inStock: boolean;
}

export interface MedicationPriceQuery {
  pharmacyId: number;
  medicationId: number;
  brandId?: number;
  formId: number;
  strengthId: number;
}

