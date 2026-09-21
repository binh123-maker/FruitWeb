import React from 'react';
import { Category, FilterOptions } from '../../types';
import { Button } from '../common/Button';
import { Filter, RotateCcw } from 'lucide-react';

interface ProductFilterProps {
  categories: Category[];
  filters: FilterOptions;
  onChange: (newFilters: FilterOptions) => void;
  onReset: () => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  categories,
  filters,
  onChange,
  onReset,
}) => {
  const priceRanges = [
    { label: 'Tất cả giá', min: undefined, max: undefined },
    { label: 'Dưới 50.000đ', min: 0, max: 50000 },
    { label: '50.000đ - 100.000đ', min: 50000, max: 100000 },
    { label: '100.000đ - 250.000đ', min: 100000, max: 250000 },
    { label: 'Trên 250.000đ', min: 250000, max: undefined },
  ];

  const handleCategoryClick = (slug?: string) => {
    onChange({ ...filters, category: slug, page: 1 });
  };

  const handlePriceClick = (min?: number, max?: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max, page: 1 });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-slate-800 text-base">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Bộ lọc sản phẩm</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Đặt lại
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2.5">
        <h4 className="text-sm font-bold text-slate-800">Danh mục</h4>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => handleCategoryClick(undefined)}
            className={`text-left px-3 py-2 rounded-xl text-sm font-medium transition-all ${
              !filters.category
                ? 'bg-emerald-50 text-emerald-700 font-bold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.slug)}
              className={`text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between ${
                filters.category === cat.slug
                  ? 'bg-emerald-50 text-emerald-700 font-bold'
                  : 'text-slate-600 hover:bg-slate-50 font-medium'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {cat.productCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Price Ranges */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-800">Khoảng giá</h4>
        <div className="flex flex-col gap-1">
          {priceRanges.map((range, index) => {
            const isSelected =
              filters.minPrice === range.min && filters.maxPrice === range.max;
            return (
              <button
                key={index}
                onClick={() => handlePriceClick(range.min, range.max)}
                className={`text-left px-3 py-2 rounded-xl text-sm transition-all ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50 font-medium'
                }`}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Filters */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
        <h4 className="text-sm font-bold text-slate-800">Đặc tính sản phẩm</h4>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
          <input
            type="checkbox"
            checked={!!filters.isOrganic}
            onChange={(e) => onChange({ ...filters, isOrganic: e.target.checked || undefined, page: 1 })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <span>Trái cây Hữu cơ (Organic)</span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked || undefined, page: 1 })}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
          />
          <span>Còn hàng</span>
        </label>
      </div>
    </div>
  );
};
