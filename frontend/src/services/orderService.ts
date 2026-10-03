import { Order, OrderItem, PaymentMethod, PaymentStatus, OrderStatus } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { INITIAL_ORDERS } from '../mock/data';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredOrders = (): Order[] => {
  const existing = storage.getItem<Order[]>(STORAGE_KEYS.ORDERS, []);
  if (existing.length === 0) {
    storage.setItem(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }
  return existing;
};

export const orderService = {
  async createOrder(data: {
    userId: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    discount: number;
    total: number;
    paymentMethod: PaymentMethod;
    couponCode?: string;
    note?: string;
  }): Promise<Order> {
    await delay(400);
    const orders = getStoredOrders();

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `FF-${dateStr}-${randomNum}`;

    const newOrder: Order = {
      ...data,
      id: orderId,
      paymentStatus: data.paymentMethod === 'ONLINE_MOCK' ? 'Đã thanh toán' : 'Chưa thanh toán',
      orderStatus: 'Chờ xác nhận',
      createdAt: new Date().toISOString(),
    };

    orders.unshift(newOrder);
    storage.setItem(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  async getOrders(): Promise<Order[]> {
    await delay(250);
    return getStoredOrders();
  },

  async getUserOrders(userId: string): Promise<Order[]> {
    await delay(250);
    const orders = getStoredOrders();
    return orders.filter((o) => o.userId === userId || o.customerEmail === userId);
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay(200);
    const orders = getStoredOrders();
    return orders.find((o) => o.id === id) || null;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
    await delay(300);
    const orders = getStoredOrders();
    const index = orders.findIndex((o) => o.id === id);
    if (index === -1) throw new Error('Không tìm thấy đơn hàng!');

    orders[index].orderStatus = status;
    orders[index].updatedAt = new Date().toISOString();

    if (status === 'Đã giao') {
      orders[index].paymentStatus = 'Đã thanh toán';
    }

    storage.setItem(STORAGE_KEYS.ORDERS, orders);
    return orders[index];
  }
};
