import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { Order } from '../types';
import { Button } from '../components/common/Button';
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const location = useLocation();
  const order = location.state?.order as Order | undefined;

  if (!order) {
    return <Navigate to="/orders" replace />;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-100 shadow-xl w-full flex flex-col items-center text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-scale-up">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
            Đặt Hàng Thành Công
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            Cảm Ơn Bạn Đã Mua Hàng Tại FreshFruit!
          </h1>
          <p className="text-slate-500 text-sm mt-2 max-w-md">
            Đơn hàng của bạn đã được ghi nhận vào hệ thống và đang được chuẩn bị đóng gói giao tới bạn trong thời gian sớm nhất.
          </p>
        </div>

        {/* Order Info Card */}
        <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-100 text-left flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-slate-500">Mã đơn hàng:</span>
            <span className="font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg text-xs">
              {order.id}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Người nhận:</span>
            <span className="font-bold text-slate-800">{order.customerName} ({order.customerPhone})</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Địa chỉ giao:</span>
            <span className="font-medium text-slate-800 text-right max-w-xs truncate">{order.shippingAddress}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Phương thức thanh toán:</span>
            <span className="font-bold text-slate-800">
              {order.paymentMethod === 'COD' ? 'Thanh toán khi nhận hàng (COD)' : 'Thanh toán Online (Mock)'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="font-bold text-slate-900">Tổng thanh toán:</span>
            <span className="text-xl font-black text-emerald-600">
              {order.total.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link to="/orders">
            <Button variant="outline" size="md" icon={<Package className="w-4 h-4" />}>
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
