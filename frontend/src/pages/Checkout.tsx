import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import { PaymentMethod } from '../types';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';
import { CreditCard, Banknote, MapPin, Lock, Info } from 'lucide-react';
import { isMockMode } from '../mock/mockStore';

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
    hamlet: 'Thôn 4',
    ward: defaultAddress?.ward || 'Xã Phú Xuân',
    district: defaultAddress?.district || 'Huyện Krông Năng',
    province: defaultAddress?.province || 'Đắk Lắk',
    note: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const selectedItems = cart.filter((item) => item.selected !== false);

  const HAMLET_OPTIONS = [
    'Thôn 1', 'Thôn 2', 'Thôn 3', 'Số 34, Thôn 4', 'Thôn 4', 'Thôn 5', 'Thôn 6',
    'Thôn 7', 'Thôn 8', 'Thôn 9', 'Thôn 10', 'Thôn 11', 'Thôn 12',
    'Buôn Tơng Sinh', 'Buôn Ea Đung', 'Khác'
  ];

  const validateDeliveryArea = (ward: string, province: string): boolean => {
    const w = ward.toLowerCase().trim();
    const p = province.toLowerCase().trim();
    const isPhuXuan = w.includes('phú xuân') || w.includes('phu xuan');
    const isDakLak = p.includes('đắk lắk') || p.includes('đăk lăk') || p.includes('dak lak') || p.includes('daklak');
    return isPhuXuan && isDakLak;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.address.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng!', 'error');
      return;
    }

    if (!validateDeliveryArea(formData.ward, formData.province)) {
      setAddressError('FreshFruit chỉ giao hàng trong Xã Phú Xuân, Đắk Lắk.');
      showToast('Địa chỉ ngoài khu vực phục vụ! Cửa hàng chỉ giao hàng trong Xã Phú Xuân, Đắk Lắk.', 'error');
      return;
    }
    setAddressError(null);

    if (selectedItems.length === 0) {
      showToast('Không có sản phẩm nào được chọn trong giỏ để đặt hàng!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const orderItems = selectedItems.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.image,
        price: item.product.salePrice && item.product.salePrice < item.product.price ? item.product.salePrice : item.product.price,
        quantity: item.quantity,
        unit: item.product.unit || 'Kg',
      }));

      const hamletPart = formData.hamlet && formData.hamlet !== 'Khác' ? `${formData.hamlet}, ` : '';
      const fullAddressString = `${formData.address.trim()}, ${hamletPart}${formData.ward}, ${formData.province}`;

      const createdOrder = await orderService.createOrder({
        userId: user?.id || 'guest',
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim(),
        shippingAddress: fullAddressString,
        items: orderItems,
        subtotal,
        shippingFee,
        discount: discountAmount,
        total,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        note: formData.note.trim() || undefined,
      });

      await clearCart();
      showToast('Đặt hàng thành công! Đang chuyển đến xác nhận đơn hàng...', 'success');
      navigate('/order-success', { state: { order: createdOrder } });
    } catch (err: any) {
      showToast(err.message || 'Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 sm:gap-4 text-xs font-bold text-slate-400 py-2">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black">1</span>
          <span>Giỏ Hàng</span>
        </span>
        <span className="text-slate-300">→</span>
        <span className="flex items-center gap-1.5 text-emerald-700 font-extrabold">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">2</span>
          <span>Thông Tin Thanh Toán</span>
        </span>
        <span className="text-slate-300">→</span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black">3</span>
          <span>Hoàn Tất Đơn Hàng</span>
        </span>
      </div>

      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Xác Nhận & Thanh Toán
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Giao hàng nội bộ phục vụ bà con Xã Phú Xuân, Đắk Lắk.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Thanh toán an toàn</span>
        </div>
      </div>

      {isMockMode() && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5 shadow-xs">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Chế độ Xem Trước Giao Diện (Mock Demo Mode):</strong> Hệ thống đang chạy giao diện độc lập không kết nối Backend API. Chức năng đặt hàng và thanh toán thật được tạm ngưng để tránh giả lập dữ liệu ảo.
          </span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Delivery Form & Payment Selector */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Shipping Form */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span>Địa Chỉ Nhận Hàng (Xã Phú Xuân)</span>
              </h3>
            </div>

            {/* Delivery Restriction Warning Banner */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <strong className="font-bold">Khu vực phục vụ:</strong> FreshFruit hiện chỉ nhận giao hàng tại các thôn, xóm thuộc <strong>Xã Phú Xuân, Đắk Lắk</strong>. Cửa hàng xuất kho từ Số 34, Thôn 4.
              </div>
            </div>

            {addressError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                ⚠️ {addressError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên người nhận"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
              <Input
                label="Số điện thoại liên hệ"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0912 345 678"
              />
            </div>

            <Input
              label="Địa chỉ Email (Nhận thông báo đơn hàng)"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="example@gmail.com"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Tỉnh / Thành phố"
                required
                value={formData.province}
                onChange={(e) => {
                  setFormData({ ...formData, province: e.target.value });
                  setAddressError(null);
                }}
                placeholder="Đắk Lắk"
              />
              <Input
                label="Xã / Thị trấn"
                required
                value={formData.ward}
                onChange={(e) => {
                  setFormData({ ...formData, ward: e.target.value });
                  setAddressError(null);
                }}
                placeholder="Xã Phú Xuân"
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 tracking-wide">
                  Thôn / Xóm / Buôn <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.hamlet}
                  onChange={(e) => setFormData({ ...formData, hamlet: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
                >
                  {HAMLET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input
              label="Địa chỉ cụ thể (Số nhà, đường, điểm mốc nhận quả)"
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ví dụ: Số 12, gần ngã tư Thôn 4, nhà đối diện trường học..."
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 tracking-wide">
                Ghi chú giao hàng (Tùy chọn)
              </label>
              <textarea
                rows={3}
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Ví dụ: Giao buổi chiều sau 16h, gọi trước khi tới..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span>Phương Thức Thanh Toán</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Khách trả tiền mặt khi nhận hàng. Kiểm tra trái cây tươi ngon trước khi thanh toán. Trạng thái ban đầu: <strong>Chưa thanh toán</strong>.
                  </span>
                </div>
              </label>

              <label
                onClick={() => setPaymentMethod('ONLINE_MOCK')}
                className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE_MOCK'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'ONLINE_MOCK'}
                  onChange={() => setPaymentMethod('ONLINE_MOCK')}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Thanh toán ngay (mô phỏng)</span>
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      Sandbox
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Mô phỏng thanh toán trực tuyến tức thì. Đây là môi trường thử nghiệm sandbox, <strong>KHÔNG</strong> trừ tiền thật từ tài khoản ngân hàng.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Preview */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-5 sticky top-24">
            <h3 className="font-black text-slate-900 text-base pb-3 border-b border-slate-100 flex items-center justify-between">
              <span>Đơn Hàng Của Bạn</span>
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold">
                {selectedItems.length} sản phẩm
              </span>
            </h3>

            {/* Item list preview */}
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
              {selectedItems.map((item) => {
                const itemPrice =
                  item.product.salePrice && item.product.salePrice < item.product.price
                    ? item.product.salePrice
                    : item.product.price;
                return (
                  <div key={item.product.id} className="flex items-center gap-3 text-xs py-1">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-12 h-12 rounded-xl object-cover bg-slate-50 shrink-0 border border-slate-100"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback =
                          'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
                        if (!target.src.includes('1610832958506')) {
                          target.src = fallback;
                        }
                      }}
                    />
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-bold text-slate-900 truncate">{item.product.name}</span>
                      <span className="text-slate-400">
                        x{item.quantity} {item.product.unit || 'Kg'}
                      </span>
                    </div>
                    <span className="font-black text-slate-900">
                      {(itemPrice * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính hàng</span>
                <span className="font-bold text-slate-900">{subtotal.toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="flex justify-between text-slate-600">
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
                <div className="flex justify-between text-rose-600 font-semibold">
                  <span>Giảm giá từ mã</span>
                  <span className="font-black">-{discountAmount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="font-black text-slate-900 text-sm sm:text-base">Tổng thanh toán</span>
                <span className="text-2xl font-black text-emerald-700">
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
              Hoàn Tất Đặt Hàng
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
