/**
 * Response Transformers
 * Maps API response models to UI models
 */

import type { User } from '@/models/User';
import type { Medication } from '@/models/Medication';
import type { Pharmacy, PharmacyBranch, PharmacyWorkingHours } from '@/models/Pharmacy';
import type { PharmacyPrice } from '@/models/PharmacyPrice';
import type { Cart, CartItem } from '@/models/Cart';
import type { Order, OrderItem, OrderTracking } from '@/models/Order';
import type { Review, ReviewStats } from '@/models/Review';
import type { Prescription } from '@/models/Prescription';
import type { BlogPost, Comment } from '@/types/blog';

import type {
  UserApiResponse,
  MedicationApiResponse,
  PharmacyApiResponse,
  PharmacyPriceApiResponse,
  CartApiResponse,
  CartItemApiResponse,
  OrderApiResponse,
  OrderItemApiResponse,
  OrderTrackingApiResponse,
  ReviewApiResponse,
  ReviewStatsApiResponse,
  PrescriptionApiResponse,
} from '@/models/api';

/**
 * Helper to extract data from API response (handles wrapped responses)
 */
export function unwrapApiResponse<T>(response: T | { data: T } | { [key: string]: T }): T {
  if (response && typeof response === 'object') {
    // recursively unwrap 'data' property
    if ('data' in response && response.data !== undefined) {
      return unwrapApiResponse(response.data as any) as T;
    }
    // Handle paginated responses where data is an array but we want the wrapper or just the array? 
    // Usually T is the array or the object. If T is CartApiResponse, it has 'items'.
    // If response is { data: { items: [] } }, first unwrap gets { items: [] }, which is correct.
    
    // Handle object responses like { pharmacies: [...] } which might be a legacy format
    const keys = Object.keys(response);
    if (keys.length === 1 && Array.isArray((response as any)[keys[0]])) {
      // Be careful not to unwrap if the expected type T SHOULD have that key
      // But for generic unwrapping this acts as a heuristic
      return (response as any)[keys[0]] as T;
    }
  }
  return response as T;
}

/**
 * Transform array responses (handles various response formats)
 */
export function unwrapArrayResponse<T>(response: T[] | { data: T[] } | { [key: string]: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }
  const unwrapped = unwrapApiResponse(response);
  return Array.isArray(unwrapped) ? unwrapped : [];
}

/**
 * User Transformers
 */
export function transformUser(apiUser: UserApiResponse): User {
  return {
    id: String(apiUser.id),
    firstname: apiUser.firstname,
    lastname: apiUser.lastname,
    fullname: apiUser.fullname,
    username: apiUser.username,
    dob: apiUser.dob,
    gender: apiUser.gender,
    email: apiUser.email,
    pharmacy_id: apiUser.pharmacy_id,
    pharmacy_branch_id: apiUser.pharmacy_branch_id,
    phone_number: apiUser.phone_number,
    status: apiUser.status,
    member_id: apiUser.member_id,
    address: apiUser.address,
    image: apiUser.image,
    profile_picture: apiUser.profile_picture,
    profile_picture_full: apiUser.profile_picture_full,
    saved_money: apiUser.saved_money,
    addresses: apiUser.addresses,
    medical_records: apiUser.medical_records,
  };
}

/**
 * Medication Transformers
 */
export function transformMedication(apiMed: MedicationApiResponse): Medication {
  // ProductResource returns `brand`/`form` (singular); DrugResource returns `brands`/`forms` (arrays).
  // Normalise both shapes into arrays so downstream filters always have data to work with.
  const rawBrands: any[] = apiMed.brands ?? [];
  const singularBrand: any = (apiMed as any).brand;
  const brands = rawBrands.length
    ? rawBrands.map(b => ({ id: b.id, name: b.name ?? b.brand_name ?? '', image: b.image ?? undefined }))
    : singularBrand
      ? [{ id: singularBrand.id, name: singularBrand.name ?? singularBrand.brand_name ?? '', image: singularBrand.image ?? undefined }]
      : [];

  const rawForms: any[] = apiMed.forms ?? [];
  const singularForm: any = (apiMed as any).form;
  const forms = rawForms.length
    ? rawForms
    : singularForm
      ? [{ id: singularForm.id, form_name: singularForm.form_name ?? '', strengths: singularForm.strengths ?? [] }]
      : [];

  // Use the drug image if available, otherwise fallback to the first brand's image
  const mainImage = apiMed.image || brands[0]?.image || '';

  return {
    id: apiMed.id,
    product_id: (apiMed as any).product_id ?? apiMed.id,
    name: apiMed.name,
    description: apiMed.description ?? '',
    brands,
    forms,
    image: mainImage,
    predefinedQuantities: apiMed.predefined_quantities ?? apiMed.predefinedQuantities ?? [],
    category: apiMed.categories ?? (apiMed as any).drug?.categories ?? apiMed.category ?? '',
    requiresPrescription: apiMed.requires_prescription ?? apiMed.requiresPrescription ?? false,
    pharmacy_count: apiMed.pharmacy_count ?? (apiMed as any).pharmacies_count ?? (apiMed as any).available_pharmacies_count,
    price: apiMed.price ?? (apiMed as any).starting_price,
    discount_price: apiMed.discount_price,
    discount_percentage: apiMed.discount_percentage,
    brand_id: (apiMed as any).brand_id,
    brand_name: (apiMed as any).brand_name ?? (apiMed as any).brand?.name,
    form_id: (apiMed as any).form_id,
    form_name: (apiMed as any).form_name ?? (apiMed as any).form?.form_name,
    strength_id: (apiMed as any).strength_id,
    strength: (apiMed as any).strength ?? (apiMed as any).strength?.strength,
    uom_id: (apiMed as any).uom_id,
    uom: (apiMed as any).uom ?? (apiMed as any).uom?.uom,
    starting_price: (apiMed as any).starting_price
  };
}

export function transformMedications(apiMeds: MedicationApiResponse[]): Medication[] {
  return apiMeds.map(transformMedication);
}

/**
 * Transform Pharmacy Drug (from /pharmacy-drugs)
 */
export function transformPharmacyDrug(drug: any): Medication {
  // Parse predefinedQuantities from string array to number array if needed
  const parsedQuantities: number[] = (drug.predefinedQuantities || []).map((qty: any) => {
    if (typeof qty === 'number') return qty;
    const num = parseInt(String(qty).trim(), 10);
    return isNaN(num) ? 0 : num;
  }).filter((num: number) => num > 0);

  return {
    id: drug.drugId || drug.id,
    name: drug.name || '',
    description: drug.description || '',
    image: drug.image || '',
    requiresPrescription: drug.requiresPrescription ?? false,
    predefinedQuantities: parsedQuantities,
    price: drug.price,
    pharmacy_count: drug.pharmacy_count,
    category: Array.isArray(drug.category) ? drug.category : (drug.category ? [drug.category] : []),
    brands: (drug.brands || []).map((b: any) => ({
      id: b.id,
      brand_id: b.brand_id,
      name: b.name
    })),
    forms: (drug.forms || []).map((f: any) => ({
      id: f.id,
      form_id: f.form_id,
      form_name: f.form_name,
      strengths: [] // Not provided in this flat structure
    }))
  };
}

/**
 * Formats a time string (e.g., "08:00" or "20:00") to 12-hour format with AM/PM (e.g., "8:00 AM" or "8:00 PM")
 */
export function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  timeStr = timeStr.trim();
  
  // If it already has AM/PM, return it
  if (/[a-zA-Z]/.test(timeStr)) {
    return timeStr;
  }

  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1].substring(0, 2);
    if (isNaN(hours)) return timeStr;
    
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    
    return `${hours}:${minutes} ${ampm}`;
  }
  
  return timeStr;
}

/**
 * Determines if a pharmacy is open now based on its working hours
 */
export function isPharmacyOpenNow(workingHours: PharmacyWorkingHours): boolean {
  if (!workingHours) return false;
  
  const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof PharmacyWorkingHours;
  const hoursStr = workingHours[currentDay];
  if (!hoursStr) return false;
  
  const cleanHours = hoursStr.trim().toLowerCase();
  if (cleanHours === '24 hours' || cleanHours === '24/7') {
    return true;
  }
  if (cleanHours === 'closed' || !cleanHours) {
    return false;
  }
  
  if (cleanHours.includes('-')) {
    const parts = cleanHours.split('-').map(p => p.trim());
    if (parts.length === 2) {
      const convertTimeToMinutes = (timeStr: string): number | null => {
        let hours = 0;
        let minutes = 0;
        
        const isPM = timeStr.includes('pm') || timeStr.includes('p');
        const isAM = timeStr.includes('am') || timeStr.includes('a');
        
        const timeDigits = timeStr.replace(/[a-zA-Z]/g, '').trim();
        const timeParts = timeDigits.split(':');
        if (timeParts.length >= 2) {
          hours = parseInt(timeParts[0], 10);
          minutes = parseInt(timeParts[1], 10);
        } else if (timeParts.length === 1) {
          hours = parseInt(timeParts[0], 10);
          minutes = 0;
        } else {
          return null;
        }
        
        if (isNaN(hours) || isNaN(minutes)) return null;
        
        if (isPM && hours !== 12) {
          hours += 12;
        } else if (isAM && hours === 12) {
          hours = 0;
        }
        
        return hours * 60 + minutes;
      };
      
      const openMinutes = convertTimeToMinutes(parts[0]);
      const closeMinutes = convertTimeToMinutes(parts[1]);
      
      if (openMinutes === null || closeMinutes === null) {
        return false;
      }
      
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      if (openMinutes <= closeMinutes) {
        return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
      } else {
        // Overnight hours (e.g. 8:00 PM - 2:00 AM)
        return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
      }
    }
  }
  
  return false;
}

/**
 * Helper to parse working hours from any api format to standard PharmacyWorkingHours
 */
export function parseWorkingHours(workingHoursInput: any): PharmacyWorkingHours {
  const defaultHours: PharmacyWorkingHours = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: '',
  };

  if (!workingHoursInput) {
    return defaultHours;
  }

  const normalizeDay = (day: string): keyof PharmacyWorkingHours | null => {
    const d = day.trim().toLowerCase();
    if (d.startsWith('mon')) return 'monday';
    if (d.startsWith('tue')) return 'tuesday';
    if (d.startsWith('wed')) return 'wednesday';
    if (d.startsWith('thu')) return 'thursday';
    if (d.startsWith('fri')) return 'friday';
    if (d.startsWith('sat')) return 'saturday';
    if (d.startsWith('sun')) return 'sunday';
    return null;
  };

  const formatWorkingHoursValue = (val: string): string => {
    if (!val) return '';
    if (val.includes('-')) {
      const parts = val.split('-').map(p => p.trim());
      if (parts.length === 2) {
        return `${formatTimeTo12Hour(parts[0])} - ${formatTimeTo12Hour(parts[1])}`;
      }
    }
    return formatTimeTo12Hour(val);
  };

  let source = workingHoursInput;

  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch (e) {
      const formattedVal = formatWorkingHoursValue(source);
      return {
        monday: formattedVal,
        tuesday: formattedVal,
        wednesday: formattedVal,
        thursday: formattedVal,
        friday: formattedVal,
        saturday: formattedVal,
        sunday: formattedVal,
      };
    }
  }

  if (Array.isArray(source)) {
    const firstItem = source[0];
    if (firstItem && typeof firstItem === 'object' && ('day' in firstItem || 'day_name' in firstItem)) {
      source.forEach((item: any) => {
        const dayKey = normalizeDay(item.day || item.day_name);
        if (dayKey) {
          if (item.is_24_hours || item.is24Hours) {
            defaultHours[dayKey] = '24 Hours';
          } else if (item.is_closed || item.isClosed) {
            defaultHours[dayKey] = 'Closed';
          } else {
            const open = item.open_time || item.openTime || '';
            const close = item.close_time || item.closeTime || '';
            if (open && close) {
              const formattedOpen = formatTimeTo12Hour(open);
              const formattedClose = formatTimeTo12Hour(close);
              defaultHours[dayKey] = `${formattedOpen} - ${formattedClose}`;
            } else {
              defaultHours[dayKey] = 'Closed';
            }
          }
        }
      });
      return defaultHours;
    }

    const days: (keyof PharmacyWorkingHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    source.forEach((hoursStr: any, index: number) => {
      if (index < days.length && typeof hoursStr === 'string') {
        defaultHours[days[index]] = formatWorkingHoursValue(hoursStr);
      }
    });
    return defaultHours;
  }

  if (typeof source === 'object' && source !== null) {
    Object.entries(source).forEach(([key, value]) => {
      const valStr = String(value);
      const formattedVal = formatWorkingHoursValue(valStr);
      if (key.includes('-')) {
        const parts = key.split('-').map(p => p.trim().toLowerCase());
        if (parts.length === 2) {
          const startDay = parts[0];
          const endDay = parts[1];
          const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
          const startIndex = dayNames.findIndex(d => startDay.startsWith(d));
          const endIndex = dayNames.findIndex(d => endDay.startsWith(d));
          
          if (startIndex !== -1 && endIndex !== -1) {
            const daysList: (keyof PharmacyWorkingHours)[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            let i = startIndex;
            for (let count = 0; count < 7; count++) {
              defaultHours[daysList[i]] = formattedVal;
              if (i === endIndex) break;
              i = (i + 1) % 7;
            }
          }
        }
      } else {
        const dayKey = normalizeDay(key);
        if (dayKey) {
          defaultHours[dayKey] = formattedVal;
        }
      }
    });
    return defaultHours;
  }

  return defaultHours;
}

/**
 * Pharmacy Transformers
 */
function mapServiceObject(s: any) {
  if (typeof s === 'string') {
    return { id: 0, name: s, slug: s.toLowerCase().replace(/\s+/g, '-'), category: '' };
  }
  return { id: s.id ?? 0, name: s.name ?? '', slug: s.slug ?? '', category: s.category ?? '', description: s.description, icon: s.icon };
}

export function transformBranch(branch: any): PharmacyBranch {
  const wh = branch.working_hours;
  const parsedWh = wh ? parseWorkingHours(wh) : undefined;
  return {
    id: branch.id,
    pharmacyId: branch.pharmacy_id,
    branchName: branch.name ?? branch.branch_name ?? '',
    description: branch.description ?? undefined,
    phone: branch.phone ?? '',
    whatsappNumber: branch.whatsapp_number ?? undefined,
    email: branch.email ?? undefined,
    website: branch.website ?? undefined,
    address: branch.address ?? '',
    city: branch.city ?? undefined,
    region: branch.region ?? undefined,
    latitude: branch.location?.lat != null ? String(branch.location.lat) : undefined,
    longitude: branch.location?.lng != null ? String(branch.location.lng) : undefined,
    location: branch.location ?? null,
    licenseNumber: branch.license_number ?? undefined,
    managerName: branch.manager?.name ?? undefined,
    managerPhone: branch.manager?.phone ?? undefined,
    managerEmail: branch.manager?.email ?? undefined,
    digitalAddress: branch.digital_address ?? undefined,
    bannerImage: branch.banner_image ?? undefined,
    rating: branch.rating ?? undefined,
    totalReviews: branch.total_reviews ?? undefined,
    isActive: branch.is_active ?? true,
    workingHours: parsedWh,
    isOpen: (() => {
      if (parsedWh && Object.values(parsedWh).some(v => v !== '')) {
        return isPharmacyOpenNow(parsedWh);
      }
      return branch.is_open ?? false;
    })(),
    languages: Array.isArray(branch.languages)
      ? branch.languages
      : (typeof branch.languages === 'string' && (branch.languages as string).trim()
          ? (branch.languages as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : []),
    specialStorage: Array.isArray(branch.special_storage)
      ? branch.special_storage
      : (typeof branch.special_storage === 'string' && (branch.special_storage as string).trim()
          ? (branch.special_storage as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : []),
    acceptsOnlinePrescriptions: branch.accepts_online_prescriptions ?? false,
    services: (branch.services ?? []).map(mapServiceObject),
    deliveryInfo: branch.delivery ? {
      available: Boolean(branch.delivery.available),
      radiusKm: branch.delivery.radius_km != null ? Number(branch.delivery.radius_km) : null,
      baseFee: branch.delivery.base_fee != null ? Number(branch.delivery.base_fee) : null,
      feePerKm: branch.delivery.fee_per_km != null ? Number(branch.delivery.fee_per_km) : null,
    } : undefined,
    acceptedPaymentMethods: branch.accepted_payment_methods ?? [],
    distance: branch.distance,
  };
}

export function transformPharmacy(apiPharmacy: PharmacyApiResponse): Pharmacy {
  const workingHours = parseWorkingHours(apiPharmacy.working_hours || apiPharmacy.workingHours);

  return {
    id: apiPharmacy.id,
    name: apiPharmacy.name,
    address: apiPharmacy.address,
    rating: apiPharmacy.rating || 0,
    totalReviews: apiPharmacy.total_reviews || 0,
    reviews: [],
    image: apiPharmacy.image || apiPharmacy.logo || '',
    logo: apiPharmacy.logo || apiPharmacy.image || '',
    isOpen: workingHours && Object.values(workingHours).some(val => val !== '') ? isPharmacyOpenNow(workingHours) : (apiPharmacy.is_open ?? apiPharmacy.isOpen ?? true),
    isActive: apiPharmacy.is_active ?? true,
    distance: apiPharmacy.distance || '',
    services: (apiPharmacy.services || []).map(mapServiceObject),
    workingHours,
    phone: apiPharmacy.phone || '',
    email: apiPharmacy.email || '',
    website: apiPharmacy.website || '',
    description: apiPharmacy.description || '',
    location: apiPharmacy.location || {
      lat: (apiPharmacy as any).latitude || 0,
      lng: (apiPharmacy as any).longitude || 0
    },
    licenseNumber: apiPharmacy.license_number,
    license: apiPharmacy.license,
    whatsappNumber: apiPharmacy.whatsapp_number,
    digitalAddress: apiPharmacy.digital_address,
    city: apiPharmacy.city,
    region: apiPharmacy.region,
    acceptsOnlinePrescriptions: apiPharmacy.accepts_online_prescriptions,
    specialStorage: Array.isArray(apiPharmacy.special_storage)
      ? apiPharmacy.special_storage
      : (typeof apiPharmacy.special_storage === 'string' && (apiPharmacy.special_storage as string).trim()
          ? (apiPharmacy.special_storage as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : []),
    languages: Array.isArray(apiPharmacy.languages)
      ? apiPharmacy.languages
      : (typeof apiPharmacy.languages === 'string' && (apiPharmacy.languages as string).trim()
          ? (apiPharmacy.languages as string).split(',').map((s: string) => s.trim()).filter(Boolean)
          : []),
    branchesCount: apiPharmacy.branches_count || 0,
    branches: (apiPharmacy.branches || []).map(transformBranch),
    medications: [],
    deliveryInfo: apiPharmacy.delivery ? {
      available: Boolean(apiPharmacy.delivery.available),
      radiusKm: apiPharmacy.delivery.radius_km !== undefined ? (apiPharmacy.delivery.radius_km !== null ? Number(apiPharmacy.delivery.radius_km) : null) : null,
      baseFee: apiPharmacy.delivery.base_fee !== undefined ? (apiPharmacy.delivery.base_fee !== null ? Number(apiPharmacy.delivery.base_fee) : null) : null,
      feePerKm: apiPharmacy.delivery.fee_per_km !== undefined ? (apiPharmacy.delivery.fee_per_km !== null ? Number(apiPharmacy.delivery.fee_per_km) : null) : null,
    } : undefined,
    acceptedPaymentMethods: apiPharmacy.accepted_payment_methods,
    acceptedPaymentLabels: apiPharmacy.accepted_payment_labels,
  };
}

export function transformPharmacies(apiPharmacies: PharmacyApiResponse[]): Pharmacy[] {
  return apiPharmacies.map(transformPharmacy);
}

/**
 * Pharmacy Price Transformers
 */
export function transformPharmacyPrice(apiPrice: PharmacyPriceApiResponse): PharmacyPrice {
  const pharmacyInfo = apiPrice.pharmacy;
  const branchInfo = (apiPrice as any).pharmacy_branch;

  // API returns normal_price/discounted_price; legacy endpoints use price/discount_price
  const resolvedPrice = apiPrice.normal_price ?? apiPrice.price ?? 0;
  const resolvedDiscount = apiPrice.discounted_price ?? apiPrice.discount_price ?? undefined;

  const branchId = apiPrice.branch_id
    ? String(apiPrice.branch_id)
    : apiPrice.pharmacy_branch_id
      ? String(apiPrice.pharmacy_branch_id)
      : apiPrice.pharmacy?.branch_id
        ? String(apiPrice.pharmacy.branch_id)
        : undefined;

  return {
    id: String(apiPrice.id),
    pharmacy_id: String(apiPrice.pharmacy_id ?? ''),
    pharmacy_branch_id: branchId,
    branch_id: branchId,
    product_id: apiPrice.product_id ?? undefined,
    drug_id: apiPrice.drug_id ?? 0,
    brand_id: apiPrice.brand_id ?? 0,
    form_id: apiPrice.form_id ?? 0,
    strength_id: apiPrice.strength_id ?? 0,
    uom_id: apiPrice.uom_id ?? 0,
    price: resolvedPrice,
    discount_price: resolvedDiscount != null ? resolvedDiscount : undefined,
    discount_percentage: apiPrice.discount_percentage != null ? Number(apiPrice.discount_percentage) : undefined,
    stock_quantity: apiPrice.stock_quantity,
    in_stock: apiPrice.in_stock ?? false,
    created_at: '',
    updated_at: '',
    pharmacy: pharmacyInfo ? {
      id: String(pharmacyInfo.id ?? apiPrice.pharmacy_id ?? ''),
      name: pharmacyInfo.name || apiPrice.pharmacy_name,
      logo: pharmacyInfo.logo || apiPrice.pharmacy_logo || undefined,
      address: pharmacyInfo.address,
      rating: pharmacyInfo.rating,
      distance: pharmacyInfo.distance?.toString(),
      is_open: pharmacyInfo.is_open ?? apiPrice.is_open,
      pharmacy_branch_id: branchId,
      branch_name: pharmacyInfo.branch_name || apiPrice.branch_name || '',
      branch_address: (pharmacyInfo as any).branch_address || (branchInfo as any)?.address || '',
    } : undefined,
    pharmacy_name: apiPrice.pharmacy_name || apiPrice.pharmacy?.name || '',
    pharmacy_logo: apiPrice.pharmacy_logo || apiPrice.pharmacy?.logo || undefined,
    branch_name: apiPrice.branch_name || '',
    branch_location: apiPrice.branch_location ?? undefined,
    is_open: apiPrice.is_open ?? false,
    name: apiPrice.name,
    brand_name: apiPrice.brand_name ?? '',
    form_name: apiPrice.form_name ?? '',
    strength: apiPrice.strength ?? '',
    uom: apiPrice.uom ?? '',
    image: apiPrice.image ?? undefined,
    latitude: apiPrice.branch_location?.lat ?? apiPrice.latitude,
    longitude: apiPrice.branch_location?.lng ?? apiPrice.longitude,
    requires_prescription: apiPrice.requires_prescription,
  };
}

export function transformPharmacyPrices(apiPrices: PharmacyPriceApiResponse[]): PharmacyPrice[] {
  return apiPrices.map(transformPharmacyPrice);
}

/**
 * Cart Transformers
 */
export function transformCartItem(apiItem: CartItemApiResponse, acceptedPaymentMethods?: ('platform' | 'direct')[]): CartItem {
  return {
    id: String(apiItem.cart_item_id),
    medicationId: apiItem.drug_id ?? 0,
    medicationName: apiItem.name,
    pharmacyId: String(apiItem.pharmacy_id ?? ''),
    pharmacyName: apiItem.pharmacy_name ?? apiItem.pharmacy?.name ?? '',
    pharmacyLogo: apiItem.pharmacy_logo ?? apiItem.pharmacy?.logo ?? undefined,
    isOpen: apiItem.is_open ?? false,
    pharmacyBranchId: apiItem.pharmacy_branch_id ? String(apiItem.pharmacy_branch_id) : undefined,
    branchName: apiItem.branch_name ?? '',
    brandId: apiItem.brand_id ?? 0,
    brandName: apiItem.brand_name ?? '',
    formId: apiItem.form_id ?? 0,
    formName: apiItem.form_name ?? '',
    strengthId: apiItem.strength_id ?? 0,
    strength: apiItem.strength ?? '',
    uomId: apiItem.uom_id ?? 0,
    uom: apiItem.uom ?? '',
    quantity: apiItem.quantity,
    price: apiItem.price,
    discountPrice: apiItem.discount_price ?? undefined,
    image: apiItem.image ?? undefined,
    inStock: apiItem.in_stock,
    requiresPrescription: apiItem.requires_prescription,
    pharmacyDrugPriceId: String(apiItem.id),
    acceptedPaymentMethods: acceptedPaymentMethods,
    latitude: apiItem.latitude != null ? Number(apiItem.latitude) : undefined,
    longitude: apiItem.longitude != null ? Number(apiItem.longitude) : undefined,
  };
}

export function transformCart(apiCart: CartApiResponse): Cart {
  // Flatten all pharmacy groups into a single items list
  const items: CartItem[] = (apiCart.pharmacies ?? []).flatMap(group => {
    return group.items.map(apiItem => {
      // Inject group-level pharmacy info if missing on item
      const item = transformCartItem(apiItem, group.accepted_payment_methods);
      if (!item.pharmacyName) item.pharmacyName = group.pharmacy_name || '';
      if (!item.pharmacyLogo) item.pharmacyLogo = group.pharmacy_logo || undefined;
      if (item.isOpen === undefined) item.isOpen = group.is_open ?? false;
      if (!item.pharmacyBranchId) item.pharmacyBranchId = group.pharmacy_branch_id ? String(group.pharmacy_branch_id) : undefined;
      if (!item.branchName) item.branchName = group.branch_name || '';
      if (!item.latitude && group.latitude) item.latitude = Number(group.latitude);
      if (!item.longitude && group.longitude) item.longitude = Number(group.longitude);
      return item;
    });
  });

  return {
    items,
    totalItems: apiCart.total_items ?? items.length,
    subtotal: apiCart.subtotal ?? 0,
    discount: 0,
    total: apiCart.total ?? 0,
  };
}

/**
 * Order Transformers
 */
// Debug log to see actual API response structure
// console.log('transformOrderItem apiItem:', apiItem);

export function transformOrderItem(apiItem: OrderItemApiResponse): OrderItem {
  return {
    id: String(apiItem.id),
    medicationId: apiItem.drug_id ?? 0,
    medicationName: apiItem.name,
    brandId: apiItem.brand_id ?? undefined,
    brandName: '',
    formId: apiItem.form_id ?? 0,
    formName: '',
    strengthId: apiItem.strength_id ?? 0,
    strength: '',
    uomId: apiItem.uom_id ?? 0,
    uom: '',
    quantity: Number(apiItem.quantity),
    price: Number(apiItem.price),
    discountPrice: apiItem.discount_price ? Number(apiItem.discount_price) : undefined,
    image: apiItem.image ?? undefined,
  };
}

// Safe mapping helper
export function transformOrder(apiOrder: OrderApiResponse): Order {
  if (!apiOrder) {
    console.warn('transformOrder received invalid data');
    const now = new Date().toISOString();
    return {
      id: '0',
      orderNumber: '',
      userId: '',
      pharmacyId: '',
      pharmacyName: '',
      pharmacyPhone: '',
      pharmacyAddress: '',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
      discount: 0,
      taxRate: null,
      taxAmount: 0,
      total: 0,
      paymentMethod: 'platform',
      paymentStatus: 'pending',
      deliveryMethod: 'pickup',
      phoneNumber: '',
      status: 'pending',
      prescriptionRequired: false,
      prescriptionUploaded: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  return {
    id: String(apiOrder.id),
    orderNumber: apiOrder.order_number,
    userId: String(apiOrder.user_id),
    pharmacyId: String(apiOrder.pharmacy_id),
    pharmacyName: apiOrder.pharmacy_name ?? '',
    pharmacyPhone: apiOrder.pharmacy_phone ?? '',
    pharmacyAddress: apiOrder.pharmacy_address ?? '',
    pharmacyImage: apiOrder.pharmacy_logo ?? undefined,
    pharmacyBanner: apiOrder.pharmacy_banner ?? undefined,
    branchName: apiOrder.branch_name,
    items: (apiOrder.items ?? []).map(transformOrderItem),
    subtotal: Number(apiOrder.subtotal),
    deliveryFee: Number(apiOrder.delivery_fee ?? 0),
    discount: Number(apiOrder.discount ?? 0),
    taxRate: apiOrder.tax_rate != null ? Number(apiOrder.tax_rate) : null,
    taxAmount: Number(apiOrder.tax_amount ?? 0),
    total: Number(apiOrder.total),
    paymentMethod: apiOrder.payment_method,
    paymentStatus: apiOrder.payment_status,
    deliveryAddress: apiOrder.delivery_address,
    deliveryLat: apiOrder.delivery_lat ? Number(apiOrder.delivery_lat) : undefined,
    deliveryLng: apiOrder.delivery_lng ? Number(apiOrder.delivery_lng) : undefined,
    pharmacyLat: (apiOrder.pharmacy_lat !== null && apiOrder.pharmacy_lat !== undefined) ? Number(apiOrder.pharmacy_lat) : undefined,
    pharmacyLng: (apiOrder.pharmacy_lng !== null && apiOrder.pharmacy_lng !== undefined) ? Number(apiOrder.pharmacy_lng) : undefined,
    deliveryMethod: apiOrder.delivery_method,
    deliveryProvider: apiOrder.delivery_provider ?? null,
    phoneNumber: apiOrder.phone_number,
    status: apiOrder.status,
    prescriptionRequired: apiOrder.prescription_required,
    prescriptionUploaded: apiOrder.prescription_uploaded,
    prescriptionUrl: apiOrder.prescription_url,
    notes: apiOrder.notes,
    estimatedReadyTime: apiOrder.estimated_ready_time,
    completedAt: apiOrder.completed_at,
    cancelledAt: undefined,
    cancellationReason: apiOrder.cancellation_reason,
    createdAt: apiOrder.created_at,
    updatedAt: apiOrder.updated_at,
    statusHistory: (apiOrder.status_history ?? []).map(history => ({
      status: history.status,
      timestamp: history.timestamp,
      note: history.note,
    })),
  };
}

export function transformOrders(apiOrders: OrderApiResponse[]): Order[] {
  if (!Array.isArray(apiOrders)) {
    console.warn('transformOrders received non-array:', apiOrders);
    return [];
  }
  return apiOrders.map(transformOrder);
}

export function transformOrderTracking(apiTracking: OrderTrackingApiResponse): OrderTracking {
  return {
    order: transformOrder(apiTracking.order),
    statusHistory: (apiTracking.status_history ?? []).map(history => ({
      status: history.status,
      timestamp: history.timestamp,
      note: history.note,
    })),
    currentStep: apiTracking.current_step ?? 0,
    estimatedDelivery: apiTracking.estimated_delivery,
  };
}

/**
 * Review Transformers
 */
export function transformReview(apiReview: ReviewApiResponse): Review {
  const user = apiReview.user;
  const userName = user?.fullname || user?.name ||
    (user?.firstname && user?.lastname ? `${user.firstname} ${user.lastname}` : '') ||
    'Anonymous';

  return {
    id: String(apiReview.id),
    userId: String(apiReview.user_id || apiReview.userId || user?.id || ''),
    userName,
    userAvatar: user?.profile_picture || user?.avatar,
    targetType: apiReview.target_type || apiReview.targetType || 'medication',
    targetId: String(apiReview.target_id || apiReview.targetId || ''),
    targetName: apiReview.target_name || apiReview.targetName,
    orderId: apiReview.order_id || apiReview.orderId ? String(apiReview.order_id || apiReview.orderId) : undefined,
    rating: apiReview.rating,
    title: apiReview.title || '',
    comment: apiReview.comment,
    images: apiReview.images,
    verified: apiReview.verified || false,
    helpful: apiReview.helpful || apiReview.helpful_count || apiReview.helpfulCount || 0,
    notHelpful: apiReview.not_helpful || apiReview.not_helpful_count || apiReview.notHelpfulCount || 0,
    pharmacyResponse: apiReview.pharmacy_response || apiReview.pharmacyResponse ? {
      respondedBy: (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.responded_by ||
        (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.respondedBy || '',
      message: (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.message || '',
      respondedAt: (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.responded_at ||
        (apiReview.pharmacy_response || apiReview.pharmacyResponse)?.respondedAt || '',
    } : undefined,
    createdAt: apiReview.created_at || apiReview.createdAt || new Date().toISOString(),
    updatedAt: apiReview.updated_at || apiReview.updatedAt || new Date().toISOString(),
  };
}

export function transformReviews(apiReviews: ReviewApiResponse[]): Review[] {
  return apiReviews.map(transformReview);
}

export function transformReviewStats(apiStats: ReviewStatsApiResponse): ReviewStats {
  return {
    averageRating: apiStats.average_rating || apiStats.averageRating || 0,
    totalReviews: apiStats.total_reviews || apiStats.totalReviews || 0,
    ratingDistribution: apiStats.rating_distribution || apiStats.ratingDistribution || {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    },
  };
}

const normalizePrescriptionStatus = (status?: string | null): Prescription['status'] => {
  if (!status) {
    return 'active';
  }
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'approved') {
    return 'completed';
  }
  if (normalized === 'cancelled' || normalized === 'canceled' || normalized === 'rejected') {
    return 'cancelled';
  }
  return 'active';
};

/**
 * Prescription Transformers
 */
export function transformPrescription(apiPrescription: PrescriptionApiResponse): Prescription {
  return {
    id: apiPrescription.id,
    title: apiPrescription.title,
    prescription_number: apiPrescription.prescription_number,
    doctor_name: apiPrescription.doctor_name,
    prescription_date: apiPrescription.prescription_date,
    expiry_date: apiPrescription.expiry_date,
    status: normalizePrescriptionStatus(apiPrescription.status),
    notes: apiPrescription.notes,
    prescription_picture: apiPrescription.prescription_picture,
    has_request: apiPrescription.has_request,
    user_id: apiPrescription.user_id,
    pharmacy_id: apiPrescription.pharmacy_id,
    pharmacy_branch_id: apiPrescription.pharmacy_branch_id,
    origin: (apiPrescription as any).origin,
    drugs: (apiPrescription.drugs || []).map(drug => ({
      id: drug.id,
      prescription_id: drug.prescription_id,
      drug_id: drug.drug_id,
      product_id: drug.product_id,
      display_name: drug.display_name ?? drug.drug_name ?? drug.name ?? '',
      name: drug.display_name ?? drug.drug_name ?? drug.name ?? '',
      brand_id: drug.brand_id,
      brand_name: drug.brand_name,
      form_id: drug.form_id,
      form_name: drug.form_name,
      dose: drug.dose,
      frequency: drug.frequency,
      duration: drug.duration,
      quantity: drug.quantity,
      uom_id: drug.uom_id,
      uom: drug.uom,
      instruction: drug.instruction,
      image: drug.image,
      created_at: drug.created_at,
    })),
    created_at: (new Date(apiPrescription.created_at || apiPrescription.createdAt || new Date())).toISOString(),
    updated_at: (new Date(apiPrescription.updated_at || apiPrescription.updatedAt || new Date())).toISOString(),
  };
}

export function transformPrescriptions(apiPrescriptions: PrescriptionApiResponse[]): Prescription[] {
  return apiPrescriptions.map(transformPrescription);
}

/**
 * Blog Transformers
 */
export function transformBlogPost(apiPost: any): BlogPost {
  return {
    id: apiPost.id,
    title: apiPost.title,
    slug: apiPost.slug,
    excerpt: apiPost.excerpt || apiPost.summary || '',
    content: apiPost.content || apiPost.body || '',
    coverImage: apiPost.cover_image || apiPost.coverImage || apiPost.image || '',
    category: apiPost.category?.name || apiPost.category || 'Uncategorized',
    date: apiPost.date || apiPost.created_at || apiPost.createdAt || new Date().toISOString(),
    author: {
      // User relationship sends `fullname` (accessor) + `firstname`/`lastname`, never `name`.
      // Fall back to the post's own author_name for non-registered / manually-set authors.
      name:
        apiPost.author?.fullname ||
        (apiPost.author?.firstname
          ? `${apiPost.author.firstname} ${apiPost.author.lastname ?? ''}`.trim()
          : '') ||
        apiPost.author_name ||
        apiPost.user?.fullname ||
        apiPost.user?.name ||
        'Anonymous',
      avatar:
        apiPost.author?.profile_picture ||
        apiPost.author?.image ||
        apiPost.author_avatar ||
        apiPost.user?.profile_picture ||
        apiPost.user?.avatar ||
        '',
      bio: apiPost.author?.bio || apiPost.author_bio || '',
    },
    tags: apiPost.tags || [],
    readTime: apiPost.read_time || apiPost.readTime || 5,
    likes: apiPost.likes_count ?? apiPost.likes ?? 0,
    views: apiPost.views_count ?? apiPost.views ?? 0,
    liked: apiPost.user_liked ?? false,
    comments: Array.isArray(apiPost.comments) ? apiPost.comments.map(transformComment) : []
  };
}

export function transformBlogPosts(apiPosts: any[]): BlogPost[] {
  return apiPosts.map(transformBlogPost);
}

export function transformComment(apiComment: any): Comment {
  const user = apiComment.user;

  // Build author name: prefer fullname, fall back to firstname+lastname, then
  // the anonymous `name` field on the comment itself, then a generic fallback.
  const authorName =
    user?.fullname ||
    (user?.firstname ? `${user.firstname} ${user.lastname || ''}`.trim() : '') ||
    apiComment.author?.name ||
    apiComment.name ||
    'Anonymous';

  // Build avatar: prefer profile_picture_full, profile_picture, then ui-avatars fallback.
  const authorAvatar =
    user?.profile_picture_full ||
    user?.profile_picture ||
    user?.avatar ||
    apiComment.author?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=246BFD&color=fff`;

  return {
    id: apiComment.id,
    author: { name: authorName, avatar: authorAvatar },
    // Backend stores the text in `comment`, not `content`
    content: apiComment.comment || apiComment.content || apiComment.body || '',
    date: apiComment.created_at || apiComment.date || new Date().toISOString(),
    likes: apiComment.likes_count ?? apiComment.likes ?? 0,
    liked: apiComment.user_liked ?? false,
    replies: Array.isArray(apiComment.replies) ? apiComment.replies.map(transformComment) : [],
  };
}


