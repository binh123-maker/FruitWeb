import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Badge } from '../common/Badge';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {hasDiscount && (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500 text-white shadow-xs">
            -{discountPercent}%
          </span>
        )}
        {product.isOrganic && (
          <Badge variant="emerald" size="sm">
            Organic
          </Badge>
        )}
        {product.isBestSeller && (
          <Badge variant="amber" size="sm">
            Bán chạy
          </Badge>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
          isWishlisted
            ? 'bg-rose-50 text-rose-500 shadow-sm scale-110'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
        }`}
        title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-slate-50 pt-[100%]">
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {product.stock <= 0 && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide">
              HẾT HÀNG
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Origin */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <span className="truncate">{product.categoryName || product.category}</span>
          <span className="shrink-0 bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600">
            {product.origin}
          </span>
        </div>

        {/* Title */}
        <Link
          to={`/products/${product.slug}`}
          className="font-bold text-slate-800 hover:text-emerald-600 text-base line-clamp-2 mb-2 transition-colors min-h-[2.75rem]"
        >
          {product.name}
        </Link>

        {/* Rating & Sold count */}
        <div className="flex items-center gap-2 mb-3 text-xs">
          <div className="flex items-center text-amber-400 font-semibold gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="text-slate-700">{product.rating}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Đã bán {product.soldCount}</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-emerald-600">
                {currentPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-xs text-slate-400">/{product.unit}</span>
            </div>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={product.stock <= 0}
            className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer shrink-0"
            title="Thêm vào giỏ"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
