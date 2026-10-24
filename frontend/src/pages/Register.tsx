import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import {
  Leaf,
  UserPlus,
  Eye,
  EyeOff,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};

    if (!formData.name.trim()) {
      errors.name = 'Vui lòng nhập họ và tên của bạn.';
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Địa chỉ email không đúng định dạng.';
    }

    if (formData.phone.trim() && !/^[0-9]{9,11}$/.test(formData.phone.trim().replace(/\s+/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ (từ 9 đến 11 chữ số).';
    }

    if (!formData.password) {
      errors.password = 'Vui lòng tạo mật khẩu.';
    } else if (formData.password.length < 6) {
      errors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      showToast('Đăng ký tài khoản thành công! Tự động chuyển hướng...', 'success');
      navigate('/');
    } catch (err: any) {
      const message =
        err.message || 'Đăng ký không thành công. Địa chỉ email có thể đã được đăng ký!';
      setApiError(message);
      showToast(message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-900/5 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Brand Showcase (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 text-white p-8 flex-col justify-between overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/25">
              <Leaf className="w-5 h-5 fill-white/20" />
            </div>
            <span className="text-xl font-black text-white">
              Fresh<span className="text-emerald-400">Fruit</span>
            </span>
          </div>

          {/* Middle Visual Card & Member Perks */}
          <div className="relative z-10 my-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl aspect-4/3 mb-6">
              <img
                src="https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=700&q=80"
                alt="Trái cây tuyển chọn tươi ngon"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-semibold text-emerald-200">
                  Đặc quyền thành viên FreshFruit Club
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4" />
                </div>
                <span>Tặng ngay mã ưu đãi 10% cho đơn hàng đầu tiên</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Theo dõi lịch sử và tiến độ giao hàng trực tiếp</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Ưu tiên bảo hành 1 đổi 1 nhanh chóng</span>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400">
            Dữ liệu cá nhân được mã hóa và bảo mật an toàn tuyệt đối.
          </div>
        </div>

        {/* Right Column: Form Container */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between gap-6">
          {/* Header */}
          <div className="flex flex-col gap-2">
            <div className="lg:hidden flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-xs">
                <Leaf className="w-4 h-4 fill-white/20" />
              </div>
              <span className="text-lg font-black text-slate-900">
                Fresh<span className="text-emerald-600">Fruit</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tạo Tài Khoản Mới
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Trở thành thành viên FreshFruit để trải nghiệm mua sắm tiện lợi và nhận nhiều ưu đãi.
            </p>
          </div>

          {/* API Error Alert */}
          {apiError && (
            <div
              role="alert"
              className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-fadeIn"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{apiError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4" noValidate>
            <Input
              id="register-name"
              label="Họ và tên"
              required
              placeholder="Nguyễn Văn A"
              value={formData.name}
              error={fieldErrors.name}
              leftIcon={<UserIcon className="w-4 h-4 text-slate-400" />}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              autoComplete="name"
            />

            <Input
              id="register-email"
              label="Địa chỉ Email"
              type="email"
              required
              placeholder="example@gmail.com"
              value={formData.email}
              error={fieldErrors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              autoComplete="email"
            />

            <Input
              id="register-phone"
              label="Số điện thoại"
              placeholder="0912 345 678"
              value={formData.phone}
              error={fieldErrors.phone}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              autoComplete="tel"
            />

            <Input
              id="register-password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Tối thiểu 6 ký tự"
              value={formData.password}
              error={fieldErrors.password}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer focus:outline-none flex items-center justify-center"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              autoComplete="new-password"
            />

            <Input
              id="register-confirm-password"
              label="Xác nhận mật khẩu"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Nhập lại mật khẩu vừa tạo"
              value={formData.confirmPassword}
              error={fieldErrors.confirmPassword}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              onChange={(e) => {
                setFormData({ ...formData, confirmPassword: e.target.value });
                if (fieldErrors.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }
              }}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full mt-2 shadow-md shadow-emerald-600/20 font-bold"
              icon={!isLoading ? <UserPlus className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'Đang tạo tài khoản...' : 'Tạo Tài Khoản'}
            </Button>
          </form>

          {/* Footer Navigation Link */}
          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Đã có tài khoản FreshFruit?{' '}
            <Link
              to="/login"
              className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors ml-1"
            >
              Đăng nhập ngay →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
