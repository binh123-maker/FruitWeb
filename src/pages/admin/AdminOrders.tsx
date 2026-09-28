import React, { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await orderService.getOrders();
      setOrders(res);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      showToast(`Cập nhật đơn hàng ${orderId} sang "${newStatus}"!`, 'success');
      fetchOrders();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Đang tải danh sách đơn hàng toàn hệ thống..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-slate-900">Quản Lý Đơn Hàng Hệ Thống</h2>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
              <th className="py-3 px-4">Mã Đơn</th>
              <th className="py-3 px-4">Khách Hàng</th>
              <th className="py-3 px-4">Số ĐT</th>
              <th className="py-3 px-4">Số Lượng Sản Phẩm</th>
              <th className="py-3 px-4">Tổng Tiền</th>
              <th className="py-3 px-4">Trạng Thái Đơn</th>
              <th className="py-3 px-4 text-right">Cập Nhật Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-bold text-slate-900">{o.id}</td>
                <td className="py-3 px-4 text-slate-800">{o.customerName}</td>
                <td className="py-3 px-4 text-slate-500">{o.customerPhone}</td>
                <td className="py-3 px-4 text-slate-600">{o.items.length} món</td>
                <td className="py-3 px-4 font-bold text-emerald-600">
                  {o.total.toLocaleString('vi-VN')}đ
                </td>
                <td className="py-3 px-4">
                  <Badge variant={o.orderStatus === 'Đã giao' ? 'emerald' : o.orderStatus === 'Đã hủy' ? 'rose' : 'amber'}>
                    {o.orderStatus}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <select
                    value={o.orderStatus}
                    onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                    className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-1.5 focus:ring-purple-500"
                  >
                    <option value="Chờ xác nhận">Chờ xác nhận</option>
                    <option value="Đã xác nhận">Đã xác nhận</option>
                    <option value="Đang giao">Đang giao</option>
                    <option value="Đã giao">Đã giao</option>
                    <option value="Đã hủy">Đã hủy</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
