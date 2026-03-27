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
  brand_id?: number;
  form_id?: number;
  strength_id?: number;
  uom_id?: number;
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

