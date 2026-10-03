import { User, Address } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { INITIAL_USERS } from '../mock/data';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const getStoredUsers = (): User[] => {
  const existing = storage.getItem<User[]>(STORAGE_KEYS.USERS, []);
  if (existing.length === 0) {
    storage.setItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    return INITIAL_USERS;
  }
  return existing;
};

export const userService = {
  async getUsers(): Promise<User[]> {
    await delay(250);
    return getStoredUsers();
  },

  async updateUserRole(userId: string, role: 'USER' | 'ADMIN'): Promise<User> {
    await delay(300);
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('Người dùng không tồn tại!');

    users[index].role = role;
    storage.setItem(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'BLOCKED'): Promise<User> {
    await delay(300);
    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw new Error('Người dùng không tồn tại!');

    users[index].status = status;
    storage.setItem(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  // Address operations
  async getAddresses(userId: string): Promise<Address[]> {
    await delay(150);
    const users = getStoredUsers();
    const user = users.find((u) => u.id === userId);
    return user?.addresses || [];
  },

  async addAddress(userId: string, data: Omit<Address, 'id'>): Promise<Address[]> {
    await delay(250);
    const users = getStoredUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error('Người dùng không tồn tại!');

    const user = users[userIndex];
    const addresses = user.addresses || [];

    const newAddress: Address = {
      ...data,
      id: `addr-${Date.now()}`,
    };

    if (newAddress.isDefault || addresses.length === 0) {
      newAddress.isDefault = true;
      addresses.forEach((a) => (a.isDefault = false));
    }

    addresses.push(newAddress);
    user.addresses = addresses;
    users[userIndex] = user;
    storage.setItem(STORAGE_KEYS.USERS, users);

    // Update current user session if needed
    const currentUser = storage.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === userId) {
      storage.setItem(STORAGE_KEYS.CURRENT_USER, user);
    }

    return addresses;
  },

  async updateAddress(userId: string, addressId: string, data: Partial<Address>): Promise<Address[]> {
    await delay(250);
    const users = getStoredUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error('Người dùng không tồn tại!');

    const user = users[userIndex];
    let addresses = user.addresses || [];

    if (data.isDefault) {
      addresses.forEach((a) => (a.isDefault = false));
    }

    addresses = addresses.map((a) => (a.id === addressId ? { ...a, ...data } : a));
    user.addresses = addresses;
    users[userIndex] = user;
    storage.setItem(STORAGE_KEYS.USERS, users);

    const currentUser = storage.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === userId) {
      storage.setItem(STORAGE_KEYS.CURRENT_USER, user);
    }

    return addresses;
  },

  async deleteAddress(userId: string, addressId: string): Promise<Address[]> {
    await delay(200);
    const users = getStoredUsers();
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) throw new Error('Người dùng không tồn tại!');

    const user = users[userIndex];
    let addresses = user.addresses || [];
    const wasDefault = addresses.find((a) => a.id === addressId)?.isDefault;

    addresses = addresses.filter((a) => a.id !== addressId);

    if (wasDefault && addresses.length > 0) {
      addresses[0].isDefault = true;
    }

    user.addresses = addresses;
    users[userIndex] = user;
    storage.setItem(STORAGE_KEYS.USERS, users);

    const currentUser = storage.getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (currentUser && currentUser.id === userId) {
      storage.setItem(STORAGE_KEYS.CURRENT_USER, user);
    }

    return addresses;
  }
};
