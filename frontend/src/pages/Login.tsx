import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Leaf, LogIn, UserCheck, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Vui lòng điền email và mật khẩu!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      showToast('Đăng nhập thành công!', 'success');
      navigate(from, { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Đăng nhập thất bại. Kiểm tra lại thông tin!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('123456');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Chào Mừng Quay Lại</h1>
          <p className="text-xs text-slate-500">Đăng nhập tài khoản FreshFruit để mua sắm nhanh chóng</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
          <Input
            label="Địa chỉ Email"
            type="email"
            required
            placeholder="admin@freshfruit.com hoặc user@freshfruit.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Mật khẩu"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <Link to="/forgot-password" className="text-emerald-600 font-bold hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
            icon={<LogIn className="w-5 h-5" />}
          >
            Đăng Nhập
          </Button>
        </form>

        {/* Quick Demo Login Preset Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
          <span className="text-[11px] font-bold uppercase text-slate-400 text-center">
            Tài Khoản Dùng Thử Nhanh (Demo)
          </span>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('user@freshfruit.com')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:border-emerald-200 transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Khách Hàng</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin@freshfruit.com')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 text-xs font-bold text-slate-700 hover:text-purple-700 hover:border-purple-200 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Quản Trị Admin</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
