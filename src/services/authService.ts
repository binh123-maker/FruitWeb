import { User } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { INITIAL_USERS } from '../mock/data';

// Helper delay to simulate API latency
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

// Ensure initial users exist in storage
const initUsers = (): User[] => {
  const existing = storage.getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (existing.length === 0) {
    storage.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    return INITIAL_USERS;
  }
  return existing;
};

export const authService = {
  async login(email: string, pass: string): Promise<User> {
    await delay(400);
    const users = initUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (!user) {
      throw new Error('Email không tồn tại trên hệ thống!');
    }

    if (user.status === 'BLOCKED') {
      throw new Error('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ!');
    }

    // Mock password verification (all pass: 123456 or match)
    if (pass !== '123456' && pass.length < 6) {
      throw new Error('Mật khẩu không chính xác!');
    }

    storage.setItem(STORAGE_KEYS.CURRENT_USER, user);
    return user;
  },

  async register(data: { name: string; email: string; phone: string; password: string }): Promise<User> {
    await delay(500);
    const users = initUsers();

    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase().trim());
    if (existing) {
      throw new Error('Email này đã được đăng ký!');
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: data.name,
      email: data.email.trim(),
      phone: data.phone.trim(),
      role: 'USER',
      status: 'ACTIVE',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      createdAt: new Date().toISOString(),
      addresses: [],
    };

    users.push(newUser);
    storage.setItem(STORAGE_KEYS.USERS, users);
    storage.setItem(STORAGE_KEYS.CURRENT_USER, newUser);
    return newUser;
  },

  async getCurrentUser(): Promise<User | null> {
    return storage.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },

  async logout(): Promise<void> {
    await delay(200);
    storage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await delay(400);
    const users = initUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      throw new Error('Không tìm thấy tài khoản với email này!');
    }

    return {
      success: true,
      message: 'Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn!',
    };
  },

  async sendResetOtp(email: string): Promise<{ success: boolean; message: string }> {
    return this.forgotPassword(email);
  },

  async verifyResetOtp(_email: string, otp: string): Promise<{ success: boolean }> {
    await delay(300);
    if (otp !== '123456' && otp !== '888888') {
      throw new Error('Mã OTP không đúng hoặc đã hết hạn! (Mã thử nghiệm: 123456)');
    }
    return { success: true };
  },

  async resetPassword(email: string, otp: string, newPass: string): Promise<{ success: boolean }> {
    await delay(500);
    if (otp !== '123456' && otp !== '888888') {
      // Accept 123456 or 888888 as valid mock OTP
      throw new Error('Mã OTP không đúng hoặc đã hết hạn! (Thử: 123456)');
    }

    const users = initUsers();
    const userIndex = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase().trim());

    if (userIndex === -1) {
      throw new Error('Tài khoản không tồn tại!');
    }

    storage.setItem(STORAGE_KEYS.USERS, users);
    return { success: true };
  },

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    await delay(300);
    const users = initUsers();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Không tìm thấy thông tin người dùng!');
    }

    const updatedUser = { ...users[userIndex], ...data };
    users[userIndex] = updatedUser;
    storage.setItem(STORAGE_KEYS.USERS, users);

    const currentUser = storage.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === userId) {
      storage.setItem(STORAGE_KEYS.CURRENT_USER, updatedUser);
    }

    return updatedUser;
  }
};
