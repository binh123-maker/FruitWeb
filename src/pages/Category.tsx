import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Product, Category as CategoryType } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

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
    return <LoadingSpinner label="Đang tải sản phẩm theo danh mục..." />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Category Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 text-white p-8 sm:p-12 border border-slate-800 shadow-xl">
        {category?.image && (
          <img
            src={category.image}
            alt={category.name}
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            onError={(e) => {
              const target = e.currentTarget;
              const fallback = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80';
              if (!target.src.includes('1610832958506')) {
                target.src = fallback;
              }
            }}
          />
        )}
        <div className="relative z-10 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Danh Mục Trái Cây</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            {category?.name || 'Danh Mục Trái Cây'}
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            {category?.description || 'Những loại trái cây tươi ngon chất lượng nhất thuộc danh mục này.'}
          </p>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <EmptyState
          title="Danh mục hiện chưa có sản phẩm"
          description="Vui lòng quay lại sau hoặc tham khảo các danh mục sản phẩm khác tại FreshFruit."
          actionText="Xem tất cả sản phẩm"
          onAction={() => window.location.href = '/products'}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};
