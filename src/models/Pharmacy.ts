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

export interface PharmacyBranch {
  id: number;
  pharmacyId: number;
  branchName: string;
  phone: string;
  address: string;
  latitude?: string | null;
  longitude?: string | null;
  licenseNumber?: string | null;
  managerName?: string | null;
  managerPhone?: string | null;
  managerEmail?: string | null;
  digitalAddress?: string | null;
}

export interface Pharmacy {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
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
  services: string[];
  workingHours: PharmacyWorkingHours;
  description: string;
  location: PharmacyLocation;
  branchesCount: number;
  branches?: PharmacyBranch[]; 
  reviews: PharmacyReview[]; 
  medications: PharmacyMedication[];
}

export interface PharmacyFilters {
  searchQuery?: string;
  selectedServices?: string[];
  sortBy?: 'distance' | 'rating' | 'name' | 'price_asc' | 'price_desc' | 'rating_desc' | 'distance_asc';
  isOpenNow?: boolean;
  inStockOnly?: boolean;
}

