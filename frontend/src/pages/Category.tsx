import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Category as CategoryType } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ArrowLeft, Sparkles, Folder } from 'lucide-react';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!slug) return;
      setIsLoading(true);
      try {
        const cat = await productService.getCategoryBySlug(slug);
        setCategory(cat);
        const { products } = await productService.getProducts({ category: slug });
        setProducts(products);
      } catch (err) {
        console.error('Error fetching category:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategoryData();
  }, [slug]);

  if (isLoading) {
    return <LoadingSpinner label="Đang tải danh mục trái cây..." size="lg" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Category Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white p-7 sm:p-12 border border-emerald-800/40 shadow-xl">
        {category?.image && (
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback =
                'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80';
              if (!target.src.includes('1610832958506')) {
                target.src = fallback;
              }
            }}
          />
        )}
        <div className="relative z-10 max-w-xl flex flex-col gap-2">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors w-fit mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tất cả sản phẩm</span>
          </Link>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Danh Mục Chọn Lọc
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {category?.name || 'Danh Mục Trái Cây'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-1">
            {category?.description || 'Những loại trái cây tươi ngon tuyển chọn chất lượng nhất thuộc danh mục này.'}
          </p>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={<Folder className="w-14 h-14 text-slate-300" />}
          title="Danh Mục Hiện Chưa Có Sản Phẩm"
          description="Sản phẩm thuộc danh mục này đang được cập nhật thêm. Vui lòng tham khảo các danh mục sản phẩm khác."
          actionText="Xem tất cả sản phẩm"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold text-slate-500">
            Có <strong>{products.length}</strong> sản phẩm trong danh mục này:
          </span>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
};
