import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { PaymentMethod } from '../types';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { CreditCard, Banknote, ShieldCheck, MapPin, Truck, CheckCircle2 } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, subtotal, shippingFee, appliedCoupon, discountAmount, total, clearCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const [formData, setFormData] = useState({
    fullName: defaultAddress?.fullName || user?.name || '',
    phone: defaultAddress?.phone || user?.phone || '',
    email: user?.email || '',
    address: defaultAddress?.address || '',
    province: defaultAddress?.province || 'Thành phố Hồ Chí Minh',
    district: defaultAddress?.district || 'Quận 1',
    ward: defaultAddress?.ward || 'Phường Bến Nghé',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedItems = cart.filter((item) => item.selected !== false);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.phone || !formData.address) {
      showToast('Vui lòng điền đầy đủ thông tin giao hàng!', 'error');
      return;
    }

    if (selectedItems.length === 0) {
      showToast('Không có sản phẩm nào được chọn để đặt hàng!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = selectedItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.salePrice || item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
      }));

      const fullAddressString = `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.province}`;

      const createdOrder = await orderService.createOrder({
        userId: user?.id || 'guest',
        customerName: formData.fullName,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        shippingAddress: fullAddressString,
        items: orderItems,
        subtotal,
        shippingFee,
        discount: discountAmount,
        total,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        note: formData.note,
      });

      await clearCart();
      showToast('Đặt hàng thành công!', 'success');
      navigate('/order-success', { state: { order: createdOrder } });
    } catch (err: any) {
      showToast(err.message || 'Có lỗi xảy ra khi tạo đơn hàng!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-200">
        Thanh Toán Đơn Hàng
      </h1>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery Form & Payment Selector */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Shipping Form */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>Thông Tin Giao Hàng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên người nhận"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
              <Input
                label="Số điện thoại"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912345678"
              />
            </div>

            <Input
              label="Địa chỉ Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@gmail.com"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Tỉnh / Thành phố"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              />
              <Input
                label="Quận / Huyện"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
              <Input
                label="Phường / Xã"
                value={formData.ward}
                onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
              />
            </div>

            <Input
              label="Địa chỉ cụ thể (Số nhà, tên đường)"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Đường Lê Lợi..."
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Ghi chú đơn hàng (Tùy chọn)</label>
              <textarea
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-5">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Phương Thức Thanh Toán</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Thanh toán COD</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">
                    Thanh toán bằng tiền mặt trực tiếp khi nhận trái cây.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('ONLINE_MOCK')}
                className={`flex items-start gap-3.5 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE_MOCK'
                    ? 'border-emerald-600 bg-emerald-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE_MOCK'}
                  onChange={() => setPaymentMethod('ONLINE_MOCK')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Thanh toán Online (Mock)</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1">
                    Mô phỏng thanh toán qua Ví MoMo / VNPay / Thẻ ATM.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-5 sticky top-24">
            <h3 className="font-extrabold text-slate-800 text-base pb-3 border-b border-slate-100">
              Đơn Hàng ({selectedItems.length} sản phẩm)
            </h3>

            {/* Item list preview */}
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
              {selectedItems.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 text-xs">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-cover bg-slate-50 shrink-0"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const fallback = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
                      if (!target.src.includes('1610832958506')) {
                        target.src = fallback;
                      }
                    }}
                  />
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-bold text-slate-800 truncate">{item.product.name}</span>
                    <span className="text-slate-400">
                      x{item.quantity} {item.product.unit}
                    </span>
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {((item.product.salePrice || item.product.price) * item.quantity).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính</span>
                <span className="font-bold text-slate-800">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Phí giao hàng</span>
                <span className="font-bold text-slate-800">
                  {shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : `${shippingFee.toLocaleString('vi-VN')}đ`}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Giảm giá</span>
                  <span className="font-bold">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-extrabold text-slate-900 text-base">Tổng tiền</span>
                <span className="text-2xl font-black text-emerald-600">
                  {total.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full mt-2"
            >
              Đặt Hàng Ngay
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
