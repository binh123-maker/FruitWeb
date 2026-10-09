import { User, Address } from '../types';
import { adminUserApi, BackendAdminUser, AdminUserQueryParams } from '../api/adminUserApi';
import { storage, STORAGE_KEYS } from '../utils/storage';

export function mapBackendUserToFrontend(u: BackendAdminUser): User {
  return {
    id: String(u.id),
    name: u.full_name || u.username || u.email.split('@')[0],
    email: u.email,
    phone: u.phone || '',
    role: u.role,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.full_name || u.email)}`,
    status: u.is_active ? 'ACTIVE' : 'BLOCKED',
    createdAt: u.created_at,
    updatedAt: u.updated_at,
  };
}

export const userService = {
  /**
   * ADMIN: Lấy danh sách thành viên từ backend
   */
  async getUsers(params: AdminUserQueryParams = {}): Promise<User[]> {
    const res = await adminUserApi.getUsers({ limit: 100, ...params });
    return res.items.map(mapBackendUserToFrontend);
  },

  /**
   * ADMIN: Lấy chi tiết thông tin một thành viên
   */
  async getUserDetail(userId: string | number): Promise<User> {
    const res = await adminUserApi.getUserDetail(Number(userId));
    return mapBackendUserToFrontend(res);
  },

  /**
   * ADMIN: Cập nhật quyền hạn (USER <-> ADMIN)
   */
  async updateUserRole(userId: string | number, role: 'USER' | 'ADMIN'): Promise<User> {
    const res = await adminUserApi.updateUserRole(Number(userId), role);
    return mapBackendUserToFrontend(res);
  },

  /**
   * ADMIN: Khóa / Mở khóa tài khoản
   */
  async updateUserStatus(userId: string | number, status: 'ACTIVE' | 'BLOCKED'): Promise<User> {
    const isActive = status === 'ACTIVE';
    const res = await adminUserApi.updateUserStatus(Number(userId), isActive);
    return mapBackendUserToFrontend(res);
  },

  // Address operations (lưu theo hồ sơ cá nhân của user)
  async getAddresses(userId: string): Promise<Address[]> {
    const allAddresses = storage.getItem<Record<string, Address[]>>('freshfruit_user_addresses', {});
    return allAddresses[userId] || [];
  },

  async addAddress(userId: string, data: Omit<Address, 'id'>): Promise<Address[]> {
    const allAddresses = storage.getItem<Record<string, Address[]>>('freshfruit_user_addresses', {});
    const addresses = allAddresses[userId] || [];

    const newAddress: Address = {
      ...data,
      id: `addr-${Date.now()}`,
    };

    if (newAddress.isDefault || addresses.length === 0) {
      newAddress.isDefault = true;
      addresses.forEach((a) => (a.isDefault = false));
    }

    addresses.push(newAddress);
    allAddresses[userId] = addresses;
    storage.setItem('freshfruit_user_addresses', allAddresses);

    return addresses;
  },

  async updateAddress(userId: string, addressId: string, data: Partial<Address>): Promise<Address[]> {
    const allAddresses = storage.getItem<Record<string, Address[]>>('freshfruit_user_addresses', {});
    let addresses = allAddresses[userId] || [];

    if (data.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    addresses = addresses.map((a) => (a.id === addressId ? { ...a, ...data } : a));
    allAddresses[userId] = addresses;
    storage.setItem('freshfruit_user_addresses', allAddresses);

    return addresses;
  },

  async deleteAddress(userId: string, addressId: string): Promise<Address[]> {
    const allAddresses = storage.getItem<Record<string, Address[]>>('freshfruit_user_addresses', {});
    let addresses = allAddresses[userId] || [];
    const wasDefault = addresses.find((a) => a.id === addressId)?.isDefault;

    addresses = addresses.filter((a) => a.id !== addressId);

    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    allAddresses[userId] = addresses;
    storage.setItem('freshfruit_user_addresses', allAddresses);

    return addresses;
  },
};
