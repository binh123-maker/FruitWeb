import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const performSearch = async () => {
      setIsLoading(true);
      try {
        const { products } = await productService.getProducts({ search: query });
        setProducts(products);
      } catch (err) {
        console.error('Error searching products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Kết quả tìm kiếm cho: <span className="text-emerald-600 font-black">"{query}"</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Tìm thấy <strong className="text-slate-800">{products.length}</strong> sản phẩm phù hợp.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Đang tìm kiếm sản phẩm..." />
      ) : products.length === 0 ? (
        <EmptyState
          title="Không tìm thấy kết quả nào"
          description={`Không tìm thấy trái cây nào khớp với từ khóa "${query}". Thử tìm với từ khóa khác như "Táo", "Cam", "Dâu", "Sầu Riêng"...`}
          actionText="Xem tất cả sản phẩm"
          onAction={() => window.location.href = '/products'}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};
