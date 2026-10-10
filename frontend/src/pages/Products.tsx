import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Category, FilterOptions } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilter } from '../components/product/ProductFilter';
import { ProductSort } from '../components/product/ProductSort';
import { EmptyState } from '../components/common/EmptyState';
import { SlidersHorizontal, X, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
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
        console.error('Error fetching categories:', err);
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

  const totalPages = Math.ceil(total / (filters.limit || 12));
  const currentPage = filters.page || 1;

  const hasActiveFilters = Boolean(
    filters.category ||
    filters.search ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.isOrganic ||
    filters.inStockOnly
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Page Title & Breadcrumb Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-7 sm:p-10 rounded-3xl shadow-xl border border-emerald-800/40">
        <div className="absolute top-0 right-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Siêu Thị Trái Cây Tươi
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Tất Cả Sản Phẩm Trái Cây
            </h1>
            <p className="text-emerald-100/80 text-xs sm:text-sm max-w-xl font-normal mt-0.5">
              100% trái cây sạch tuyển chọn, ngọt mát tự nhiên, chuẩn vệ sinh an toàn thực phẩm.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white px-4 py-2.5 rounded-xl font-bold text-xs backdrop-blur-xs cursor-pointer border border-white/20 self-start md:self-auto shadow-xs"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Bộ Lọc ({hasActiveFilters ? 'Đang lọc' : 'Tất cả'})</span>
          </button>
        </div>
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
            onChange={(sort) => setFilters((prev) => ({ ...prev, sortBy: sort, page: 1 }))}
            totalProducts={total}
          />

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100 text-xs font-semibold text-emerald-800">
              <span className="font-bold text-slate-700">Đang lọc theo:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  Từ khóa: "{filters.search}"
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  Danh mục: {categories.find((c) => c.slug === filters.category)?.name || filters.category}
                </span>
              )}
              {filters.isOrganic && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  Chỉ Organic
                </span>
              )}
              {filters.inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                  Còn hàng
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="ml-auto text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Xóa bộ lọc
              </button>
            </div>
          )}

          {products.length === 0 && !isLoading ? (
            <EmptyState
              title="Không tìm thấy sản phẩm phù hợp"
              description="Rất tiếc, không có loại trái cây nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn."
              actionText="Xóa bộ lọc và xem lại"
              onAction={handleResetFilters}
            />
          ) : (
            <div className="flex flex-col gap-8">
              <ProductGrid products={products} isLoading={isLoading} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2.5 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, currentPage - 1) }))}
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    Trước
                  </Button>
                  <span className="text-xs font-black text-slate-700 px-3.5 py-2 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, currentPage + 1) }))}
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer Filter */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end lg:hidden">
          <div className="w-full max-w-xs bg-white h-full p-6 overflow-y-auto flex flex-col gap-4 animate-slide-in shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-base">Bộ Lọc Sản Phẩm</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ProductFilter
              categories={categories}
              filters={filters}
              onChange={(f) => {
                handleFilterChange(f);
                setIsMobileFilterOpen(false);
              }}
              onReset={() => {
                handleResetFilters();
                setIsMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
