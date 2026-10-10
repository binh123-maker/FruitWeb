import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Award, Globe, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      {/* Policy Highlights Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xs hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Giao Hàng Tận Nơi</h4>
              <p className="text-xs text-slate-400 mt-0.5">Phục vụ Xã Phú Xuân, Đắk Lắk</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xs hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Cam Kết Nguồn Gốc</h4>
              <p className="text-xs text-slate-400 mt-0.5">100% Trái cây tươi mới sạch</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xs hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Đổi Trả Dễ Dàng</h4>
              <p className="text-xs text-slate-400 mt-0.5">1 đổi 1 nếu hư hỏng, dập nát</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 shadow-2xs hover:border-slate-700 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-white text-sm">Ưu Đãi Mỗi Tuần</h4>
              <p className="text-xs text-slate-400 mt-0.5">Mã giảm giá hấp dẫn mỗi ngày</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">
        {/* Brand Bio */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Leaf className="w-5 h-5 fill-white/20" />
            </div>
            <span className="text-2xl font-black text-white">
              Fresh<span className="text-emerald-400">Fruit</span>
            </span>
          </Link>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
            FreshFruit chuyên cung cấp trái cây tươi ngon, ngọt lành tại Xã Phú Xuân, Đắk Lắk. Mang sự tươi mới và dinh dưỡng an lành đến mọi bàn ăn gia đình.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link to="/about" className="text-xs font-bold text-emerald-400 hover:text-emerald-300 underline">
              Xem vị trí cửa hàng trên bản đồ →
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-extrabold text-white text-sm">Liên kết nhanh</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Trang chủ</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition-colors">Giới thiệu cửa hàng</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Tất cả sản phẩm</Link></li>
            <li><Link to="/categories/trai-cay-nhap-khau" className="hover:text-emerald-400 transition-colors">Trái cây nhập khẩu</Link></li>
            <li><Link to="/categories/trai-cay-viet-nam" className="hover:text-emerald-400 transition-colors">Trái cây Việt Nam</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div className="flex flex-col gap-3">
          <h4 className="font-extrabold text-white text-sm">Chính sách</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
            <li><span className="text-slate-400">Giao hàng trong Xã Phú Xuân</span></li>
            <li><span className="text-slate-400">Đổi trả 1-đổi-1 khi dập hỏng</span></li>
            <li><span className="text-slate-400">Thanh toán COD & Online Mock</span></li>
          </ul>
        </div>

        {/* Store Location & Service Area */}
        <div className="flex flex-col gap-3">
          <h4 className="font-extrabold text-white text-sm">Cửa Hàng FreshFruit</h4>
          <ul className="flex flex-col gap-3 text-xs text-slate-400 font-medium">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Số 34, Thôn 4, Xã Phú Xuân, Tỉnh Đắk Lắk</span>
            </li>
            <li className="text-[11px] text-amber-300 font-bold">
              ★ Chỉ nhận giao hàng trong Xã Phú Xuân, Đắk Lắk
            </li>
            <li className="pt-1">
              <Link to="/about" className="text-emerald-400 hover:text-emerald-300 underline font-semibold">
                Xem bản đồ & giới thiệu cửa hàng →
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 text-center text-xs text-slate-500 font-medium">
        © 2026 FreshFruit – Hệ thống Trái Cây Tươi & Nhập Khẩu Thượng Hạng. Đạt chuẩn VietGAP.
      </div>
    </footer>
  );
};
