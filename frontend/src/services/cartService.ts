import { CartItem, Product } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    await delay(100);
    return storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  async addToCart(product: Product, quantity = 1): Promise<CartItem[]> {
    await delay(150);
    const cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ product, quantity, selected: true });
    }

    storage.setItem(STORAGE_KEYS.CART, cart);
    return cart;
  },

  async updateQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    await delay(100);
    let cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);

    if (quantity <= 0) {
      cart = cart.filter((item) => item.product.id !== productId);
    } else {
      const index = cart.findIndex((item) => item.product.id === productId);
      if (index > -1) {
        cart[index].quantity = quantity;
      }
    }

    storage.setItem(STORAGE_KEYS.CART, cart);
    return cart;
  },

  async toggleSelect(productId: string): Promise<CartItem[]> {
    await delay(50);
    const cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const index = cart.findIndex((item) => item.product.id === productId);
    if (index > -1) {
      cart[index].selected = !cart[index].selected;
      storage.setItem(STORAGE_KEYS.CART, cart);
    }
    return cart;
  },

  async toggleSelectAll(selected: boolean): Promise<CartItem[]> {
    await delay(50);
    const cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const updated = cart.map((item) => ({ ...item, selected }));
    storage.setItem(STORAGE_KEYS.CART, updated);
    return updated;
  },

  async removeFromCart(productId: string): Promise<CartItem[]> {
    await delay(100);
    const cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const filtered = cart.filter((item) => item.product.id !== productId);
    storage.setItem(STORAGE_KEYS.CART, filtered);
    return filtered;
  },

  async clearCart(): Promise<void> {
    await delay(100);
    storage.setItem(STORAGE_KEYS.CART, []);
  }
};
