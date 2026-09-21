import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import type { User } from '../../types';
import { Badge } from '../../components/common/Badge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';

export const AdminUsers: React.FC = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res);
    } catch (err) {
      console.error('Error fetching admin users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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
    return <LoadingSpinner label="Đang tải danh sách thành viên..." />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-slate-900">Danh Sách Thành Viên & Quản Trị Viên</h2>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
              <th className="py-3 px-4">Thành Viên</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Số Điện Thoại</th>
              <th className="py-3 px-4">Vai Trò (Role)</th>
              <th className="py-3 px-4 text-right">Phân Quyền</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 flex items-center gap-3">
                  <img
                    src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                    alt={u.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="font-bold text-slate-900">{u.name}</span>
                </td>
                <td className="py-3 px-4 text-slate-600">{u.email}</td>
                <td className="py-3 px-4 text-slate-500">{u.phone || 'Chưa cập nhật'}</td>
                <td className="py-3 px-4">
                  <Badge variant={u.role === 'ADMIN' ? 'purple' : 'slate'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => handleRoleToggle(u.id, u.role)}
                    className="px-3 py-1 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-50 font-bold transition-colors cursor-pointer"
                  >
                    Chuyển thành {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
