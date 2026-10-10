import { Coupon } from '../types';
import { apiClient } from '../api/client';
import { mockStore, isMockMode } from '../mock/mockStore';

export interface BackendCouponResponse {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number | null;
  usage_limit?: number | null;
  usage_count: number;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackendCouponValidateResponse {
  valid: boolean;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  message: string;
}

function mapBackendCouponToFrontend(raw: BackendCouponResponse): Coupon {
  return {
    code: raw.code,
    type: raw.discount_type === 'percentage' ? 'PERCENT' : 'FIXED',
    value: Number(raw.discount_value),
    minSpend: Number(raw.min_order_amount || 0),
    description:
      raw.discount_type === 'percentage'
        ? `Giảm ${raw.discount_value}% cho đơn từ ${Number(raw.min_order_amount).toLocaleString('vi-VN')}đ`
        : `Giảm ${Number(raw.discount_value).toLocaleString('vi-VN')}đ cho đơn từ ${Number(raw.min_order_amount).toLocaleString('vi-VN')}đ`,
    expiryDate: raw.end_date || 'Không thời hạn',
    isActive: raw.is_active,
  };
}

export const couponService = {
  /**
   * Lấy danh sách mã giảm giá đang hoạt động
   */
  async getCoupons(): Promise<Coupon[]> {
    if (isMockMode()) {
      return mockStore.getCoupons();
    }

    try {
      const res = await apiClient.get<BackendCouponResponse[]>('/api/coupons');
      return (res || []).map(mapBackendCouponToFrontend);
    } catch {
      return [];
    }
  },

  /**
   * Xác thực mã giảm giá
   */
  async validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discountAmount: number }> {
    if (isMockMode()) {
      return mockStore.validateCoupon(code, subtotal);
    }

    const payload = {
      code: code.trim().toUpperCase(),
      order_amount: subtotal,
    };

    const res = await apiClient.post<BackendCouponValidateResponse>('/api/coupons/validate', payload);

    const coupon: Coupon = {
      code: res.code,
      type: res.discount_type === 'percentage' ? 'PERCENT' : 'FIXED',
      value: Number(res.discount_value),
      minSpend: 0,
      description: res.message,
      expiryDate: '',
      isActive: true,
    };

    return {
      coupon,
      discountAmount: Number(res.discount_amount),
    };
  },
};
