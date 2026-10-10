import { Product, Category, FilterOptions, Coupon, Order, User } from '../types';
import { storage } from '../utils/storage';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_USERS,
} from './data';

const MOCK_STORAGE_KEYS = {
  PRODUCTS: 'freshfruit_mock_products',
  CATEGORIES: 'freshfruit_mock_categories',
  ORDERS: 'freshfruit_mock_orders',
  COUPONS: 'freshfruit_mock_coupons',
  USERS: 'freshfruit_mock_users',
  VERSION: 'freshfruit_mock_data_v1',
};

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const isMockMode = (): boolean => {
  const envVal = import.meta.env.VITE_USE_MOCK_DATA;
  return envVal === 'true' || envVal === true;
};

function getStoredProducts(): Product[] {
  const stored = storage.getItem<Product[]>(MOCK_STORAGE_KEYS.PRODUCTS, []);
  if (stored.length === 0) {
    storage.setItem(MOCK_STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
    return INITIAL_PRODUCTS;
  }
  return stored;
}

function getStoredCategories(): Category[] {
  const stored = storage.getItem<Category[]>(MOCK_STORAGE_KEYS.CATEGORIES, []);
  if (stored.length === 0) {
    storage.setItem(MOCK_STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
    return INITIAL_CATEGORIES;
  }
  return stored;
}

function getStoredOrders(): Order[] {
  const stored = storage.getItem<Order[]>(MOCK_STORAGE_KEYS.ORDERS, []);
  if (stored.length === 0) {
    storage.setItem(MOCK_STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }
  return stored;
}

export const mockStore = {
  // ==========================================
  // Products
  // ==========================================
  async getProducts(
    options: FilterOptions = {}
  ): Promise<{ products: Product[]; total: number; totalPages?: number; page?: number }> {
    await delay(120);
    let result = [...getStoredProducts()];

    if (options.category) {
      const catSlug = options.category.toLowerCase();
      result = result.filter(
        (p) =>
          p.category.toLowerCase() === catSlug ||
          (p.categoryName && p.categoryName.toLowerCase() === catSlug)
      );
    }

    if (options.search) {
      const q = options.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.origin.toLowerCase().includes(q) ||
          (p.categoryName && p.categoryName.toLowerCase().includes(q))
      );
    }

    if (options.minPrice !== undefined) {
      result = result.filter((p) => (p.salePrice || p.price) >= options.minPrice!);
    }

    if (options.maxPrice !== undefined) {
      result = result.filter((p) => (p.salePrice || p.price) <= options.maxPrice!);
    }

    if (options.isFeatured) {
      result = result.filter((p) => p.isFeatured);
    }

    if (options.isBestSeller) {
      result = result.filter((p) => p.isBestSeller);
    }

    if (options.isOrganic) {
      result = result.filter((p) => p.isOrganic);
    }

    if (options.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    if (options.sortBy) {
      switch (options.sortBy) {
        case 'price_asc':
          result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
          break;
        case 'price_desc':
          result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          break;
        case 'bestseller':
          result.sort((a, b) => b.soldCount - a.soldCount);
          break;
        case 'rating':
          result.sort((a, b) => b.rating - a.rating);
          break;
      }
    }

    const total = result.length;
    const page = options.page || 1;
    const limit = options.limit || 12;
    const totalPages = Math.ceil(total / limit) || 1;

    const start = (page - 1) * limit;
    const paginated = result.slice(start, start + limit);

    return { products: paginated, total, totalPages, page };
  },

  async getProductById(idOrSlug: string): Promise<Product | null> {
    await delay(80);
    const products = getStoredProducts();
    const query = idOrSlug.toLowerCase();
    return products.find((p) => p.id === idOrSlug || p.slug.toLowerCase() === query) || null;
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    await delay(80);
    const products = getStoredProducts();
    return products.filter((p) => p.isFeatured).slice(0, limit);
  },

  async getBestSellers(limit = 8): Promise<Product[]> {
    await delay(80);
    const products = getStoredProducts();
    return products.filter((p) => p.isBestSeller).slice(0, limit);
  },

  async getRelatedProducts(productId: string, category: string, limit = 4): Promise<Product[]> {
    await delay(80);
    const products = getStoredProducts();
    return products
      .filter((p) => p.category === category && p.id !== productId)
      .slice(0, limit);
  },

  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    await delay(150);
    const products = getStoredProducts();
    const newProduct: Product = {
      ...data,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    storage.setItem(MOCK_STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await delay(150);
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm trong mockdata!');

    const updated = { ...products[index], ...data };
    products[index] = updated;
    storage.setItem(MOCK_STORAGE_KEYS.PRODUCTS, products);
    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    await delay(100);
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    storage.setItem(MOCK_STORAGE_KEYS.PRODUCTS, filtered);
  },

  // ==========================================
  // Categories
  // ==========================================
  async getCategories(_isActive = true): Promise<Category[]> {
    await delay(80);
    return getStoredCategories();
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await delay(80);
    const categories = getStoredCategories();
    return categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
  },

  async getCategoryById(id: string | number): Promise<Category> {
    await delay(80);
    const categories = getStoredCategories();
    const found = categories.find((c) => c.id === String(id));
    if (!found) throw new Error('Không tìm thấy danh mục!');
    return found;
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    await delay(150);
    const categories = getStoredCategories();
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: data.name || 'Danh mục mới',
      slug: data.slug || `danh-muc-${Date.now()}`,
      description: data.description || '',
      image:
        data.image ||
        'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
      productCount: 0,
    };
    categories.push(newCat);
    storage.setItem(MOCK_STORAGE_KEYS.CATEGORIES, categories);
    return newCat;
  },

  async updateCategory(id: string | number, data: Partial<Category>): Promise<Category> {
    await delay(150);
    const categories = getStoredCategories();
    const index = categories.findIndex((c) => c.id === String(id));
    if (index === -1) throw new Error('Không tìm thấy danh mục!');

    const updated = { ...categories[index], ...data };
    categories[index] = updated;
    storage.setItem(MOCK_STORAGE_KEYS.CATEGORIES, categories);
    return updated;
  },

  async deleteCategory(id: string | number): Promise<void> {
    await delay(100);
    const categories = getStoredCategories();
    const filtered = categories.filter((c) => c.id !== String(id));
    storage.setItem(MOCK_STORAGE_KEYS.CATEGORIES, filtered);
  },

  // ==========================================
  // Coupons
  // ==========================================
  async getCoupons(): Promise<Coupon[]> {
    await delay(60);
    return INITIAL_COUPONS;
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ coupon: Coupon; discountAmount: number }> {
    await delay(100);
    const normalized = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code.toUpperCase() === normalized && c.isActive);

    if (!found) {
      throw new Error(`Mã giảm giá "${code}" không hợp lệ hoặc đã hết hạn!`);
    }

    if (subtotal < found.minSpend) {
      throw new Error(
        `Đơn hàng chưa đạt mức tối thiểu ${found.minSpend.toLocaleString('vi-VN')}đ để dùng mã này!`
      );
    }

    const discountAmount =
      found.type === 'PERCENT' ? Math.round((subtotal * found.value) / 100) : found.value;

    return {
      coupon: found,
      discountAmount,
    };
  },

  // ==========================================
  // Orders (Read-only for Demo Inspection)
  // ==========================================
  async getOrders(): Promise<Order[]> {
    await delay(100);
    return getStoredOrders();
  },

  // ==========================================
  // Users (For Admin Preview in Demo Mode)
  // ==========================================
  async getUsers(): Promise<User[]> {
    await delay(80);
    return INITIAL_USERS;
  },
};
