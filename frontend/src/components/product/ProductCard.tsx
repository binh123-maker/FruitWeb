import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingBag, Check, MapPin } from 'lucide-react';
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

  const [isAdding, setIsAdding] = useState(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart(product, 1);
      setIsAddedSuccess(true);
      setTimeout(() => {
        setIsAddedSuccess(false);
      }, 1400);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-slate-100 shadow-xs hover:border-emerald-200/60 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Badges Overlay */}
      <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start pointer-events-none">
        {hasDiscount && (
          <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-rose-500 text-white shadow-xs tracking-wide">
            -{discountPercent}%
          </span>
        )}
        {product.isOrganic && (
          <Badge variant="emerald" size="sm" dot>
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
        type="button"
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 z-20 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
          isWishlisted
            ? 'bg-rose-50 text-rose-500 scale-105 border border-rose-200/80'
            : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:bg-white hover:scale-105 border border-white/60'
        }`}
        title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
        aria-label={isWishlisted ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
      >
        <Heart className={`w-4 h-4 transition-transform duration-200 ${isWishlisted ? 'fill-rose-500 scale-110' : ''}`} />
      </button>

      {/* Product Image Frame */}
      <Link
        to={`/products/${product.id}`}
        className="relative block overflow-hidden bg-slate-50/60 aspect-square w-full"
        tabIndex={-1}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-106"
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget;
            const fallback = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
            if (!target.src.includes('1610832958506')) {
              target.src = fallback;
            }
          }}
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4">
            <span className="bg-white/95 text-slate-900 px-3.5 py-1.5 rounded-xl text-xs font-black tracking-wider uppercase shadow-md">
              Hết hàng
            </span>
          </div>
        )}
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4">
        {/* Category & Origin Line */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 gap-2">
          <span className="truncate font-semibold text-emerald-700/90 hover:underline">
            {product.categoryName || product.category}
          </span>
          {product.origin && (
            <span className="shrink-0 inline-flex items-center gap-1 bg-slate-100/80 px-2 py-0.5 rounded-md text-[11px] font-medium text-slate-600">
              <MapPin className="w-2.5 h-2.5 text-slate-400" />
              {product.origin}
            </span>
          )}
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${product.id}`}
          className="font-extrabold text-slate-900 group-hover:text-emerald-700 text-sm sm:text-base line-clamp-2 mb-2 transition-colors duration-200 min-h-[2.5rem] sm:min-h-[2.75rem] leading-snug"
        >
          {product.name}
        </Link>

        {/* Rating & Sold count */}
        <div className="flex items-center gap-2 mb-3.5 text-xs">
          <div className="flex items-center text-amber-500 font-bold gap-1 bg-amber-50/80 px-1.5 py-0.5 rounded-md">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
          </div>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 text-[11px]">Đã bán {product.soldCount ?? 0}</span>
        </div>

        {/* Price & Add to Cart Container */}
        <div className="mt-auto pt-3 border-t border-slate-100/90 flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1">
              <span className="text-base sm:text-lg font-black text-emerald-700 tracking-tight">
                {currentPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-xs text-slate-400 font-medium">/{product.unit || 'kg'}</span>
            </div>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through -mt-0.5 font-medium">
                {product.price.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>

          {/* Interactive Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={`relative flex items-center justify-center p-2.5 rounded-xl font-bold transition-all duration-200 cursor-pointer shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              isAddedSuccess
                ? 'bg-emerald-600 text-white scale-105 shadow-md shadow-emerald-600/30'
                : isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white active:scale-95 hover:shadow-md hover:shadow-emerald-600/20'
            }`}
            title={isOutOfStock ? 'Sản phẩm hết hàng' : 'Thêm vào giỏ hàng'}
            aria-label={isOutOfStock ? 'Hết hàng' : `Thêm ${product.name} vào giỏ hàng`}
          >
            {isAddedSuccess ? (
              <Check className="w-4 h-4 animate-scale-up" />
            ) : (
              <ShoppingBag className={`w-4 h-4 ${isAdding ? 'animate-pulse' : ''}`} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
