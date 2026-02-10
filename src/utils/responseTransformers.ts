/**
 * Response Transformers
 * Maps API response models to UI models
 */

import type { User } from '@/models/User';
import type { Medication } from '@/models/Medication';
import type { Pharmacy, PharmacyWorkingHours } from '@/models/Pharmacy';
import type { PharmacyPrice } from '@/models/PharmacyPrice';
import type { Cart, CartItem } from '@/models/Cart';
import type { Order, OrderItem, OrderTracking } from '@/models/Order';
import type { Review, ReviewStats } from '@/models/Review';
import type { Prescription } from '@/models/Prescription';

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
    id: apiUser.id,
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
  };
}

/**
 * Medication Transformers
 */
export function transformMedication(apiMed: MedicationApiResponse): Medication {
  const brands = (apiMed.brands ?? []).map(brand => ({
    ...brand,
    image: brand.image ?? undefined
  }));

  // Use the drug image if available, otherwise fallback to the first brand's image
  const mainImage = apiMed.image || brands[0]?.image || '';

  return {
    id: apiMed.id,
    drug_name: apiMed.drug_name,
    description: apiMed.description ?? '',
    brands: brands,
    forms: apiMed.forms ?? [],
    image: mainImage,
    predefinedQuantities: apiMed.predefined_quantities ?? apiMed.predefinedQuantities ?? [],
    category: apiMed.category ?? (apiMed as any).categories ?? '',
    requiresPrescription: apiMed.requires_prescription ?? apiMed.requiresPrescription ?? false,
  };
}

export function transformMedications(apiMeds: MedicationApiResponse[]): Medication[] {
  return apiMeds.map(transformMedication);
}

/**
 * Pharmacy Transformers
 */
export function transformPharmacy(apiPharmacy: PharmacyApiResponse): Pharmacy {
  const workingHoursSource = (apiPharmacy.working_hours || apiPharmacy.workingHours || {}) as Record<string, string | undefined>;
  const workingHours: PharmacyWorkingHours = {
    monday: workingHoursSource.monday ?? '',
    tuesday: workingHoursSource.tuesday ?? '',
    wednesday: workingHoursSource.wednesday ?? '',
    thursday: workingHoursSource.thursday ?? '',
    friday: workingHoursSource.friday ?? '',
    saturday: workingHoursSource.saturday ?? '',
    sunday: workingHoursSource.sunday ?? '',
  };

  return {
    id: apiPharmacy.id,
    name: apiPharmacy.name,
    address: apiPharmacy.address,
    rating: apiPharmacy.rating || 0,
    reviews: [],
    image: apiPharmacy.image || apiPharmacy.logo || '',
    isOpen: apiPharmacy.is_open ?? apiPharmacy.isOpen ?? true,
    distance: apiPharmacy.distance || '',
    services: apiPharmacy.services || [],
    workingHours,
    phone: apiPharmacy.phone || '',
    email: apiPharmacy.email || '',
    website: apiPharmacy.website || '',
    description: apiPharmacy.description || '',
    location: apiPharmacy.location || { lat: 0, lng: 0 },
    medications: [],
  };
}

export function transformPharmacies(apiPharmacies: PharmacyApiResponse[]): Pharmacy[] {
  return apiPharmacies.map(transformPharmacy);
}

/**
 * Pharmacy Price Transformers
 */
export function transformPharmacyPrice(apiPrice: PharmacyPriceApiResponse): PharmacyPrice {
  // Get medication ID (handle both snake_case and camelCase)
  const medicationId = apiPrice.medicationId || apiPrice.drug_id || 0;

  const pharmacyInfo = apiPrice.pharmacy;
  const branchInfo = apiPrice.pharmacy_branch;

  const normalizedPharmacy = pharmacyInfo
    ? {
      id: pharmacyInfo.id ?? apiPrice.pharmacy_id,
      name: pharmacyInfo.name || apiPrice.pharmacy_name,
      logo: pharmacyInfo.logo || apiPrice.pharmacy_logo,
      address: pharmacyInfo.address || apiPrice.pharmacy_address,
      rating: pharmacyInfo.rating ?? apiPrice.rating,
      distance: pharmacyInfo.distance || apiPrice.distance,
      is_open: pharmacyInfo.is_open ?? (pharmacyInfo as any).isOpen ?? apiPrice.is_open,
      pharmacy_branch_id: pharmacyInfo.pharmacy_branch_id ?? apiPrice.pharmacy_branch_id,
      branch_name: pharmacyInfo.branch_name || branchInfo?.branch_name,
      branch_address: pharmacyInfo.branch_address || branchInfo?.address || apiPrice.pharmacy_address,
    }
    : undefined;

  const normalizedBranch = branchInfo && branchInfo.id
    ? {
      id: branchInfo.id,
      name: branchInfo.name || branchInfo.branch_name,
      address: branchInfo.address || '',
      pharmacy_id: branchInfo.pharmacy_id ?? apiPrice.pharmacy_id,
    }
    : undefined;

  return {
    id: apiPrice.id,
    pharmacy_id: apiPrice.pharmacy_id || apiPrice.pharmacyId || 0,
    pharmacy_branch_id: apiPrice.pharmacy_branch_id,
    medicationId,
    drug_id: apiPrice.drug_id || apiPrice.drugId || 0,
    drug_brand_id: apiPrice.brand_id || 0, // Changed from apiPrice.drug_brand_id to apiPrice.brand_id as per user instruction
    drug_brand_form_id: apiPrice.drug_brand_form_id || apiPrice.formId || apiPrice.form_id || 0,
    dosage_id: apiPrice.dosage_id || apiPrice.strengthId || apiPrice.strength_id || 0,
    strength_uom_id: apiPrice.strength_uom_id || apiPrice.uomId || apiPrice.uom_id || 0,
    price: apiPrice.price || apiPrice.normal_price || 0,
    discount_price: apiPrice.discount_price || apiPrice.discounted_price || apiPrice.discountPrice,
    stock_quantity: apiPrice.stock_quantity,
    in_stock: apiPrice.in_stock ?? apiPrice.inStock ?? false,
    created_at: apiPrice.created_at,
    updated_at: apiPrice.updated_at,
    pharmacy: normalizedPharmacy,
    pharmacy_branch: normalizedBranch,
    branch_name: apiPrice.branch_name || normalizedBranch?.name, // Map flat branch_name or nested
    pharmacy_name: apiPrice.pharmacy_name,
    pharmacy_logo: apiPrice.pharmacy_logo,
    pharmacy_address: apiPrice.pharmacy_address,
    distance: apiPrice.distance,
    rating: apiPrice.rating,

    // Map optional fields (handling potential snake_case vs camelCase)
    drug_name: apiPrice.drug_name || apiPrice.drugName,
    drug_image: apiPrice.drug_image || apiPrice.drugImage,
    brand_name: apiPrice.brand_name || apiPrice.brandName,
    form_name: apiPrice.form_name || apiPrice.formName,
    strength: apiPrice.strength || (apiPrice as any).strengthValue,
    // Handle UOM: Check uom_name (new string field), falling back to other possible fields
    uom: typeof apiPrice.uom_name === 'string' ? apiPrice.uom_name : (apiPrice.uom_name as any)?.uom || apiPrice.uom || (apiPrice as any).uomValue,
  };
}

export function transformPharmacyPrices(apiPrices: PharmacyPriceApiResponse[]): PharmacyPrice[] {
  return apiPrices.map(transformPharmacyPrice);
}

/**
 * Cart Transformers
 */
export function transformCartItem(apiItem: CartItemApiResponse): CartItem {
  const medication = apiItem.medication;
  const pharmacy = apiItem.pharmacy;
  const brand = apiItem.brand;
  const form = apiItem.form;
  const strengthObj = apiItem.strength_obj; // Renamed property in interface
  const uom = apiItem.uom;

  // Helper to extract value from potentially nested or flat source
  const getValue = (primary?: string, secondary?: any, key?: string) => {
    if (primary) return primary;
    if (secondary && key && secondary[key]) return secondary[key];
    return '';
  };

  const getStrengthVal = (val: string | { strength: string } | undefined) => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && 'strength' in val) return val.strength;
    return '';
  };

  const getUomVal = (val: string | { uom: string } | undefined) => {
    if (typeof val === 'string') return val;
    if (val && typeof val === 'object' && 'uom' in val) return val.uom;
    return '';
  };

  return {
    id: String(apiItem.id),
    medicationId: apiItem.drug_id,
    medicationName: getValue(apiItem.drug_name, medication, 'drug_name'),
    pharmacyId: apiItem.pharmacy_id || pharmacy?.id || 0,
    pharmacyName: pharmacy?.name || '',
    pharmacyLogo: pharmacy?.logo,
    pharmacyBranchId: apiItem.pharmacy_branch_id,
    branchName: getValue(apiItem.branch_name, apiItem.pharmacy_branch, 'name') || getValue(undefined, apiItem.pharmacy_branch, 'branch_name'),
    brandId: apiItem.drug_brand_id || brand?.id || 0,
    brandName: getValue(apiItem.brand_name, brand, 'name'),
    formId: apiItem.drug_brand_form_id || form?.id || 0,
    formName: getValue(apiItem.form_name, form, 'form_name'),
    strengthId: apiItem.dosage_id || strengthObj?.id || 0,
    strength: getStrengthVal(apiItem.strength) || (strengthObj?.strength || ''),
    uomId: apiItem.strength_uom_id || uom?.id || 0,
    uom: getUomVal(apiItem.strength_uom) || (uom?.uom || ''),
    quantity: apiItem.quantity,
    price: apiItem.price,
    discountPrice: apiItem.discount_price,
    image: apiItem.image || brand?.image || medication?.image,
    inStock: true, // Default to true if not provided
    requiresPrescription: medication?.requires_prescription,
    pharmacyDrugPriceId: apiItem.pharmacy_drug_price_id,
  };
}

export function transformCart(apiCart: CartApiResponse): Cart {
  let items: CartItem[] = [];

  if (apiCart.items) {
    items = apiCart.items.map(transformCartItem);
  } else if (apiCart.pharmacies) {
    // Flatten split pharmacy items into single list
    items = apiCart.pharmacies.flatMap(pharmacyGroup => 
      (pharmacyGroup.items || []).map(item => transformCartItem({
        ...item,
        // Ensure pharmacy details are passed down if missing in item
        pharmacy: item.pharmacy || {
          id: pharmacyGroup.pharmacy_id,
          name: pharmacyGroup.pharmacy_name,
          logo: pharmacyGroup.pharmacy_logo || undefined
        }
      }))
    );
  } else {
    // Only warn if truly empty and not just 0 items
    if ((apiCart.total_items || 0) > 0) {
      console.warn('transformCart received incomplete data:', JSON.stringify(apiCart, null, 2));
    }
  }

  return {
    items,
    totalItems: apiCart.total_items || apiCart.totalItems || items.length,
    subtotal: apiCart.subtotal || 0,
    discount: apiCart.discount || 0,
    total: apiCart.total || 0,
  };
}

/**
 * Order Transformers
 */
// Debug log to see actual API response structure
// console.log('transformOrderItem apiItem:', apiItem);

export function transformOrderItem(apiItem: OrderItemApiResponse): OrderItem {
  const medication = apiItem.medication;
  const brand = apiItem.brand;
  const form = apiItem.form;
  const strength = apiItem.strength;
  const uom = apiItem.uom || (apiItem as any).strength_uom;

  // Helper to find property across potentially flat or nested structures
  const findProp = (obj: any, keys: string[]) => {
    if (!obj) return undefined;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null) return obj[key];
    }
    return undefined;
  };

  return {
    id: String(apiItem.id || `item-${apiItem.drug_id}-${Math.random()}`),
    medicationId: apiItem.drug_id,
    medicationName: medication?.drug_name || findProp(apiItem, ['drug_name', 'medication_name', 'name', 'drugName']) || '',
    brandId: apiItem.drug_brand_id,
    brandName: brand?.name || 
               (apiItem as any).drug_brand?.brand?.brand_name || 
               findProp(apiItem, ['brand_name', 'brandName', 'drug_brand_name', 'drugBrandName', 'brand', 'drug_brand'])?.name || 
               findProp(apiItem, ['brand_name', 'brandName', 'drug_brand_name', 'drugBrandName']) || '',
    formId: apiItem.drug_brand_form_id,
    formName: form?.form_name || 
              (form as any)?.name || 
              (apiItem as any).drug_form?.form?.form_name ||
              findProp(apiItem, ['form_name', 'formName', 'drug_form_name', 'drugFormName', 'form', 'dosage_form', 'drug_form'])?.name || 
              findProp(apiItem, ['form_name', 'formName', 'drug_form_name', 'drugFormName']) || '',
    strengthId: apiItem.dosage_id,
    strength: strength?.strength || 
              (apiItem as any).drug_strength?.strength?.strength ||
              findProp(apiItem, ['strength_value', 'strength', 'dosage']) || '',
    uomId: apiItem.strength_uom_id,
    uom: uom?.uom || 
         (apiItem as any).drug_uom?.uom?.uom ||
         findProp(apiItem, ['uom_name', 'uom']) || '',
    quantity: Number(apiItem.quantity),
    price: Number(apiItem.price),
    discountPrice: apiItem.discount_price ? Number(apiItem.discount_price) : undefined,
    image: brand?.image || medication?.image || findProp(apiItem, ['brand_image', 'drug_image', 'image']),
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
      userId: 0,
      pharmacyId: 0,
      pharmacyName: '',
      pharmacyPhone: '',
      pharmacyAddress: '',
      items: [],
      subtotal: 0,
      deliveryFee: 0,
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
    orderNumber: apiOrder.order_number || apiOrder.orderNumber || '',
    userId: apiOrder.user_id || apiOrder.userId || 0,
    pharmacyId: apiOrder.pharmacy_id || apiOrder.pharmacyId || 0,
    pharmacyName: apiOrder.pharmacy_name || apiOrder.pharmacyName || (apiOrder as any).pharmacy?.name || '',
    branchName: (apiOrder as any).pharmacy?.branch_name || (apiOrder as any).pharmacy_branch?.branch_name || (apiOrder as any).branch_name || undefined,
    pharmacyPhone: apiOrder.pharmacy_phone || apiOrder.pharmacyPhone || (apiOrder as any).pharmacy_branch?.phone || (apiOrder as any).pharmacy?.phone || (apiOrder as any).branch_phone || '',
    pharmacyAddress: apiOrder.pharmacy_address || (apiOrder as any).pharmacy?.branch_address || (apiOrder as any).pharmacy_branch?.address || apiOrder.pharmacyAddress || (apiOrder as any).pharmacy?.address || '',
    pharmacyImage: (apiOrder as any).pharmacy?.image || (apiOrder as any).pharmacy?.logo,
    items: (apiOrder.items || []).map(transformOrderItem),
    subtotal: Number(apiOrder.subtotal),
    deliveryFee: Number(apiOrder.delivery_fee || apiOrder.deliveryFee || 0),
    total: Number(apiOrder.total),
    paymentMethod: apiOrder.payment_method || apiOrder.paymentMethod || 'platform',
    paymentStatus: apiOrder.payment_status || apiOrder.paymentStatus || 'pending',
    deliveryAddress: apiOrder.delivery_address || apiOrder.deliveryAddress,
    deliveryMethod: apiOrder.delivery_method || apiOrder.deliveryMethod || 'pickup',
    phoneNumber: apiOrder.phone_number || apiOrder.phoneNumber || '',
    status: apiOrder.status,
    prescriptionRequired: apiOrder.prescription_required ?? apiOrder.prescriptionRequired ?? false,
    prescriptionUploaded: apiOrder.prescription_uploaded ?? apiOrder.prescriptionUploaded ?? false,
    prescriptionUrl: apiOrder.prescription_url || apiOrder.prescriptionUrl,
    notes: apiOrder.notes,
    estimatedReadyTime: apiOrder.estimated_ready_time || apiOrder.estimatedReadyTime,
    completedAt: apiOrder.completed_at || apiOrder.completedAt,
    cancelledAt: apiOrder.cancelled_at || apiOrder.cancelledAt,
    cancellationReason: apiOrder.cancellation_reason || apiOrder.cancellationReason,
    createdAt: apiOrder.created_at || apiOrder.createdAt || new Date().toISOString(),
    updatedAt: apiOrder.updated_at || apiOrder.updatedAt || new Date().toISOString(),
    statusHistory: (apiOrder.status_history || apiOrder.statusHistory || []).map(history => ({
      status: history.status,
      timestamp: (history as any).created_at || history.timestamp || new Date().toISOString(),
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
    statusHistory: (apiTracking.status_history || apiTracking.statusHistory || []).map(history => ({
      status: history.status,
      timestamp: history.timestamp,
      note: history.note,
    })),
    currentStep: apiTracking.current_step || apiTracking.currentStep || 0,
    estimatedDelivery: apiTracking.estimated_delivery || apiTracking.estimatedDelivery,
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
    drugs: (apiPrescription.drugs || []).map(drug => ({
      id: drug.id,
      prescription_id: drug.prescription_id,
      drug_id: drug.drug_id,
      drug_name: drug.drug_name,
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

