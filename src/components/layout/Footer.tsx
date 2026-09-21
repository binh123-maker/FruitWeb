import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Phone, Mail, MapPin, ShieldCheck, Truck, RefreshCw, Award, Globe, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      {/* Policy Highlights Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Giao Hàng Siêu Tốc</h4>
              <p className="text-xs text-slate-400">Giao trong 2H nội thành HCM</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Cam Kết Nguồn Gốc</h4>
              <p className="text-xs text-slate-400">100% Trái cây chuẩn VietGAP</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Đổi Trả Dễ Dàng</h4>
              <p className="text-xs text-slate-400">1 đổi 1 nếu hư hỏng, dập nát</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Ưu Đãi Mỗi Ngày</h4>
              <p className="text-xs text-slate-400">Giảm giá lên đến 30% hàng tuần</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">
        {/* Brand Bio */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-2xl font-extrabold text-white">
              Fresh<span className="text-emerald-400">Fruit</span>
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            FreshFruit chuyên cung cấp trái cây tươi ngon, trái cây nhập khẩu cao cấp và trái cây Việt Nam đạt chuẩn hữu cơ. Mang sức khỏe và năng lượng tươi mới đến từng gia đình Việt.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
              <Globe className="w-4 h-4" />
            </a>
            <a href="#" className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
              <Share2 className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-base">Liên kết nhanh</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li><Link to="/" className="hover:text-emerald-400 transition-colors">Trang chủ</Link></li>
            <li><Link to="/products" className="hover:text-emerald-400 transition-colors">Tất cả sản phẩm</Link></li>
            <li><Link to="/categories/trai-cay-nhap-khau" className="hover:text-emerald-400 transition-colors">Trái cây nhập khẩu</Link></li>
            <li><Link to="/categories/trai-cay-viet-nam" className="hover:text-emerald-400 transition-colors">Trái cây Việt Nam</Link></li>
            <li><Link to="/categories/combo-trai-cay" className="hover:text-emerald-400 transition-colors">Combo giỏ quà</Link></li>
          </ul>
        </div>

        {/* Policies */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-base">Chính sách</h4>
          <ul className="flex flex-col gap-2 text-sm text-slate-400">
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Chính sách giao hàng</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Chính sách đổi trả & hoàn tiền</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Chính sách bảo mật thông tin</a></li>
            <li><a href="#" className="hover:text-emerald-400 transition-colors">Điều khoản dịch vụ</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h4 className="font-bold text-white text-base">Thông tin liên hệ</h4>
          <ul className="flex flex-col gap-3 text-sm text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>123 Nguyễn Thị Minh Khai, Quận 1, TP. Hồ Chí Minh</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hotline: 1900 6868 (8:00 - 21:00)</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Email: hotro@freshfruit.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
        © 2026 FreshFruit – Website Bán Trái Cây Online. Tất cả quyền được bảo lưu.
      </div>
    </footer>
  );
};
