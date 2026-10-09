import { Order, OrderItem, OrderStatus, PaymentMethod, PaymentStatus, BackendOrderStatus } from '../types';
import { orderApi, BackendOrder, OrderCreatePayload } from '../api/orderApi';
import { getAccessToken } from '../api/client';

export function mapBackendStatusToDisplay(status: string): OrderStatus {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'Chờ xác nhận';
    case 'confirmed':
      return 'Đã xác nhận';
    case 'shipping':
      return 'Đang giao';
    case 'delivered':
      return 'Đã giao';
    case 'cancelled':
      return 'Đã hủy';
    default:
      return status as OrderStatus;
  }
}

export function mapDisplayStatusToBackend(status: string): string {
  switch (status) {
    case 'Chờ xác nhận':
      return 'pending';
    case 'Đã xác nhận':
      return 'confirmed';
    case 'Đang giao':
      return 'shipping';
    case 'Đã giao':
      return 'delivered';
    case 'Đã hủy':
      return 'cancelled';
    default:
      return status.toLowerCase();
  }
}

export function mapBackendOrderToFrontend(b: BackendOrder): Order {
  const displayStatus = mapBackendStatusToDisplay(b.status);
  const paymentStatus: PaymentStatus =
    b.status.toLowerCase() === 'delivered' ? 'Đã thanh toán' : 'Chưa thanh toán';

  const items: OrderItem[] = (b.items || []).map((it) => ({
    id: it.id,
    productId: String(it.product_id),
    productName: it.product_name,
    productImage:
      it.product_image ||
      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    price: it.unit_price,
    quantity: it.quantity,
    unit: 'kg',
    subtotal: it.subtotal,
  }));

  const calculatedSubtotal =
    b.subtotal ?? items.reduce((acc, it) => acc + (it.subtotal || it.price * it.quantity), 0);

  return {
    id: String(b.id),
    userId: String(b.user_id),
    customerName: b.customer_name || 'Khách hàng',
    customerPhone: b.phone || '',
    shippingAddress: b.shipping_address || 'Địa chỉ nhận hàng',
    items,
    subtotal: calculatedSubtotal,
    shippingFee: 0,
    discount: b.discount_amount || 0,
    total: b.total_amount,
    paymentMethod: (b.payment_method as PaymentMethod) || 'COD',
    paymentStatus,
    orderStatus: displayStatus,
    rawStatus: b.status as BackendOrderStatus,
    couponCode: b.coupon_code || undefined,
    createdAt: b.created_at,
    updatedAt: b.updated_at,
  };
}

export const orderService = {
  /**
   * Tạo đơn hàng mới
   */
  async createOrder(data: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    shippingAddress: string;
    items?: OrderItem[];
    couponCode?: string;
    paymentMethod?: PaymentMethod;
    note?: string;
  }): Promise<Order> {
    const payload: OrderCreatePayload = {
      shipping_address: data.shippingAddress,
      customer_name: data.customerName,
      phone: data.customerPhone,
      coupon_code: data.couponCode,
      payment_method: data.paymentMethod || 'COD',
    };

    // Nếu gửi kèm danh sách items trực tiếp
    if (data.items && data.items.length > 0) {
      payload.items = data.items.map((i) => ({
        product_id: Number(i.productId),
        quantity: i.quantity,
      }));
    }

    const createdBackendOrder = await orderApi.createOrder(payload);
    return mapBackendOrderToFrontend(createdBackendOrder);
  },

  /**
   * Lấy danh sách đơn hàng của người dùng hiện tại
   */
  async getUserOrders(_userId?: string): Promise<Order[]> {
    if (!getAccessToken()) return [];
    const list = await orderApi.getUserOrders();
    return list.map(mapBackendOrderToFrontend);
  },

  /**
   * Lấy chi tiết đơn hàng theo ID
   */
  async getOrderById(id: string | number): Promise<Order | null> {
    try {
      const order = await orderApi.getOrderDetail(Number(id));
      return mapBackendOrderToFrontend(order);
    } catch (err) {
      console.error('Failed to get order detail:', err);
      return null;
    }
  },

  /**
   * Người dùng hủy đơn hàng
   */
  async cancelOrder(id: string | number): Promise<Order> {
    const cancelled = await orderApi.cancelOrder(Number(id));
    return mapBackendOrderToFrontend(cancelled);
  },

  /**
   * ADMIN: Lấy danh sách tất cả đơn hàng hệ thống
   */
  async getOrders(params: { status?: string; page?: number; limit?: number } = {}): Promise<Order[]> {
    const res = await orderApi.adminGetOrders(params);
    return res.items.map(mapBackendOrderToFrontend);
  },

  /**
   * ADMIN: Cập nhật trạng thái đơn hàng
   */
  async updateOrderStatus(id: string | number, status: OrderStatus): Promise<Order> {
    const backendStatus = mapDisplayStatusToBackend(status);
    const updated = await orderApi.adminUpdateOrderStatus(Number(id), backendStatus);
    return mapBackendOrderToFrontend(updated);
  },
};
