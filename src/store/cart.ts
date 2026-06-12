import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { cartService } from '@/services/cartService';
import type { CartItem, Cart, CartPharmacyGroup } from '@/models/Cart';
import { useAuthStore } from '@/store/auth';

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([]);
  const loading = ref(false);

  const cartItemsCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0);
  });

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + (price * item.quantity);
    }, 0);
  });

  const discount = computed(() => {
    return items.value.reduce((total, item) => {
      if (item.discountPrice && item.discountPrice < item.price) {
        return total + ((item.price - item.discountPrice) * item.quantity);
      }
      return total;
    }, 0);
  });

  const total = computed(() => subtotal.value);

  const cart = computed<Cart>(() => ({
    items: items.value,
    totalItems: cartItemsCount.value,
    subtotal: subtotal.value,
    discount: discount.value,
    total: total.value
  }));

  const groupedByPharmacy = computed<CartPharmacyGroup[]>(() => {
    const groups = new Map<string, CartPharmacyGroup>();

    items.value.forEach(item => {
      // Group by branch if available, otherwise by pharmacy ID
      // We use a string key to safely handle both cases
      const groupKey = item.pharmacyBranchId ? `branch-${item.pharmacyBranchId}` : `pharmacy-${item.pharmacyId}`;
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          pharmacyId: item.pharmacyId,
          pharmacyBranchId: item.pharmacyBranchId || '',
          pharmacyName: item.pharmacyName,
          pharmacyLogo: item.pharmacyLogo,
          isOpen: item.isOpen,
          branchName: item.branchName,
          latitude: item.latitude,
          longitude: item.longitude,
          items: [],
          subtotal: 0,
          acceptedPaymentMethods: item.acceptedPaymentMethods || ['platform', 'direct']
        });
      }

      const group = groups.get(groupKey)!;
      group.items.push(item);
      const price = item.discountPrice || item.price;
      group.subtotal += price * item.quantity;
    });

    return Array.from(groups.values());
  });

  const addItem = async (item: Omit<CartItem, 'id'>) => {
    // Basic deduplication based on priceId if available, or fallback to complex composite key
    const existingItemIndex = items.value.findIndex(i => {
      if (item.pharmacyDrugPriceId && i.pharmacyDrugPriceId) {
        return i.pharmacyDrugPriceId === item.pharmacyDrugPriceId;
      }
      // Fallback for legacy local items without price ID
      return i.medicationId === item.medicationId &&
        i.pharmacyId === item.pharmacyId &&
        i.formId === item.formId &&
        i.strengthId === item.strengthId &&
        i.uomId === item.uomId;
    });

    if (existingItemIndex !== -1) {
      items.value[existingItemIndex].quantity += item.quantity;
    } else {
      const newItem: CartItem = {
        ...item,
        id: item.pharmacyDrugPriceId
          ? `${item.pharmacyDrugPriceId}-${Date.now()}`
          : `${item.pharmacyId}-${item.medicationId}-${item.formId}-${item.strengthId}-${item.uomId}-${Date.now()}`
      };
      items.value.push(newItem);
    }

    saveToLocalStorage();

    // Sync with API if user is authenticated
    try {
      const authStore = useAuthStore();
      // Crucial change: We now REQUIRE pharmacyDrugPriceId for API sync
      if (authStore.isAuthenticated && item.pharmacyDrugPriceId) {
        const addedItem = await cartService.addToCart({
          pharmacy_drug_price_id: String(item.pharmacyDrugPriceId),
          quantity: existingItemIndex !== -1 ? items.value[existingItemIndex].quantity : item.quantity
        });
        
        // Update local item with real server ID ONLY if it's valid
        if (addedItem.id && addedItem.id !== 'undefined') {
          if (existingItemIndex !== -1) {
            items.value[existingItemIndex].id = addedItem.id;
          } else {
            // Find the item we just added (it might have been at the end)
            const newItemIndex = items.value.length - 1;
            if (newItemIndex >= 0) {
              items.value[newItemIndex].id = addedItem.id;
            }
          }
          saveToLocalStorage();
        } else {
          console.warn('Server returned invalid ID for new cart item:', addedItem);
        }
      } else if (authStore.isAuthenticated) {
        console.warn('Skipping API sync for cart item: Missing pharmacyDrugPriceId', item);
      }
    } catch (err) {
      console.error('Error syncing cart item to API:', err);
      // Don't block UI - continue with local cart
    }
  };

  const removeItem = async (itemId: string) => {
    const item = items.value.find(i => i.id === itemId);
    items.value = items.value.filter(item => item.id !== itemId);
    saveToLocalStorage();

    // Sync with API if user is authenticated
    if (item) {
      try {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated && item.id && item.id !== 'undefined' && !item.id.includes('-')) {
          // Try to remove from API - item.id might be the API cart item ID
          // Check for local temp IDs (containing '-') to avoid sending them
          await cartService.removeFromCart(item.id);
        }
      } catch (err) {
        console.error('Error removing cart item from API:', err);
        // Don't block UI - continue with local cart
      }
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        await removeItem(itemId);
      } else {
        item.quantity = quantity;
        saveToLocalStorage();

        // Sync with API if user is authenticated
        try {
          const authStore = useAuthStore();
          // Start of Changed Logic
          // Only sync if we have a valid server ID
          if (authStore.isAuthenticated && item.id && item.id !== 'undefined' && !item.id.includes('-')) {
             await cartService.updateCartItem(item.id, quantity);
          } else {
             console.warn('Skipping API sync for updateQuantity: Invalid or Local ID', item.id);
          }
          // End of Changed Logic
        } catch (err) {
          console.error('Error updating cart item quantity in API:', err);
          // Don't block UI - continue with local cart
        }
      }
    }
  };

  const clearCart = () => {
    items.value = [];
    saveToLocalStorage();
  };

  const clearPharmacyItems = (pharmacyId: string) => {
    items.value = items.value.filter(item => item.pharmacyId !== pharmacyId);
    saveToLocalStorage();
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('cart', JSON.stringify(items.value));
  };

  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const parsed: CartItem[] = JSON.parse(stored);
        // Coerce UUID fields that were stored as numbers before the UUID migration
        items.value = parsed.map(item => ({
          ...item,
          pharmacyId: item.pharmacyId != null ? String(item.pharmacyId) : item.pharmacyId,
          pharmacyBranchId: item.pharmacyBranchId != null ? String(item.pharmacyBranchId) : item.pharmacyBranchId,
          pharmacyDrugPriceId: item.pharmacyDrugPriceId != null ? String(item.pharmacyDrugPriceId) : item.pharmacyDrugPriceId,
        }));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        items.value = [];
      }
    }
  };

  const syncWithAPI = async () => {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated) return;

    try {
      const apiCart = await cartService.getCart();
      // Update local items with API items (source of truth)
      if (apiCart && apiCart.items) {
        items.value = apiCart.items;
        saveToLocalStorage();
      }
    } catch (err) {
      console.error('Error syncing cart with API:', err);
    }
  };

  const hasItemsFromPharmacy = (pharmacyId: string) => {
    return items.value.some(item => item.pharmacyId === pharmacyId);
  };

  const getPharmacyItemsCount = (pharmacyId: string) => {
    return items.value
      .filter(item => item.pharmacyId === pharmacyId)
      .reduce((total, item) => total + item.quantity, 0);
  };

  loadFromLocalStorage();

  return {
    items,
    loading,
    cartItemsCount,
    subtotal,
    discount,
    total,
    cart,
    groupedByPharmacy,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    clearPharmacyItems,
    hasItemsFromPharmacy,
    getPharmacyItemsCount,
    loadFromLocalStorage,
    syncWithAPI
  };
});

