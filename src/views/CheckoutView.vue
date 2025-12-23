<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useCartStore } from '@/store/cart';
import { useNotification } from '@/composables/useNotification';
import { cartService } from '@/services/cartService';
import { orderService } from '@/services/orderService';
import { paymentService } from '@/services/paymentService';
import type { CartPharmacyGroup } from '@/models/Cart';
import LazyImage from '@/components/LazyImage.vue';

const router = useRouter();
const route = useRoute();
const cartStore = useCartStore();
const notification = useNotification();

const selectedPharmacyIds = ref<number[]>([]);
const pharmaciesCheckout = ref<CartPharmacyGroup[]>([]);
const deliveryMethod = ref<'pickup' | 'delivery'>('pickup');
const deliveryAddress = ref('');
const phoneNumber = ref('');
const prescriptionFiles = ref<Map<number, File>>(new Map());
const prescriptionPreviews = ref<Map<number, string>>(new Map());
const paymentMethods = ref<Map<number, 'platform' | 'direct'>>(new Map());
const processingOrders = ref<Set<number>>(new Set());
const successfulOrders = ref<Set<number>>(new Set());
const loading = ref(false);
const error = ref<string | null>(null);

const totalAmount = computed(() => {
  return pharmaciesCheckout.value.reduce((total, pharmacy) => {
    return total + pharmacy.subtotal;
  }, 0);
});

const deliveryFee = computed(() => {
  if (deliveryMethod.value === 'delivery') {
    return pharmaciesCheckout.value.length * 5;
  }
  return 0;
});

const grandTotal = computed(() => totalAmount.value + deliveryFee.value);

const needsPrescription = (pharmacyId: number) => {
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
          pharmacy_drug_price_id: item.pharmacyDrugPriceId as number,
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

onMounted(async () => {
  const pharmacyIdsParam = route.query.pharmacies as string;
  if (pharmacyIdsParam) {
    selectedPharmacyIds.value = pharmacyIdsParam.split(',').map(id => parseInt(id));
    
    // Sync cart with API first
    await syncCartWithAPI();
    
    // Get updated cart from API
    try {
      const apiCart = await cartService.getCart();
      cartStore.items = apiCart.items;
    } catch (e) {
      console.error('Failed to sync with server cart:', e);
      // Fallback to local cart data
    }
    
    // Group items by pharmacy for display
    pharmaciesCheckout.value = cartStore.groupedByPharmacy.filter(group => 
      selectedPharmacyIds.value.includes(group.pharmacyId)
    );

    pharmaciesCheckout.value.forEach(pharmacy => {
      paymentMethods.value.set(pharmacy.pharmacyId, 'platform');
    });
  } else {
    router.push({ name: 'cart' });
  }
});

const handlePrescriptionUpload = (pharmacyId: number, event: Event) => {
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

const removePrescription = (pharmacyId: number) => {
  prescriptionFiles.value.delete(pharmacyId);
  prescriptionPreviews.value.delete(pharmacyId);
  
  const fileInput = document.querySelector(`#prescription-${pharmacyId}`) as HTMLInputElement;
  if (fileInput) {
    fileInput.value = '';
  }
};

const validateCheckout = () => {
  if (deliveryMethod.value === 'delivery' && !deliveryAddress.value.trim()) {
    error.value = 'Please provide a delivery address';
    return false;
  }

  if (!phoneNumber.value.trim()) {
    error.value = 'Please provide your phone number';
    return false;
  }

  if (deliveryMethod.value === 'delivery') {
    for (const pharmacy of pharmaciesCheckout.value) {
      if (needsPrescription(pharmacy.pharmacyId) && !prescriptionFiles.value.has(pharmacy.pharmacyId)) {
        error.value = `Please upload a prescription for ${pharmacy.pharmacyName}. Prescriptions are required for delivery orders.`;
        return false;
      }
    }
  }

  return true;
};

const placeOrder = async (pharmacyId: number) => {
  if (!validateCheckout()) {
    return;
  }

  const pharmacy = pharmaciesCheckout.value.find(p => p.pharmacyId === pharmacyId);
  if (!pharmacy) return;

  try {
    processingOrders.value.add(pharmacyId);
    error.value = null;

    // Get pharmacy_branch_id from the first item (all items in group have same pharmacy)
    const firstItem = pharmacy.items[0];
    const pharmacyBranchId = firstItem.pharmacyBranchId || pharmacy.pharmacyId;
    
    // Get user location if delivery method is delivery
    let deliveryLat: number | undefined;
    let deliveryLng: number | undefined;
    
    if (deliveryMethod.value === 'delivery') {
      try {
        const location = await new Promise<{ lat: number; lng: number }>((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
            return;
          }
          navigator.geolocation.getCurrentPosition(
            (position) => resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }),
            reject,
            { timeout: 5000 }
          );
        });
        deliveryLat = location.lat;
        deliveryLng = location.lng;
      } catch (err) {
        console.warn('Could not get user location:', err);
        // Continue without coordinates - API might handle it
      }
    }
    
    // Create order payload - API creates order from cart items automatically
    // We just need to specify which pharmacy branch and delivery details
    const orderPayload = {
      pharmacy_branch_id: pharmacyBranchId,
      delivery_method: deliveryMethod.value,
      delivery_address: deliveryMethod.value === 'delivery' ? deliveryAddress.value : undefined,
      delivery_lat: deliveryLat,
      delivery_lng: deliveryLng,
      phone_number: phoneNumber.value,
      payment_method: paymentMethods.value.get(pharmacyId) || 'platform',
      notes: deliveryMethod.value === 'delivery' ? 'Please handle with care' : undefined
    };

    // Create order - API will automatically use cart items for this pharmacy_branch_id
    const order = await orderService.createOrder(orderPayload);

    // Upload prescription if provided
    const prescriptionFile = prescriptionFiles.value.get(pharmacyId);
    if (prescriptionFile) {
      await orderService.uploadPrescription(order.id, prescriptionFile);
    }

    // If payment method is platform, initialize payment
    if (order.paymentMethod === 'platform' && order.paymentStatus === 'pending') {
      const paymentResponse = await paymentService.initializePayment(order.id);
      window.location.href = paymentResponse.authorization_url;
    } else {
      successfulOrders.value.add(pharmacyId);
      cartStore.clearPharmacyItems(pharmacyId);
      
      notification.success(
        'Order Placed Successfully!',
        `Your order from ${pharmacy.pharmacyName} has been placed. ${order.paymentMethod === 'direct' ? 'Pay at pharmacy when you ' + (deliveryMethod.value === 'pickup' ? 'pick up' : 'receive') + ' your order.' : ''}`
      );
      
      if (successfulOrders.value.size === pharmaciesCheckout.value.length) {
        setTimeout(() => {
          router.push({ name: 'orders' });
        }, 2000);
      }
    }
  } catch (err) {
    console.error('Error placing order:', err);
    notification.error(
      'Order Failed',
      `Failed to place order with ${pharmacy.pharmacyName}. Please try again.`
    );
    error.value = 'Failed to place order. Please try again.';
  } finally {
    processingOrders.value.delete(pharmacyId);
  }
};

const placeAllOrders = async () => {
  if (!validateCheckout()) {
    return;
  }

  loading.value = true;
  error.value = null;

  for (const pharmacy of pharmaciesCheckout.value) {
    await placeOrder(pharmacy.pharmacyId);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  loading.value = false;
};
</script>

<template>
  <div class="min-h-screen pt-20 pb-12 bg-gray-50 dark:bg-gray-900">
    <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
          <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h2 class="mb-6 text-xl font-medium text-gray-900 dark:text-white">Contact Information</h2>
            <div class="space-y-4">
              <div>
                <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number *
                </label>
                <input
                  v-model="phoneNumber"
                  type="tel"
                  placeholder="+233 XX XXX XXXX"
                  class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                  required
                />
              </div>
            </div>
          </div>

          <div class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h2 class="mb-6 text-xl font-medium text-gray-900 dark:text-white">Delivery Method</h2>
            <div class="grid grid-cols-2 gap-4">
              <button
                @click="deliveryMethod = 'pickup'"
                :class="[
                  'p-4 rounded-xl border-2 transition-all',
                  deliveryMethod === 'pickup'
                    ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                ]"
              >
                <div class="flex flex-col items-center">
                  <svg class="w-8 h-8 mb-2" :class="deliveryMethod === 'pickup' ? 'text-[#246BFD]' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                  </svg>
                  <span class="font-medium" :class="deliveryMethod === 'pickup' ? 'text-[#246BFD]' : 'text-gray-600 dark:text-gray-300'">
                    Pickup
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">Free</span>
                </div>
              </button>

              <button
                @click="deliveryMethod = 'delivery'"
                :class="[
                  'p-4 rounded-xl border-2 transition-all',
                  deliveryMethod === 'delivery'
                    ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                ]"
              >
                <div class="flex flex-col items-center">
                  <svg class="w-8 h-8 mb-2" :class="deliveryMethod === 'delivery' ? 'text-[#246BFD]' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path>
                  </svg>
                  <span class="font-medium" :class="deliveryMethod === 'delivery' ? 'text-[#246BFD]' : 'text-gray-600 dark:text-gray-300'">
                    Delivery
                  </span>
                  <span class="text-sm text-gray-500 dark:text-gray-400">GHS {{ deliveryFee.toFixed(2) }}</span>
                </div>
              </button>
            </div>

            <div v-if="deliveryMethod === 'delivery'" class="mt-4">
              <label class="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Delivery Address *
              </label>
              <textarea
                v-model="deliveryAddress"
                rows="3"
                placeholder="Enter your full delivery address"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#246BFD]"
                required
              ></textarea>
            </div>
          </div>

          <div
            v-for="pharmacy in pharmaciesCheckout"
            :key="pharmacy.pharmacyId"
            class="p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl"
          >
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div class="flex items-center space-x-4">
                <div v-if="pharmacy.pharmacyLogo" class="w-12 h-12 overflow-hidden bg-white rounded-lg">
                  <LazyImage
                    :src="pharmacy.pharmacyLogo"
                    :alt="pharmacy.pharmacyName"
                    aspectRatio="square"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 class="text-lg font-medium text-gray-900 dark:text-white">{{ pharmacy.pharmacyName }}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">
                    {{ pharmacy.items.length }} {{ pharmacy.items.length === 1 ? 'item' : 'items' }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
                <p class="text-lg font-medium text-[#246BFD]">GHS {{ pharmacy.subtotal.toFixed(2) }}</p>
              </div>
            </div>

            <div class="mb-6 space-y-3">
              <div
                v-for="item in pharmacy.items"
                :key="item.id"
                class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
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
                  <div>
                    <p class="text-sm font-medium text-gray-900 dark:text-white">{{ item.medicationName }}</p>
                    <p class="text-xs text-gray-600 dark:text-gray-400">
                      {{ item.formName }} • {{ item.strength }} • Qty: {{ item.quantity }}
                    </p>
                  </div>
                </div>
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  GHS {{ ((item.discountPrice || item.price) * item.quantity).toFixed(2) }}
                </span>
              </div>
            </div>

            <div v-if="needsPrescription(pharmacy.pharmacyId)" class="mb-6 p-5 rounded-xl border-2 transition-all"
              :class="[
                deliveryMethod === 'delivery' 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
              ]">
              <div class="flex items-start space-x-3 mb-4">
                <svg v-if="deliveryMethod === 'delivery'" class="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
                <svg v-else class="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
                </svg>
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-1">
                    <p class="font-semibold" :class="deliveryMethod === 'delivery' ? 'text-orange-800 dark:text-orange-200' : 'text-blue-800 dark:text-blue-200'">
                      Prescription {{ deliveryMethod === 'delivery' ? 'Required' : 'Optional' }}
                    </p>
                    <span v-if="deliveryMethod === 'delivery'" class="px-2 py-0.5 text-xs font-semibold rounded-full bg-orange-600 text-white">
                      Required
                    </span>
                    <span v-else class="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-600 text-white">
                      Optional
                    </span>
                  </div>
                  <p class="text-sm" :class="deliveryMethod === 'delivery' ? 'text-orange-700 dark:text-orange-300' : 'text-blue-700 dark:text-blue-300'">
                    <span v-if="deliveryMethod === 'delivery'">
                      Please upload a valid prescription. This is required for delivery orders so the pharmacy can verify your medication.
                    </span>
                    <span v-else>
                      You can upload your prescription now or show it to the pharmacist when you pick up your order.
                    </span>
                  </p>
                </div>
              </div>

              <!-- File Upload Area -->
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
                    :class="deliveryMethod === 'delivery' 
                      ? 'border-orange-300 dark:border-orange-600' 
                      : 'border-blue-300 dark:border-blue-600'"
                  >
                    <svg class="w-10 h-10 mb-2" :class="deliveryMethod === 'delivery' ? 'text-orange-400' : 'text-blue-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                    </svg>
                    <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Click to upload or drag and drop
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      PDF, JPG, PNG (Max 5MB)
                    </p>
                  </label>
                </div>
              </div>

              <!-- Preview Area -->
              <div v-else class="mt-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div class="flex items-start justify-between">
                  <div class="flex items-center gap-3 flex-1">
                    <!-- Image Preview -->
                    <div v-if="prescriptionPreviews.get(pharmacy.pharmacyId) !== 'pdf'" class="flex-shrink-0">
                      <img 
                        :src="prescriptionPreviews.get(pharmacy.pharmacyId)" 
                        alt="Prescription preview" 
                        class="w-20 h-20 rounded-lg object-cover border-2 border-green-500"
                      />
                    </div>
                    <!-- PDF Icon -->
                    <div v-else class="flex-shrink-0 w-20 h-20 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center border-2 border-green-500">
                      <svg class="w-10 h-10 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd"></path>
                      </svg>
                    </div>
                    <!-- File Info -->
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-sm font-semibold text-green-700 dark:text-green-400">
                          Prescription Uploaded
                        </p>
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {{ prescriptionFiles.get(pharmacy.pharmacyId)?.name }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {{ (prescriptionFiles.get(pharmacy.pharmacyId)!.size / 1024).toFixed(2) }} KB
                      </p>
                    </div>
                  </div>
                  <!-- Remove Button -->
                  <button
                    @click="removePrescription(pharmacy.pharmacyId)"
                    class="flex-shrink-0 ml-3 p-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                    title="Remove prescription"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <label class="block mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                Payment Method
              </label>
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  @click="paymentMethods.set(pharmacy.pharmacyId, 'platform')"
                  :class="[
                    'p-4 rounded-xl border-2 transition-all text-left',
                    paymentMethods.get(pharmacy.pharmacyId) === 'platform'
                      ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        paymentMethods.get(pharmacy.pharmacyId) === 'platform'
                          ? 'border-[#246BFD]'
                          : 'border-gray-300 dark:border-gray-600'
                      ]">
                        <div v-if="paymentMethods.get(pharmacy.pharmacyId) === 'platform'" class="w-3 h-3 rounded-full bg-[#246BFD]"></div>
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900 dark:text-white">Pay Online</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Secure payment through our platform</p>
                    </div>
                  </div>
                </button>

                <button
                  @click="paymentMethods.set(pharmacy.pharmacyId, 'direct')"
                  :class="[
                    'p-4 rounded-xl border-2 transition-all text-left',
                    paymentMethods.get(pharmacy.pharmacyId) === 'direct'
                      ? 'border-[#246BFD] bg-[#246BFD]/5 dark:bg-[#246BFD]/10'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  ]"
                >
                  <div class="flex items-start space-x-3">
                    <div class="flex-shrink-0">
                      <div :class="[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center',
                        paymentMethods.get(pharmacy.pharmacyId) === 'direct'
                          ? 'border-[#246BFD]'
                          : 'border-gray-300 dark:border-gray-600'
                      ]">
                        <div v-if="paymentMethods.get(pharmacy.pharmacyId) === 'direct'" class="w-3 h-3 rounded-full bg-[#246BFD]"></div>
                      </div>
                    </div>
                    <div class="flex-1">
                      <p class="font-medium text-gray-900 dark:text-white">Pay at Pharmacy</p>
                      <p class="text-sm text-gray-600 dark:text-gray-400">Pay when you {{ deliveryMethod === 'pickup' ? 'pickup' : 'receive' }} your order</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <button
              @click="placeOrder(pharmacy.pharmacyId)"
              :disabled="processingOrders.has(pharmacy.pharmacyId) || successfulOrders.has(pharmacy.pharmacyId)"
              class="w-full px-6 py-3 rounded-full text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              :class="successfulOrders.has(pharmacy.pharmacyId) ? 'bg-green-600 hover:bg-green-700' : 'bg-[#246BFD] hover:bg-[#5089FF]'"
            >
              <span v-if="processingOrders.has(pharmacy.pharmacyId)" class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
              <span v-else-if="successfulOrders.has(pharmacy.pharmacyId)">
                ✓ Order Placed Successfully
              </span>
              <span v-else>
                Place Order - GHS {{ pharmacy.subtotal.toFixed(2) }}
              </span>
            </button>
          </div>
        </div>

        <div class="lg:col-span-1">
          <div class="sticky top-24 p-6 bg-white shadow-lg dark:bg-gray-800 rounded-2xl">
            <h2 class="mb-6 text-xl font-medium text-gray-900 dark:text-white">Order Summary</h2>
            
            <div class="space-y-4 mb-6">
              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>GHS {{ totalAmount.toFixed(2) }}</span>
              </div>
              <div class="flex justify-between text-gray-600 dark:text-gray-300">
                <span>Delivery Fee</span>
                <span>GHS {{ deliveryFee.toFixed(2) }}</span>
              </div>
              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between text-lg font-medium text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span class="text-[#246BFD]">GHS {{ grandTotal.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <button
              @click="placeAllOrders"
              :disabled="loading || successfulOrders.size === pharmaciesCheckout.length"
              class="w-full px-6 py-3 rounded-full bg-[#246BFD] text-white font-medium hover:bg-[#5089FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="loading" class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing All Orders...
              </span>
              <span v-else-if="successfulOrders.size === pharmaciesCheckout.length">
                ✓ All Orders Placed
              </span>
              <span v-else>
                Place All Orders
              </span>
            </button>

            <div class="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <p class="text-sm text-gray-600 dark:text-gray-300">
                <strong>Note:</strong> Each pharmacy order will be processed separately. You can choose different payment methods for each.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>

