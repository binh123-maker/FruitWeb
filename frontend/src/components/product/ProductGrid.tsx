import React from 'react';
import { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { SkeletonCard } from '../common/LoadingSpinner';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  emptyText?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  emptyText = 'Hiện chưa có sản phẩm nào trong danh mục này.',
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="py-10 text-center text-xs sm:text-sm text-slate-500 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
