import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category, FilterOptions } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/product/ProductFilter';
import { ProductSort } from '../components/product/ProductSort';
import { EmptyState } from '../components/common/EmptyState';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [filters, setFilters] = useState<FilterOptions>({
    category: searchParams.get('category') || undefined,
    search: searchParams.get('search') || searchParams.get('q') || undefined,
    sortBy: (searchParams.get('sort') as any) || 'newest',
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productService.getProducts(filters);
        setProducts(res.products);
        setTotal(res.total);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [filters]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      category: undefined,
      search: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      isOrganic: undefined,
      inStockOnly: undefined,
      sortBy: 'newest',
      page: 1,
      limit: 12,
    });
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
      {/* Page Title & Breadcrumb Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-emerald-900 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">FreshFruit Store</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Tất Cả Trái Cây Tươi</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Tuyển chọn 100% trái cây sạch, mọng nước nhập khẩu & đặc sản Việt Nam.
          </p>
        </div>

        <button
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl font-bold text-sm backdrop-blur-xs cursor-pointer self-start md:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Bộ Lọc</span>
        </button>
      </div>

      {/* Main Grid + Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filter */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-24">
            <ProductFilter
              categories={categories}
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </div>
        </aside>

        {/* Product List Content */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <ProductSort
            sortBy={filters.sortBy}
            onChange={(sort) => setFilters((prev) => ({ ...prev, sortBy: sort }))}
            totalProducts={total}
          />

          {products.length === 0 && !isLoading ? (
            <EmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description="Rất tiếc, không có sản phẩm nào phù hợp với các tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn."
              actionText="Xóa bộ lọc"
              onAction={handleResetFilters}
            />
          ) : (
            <ProductGrid products={products} isLoading={isLoading} />
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto flex flex-col gap-4 animate-slide-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Bộ Lọc Sản Phẩm</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <ProductFilter
              categories={categories}
              filters={filters}
              onChange={(f) => {
                handleFilterChange(f);
                setIsMobileFilterOpen(false);
              }}
              onReset={handleResetFilters}
            />
          </div>
        </div>
      )}
    </div>
  );
};
