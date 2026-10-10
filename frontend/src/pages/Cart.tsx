import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { QuantitySelector } from '../components/product/QuantitySelector';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import {
  Trash2,
  Tag,
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Truck,
  CheckCircle2,
} from 'lucide-react';

export const Cart: React.FC = () => {
  const {
    cart,
    subtotal,
    shippingFee,
    appliedCoupon,
    discountAmount,
    total,
    updateQuantity,
    removeFromCart,
    toggleSelect,
    toggleSelectAll,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const navigate = useNavigate();

  const allSelected = cart.length > 0 && cart.every((item) => item.selected !== false);
  const freeShippingThreshold = 300000;
  const freeShippingDiff = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(couponInput.trim());
      setCouponInput('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleQuickApplyCoupon = async (code: string) => {
    setIsApplyingCoupon(true);
    try {
      await applyCoupon(code);
    } catch (err) {
      console.error(err);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          icon={<ShoppingBag className="w-14 h-14 text-emerald-500" />}
          title="Giỏ Hàng Của Bạn Đang Trống"
          description="Hãy lựa chọn những thức quả tươi ngọt, giàu vitamin tại FreshFruit để bắt đầu bữa ăn lành mạnh nhé!"
          actionText="Tiếp tục mua sắm ngay"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Giỏ Hàng Của Bạn
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Đang có <strong>{cart.length}</strong> loại sản phẩm trong giỏ hàng.
          </p>
        </div>

        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto px-3 py-1.5 rounded-xl hover:bg-rose-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 sm:p-5 flex flex-col gap-2.5 shadow-2xs">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-900">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            {freeShippingDiff === 0 ? (
              <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Đơn hàng của bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN!
              </span>
            ) : (
              <span>
                Mua thêm <strong className="text-emerald-700">{freeShippingDiff.toLocaleString('vi-VN')}đ</strong> để được Miễn phí giao hàng (Đơn từ 300k)
              </span>
            )}
          </div>
          <span className="text-xs text-emerald-700 font-extrabold hidden sm:inline">
            {Math.round(freeShippingProgress)}%
          </span>
        </div>
        <div className="w-full h-2.5 bg-emerald-200/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Select All Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-bold text-slate-800 select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
              />
              <span>Chọn tất cả ({cart.length} sản phẩm)</span>
            </label>
          </div>

          {/* Cart Item Cards */}
          <div className="flex flex-col gap-3">
            {cart.map((item) => {
              const currentPrice =
                item.product.salePrice && item.product.salePrice < item.product.price
                  ? item.product.salePrice
                  : item.product.price;
              const itemTotal = currentPrice * item.quantity;
              const isSelected = item.selected !== false;

              return (
                <div
                  key={item.product.id}
                  className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                    isSelected ? 'border-slate-200/90' : 'border-slate-100 opacity-60 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.product.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer shrink-0"
                      aria-label={`Chọn sản phẩm ${item.product.name}`}
                    />

                    <Link
                      to={`/products/${item.product.id}`}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback =
                            'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
                          if (!target.src.includes('1610832958506')) {
                            target.src = fallback;
                          }
                        }}
                      />
                    </Link>

                    <div className="flex flex-col min-w-0 flex-1">
                      <Link
                        to={`/products/${item.product.id}`}
                        className="font-extrabold text-slate-900 hover:text-emerald-700 text-sm line-clamp-1 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-xs text-slate-400 mt-0.5">
                        {item.product.unit || 'Kg'} • Xuất xứ: {item.product.origin || 'Việt Nam'}
                      </span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-sm font-black text-emerald-700">
                          {currentPrice.toLocaleString('vi-VN')}đ
                        </span>
                        {item.product.salePrice && item.product.salePrice < item.product.price && (
                          <span className="text-xs text-slate-400 line-through">
                            {item.product.price.toLocaleString('vi-VN')}đ
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-3.5 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                      size="sm"
                    />

                    <span className="font-black text-slate-900 text-sm min-w-[85px] text-right">
                      {itemTotal.toLocaleString('vi-VN')}đ
                    </span>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa khỏi giỏ"
                      aria-label="Xóa sản phẩm này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tiếp tục chọn thêm trái cây tươi</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon Card */}
        <div className="flex flex-col gap-6">
          {/* Coupon Code Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-3.5">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Mã Giảm Giá (Coupon)</span>
            </h3>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-emerald-900">
                    MÃ: {appliedCoupon.code}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">
                    Đã giảm: -{discountAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                >
                  Hủy áp dụng
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã ưu đãi..."
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isApplyingCoupon}
                >
                  Áp dụng
                </Button>
              </form>
            )}

            {/* Quick Coupon Chips */}
            <div className="flex flex-col gap-2 pt-1 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400">Gợi ý mã giảm giá:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickApplyCoupon('FRESH10')}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-black text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  FRESH10 (-10%)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickApplyCoupon('WELCOME50')}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-[11px] font-black text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
                >
                  WELCOME50 (-50k)
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Summary Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
              <span>Tạm tính hàng chọn</span>
              <span className="font-bold text-slate-900">{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
              <span>Phí vận chuyển</span>
              <span className="font-bold text-slate-900">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-extrabold">Miễn phí</span>
                ) : (
                  `${shippingFee.toLocaleString('vi-VN')}đ`
                )}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-xs sm:text-sm text-rose-600 font-semibold">
                <span>Giảm giá từ mã</span>
                <span className="font-black">-{discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="font-black text-slate-900 text-sm sm:text-base">Tổng thanh toán</span>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-700">
                  {total.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">(Đã bao gồm thuế)</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => navigate('/checkout')}
              disabled={subtotal === 0}
              variant="primary"
              size="lg"
              className="w-full mt-2"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Tiến Hành Đặt Hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
