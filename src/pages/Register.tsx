import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Leaf, UserPlus } from 'lucide-react';

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

  const [isLoading, setIsLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Mật khẩu phải từ 6 ký tự trở lên!', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Mật khẩu xác nhận không trùng khớp!', 'error');
      return;
    }

    setIsLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      showToast('Tạo tài khoản thành công! Tự động đăng nhập...', 'success');
      navigate('/');
    } catch (err: any) {
      showToast(err.message || 'Đăng ký thất bại. Email có thể đã tồn tại!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <Leaf className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Tạo Tài Khoản Mới</h1>
          <p className="text-xs text-slate-500">Tham gia FreshFruit để nhận ưu đãi mua sắm trái cây tươi</p>
        </div>

        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          <Input
            label="Họ và tên"
            required
            placeholder="Nguyễn Văn A"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Input
            label="Địa chỉ Email"
            type="email"
            required
            placeholder="nguyenvana@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Số điện thoại"
            placeholder="0912345678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Mật khẩu (Tối thiểu 6 ký tự)"
            type="password"
            required
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            required
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isLoading}
            className="w-full mt-2"
            icon={<UserPlus className="w-5 h-5" />}
          >
            Tạo Tài Khoản
          </Button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
