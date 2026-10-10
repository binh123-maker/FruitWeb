import React from 'react';
import { MapPin, Navigation, ShieldCheck, Truck, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';

export const About: React.FC = () => {
  const storeInfo = {
    address: 'Số 34, Thôn 4, Xã Phú Xuân, Đắk Lắk',
    commune: 'Xã Phú Xuân',
    province: 'Đắk Lắk',
    serviceArea: 'Chỉ phục vụ giao hàng tận nơi trong phạm vi Xã Phú Xuân, Đắk Lắk',
    // Google Maps search query centered on Xã Phú Xuân, Đắk Lắk
    mapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=X%C3%A3+Ph%C3%BA+Xu%C3%A2n,+Kr%C3%B4ng+N%C4%83ng,+%C4%90%E1%BA%AFk+L%E1%BA%AFk',
    mapsEmbedUrl: 'https://maps.google.com/maps?q=X%C3%A3+Ph%C3%BA+Xu%C3%A2n,+Kr%C3%B4ng+N%C4%83ng,+%C4%90%E1%BA%AFk+L%E1%BA%AFk&t=&z=14&ie=UTF8&iwloc=&output=embed',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-emerald-700/40">
        <div className="relative z-10 max-w-2xl flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Giới Thiệu Cửa Hàng FreshFruit
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Trái Cây Tươi Ngon Cho <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-200 to-amber-300">
              Bà Con Xã Phú Xuân, Đắk Lắk
            </span>
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
            FreshFruit chuyên cung cấp các loại trái cây nội địa chuẩn VietGAP và trái cây nhập khẩu tươi ngon, tuyển chọn kỹ càng từng quả. Chúng tôi phục vụ giao hàng tận nơi nhanh chóng, bảo đảm độ tươi mới đến từng hộ gia đình tại địa phương.
          </p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Address Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <MapPin className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Địa Chỉ Cửa Hàng</h3>
          <p className="text-slate-700 font-bold text-sm leading-relaxed">
            {storeInfo.address}
          </p>
          <span className="text-xs text-slate-400 mt-auto">
            Điểm nhận hàng & đóng gói trực tiếp
          </span>
        </div>

        {/* Delivery Scope Card */}
        <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs flex flex-col gap-3 bg-emerald-50/30">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Phạm Vi Giao Hàng</h3>
          <p className="text-emerald-900 font-bold text-sm leading-relaxed">
            {storeInfo.serviceArea}
          </p>
          <span className="text-xs text-emerald-700 font-medium mt-auto">
            * Chỉ giao hàng nội bộ trong Xã Phú Xuân
          </span>
        </div>

        {/* Quality Guarantee Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">Cam Kết Chất Lượng</h3>
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
            100% trái cây được kiểm tra trước khi đóng gói. Bao đổi trả hoặc hoàn tiền nếu trái cây có dấu hiệu hư hỏng hay không đạt chuẩn độ tươi mát.
          </p>
          <span className="text-xs text-slate-400 mt-auto">
            Đổi trả linh hoạt trong ngày
          </span>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Vị Trí & Bản Đồ Cửa Hàng
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Khu vực Xã Phú Xuân, Huyện Krông Năng, Tỉnh Đắk Lắk
            </p>
          </div>

          <a
            href={storeInfo.mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit"
          >
            <Button
              variant="outline"
              size="md"
              icon={<Navigation className="w-4 h-4 text-emerald-600" />}
              className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
            >
              Mở Trên Google Maps
            </Button>
          </a>
        </div>

        {/* Notice on Map Precision */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Lưu ý về vị trí bản đồ: </span>
            Bản đồ bên dưới hiển thị phạm vi hành chính Xã Phú Xuân, Đắk Lắk. Do cửa hàng nằm tại <strong>Số 34, Thôn 4, Xã Phú Xuân</strong> và chưa có tọa độ GPS chi tiết chính thức, vị trí ghim cụ thể trên bản đồ cần được chủ cửa hàng xác nhận trước khi công bố mốc cố định. Quý khách vui lòng liên hệ trực tiếp khi cần chỉ đường cụ thể.
          </div>
        </div>

        {/* Embedded Google Maps */}
        <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
          <iframe
            title="Bản đồ vị trí cửa hàng FreshFruit tại Xã Phú Xuân, Đắk Lắk"
            src={storeInfo.mapsEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100 gap-2">
          <span>FreshFruit — Số 34, Thôn 4, Xã Phú Xuân, Đắk Lắk</span>
          <span>Phục vụ giao hàng nhanh tận nhà trong xã</span>
        </div>
      </div>
    </div>
  );
};
