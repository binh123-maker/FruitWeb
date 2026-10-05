import { User } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { authApi } from '../api/authApi';
import { getAccessToken, clearAuthTokens } from '../api/client';

export const authService = {
  /**
   * Login via FastAPI backend
   */
  async login(email: string, pass: string): Promise<User> {
    const { user } = await authApi.login({
      email: email.trim(),
      password: pass,
    });

    // Save in storage for fast offline reference
    storage.setItem(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  /**
   * Register new user via FastAPI backend
   */
  async register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword?: string;
  }): Promise<User> {
    const { user } = await authApi.register({
      email: data.email.trim(),
      password: data.password,
      confirm_password: data.confirmPassword || data.password,
      full_name: data.name.trim(),
      phone: data.phone?.trim() || undefined,
    });

    storage.setItem(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  /**
   * Fetch current authenticated user from backend
   */
  async getCurrentUser(): Promise<User | null> {
    const token = getAccessToken();
    if (!token) {
      storage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }

    try {
      const user = await authApi.getMe();
      storage.setItem(STORAGE_KEYS.CURRENT_USER, user);
      return user;
    } catch (err: any) {
      console.warn('Session expired or invalid token:', err.message);
      clearAuthTokens();
      storage.removeItem(STORAGE_KEYS.CURRENT_USER);
      return null;
    }
  },

  /**
   * Logout user and clear tokens
   */
  async logout(): Promise<void> {
    authApi.logout();
    storage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // Password reset helpers (Mock preserved for UI compatibility)
  async forgotPassword(_email: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn!',
    };
  },

  async sendResetOtp(email: string): Promise<{ success: boolean; message: string }> {
    return this.forgotPassword(email);
  },

  async verifyResetOtp(_email: string, otp: string): Promise<{ success: boolean }> {
    if (otp !== '123456' && otp !== '888888') {
      throw new Error('Mã OTP không đúng hoặc đã hết hạn! (Mã thử nghiệm: 123456)');
    }
    return { success: true };
  },

  async resetPassword(_email: string, otp: string, _newPass: string): Promise<{ success: boolean }> {
    if (otp !== '123456' && otp !== '888888') {
      throw new Error('Mã OTP không đúng hoặc đã hết hạn! (Thử: 123456)');
    }
    return { success: true };
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const currentUser = storage.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    const updated = currentUser ? { ...currentUser, ...data } : ({ id: userId, ...data } as User);
    storage.setItem(STORAGE_KEYS.CURRENT_USER, updated);
    return updated;
  },
};
