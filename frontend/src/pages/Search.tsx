import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Search as SearchIcon, ArrowLeft } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Search Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors w-fit mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Tất cả sản phẩm</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kết quả tìm kiếm: <span className="text-emerald-700 font-black">"{query}"</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Tìm thấy <strong className="text-slate-900">{products.length}</strong> loại trái cây phù hợp.
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner label="Đang tìm kiếm trái cây..." size="lg" />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<SearchIcon className="w-14 h-14 text-slate-300" />}
          title="Không Tìm Thấy Kết Quả Nào"
          description={`Không tìm thấy loại trái cây nào khớp với từ khóa "${query}". Hãy thử tìm các từ khóa phổ biến như "Táo", "Cam", "Dâu", "Nho", "Sầu riêng"...`}
          actionText="Xem tất cả sản phẩm"
          onAction={() => (window.location.href = '/products')}
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
};
