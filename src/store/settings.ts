import { defineStore } from 'pinia';
import { apiService } from '@/services/api';

interface SettingsState {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  deliveryFeeFlat: number;
  freeDeliveryThreshold: number;
  maxCartItems: number;
  isLoaded: boolean;
}

export const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    maintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance to improve your experience.',
    deliveryFeeFlat: 5,
    freeDeliveryThreshold: 500,
    maxCartItems: 20,
    isLoaded: false,
  }),

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
