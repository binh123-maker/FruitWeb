import React, { useState, useEffect, useCallback } from 'react';
import { categoryApi } from '../../api/categoryApi';
import type { Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Plus, Edit2, Trash2, FolderPlus } from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
  });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoryApi.getCategories(true);
      setCategories(data);
    } catch (err: any) {
      const msg = err.message || 'Không thể tải danh sách danh mục từ máy chủ.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Vui lòng nhập tên danh mục!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, {
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          image: formData.image.trim() || undefined,
        });
        showToast('Cập nhật danh mục thành công!', 'success');
      } else {
        await categoryApi.createCategory({
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          image: formData.image.trim() || undefined,
          is_active: true,
        });
        showToast('Tạo danh mục mới thành công!', 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Lưu danh mục thất bại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;
    try {
      await categoryApi.deleteCategory(id);
      showToast('Xóa danh mục thành công!', 'success');
      fetchCategories();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa danh mục.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Quản Lý Danh Mục Trái Cây</h2>
          <p className="text-xs text-slate-500 mt-0.5">Thêm, sửa và điều chỉnh các phân loại hoa quả</p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Thêm Danh Mục Mới
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner label="Đang tải danh mục từ cơ sở dữ liệu..." size="lg" />
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-6 rounded-2xl text-center">
          <p className="font-semibold text-sm">{error}</p>
          <button
            type="button"
            onClick={fetchCategories}
            className="mt-3 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 transition cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center gap-3">
          <FolderPlus className="w-12 h-12 text-slate-300" />
          <h3 className="font-bold text-slate-800">Chưa có danh mục nào</h3>
          <p className="text-xs text-slate-400">Bấm nút "Thêm Danh Mục Mới" để tạo phân loại đầu tiên.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase font-black text-[11px]">
                <th className="py-3 px-4">Hình Ảnh</th>
                <th className="py-3 px-4">Tên Danh Mục</th>
                <th className="py-3 px-4">Slug (Đường Dẫn)</th>
                <th className="py-3 px-4">Mô Tả</th>
                <th className="py-3 px-4 text-center">Số Sản Phẩm</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-10 h-10 rounded-xl object-cover bg-slate-50 border border-slate-100 shrink-0"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.src =
                          'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">{cat.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{cat.slug}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{cat.description || '—'}</td>
                  <td className="py-3 px-4 text-center font-black text-emerald-700">{cat.productCount ?? 0}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(cat)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(cat.id, cat.name)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                        title="Xóa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
      >
        <form onSubmit={handleSaveCategory} className="flex flex-col gap-4">
          <Input
            label="Tên danh mục"
            required
            placeholder="Ví dụ: Trái cây nhập khẩu"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Slug (Tùy chọn, tự tạo nếu để trống)"
            placeholder="trai-cay-nhap-khau"
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          />

          <Input
            label="URL Hình ảnh"
            placeholder="https://..."
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />

          <div className="flex flex-col gap-1.5 text-xs font-bold text-slate-700">
            <label>Mô tả ngắn</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              placeholder="Mô tả về đặc tính nhóm trái cây này..."
            />
          </div>

          <Button type="submit" variant="primary" isLoading={isSubmitting} className="w-full mt-2">
            Lưu Danh Mục
          </Button>
        </form>
      </Modal>
    </div>
  );
};
