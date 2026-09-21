import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { QuantitySelector } from '../components/product/QuantitySelector';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { Trash2, Tag, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck, Check } from 'lucide-react';

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

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          icon={<ShoppingBag className="w-16 h-16 text-emerald-400" />}
          title="Giỏ hàng của bạn đang trống"
          description="Hãy khám phá thêm hàng chục loại trái cây tươi ngon, giòn mọng nước tại FreshFruit để lấp đầy giỏ hàng nhé!"
          actionText="Tiếp tục mua sắm"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Giỏ Hàng Của Bạn</h1>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Xóa tất cả
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Item List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Select All Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
            <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-slate-700">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>Chọn tất cả ({cart.length} sản phẩm)</span>
            </label>
          </div>

          {/* Items */}
          <div className="flex flex-col gap-3">
            {cart.map((item) => {
              const currentPrice = item.product.salePrice || item.product.price;
              const itemTotal = currentPrice * item.quantity;
              const isSelected = item.selected !== false;

              return (
                <div
                  key={item.product.id}
                  className={`bg-white p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
                    isSelected ? 'border-slate-200' : 'border-slate-100 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.product.id)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />

                    <Link to={`/products/${item.product.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex flex-col min-w-0">
                      <Link
                        to={`/products/${item.product.slug}`}
                        className="font-bold text-slate-800 hover:text-emerald-600 text-sm line-clamp-1 transition-colors"
                      >
                        {item.product.name}
                      </Link>
                      <span className="text-xs text-slate-400 mt-0.5">
                        Đơn vị: {item.product.unit} | Xuất xứ: {item.product.origin}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-extrabold text-emerald-600">
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

                  {/* Quantity & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <QuantitySelector
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
                      size="sm"
                    />

                    <span className="font-extrabold text-slate-900 text-sm min-w-[80px] text-right">
                      {itemTotal.toLocaleString('vi-VN')}đ
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700">
              <ArrowLeft className="w-4 h-4" /> Tiếp tục chọn sản phẩm khác
            </Link>
          </div>
        </div>

        {/* Order Summary Box */}
        <div className="flex flex-col gap-6">
          {/* Coupon Code Section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-3">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Mã giảm giá (Coupon)</span>
            </h4>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-emerald-800">
                    MÃ: {appliedCoupon.code}
                  </span>
                  <span className="text-[11px] text-emerald-600">
                    -{discountAmount.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                >
                  Hủy áp dụng
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCouponSubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập FRESH10 hoặc WELCOME50"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-xl">
              💡 Thử dùng mã: <strong className="text-emerald-700">FRESH10</strong> (Giảm 10%) hoặc <strong className="text-emerald-700">WELCOME50</strong> (Giảm 50k).
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4">
            <h3 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Tạm tính</span>
              <span className="font-bold text-slate-800">{subtotal.toLocaleString('vi-VN')}đ</span>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Phí vận chuyển</span>
              <span className="font-bold text-slate-800">
                {shippingFee === 0 ? (
                  <span className="text-emerald-600 font-extrabold">Miễn phí</span>
                ) : (
                  `${shippingFee.toLocaleString('vi-VN')}đ`
                )}
              </span>
            </div>

            {discountAmount > 0 && (
              <div className="flex items-center justify-between text-sm text-rose-600">
                <span>Giảm giá</span>
                <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
              <span className="font-extrabold text-slate-900 text-base">Tổng thanh toán</span>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-600">
                  {total.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-[10px] text-slate-400 block">(Đã bao gồm VAT)</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              disabled={subtotal === 0}
              variant="primary"
              size="lg"
              className="w-full mt-2"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              Tiến Hành Thanh Toán
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
