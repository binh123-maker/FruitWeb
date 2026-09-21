import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';
import type { Order, OrderStatus } from '../types';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { Package, Eye } from 'lucide-react';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const res = await orderService.getUserOrders(user.id);
          setOrders(res);
        }
      } catch (err) {
        console.error('Error loading orders:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này?')) return;
    try {
      await orderService.updateOrderStatus(orderId, 'Đã hủy');
      showToast('Hủy đơn hàng thành công!', 'success');
      const updated = await orderService.getUserOrders(user!.id);
      setOrders(updated);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      showToast(err.message || 'Không thể hủy đơn hàng', 'error');
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Chờ xác nhận':
        return <Badge variant="amber">Chờ xác nhận</Badge>;
      case 'Đã xác nhận':
        return <Badge variant="emerald">Đã xác nhận</Badge>;
      case 'Đang giao':
        return <Badge variant="emerald">Đang giao hàng</Badge>;
      case 'Đã giao':
        return <Badge variant="emerald">Đã giao hàng</Badge>;
      case 'Đã hủy':
        return <Badge variant="rose">Đã hủy</Badge>;
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'ALL') return true;
    return o.orderStatus === filterStatus;
  });

  if (isLoading) {
    return <LoadingSpinner label="Đang tải danh sách đơn hàng..." />;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Lịch Sử Đơn Hàng</h1>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-bold">
          {['ALL', 'Chờ xác nhận', 'Đã xác nhận', 'Đang giao', 'Đã giao', 'Đã hủy'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="w-16 h-16 text-slate-300" />}
          title="Chưa có đơn hàng nào"
          description="Bạn chưa thực hiện đơn hàng nào ở trạng thái này tại FreshFruit."
          actionText="Mua sắm ngay"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-4 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-sm">Mã đơn: {order.id}</span>
                  <span>•</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div>{getStatusBadge(order.orderStatus)}</div>
              </div>

              {/* Order Items Preview */}
              <div className="flex flex-col gap-2">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100"
                      />
                      <span className="font-bold text-slate-800 line-clamp-1">{item.productName}</span>
                      <span className="text-slate-400">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <span>Tổng tiền:</span>
                  <span className="text-base font-black text-emerald-600">
                    {order.total.toLocaleString('vi-VN')}đ
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {order.orderStatus === 'Chờ xác nhận' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold transition-colors cursor-pointer"
                    >
                      Hủy đơn
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Chi tiết</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Chi Tiết Đơn Hàng ${selectedOrder.id}`}
        >
          <div className="flex flex-col gap-5 text-xs text-slate-600">
            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span>Trạng thái đơn hàng:</span>
              <div>{getStatusBadge(selectedOrder.orderStatus)}</div>
            </div>

            <div className="flex flex-col gap-1.5">
              <h4 className="font-bold text-slate-900 text-sm">Thông tin nhận hàng</h4>
              <p><strong>Người nhận:</strong> {selectedOrder.customerName} ({selectedOrder.customerPhone})</p>
              <p><strong>Địa chỉ:</strong> {selectedOrder.shippingAddress}</p>
              <p><strong>Ghi chú:</strong> {selectedOrder.note || 'Không có ghi chú'}</p>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-bold text-slate-900 text-sm">Danh sách trái cây</h4>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border-b border-slate-100 last:border-b-0">
                    <div className="flex items-center gap-2.5">
                      <img src={item.productImage} alt={item.productName} className="w-8 h-8 rounded object-cover" />
                      <span className="font-bold text-slate-800">{item.productName}</span>
                      <span>x{item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-900">
                      {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1 pt-2 border-t border-slate-100 text-slate-700">
              <div className="flex justify-between"><span>Tạm tính:</span><span>{selectedOrder.subtotal.toLocaleString('vi-VN')}đ</span></div>
              <div className="flex justify-between"><span>Phí giao hàng:</span><span>{selectedOrder.shippingFee.toLocaleString('vi-VN')}đ</span></div>
              {selectedOrder.discount > 0 && <div className="flex justify-between text-rose-600"><span>Giảm giá:</span><span>-{selectedOrder.discount.toLocaleString('vi-VN')}đ</span></div>}
              <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-slate-900 text-sm"><span>Tổng cộng:</span><span className="text-emerald-600 text-base">{selectedOrder.total.toLocaleString('vi-VN')}đ</span></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
