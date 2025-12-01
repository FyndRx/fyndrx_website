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
    if ('data' in response && response.data !== undefined) {
      return response.data as T;
    }
    // Handle paginated responses
    if ('data' in response && Array.isArray((response as any).data)) {
      return (response as any).data as T;
    }
    // Handle object responses like { pharmacies: [...] }
    const keys = Object.keys(response);
    if (keys.length === 1 && Array.isArray((response as any)[keys[0]])) {
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
  return {
    id: apiMed.id,
    drug_name: apiMed.drug_name,
    description: apiMed.description ?? '',
    brands: apiMed.brands ?? [],
    forms: apiMed.forms ?? [],
    image: apiMed.image ?? '',
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
    drug_brand_id: apiPrice.drug_brand_id,
    drug_brand_form_id: apiPrice.drug_brand_form_id || apiPrice.formId || 0,
    dosage_id: apiPrice.dosage_id || apiPrice.strengthId || 0,
    strength_uom_id: apiPrice.strength_uom_id || apiPrice.uomId || 0,
    price: apiPrice.price,
    discount_price: apiPrice.discount_price || apiPrice.discountPrice,
    stock_quantity: apiPrice.stock_quantity,
    in_stock: apiPrice.in_stock ?? apiPrice.inStock ?? false,
    created_at: apiPrice.created_at,
    updated_at: apiPrice.updated_at,
    pharmacy: normalizedPharmacy,
    pharmacy_branch: normalizedBranch,
    pharmacy_name: apiPrice.pharmacy_name,
    pharmacy_logo: apiPrice.pharmacy_logo,
    pharmacy_address: apiPrice.pharmacy_address,
    distance: apiPrice.distance,
    rating: apiPrice.rating,
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
  const strength = apiItem.strength;
  const uom = apiItem.uom;

  return {
    id: String(apiItem.id),
    medicationId: apiItem.drug_id,
    medicationName: medication?.drug_name || '',
    pharmacyId: pharmacy?.id || 0,
    pharmacyName: pharmacy?.name || '',
    pharmacyLogo: pharmacy?.logo,
    pharmacyBranchId: apiItem.pharmacy_branch_id,
    brandId: apiItem.drug_brand_id,
    brandName: brand?.name,
    formId: apiItem.drug_brand_form_id,
    formName: form?.form_name || '',
    strengthId: apiItem.dosage_id,
    strength: strength?.strength || '',
    uomId: apiItem.strength_uom_id,
    uom: uom?.uom || '',
    quantity: apiItem.quantity,
    price: apiItem.price,
    discountPrice: apiItem.discount_price,
    image: medication?.image,
    inStock: true, // Default to true if not provided
    requiresPrescription: medication?.requires_prescription,
  };
}

export function transformCart(apiCart: CartApiResponse): Cart {
  return {
    items: apiCart.items.map(transformCartItem),
    totalItems: apiCart.total_items || apiCart.totalItems || apiCart.items.length,
    subtotal: apiCart.subtotal,
    discount: apiCart.discount || 0,
    total: apiCart.total,
  };
}

/**
 * Order Transformers
 */
export function transformOrderItem(apiItem: OrderItemApiResponse): OrderItem {
  const medication = apiItem.medication;
  const brand = apiItem.brand;
  const form = apiItem.form;
  const strength = apiItem.strength;
  const uom = apiItem.uom;

  return {
    id: String(apiItem.id),
    medicationId: apiItem.drug_id,
    medicationName: medication?.drug_name || '',
    brandId: apiItem.drug_brand_id,
    brandName: brand?.name,
    formId: apiItem.drug_brand_form_id,
    formName: form?.form_name || '',
    strengthId: apiItem.dosage_id,
    strength: strength?.strength || '',
    uomId: apiItem.strength_uom_id,
    uom: uom?.uom || '',
    quantity: apiItem.quantity,
    price: apiItem.price,
    discountPrice: apiItem.discount_price,
    image: medication?.image,
  };
}

export function transformOrder(apiOrder: OrderApiResponse): Order {
  return {
    id: String(apiOrder.id),
    orderNumber: apiOrder.order_number || apiOrder.orderNumber || '',
    userId: apiOrder.user_id || apiOrder.userId || 0,
    pharmacyId: apiOrder.pharmacy_id || apiOrder.pharmacyId || 0,
    pharmacyName: apiOrder.pharmacy_name || apiOrder.pharmacyName || '',
    pharmacyPhone: apiOrder.pharmacy_phone || apiOrder.pharmacyPhone || '',
    pharmacyAddress: apiOrder.pharmacy_address || apiOrder.pharmacyAddress || '',
    items: apiOrder.items.map(transformOrderItem),
    subtotal: apiOrder.subtotal,
    deliveryFee: apiOrder.delivery_fee || apiOrder.deliveryFee || 0,
    total: apiOrder.total,
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
  };
}

export function transformOrders(apiOrders: OrderApiResponse[]): Order[] {
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
    id: String(apiPrescription.id),
    patientId: String(apiPrescription.user_id || apiPrescription.userId || ''),
    providerId: '',
    medication: '',
    dosage: '',
    frequency: '',
    startDate: new Date(apiPrescription.created_at || apiPrescription.createdAt || new Date()),
    endDate: undefined,
    refills: 0,
    status: normalizePrescriptionStatus(apiPrescription.status),
    notes: apiPrescription.notes,
    createdAt: new Date(apiPrescription.created_at || apiPrescription.createdAt || new Date()),
    updatedAt: new Date(apiPrescription.updated_at || apiPrescription.updatedAt || new Date()),
  };
}

export function transformPrescriptions(apiPrescriptions: PrescriptionApiResponse[]): Prescription[] {
  return apiPrescriptions.map(transformPrescription);
}

