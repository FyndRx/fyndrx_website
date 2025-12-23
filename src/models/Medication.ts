export interface MedicationBrand {
  id: number;
  name: string;
  image?: string;
}

export interface MedicationUOM {
  id: number;
  uom: string;
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
  drug_name: string;
  description: string;
  brands: MedicationBrand[];
  forms: MedicationForm[];
  image: string;
  predefinedQuantities: number[];
  category: string | string[]; // Can be string (legacy) or array of strings
  requiresPrescription: boolean;
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

