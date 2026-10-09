import { apiClient } from './client';

export interface BackendOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface BackendOrder {
  id: number;
  user_id: number;
  status: string; // 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled'
  subtotal: number | null;
  discount_amount: number;
  coupon_code: string | null;
  total_amount: number;
  shipping_address: string | null;
  customer_name: string | null;
  phone: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  items: BackendOrderItem[];
}

export interface PaginatedBackendOrders {
  items: BackendOrder[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface OrderItemCreatePayload {
  product_id: number;
  quantity: number;
}

export interface OrderCreatePayload {
  items?: OrderItemCreatePayload[];
  shipping_address: string;
  customer_name?: string;
  phone?: string;
  coupon_code?: string;
  payment_method?: string;
}

export const orderApi = {
  /**
   * Tạo đơn hàng mới từ giỏ hàng hoặc danh sách mặt hàng
   */
  async createOrder(payload: OrderCreatePayload): Promise<BackendOrder> {
    return apiClient.post<BackendOrder>('/api/orders', payload);
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  async getUserOrders(): Promise<BackendOrder[]> {
    return apiClient.get<BackendOrder[]>('/api/orders');
  },

  /**
   * Xem chi tiết một đơn hàng theo ID
   */
  async getOrderDetail(orderId: number): Promise<BackendOrder> {
    return apiClient.get<BackendOrder>(`/api/orders/${orderId}`);
  },

  /**
   * Người dùng hủy đơn hàng (khi còn ở trạng thái pending)
   */
  async cancelOrder(orderId: number): Promise<BackendOrder> {
    return apiClient.put<BackendOrder>(`/api/orders/${orderId}/cancel`);
  },

  /**
   * ADMIN: Lấy toàn bộ đơn hàng hệ thống (có lọc status và phân trang)
   */
  async adminGetOrders(params: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedBackendOrders> {
    return apiClient.get<PaginatedBackendOrders>('/api/orders/admin/all', { params });
  },

  /**
   * ADMIN: Cập nhật trạng thái đơn hàng
   */
  async adminUpdateOrderStatus(orderId: number, status: string): Promise<BackendOrder> {
    return apiClient.put<BackendOrder>(`/api/orders/admin/${orderId}/status`, { status });
  },
};
