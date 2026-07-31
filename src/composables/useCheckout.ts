import { ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { useAuthStore } from '@/store/auth';
import { useSettingsStore } from '@/store/settings';
import { useNotification } from '@/composables/useNotification';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import { pharmacyService } from '@/services/pharmacyService';
import { authService } from '@/services/auth.service';
import type { PharmacyDeliveryOptions } from '@/models/Pharmacy';
import type { CartPharmacyGroup } from '@/models/Cart';

export function useCheckout() {
  const router = useRouter();
  const route = useRoute();
  const cartStore = useCartStore();
  const authStore = useAuthStore();
  const settingsStore = useSettingsStore();
  const notification = useNotification();

  // Selected Branches
  const selectedBranchIds = ref<string[]>([]);
  const pharmaciesCheckout = computed<CartPharmacyGroup[]>(() => {
    return cartStore.groupedByPharmacy.filter(group => 
      selectedBranchIds.value.includes(group.pharmacyBranchId)
    );
  });

  // Delivery State
  const deliveryMethods = ref<Map<string, 'pickup' | 'delivery'>>(new Map());
  const deliveryProviders = ref<Map<string, 'pharmacy' | 'fyndrx'>>(new Map());
  const deliveryOptionsCache = ref<Map<string, PharmacyDeliveryOptions>>(new Map());
  const loadingDeliveryOptions = ref<Map<string, boolean>>(new Map());
  
  // Address State
  const deliveryAddress = ref('');
  const defaultUserAddress = ref('');
  const deliveryLat = ref<number | undefined>();
  const deliveryLng = ref<number | undefined>();
  
  // Contact State
  const phoneNumber = ref('');
  
  // Bookmark Address State
  const isAddingAddress = ref(false);
  const newAddressLabel = ref('');
  const isSavingAddress = ref(false);
  const userAddresses = ref<any[]>([]);
  const selectedAddressId = ref<number | null>(null);

  // Care-Sender Delivery Mode
  const isOrderingForSomeoneElse = ref(false);
  const recipientName = ref('');
  const recipientPhoneNumber = ref('');

  // Prescription Uploads
  const prescriptionFiles = ref<Map<string, File>>(new Map());
  const prescriptionPreviews = ref<Map<string, string>>(new Map());
  
  // Payment State
  const paymentMethods = ref<Map<string, 'platform' | 'direct'>>(new Map());
  const loading = ref(false);
  const error = ref<string | null>(null);
  
  // Post-Checkout Order Tracking
  const createdOrders = ref<any[]>([]);
  const showSuccess = ref(false);
  const selectedOrderIds = ref<string[]>([]);
  const bulkPaymentLoading = ref(false);

  // Address logic
  const loadUserAddresses = async () => {
    try {
      const res = await authService.getAddresses();
      userAddresses.value = res || [];
      if (userAddresses.value.length > 0 && !selectedAddressId.value) {
        const defAddr = userAddresses.value.find((addr: any) => addr.is_default);
        if (defAddr) selectBookmarkedAddress(defAddr);
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

  const onLocationSelected = (payload: { lat: number; lng: number; address: string }) => {
    deliveryLat.value = payload.lat;
    deliveryLng.value = payload.lng;
    if (payload.address && payload.address.trim() !== '') {
      deliveryAddress.value = payload.address;
      selectedAddressId.value = null;
    }
  };

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
      
      if ((window as any).google && (window as any).google.maps) {
        const geocoder = new (window as any).google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
          if (status === 'OK' && results[0]) {
            deliveryAddress.value = results[0].formatted_address;
            selectedAddressId.value = null;
          }
        });
      }
    } catch (err) {
      console.warn('Failed to get user location:', err);
      notification.warning('Location Access', 'We could not automatically detect your location. Please ensure your GPS is on.');
    }
  };

  // Cart & Math Logic
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
        fee += settingsStore.deliveryFeeFlat;
      }
    });
    return fee;
  });

  const grandTotal = computed(() => totalAmount.value + deliveryFee.value);

  const estimatedTaxFor = (): number => {
    if (!settingsStore.taxEnabled) return 0;
    const base = grandTotal.value;
    return Math.round(base * settingsStore.taxRate / (1 + settingsStore.taxRate) * 100) / 100;
  };

  const needsPrescription = (pharmacyId: string) => {
    const pharmacy = pharmaciesCheckout.value.find(p => p.pharmacyId === pharmacyId);
    return pharmacy?.items.some(item => item.requiresPrescription) || false;
  };

  const syncCartWithAPI = async () => {
    try {
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

  // Payment method rules
  const branchSupportsDelivery = (pharmacy: CartPharmacyGroup): boolean => {
    if (!settingsStore.onlinePaymentEnabled) return false;
    const accepted = pharmacy.acceptedPaymentMethods;
    if (!accepted || accepted.length === 0) return false;
    return accepted.includes('platform');
  };

  const effectivePaymentMethods = (pharmacy: CartPharmacyGroup): ('platform' | 'direct')[] => {
    const branchMethods = pharmacy.acceptedPaymentMethods ?? ['platform', 'direct'];
    return settingsStore.enabledPaymentMethods.filter(m => branchMethods.includes(m as any)) as ('platform' | 'direct')[];
  };

  const showDeliveryAddressInput = computed(() => {
    for (const method of deliveryMethods.value.values()) {
      if (method === 'delivery') return true;
    }
    return false;
  });

  // Options fetching
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

  // Prescriptions
  const handlePrescriptionUpload = (pharmacyId: string, file: File) => {
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
  };

  const removePrescription = (pharmacyId: string) => {
    prescriptionFiles.value.delete(pharmacyId);
    prescriptionPreviews.value.delete(pharmacyId);
  };

  // Checkout Validation & Processing
  const validateCheckout = () => {
    if (showDeliveryAddressInput.value && !deliveryAddress.value.trim()) {
      error.value = 'Please provide a delivery address for your delivery orders.';
      notification.error('Delivery Address Required', error.value);
      return false;
    }

    if (showDeliveryAddressInput.value && isOrderingForSomeoneElse.value) {
      if (!recipientName.value.trim()) {
        error.value = "Please enter the recipient's name.";
        notification.error('Recipient Name Required', error.value);
        return false;
      }
      if (!recipientPhoneNumber.value.trim()) {
        error.value = "Please enter the recipient's phone number.";
        notification.error('Recipient Phone Required', error.value);
        return false;
      }
    }

    if (!phoneNumber.value.trim()) {
      error.value = 'Please provide your phone number';
      notification.error('Phone Number Required', error.value);
      return false;
    }

    for (const pharmacy of pharmaciesCheckout.value) {
      const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;

      const deliveryMethod = deliveryMethods.value.get(groupKey);
      if (deliveryMethod === 'delivery') {
        if (!deliveryProviders.value.has(groupKey)) {
          error.value = `Please select a delivery provider for ${pharmacy.pharmacyName}.`;
          notification.error('Delivery Provider Required', error.value);
          return false;
        }
        if (needsPrescription(pharmacy.pharmacyId) && !prescriptionFiles.value.has(pharmacy.pharmacyId)) {
          error.value = `Please upload a prescription for ${pharmacy.pharmacyName} (required for delivery).`;
          notification.error('Prescription Required', error.value);
          return false;
        }
      }

      if (!paymentMethods.value.has(groupKey)) {
        error.value = `Please select a payment method for ${pharmacy.pharmacyName}`;
        notification.error('Payment Method Required', error.value);
        return false;
      }
    }

    return true;
  };

  const placeAllOrders = async () => {
    if (!validateCheckout()) return;

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
      
      const orders = Array.isArray(result) ? result : [result];
      createdOrders.value = orders;

      for (const order of orders) {
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
  
  // Watchers & Hooks
  watch(pharmaciesCheckout, (newPharmacies) => {
    newPharmacies.forEach(pharmacy => {
      const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;
  
      const effective = effectivePaymentMethods(pharmacy);
      const currentMethod = paymentMethods.value.get(groupKey);
  
      if (!currentMethod || !effective.includes(currentMethod as any)) {
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

  watch(showDeliveryAddressInput, (isDelivery) => {
    if (isDelivery && !deliveryLat.value) {
      fetchUserLocation();
    }
  });

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

  watch([deliveryLat, deliveryLng], () => {
    pharmaciesCheckout.value.forEach(pharmacy => {
      const groupKey = pharmacy.pharmacyBranchId || pharmacy.pharmacyId;
      if (deliveryMethods.value.get(groupKey) === 'delivery') {
        fetchDeliveryOptions(pharmacy.pharmacyId);
      }
    });
  });

  const initializeData = async () => {
    const pharmacyIdsParam = route.query.pharmacies as string;
    if (pharmacyIdsParam) {
      selectedBranchIds.value = pharmacyIdsParam.split(',').map(id => id.trim());
      
      if (route.query.lat) deliveryLat.value = Number(route.query.lat);
      if (route.query.lng) deliveryLng.value = Number(route.query.lng);
      if (route.query.address) deliveryAddress.value = route.query.address as string;
      await syncCartWithAPI();
      
      await cartStore.syncWithAPI();
  
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
  };

  return {
    // State
    selectedBranchIds,
    pharmaciesCheckout,
    deliveryMethods,
    deliveryProviders,
    deliveryOptionsCache,
    loadingDeliveryOptions,
    deliveryAddress,
    defaultUserAddress,
    deliveryLat,
    deliveryLng,
    phoneNumber,
    isAddingAddress,
    newAddressLabel,
    isSavingAddress,
    userAddresses,
    selectedAddressId,
    isOrderingForSomeoneElse,
    recipientName,
    recipientPhoneNumber,
    prescriptionFiles,
    prescriptionPreviews,
    paymentMethods,
    loading,
    error,
    createdOrders,
    showSuccess,
    selectedOrderIds,
    bulkPaymentLoading,
    selectableOrders,
    isAllSelected,
    selectedTotal,
    showDeliveryAddressInput,
    totalAmount,
    deliveryFee,
    grandTotal,

    // Methods
    initializeData,
    loadUserAddresses,
    selectBookmarkedAddress,
    saveNewAddressBookmark,
    onLocationSelected,
    fetchUserLocation,
    estimatedTaxFor,
    needsPrescription,
    branchSupportsDelivery,
    effectivePaymentMethods,
    fetchDeliveryOptions,
    handlePrescriptionUpload,
    removePrescription,
    validateCheckout,
    placeAllOrders,
    payNow,
    toggleSelectAll
  };
}
