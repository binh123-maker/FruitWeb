import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Sparkles, Award, ShieldCheck, Heart, Truck, CheckCircle2 } from 'lucide-react';
import { Product, Category } from '../types';
import { productService } from '../services/productService';
import { ProductGrid } from '../components/product/ProductGrid';
import { Button } from '../components/common/Button';

export const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  return (
    <div className="flex flex-col gap-12 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white py-16 md:py-24 rounded-3xl mx-4 sm:mx-6 lg:mx-8 shadow-2xl mt-4">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400" /> Nguồn Trái Cây Tươi Sạch 100%
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Trái Cây Tươi Ngon <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-emerald-400">
                Giao Tận Tay Gia Đình
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl">
              FreshFruit mang đến những trái trái cây chuẩn VietGAP, trái cây nhập khẩu trực tiếp ngọt mộng mọng nước, giàu dinh dưỡng cho bữa ăn sức khỏe mỗi ngày.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link to="/products">
                <Button variant="primary" size="lg" icon={<ShoppingBag className="w-5 h-5" />}>
                  Khám Phá Ngay
                </Button>
              </Link>
              <Link to="/categories/combo-trai-cay">
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 hover:border-white">
                  Giỏ Quà Biếu Tặng
                </Button>
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/10 w-full max-w-md">
              <div>
                <span className="block text-2xl font-extrabold text-amber-400">25+</span>
                <span className="text-xs text-slate-300">Loại Trái Cây</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-amber-400">2H</span>
                <span className="text-xs text-slate-300">Giao Nhanh HCM</span>
              </div>
              <div>
                <span className="block text-2xl font-extrabold text-amber-400">100%</span>
                <span className="text-xs text-slate-300">An Toàn Sạch</span>
              </div>
            </div>
          </div>

          {/* Hero Banner Image Showcase */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1000&q=80"
                alt="Fresh Fruit Basket"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-6">
                <span className="text-xs font-bold uppercase text-amber-400">Ưu Đãi Đặc Biệt</span>
                <h3 className="text-xl font-bold text-white">Giảm 10% Cho Đơn Hàng Đầu Tiên</h3>
                <span className="text-xs text-slate-300 mt-1">Mã: <strong className="text-white bg-emerald-600 px-2 py-0.5 rounded">FRESH10</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Danh Mục Chọn Lọc</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Trái Cây Theo Thể Loại</h2>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Xem Tất Cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/categories/${cat.slug}`}
              className="group relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative pt-[80%] overflow-hidden bg-slate-50">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    const target = e.currentTarget;
                    const fallback = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80';
                    if (!target.src.includes('1610832958506')) {
                      target.src = fallback;
                    }
                  }}
                />
              </div>
              <div className="p-4 text-center">
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-xs text-slate-400 mt-0.5 block">{cat.productCount} sản phẩm</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Gợi Ý Nổi Bật</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Sản Phẩm Nổi Bật</h2>
          </div>
          <Link to="/products" className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
            Xem Thêm <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={featuredProducts} isLoading={isLoading} />
      </section>

      {/* Special Promotional Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-4 max-w-xl">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider w-fit">
              HOT PROMOTION
            </span>
            <h3 className="text-2xl sm:text-4xl font-extrabold leading-tight">
              Táo Fuji Nhật Bản & Nho Xanh Autumn Crisp Mỹ
            </h3>
            <p className="text-white/90 text-sm sm:text-base">
              Khuyến mãi cực sốc tuần này: Giảm ngay 50.000 VNĐ cho hóa đơn từ 300.000 VNĐ khi nhập mã <strong className="bg-white text-orange-600 px-2 py-0.5 rounded font-black">WELCOME50</strong>
            </p>
            <div className="pt-2">
              <Link to="/products">
                <Button variant="secondary" size="lg" className="bg-slate-900 hover:bg-slate-800 text-white">
                  Mua Ngay Tận Hưởng
                </Button>
              </Link>
            </div>
          </div>
          <div className="w-full md:w-80 aspect-video md:aspect-square rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg shrink-0">
            <img
              src="https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&w=600&q=80"
              alt="Promo Grapes"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Được Yêu Thích Nhất</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Sản Phẩm Bán Chạy</h2>
          </div>
          <Link to="/products?sort=bestseller" className="flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors">
            Xem Tất Cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <ProductGrid products={bestSellers} isLoading={isLoading} />
      </section>

      {/* Why Choose FreshFruit Section */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Lý Do Lựa Chọn</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Tại Sao Chọn FreshFruit?</h2>
            <p className="text-slate-600 text-sm mt-2">Chúng tôi không chỉ bán trái cây, chúng tôi mang tới chuẩn mực an toàn và sự an tâm cho sức khỏe gia đình bạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">100% Đạt Chuẩn An Toàn</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Tất cả trái cây đều có chứng nhận VietGAP, GlobalGAP hoặc chứng thư kiểm dịch nhập khẩu nghiêm ngặt.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Bảo Quản Chuẩn Lạnh</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Hệ thống kho lạnh thông minh giữ trái cây luôn trong trạng thái giòn ngọt mọng nước tự nhiên nhất khi giao đến tay khách.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-lg">Bảo Hành 1 Đổi 1</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Đổi trả trong vòng 24H nếu trái cây gặp bất kỳ lỗi hỏng, dập nát hoặc chất lượng không đúng mô tả.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
