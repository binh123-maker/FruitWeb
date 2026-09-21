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
    return <LoadingSpinner label="Đang tải chi tiết sản phẩm..." />;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Không tìm thấy sản phẩm</h2>
        <p className="text-slate-500">Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        <Link to="/products">
          <Button variant="primary">Khám phá các sản phẩm khác</Button>
        </Link>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const currentPrice = product.salePrice || product.price;
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const handleBuyNow = async () => {
    await addToCart(product, quantity);
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link to="/" className="hover:text-emerald-600 transition-colors">Trang chủ</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-emerald-600 transition-colors">Sản phẩm</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-800 font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-sm">
        {/* Left: Product Image Showcase */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {hasDiscount && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 text-xs font-bold rounded-xl bg-rose-500 text-white shadow-md">
                -{discountPercent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product)}
              className={`absolute top-4 right-4 z-10 p-3 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-500 scale-110 shadow-md'
                  : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right: Product Details & Actions */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                {product.categoryName || product.category}
              </span>
              {product.isOrganic && <Badge variant="emerald">Organic</Badge>}
              {product.isBestSeller && <Badge variant="amber">Bán chạy nhất</Badge>}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating & Sold count */}
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="text-slate-800">{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} đánh giá)</span>
              </div>
              <span className="text-slate-300">•</span>
              <span className="text-slate-600 font-medium">Đã bán: <strong className="text-slate-800">{product.soldCount}</strong></span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-emerald-600">
                {currentPrice.toLocaleString('vi-VN')}đ
              </span>
              <span className="text-sm font-semibold text-slate-500">/{product.unit}</span>
              {hasDiscount && (
                <span className="text-sm text-slate-400 line-through font-medium">
                  {product.price.toLocaleString('vi-VN')}đ
                </span>
              )}
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block">Tình trạng kho:</span>
              <span className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {product.stock > 0 ? `Còn hàng (${product.stock} ${product.unit})` : 'Hết hàng'}
              </span>
            </div>
          </div>

          {/* Fruit Specs */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">Xuất xứ</span>
                <span className="font-bold text-slate-800">{product.origin}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <Package className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="text-slate-400 block">Đơn vị tính</span>
                <span className="font-bold text-slate-800">{product.unit}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Mô tả sản phẩm</h4>
            <p className="text-slate-600 text-sm leading-relaxed">{product.description}</p>
          </div>

          {/* Quantity Selector & Action Buttons */}
          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-700">Số lượng:</span>
              <QuantitySelector
                quantity={quantity}
                onIncrease={() => setQuantity((q) => Math.min(q + 1, product.stock))}
                onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
                max={product.stock}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock <= 0}
                variant="outline"
                size="lg"
                icon={<ShoppingBag className="w-5 h-5 text-emerald-600" />}
                className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                Thêm Vào Giỏ
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                variant="primary"
                size="lg"
                icon={<Sparkles className="w-5 h-5 text-amber-300" />}
              >
                Mua Ngay
              </Button>
            </div>
          </div>

          {/* Security & Service Badges */}
          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-[11px] text-slate-500 font-medium text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Giao Hàng 2H</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chuẩn VietGAP</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>Bảo Hành 1 Đổi 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="flex flex-col gap-6">
          <h3 className="text-xl font-extrabold text-slate-900">Sản Phẩm Cùng Danh Mục</h3>
          <ProductGrid products={relatedProducts} />
        </section>
      )}
    </div>
  );
};
