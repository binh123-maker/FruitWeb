import { apiClient } from './client';
import type { CartItem, Product } from '../types';

export interface BackendCartProduct {
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
  product: BackendCartProduct;
  unit_price: number;
  subtotal: number;
}

export interface BackendCartResponse {
  items: BackendCartItem[];
  total_items: number;
  total_price: number;
}

export function mapBackendCartItemToFrontend(item: BackendCartItem, selected = true): CartItem {
  const p = item.product;
  const product: Product = {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    description: '',
    price: p.price,
    salePrice: p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : undefined,
    image: p.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    category: '',
    origin: 'Việt Nam',
    stock: p.stock,
    unit: p.unit || 'kg',
    rating: 5.0,
    reviewCount: 0,
    soldCount: 0,
    createdAt: new Date().toISOString(),
    isOrganic: true,
  };

  return {
    product,
    quantity: item.quantity,
    selected,
  };
}

export const cartApi = {
  /**
   * Lấy giỏ hàng từ server
   */
  async getCart(): Promise<BackendCartResponse> {
    return apiClient.get<BackendCartResponse>('/api/cart');
  },

  /**
   * Thêm sản phẩm vào giỏ hàng trên server
   */
  async addItem(productId: number, quantity: number = 1): Promise<BackendCartResponse> {
    return apiClient.post<BackendCartResponse>('/api/cart/items', {
      product_id: productId,
      quantity,
    });
  },

  /**
   * Cập nhật số lượng sản phẩm trên server
   */
  async updateItem(productId: number, quantity: number): Promise<BackendCartResponse> {
    return apiClient.put<BackendCartResponse>(`/api/cart/items/${productId}`, {
      quantity,
    });
  },

  /**
   * Xóa một sản phẩm khỏi giỏ hàng trên server
   */
  async removeItem(productId: number): Promise<BackendCartResponse> {
    return apiClient.delete<BackendCartResponse>(`/api/cart/items/${productId}`);
  },

  /**
   * Xóa toàn bộ giỏ hàng trên server
   */
  async clearCart(): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>('/api/cart');
  },
};
