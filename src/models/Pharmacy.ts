export interface PharmacyLocation {
  lat: number;
  lng: number;
}

export interface PharmacyReview {
  id: number;
  rating: number;
  comment: string;
  user: string;
  date: string;
}

export interface PharmacyMedication {
  id: number;
  name: string;
  description: string;
  price: number;
  inStock: boolean;
  requiresPrescription: boolean;
}

export interface PharmacyWorkingHours {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

/** A service offered by a pharmacy — now a proper entity, not a plain string. */
export interface PharmacyService {
  id: number;
  name: string;
  slug: string;
  category: string;
  description?: string;
  icon?: string;
}

export interface PharmacyServiceGroup {
  category: string;
  label: string;
  services: PharmacyService[];
}

export interface PharmacyBranch {
  id: string;
  pharmacyId: string;
  branchName: string;
  description?: string;
  phone: string;
  whatsappNumber?: string;
  email?: string;
  website?: string;
  address: string;
  city?: string;
  region?: string;
  latitude?: string | null;
  longitude?: string | null;
  location?: PharmacyLocation | null;
  licenseNumber?: string | null;
  managerName?: string | null;
  managerPhone?: string | null;
  managerEmail?: string | null;
  digitalAddress?: string | null;
  bannerImage?: string | null;
  rating?: number;
  totalReviews?: number;
  isActive?: boolean;
  isOpen?: boolean;
  workingHours?: PharmacyWorkingHours;
  languages?: string[];
  specialStorage?: string[];
  acceptsOnlinePrescriptions?: boolean;
  services?: PharmacyService[];
  deliveryInfo?: PharmacyDeliveryInfo;
  acceptedPaymentMethods?: ('platform' | 'direct')[];
  distance?: string;
}

export interface PharmacyDeliveryInfo {
  available: boolean;
  radiusKm: number | null;
  baseFee: number | null;
  feePerKm: number | null;
}

export interface DeliveryOptionDetail {
  available: boolean;
  fee: number | null;
  baseFee?: number;
  feePerKm?: number;
  radiusKm?: number | null;
  maxRadiusKm?: number | null;
  distanceKm?: number | null;
  label: string;
  note?: string;
  unavailableReason?: string | null;
}

export interface PharmacyDeliveryOptions {
  pharmacyId: string;
  pharmacyName: string;
  pickup: DeliveryOptionDetail;
  pharmacyDelivery: DeliveryOptionDetail;
  fyndrxDelivery: DeliveryOptionDetail;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  city?: string;
  region?: string;
  digitalAddress?: string;
  phone: string;
  email: string;
  whatsappNumber?: string;
  website: string;
  licenseNumber?: string | null;
  license?: string | null;
  logo: string;
  image: string;
  rating: number;
  totalReviews: number;
  isOpen: boolean;
  isActive: boolean;
  distance?: string;
  services: PharmacyService[];
  workingHours: PharmacyWorkingHours;
  description: string;
  location: PharmacyLocation;
  branchesCount: number;
  branches?: PharmacyBranch[];
  reviews: PharmacyReview[];
  medications: PharmacyMedication[];
  acceptsOnlinePrescriptions?: boolean;
  specialStorage?: string[];
  languages?: string[];
  deliveryInfo?: PharmacyDeliveryInfo;
  acceptedPaymentMethods?: ('platform' | 'direct')[];
  acceptedPaymentLabels?: string[];
}

export interface PharmacyFilters {
  searchQuery?: string;
  selectedServices?: string[]; // service slugs
  sortBy?: 'distance' | 'rating' | 'name' | 'price_asc' | 'price_desc' | 'rating_desc' | 'distance_asc';
  isOpenNow?: boolean;
  inStockOnly?: boolean;
}

