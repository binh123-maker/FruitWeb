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
    return <LoadingSpinner label="Đang tải dữ liệu báo cáo quản trị..." />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh Thu</span>
            <span className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalRevenue.toLocaleString('vi-VN')}đ
            </span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +18.5% tháng này
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đơn Hàng</span>
            <span className="text-2xl font-black text-slate-900 mt-1">{stats.totalOrders}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" /> Tỷ lệ hoàn tất 94%
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sản Phẩm Kho</span>
            <span className="text-2xl font-black text-slate-900 mt-1">{stats.totalProducts}</span>
            <span className="text-xs font-semibold text-slate-500 mt-2">5 danh mục chính</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Khách Hàng</span>
            <span className="text-2xl font-black text-slate-900 mt-1">{stats.totalUsers}</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-2">
              <TrendingUp className="w-3.5 h-3.5" /> +12 thành viên mới
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Đơn Hàng Gần Đây</h3>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Ngày Đặt</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{order.id}</td>
                  <td className="py-3 px-4 text-slate-800">{order.customerName}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
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
                    >
                      {order.orderStatus}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to="/admin/orders"
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 inline-flex items-center"
                    >
                      <Eye className="w-4 h-4" />
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
