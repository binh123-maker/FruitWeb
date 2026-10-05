import { Product, Category, FilterOptions } from '../types';
import { productApi, ProductQueryParams, ProductCreatePayload, ProductUpdatePayload } from '../api/productApi';
import { categoryApi } from '../api/categoryApi';

// Cache for category slug -> id mapping to avoid repeated calls
let categoryCache: Category[] = [];

async function getCategoryList(): Promise<Category[]> {
  if (categoryCache.length === 0) {
    categoryCache = await categoryApi.getCategories();
  }
  return categoryCache;
}

async function resolveCategoryId(categorySlugOrId?: string): Promise<number | undefined> {
  if (!categorySlugOrId) return undefined;
  if (/^\d+$/.test(categorySlugOrId)) {
    return parseInt(categorySlugOrId, 10);
  }
  const cats = await getCategoryList();
  const found = cats.find((c) => c.slug.toLowerCase() === categorySlugOrId.toLowerCase());
  return found ? parseInt(found.id, 10) : undefined;
}

export const productService = {
  /**
   * Fetch products with search, category filter, price bounds, sorting, pagination
   */
  async getProducts(options: FilterOptions = {}): Promise<{ products: Product[]; total: number; totalPages?: number; page?: number }> {
    const params: ProductQueryParams = {};

    if (options.search) params.search = options.search.trim();
    if (options.category) params.category = options.category;
    if (options.minPrice !== undefined) params.min_price = options.minPrice;
    if (options.maxPrice !== undefined) params.max_price = options.maxPrice;
    if (options.isFeatured !== undefined) params.is_featured = options.isFeatured;
    if (options.isBestSeller !== undefined) params.is_best_seller = options.isBestSeller;

    // Sorting
    if (options.sortBy) {
      params.sort = options.sortBy;
    }

    if (options.page !== undefined) params.page = options.page;
    if (options.limit !== undefined) params.limit = options.limit;

    try {
      const res = await productApi.getProducts(params);
      return {
        products: res.products,
        total: res.total,
        totalPages: res.totalPages,
        page: res.page,
      };
    } catch (err) {
      console.error('Failed to fetch products from backend API:', err);
      throw err;
    }
  },

  /**
   * Fetch a single product by numeric ID or slug
   */
  async getProductById(idOrSlug: string): Promise<Product | null> {
    try {
      if (/^\d+$/.test(idOrSlug)) {
        return await productApi.getProductById(idOrSlug);
      }
      // If a slug was passed, query products to match slug
      const res = await productApi.getProducts({ limit: 100 });
      return res.products.find((p) => p.slug.toLowerCase() === idOrSlug.toLowerCase()) || null;
    } catch (err: any) {
      if (err.status === 404 || err.status === 422) {
        return null;
      }
      console.error('Failed to fetch product by id:', err);
      throw err;
    }
  },

  /**
   * Fetch all active categories
   */
  async getCategories(): Promise<Category[]> {
    try {
      const cats = await categoryApi.getCategories(true);
      categoryCache = cats;
      return cats;
    } catch (err) {
      console.error('Failed to fetch categories from backend API:', err);
      throw err;
    }
  },

  /**
   * Fetch a single category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categories = await this.getCategories();
      return categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || null;
    } catch (err) {
      console.error('Failed to fetch category by slug:', err);
      throw err;
    }
  },

  /**
   * Fetch featured products for home showcase
   */
  async getFeaturedProducts(limit = 8): Promise<Product[]> {
    const res = await this.getProducts({ isFeatured: true, limit });
    return res.products;
  },

  /**
   * Fetch best-selling products for home showcase
   */
  async getBestSellers(limit = 8): Promise<Product[]> {
    const res = await this.getProducts({ isBestSeller: true, limit });
    return res.products;
  },

  /**
   * Fetch related products in the same category
   */
  async getRelatedProducts(productId: string, category: string, limit = 4): Promise<Product[]> {
    if (!category) return [];
    const res = await this.getProducts({ category, limit: limit + 2 });
    return res.products.filter((p) => p.id !== productId).slice(0, limit);
  },

  /**
   * Admin: Create a new product in the database
   */
  async createProduct(data: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    const categoryId = await resolveCategoryId(data.category);

    const payload: ProductCreatePayload = {
      name: data.name,
      slug: data.slug || undefined,
      description: data.description || undefined,
      price: data.price,
      sale_price: data.salePrice !== undefined && data.salePrice > 0 ? data.salePrice : undefined,
      image: data.image || undefined,
      category_id: categoryId,
      origin: data.origin || undefined,
      unit: data.unit || 'kg',
      stock: data.stock ?? 0,
      rating: data.rating ?? 5.0,
      review_count: data.reviewCount ?? 0,
      sold_count: data.soldCount ?? 0,
      is_featured: !!data.isFeatured,
      is_best_seller: !!data.isBestSeller,
      is_active: true,
    };

    return productApi.createProduct(payload);
  },

  /**
   * Admin: Update product details in the database
   */
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    let categoryId: number | undefined;
    if (data.category) {
      categoryId = await resolveCategoryId(data.category);
    }

    const payload: ProductUpdatePayload = {
      name: data.name,
      slug: data.slug || undefined,
      description: data.description,
      price: data.price,
      sale_price: data.salePrice !== undefined ? (data.salePrice > 0 ? data.salePrice : undefined) : undefined,
      image: data.image,
      category_id: categoryId,
      origin: data.origin,
      unit: data.unit,
      stock: data.stock,
      rating: data.rating,
      review_count: data.reviewCount,
      sold_count: data.soldCount,
      is_featured: data.isFeatured,
      is_best_seller: data.isBestSeller,
    };

    return productApi.updateProduct(id, payload);
  },

  /**
   * Admin: Delete product from database
   */
  async deleteProduct(id: string): Promise<void> {
    await productApi.deleteProduct(id);
  },
};
