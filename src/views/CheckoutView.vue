<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore } from '@/store/settings';
import { useNotification } from '@/composables/useNotification';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { pharmacyService } from '@/services/pharmacyService';
import type { PharmacyDeliveryOptions } from '@/models/Pharmacy';
import { formatCurrency } from '@/utils/currency';
import type { CartPharmacyGroup } from '@/models/Cart';
import LazyImage from '@/components/LazyImage.vue';
import CustomCheckbox from '@/components/CustomCheckbox.vue';
import OrderTrackingMap from '@/components/OrderTrackingMap.vue';
import { authService } from '@/services/auth.service';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();
const notification = useNotification();

const selectedBranchIds = ref<string[]>([]);
const pharmaciesCheckout = computed<CartPharmacyGroup[]>(() => {
  return cartStore.groupedByPharmacy.filter(group => 
    selectedBranchIds.value.includes(group.pharmacyBranchId)
  );
});
const deliveryMethods = ref<Map<string, 'pickup' | 'delivery'>>(new Map());
const deliveryProviders = ref<Map<string, 'pharmacy' | 'fyndrx'>>(new Map());
const deliveryOptionsCache = ref<Map<string, PharmacyDeliveryOptions>>(new Map());
const loadingDeliveryOptions = ref<Map<string, boolean>>(new Map());
const deliveryAddress = ref('');
const defaultUserAddress = ref('');
const phoneNumber = ref('');
const prescriptionFiles = ref<Map<string, File>>(new Map());
const prescriptionPreviews = ref<Map<string, string>>(new Map());
const paymentMethods = ref<Map<string, 'platform' | 'direct'>>(new Map());
const loading = ref(false);
const error = ref<string | null>(null);
const deliveryLat = ref<number | undefined>();
const deliveryLng = ref<number | undefined>();

// Bookmark Preset Address States
const isAddingAddress = ref(false);
const newAddressLabel = ref('');
const isSavingAddress = ref(false);
const userAddresses = ref<any[]>([]);
const selectedAddressId = ref<number | null>(null);

const loadUserAddresses = async () => {
  try {
    const res = await authService.getAddresses();
    userAddresses.value = res || [];
    
    // Auto-select default if none is currently selected
    if (userAddresses.value.length > 0 && !selectedAddressId.value) {
      const defAddr = userAddresses.value.find((addr: any) => addr.is_default);
      if (defAddr) {
        selectBookmarkedAddress(defAddr);
      }
    }
  } catch (err) {
    console.error('Failed to load preset addresses:', err);
  }
};

const selectBookmarkedAddress = (addr: any) => {
  selectedAddressId.value = addr.id;
  deliveryAddress.value = addr.google_address;
  deliveryLat.value = Number(addr.latitude);
  deliveryLng.value = Number(addr.longitude);
};

const saveNewAddressBookmark = async () => {
  if (!newAddressLabel.value.trim() || !deliveryAddress.value.trim()) return;
  
  isSavingAddress.value = true;
  try {
    const payload = {
      label: newAddressLabel.value.trim(),
      google_address: deliveryAddress.value.trim(),
      latitude: deliveryLat.value,
      longitude: deliveryLng.value,
      is_default: userAddresses.value.length === 0
    };
    
    const res = await authService.addAddress(payload);
    notification.success('Success', 'Address bookmarked successfully!');
    
    // Clear and reload
    newAddressLabel.value = '';
    isAddingAddress.value = false;
    await loadUserAddresses();

    if (res && res.id) {
      selectedAddressId.value = res.id;
    } else if (userAddresses.value.length > 0) {
      selectedAddressId.value = userAddresses.value[userAddresses.value.length - 1].id;
    }
  } catch (err: any) {
    notification.error('Error', err?.response?.data?.message || 'Failed to bookmark address.');
  } finally {
    isSavingAddress.value = false;
  }
};

// Creative Care-Sender Delivery Mode states
const isOrderingForSomeoneElse = ref(false);
const recipientName = ref('');
const recipientPhoneNumber = ref('');

// Create a computed property to avoid inline object reference changes triggering unnecessary map re-renders
const deliveryLocationObj = computed(() => {
  if (deliveryLat.value && deliveryLng.value) {
    return { lat: deliveryLat.value, lng: deliveryLng.value };
  }
  return undefined;
});

const onLocationSelected = (payload: { lat: number; lng: number; address: string }) => {
  deliveryLat.value = payload.lat;
  deliveryLng.value = payload.lng;
  
  // Only update address string if it is a real address and not empty!
  if (payload.address && payload.address.trim() !== '') {
    deliveryAddress.value = payload.address;
    // Reset preset selector since they clicked/dragged a new spot
    selectedAddressId.value = null;
  }
};

const totalAmount = computed(() => {
  return pharmaciesCheckout.value.reduce((total, pharmacy) => {
    return total + pharmacy.subtotal;
  }, 0);
});

const deliveryFee = computed(() => {
  let fee = 0;
  pharmaciesCheckout.value.forEach(pharmacy => {
    const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;
    const method = deliveryMethods.value.get(groupKey);
    if (method !== 'delivery') return;

    const provider = deliveryProviders.value.get(groupKey);
    const opts = deliveryOptionsCache.value.get(pharmacy.pharmacyId);

    if (opts && provider === 'fyndrx' && opts.fyndrxDelivery.fee !== null) {
      fee += opts.fyndrxDelivery.fee;
    } else if (opts && provider === 'pharmacy' && opts.pharmacyDelivery.fee !== null) {
      fee += opts.pharmacyDelivery.fee;
    } else {
      // Fallback to platform flat fee while options are loading
      fee += settingsStore.deliveryFeeFlat;
    }
  });
  return fee;
});

const grandTotal = computed(() => totalAmount.value + deliveryFee.value);

const needsPrescription = (pharmacyId: string) => {
  const pharmacy = pharmaciesCheckout.value.find(p => p.pharmacyId === pharmacyId);
  return pharmacy?.items.some(item => item.requiresPrescription) || false;
};

const syncCartWithAPI = async () => {
  try {
    // Sync local cart with API before checkout
    const cartItems = cartStore.items;
    if (cartItems.length > 0) {
      const syncItems = cartItems
        .filter(item => item.pharmacyDrugPriceId !== undefined)
        .map(item => ({
          pharmacy_drug_price_id: String(item.pharmacyDrugPriceId),
          quantity: item.quantity
        }));
      
      if (syncItems.length > 0) {
        await cartService.syncCart(syncItems);
      }
    }
  } catch (err) {
    console.error('Error syncing cart:', err);
  }
};

// Pre-populate payment and delivery method defaults whenever pharmacies change
watch(pharmaciesCheckout, (newPharmacies) => {
  newPharmacies.forEach(pharmacy => {
    const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;

    const effective = effectivePaymentMethods(pharmacy);
    const currentMethod = paymentMethods.value.get(groupKey);

    if (!currentMethod || !effective.includes(currentMethod)) {
      if (effective.includes('platform')) {
        paymentMethods.value.set(groupKey, 'platform');
      } else if (effective.includes('direct')) {
        paymentMethods.value.set(groupKey, 'direct');
      }
    }

    if (!deliveryMethods.value.has(groupKey)) {
      deliveryMethods.value.set(groupKey, 'pickup');
    }
  });
}, { immediate: true });

onMounted(async () => {
  const pharmacyIdsParam = route.query.pharmacies as string;
  if (pharmacyIdsParam) {
    selectedBranchIds.value = pharmacyIdsParam.split(',').map(id => id.trim());
    
    if (route.query.lat) deliveryLat.value = Number(route.query.lat);
    if (route.query.lng) deliveryLng.value = Number(route.query.lng);
    if (route.query.address) deliveryAddress.value = route.query.address as string;
    await syncCartWithAPI();
    
    // Get updated cart from API via the store's own action
    await cartStore.syncWithAPI();


    // Pre-populate user details
    if (authStore.user) {
      if (!phoneNumber.value) phoneNumber.value = authStore.user.phone_number || '';
      await loadUserAddresses();
      
      if (!deliveryAddress.value && userAddresses.value.length === 0) {
        deliveryAddress.value = authStore.user.address || '';
        defaultUserAddress.value = authStore.user.address || '';
      }
    }
  } else {
    router.push({ name: 'cart' });
  }
});

const handlePrescriptionUpload = (pharmacyId: string, event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const file = target.files[0];
    
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      error.value = 'Please upload a PDF, JPEG, or PNG file';
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      error.value = 'File size should be less than 5MB';
      return;
    }
    
    prescriptionFiles.value.set(pharmacyId, file);
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        prescriptionPreviews.value.set(pharmacyId, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      prescriptionPreviews.value.set(pharmacyId, 'pdf');
    }
    
    error.value = null;
  }
};

const removePrescription = (pharmacyId: string) => {
  prescriptionFiles.value.delete(pharmacyId);
  prescriptionPreviews.value.delete(pharmacyId);
  
  const fileInput = document.querySelector(`#prescription-${pharmacyId}`) as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const createdOrders = ref<any[]>([]); // To store created orders
const showSuccess = ref(false);
const selectedOrderIds = ref<string[]>([]);
const bulkPaymentLoading = ref(false);

const selectableOrders = computed(() => {
  return createdOrders.value.filter(order => 
    order.paymentMethod === 'platform' && order.paymentStatus === 'pending'
  );
});

const isAllSelected = computed(() => {
  return selectableOrders.value.length > 0 && 
         selectedOrderIds.value.length === selectableOrders.value.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedOrderIds.value = [];
  } else {
    selectedOrderIds.value = selectableOrders.value.map(order => order.id);
  }
};

const selectedTotal = computed(() => {
  return createdOrders.value
    .filter(order => selectedOrderIds.value.includes(order.id))
    .reduce((total, order) => total + Number(order.total), 0);
});

const branchSupportsDelivery = (pharmacy: CartPharmacyGroup): boolean => {
  // Delivery requires online (platform) payment — both globally and at branch level
  if (!settingsStore.onlinePaymentEnabled) return false;
  const accepted = pharmacy.acceptedPaymentMethods;
  if (!accepted || accepted.length === 0) return false;
  return accepted.includes('platform');
};

// Returns only the methods that are both globally enabled AND accepted by the branch.
const effectivePaymentMethods = (pharmacy: CartPharmacyGroup): ('platform' | 'direct')[] => {
  const branchMethods = pharmacy.acceptedPaymentMethods ?? ['platform', 'direct'];
  return settingsStore.enabledPaymentMethods.filter(m => branchMethods.includes(m));
};

const showDeliveryAddressInput = computed(() => {
  for (const method of deliveryMethods.value.values()) {
    if (method === 'delivery') return true;
  }
  return false;
});

const fetchUserLocation = async () => {
  if (!navigator.geolocation) {
    notification.error('Geolocation Error', 'Your browser does not support geolocation.');
    return;
  }

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
    });
    
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    
    deliveryLat.value = lat;
    deliveryLng.value = lng;
    
    // Reverse geocode to update the address description automatically
    if ((window as any).google && (window as any).google.maps) {
      const geocoder = new (window as any).google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
        if (status === 'OK' && results[0]) {
          deliveryAddress.value = results[0].formatted_address;
          selectedAddressId.value = null; // Unselect any bookmark preset
        }
      });
    }
  } catch (err) {
    console.warn('Failed to get user location:', err);
    notification.warning('Location Access', 'We could not automatically detect your location. Please ensure your GPS is on.');
  }
};

// Watch for delivery selection to trigger location fetch
watch(showDeliveryAddressInput, (isDelivery) => {
  if (isDelivery && !deliveryLat.value) {
    fetchUserLocation();
  }
});

const fetchDeliveryOptions = async (pharmacyId: string) => {
  if (loadingDeliveryOptions.value.get(pharmacyId)) return;
  loadingDeliveryOptions.value.set(pharmacyId, true);
  try {
    const opts = await pharmacyService.getDeliveryOptions(
      pharmacyId,
      deliveryLat.value,
      deliveryLng.value
    );
    deliveryOptionsCache.value.set(pharmacyId, opts);

    // Auto-select the best available provider
    const pharmacy = pharmaciesCheckout.value.find(p => p.pharmacyId === pharmacyId);
    if (!pharmacy) return;
    const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;
    if (!deliveryProviders.value.has(groupKey)) {
      if (opts.fyndrxDelivery.available) {
        deliveryProviders.value.set(groupKey, 'fyndrx');
      } else if (opts.pharmacyDelivery.available) {
        deliveryProviders.value.set(groupKey, 'pharmacy');
      }
    }
  } catch (e) {
    console.warn('Failed to fetch delivery options for pharmacy', pharmacyId, e);
  } finally {
    loadingDeliveryOptions.value.set(pharmacyId, false);
  }
};

// Re-fetch delivery options when delivery method changes to 'delivery'
watch(deliveryMethods, (methods) => {
  methods.forEach((method, key) => {
    if (method === 'delivery') {
      const pharmacy = pharmaciesCheckout.value.find(
        p => (p.pharmacyBranchId || p.pharmacyId) === key
      );
      if (pharmacy) {
        fetchDeliveryOptions(pharmacy.pharmacyId);
      }
    }
  });
}, { deep: true });

// Re-fetch when user location is updated
watch([deliveryLat, deliveryLng], () => {
  pharmaciesCheckout.value.forEach(pharmacy => {
    const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;
    if (deliveryMethods.value.get(groupKey) === 'delivery') {
      fetchDeliveryOptions(pharmacy.pharmacyId);
    }
  });
});

const validateCheckout = () => {
  if (showDeliveryAddressInput.value && !deliveryAddress.value.trim()) {
    const msg = 'Please provide a delivery address for your delivery orders.';
    error.value = msg;
    notification.error('Delivery Address Required', msg);
    return false;
  }

  if (showDeliveryAddressInput.value && isOrderingForSomeoneElse.value) {
    if (!recipientName.value.trim()) {
      const msg = "Please enter the recipient's name.";
      error.value = msg;
      notification.error('Recipient Name Required', msg);
      return false;
    }
    if (!recipientPhoneNumber.value.trim()) {
      const msg = "Please enter the recipient's phone number.";
      error.value = msg;
      notification.error('Recipient Phone Required', msg);
      return false;
    }
  }

  if (!phoneNumber.value.trim()) {
    const msg = 'Please provide your phone number';
    error.value = msg;
    notification.error('Phone Number Required', msg);
    return false;
  }

  for (const pharmacy of pharmaciesCheckout.value) {
    const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;

    const deliveryMethod = deliveryMethods.value.get(groupKey);
    if (deliveryMethod === 'delivery') {
      if (!deliveryProviders.value.has(groupKey)) {
        const msg = `Please select a delivery provider for ${pharmacy.pharmacyName}.`;
        error.value = msg;
        notification.error('Delivery Provider Required', msg);
        return false;
      }
      if (needsPrescription(pharmacy.pharmacyId) && !prescriptionFiles.value.has(pharmacy.pharmacyId)) {
        const msg = `Please upload a prescription for ${pharmacy.pharmacyName} (required for delivery).`;
        error.value = msg;
        notification.error('Prescription Required', msg);
        return false;
      }
    }

    if (!paymentMethods.value.has(groupKey)) {
      const msg = `Please select a payment method for ${pharmacy.pharmacyName}`;
      error.value = msg;
      notification.error('Payment Method Required', msg);
      return false;
    }
  }

  return true;
};

const checkoutPharmacyLocations = computed(() => {
  return pharmaciesCheckout.value
    .filter(p => {
      const groupKey = p.pharmacyBranchId || p.pharmacyId;
      return p.latitude && p.longitude && deliveryMethods.value.get(groupKey) === 'delivery';
    })
    .map(p => ({
      lat: Number(p.latitude),
      lng: Number(p.longitude),
      name: p.branchName ? `${p.pharmacyName} - ${p.branchName}` : p.pharmacyName
    }));
});

const placeAllOrders = async () => {
  if (!validateCheckout()) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const paymentMethodsMap: Record<string, 'platform' | 'direct'> = {};
    const deliveryMethodsMap: Record<string, 'pickup' | 'delivery'> = {};
    const deliveryProvidersMap: Record<string, 'pharmacy' | 'fyndrx'> = {};

    pharmaciesCheckout.value.forEach(p => {
      const keyId = p.pharmacyBranchId || p.pharmacyId;
      if (keyId) {
        paymentMethodsMap[keyId] = paymentMethods.value.get(keyId) || 'platform';
        deliveryMethodsMap[keyId] = deliveryMethods.value.get(keyId) || 'pickup';
        const provider = deliveryProviders.value.get(keyId);
        if (provider && deliveryMethodsMap[keyId] === 'delivery') {
          deliveryProvidersMap[keyId] = provider;
        }
      }
    });

    const isDeliveryActive = showDeliveryAddressInput.value;
    const finalPhoneNumber = (isDeliveryActive && isOrderingForSomeoneElse.value && recipientPhoneNumber.value.trim())
      ? recipientPhoneNumber.value.trim()
      : phoneNumber.value;

    const baseNotes = 'Please handle with care';
    const finalNotes = (isDeliveryActive && isOrderingForSomeoneElse.value)
      ? `[Care-Sender Order] Recipient: ${recipientName.value.trim()} (${recipientPhoneNumber.value.trim()}) | Notes: ${baseNotes}`
      : (isDeliveryActive ? baseNotes : undefined);

    const orderPayload = {
      pharmacy_branch_id: null,
      payment_methods: paymentMethodsMap,
      delivery_methods: deliveryMethodsMap,
      delivery_providers: Object.keys(deliveryProvidersMap).length > 0 ? deliveryProvidersMap : undefined,
      delivery_address: isDeliveryActive ? deliveryAddress.value : undefined,
      delivery_lat: deliveryLat.value,
      delivery_lng: deliveryLng.value,
      phone_number: finalPhoneNumber,
      notes: finalNotes
    };

    const result = await orderService.createOrder(orderPayload);
    // ... rest of logic same ...
    
    // Normalize result to array
    const orders = Array.isArray(result) ? result : [result];
    createdOrders.value = orders;

    // Upload prescriptions for each order
    for (const order of orders) {
      // Find which pharmacy this order belongs to (by matching pharmacy name or ID if strictly linked)
      // We can map pharmacyId -> file
      // result order has pharmacyId
      const file = prescriptionFiles.value.get(String(order.pharmacyId));
      if (file) {
        try {
          await orderService.uploadPrescription(order.id, file);
          order.prescriptionUploaded = true;
        } catch (e) {
          console.error(`Failed to upload prescription for order ${order.orderNumber}`, e);
        }
      }
    }

    // Clear cart for these pharmacies
    pharmaciesCheckout.value.forEach(p => {
      cartStore.clearPharmacyItems(p.pharmacyId);
    });

    showSuccess.value = true;
    notification.success('Orders Placed Successfully!', `Successfully created ${orders.length} orders.`);

  } catch (err: any) {
    console.error('Error placing orders:', err);
    const fieldErrors: string[] = err.errors
      ? (Object.values(err.errors as Record<string, string[]>)).flat()
      : [];
    const msg = fieldErrors.length
      ? fieldErrors.join(' ')
      : err.message || 'Failed to place orders. Please try again.';
    error.value = msg;
    notification.error('Order Failed', msg);
  } finally {
    loading.value = false;
  }
};

function estimatedTaxFor(): number {
  if (!settingsStore.taxEnabled) return 0;
  const base = grandTotal.value;
  return Math.round(base * settingsStore.taxRate / (1 + settingsStore.taxRate) * 100) / 100;
}

const payNow = async (orderId: string | string[]) => {
  const isBulk = Array.isArray(orderId);
  if (isBulk) bulkPaymentLoading.value = true;
  else loading.value = true;

  try {
    const paymentResponse = await paymentService.initializePayment(orderId);
    const url = paymentResponse.authorization_url;
    if (!url || !url.startsWith('https://checkout.paystack.com')) {
      throw new Error('Invalid payment redirect URL');
    }
    window.location.href = url;
  } catch (err: any) {
    console.error('Payment initialization failed:', err);
    const errList: string[] = Array.isArray(err.errors)
      ? err.errors
      : err.errors && typeof err.errors === 'object'
        ? (Object.values(err.errors) as string[][]).flat()
        : [];
    const title = err.message || 'Payment Error';
    const detail = errList.length ? errList.join(' ') : 'Failed to initialize payment. Please try again.';
    notification.error(title, detail);
  } finally {
    if (isBulk) bulkPaymentLoading.value = false;
    else loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
      <!-- Success State -->
      <div v-if="showSuccess" class="max-w-3xl mx-auto text-center">
        <div class="mb-8">
          <div class="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Orders Placed Successfully!</h1>
          <p class="text-gray-600 dark:text-gray-300">
            We have received your orders. Detailed tracking information is available on your dashboard.
          </p>
        </div>

        <div class="space-y-6 text-left">
          <div v-if="selectableOrders.length > 1" class="flex justify-between items-center mb-6 px-2">
            <CustomCheckbox 
              :modelValue="isAllSelected" 
              @update:modelValue="toggleSelectAll"
              label="Select all for online payment"
              size="medium"
              color="primary"
            />
          </div>

          <div v-for="order in createdOrders" :key="order.id" class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg relative overflow-hidden group">
            <!-- Selection Checkbox -->
            <div v-if="order.paymentMethod === 'platform' && order.paymentStatus === 'pending'" class="absolute top-6 right-6 z-10">
              <CustomCheckbox 
                v-model="selectedOrderIds"
                :value="order.id"
                size="large"
              />
            </div>

            <div class="flex items-start gap-4 mb-4 pr-10">
              <!-- Pharmacy Logo -->
              <div class="w-12 h-12 flex-shrink-0 bg-white rounded-full border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
                <LazyImage
                  :src="order.pharmacy?.logo || '/images/pharmacies/default-pharmacy.jpg'"
                  :alt="order.pharmacyName"
                  aspectRatio="square"
                  className="w-full h-full object-contain p-1 rounded-full"
                />
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 class="font-bold text-xl text-gray-900 dark:text-white mb-1">Order #{{ order.orderNumber }}</h3>
                    <p class="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {{ order.pharmacyName }}
                      <span v-if="order.branchName" class="text-gray-400">• {{ order.branchName }}</span>
                    </p>
                  </div>
                  <span :class="[
                    'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap',
                    order.paymentMethod === 'platform' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  ]">
                    {{ order.paymentMethod === 'platform' ? 'Pay Online' : 'Pay at Pharmacy' }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex items-center justify-between border-t border-gray-50 dark:border-gray-700/50 pt-5 mt-2">
              <span class="text-gray-600 dark:text-gray-400 font-medium">Total Amount</span>
              <span class="text-2xl font-black text-[#246BFD]">{{ formatCurrency(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Bulk Payment Summary -->
        <div v-if="selectedOrderIds.length > 1" class="mt-8 p-8 bg-gradient-to-br from-[#246BFD]/5 to-[#246BFD]/10 dark:from-[#246BFD]/10 dark:to-transparent rounded-3xl border-2 border-[#246BFD] border-dashed text-center shadow-xl shadow-blue-500/5">
          <div class="inline-flex items-center justify-center w-12 h-12 bg-[#246BFD] text-white rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
          </div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white mb-1">Pay for {{ selectedOrderIds.length }} Orders</h2>
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">Process a single combined payment for all selected items</p>
          
          <div class="flex items-center justify-center gap-2 mb-8">
            <span class="text-gray-500 text-sm font-medium">Total:</span>
            <span class="text-4xl font-black text-[#246BFD]">{{ formatCurrency(selectedTotal) }}</span>
          </div>

          <button 
            @click="payNow(selectedOrderIds)"
            :disabled="bulkPaymentLoading"
            class="w-full sm:w-auto px-16 py-4 bg-[#246BFD] hover:bg-[#1a5ce5] text-white rounded-2xl font-bold shadow-2xl shadow-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center mx-auto"
          >
            <span v-if="bulkPaymentLoading" class="flex items-center">
              <svg class="w-5 h-5 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing Payment...
            </span>
            <span v-else>Securely Pay All Selected</span>
          </button>
        </div>

        <!-- Individual Pay Now Button if only one selected or no selection -->
        <div v-else-if="selectedOrderIds.length === 1" class="mt-8">
           <button 
             @click="payNow(selectedOrderIds[0])"
             class="w-full sm:w-auto px-16 py-4 bg-[#246BFD] hover:bg-[#1a5ce5] text-white rounded-2xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center mx-auto"
           >
             Pay for Order #{{ createdOrders.find(o => o.id === selectedOrderIds[0])?.orderNumber }}
           </button>
        </div>

        <!-- Action Links -->
        <div class="mt-12 flex justify-center space-x-6">
          <button @click="router.push({ name: 'orders' })" class="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium">
            View My Orders
          </button>
          <button @click="router.push('/')" class="px-6 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 font-medium">
            Back to Home
          </button>
        </div>
      </div>

      <!-- Checkout Form -->
      <div v-else>
        <div class="mb-8">
          <h1 class="mb-2 text-3xl font-medium text-gray-900 dark:text-white">Checkout</h1>
          <p class="text-gray-600 dark:text-gray-300">Complete your order</p>
        </div>
  
        <div v-if="error" class="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <div class="flex items-center">
            <svg class="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <span class="text-red-800 dark:text-red-300">{{ error }}</span>
          </div>
        </div>
  
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div class="lg:col-span-2 space-y-6">
            <!-- Unified Delivery Card (Visible only if showDeliveryAddressInput is true) -->
            <transition
              enter-active-class="transition-all duration-300 ease-out"
              leave-active-class="transition-all duration-200 ease-in"
              enter-from-class="max-h-0 opacity-0 scale-95"
              enter-to-class="max-h-[1000px] opacity-100 scale-100"
              leave-from-class="max-h-[1000px] opacity-100 scale-100"
              leave-to-class="max-h-0 opacity-0 scale-95"
            >
              <div v-if="showDeliveryAddressInput" class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/60 space-y-5">
                <h3 class="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <svg class="w-5 h-5 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Delivery Destination
                </h3>
                
                <div class="space-y-4">
                  <!-- Geocoded Address Textarea -->
                  <div class="text-left">
                    <label class="block mb-2 text-xs font-black uppercase text-gray-500">
                      Address Description <span class="text-red-500">*</span>
                    </label>
                    <textarea
                      v-model="deliveryAddress"
                      rows="2"
                      readonly
                      placeholder="Use the map to select a delivery location"
                      class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-500 dark:text-gray-400 cursor-not-allowed focus:outline-none select-none"
                      required
                    ></textarea>
                    <span class="block text-[10px] text-gray-400 mt-1">
                      💡 This address is automatically generated from your selected map location.
                    </span>
                  </div>

                  <!-- Bookmark Presets Selector & Add Preset Widget -->
                  <div class="space-y-2">
                    <label class="block text-xs font-black uppercase text-gray-500 text-left">
                      Address Bookmarks
                    </label>
                    <div class="flex flex-wrap gap-2 items-center">
                      <button
                        v-for="addr in userAddresses"
                        :key="addr.id"
                        type="button"
                        @click="selectBookmarkedAddress(addr)"
                        class="px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 focus:outline-none"
                        :class="selectedAddressId === addr.id
                          ? 'bg-[#246BFD]/10 border-[#246BFD] text-[#246BFD] font-bold shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-[#246BFD]/50'"
                      >
                        <span v-if="addr.label?.toLowerCase() === 'home'">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                        </span>
                        <span v-else-if="addr.label?.toLowerCase() === 'work'">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </span>
                        <span v-else>
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </span>
                        {{ addr.label }}
                      </button>

                      <!-- Toggle for adding new bookmark -->
                      <button 
                        type="button"
                        @click="isAddingAddress = !isAddingAddress"
                        class="px-3 py-1.5 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 text-xs font-semibold text-gray-500 hover:text-[#246BFD] hover:border-[#246BFD] flex items-center gap-1 transition-all focus:outline-none"
                      >
                        <svg v-if="isAddingAddress" class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        <svg v-else class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
                        {{ isAddingAddress ? 'Cancel' : 'New Bookmark' }}
                      </button>
                    </div>

                    <!-- Expansion Card for Saving New Preset Address -->
                    <transition
                      enter-active-class="transition-all duration-300 ease-out"
                      leave-active-class="transition-all duration-200 ease-in"
                      enter-from-class="max-h-0 opacity-0 scale-95"
                      enter-to-class="max-h-[150px] opacity-100 scale-100"
                      leave-from-class="max-h-[150px] opacity-100 scale-100"
                      leave-to-class="max-h-0 opacity-0 scale-95"
                    >
                      <div v-if="isAddingAddress" class="p-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700/60 rounded-xl space-y-2.5 text-left overflow-hidden">
                        <div class="flex items-center gap-2">
                          <input 
                            v-model="newAddressLabel"
                            type="text"
                            placeholder="E.g. Home, Office, Mom's House"
                            class="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                          />
                          <button
                            type="button"
                            @click="saveNewAddressBookmark"
                            :disabled="isSavingAddress || !newAddressLabel.trim() || !deliveryAddress.trim()"
                            class="px-3 py-1.5 bg-[#246BFD] hover:bg-[#246BFD]/90 disabled:bg-gray-300 text-white rounded-lg text-xs font-bold transition-all focus:outline-none"
                          >
                            {{ isSavingAddress ? 'Saving...' : 'Save Preset' }}
                          </button>
                        </div>
                        <span class="block text-[9px] text-gray-400">
                          💡 This will bookmark the current geocoded spot & address text to your account.
                        </span>
                      </div>
                    </transition>
                  </div>

                  <!-- Temporary Destination & Direct Recipient Details Widget -->
                  <div class="p-4 rounded-xl bg-gradient-to-br from-[#246BFD]/5 to-transparent border border-[#246BFD]/15 dark:border-[#246BFD]/10 backdrop-blur-md relative overflow-hidden transition-all duration-300">
                    <div class="flex items-center justify-between mb-2">
                      <div class="flex items-center gap-2">
                        <div class="w-8 h-8 rounded-lg bg-[#246BFD]/10 text-[#246BFD] flex items-center justify-center">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <div>
                          <h4 class="text-sm font-bold text-gray-900 dark:text-white text-left">Custom Recipient or Temporary Spot?</h4>
                          <p class="text-xs text-gray-500 text-left">Deliver to someone else or a temporary location</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        @click="isOrderingForSomeoneElse = !isOrderingForSomeoneElse"
                        class="px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-300 focus:outline-none"
                        :class="isOrderingForSomeoneElse 
                          ? 'bg-[#246BFD] border-[#246BFD] text-white shadow-sm'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-[#246BFD]'"
                      >
                        {{ isOrderingForSomeoneElse ? 'Custom Details' : 'Use Default' }}
                      </button>
                    </div>

                    <transition
                      enter-active-class="transition-all duration-300 ease-out"
                      leave-active-class="transition-all duration-200 ease-in"
                      enter-from-class="max-h-0 opacity-0 scale-95"
                      enter-to-class="max-h-[200px] opacity-100 scale-100"
                      leave-from-class="max-h-[200px] opacity-100 scale-100"
                      leave-to-class="max-h-0 opacity-0 scale-95"
                    >
                      <div v-if="isOrderingForSomeoneElse" class="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 overflow-hidden text-left">
                        <div>
                          <label class="block mb-1 text-xs font-black uppercase text-gray-500">Contact Person Name</label>
                          <input 
                            v-model="recipientName"
                            type="text"
                            placeholder="E.g. Parent, Friend, or My Temporary Name"
                            class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                          />
                        </div>
                        <div>
                          <label class="block mb-1 text-xs font-black uppercase text-gray-500">Delivery Contact Phone</label>
                          <input 
                            v-model="recipientPhoneNumber"
                            type="tel"
                            placeholder="+233 XX XXX XXXX"
                            class="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                          />
                        </div>
                      </div>
                    </transition>
                  </div>

                  <!-- Google Map Picker Compact Preview -->
                  <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                      <span class="font-medium text-gray-500">Geocoded GPS Coordinates</span>
                      <button 
                        @click="fetchUserLocation" 
                        class="font-bold text-[#246BFD] flex items-center gap-1 hover:underline focus:outline-none"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        Use My Location
                      </button>
                    </div>
                    
                    <div class="h-[400px] w-full rounded-2xl overflow-hidden border border-gray-150 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-900/10">
                      <OrderTrackingMap 
                        :pharmacyLocations="checkoutPharmacyLocations"
                        :deliveryLocation="deliveryLocationObj"
                        :enableLocationPicker="true"
                        deliveryMethod="delivery"
                        class="h-full w-full"
                        @location-selected="onLocationSelected"
                      />
                    </div>
                    <span class="flex gap-1.5 text-[10px] text-gray-400 leading-normal text-left items-start mt-2">
                      <svg class="w-3.5 h-3.5 shrink-0 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                      Click map or drag red marker to update delivery GPS spot in real-time.
                    </span>
                  </div>
                </div>
              </div>
            </transition>
            <!-- Pharmacies List -->
            <div
              v-for="pharmacy in pharmaciesCheckout"
              :key="pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId"
              class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl"
            >
              <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-gray-700/50 gap-4">
                <div class="flex items-center space-x-4">
                  <div class="w-16 h-16 p-1.5 overflow-hidden bg-white dark:bg-gray-700 rounded-full shadow-sm border border-gray-100 dark:border-gray-600">
                    <LazyImage
                      :src="pharmacy.pharmacyLogo || '/images/pharmacies/default-pharmacy.jpg'"
                      :alt="pharmacy.pharmacyName"
                      aspectRatio="square"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h3 class="text-xl font-black text-gray-900 dark:text-white">{{ pharmacy.pharmacyName }}</h3>
                    <p v-if="pharmacy.branchName" class="text-sm font-semibold text-[#246BFD] mt-0.5">{{ pharmacy.branchName }}</p>
                    <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                      Processing {{ pharmacy.items.length }} {{ pharmacy.items.length === 1 ? 'Product' : 'Products' }}
                    </p>
                  </div>
                </div>
                <div class="w-full sm:w-auto p-4 sm:p-0 bg-blue-50/50 dark:bg-[#246BFD]/5 rounded-2xl sm:bg-transparent border border-blue-100/50 sm:border-0 text-center sm:text-right">
                  <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">Order Subtotal</p>
                  <p class="text-2xl font-black text-[#246BFD]">{{ formatCurrency(pharmacy.subtotal) }}</p>
                </div>
              </div>

              <div class="mb-6 space-y-3">
                <div
                  v-for="item in pharmacy.items"
                  :key="item.id"
                  class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <!-- Item details... -->
                   <div class="flex items-center space-x-3">
                    <div class="w-12 h-12 overflow-hidden bg-white dark:bg-gray-800 rounded-lg">
                      <LazyImage
                        v-if="item.image"
                        :src="item.image"
                        :alt="item.medicationName"
                        aspectRatio="square"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div class="flex-1">
                      <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight mb-1">{{ item.medicationName }}</p>
                      <div class="flex items-center gap-3">
                        <span class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-bold text-gray-600 dark:text-gray-400">
                          QTY: {{ item.quantity }}
                        </span>
                        <span class="text-xs font-medium text-gray-500">
                          @ {{ formatCurrency(item.discountPrice || item.price) }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ formatCurrency((item.discountPrice || item.price) * item.quantity) }}
                  </span>
                </div>
              </div>

              <!-- Delivery Option Selector -->
              <div class="mb-6">
                <label class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Delivery Option
                </label>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
                  <button
                    @click="deliveryMethods.set(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId, 'pickup')"
                    :class="[
                      'p-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                      deliveryMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'pickup'
                        ? 'border-[#246BFD] bg-[#246BFD]/5 text-[#246BFD]'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                    ]"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    Store Pickup
                  </button>
                  <div class="relative group">
                    <button
                      :disabled="!branchSupportsDelivery(pharmacy)"
                      @click="() => { if (branchSupportsDelivery(pharmacy)) { deliveryMethods.set(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId, 'delivery'); fetchDeliveryOptions(pharmacy.pharmacyId); } }"
                      :class="[
                        'w-full p-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center justify-center gap-2',
                        !branchSupportsDelivery(pharmacy)
                          ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 text-gray-400'
                          : deliveryMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'delivery'
                            ? 'border-[#246BFD] bg-[#246BFD]/5 text-[#246BFD]'
                            : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                      ]"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
                      Home Delivery
                    </button>
                    <div v-if="!branchSupportsDelivery(pharmacy)" class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                      Delivery requires online payment. This branch only accepts cash/POS.
                      <div class="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                    </div>
                  </div>
                </div>

                <!-- Delivery Provider Sub-selection (shown when Home Delivery is selected) -->
                <div
                  v-if="deliveryMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'delivery'"
                  class="mt-1"
                >
                  <label class="block mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Delivered by
                  </label>

                  <!-- Loading skeleton -->
                  <div v-if="loadingDeliveryOptions.get(pharmacy.pharmacyId)" class="flex gap-3">
                    <div class="flex-1 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
                    <div class="flex-1 h-20 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse"></div>
                  </div>

                  <div v-else class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <!-- FyndRx Platform Delivery -->
                    <button
                      :disabled="!deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.available"
                      @click="deliveryProviders.set(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId, 'fyndrx')"
                      :class="[
                        'p-4 rounded-xl border-2 text-left transition-all relative',
                        !deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.available
                          ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
                          : deliveryProviders.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'fyndrx'
                            ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                            : 'border-gray-200 dark:border-gray-700 hover:border-[#246BFD]/40 dark:hover:border-[#246BFD]/40'
                      ]"
                    >
                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-[#246BFD]/10 flex items-center justify-center">
                          <svg class="w-4 h-4 text-[#246BFD]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                          </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-gray-900 dark:text-white">FyndRx Delivery</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Platform logistics</p>
                          <template v-if="deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.available">
                            <p class="text-sm font-bold text-[#246BFD] mt-1">
                              GHS {{ deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.fee?.toFixed(2) ?? '—' }}
                            </p>
                          </template>
                          <template v-else>
                            <p class="text-xs text-red-500 dark:text-red-400 mt-1">
                              {{ deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.unavailableReason ?? 'Not available' }}
                            </p>
                          </template>
                        </div>
                        <div
                          v-if="deliveryProviders.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'fyndrx'"
                          class="flex-shrink-0 w-5 h-5 rounded-full bg-[#246BFD] flex items-center justify-center"
                        >
                          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        </div>
                      </div>
                    </button>

                    <!-- Pharmacy Self-delivery -->
                    <button
                      :disabled="!deliveryOptionsCache.get(pharmacy.pharmacyId)?.pharmacyDelivery.available"
                      @click="deliveryProviders.set(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId, 'pharmacy')"
                      :class="[
                        'p-4 rounded-xl border-2 text-left transition-all relative',
                        !deliveryOptionsCache.get(pharmacy.pharmacyId)?.pharmacyDelivery.available
                          ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40'
                          : deliveryProviders.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'pharmacy'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                      ]"
                    >
                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                          <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                          </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="text-sm font-semibold text-gray-900 dark:text-white">Pharmacy Delivery</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Delivered by pharmacy staff</p>
                          <template v-if="deliveryOptionsCache.get(pharmacy.pharmacyId)?.pharmacyDelivery.available">
                            <p class="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                              GHS {{ deliveryOptionsCache.get(pharmacy.pharmacyId)?.pharmacyDelivery.fee?.toFixed(2) ?? '—' }}
                            </p>
                          </template>
                          <template v-else>
                            <p class="text-xs text-red-500 dark:text-red-400 mt-1">
                              {{ deliveryOptionsCache.get(pharmacy.pharmacyId)?.pharmacyDelivery.unavailableReason ?? 'Not available' }}
                            </p>
                          </template>
                        </div>
                        <div
                          v-if="deliveryProviders.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'pharmacy'"
                          class="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"
                        >
                          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        </div>
                      </div>
                    </button>
                  </div>

                  <!-- Distance info (if available) -->
                  <p
                    v-if="deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.distanceKm !== null && deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.distanceKm !== undefined"
                    class="mt-2 text-xs text-gray-400 dark:text-gray-500"
                  >
                    ~{{ deliveryOptionsCache.get(pharmacy.pharmacyId)?.fyndrxDelivery.distanceKm?.toFixed(1) }} km from pharmacy
                  </p>
                </div>
              </div>

              <div class="mb-6">
                <label class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Payment Method
                </label>

                <!-- Global payment method disabled notices -->
                <div v-if="!settingsStore.onlinePaymentEnabled" class="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 text-xs text-amber-800 dark:text-amber-300">
                  <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span v-if="!settingsStore.offlinePaymentEnabled">
                    All payment methods are currently suspended platform-wide. Please try again later.
                  </span>
                  <span v-else>
                    Online payment is temporarily unavailable platform-wide. Only cash/POS accepted at this time.
                  </span>
                </div>
                <div v-else-if="settingsStore.paystackGatewayDown" class="mb-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/60 text-xs text-amber-800 dark:text-amber-300">
                  <svg class="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                  </svg>
                  <span>Online payments (Paystack) are temporarily unavailable. Please choose Pay at Pharmacy instead.</span>
                </div>

                <!-- Selectable methods (more than one effective option) -->
                <template v-if="effectivePaymentMethods(pharmacy).length > 1">
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      @click="paymentMethods.set(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId, 'platform')"
                      :class="[
                        'p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
                        paymentMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'platform'
                          ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      ]"
                    >
                      <div class="flex items-start space-x-3">
                        <div class="flex-1">
                          <p class="font-medium text-gray-900 dark:text-white">Pay Online</p>
                          <p class="text-sm text-gray-600 dark:text-gray-400">Secure payment through our platform</p>
                        </div>
                        <div v-if="paymentMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'platform'" class="flex-shrink-0 w-5 h-5 rounded-full bg-[#246BFD] flex items-center justify-center mt-0.5">
                          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        </div>
                      </div>
                    </button>

                    <button
                      @click="paymentMethods.set(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId, 'direct')"
                      :class="[
                        'p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden',
                        paymentMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'direct'
                          ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      ]"
                    >
                      <div class="flex items-start space-x-3">
                        <div class="flex-1">
                          <p class="font-medium text-gray-900 dark:text-white">Pay at Pharmacy</p>
                          <p class="text-sm text-gray-600 dark:text-gray-400">Pay when you {{ deliveryMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'pickup' ? 'pick up' : 'receive' }} your order</p>
                        </div>
                        <div v-if="paymentMethods.get(pharmacy.items[0]?.pharmacyBranchId || pharmacy.pharmacyId) === 'direct'" class="flex-shrink-0 w-5 h-5 rounded-full bg-[#246BFD] flex items-center justify-center mt-0.5">
                          <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
                        </div>
                      </div>
                    </button>
                  </div>
                </template>

                <!-- Only online available -->
                <template v-else-if="effectivePaymentMethods(pharmacy)[0] === 'platform'">
                  <div class="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-700/40">
                    <svg class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <div>
                      <p class="text-sm font-semibold text-blue-900 dark:text-blue-200">Online Payment Only</p>
                      <p class="text-xs text-blue-700 dark:text-blue-400">Processed securely online</p>
                    </div>
                  </div>
                </template>

                <!-- Only offline available -->
                <template v-else-if="effectivePaymentMethods(pharmacy)[0] === 'direct'">
                  <div class="flex items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700">
                    <div class="flex-shrink-0 w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-gray-900 dark:text-white">Pay at Pharmacy Only</p>
                      <p class="text-xs text-gray-600 dark:text-gray-400">Payment collected at the counter</p>
                    </div>
                  </div>
                </template>

                <!-- No payment methods available (all disabled) -->
                <template v-else>
                  <div class="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
                    <svg class="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
                    </svg>
                    <div>
                      <p class="text-sm font-bold text-red-800 dark:text-red-300">Checkout Unavailable</p>
                      <p class="text-xs text-red-600 dark:text-red-400">No payment methods are currently available for this branch.</p>
                    </div>
                  </div>
                </template>
              </div>
  
              <div v-if="needsPrescription(pharmacy.pharmacyId)" class="mb-6 p-5 rounded-xl border-2 transition-all"
                :class="[
                  deliveryMethods.get(pharmacy.pharmacyId) === 'delivery' 
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                ]">
                <div class="flex items-start space-x-3 mb-4">
                  <svg v-if="deliveryMethods.get(pharmacy.pharmacyId) === 'delivery'" class="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                  </svg>
                  <svg v-else class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                  </svg>
                  <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                      <p class="font-semibold" :class="deliveryMethods.get(pharmacy.pharmacyId) === 'delivery' ? 'text-orange-800 dark:text-orange-200' : 'text-blue-800 dark:text-blue-200'">
                        Prescription {{ deliveryMethods.get(pharmacy.pharmacyId) === 'delivery' ? 'Required' : 'Optional' }}
                      </p>
                    </div>
                  </div>
                </div>

                  <div v-if="!prescriptionFiles.has(pharmacy.pharmacyId)" class="mt-4">
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload Prescription (PDF, JPG, PNG - Max 5MB)
                  </label>
                  <div class="relative">
                    <input
                      :id="`prescription-${pharmacy.pharmacyId}`"
                      type="file"
                      @change="handlePrescriptionUpload(pharmacy.pharmacyId, $event)"
                      accept=".pdf,.jpg,.jpeg,.png"
                      class="hidden"
                    />
                    <label
                      :for="`prescription-${pharmacy.pharmacyId}`"
                      class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-gray-50 dark:hover:bg-gray-800"
                      :class="deliveryMethods.get(pharmacy.pharmacyId) === 'delivery' 
                        ? 'border-orange-300 dark:border-orange-600' 
                        : 'border-blue-300 dark:border-blue-600'"
                    >
                      <svg class="w-10 h-10 mb-2" :class="deliveryMethods.get(pharmacy.pharmacyId) === 'delivery' ? 'text-orange-400' : 'text-blue-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                      </svg>
                      <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Click to upload or drag and drop
                      </p>
                    </label>
                  </div>
                </div>
                <!-- ... Preview block ... -->
                <div v-else class="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                   <!-- ... Prescription Preview Same As Before ... -->
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-3 flex-1">
                        <div v-if="prescriptionPreviews.get(pharmacy.pharmacyId) !== 'pdf'" class="flex-shrink-0">
                          <img 
                            :src="prescriptionPreviews.get(pharmacy.pharmacyId)" 
                            alt="Prescription preview" 
                            class="w-20 h-20 rounded-lg object-cover border-2 border-green-500"
                          />
                        </div>
                        <div v-else class="flex-shrink-0 w-20 h-20 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center border-2 border-green-500">
                           <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                          </svg>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="flex items-center gap-2 mb-1">
                             <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                            </svg>
                             <p class="text-sm font-semibold text-green-700 dark:text-green-400">Prescription Uploaded</p>
                          </div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ prescriptionFiles.get(pharmacy.pharmacyId)?.name }}</p>
                        </div>
                      </div>
                      <button @click="removePrescription(pharmacy.pharmacyId)" class="flex-shrink-0 ml-3 text-red-600">
                        Remove
                      </button>
                    </div>
                </div>
              </div>
  
              <!-- Removed individual "Place Order" button -->
            </div>
          </div>
  
          <div class="lg:col-span-1 space-y-6">

            <div class="sticky top-24 p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
              <h2 class="mb-6 text-xl font-medium text-gray-900 dark:text-white">Order Summary</h2>
              
              <div class="space-y-4 mb-6">
                <!-- ... Totals ... -->
                 <div class="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>{{ formatCurrency(totalAmount) }}</span>
                </div>
                <div class="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Delivery Fee</span>
                  <span v-if="deliveryFee > 0">{{ formatCurrency(deliveryFee) }}</span>
                  <span v-else-if="showDeliveryAddressInput" class="text-xs text-gray-400 italic">Calculating…</span>
                  <span v-else class="text-emerald-600 dark:text-emerald-400 font-medium">Free</span>
                </div>
                <div v-if="settingsStore.taxEnabled" class="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Incl. {{ settingsStore.taxLabel }}</span>
                  <span>~{{ formatCurrency(estimatedTaxFor()) }}</span>
                </div>
                <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div class="flex justify-between text-lg font-medium text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span class="text-[#246BFD]">{{ formatCurrency(grandTotal) }}</span>
                  </div>
                </div>
              </div>
  
              <button
                @click="placeAllOrders"
                :disabled="loading || pharmaciesCheckout.length === 0 || pharmaciesCheckout.some(p => effectivePaymentMethods(p).length === 0)"
                class="w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span v-if="loading" class="flex items-center justify-center">
                  <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Orders...
                </span>
                <span v-else>
                  Place All Orders
                </span>
              </button>
  
              <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <p class="text-sm text-gray-600 dark:text-gray-300">
                  <strong>Note:</strong> You can review and pay for each order separately after placing them.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>

