import { apiClient } from './client';
import type { Product } from '../types';

export interface BackendProduct {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  image: string | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  origin: string | null;
  unit: string;
  stock: number;
  rating: number;
  review_count: number;
  sold_count: number;
  is_featured: boolean;
  is_best_seller: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedBackendProducts {
  items: BackendProduct[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  sort?: string;
  page?: number;
  limit?: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_active?: boolean;
}

export interface ProductCreatePayload {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  sale_price?: number;
  image?: string;
  category_id?: number;
  origin?: string;
  unit?: string;
  stock?: number;
  rating?: number;
  review_count?: number;
  sold_count?: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_active?: boolean;
}

export interface ProductUpdatePayload {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  sale_price?: number;
  image?: string;
  category_id?: number;
  origin?: string;
  unit?: string;
  stock?: number;
  rating?: number;
  review_count?: number;
  sold_count?: number;
  is_featured?: boolean;
  is_best_seller?: boolean;
  is_active?: boolean;
}

export function mapBackendProductToFrontend(p: BackendProduct): Product {
  return {
    id: String(p.id),
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: p.price,
    salePrice: p.sale_price !== null && p.sale_price !== undefined ? p.sale_price : undefined,
    image: p.image || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    images: p.image ? [p.image] : [],
    category: p.category_slug || (p.category_id ? String(p.category_id) : ''),
    categoryName: p.category_name || '',
    origin: p.origin || 'Việt Nam',
    unit: p.unit || 'kg',
    stock: p.stock ?? 0,
    rating: p.rating ?? 5.0,
    reviewCount: p.review_count ?? 0,
    soldCount: p.sold_count ?? 0,
    isFeatured: p.is_featured,
    isBestSeller: p.is_best_seller,
    isOrganic: true,
    createdAt: p.created_at,
  };
}

export const productApi = {
  /**
   * Get paginated products with search, filter, sort (Public)
   */
  async getProducts(params: ProductQueryParams = {}): Promise<{
    products: Product[];
    total: number;
    totalPages: number;
    page: number;
    limit: number;
  }> {
    const res = await apiClient.get<PaginatedBackendProducts>('/api/products', {
      params,
    });

    return {
      products: (res.items || []).map(mapBackendProductToFrontend),
      total: res.total,
      totalPages: res.total_pages,
      page: res.page,
      limit: res.limit,
    };
  },

  /**
   * Get single product detail by ID (Public)
   */
  async getProductById(id: number | string): Promise<Product> {
    const res = await apiClient.get<BackendProduct>(`/api/products/${id}`);
    return mapBackendProductToFrontend(res);
  },

  /**
   * Create product (Admin Only)
   */
  async createProduct(payload: ProductCreatePayload): Promise<Product> {
    const res = await apiClient.post<BackendProduct>('/api/products', payload);
    return mapBackendProductToFrontend(res);
  },

  /**
   * Update product (Admin Only)
   */
  async updateProduct(id: number | string, payload: ProductUpdatePayload): Promise<Product> {
    const res = await apiClient.put<BackendProduct>(`/api/products/${id}`, payload);
    return mapBackendProductToFrontend(res);
  },

  /**
   * Delete product (Admin Only)
   */
  async deleteProduct(id: number | string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/products/${id}`);
  },
};
