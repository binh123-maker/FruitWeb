import { apiClient } from './client';

export interface BackendCoupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CouponValidateRequest {
  code: string;
  order_amount: number;
}

export interface CouponValidateResponse {
  valid: boolean;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  discount_amount: number;
  message: string;
}

export interface CouponCreatePayload {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export interface CouponUpdatePayload {
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

export const couponApi = {
  /**
   * Kiểm tra mã giảm giá với số tiền đơn hàng
   */
  async validateCoupon(code: string, orderAmount: number): Promise<CouponValidateResponse> {
    return apiClient.post<CouponValidateResponse>('/api/coupons/validate', {
      code,
      order_amount: orderAmount,
    });
  },

  /**
   * Lấy danh sách mã giảm giá khả dụng
   */
  async getCoupons(): Promise<BackendCoupon[]> {
    return apiClient.get<BackendCoupon[]>('/api/coupons');
  },

  /**
   * ADMIN: Tạo mã giảm giá mới
   */
  async adminCreateCoupon(payload: CouponCreatePayload): Promise<BackendCoupon> {
    return apiClient.post<BackendCoupon>('/api/coupons', payload);
  },

  /**
   * ADMIN: Lấy chi tiết mã giảm giá
   */
  async adminGetCoupon(id: number): Promise<BackendCoupon> {
    return apiClient.get<BackendCoupon>(`/api/coupons/${id}`);
  },

  /**
   * ADMIN: Cập nhật thông tin mã giảm giá
   */
  async adminUpdateCoupon(id: number, payload: CouponUpdatePayload): Promise<BackendCoupon> {
    return apiClient.put<BackendCoupon>(`/api/coupons/${id}`, payload);
  },

  /**
   * ADMIN: Xóa mã giảm giá
   */
  async adminDeleteCoupon(id: number): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/api/coupons/${id}`);
  },
};
