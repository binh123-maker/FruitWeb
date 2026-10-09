import React, { useState, useEffect, useCallback } from 'react';
import { orderApi, BackendOrder } from '../../api/orderApi';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
};

const ALLOWED_NEXT_STATUSES: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const AdminOrders: React.FC = () => {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<BackendOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<BackendOrder | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await orderApi.adminGetOrders({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        page,
        limit,
      });
      setOrders(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      console.error('Error fetching admin orders:', err);
      showToast(err.message || 'Lỗi khi tải danh sách đơn hàng', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const label = STATUS_LABELS[newStatus] || newStatus;
    if (!window.confirm(`Bạn có chắc muốn chuyển trạng thái đơn #${orderId} sang "${label}" không?`)) {
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      const updated = await orderApi.adminUpdateOrderStatus(orderId, newStatus);
      showToast(`Cập nhật đơn #${orderId} sang "${label}" thành công!`, 'success');
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật trạng thái đơn hàng', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="amber">Chờ xác nhận</Badge>;
      case 'confirmed':
        return <Badge variant="purple">Đã xác nhận</Badge>;
      case 'shipping':
        return <Badge variant="sky">Đang giao</Badge>;
      case 'delivered':
        return <Badge variant="emerald">Đã giao</Badge>;
      case 'cancelled':
        return <Badge variant="rose">Đã hủy</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Đơn Hàng Hệ Thống</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng: <strong className="text-purple-600 font-bold">{total}</strong> đơn hàng
          </p>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          {['ALL', 'pending', 'confirmed', 'shipping', 'delivered', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : STATUS_LABELS[st] || st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Đang tải danh sách đơn hàng toàn hệ thống..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold bg-slate-50/50">
                <th className="py-3 px-4">Mã Đơn</th>
                <th className="py-3 px-4">Khách Hàng</th>
                <th className="py-3 px-4">Số ĐT</th>
                <th className="py-3 px-4">Ngày Đặt</th>
                <th className="py-3 px-4">Tổng Tiền</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Chuyển Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Không có đơn hàng nào ở trạng thái này.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const allowedNext = ALLOWED_NEXT_STATUSES[o.status] || [];

                  return (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="text-purple-600 hover:underline cursor-pointer"
                        >
                          #{o.id}
                        </button>
                      </td>

                      <td className="py-3 px-4 text-slate-800">
                        <div className="flex flex-col">
                          <span className="font-bold">{o.customer_name || 'Khách hàng'}</span>
                          <span className="text-[10px] text-slate-400">User ID: #{o.user_id}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-500">{o.phone || '—'}</td>

                      <td className="py-3 px-4 text-slate-500">
                        {new Date(o.created_at).toLocaleDateString('vi-VN')}
                      </td>

                      <td className="py-3 px-4 font-bold text-emerald-600">
                        {o.total_amount.toLocaleString('vi-VN')}đ
                      </td>

                      <td className="py-3 px-4">{getStatusBadge(o.status)}</td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết đơn"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {allowedNext.length > 0 ? (
                            <select
                              value={o.status}
                              onChange={(e) => handleStatusChange(o.id, e.target.value)}
                              disabled={updatingOrderId === o.id}
                              className="bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold p-1.5 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value={o.status} disabled>
                                {STATUS_LABELS[o.status] || o.status}
                              </option>
                              {allowedNext.map((st) => (
                                <option key={st} value={st}>
                                  → {STATUS_LABELS[st] || st}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Đã kết thúc</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>
                Trang {page} / {totalPages} (Tổng {total} đơn hàng)
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-100 cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Chi Tiết Đơn Hàng #${selectedOrder.id}`}
        >
          <div className="flex flex-col gap-5 text-xs text-slate-600">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span>Trạng thái đơn hàng:</span>
              <div>{getStatusBadge(selectedOrder.status)}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <strong className="text-slate-800 block">Khách hàng:</strong>{' '}
                {selectedOrder.customer_name || 'Khách hàng'}
              </div>
              <div>
                <strong className="text-slate-800 block">Số điện thoại:</strong>{' '}
                {selectedOrder.phone || '—'}
              </div>
              <div className="col-span-2">
                <strong className="text-slate-800 block">Địa chỉ giao hàng:</strong>{' '}
                {selectedOrder.shipping_address || '—'}
              </div>
              <div>
                <strong className="text-slate-800 block">Phương thức:</strong>{' '}
                {selectedOrder.payment_method || 'COD'}
              </div>
              <div>
                <strong className="text-slate-800 block">Ngày tạo:</strong>{' '}
                {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-slate-900 text-sm">Danh sách mặt hàng</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={item.product_image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80'}
                        alt={item.product_name}
                        className="w-8 h-8 rounded object-cover"
                        onError={(e) => {
                          const target = e.currentTarget;
                          const fallback =
                            'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
                          if (!target.src.includes('1610832958506')) {
                            target.src = fallback;
                          }
                        }}
                      />
                      <span className="font-bold text-slate-800">{item.product_name}</span>
                      <span>x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.subtotal.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 text-slate-700">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span>{(selectedOrder.subtotal ?? selectedOrder.total_amount).toLocaleString('vi-VN')}đ</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-rose-600">
                  <span>Giảm giá ({selectedOrder.coupon_code || 'Coupon'}):</span>
                  <span>-{selectedOrder.discount_amount.toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-slate-900 text-sm">
                <span>Tổng cộng:</span>
                <span className="text-emerald-600 text-base">
                  {selectedOrder.total_amount.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
