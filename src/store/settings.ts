import { defineStore } from 'pinia';
import { apiService } from '@/services/api';

interface SettingsState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  deliveryFeeFlat: number;
  freeDeliveryThreshold: number;
  maxCartItems: number;
  onlinePaymentEnabled: boolean;
  offlinePaymentEnabled: boolean;
  isLoaded: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance to improve your experience.',
    deliveryFeeFlat: 5,
    freeDeliveryThreshold: 500,
    maxCartItems: 20,
    onlinePaymentEnabled: true,
    offlinePaymentEnabled: true,
    isLoaded: false,
  }),

  getters: {
    enabledPaymentMethods: (state): ('platform' | 'direct')[] => {
      const methods: ('platform' | 'direct')[] = [];
      if (state.onlinePaymentEnabled)  methods.push('platform');
      if (state.offlinePaymentEnabled) methods.push('direct');
      return methods;
    },
  },

  actions: {
    async fetchSettings() {
      try {
        const response: any = await apiService.get('/settings/status');
        if (response && response.status === 'ok' && response.settings) {
          const s = response.settings;
          this.maintenanceMode = s.maintenance_mode === true || s.maintenance_mode === '1';
          this.maintenanceMessage = s.maintenance_message || this.maintenanceMessage;
          this.deliveryFeeFlat = Number(s.delivery_fee_flat) || 5;
          this.freeDeliveryThreshold = Number(s.free_delivery_threshold) || 500;
          this.maxCartItems = Number(s.max_cart_items) || 20;
          this.onlinePaymentEnabled  = s.online_payment_enabled  !== false && s.online_payment_enabled  !== 'false';
          this.offlinePaymentEnabled = s.offline_payment_enabled !== false && s.offline_payment_enabled !== 'false';
          this.isLoaded = true;
        }
      } catch (error) {
        console.error('Failed to fetch platform settings:', error);
      }
    },

    setMaintenanceMode(value: boolean) {
      this.maintenanceMode = value;
    }
  }
});
