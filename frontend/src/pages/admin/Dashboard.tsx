import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { AdminOrderDetailModal } from '../../components/admin/AdminOrderDetailModal';
import { useToast } from '../../context/ToastContext';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Eye,
  RefreshCw,
  Clock,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        orderService.getOrders(),
        productService.getProducts({ limit: 100 }),
        userService.getUsers(),
      ]);

      const orders = ordersRes;
      const revenue = orders
        .filter((o) => o.orderStatus !== 'Đã hủy')
        .reduce((sum, o) => sum + o.total, 0);

      setStats({
        totalRevenue: revenue,
        totalOrders: orders.length,
        totalProducts: productsRes.total,
        totalUsers: usersRes.length,
      });

      setRecentOrders(orders.slice(0, 5));
      setLastUpdated(new Date());

      // If viewing an order modal, refresh its data too
      setSelectedOrder((prev) => {
        if (!prev) return null;
        return orders.find((o) => o.id === prev.id) || prev;
      });
    } catch (err) {
      console.error('Error loading admin dashboard stats:', err);
    } finally {
      if (!silent) setIsLoading(false);
      else setIsRefreshing(false);
    }
  }, []);

  // Polling setup: 6000ms (6 seconds) with clean unmount
  useEffect(() => {
    let isMounted = true;

    fetchDashboardData(false);

    const intervalId = setInterval(() => {
      if (isMounted) {
        fetchDashboardData(true);
      }
    }, 6000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [fetchDashboardData]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`Đã đổi trạng thái đơn #${orderId} sang "${newStatus}"!`, 'success');
      await fetchDashboardData(true);
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  const handlePaymentStatusChange = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    try {
      await orderService.adminUpdatePaymentStatus(orderId, newPaymentStatus);
      showToast(`Đã cập nhật thanh toán đơn #${orderId} sang "${newPaymentStatus}"!`, 'success');
      await fetchDashboardData(true);
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái thanh toán', 'error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Đang tải dữ liệu tổng quan quản trị..." size="lg" />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header with live sync indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Tổng Quan Hệ Thống</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Số liệu kinh doanh, doanh thu thực tế và 5 đơn hàng mới nhất phát sinh.
          </p>
        </div>

        {/* Live sync badge */}
        <div className="flex items-center gap-2.5 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="font-bold text-slate-700">Tự động đồng bộ (6s)</span>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Revenue */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Doanh Thu Tổng</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              {stats.totalRevenue.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> Thực tế từ DB
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Tổng Đơn Hàng</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</span>
            <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" /> Cập nhật tức thời
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Sản Phẩm Trong Kho</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats.totalProducts}</span>
            <span className="text-[11px] font-semibold text-slate-500 mt-2">Đang mở bán</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Khách Hàng Đăng Ký</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</span>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> Thành viên hệ thống
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900">Đơn Hàng Gần Đây</h3>
            <p className="text-xs text-slate-500">5 đơn hàng phát sinh mới nhất trong hệ thống</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            <span>Quản lý toàn bộ</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-black text-[11px]">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Ngày Đặt</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Chi Tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Chưa có đơn hàng nào
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-black text-slate-900">#{order.id}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{order.customerName}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 font-black text-emerald-700">
                      {order.total.toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          order.orderStatus === 'Đã giao'
                            ? 'emerald'
                            : order.orderStatus === 'Đã hủy'
                            ? 'rose'
                            : 'amber'
                        }
                        size="sm"
                        dot
                      >
                        {order.orderStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(order)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xem chi tiết đơn hàng"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Xem</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal on Dashboard */}
      <AdminOrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusChange}
        onPaymentStatusChange={handlePaymentStatusChange}
      />
    </div>
  );
};
