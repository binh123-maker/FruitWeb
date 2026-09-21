import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import type { Product, Category } from '../../types';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { useToast } from '../../context/ToastContext';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    category: 'trai-cay-nhap-khau',
    price: 0,
    salePrice: 0,
    unit: 'Kg',
    stock: 50,
    origin: 'Việt Nam',
    image: '',
    description: '',
    isOrganic: true,
    isBestSeller: false,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        productService.getProducts({ search, limit: 100 }),
        productService.getCategories(),
      ]);
      setProducts(pRes.products);
      setCategories(cRes);
    } catch (err) {
      console.error('Error fetching admin products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        category: product.category,
        price: product.price,
        salePrice: product.salePrice || 0,
        unit: product.unit,
        stock: product.stock,
        origin: product.origin,
        image: product.image,
        description: product.description,
        isOrganic: !!product.isOrganic,
        isBestSeller: !!product.isBestSeller,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        category: categories[0]?.slug || 'trai-cay-nhap-khau',
        price: 100000,
        salePrice: 0,
        unit: 'Kg',
        stock: 50,
        origin: 'Việt Nam',
        image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
        description: 'Trái cây tươi ngon đạt chuẩn VietGAP...',
        isOrganic: true,
        isBestSeller: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.price <= 0) {
      showToast('Vui lòng điền tên và giá sản phẩm hợp lệ!', 'error');
      return;
    }

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, {
          ...formData,
          salePrice: formData.salePrice > 0 ? formData.salePrice : undefined,
        });
        showToast('Cập nhật sản phẩm thành công!', 'success');
      } else {
        await productService.createProduct({
          ...formData,
          slug: formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
          salePrice: formData.salePrice > 0 ? formData.salePrice : undefined,
          rating: 5,
          reviewCount: 0,
          soldCount: 0,
        });
        showToast('Thêm sản phẩm mới thành công!', 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Lỗi lưu sản phẩm', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      await productService.deleteProduct(id);
      showToast('Xóa sản phẩm thành công!', 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa sản phẩm', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-900">Quản Lý Sản Phẩm Kho</h2>
        <Button
          onClick={() => handleOpenModal()}
          variant="primary"
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Thêm Sản Phẩm Mới
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm sản phẩm theo tên..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSpinner label="Đang tải danh sách sản phẩm..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold">
                <th className="py-3 px-4">Sản Phẩm</th>
                <th className="py-3 px-4">Danh Mục</th>
                <th className="py-3 px-4">Giá / Đơn vị</th>
                <th className="py-3 px-4">Tồn Kho</th>
                <th className="py-3 px-4">Đã Bán</th>
                <th className="py-3 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-50" />
                    <span className="font-bold text-slate-900">{p.name}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{p.categoryName || p.category}</td>
                  <td className="py-3 px-4 font-bold text-emerald-600">
                    {p.salePrice ? p.salePrice.toLocaleString('vi-VN') : p.price.toLocaleString('vi-VN')}đ /{p.unit}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{p.stock}</td>
                  <td className="py-3 px-4 text-slate-500">{p.soldCount}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
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

      {/* Product Edit / Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
      >
        <form onSubmit={handleSaveProduct} className="flex flex-col gap-4">
          <Input
            label="Tên sản phẩm"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-700">
              <label>Danh mục</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Đơn vị tính (Kg, Hộp, Quả...)"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Giá gốc (VNĐ)"
              type="number"
              value={formData.price.toString()}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
            <Input
              label="Giá KM (Tùy chọn)"
              type="number"
              value={formData.salePrice.toString()}
              onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
            />
            <Input
              label="Số lượng kho"
              type="number"
              value={formData.stock.toString()}
              onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
            />
          </div>

          <Input
            label="Xuất xứ"
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
          />

          <Input
            label="URL Hình ảnh"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          />

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOrganic}
                onChange={(e) => setFormData({ ...formData, isOrganic: e.target.checked })}
              />
              <span>Trái cây Hữu cơ (Organic)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
              />
              <span>Đặt làm Bán Chạy</span>
            </label>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Lưu Sản Phẩm
          </Button>
        </form>
      </Modal>
    </div>
  );
};
