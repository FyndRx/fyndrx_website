import type { Medication } from '@/models/Medication';
import { dataService } from './dataService';

const STORAGE_KEY = 'fyndrx_recently_viewed';
const MAX_ITEMS = 12;

export interface RecentlyViewedItem {
  medicationId: number;
  viewedAt: number;
}

export const recentlyViewedService = {
  addItem(medicationId: number): void {
    const items = this.getItems();
    
    const existingIndex = items.findIndex(item => item.medicationId === medicationId);
    if (existingIndex !== -1) {
      items.splice(existingIndex, 1);
    }
    
    items.unshift({
      medicationId,
      viewedAt: Date.now()
    });
    
    if (items.length > MAX_ITEMS) {
      items.splice(MAX_ITEMS);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },

  getItems(): RecentlyViewedItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading recently viewed:', error);
      return [];
    }
  },

  getMedications(): Medication[] {
    const items = this.getItems();
    return items
      .map(item => dataService.getMedicationById(item.medicationId))
      .filter((med): med is Medication => med !== undefined);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  },

  removeItem(medicationId: number): void {
    const items = this.getItems();
    const filtered = items.filter(item => item.medicationId !== medicationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};

