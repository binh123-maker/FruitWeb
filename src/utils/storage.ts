export const STORAGE_KEYS = {
  USERS: 'freshfruit_users',
  CURRENT_USER: 'freshfruit_current_user',
  CART: 'freshfruit_cart',
  ORDERS: 'freshfruit_orders',
  WISHLIST: 'freshfruit_wishlist',
  ADDRESSES: 'freshfruit_addresses',
  COUPONS: 'freshfruit_coupons',
} as const;

export const storage = {
  getItem: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from LocalStorage`, error);
      return defaultValue;
    }
  },

  setItem: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to LocalStorage`, error);
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from LocalStorage`, error);
    }
  },
};
