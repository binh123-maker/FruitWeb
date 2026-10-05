import { apiClient } from './client';
import type { Category } from '../types';

export interface BackendCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  product_count?: number;
}

export interface CategoryCreatePayload {
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  is_active?: boolean;
}

export interface CategoryUpdatePayload {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  is_active?: boolean;
}

export function mapBackendCategoryToFrontend(cat: BackendCategory): Category {
  return {
    id: String(cat.id),
    name: cat.name,
    slug: cat.slug,
    description: cat.description || '',
    image: cat.image || 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
    productCount: cat.product_count ?? 0,
  };
}

export const categoryApi = {
  /**
   * Get all categories (Public)
   */
  async getCategories(isActive: boolean = true): Promise<Category[]> {
    const res = await apiClient.get<BackendCategory[]>('/api/categories', {
      params: { is_active: isActive },
    });
    return (res || []).map(mapBackendCategoryToFrontend);
  },

  /**
   * Get single category by ID (Public)
   */
  async getCategoryById(id: number | string): Promise<Category> {
    const res = await apiClient.get<BackendCategory>(`/api/categories/${id}`);
    return mapBackendCategoryToFrontend(res);
  },

  /**
   * Create category (Admin Only)
   */
  async createCategory(payload: CategoryCreatePayload): Promise<Category> {
    const res = await apiClient.post<BackendCategory>('/api/categories', payload);
    return mapBackendCategoryToFrontend(res);
  },

  /**
   * Update category (Admin Only)
   */
  async updateCategory(id: number | string, payload: CategoryUpdatePayload): Promise<Category> {
    const res = await apiClient.put<BackendCategory>(`/api/categories/${id}`, payload);
    return mapBackendCategoryToFrontend(res);
  },

  /**
   * Delete category (Admin Only)
   */
  async deleteCategory(id: number | string): Promise<{ success: boolean; message: string }> {
    return apiClient.delete<{ success: boolean; message: string }>(`/api/categories/${id}`);
  },
};
