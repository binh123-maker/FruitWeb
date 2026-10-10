import { Order, OrderItem, PaymentMethod, PaymentStatus, OrderStatus } from '../types';
import { apiClient } from '../api/client';
import { mockStore, isMockMode } from '../mock/mockStore';

export interface BackendOrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_slug?: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface BackendOrder {
  id: number;
  user_id: number;
  status: string;
  subtotal?: number;
  discount_amount?: number;
  coupon_code?: string;
  total_amount: number;
  shipping_address?: string;
  customer_name?: string;
  phone?: string;
  payment_method?: string;
  payment_status?: string;
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

const STATUS_MAP_FROM_BACKEND: Record<string, OrderStatus> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const STATUS_MAP_TO_BACKEND: Record<string, string> = {
  'Chờ xác nhận': 'pending',
  'Đã xác nhận': 'confirmed',
  'Đang giao': 'shipping',
  'Đã giao': 'delivered',
  'Đã hủy': 'cancelled',
};

export function mapBackendOrderToFrontend(raw: BackendOrder): Order {
  const orderStatus: OrderStatus =
    STATUS_MAP_FROM_BACKEND[raw.status] || (raw.status as OrderStatus) || 'Chờ xác nhận';

  let paymentStatus: PaymentStatus = 'Chưa thanh toán';
  if (raw.payment_status === 'paid_mock' || (!raw.payment_status && raw.payment_method === 'ONLINE_MOCK')) {
    paymentStatus = 'Đã thanh toán (mô phỏng)';
  } else if (raw.payment_status === 'paid' || (!raw.payment_status && raw.status === 'delivered')) {
    paymentStatus = 'Đã thanh toán';
  } else if (raw.payment_status === 'refunded') {
    paymentStatus = 'Đã hoàn tiền';
  } else {
    paymentStatus = 'Chưa thanh toán';
  }

  return {
    id: String(raw.id),
    userId: String(raw.user_id),
    customerName: raw.customer_name || 'Khách hàng',
    customerPhone: raw.phone || '',
    customerEmail: '',
    shippingAddress: raw.shipping_address || '',
    items: (raw.items || []).map((it) => ({
      productId: String(it.product_id),
      productName: it.product_name,
      productImage: it.product_image || '',
      price: Number(it.unit_price),
      quantity: Number(it.quantity),
      unit: 'Kg',
    })),
    subtotal: Number(raw.subtotal !== undefined && raw.subtotal !== null ? raw.subtotal : raw.total_amount),
    shippingFee: 0,
    discount: Number(raw.discount_amount || 0),
    total: Number(raw.total_amount),
    paymentMethod: (raw.payment_method as PaymentMethod) || 'COD',
    paymentStatus,
    orderStatus,
    couponCode: raw.coupon_code || undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

export const orderService = {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(data: {
    userId?: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    items: OrderItem[];
    subtotal?: number;
    shippingFee?: number;
    discount?: number;
    total?: number;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    note?: string;
  }): Promise<Order> {
    if (isMockMode()) {
      throw new Error(
        'Hệ thống đang ở chế độ Demo giao diện (Mock Mode). Chức năng đặt hàng và thanh toán thực tế chỉ hoạt động khi kết nối Backend API.'
      );
    }

    const payload = {
      shipping_address: data.shippingAddress.trim(),
      customer_name: data.customerName.trim(),
      phone: data.customerPhone.trim(),
      coupon_code: data.couponCode?.trim() || undefined,
      payment_method: data.paymentMethod || 'COD',
      items: (data.items || []).map((item) => {
        const parsedId = parseInt(item.productId, 10);
        return {
          product_id: isNaN(parsedId) ? item.productId : parsedId,
          quantity: item.quantity,
        };
      }),
    };

    const res = await apiClient.post<BackendOrder>('/api/orders', payload);
    return mapBackendOrderToFrontend(res);
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  async getUserOrders(_userId?: string): Promise<Order[]> {
    if (isMockMode()) {
      return mockStore.getOrders();
    }
    const res = await apiClient.get<BackendOrder[]>('/api/orders');
    return (res || []).map(mapBackendOrderToFrontend);
  },

  /**
   * Lấy danh sách tất cả đơn hàng cho Admin quản trị
   */
  async getOrders(params?: { status?: string; page?: number; limit?: number }): Promise<Order[]> {
    if (isMockMode()) {
      return mockStore.getOrders();
    }
    const res = await apiClient.get<PaginatedBackendOrders>('/api/orders/admin/all', {
      params: {
        status: params?.status,
        page: params?.page || 1,
        limit: params?.limit || 100,
      },
    });
    return (res?.items || []).map(mapBackendOrderToFrontend);
  },

  /**
   * Lấy chi tiết một đơn hàng theo ID
   */
  async getOrderById(id: string): Promise<Order | null> {
    if (isMockMode()) {
      const orders = await mockStore.getOrders();
      return orders.find((o) => o.id === id) || null;
    }
    try {
      const res = await apiClient.get<BackendOrder>(`/api/orders/${id}`);
      return mapBackendOrderToFrontend(res);
    } catch {
      return null;
    }
  },

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(id: string): Promise<Order> {
    if (isMockMode()) {
      const orders = await mockStore.getOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      order.orderStatus = 'Đã hủy';
      return order;
    }
    const res = await apiClient.put<BackendOrder>(`/api/orders/${id}/cancel`);
    return mapBackendOrderToFrontend(res);
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async updateOrderStatus(id: string, status: OrderStatus | string): Promise<Order> {
    if (isMockMode()) {
      const orders = await mockStore.getOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      order.orderStatus = status as OrderStatus;
      return order;
    }

    if (status === 'Đã hủy' || status === 'cancelled') {
      return this.cancelOrder(id);
    }

    const backendStatus = STATUS_MAP_TO_BACKEND[status] || status.toLowerCase();
    const res = await apiClient.put<BackendOrder>(`/api/orders/admin/${id}/status`, {
      status: backendStatus,
    });
    return mapBackendOrderToFrontend(res);
  },

  /**
   * Admin cập nhật trạng thái thanh toán
   */
  async adminUpdatePaymentStatus(
    id: string,
    paymentStatus: PaymentStatus | 'unpaid' | 'paid' | 'paid_mock' | 'refunded'
  ): Promise<Order> {
    if (isMockMode()) {
      const orders = await mockStore.getOrders();
      const order = orders.find((o) => o.id === id);
      if (!order) throw new Error('Không tìm thấy đơn hàng');
      order.paymentStatus = paymentStatus as PaymentStatus;
      return order;
    }

    const PAYMENT_STATUS_TO_BACKEND: Record<string, string> = {
      'Chưa thanh toán': 'unpaid',
      'Đã thanh toán': 'paid',
      'Đã thanh toán (mô phỏng)': 'paid_mock',
      'Đã hoàn tiền': 'refunded',
      unpaid: 'unpaid',
      paid: 'paid',
      paid_mock: 'paid_mock',
      refunded: 'refunded',
    };
    const backendPaymentStatus = PAYMENT_STATUS_TO_BACKEND[paymentStatus] || paymentStatus;
    const res = await apiClient.put<BackendOrder>(`/api/orders/admin/${id}/payment-status`, {
      payment_status: backendPaymentStatus,
    });
    return mapBackendOrderToFrontend(res);
  },
};
