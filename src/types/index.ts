export type UserRole = 'USER' | 'ADMIN';
export type OrderStatus = 'Chờ xác nhận' | 'Đã xác nhận' | 'Đang giao' | 'Đã giao' | 'Đã hủy';
export type PaymentMethod = 'COD' | 'ONLINE_MOCK';
export type PaymentStatus = 'Chưa thanh toán' | 'Đã thanh toán';

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  addresses?: Address[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  image: string;
  images?: string[];
  category: string; // Category slug
  categoryName?: string;
  origin: string; // e.g. Đà Lạt, Úc, Mỹ
  unit: string; // e.g. kg, hộp, túi, quả
  stock: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isOrganic?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
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
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  couponCode?: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Coupon {
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number; // e.g., 10 for 10%, 50000 for 50k VND
  minSpend: number;
  description: string;
  expiryDate: string;
  isActive: boolean;
}

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isOrganic?: boolean;
  inStockOnly?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'bestseller' | 'rating';
  page?: number;
  limit?: number;
}
