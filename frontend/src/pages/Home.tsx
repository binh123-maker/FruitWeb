import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Award,
  ShieldCheck,
  Truck,
  Leaf,
  Copy,
  Check,
  MapPin,
} from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/common/Button';
import { useToast } from '../context/ToastContext';

export const Home: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, featured, best] = await Promise.all([
          productService.getCategories(),
          productService.getFeaturedProducts(8),
          productService.getBestSellers(8),
        ]);
        setCategories(cats);
        setFeaturedProducts(featured);
        setBestSellers(best);
      } catch (error) {
        console.error('Error loading home data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã ưu đãi: ${code}`, 'success');
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-12 sm:gap-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white py-14 sm:py-20 lg:py-24 rounded-3xl mx-3 sm:mx-6 lg:mx-8 shadow-2xl mt-4 border border-emerald-800/40">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Nguồn Trái Cây Tươi Chuẩn VietGAP & Nhập Khẩu</span>
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.18] text-white">
              Trái Cây Tươi Ngon, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-300">
                Mọng Nước Giao Tận Cửa
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-normal">
              FreshFruit kết nối những nhà vườn uy tín hàng đầu và nguồn trái cây nhập khẩu trực tiếp, mang đến vitamin tự nhiên tươi mát cho sức khỏe gia đình bạn mỗi ngày.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-1">
              <Link to="/products">
                <Button variant="primary" size="lg" icon={<ShoppingBag className="w-5 h-5" />}>
                  Khám Phá Cửa Hàng
                </Button>
              </Link>
              <Link to="/categories/trai-cay-nhap-khau">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:border-white shadow-xs backdrop-blur-xs"
                >
                  Trái Cây Nhập Khẩu
                </Button>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 w-full max-w-lg">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-amber-300">Trong Ngày</span>
                <span className="text-xs text-slate-300 font-medium">Giao Xã Phú Xuân</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-emerald-300">100%</span>
                <span className="text-xs text-slate-300 font-medium">Nguồn gốc rõ ràng</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-amber-300">1 Đổi 1</span>
                <span className="text-xs text-slate-300 font-medium">Bảo hành dập hỏng</span>
              </div>
            </div>
          </div>

          {/* Hero Right Visual Card */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-2 border-white/15 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80"
                alt="Trái cây tươi mát"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex flex-col justify-end p-6 sm:p-7">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/90 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                    Ưu đãi chào bạn mới
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">Giảm 10% Cho Đơn Hàng Đầu Tiên</h2>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-slate-300">Mã ưu đãi:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode('FRESH10')}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-2.5 py-1 rounded-lg transition-all active:scale-95 cursor-pointer shadow-xs"
                    title="Sao chép mã"
                  >
                    <span>FRESH10</span>
                    {copiedCode === 'FRESH10' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local Delivery Area Notice */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-4 sm:-mt-6">
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-950 text-xs sm:text-sm">
                  Thông báo phạm vi giao hàng
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200/70 text-emerald-900 text-[10px] font-black uppercase">
                  Nội Xã
                </span>
              </div>
              <p className="text-slate-600 text-xs mt-0.5">
                FreshFruit hiện chỉ phục vụ giao hàng trong <strong>Xã Phú Xuân, Đắk Lắk</strong> (Cơ sở tại Số 34, Thôn 4).
              </p>
            </div>
          </div>
          <Link
            to="/about"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-100/50 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-all shadow-2xs whitespace-nowrap self-end sm:self-auto"
          >
            Xem Bản Đồ & Chỉ Đường →
          </Link>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" /> Danh Mục Chọn Lọc
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Khám Phá Theo Nhóm Trái Cây
            </h2>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-xs hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback =
                      'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80';
                    if (!target.src.includes('1610832958506')) {
                      target.src = fallback;
                    }
                  }}
                />
              </div>
              <div className="p-3.5 text-center flex flex-col items-center">
                <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">
                  {cat.name}
                </h3>
                {cat.productCount !== undefined && (
                  <span className="text-[11px] font-semibold text-slate-400 mt-0.5">
                    {cat.productCount} sản phẩm
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Tuyển Chọn Tươi Mới
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Sản Phẩm Nổi Bật Tuần Này
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>Xem thêm</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={isLoading} />
      </section>

      {/* Special Promotional Banner with Real Coupon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-7 sm:p-10 lg:p-12 text-white shadow-xl shadow-orange-500/15 flex flex-col md:flex-row items-center justify-between gap-8 border border-amber-400/40">
          <div className="flex flex-col gap-3.5 max-w-xl">
            <span className="px-3 py-1 bg-white/20 rounded-full text-[11px] font-black uppercase tracking-wider w-fit backdrop-blur-xs">
              Mã Giảm Giá Đơn Đầu
            </span>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight">
              Giảm Ngay 50.000 VNĐ Cho Đơn Hàng Từ 300.000đ
            </h3>
            <p className="text-white/95 text-xs sm:text-sm leading-relaxed">
              Áp dụng cho mọi loại trái cây nội địa và nhập khẩu. Nhập mã tại trang giỏ hàng để nhận ưu đãi tức thì:
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleCopyCode('WELCOME50')}
                className="inline-flex items-center gap-2 bg-white text-orange-600 hover:bg-orange-50 px-3.5 py-2 rounded-xl font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <span>MÃ: WELCOME50</span>
                {copiedCode === 'WELCOME50' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <Link to="/products">
                <Button variant="secondary" size="md" className="bg-slate-950 hover:bg-slate-900 text-white">
                  Mua Sắm Ngay
                </Button>
              </Link>
            </div>
          </div>

          <div className="w-full md:w-72 lg:w-80 aspect-4/3 md:aspect-square rounded-2xl overflow-hidden border-2 border-white/25 shadow-lg shrink-0">
            <img
              src="https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=600&q=80"
              alt="Khuyến mãi trái cây"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-6 sm:mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Bán Chạy Nhất
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Khách Hàng Yêu Thích Nhất
            </h2>
          </div>
          <Link
            to="/products?sort=bestseller"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
          >
            <span>Xem tất cả</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={bestSellers} isLoading={isLoading} />
      </section>

      {/* Why Choose FreshFruit Section */}
      <section className="bg-slate-100/70 py-14 sm:py-16 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">
              Cam Kết Thương Hiệu
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
              Tại Sao Bạn Nên Chọn FreshFruit?
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-2 leading-relaxed">
              Chúng tôi kiểm soát nghiêm ngặt chất lượng từ thu hoạch, kiểm dịch đến bảo quản mát để bạn thưởng thức vị ngọt lành trọn vẹn nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Chuẩn VietGAP & GlobalGAP</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                100% trái cây có xuất xứ chứng nhận rõ ràng, không hóa chất bảo quản độc hại, tuyệt đối an toàn cho trẻ nhỏ.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Truck className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Bảo Quản Chuẩn Nhiệt Độ Mát</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Quy trình vận chuyển chuyên nghiệp giữ trọn độ giòn ngọt mọng nước tự nhiên của từng loại quả.
              </p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center text-center gap-3.5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">Bảo Hành 1 Đổi 1 Trong 24H</h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal">
                Đổi mới hoàn toàn không tốn phí nếu trái cây có dấu hiệu dập úng, nẫu hỏng hoặc không đạt chất lượng cam kết.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
