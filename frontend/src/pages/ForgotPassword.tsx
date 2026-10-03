import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { KeyRound, Mail, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authService.sendResetOtp(email);
      showToast('Mã OTP khôi phục đã được gửi tới email của bạn (Mã dùng thử: 123456)', 'info');
      setStep(2);
    } catch (err: any) {
      showToast(err.message || 'Lỗi gửi OTP', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    try {
      await authService.verifyResetOtp(email, otp);
      showToast('Xác thực OTP thành công!', 'success');
      setStep(3);
    } catch (err: any) {
      showToast(err.message || 'Mã OTP không hợp lệ!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      showToast('Mật khẩu mới phải có ít nhất 6 ký tự!', 'error');
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email, otp, newPassword);
      showToast('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay.', 'success');
      navigate('/login');
    } catch (err: any) {
      showToast(err.message || 'Lỗi đặt lại mật khẩu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-2">Quên Mật Khẩu</h1>
          <p className="text-xs text-slate-500">
            {step === 1 && 'Nhập email để nhận mã OTP khôi phục mật khẩu'}
            {step === 2 && 'Nhập mã xác thực 6 chữ số vừa gửi đến email'}
            {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn'}
          </p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
          <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>1. Email</span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>2. OTP</span>
          <span>→</span>
          <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`}>3. Mật khẩu</span>
        </div>

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <Input
              label="Địa chỉ Email tài khoản"
              type="email"
              required
              placeholder="nguyenvana@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} icon={<ArrowRight className="w-4 h-4" />}>
              Gửi Mã OTP
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
            <Input
              label="Mã OTP 6 Chữ Số"
              required
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <div className="text-[11px] text-slate-400 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-emerald-700">
              💡 Mã OTP dùng thử mặc định là: <strong className="text-emerald-900">123456</strong>
            </div>
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
              Xác Nhận OTP
            </Button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
            <Input
              label="Mật khẩu mới"
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
              Đổi Mật Khẩu & Đăng Nhập
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Nhớ lại mật khẩu?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:underline">
            Quay lại Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};
