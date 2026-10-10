import { User, Address, UserRole } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { apiClient } from '../api/client';
import { mockStore, isMockMode } from '../mock/mockStore';

export interface AdminUserResponse {
  id: number;
  email: string;
  username?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedUserResponse {
  items: AdminUserResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

function mapBackendUserToFrontend(u: AdminUserResponse): User {
  return {
    id: String(u.id),
    name: u.full_name || u.username || u.email,
    email: u.email,
    phone: u.phone || '',
    role: (u.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'USER') as UserRole,
    status: u.is_active ? 'ACTIVE' : 'BLOCKED',
    createdAt: u.created_at,
  };
}

export const userService = {
  /**
   * Lấy danh sách người dùng hệ thống từ backend API (chỉ Admin)
   */
  async getUsers(params?: {
    search?: string;
    role?: string;
    is_active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<User[]> {
    if (isMockMode()) {
      return mockStore.getUsers();
    }
    const res = await apiClient.get<PaginatedUserResponse>('/api/admin/users', {
      params: {
        search: params?.search,
        role: params?.role,
        is_active: params?.is_active,
        page: params?.page || 1,
        limit: params?.limit || 100,
      },
    });
    return (res?.items || []).map(mapBackendUserToFrontend);
  },

  /**
   * Admin cập nhật quyền vai trò (USER / ADMIN) qua API
   * Backend có kiểm tra bảo vệ tránh hạ quyền admin cuối cùng
   */
  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
    const res = await apiClient.put<AdminUserResponse>(`/api/admin/users/${userId}/role`, {
      role,
    });
    return mapBackendUserToFrontend(res);
  },

  /**
   * Admin khóa / mở khóa tài khoản người dùng qua API
   */
  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED'): Promise<User> {
    const res = await apiClient.put<AdminUserResponse>(`/api/admin/users/${userId}/status`, {
      is_active: status === 'ACTIVE',
    });
    return mapBackendUserToFrontend(res);
  },

  // Address operations (lưu trữ phục vụ profile người dùng)
  async getAddresses(userId: string): Promise<Address[]> {
    const users = storage.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const user = users.find((u) => u.id === userId);
    return user?.addresses || [];
  },

  async addAddress(userId: string, data: Omit<Address, 'id'>): Promise<Address[]> {
    const users = storage.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      // Lưu địa chỉ vào currentUser nếu có
      const currentUser = storage.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
      if (currentUser && currentUser.id === userId) {
        const newAddress: Address = { ...data, id: `addr-${Date.now()}` };
        currentUser.addresses = [...(currentUser.addresses || []), newAddress];
        storage.setItem(STORAGE_KEYS.CURRENT_USER, currentUser);
        return currentUser.addresses;
      }
      return [];
    }

    const user = users[userIndex];
    const addresses = user.addresses || [];
    const newAddress: Address = {
      ...data,
      id: `addr-${Date.now()}`,
    };

    if (newAddress.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    const updated = [...addresses, newAddress];
    user.addresses = updated;
    storage.setItem(STORAGE_KEYS.USERS, users);
    return updated;
  },

  async updateAddress(userId: string, addressId: string, data: Partial<Address>): Promise<Address[]> {
    const users = storage.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return [];

    const user = users[userIndex];
    let addresses = user.addresses || [];

    if (data.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    addresses = addresses.map((a) => (a.id === addressId ? { ...a, ...data } : a));
    user.addresses = addresses;
    storage.setItem(STORAGE_KEYS.USERS, users);
    return addresses;
  },

  async deleteAddress(userId: string, addressId: string): Promise<Address[]> {
    const users = storage.getItem<User[]>(STORAGE_KEYS.USERS, []);
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) return [];

    const user = users[userIndex];
    let addresses = user.addresses || [];
    addresses = addresses.filter((a) => a.id !== addressId);
    user.addresses = addresses;
    storage.setItem(STORAGE_KEYS.USERS, users);
    return addresses;
  },
};
