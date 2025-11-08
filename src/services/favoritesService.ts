import type { Medication } from '@/models/Medication';
import type { Pharmacy } from '@/models/Pharmacy';
import { dataService } from './dataService';

const STORAGE_KEY = 'fyndrx_favorites';

export interface FavoriteItem {
  id: string;
  type: 'medication' | 'pharmacy';
  itemId: number;
  addedAt: number;
}

export const favoritesService = {
  addFavorite(type: 'medication' | 'pharmacy', itemId: number): void {
    const favorites = this.getFavorites();
    const id = `${type}-${itemId}`;
    
    const exists = favorites.find(f => f.id === id);
    if (exists) return;
    
    favorites.unshift({
      id,
      type,
      itemId,
      addedAt: Date.now()
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  },

  removeFavorite(type: 'medication' | 'pharmacy', itemId: number): void {
    const favorites = this.getFavorites();
    const id = `${type}-${itemId}`;
    const filtered = favorites.filter(f => f.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  },

  isFavorite(type: 'medication' | 'pharmacy', itemId: number): boolean {
    const favorites = this.getFavorites();
    const id = `${type}-${itemId}`;
    return favorites.some(f => f.id === id);
  },

  toggleFavorite(type: 'medication' | 'pharmacy', itemId: number): boolean {
    if (this.isFavorite(type, itemId)) {
      this.removeFavorite(type, itemId);
      return false;
    } else {
      this.addFavorite(type, itemId);
      return true;
    }
  },

  getFavorites(): FavoriteItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  },

  getFavoriteMedications(): Medication[] {
    const favorites = this.getFavorites();
    const medicationFavorites = favorites.filter(f => f.type === 'medication');
    return medicationFavorites
      .map(f => dataService.getMedicationById(f.itemId))
      .filter((med): med is Medication => med !== undefined);
  },

  getFavoritePharmacies(): Pharmacy[] {
    const favorites = this.getFavorites();
    const pharmacyFavorites = favorites.filter(f => f.type === 'pharmacy');
    return pharmacyFavorites
      .map(f => dataService.getPharmacyById(f.itemId))
      .filter((pharmacy): pharmacy is Pharmacy => pharmacy !== undefined);
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
};

