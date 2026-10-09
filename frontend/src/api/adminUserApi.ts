import { apiClient } from './client';

export interface BackendAdminUser {
  id: number;
  email: string;
  username: string | null;
  full_name: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedBackendAdminUsers {
  items: BackendAdminUser[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface AdminUserQueryParams {
  search?: string;
  role?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export const adminUserApi = {
  /**
   * ADMIN: Lấy danh sách người dùng với phân trang, tìm kiếm, lọc role/trạng thái
   */
  async getUsers(params: AdminUserQueryParams = {}): Promise<PaginatedBackendAdminUsers> {
    return apiClient.get<PaginatedBackendAdminUsers>('/api/admin/users', { params });
  },

  /**
   * ADMIN: Xem chi tiết người dùng (không chứa password_hash)
   */
  async getUserDetail(userId: number): Promise<BackendAdminUser> {
    return apiClient.get<BackendAdminUser>(`/api/admin/users/${userId}`);
  },

  /**
   * ADMIN: Cập nhật vai trò (USER <-> ADMIN)
   */
  async updateUserRole(userId: number, role: 'USER' | 'ADMIN'): Promise<BackendAdminUser> {
    return apiClient.put<BackendAdminUser>(`/api/admin/users/${userId}/role`, { role });
  },

  /**
   * ADMIN: Khóa hoặc mở khóa tài khoản
   */
  async updateUserStatus(userId: number, isActive: boolean): Promise<BackendAdminUser> {
    return apiClient.put<BackendAdminUser>(`/api/admin/users/${userId}/status`, {
      is_active: isActive,
    });
  },
};
