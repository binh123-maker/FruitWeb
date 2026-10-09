import { apiClient } from './client';

export interface BackendCartItemProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  image: string | null;
  stock: number;
  unit: string;
  is_active: boolean;
}

export interface BackendCartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: BackendCartItemProduct;
  unit_price: number;
  subtotal: number;
}

export interface BackendCartResponse {
  items: BackendCartItem[];
  total_items: number;
  total_price: number;
}

export const cartApi = {
  /**
   * Lấy toàn bộ thông tin giỏ hàng của tài khoản hiện tại
   */
  async getCart(): Promise<BackendCartResponse> {
    return apiClient.get<BackendCartResponse>('/api/cart');
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(productId: number, quantity = 1): Promise<BackendCartResponse> {
    return apiClient.post<BackendCartResponse>('/api/cart/items', {
      product_id: productId,
      quantity,
    });
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  async updateCartItem(itemId: number, quantity: number): Promise<BackendCartResponse> {
    return apiClient.put<BackendCartResponse>(`/api/cart/items/${itemId}`, {
      quantity,
    });
  },

  /**
   * Xóa một sản phẩm khỏi giỏ hàng
   */
  async removeCartItem(itemId: number): Promise<BackendCartResponse> {
    return apiClient.delete<BackendCartResponse>(`/api/cart/items/${itemId}`);
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(): Promise<BackendCartResponse> {
    return apiClient.delete<BackendCartResponse>('/api/cart');
  },
};
