import { Coupon } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { INITIAL_COUPONS } from '../mock/data';

const delay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredCoupons = (): Coupon[] => {
  const existing = storage.getItem<Coupon[]>(STORAGE_KEYS.COUPONS, []);
  if (existing.length === 0) {
    storage.setItem(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
    return INITIAL_COUPONS;
  }
  return existing;
};

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    await delay(150);
    return getStoredCoupons();
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discountAmount: number }> {
    await delay(250);
    const coupons = getStoredCoupons();
    const coupon = coupons.find(
      (c) => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive
    );

    if (!coupon) {
      throw new Error('Mã giảm giá không tồn tại hoặc đã hết hạn!');
    }

    if (subtotal < coupon.minSpend) {
      throw new Error(
        `Mã này áp dụng cho đơn hàng tối thiểu ${coupon.minSpend.toLocaleString('vi-VN')} VNĐ!`
      );
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENT') {
      discountAmount = (subtotal * coupon.value) / 100;
    } else {
      discountAmount = coupon.value;
    }

    return { coupon, discountAmount: Math.min(discountAmount, subtotal) };
  }
};
