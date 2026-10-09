import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { CartItem, Product, Coupon } from '../types';
import { cartService } from '../services/cartService';
import { couponService } from '../services/couponService';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  shippingFee: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  total: number;
  isLoading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  toggleSelect: (productId: string) => Promise<void>;
  toggleSelectAll: (selected: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await cartService.getCart();
      setCart(items);
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch cart on initial load and when user changes (login / logout)
  useEffect(() => {
    fetchCart();
  }, [user, fetchCart]);

  const addToCart = async (product: Product, quantity = 1) => {
    if (product.stock <= 0) {
      showToast('Sản phẩm đã hết hàng!', 'error');
      return;
    }
    try {
      const updated = await cartService.addToCart(product, quantity);
      setCart(updated);
      showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể thêm sản phẩm vào giỏ hàng', 'error');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      const updated = await cartService.updateQuantity(productId, quantity);
      setCart(updated);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi cập nhật số lượng', 'error');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const updated = await cartService.removeFromCart(productId);
      setCart(updated);
      showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa sản phẩm', 'error');
    }
  };

  const toggleSelect = async (productId: string) => {
    const updated = await cartService.toggleSelect(productId);
    setCart(updated);
  };

  const toggleSelectAll = async (selected: boolean) => {
    const updated = await cartService.toggleSelectAll(selected);
    setCart(updated);
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      setCart([]);
      setAppliedCoupon(null);
      setCouponDiscount(0);
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi làm trống giỏ hàng', 'error');
    }
  };

  // Calculations for SELECTED items
  const selectedItems = useMemo(() => cart.filter((item) => item.selected !== false), [cart]);

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      selectedItems.reduce(
        (sum, item) =>
          sum + (item.unitPrice ?? item.product.salePrice ?? item.product.price) * item.quantity,
        0
      ),
    [selectedItems]
  );

  const applyCoupon = async (code: string) => {
    try {
      if (subtotal <= 0) {
        showToast('Vui lòng chọn ít nhất 1 sản phẩm trước khi áp dụng mã!', 'error');
        return;
      }
      const { coupon, discountAmount } = await couponService.validateCoupon(code, subtotal);
      setAppliedCoupon(coupon);
      setCouponDiscount(discountAmount);
      showToast(`Áp dụng mã ${coupon.code} thành công!`, 'success');
    } catch (error: any) {
      showToast(error.message || 'Mã giảm giá không hợp lệ!', 'error');
      throw error;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    showToast('Đã hủy mã giảm giá', 'info');
  };

  // Free shipping over 300k, or 25k default if items selected, 0 if 0 items
  const shippingFee = useMemo(() => {
    if (selectedItems.length === 0) return 0;
    return subtotal >= 300000 ? 0 : 25000;
  }, [subtotal, selectedItems]);

  const total = useMemo(() => {
    const finalTotal = subtotal + shippingFee - couponDiscount;
    return Math.max(0, finalTotal);
  }, [subtotal, shippingFee, couponDiscount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        shippingFee,
        appliedCoupon,
        discountAmount: couponDiscount,
        total,
        isLoading,
        refreshCart: fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleSelect,
        toggleSelectAll,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
