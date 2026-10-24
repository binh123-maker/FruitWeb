import { CartItem, Product } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { cartApi, mapBackendCartItemToFrontend } from '../api/cartApi';
import { getAccessToken } from '../api/client';

export const cartService = {
  /**
   * Lấy giỏ hàng: nếu đã đăng nhập thì lấy từ Backend API PostgreSQL, nếu là khách thì lấy từ localStorage
   */
  async getCart(): Promise<CartItem[]> {
    const token = getAccessToken();
    const localCart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);

    if (!token) {
      return localCart;
    }

    try {
      const serverRes = await cartApi.getCart();
      const serverItems = serverRes.items || [];

      // Map server items to frontend format while preserving previous selection state
      const selectionMap = new Map<string, boolean>();
      localCart.forEach((item) => {
        selectionMap.set(String(item.product.id), item.selected !== false);
      });

      const frontendItems = serverItems.map((item) => {
        const prodId = String(item.product_id);
        const isSelected = selectionMap.has(prodId) ? selectionMap.get(prodId)! : true;
        return mapBackendCartItemToFrontend(item, isSelected);
      });

      storage.setItem(STORAGE_KEYS.CART, frontendItems);
      return frontendItems;
    } catch (err) {
      console.warn('Không thể đồng bộ giỏ hàng từ server, sử dụng bộ nhớ tạm:', err);
      return localCart;
    }
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(product: Product, quantity = 1): Promise<CartItem[]> {
    const token = getAccessToken();
    const localCart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const numId = parseInt(product.id, 10);

    if (token && !isNaN(numId)) {
      try {
        const serverRes = await cartApi.addItem(numId, quantity);
        const frontendItems = (serverRes.items || []).map((item) => {
          const prev = localCart.find((c) => String(c.product.id) === String(item.product_id));
          return mapBackendCartItemToFrontend(item, prev?.selected !== false);
        });
        storage.setItem(STORAGE_KEYS.CART, frontendItems);
        return frontendItems;
      } catch (err) {
        console.error('Lỗi thêm sản phẩm vào giỏ hàng backend:', err);
      }
    }

    // Fallback/Guest localStorage
    const existingIndex = localCart.findIndex((item) => item.product.id === product.id);
    if (existingIndex > -1) {
      localCart[existingIndex].quantity += quantity;
    } else {
      localCart.push({ product, quantity, selected: true });
    }
    storage.setItem(STORAGE_KEYS.CART, localCart);
    return localCart;
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  async updateQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    const token = getAccessToken();
    const localCart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const numId = parseInt(productId, 10);

    if (token && !isNaN(numId)) {
      try {
        let serverRes;
        if (quantity <= 0) {
          serverRes = await cartApi.removeItem(numId);
        } else {
          serverRes = await cartApi.updateItem(numId, quantity);
        }
        const frontendItems = (serverRes.items || []).map((item) => {
          const prev = localCart.find((c) => String(c.product.id) === String(item.product_id));
          return mapBackendCartItemToFrontend(item, prev?.selected !== false);
        });
        storage.setItem(STORAGE_KEYS.CART, frontendItems);
        return frontendItems;
      } catch (err) {
        console.error('Lỗi cập nhật giỏ hàng backend:', err);
      }
    }

    // Fallback/Guest
    let updatedCart: CartItem[];
    if (quantity <= 0) {
      updatedCart = localCart.filter((item) => item.product.id !== productId);
    } else {
      updatedCart = localCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
    }
    storage.setItem(STORAGE_KEYS.CART, updatedCart);
    return updatedCart;
  },

  /**
   * Chọn/bỏ chọn một sản phẩm (UI state)
   */
  async toggleSelect(productId: string): Promise<CartItem[]> {
    const cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const updated = cart.map((item) =>
      item.product.id === productId ? { ...item, selected: !item.selected } : item
    );
    storage.setItem(STORAGE_KEYS.CART, updated);
    return updated;
  },

  /**
   * Chọn/bỏ chọn tất cả sản phẩm (UI state)
   */
  async toggleSelectAll(selected: boolean): Promise<CartItem[]> {
    const cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const updated = cart.map((item) => ({ ...item, selected }));
    storage.setItem(STORAGE_KEYS.CART, updated);
    return updated;
  },

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   */
  async removeFromCart(productId: string): Promise<CartItem[]> {
    return this.updateQuantity(productId, 0);
  },

  /**
   * Xóa toàn bộ sản phẩm trong giỏ hàng
   */
  async clearCart(): Promise<void> {
    const token = getAccessToken();
    if (token) {
      try {
        await cartApi.clearCart();
      } catch (err) {
        console.error('Lỗi xóa giỏ hàng backend:', err);
      }
    }
    storage.setItem(STORAGE_KEYS.CART, []);
  },

  /**
   * Đồng bộ giỏ hàng của khách sau khi đăng nhập lên Backend
   */
  async syncGuestCartToServer(): Promise<CartItem[]> {
    const token = getAccessToken();
    if (!token) return [];

    const localCart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    if (localCart.length > 0) {
      for (const item of localCart) {
        const numId = parseInt(item.product.id, 10);
        if (!isNaN(numId)) {
          try {
            await cartApi.addItem(numId, item.quantity);
          } catch (err) {
            console.warn(`Lỗi đồng bộ sản phẩm ${item.product.name} lên server:`, err);
          }
        }
      }
    }

    return this.getCart();
  },
};
