import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import type { Order } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  ArrowUpRight,
  Eye,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
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
      } catch (err) {
        console.error('Error loading admin dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner label="Đang tải dữ liệu tổng quan quản trị..." size="lg" />;
  }

  return (
    <div className="flex flex-col gap-8">
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
              <TrendingUp className="w-3.5 h-3.5" /> +18.5% tăng trưởng
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
              <ArrowUpRight className="w-3.5 h-3.5" /> Tỷ lệ hoàn tất 95%
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
              <TrendingUp className="w-3.5 h-3.5" /> Thành viên tích cực
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
                <th className="py-3 px-4 text-right">Xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentOrders.map((order) => (
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
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 inline-flex items-center"
                      title="Xem chi tiết đơn"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
