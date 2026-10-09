import React, { useState, useEffect, useCallback } from 'react';
import { adminUserApi, BackendAdminUser } from '../../api/adminUserApi';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { Search, Shield, Lock, Unlock, Eye, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<BackendAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal states
  const [selectedUser, setSelectedUser] = useState<BackendAdminUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'ROLE' | 'STATUS';
    user: BackendAdminUser;
    targetValue: string | boolean;
  } | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminUserApi.getUsers({
        search: search.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        is_active: statusFilter === 'ACTIVE' ? true : statusFilter === 'BLOCKED' ? false : undefined,
        page,
        limit,
      });

      setUsers(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (err: any) {
      console.error('Error fetching admin users:', err);
      showToast(err.message || 'Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, page, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleExecuteAction = async () => {
    if (!confirmAction) return;
    const { type, user, targetValue } = confirmAction;
    setIsProcessingAction(true);

    try {
      if (type === 'ROLE') {
        const nextRole = targetValue as 'USER' | 'ADMIN';
        await adminUserApi.updateUserRole(user.id, nextRole);
        showToast(`Đã chuyển vai trò của "${user.email}" thành ${nextRole}!`, 'success');
      } else if (type === 'STATUS') {
        const nextStatus = targetValue as boolean;
        await adminUserApi.updateUserStatus(user.id, nextStatus);
        showToast(
          nextStatus
            ? `Đã mở khóa tài khoản "${user.email}"!`
            : `Đã khóa tài khoản "${user.email}"!`,
          'success'
        );
      }

      setConfirmAction(null);
      await fetchUsers();
      if (selectedUser?.id === user.id) {
        // Refresh detail modal
        const refreshed = await adminUserApi.getUserDetail(user.id);
        setSelectedUser(refreshed);
      }
    } catch (err: any) {
      // Descriptive error message from backend (e.g. cannot demote self, last admin)
      showToast(err.message || 'Thao tác không thành công!', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Quản Lý Người Dùng & Quản Trị Viên</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tổng cộng: <strong className="text-purple-600 font-bold">{total}</strong> tài khoản trong hệ thống
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo email, họ tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <Button type="submit" variant="outline" size="sm">
            Tìm
          </Button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Vai trò:</span>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold focus:ring-purple-500"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="USER">Khách hàng (USER)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-600">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-lg p-1.5 font-bold focus:ring-purple-500"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="BLOCKED">Bị khóa</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner label="Đang tải danh sách người dùng..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold bg-slate-50/50">
                <th className="py-3 px-4">Thành Viên</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4">Vai Trò</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Không tìm thấy người dùng nào phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isSelf = currentAdmin && String(u.id) === String(currentAdmin.id);

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            u.full_name || u.email
                          )}`}
                          alt={u.full_name || u.email}
                          className="w-8 h-8 rounded-full object-cover bg-slate-100"
                        />
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.full_name || u.username || 'Chưa đặt tên'}
                            {isSelf && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">
                                Bạn
                              </span>
                            )}
                          </span>
                          <span className="text-[10px] text-slate-400">ID: #{u.id}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600">{u.email}</td>

                      <td className="py-3 px-4 text-slate-500">{u.phone || '—'}</td>

                      <td className="py-3 px-4">
                        <Badge variant={u.role === 'ADMIN' ? 'purple' : 'slate'}>
                          {u.role === 'ADMIN' ? 'ADMIN' : 'USER'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4">
                        <Badge variant={u.is_active ? 'emerald' : 'rose'}>
                          {u.is_active ? 'Hoạt động' : 'Bị khóa'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail button */}
                          <button
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Role Toggle button */}
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'ROLE',
                                user: u,
                                targetValue: u.role === 'ADMIN' ? 'USER' : 'ADMIN',
                              })
                            }
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.role === 'ADMIN'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-purple-600 hover:bg-purple-50'
                            }`}
                            title={u.role === 'ADMIN' ? 'Hạ xuống USER' : 'Nâng lên ADMIN'}
                          >
                            <Shield className="w-4 h-4" />
                          </button>

                          {/* Lock / Unlock button */}
                          <button
                            onClick={() =>
                              setConfirmAction({
                                type: 'STATUS',
                                user: u,
                                targetValue: !u.is_active,
                              })
                            }
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.is_active
                                ? 'text-rose-500 hover:bg-rose-50'
                                : 'text-emerald-600 hover:bg-emerald-50'
                            }`}
                            title={u.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {u.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
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
                Trang {page} / {totalPages} (Tổng {total} tài khoản)
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

      {/* User Detail Modal */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`Chi Tiết Người Dùng: ${selectedUser.email}`}
        >
          <div className="flex flex-col gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  selectedUser.full_name || selectedUser.email
                )}`}
                alt={selectedUser.email}
                className="w-12 h-12 rounded-full object-cover bg-white border border-slate-200"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 text-sm">
                  {selectedUser.full_name || selectedUser.username || 'Chưa cập nhật tên'}
                </span>
                <span className="text-slate-500">{selectedUser.email}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <strong className="text-slate-800 block">ID tài khoản:</strong> #{selectedUser.id}
              </div>
              <div>
                <strong className="text-slate-800 block">Số điện thoại:</strong>{' '}
                {selectedUser.phone || 'Chưa cập nhật'}
              </div>
              <div>
                <strong className="text-slate-800 block">Vai trò:</strong>{' '}
                <Badge variant={selectedUser.role === 'ADMIN' ? 'purple' : 'slate'}>
                  {selectedUser.role}
                </Badge>
              </div>
              <div>
                <strong className="text-slate-800 block">Trạng thái:</strong>{' '}
                <Badge variant={selectedUser.is_active ? 'emerald' : 'rose'}>
                  {selectedUser.is_active ? 'Hoạt động' : 'Bị khóa'}
                </Badge>
              </div>
              <div>
                <strong className="text-slate-800 block">Ngày tạo:</strong>{' '}
                {new Date(selectedUser.created_at).toLocaleString('vi-VN')}
              </div>
              <div>
                <strong className="text-slate-800 block">Cập nhật:</strong>{' '}
                {new Date(selectedUser.updated_at).toLocaleString('vi-VN')}
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px]">
              🔒 <strong>Bảo mật:</strong> Mật khẩu người dùng được băm an toàn phía máy chủ và tuyệt đối không bao giờ được gửi về máy khách.
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog Modal */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title="Xác Nhận Thao Tác Quản Trị"
        >
          <div className="flex flex-col gap-4 text-xs text-slate-700">
            {confirmAction.type === 'ROLE' ? (
              <p>
                Bạn có chắc chắn muốn thay đổi quyền của tài khoản{' '}
                <strong className="text-slate-900">{confirmAction.user.email}</strong> sang{' '}
                <strong className="text-purple-700">{String(confirmAction.targetValue)}</strong> không?
              </p>
            ) : (
              <p>
                Bạn có chắc chắn muốn{' '}
                <strong className={confirmAction.targetValue ? 'text-emerald-700' : 'text-rose-700'}>
                  {confirmAction.targetValue ? 'mở khóa' : 'khóa'}
                </strong>{' '}
                tài khoản <strong className="text-slate-900">{confirmAction.user.email}</strong> không?
              </p>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction(null)}
                disabled={isProcessingAction}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExecuteAction}
                isLoading={isProcessingAction}
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
