import type { CartItem, Cart } from '@/models/Cart';
import { apiService } from './api';
import type {
  GetCartApiResponse,
  AddToCartApiResponse,
  UpdateCartItemApiResponse
} from '@/models/api';
import {
  unwrapApiResponse,
  transformCart,
  transformCartItem
} from '@/utils/responseTransformers';

export interface AddToCartRequest {
  pharmacy_drug_price_id: number;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface SyncCartRequest {
  items: AddToCartRequest[];
}

export const cartService = {
  /**
   * Get user's cart
   * @returns Cart object with items and totals
   */
  async getCart(): Promise<Cart> {
    const response = await apiService.getAuth<GetCartApiResponse>('/cart');
    const apiCart = unwrapApiResponse(response);
    return transformCart(apiCart);
  },

  /**
   * Add item to cart
   * @param item - Cart item to add
   * @returns Added cart item
   */
  async addToCart(item: AddToCartRequest): Promise<CartItem> {
    const response = await apiService.postAuth<AddToCartApiResponse>('/cart/items', item);
    const apiItem = unwrapApiResponse(response);
    return transformCartItem(apiItem);
  },

  /**
   * Update cart item quantity
   * @param itemId - Cart item ID
   * @param quantity - New quantity
   * @returns Updated cart item
   */
  async updateCartItem(itemId: string | number, quantity: number): Promise<CartItem> {
    const response = await apiService.putAuth<UpdateCartItemApiResponse>(
      `/cart/items/${itemId}`,
      { quantity }
    );
    const apiItem = unwrapApiResponse(response);
    return transformCartItem(apiItem);
  },

  /**
   * Remove item from cart
   * @param itemId - Cart item ID to remove
   */
  async removeFromCart(itemId: string | number): Promise<void> {
    return await apiService.deleteAuth<void>(`/cart/items/${itemId}`);
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<void> {
    return await apiService.deleteAuth<void>('/cart/clear');
  },

  /**
   * Sync local cart with server
   * @param items - Array of cart items to sync
   * @returns Synced cart
   */
  async syncCart(items: AddToCartRequest[]): Promise<Cart> {
    const response = await apiService.postAuth<GetCartApiResponse>('/cart/sync', { items });
    const apiCart = unwrapApiResponse(response);
    return transformCart(apiCart);
  }
};
