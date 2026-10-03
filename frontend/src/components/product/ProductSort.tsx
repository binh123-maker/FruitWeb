import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface ProductSortProps {
  sortBy?: string;
  onChange: (sortValue: any) => void;
  totalProducts?: number;
}

export const ProductSort: React.FC<ProductSortProps> = ({
  sortBy = 'newest',
  onChange,
  totalProducts,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
      <div className="text-sm font-medium text-slate-600">
        Hiển thị <span className="font-bold text-slate-900">{totalProducts ?? 0}</span> sản phẩm
      </div>

      <div className="flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">Sắp xếp:</span>
        <select
          value={sortBy}
          onChange={(e) => onChange(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-medium rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 cursor-pointer"
        >
          <option value="newest">Mới nhất</option>
          <option value="bestseller">Bán chạy nhất</option>
          <option value="price_asc">Giá: Thấp → Cao</option>
          <option value="price_desc">Giá: Cao → Thấp</option>
          <option value="rating">Đánh giá cao nhất</option>
        </select>
      </div>
    </div>
  );
};
