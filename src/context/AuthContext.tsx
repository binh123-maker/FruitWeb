import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Address } from '../types';
import { authService } from '../services/authService';
import { userService } from '../services/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<User>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  addAddress: (data: Omit<Address, 'id'>) => Promise<Address[]>;
  updateAddress: (addressId: string, data: Partial<Address>) => Promise<Address[]>;
  deleteAddress: (addressId: string) => Promise<Address[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user session', error);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const loggedUser = await authService.login(email, pass);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (data: { name: string; email: string; phone: string; password: string }) => {
    const newUser = await authService.register(data);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await authService.updateProfile(user.id, data);
    setUser(updated);
  };

  const addAddress = async (data: Omit<Address, 'id'>) => {
    if (!user) throw new Error('Vui lòng đăng nhập!');
    const addresses = await userService.addAddress(user.id, data);
    setUser((prev) => (prev ? { ...prev, addresses } : null));
    return addresses;
  };

  const updateAddress = async (addressId: string, data: Partial<Address>) => {
    if (!user) throw new Error('Vui lòng đăng nhập!');
    const addresses = await userService.updateAddress(user.id, addressId, data);
    setUser((prev) => (prev ? { ...prev, addresses } : null));
    return addresses;
  };

  const deleteAddress = async (addressId: string) => {
    if (!user) throw new Error('Vui lòng đăng nhập!');
    const addresses = await userService.deleteAddress(user.id, addressId);
    setUser((prev) => (prev ? { ...prev, addresses } : null));
    return addresses;
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        updateAddress,
        deleteAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
