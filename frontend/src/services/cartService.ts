import { CartItem, Product } from '../types';
import { cartApi, BackendCartResponse } from '../api/cartApi';
import { getAccessToken } from '../api/client';
import { storage, STORAGE_KEYS } from '../utils/storage';

const SELECTION_STORAGE_KEY = 'freshfruit_cart_unselected';

function getUnselectedProductIds(): Set<string> {
  const list = storage.getItem<string[]>(SELECTION_STORAGE_KEY, []);
  return new Set(list);
}

function saveUnselectedProductIds(set: Set<string>): void {
  storage.setItem(SELECTION_STORAGE_KEY, Array.from(set));
}

function mapBackendCartToFrontend(res: BackendCartResponse): CartItem[] {
  const unselected = getUnselectedProductIds();
  return (res.items || []).map((item) => {
    const prod = item.product;
    const strId = String(prod.id);
    const fallbackImage =
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80';

    const frontendProduct: Product = {
      id: strId,
      name: prod.name,
      slug: prod.slug,
      description: '',
      price: prod.price,
      salePrice: prod.sale_price !== null && prod.sale_price !== undefined ? prod.sale_price : undefined,
      image: prod.image || fallbackImage,
      images: prod.image ? [prod.image] : [],
      category: '',
      origin: 'Việt Nam',
      unit: prod.unit || 'kg',
      stock: prod.stock,
      rating: 5,
      reviewCount: 0,
      soldCount: 0,
      createdAt: new Date().toISOString(),
    };

    return {
      id: item.id,
      product: frontendProduct,
      quantity: item.quantity,
      selected: !unselected.has(strId),
      unitPrice: item.unit_price,
      subtotal: item.subtotal,
    };
  });
}

export const cartService = {
  /**
   * Lấy danh sách sản phẩm trong giỏ hàng
   */
  async getCart(): Promise<CartItem[]> {
    if (getAccessToken()) {
      try {
        const backendCart = await cartApi.getCart();
        return mapBackendCartToFrontend(backendCart);
      } catch (err) {
        console.error('Failed to fetch backend cart:', err);
        // Fallback to local storage if network glitch occurs
      }
    }
    // Guest cart
    return storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(product: Product, quantity = 1): Promise<CartItem[]> {
    if (getAccessToken()) {
      const backendCart = await cartApi.addToCart(Number(product.id), quantity);
      return mapBackendCartToFrontend(backendCart);
    }

    // Guest cart fallback
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

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  async updateQuantity(productId: string, quantity: number): Promise<CartItem[]> {
    if (getAccessToken()) {
      const currentCart = await cartApi.getCart();
      const targetItem = currentCart.items.find((item) => String(item.product.id) === productId || String(item.id) === productId);

      if (targetItem) {
        if (quantity <= 0) {
          const updated = await cartApi.removeCartItem(targetItem.id);
          return mapBackendCartToFrontend(updated);
        } else {
          const updated = await cartApi.updateCartItem(targetItem.id, quantity);
          return mapBackendCartToFrontend(updated);
        }
      }
      return mapBackendCartToFrontend(currentCart);
    }

    // Guest cart fallback
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

  /**
   * Chọn / Bỏ chọn sản phẩm để thanh toán
   */
  async toggleSelect(productId: string): Promise<CartItem[]> {
    const unselected = getUnselectedProductIds();
    if (unselected.has(productId)) {
      unselected.delete(productId);
    } else {
      unselected.add(productId);
    }
    saveUnselectedProductIds(unselected);

    return this.getCart();
  },

  /**
   * Chọn / Bỏ chọn tất cả sản phẩm
   */
  async toggleSelectAll(selected: boolean): Promise<CartItem[]> {
    const current = await this.getCart();
    const unselected = new Set<string>();

    if (!selected) {
      current.forEach((item) => unselected.add(item.product.id));
    }
    saveUnselectedProductIds(unselected);

    return current.map((item) => ({ ...item, selected }));
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  async removeFromCart(productId: string): Promise<CartItem[]> {
    if (getAccessToken()) {
      const currentCart = await cartApi.getCart();
      const targetItem = currentCart.items.find((item) => String(item.product.id) === productId || String(item.id) === productId);

      if (targetItem) {
        const updated = await cartApi.removeCartItem(targetItem.id);
        return mapBackendCartToFrontend(updated);
      }
      return mapBackendCartToFrontend(currentCart);
    }

    // Guest cart fallback
    const cart = storage.getItem<CartItem[]>(STORAGE_KEYS.CART, []);
    const filtered = cart.filter((item) => item.product.id !== productId);
    storage.setItem(STORAGE_KEYS.CART, filtered);
    return filtered;
  },

  /**
   * Làm trống toàn bộ giỏ hàng
   */
  async clearCart(): Promise<void> {
    if (getAccessToken()) {
      try {
        await cartApi.clearCart();
      } catch (err) {
        console.error('Failed to clear backend cart:', err);
      }
    }
    storage.setItem(STORAGE_KEYS.CART, []);
    storage.setItem(SELECTION_STORAGE_KEY, []);
  },
};
