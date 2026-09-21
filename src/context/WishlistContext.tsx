import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Product[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const items = storage.getItem<Product[]>(STORAGE_KEYS.WISHLIST, []);
    setWishlist(items);
  }, []);

  const toggleWishlist = (product: Product) => {
    if (!user) {
      showToast('Vui lòng đăng nhập để lưu sản phẩm yêu thích!', 'warning');
      return;
    }

    const exists = wishlist.some((item) => item.id === product.id);
    let updated: Product[];

    if (exists) {
      updated = wishlist.filter((item) => item.id !== product.id);
      showToast(`Đã bỏ "${product.name}" khỏi danh sách yêu thích`, 'info');
    } else {
      updated = [...wishlist, product];
      showToast(`Đã thêm "${product.name}" vào danh sách yêu thích`, 'success');
    }

    setWishlist(updated);
    storage.setItem(STORAGE_KEYS.WISHLIST, updated);
  };

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter((item) => item.id !== productId);
    setWishlist(updated);
    storage.setItem(STORAGE_KEYS.WISHLIST, updated);
    showToast('Đã xóa sản phẩm khỏi danh sách yêu thích', 'info');
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    storage.setItem(STORAGE_KEYS.WISHLIST, []);
    showToast('Đã xóa tất cả sản phẩm khỏi danh sách yêu thích', 'info');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
        removeFromWishlist,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
