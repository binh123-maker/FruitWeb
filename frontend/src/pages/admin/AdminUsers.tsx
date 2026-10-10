import React, { useState, useEffect, useCallback } from 'react';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleToggle = async (userId: string, currentRole: 'USER' | 'ADMIN') => {
    const nextRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await userService.updateUserRole(userId, nextRole);
      showToast(`Đã thay đổi quyền tài khoản thành ${nextRole}!`, 'success');
      fetchUsers();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật quyền tài khoản', 'error');
    }
  };

  if (isLoading) {
    return <LoadingSpinner label="Đang tải danh sách thành viên..." size="lg" />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Danh Sách Thành Viên & Quản Trị Viên</h2>
        <p className="text-xs text-slate-500 mt-0.5">Quản lý tài khoản người dùng và phân quyền quản trị hệ thống</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-black text-[11px]">
              <th className="py-3 px-4">Thành Viên</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Số Điện Thoại</th>
              <th className="py-3 px-4">Vai Trò (Role)</th>
              <th className="py-3 px-4 text-right">Phân Quyền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  Chưa có thành viên nào trong hệ thống
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img
                      src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                      alt={u.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                    <span className="font-extrabold text-slate-900">{u.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{u.email}</td>
                  <td className="py-3 px-4 text-slate-500">{u.phone || 'Chưa cập nhật'}</td>
                  <td className="py-3 px-4">
                    <Badge variant={u.role === 'ADMIN' ? 'purple' : 'slate'} size="sm" dot>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleRoleToggle(u.id, u.role)}
                      className="px-3 py-1 rounded-xl border border-purple-200 text-purple-700 hover:bg-purple-50 font-extrabold transition-colors cursor-pointer text-xs"
                    >
                      Chuyển thành {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                    </button>
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
