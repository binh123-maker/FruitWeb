import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Order } from '../types';
import { Button } from '../components/common/Button';
import { CheckCircle2, Package, ShoppingBag } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-xl w-full flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-scale-up shadow-md shadow-emerald-200/50">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600">
            Đặt Hàng Thành Công
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Cảm Ơn Bạn Đã Mua Hàng!
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-md leading-relaxed">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống FreshFruit. Chúng tôi đang chuẩn bị đóng gói và giao hàng nhanh nhất.
          </p>
        </div>

        {/* Order Receipt Summary Card */}
        <div className="w-full bg-slate-50/80 p-6 rounded-2xl border border-slate-100 text-left flex flex-col gap-3.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
            <span className="text-slate-500 font-medium">Mã đơn hàng:</span>
            <span className="font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-lg text-xs">
              {order.id}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Người nhận hàng:</span>
            <span className="font-bold text-slate-800">{order.customerName} ({order.customerPhone})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Địa chỉ giao:</span>
            <span className="font-semibold text-slate-800 text-right max-w-xs truncate">{order.shippingAddress}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Phương thức:</span>
            <span className="font-bold text-slate-800">
              {order.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng (COD)' : 'Thanh toán ngay (mô phỏng)'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Trạng thái thanh toán:</span>
            <span className={`font-bold px-2.5 py-0.5 rounded-lg text-xs ${
              order.paymentStatus === 'Đã thanh toán (mô phỏng)' || order.paymentStatus === 'Đã thanh toán'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {order.paymentStatus || (order.paymentMethod === 'ONLINE_MOCK' ? 'Đã thanh toán (mô phỏng)' : 'Chưa thanh toán')}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
            <span className="font-black text-slate-900">Tổng thanh toán:</span>
            <span className="text-xl font-black text-emerald-700">
              {order.total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          <Link to="/orders">
            <Button variant="outline" size="md" icon={<Package className="w-4 h-4 text-emerald-600" />}>
              Xem Lịch Sử Đơn Hàng
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="primary" size="md" icon={<ShoppingBag className="w-4 h-4" />}>
              Tiếp Tục Mua Sắm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
