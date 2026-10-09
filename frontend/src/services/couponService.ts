import { Coupon } from '../types';
import { couponApi, BackendCoupon } from '../api/couponApi';
import { getAccessToken } from '../api/client';

function mapBackendCouponToFrontend(b: BackendCoupon): Coupon {
  const isPercent = b.discount_type === 'percentage';
  const desc = isPercent
    ? `Giảm ${b.discount_value}% cho đơn từ ${b.min_order_amount.toLocaleString('vi-VN')}đ`
    : `Giảm ${b.discount_value.toLocaleString('vi-VN')}đ cho đơn từ ${b.min_order_amount.toLocaleString('vi-VN')}đ`;

  return {
    id: b.id,
    code: b.code,
    type: isPercent ? 'PERCENT' : 'FIXED',
    value: b.discount_value,
    minSpend: b.min_order_amount,
    maxDiscount: b.max_discount_amount ?? undefined,
    description: desc,
    expiryDate: b.end_date || 'Không giới hạn',
    usageLimit: b.usage_limit ?? undefined,
    usageCount: b.usage_count,
    isActive: b.is_active,
  };
}

export const couponService = {
  /**
   * Lấy danh sách các coupon đang khả dụng từ backend
   */
  async getCoupons(): Promise<Coupon[]> {
    if (getAccessToken()) {
      try {
        const list = await couponApi.getCoupons();
        return list.map(mapBackendCouponToFrontend);
      } catch (err) {
        console.error('Failed to fetch coupons from backend:', err);
      }
    }
    return [];
  },

  /**
   * Kiểm tra mã coupon với giá trị đơn hàng thực tế qua backend
   */
  async validateCoupon(
    code: string,
    subtotal: number
  ): Promise<{ coupon: Coupon; discountAmount: number }> {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      throw new Error('Vui lòng nhập mã giảm giá!');
    }

    // Call backend endpoint POST /api/coupons/validate
    const res = await couponApi.validateCoupon(trimmed, subtotal);

    if (!res.valid) {
      throw new Error(res.message || 'Mã giảm giá không hợp lệ!');
    }

    const isPercent = res.discount_type === 'percentage';
    const coupon: Coupon = {
      code: res.code,
      type: isPercent ? 'PERCENT' : 'FIXED',
      value: res.discount_value,
      minSpend: 0,
      description: isPercent ? `Giảm ${res.discount_value}%` : `Giảm ${res.discount_value.toLocaleString('vi-VN')}đ`,
      isActive: true,
    };

    return {
      coupon,
      discountAmount: res.discount_amount,
    };
  },
};
