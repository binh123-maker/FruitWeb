import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Leaf, LogIn, Eye, EyeOff, Mail, Lock, ShieldCheck, Truck, Sparkles, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Field validation errors
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Vui lòng nhập địa chỉ email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Địa chỉ email không đúng định dạng.';
    }

    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      showToast('Đăng nhập thành công! Chào mừng bạn quay lại.', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email hoặc mật khẩu!';
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
          {/* Background Ambient Glow */}
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

          {/* Middle Visual Card */}
          <div className="relative z-10 my-8">
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-xl aspect-4/3 mb-6">
              <img
                src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=700&q=80"
                alt="Trái cây tươi ngon FreshFruit"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-semibold text-emerald-200">
                  Tươi ngon từ nông trại tới bàn ăn
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>100% Trái cây sạch đạt chuẩn VietGAP & Nhập khẩu</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <span>Giao hàng nhanh trong ngày tại Xã Phú Xuân</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Mã giảm giá và ưu đãi hấp dẫn mỗi tuần</span>
              </div>
            </div>
          </div>

          {/* Bottom Quality Promise */}
          <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-slate-400">
            © 2026 FreshFruit. Cam kết bảo hành 1 đổi 1 trong 24 giờ.
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
              Chào Mừng Quay Lại!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Đăng nhập tài khoản FreshFruit để quản lý đơn hàng và nhận ưu đãi riêng.
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
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4.5" noValidate>
            <Input
              id="login-email"
              label="Địa chỉ Email"
              type="email"
              required
              placeholder="example@gmail.com"
              value={email}
              error={fieldErrors.email}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              autoComplete="email"
            />

            <Input
              id="login-password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Nhập mật khẩu"
              value={password}
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
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full mt-2 shadow-md shadow-emerald-600/20 font-bold"
              icon={!isLoading ? <LogIn className="w-4 h-4" /> : undefined}
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </Button>
          </form>

          {/* Footer Navigation Link */}
          <div className="text-center text-xs text-slate-500 pt-3 border-t border-slate-100">
            Chưa có tài khoản FreshFruit?{' '}
            <Link
              to="/register"
              className="font-extrabold text-emerald-700 hover:text-emerald-800 hover:underline transition-colors ml-1"
            >
              Đăng ký tài khoản mới →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
