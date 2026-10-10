import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { QuantitySelector } from '../components/product/QuantitySelector';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RefreshCw,
  MapPin,
  Package,
  ChevronRight,
  Sparkles,
  Check,
  Home as HomeIcon,
} from 'lucide-react';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddedSuccess, setIsAddedSuccess] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await productService.getProductById(id);
        if (found) {
          setProduct(found);
          const related = await productService.getRelatedProducts(found.id, found.category, 4);
          setRelatedProducts(related);
        } else {
          setProduct(null);
        }
      } catch (err) {
        console.error('Error loading product detail:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner label="Đang tải chi tiết trái cây tươi..." size="lg" />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Không Tìm Thấy Sản Phẩm</h2>
        <p className="text-slate-500 text-sm max-w-md">
          Sản phẩm bạn đang tìm kiếm hiện không tồn tại hoặc đã tạm dừng phân phối.
        </p>
        <Link to="/products" className="mt-2">
          <Button variant="primary">Khám phá các sản phẩm khác</Button>
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice && product.salePrice < product.price ? product.salePrice : product.price;
  const hasDiscount = Boolean(product.salePrice && product.salePrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = async () => {
    if (isOutOfStock || isAdding) return;
    setIsAdding(true);
    try {
      await addToCart(product, quantity);
      setIsAddedSuccess(true);
      setTimeout(() => setIsAddedSuccess(false), 1600);
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) return;
    await addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-10">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto py-1">
        <Link to="/" className="hover:text-emerald-700 transition-colors flex items-center gap-1">
          <HomeIcon className="w-3.5 h-3.5" />
          <span>Trang chủ</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link to="/products" className="hover:text-emerald-700 transition-colors">
          Sản phẩm
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        {product.category && (
          <>
            <Link to={`/categories/${product.category}`} className="hover:text-emerald-700 transition-colors truncate">
              {product.categoryName || product.category}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </>
        )}
        <span className="text-slate-900 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-xs">
        {/* Left Column: Product Image Frame */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 group shadow-2xs">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
              onError={(e) => {
                const target = e.currentTarget;
                const fallback =
                  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80';
                if (!target.src.includes('1610832958506')) {
                  target.src = fallback;
                }
              }}
            />

            {/* Badges Overlay */}
            {hasDiscount && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1.5 text-xs font-black rounded-xl bg-rose-500 text-white shadow-md">
                -{discountPercent}% GIẢM
              </span>
            )}

            {/* Wishlist Button */}
            <button
              type="button"
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xs ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 scale-105 border border-rose-200'
                  : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:bg-white hover:scale-105 border border-white/60'
              }`}
              title={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              aria-label={isWishlisted ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>

            {isOutOfStock && (
              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-white text-slate-900 px-4 py-2 rounded-xl text-sm font-black tracking-wider uppercase shadow-xl">
                  HẾT HÀNG
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Product Info & Actions */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/80">
                {product.categoryName || product.category}
              </span>
              {product.isOrganic && (
                <Badge variant="emerald" dot>
                  Organic Chuẩn Sạch
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge variant="amber" dot>
                  Bán chạy nhất
                </Badge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight tracking-tight">
              {product.name}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5 text-amber-500 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-slate-900">{product.rating > 0 ? product.rating.toFixed(1) : '5.0'}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount ?? 0} đánh giá)</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-semibold text-xs sm:text-sm">
                Đã bán: <strong className="text-slate-900">{product.soldCount ?? 0}</strong>
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="bg-gradient-to-r from-emerald-50/70 to-slate-50 p-4 sm:p-5 rounded-2xl border border-emerald-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Giá bán</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {currentPrice.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-sm font-semibold text-slate-500">/{product.unit || 'kg'}</span>
              </div>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through font-medium mt-0.5">
                  Giá gốc: {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Tình trạng:</span>
              <span
                className={`text-xs font-black mt-0.5 inline-block ${
                  product.stock > 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}
              >
                {product.stock > 0 ? `Còn hàng (${product.stock} ${product.unit || 'kg'})` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {/* Specifications Pills */}
          <div className="grid grid-cols-2 gap-3.5 text-xs">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-2xs border border-slate-100">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Nguồn gốc / Xuất xứ</span>
                <span className="font-bold text-slate-900">{product.origin || 'Việt Nam'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-2xs border border-slate-100">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Đơn vị đóng gói</span>
                <span className="font-bold text-slate-900">{product.unit || 'Kg'}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="flex flex-col gap-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">Mô tả sản phẩm</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Quantity Stepper & Buttons */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold text-slate-700">Chọn số lượng:</span>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity((q) => Math.min(q + 1, product.stock))}
                onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
                max={product.stock}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isAdding}
                variant="outline"
                size="lg"
                icon={
                  isAddedSuccess ? (
                    <Check className="w-5 h-5 text-emerald-600 animate-scale-up" />
                  ) : (
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  )
                }
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 active:scale-95"
              >
                {isAddedSuccess ? 'Đã Thêm Vào Giỏ!' : 'Thêm Vào Giỏ'}
              </Button>

              <Button
                type="button"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                variant="primary"
                size="lg"
                icon={<Sparkles className="w-5 h-5 text-amber-200" />}
                className="active:scale-95"
              >
                Mua Ngay
              </Button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-semibold text-center">
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/60">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Giao Hàng 2H</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chuẩn VietGAP</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50/60">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>1 Đổi 1 Trong 24H</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-6 pt-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Sản Phẩm Cùng Danh Mục
            </h2>
            <Link
              to={`/categories/${product.category}`}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
            >
              Xem tất cả nhóm này →
            </Link>
          </div>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
};
