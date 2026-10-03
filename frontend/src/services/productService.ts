import { Product, Category, FilterOptions } from '../types';
import { storage, STORAGE_KEYS } from '../utils/storage';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES } from '../mock/data';

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

const DATA_VERSION = 'freshfruit_v2_images_fixed';

const getStoredProducts = (): Product[] => {
  const existing = storage.getItem<Product[]>('freshfruit_products', []);
  const syncedVersion = storage.getItem<string>('freshfruit_data_version', '');

  if (existing.length === 0) {
    storage.setItem('freshfruit_products', INITIAL_PRODUCTS);
    storage.setItem('freshfruit_data_version', DATA_VERSION);
    return INITIAL_PRODUCTS;
  }

  if (syncedVersion !== DATA_VERSION) {
    const initialMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
    const updated = existing.map((prod) => {
      const match = initialMap.get(prod.id);
      if (match) {
        return {
          ...prod,
          image: match.image,
        };
      }
      return prod;
    });

    storage.setItem('freshfruit_products', updated);
    storage.setItem('freshfruit_data_version', DATA_VERSION);
    return updated;
  }

  return existing;
};

const getStoredCategories = (): Category[] => {
  const existing = storage.getItem<Category[]>('freshfruit_categories', []);
  const syncedVersion = storage.getItem<string>('freshfruit_cat_version', '');

  if (existing.length === 0) {
    storage.setItem('freshfruit_categories', INITIAL_CATEGORIES);
    storage.setItem('freshfruit_cat_version', DATA_VERSION);
    return INITIAL_CATEGORIES;
  }

  if (syncedVersion !== DATA_VERSION) {
    const initialMap = new Map(INITIAL_CATEGORIES.map((c) => [c.id, c]));
    const updated = existing.map((cat) => {
      const match = initialMap.get(cat.id);
      if (match) {
        return {
          ...cat,
          image: match.image,
        };
      }
      return cat;
    });

    storage.setItem('freshfruit_categories', updated);
    storage.setItem('freshfruit_cat_version', DATA_VERSION);
    return updated;
  }

  return existing;
};

export const productService = {
  async getProducts(options: FilterOptions = {}): Promise<{ products: Product[]; total: number }> {
    await delay(300);
    let result = [...getStoredProducts()];

    if (options.category) {
      result = result.filter((p) => p.category === options.category);
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

    if (options.page && options.limit) {
      const start = (options.page - 1) * options.limit;
      result = result.slice(start, start + options.limit);
    }

    return { products: result, total };
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(200);
    const products = getStoredProducts();
    return products.find((p) => p.id === id || p.slug === id) || null;
  },

  async getCategories(): Promise<Category[]> {
    await delay(200);
    return getStoredCategories();
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await delay(200);
    const categories = getStoredCategories();
    return categories.find((c) => c.slug === slug) || null;
  },

  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    await delay(250);
    const products = getStoredProducts();
    return products.filter((p) => p.isFeatured).slice(0, limit);
  },

  async getBestSellers(limit = 8): Promise<Product[]> {
    await delay(250);
    const products = getStoredProducts();
    return products.filter((p) => p.isBestSeller).slice(0, limit);
  },

  async getRelatedProducts(productId: string, category: string, limit = 4): Promise<Product[]> {
    await delay(200);
    const products = getStoredProducts();
    return products
      .filter((p) => p.category === category && p.id !== productId)
      .slice(0, limit);
  },

  // Admin Operations
  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    await delay(400);
    const products = getStoredProducts();
    const newProduct: Product = {
      ...data,
      id: `p-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    products.unshift(newProduct);
    storage.setItem('freshfruit_products', products);
    return newProduct;
  },

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    await delay(400);
    const products = getStoredProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Không tìm thấy sản phẩm!');

    const updated = { ...products[index], ...data };
    products[index] = updated;
    storage.setItem('freshfruit_products', products);
    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    storage.setItem('freshfruit_products', filtered);
  }
};
