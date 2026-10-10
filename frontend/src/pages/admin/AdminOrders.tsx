import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { RefreshCw, Search, Clock, CreditCard, Banknote, MapPin } from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOrdersSilently = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await orderService.getOrders();
      setOrders(res);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Lỗi tự động làm mới đơn hàng:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Polling setup: 6000ms (6 seconds) with clean unmount
  useEffect(() => {
    let isMounted = true;

    const initialLoad = async () => {
      try {
        const res = await orderService.getOrders();
        if (isMounted) {
          setOrders(res);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error('Lỗi tải danh sách đơn hàng ban đầu:', err);
      } finally {
        if (isMounted) setIsInitialLoading(false);
      }
    };

    initialLoad();

    const intervalId = setInterval(() => {
      if (isMounted) {
        fetchOrdersSilently();
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchOrdersSilently]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`Đã đổi trạng thái đơn #${orderId} sang "${newStatus}"!`, 'success');
      await fetchOrdersSilently();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    try {
      await orderService.adminUpdatePaymentStatus(orderId, newPaymentStatus);
      showToast(`Đã cập nhật thanh toán đơn #${orderId} sang "${newPaymentStatus}"!`, 'success');
      await fetchOrdersSilently();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái thanh toán', 'error');
    }
  };

  // Filtered orders (memoized to keep user view stable during polls)
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchStatus;

      const matchSearch =
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term) ||
        o.shippingAddress.toLowerCase().includes(term);

      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, searchTerm]);

  if (isInitialLoading) {
    return <LoadingSpinner label="Đang tải danh sách đơn hàng toàn hệ thống..." size="lg" />;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Polling Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Quản Lý Đơn Hàng Toàn Hệ Thống</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Giám sát đơn hàng thời gian thực, tiến độ giao nội bộ Xã Phú Xuân và trạng thái thu tiền.
          </p>
        </div>

        {/* Polling badge */}
        <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold text-slate-700">Tự động đồng bộ (6s)</span>
          <button
            onClick={fetchOrdersSilently}
            disabled={isRefreshing}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            title="Làm mới ngay"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
          <span className="text-[11px] text-slate-400 hidden sm:inline flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {lastUpdated.toLocaleTimeString('vi-VN')}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, SĐT, thôn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Lọc trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">Tất cả ({orders.length})</option>
            <option value="Chờ xác nhận">Chờ xác nhận</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đang giao">Đang giao</option>
            <option value="Đã giao">Đã giao</option>
            <option value="Đã hủy">Đã hủy</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-black text-[11px]">
              <th className="py-3 px-4">Mã Đơn</th>
              <th className="py-3 px-4">Khách Hàng & SĐT</th>
              <th className="py-3 px-4">Địa Chỉ (Phú Xuân)</th>
              <th className="py-3 px-4">Tổng Tiền</th>
              <th className="py-3 px-4">Phương Thức</th>
              <th className="py-3 px-4">Trạng Thái Thanh Toán</th>
              <th className="py-3 px-4">Tiến Độ Đơn</th>
              <th className="py-3 px-4 text-right">Đổi Tiến Độ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-400 font-medium">
                  {orders.length === 0 ? 'Chưa có đơn hàng nào trong hệ thống' : 'Không có đơn hàng nào khớp bộ lọc'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/80 transition-colors">
                  {/* Order ID */}
                  <td className="py-3 px-4 font-black text-slate-900">#{o.id}</td>

                  {/* Customer Info */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{o.customerName}</div>
                    <div className="text-[11px] text-slate-400">{o.customerPhone}</div>
                  </td>

                  {/* Delivery Address */}
                  <td className="py-3 px-4 max-w-xs">
                    <div className="flex items-start gap-1 text-slate-700 text-[11px] leading-tight" title={o.shippingAddress}>
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="truncate">{o.shippingAddress}</span>
                    </div>
                  </td>

                  {/* Total */}
                  <td className="py-3 px-4 font-black text-emerald-700">
                    {o.total.toLocaleString('vi-VN')}đ
                  </td>

                  {/* Payment Method */}
                  <td className="py-3 px-4">
                    {o.paymentMethod === 'COD' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        <Banknote className="w-3 h-3 text-emerald-600" />
                        COD
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        <CreditCard className="w-3 h-3 text-purple-600" />
                        Online (Mock)
                      </span>
                    )}
                  </td>

                  {/* Payment Status with inline admin override */}
                  <td className="py-3 px-4">
                    <select
                      value={o.paymentStatus || (o.paymentMethod === 'ONLINE_MOCK' ? 'Đã thanh toán (mô phỏng)' : 'Chưa thanh toán')}
                      onChange={(e) => handlePaymentStatusChange(o.id, e.target.value as PaymentStatus)}
                      className={`text-[11px] font-extrabold rounded-lg px-2 py-1 border transition-colors cursor-pointer ${
                        o.paymentStatus === 'Đã thanh toán'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : o.paymentStatus === 'Đã thanh toán (mô phỏng)'
                          ? 'bg-blue-50 text-blue-700 border-blue-300'
                          : o.paymentStatus === 'Đã hoàn tiền'
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-amber-50 text-amber-800 border-amber-300'
                      }`}
                    >
                      <option value="Chưa thanh toán">Chưa thanh toán</option>
                      <option value="Đã thanh toán">Đã thanh toán</option>
                      <option value="Đã thanh toán (mô phỏng)">Đã thanh toán (mô phỏng)</option>
                      <option value="Đã hoàn tiền">Đã hoàn tiền</option>
                    </select>
                  </td>

                  {/* Order Status Badge */}
                  <td className="py-3 px-4">
                    <Badge
                      variant={
                        o.orderStatus === 'Đã giao'
                          ? 'emerald'
                          : o.orderStatus === 'Đã hủy'
                          ? 'rose'
                          : 'amber'
                      }
                      size="sm"
                      dot
                    >
                      {o.orderStatus}
                    </Badge>
                  </td>

                  {/* Order Status Action Selector */}
                  <td className="py-3 px-4 text-right">
                    <select
                      value={o.orderStatus}
                      disabled={o.orderStatus === 'Đã giao' || o.orderStatus === 'Đã hủy'}
                      onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      className={`bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold p-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        o.orderStatus === 'Đã giao' || o.orderStatus === 'Đã hủy'
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:border-slate-300'
                      }`}
                    >
                      <option value="Chờ xác nhận">Chờ xác nhận</option>
                      <option value="Đã xác nhận">Đã xác nhận</option>
                      <option value="Đang giao">Đang giao</option>
                      <option value="Đã giao">Đã giao</option>
                      <option value="Đã hủy">Đã hủy</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminOrders;
