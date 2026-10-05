import { apiClient, setAuthTokens, clearAuthTokens, getRefreshToken } from './client';
import type { User, UserRole } from '../types';

export interface BackendUser {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'USER' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: BackendUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  confirm_password: string;
  full_name?: string;
  phone?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export function mapBackendUserToFrontend(backendUser: BackendUser): User {
  return {
    id: String(backendUser.id),
    name: backendUser.full_name || backendUser.email.split('@')[0],
    email: backendUser.email,
    phone: backendUser.phone || '',
    role: backendUser.role as UserRole,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(backendUser.full_name || backendUser.email)}`,
    status: backendUser.is_active ? 'ACTIVE' : 'BLOCKED',
    createdAt: backendUser.created_at,
    addresses: [],
  };
}

export const authApi = {
  /**
   * Register a new user account (Public - creates USER role only)
   */
  async register(data: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await apiClient.post<{ success: boolean; data: AuthTokens; message: string }>(
      '/api/auth/register',
      data,
      { skipAuth: true }
    );

    const tokenData = res.data;
    setAuthTokens(tokenData.access_token, tokenData.refresh_token);
    const user = mapBackendUserToFrontend(tokenData.user);
    return { user, tokens: tokenData };
  },

  /**
   * Login with email and password
   */
  async login(data: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await apiClient.post<{ success: boolean; data: AuthTokens; message: string }>(
      '/api/auth/login',
      data,
      { skipAuth: true }
    );

    const tokenData = res.data;
    setAuthTokens(tokenData.access_token, tokenData.refresh_token);
    const user = mapBackendUserToFrontend(tokenData.user);
    return { user, tokens: tokenData };
  },

  /**
   * Get current authenticated user details from backend
   */
  async getMe(): Promise<User> {
    const res = await apiClient.get<{ success: boolean; data: BackendUser; message: string }>(
      '/api/auth/me'
    );
    return mapBackendUserToFrontend(res.data);
  },

  /**
   * Refresh access token
   */
  async refresh(): Promise<AuthTokens> {
    const currentRefreshToken = getRefreshToken();
    if (!currentRefreshToken) {
      throw new Error('Không tìm thấy Refresh Token');
    }

    const res = await apiClient.post<{ success: boolean; data: AuthTokens; message: string }>(
      '/api/auth/refresh',
      { refresh_token: currentRefreshToken },
      { skipAuth: true }
    );

    const tokenData = res.data;
    setAuthTokens(tokenData.access_token, tokenData.refresh_token);
    return tokenData;
  },

  /**
   * Logout from frontend by clearing tokens
   */
  logout(): void {
    clearAuthTokens();
  },
};
