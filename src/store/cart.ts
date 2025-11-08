import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { CartItem, Cart, CartPharmacyGroup } from '@/models/Cart';

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
    const groups = new Map<number, CartPharmacyGroup>();

    items.value.forEach(item => {
      if (!groups.has(item.pharmacyId)) {
        groups.set(item.pharmacyId, {
          pharmacyId: item.pharmacyId,
          pharmacyName: item.pharmacyName,
          pharmacyLogo: item.pharmacyLogo,
          items: [],
          subtotal: 0
        });
      }

      const group = groups.get(item.pharmacyId)!;
      group.items.push(item);
      const price = item.discountPrice || item.price;
      group.subtotal += price * item.quantity;
    });

    return Array.from(groups.values());
  });

  const addItem = (item: Omit<CartItem, 'id'>) => {
    const existingItemIndex = items.value.findIndex(
      i => i.medicationId === item.medicationId &&
           i.pharmacyId === item.pharmacyId &&
           i.formId === item.formId &&
           i.strengthId === item.strengthId &&
           i.uomId === item.uomId
    );

    if (existingItemIndex !== -1) {
      items.value[existingItemIndex].quantity += item.quantity;
    } else {
      const newItem: CartItem = {
        ...item,
        id: `${item.pharmacyId}-${item.medicationId}-${item.formId}-${item.strengthId}-${item.uomId}-${Date.now()}`
      };
      items.value.push(newItem);
    }

    saveToLocalStorage();
  };

  const removeItem = (itemId: string) => {
    items.value = items.value.filter(item => item.id !== itemId);
    saveToLocalStorage();
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    const item = items.value.find(i => i.id === itemId);
    if (item) {
      if (quantity <= 0) {
        removeItem(itemId);
      } else {
        item.quantity = quantity;
        saveToLocalStorage();
      }
    }
  };

  const clearCart = () => {
    items.value = [];
    saveToLocalStorage();
  };

  const clearPharmacyItems = (pharmacyId: number) => {
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
        items.value = JSON.parse(stored);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        items.value = [];
      }
    }
  };

  const hasItemsFromPharmacy = (pharmacyId: number) => {
    return items.value.some(item => item.pharmacyId === pharmacyId);
  };

  const getPharmacyItemsCount = (pharmacyId: number) => {
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
    loadFromLocalStorage
  };
});

