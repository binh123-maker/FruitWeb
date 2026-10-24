import React, { useState } from 'react';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import {
  Calendar,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Banknote,
  PackageCheck,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface AdminOrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  onPaymentStatusChange?: (orderId: string, newPaymentStatus: PaymentStatus) => Promise<void>;
}

export const AdminOrderDetailModal: React.FC<AdminOrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
}) => {
  const { showToast } = useToast();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!order) return null;

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Chờ xác nhận':
        return <Badge variant="amber" dot size="sm">Chờ xác nhận</Badge>;
      case 'Đã xác nhận':
        return <Badge variant="sky" dot size="sm">Đã xác nhận</Badge>;
      case 'Đang giao':
        return <Badge variant="purple" dot size="sm">Đang giao hàng</Badge>;
      case 'Đã giao':
        return <Badge variant="emerald" dot size="sm">Giao thành công</Badge>;
      case 'Đã hủy':
        return <Badge variant="rose" dot size="sm">Đã hủy</Badge>;
      default:
        return <Badge variant="slate" size="sm">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Đã thanh toán':
        return <Badge variant="emerald" size="sm">Đã thanh toán</Badge>;
      case 'Đã thanh toán (mô phỏng)':
        return <Badge variant="purple" size="sm">Đã thanh toán (mô phỏng)</Badge>;
      case 'Đã hoàn tiền':
        return <Badge variant="slate" size="sm">Đã hoàn tiền</Badge>;
      case 'Chưa thanh toán':
      default:
        return <Badge variant="amber" size="sm">Chưa thanh toán</Badge>;
    }
  };

  const handleCopyOrderSummary = () => {
    const text = [
      `📦 PHIẾU ĐƠN HÀNG #${order.id} - FRUITWEB`,
      `📅 Ngày đặt: ${new Date(order.createdAt).toLocaleString('vi-VN')}`,
      `👤 Khách hàng: ${order.customerName}`,
      `📞 Số điện thoại: ${order.customerPhone}`,
      `📍 Địa chỉ giao: ${order.shippingAddress}`,
      `📝 Ghi chú: ${order.note || 'Không có'}`,
      `💳 Thanh toán: ${order.paymentMethod === 'COD' ? 'Thu hộ tiền mặt (COD)' : 'Online Mock'} - ${order.paymentStatus}`,
      `----------------------------------------`,
      `SẢN PHẨM:`,
      ...order.items.map(
        (it) => `- ${it.productName}: ${it.quantity} ${it.unit || 'Kg'} x ${it.price.toLocaleString('vi-VN')}đ = ${(it.price * it.quantity).toLocaleString('vi-VN')}đ`
      ),
      `----------------------------------------`,
      `Tạm tính: ${order.subtotal.toLocaleString('vi-VN')}đ`,
      order.discount > 0 ? `Giảm giá (${order.couponCode || 'Coupon'}): -${order.discount.toLocaleString('vi-VN')}đ` : '',
      `TỔNG TIỀN PHẢI THU: ${order.total.toLocaleString('vi-VN')}đ`,
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Đã sao chép phiếu giao hàng vào bộ nhớ tạm!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const formattedDateTime = () => {
    try {
      const d = new Date(order.createdAt);
      return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} • ${d.toLocaleDateString('vi-VN')}`;
    } catch {
      return order.createdAt;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Đơn Hàng #${order.id}`}
      maxWidth="2xl"
    >
      <div className="flex flex-col gap-5 text-xs text-slate-600">
        {/* Top Header Card: Order ID, Date, Fast Actions */}
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900 tracking-tight">Đơn hàng #{order.id}</span>
              {getOrderStatusBadge(order.orderStatus)}
              {getPaymentStatusBadge(order.paymentStatus)}
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Thời gian đặt: {formattedDateTime()}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyOrderSummary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="Sao chép tóm tắt đơn hàng"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Đã chép' : 'Sao chép phiếu'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              title="In phiếu đơn hàng"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In</span>
            </button>
          </div>
        </div>

        {/* 2-Column Info Grid: Recipient Info & Payment/Status Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recipient Details */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col gap-2.5">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              Thông Tin Người Nhận
            </h4>

            <div className="space-y-1.5 text-[11px] font-medium text-slate-700">
              <div className="flex items-start justify-between">
                <span className="text-slate-400">Tên người nhận:</span>
                <span className="font-bold text-slate-900 text-right">{order.customerName}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-400">Số điện thoại:</span>
                <a
                  href={`tel:${order.customerPhone}`}
                  className="font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Phone className="w-3 h-3" />
                  {order.customerPhone}
                </a>
              </div>

              {order.customerEmail && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    {order.customerEmail}
                  </span>
                </div>
              )}

              <div className="pt-1.5 border-t border-slate-100">
                <span className="text-slate-400 block mb-0.5">Địa chỉ giao hàng:</span>
                <div className="p-2 bg-emerald-50/50 rounded-xl border border-emerald-100 text-slate-800 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-semibold leading-relaxed">{order.shippingAddress}</span>
                </div>
              </div>

              {order.note && (
                <div className="pt-1 text-slate-600 flex items-start gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span><strong>Ghi chú:</strong> {order.note}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Method & Status Adjustments */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between gap-3">
            <div>
              <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider text-purple-800 flex items-center gap-1.5 mb-2.5">
                <CreditCard className="w-4 h-4 text-purple-600" />
                Thanh Toán & Cập Nhật Tiến Độ
              </h4>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Phương thức:</span>
                  {order.paymentMethod === 'COD' ? (
                    <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      <Banknote className="w-3 h-3 text-emerald-600" />
                      Tiền mặt khi nhận hàng (COD)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-purple-800 bg-purple-50 px-2 py-0.5 rounded-md">
                      <CreditCard className="w-3 h-3 text-purple-600" />
                      Thanh toán Online (Mô phỏng)
                    </span>
                  )}
                </div>

                {/* Inline Status Changer for Admin */}
                {onStatusChange && (
                  <div className="pt-2 border-t border-slate-100">
                    <label className="text-slate-500 font-bold block mb-1">
                      Cập nhật tiến độ đơn:
                    </label>
                    <select
                      value={order.orderStatus}
                      disabled={isUpdatingStatus || order.orderStatus === 'Đã giao' || order.orderStatus === 'Đã hủy'}
                      onChange={async (e) => {
                        const newSt = e.target.value as OrderStatus;
                        if (newSt === order.orderStatus) return;
                        try {
                          setIsUpdatingStatus(true);
                          await onStatusChange(order.id, newSt);
                        } finally {
                          setIsUpdatingStatus(false);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Đã giao">Đã giao</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </div>
                )}

                {/* Inline Payment Status Changer for Admin */}
                {onPaymentStatusChange && (
                  <div>
                    <label className="text-slate-500 font-bold block mb-1">
                      Cập nhật trạng thái thu tiền:
                    </label>
                    <select
                      value={order.paymentStatus}
                      disabled={isUpdatingPayment}
                      onChange={async (e) => {
                        const newPay = e.target.value as PaymentStatus;
                        if (newPay === order.paymentStatus) return;
                        try {
                          setIsUpdatingPayment(true);
                          await onPaymentStatusChange(order.id, newPay);
                        } finally {
                          setIsUpdatingPayment(false);
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold p-2 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="Chưa thanh toán">Chưa thanh toán</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                      <option value="Đã thanh toán (mô phỏng)">Đã thanh toán (mô phỏng)</option>
                      <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Fruit Products Table */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-wider">
              Danh Sách Trái Cây Đã Đặt ({order.items.length} món)
            </h4>
            <span className="text-[11px] text-slate-400 italic">
              Đơn giá được chốt tại thời điểm đặt hàng
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px]">
                  <th className="py-2.5 px-3">Sản phẩm</th>
                  <th className="py-2.5 px-3 text-center">ĐVT</th>
                  <th className="py-2.5 px-3 text-center">Số lượng</th>
                  <th className="py-2.5 px-3 text-right">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, idx) => {
                  const lineTotal = item.price * item.quantity;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                            onError={(e) => {
                              const target = e.currentTarget;
                              const fallback =
                                'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
                              if (!target.src.includes('1610832958506')) {
                                target.src = fallback;
                              }
                            }}
                          />
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 leading-tight">
                              {item.productName}
                            </span>
                            <span className="text-[10px] text-slate-400">Mã SP: #{item.productId}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-500 font-semibold uppercase text-[11px]">
                        {item.unit || 'Kg'}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-slate-800">
                        x{item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-600">
                        {item.price.toLocaleString('vi-VN')}đ
                      </td>
                      <td className="py-2.5 px-3 text-right font-black text-slate-900">
                        {lineTotal.toLocaleString('vi-VN')}đ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Totals Summary */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between text-slate-600">
            <span>Tiền hàng (Tạm tính):</span>
            <span className="font-bold text-slate-800">{order.subtotal.toLocaleString('vi-VN')}đ</span>
          </div>

          <div className="flex justify-between text-slate-600">
            <span>Phí giao hàng (Nội xã Phú Xuân):</span>
            <span className="font-bold text-emerald-700">
              {order.shippingFee === 0 ? 'Miễn phí' : `${order.shippingFee.toLocaleString('vi-VN')}đ`}
            </span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-rose-600 font-bold">
              <span>Giảm giá {order.couponCode ? `(Mã: ${order.couponCode})` : ''}:</span>
              <span>-{order.discount.toLocaleString('vi-VN')}đ</span>
            </div>
          )}

          <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-slate-900">
            <span className="text-sm">Tổng tiền thu khách:</span>
            <span className="text-emerald-700 text-lg font-black tracking-tight">
              {order.total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
};
