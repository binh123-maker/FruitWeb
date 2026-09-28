import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Address } from '../types';
import { User, MapPin, KeyRound, Plus, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile, addAddress, deleteAddress, updateAddress } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'password'>('profile');

  // Personal Info Form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
  });

  // New Address Modal Form
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    address: '',
    province: 'Thành phố Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Phường Bến Nghé',
    isDefault: false,
  });

  // Change Password Form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await updateProfile(profileForm);
      showToast('Cập nhật thông tin cá nhân thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật profile', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.address || !addressForm.phone) {
      showToast('Vui lòng điền địa chỉ và số điện thoại!', 'error');
      return;
    }
    try {
      await addAddress(addressForm);
      showToast('Thêm địa chỉ giao hàng thành công!', 'success');
      setIsAddressModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lỗi thêm địa chỉ', 'error');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast('Mật khẩu xác nhận không trùng khớp!', 'error');
      return;
    }
    showToast('Đổi mật khẩu thành công (Mô phỏng)!', 'success');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 pb-4 border-b border-slate-200">
        Tài Khoản Của Tôi
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col gap-1 h-fit">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Sổ địa chỉ</span>
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'password'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-xs">
          {/* TAB 1: Profile Info */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 max-w-md">
              <h3 className="text-lg font-bold text-slate-800">Cập Nhật Thông Tin</h3>

              <div className="flex items-center gap-4">
                <img
                  src={profileForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <Input
                  label="Link Ảnh Đại Diện (Avatar URL)"
                  value={profileForm.avatar}
                  onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <Input
                label="Họ và tên"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
              />

              <Input label="Email" value={user?.email || ''} disabled />

              <Input
                label="Số điện thoại"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />

              <Button type="submit" variant="primary" isLoading={isLoading} className="w-fit">
                Lưu Thay Đổi
              </Button>
            </form>
          )}

          {/* TAB 2: Addresses */}
          {activeTab === 'addresses' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Địa Chỉ Giao Hàng</h3>
                <Button
                  onClick={() => setIsAddressModalOpen(true)}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Thêm Địa Chỉ Mới
                </Button>
              </div>

              <div className="flex flex-col gap-4">
                {user?.addresses?.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Bạn chưa có địa chỉ nhận hàng nào saved.</p>
                ) : (
                  user?.addresses?.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        addr.isDefault ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{addr.fullName}</span>
                          <span className="text-slate-500">({addr.phone})</span>
                          {addr.isDefault && (
                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <span className="text-slate-600">
                          {addr.address}, {addr.ward}, {addr.district}, {addr.province}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!addr.isDefault && (
                          <button
                            onClick={() => updateAddress(addr.id, { isDefault: true })}
                            className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                          >
                            Thiết lập mặc định
                          </button>
                        )}
                        <button
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: Password */}
          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4 max-w-md">
              <h3 className="text-lg font-bold text-slate-800">Thay Đổi Mật Khẩu</h3>

              <Input
                label="Mật khẩu hiện tại"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />

              <Input
                label="Mật khẩu mới"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              />

              <Input
                label="Xác nhận mật khẩu mới"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              />

              <Button type="submit" variant="primary" className="w-fit">
                Đổi Mật Khẩu
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Thêm Địa Chỉ Giao Hàng Mới"
      >
        <form onSubmit={handleAddAddress} className="flex flex-col gap-4">
          <Input
            label="Họ và tên người nhận"
            required
            value={addressForm.fullName}
            onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
          />
          <Input
            label="Số điện thoại"
            required
            value={addressForm.phone}
            onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
          />
          <Input
            label="Tỉnh / Thành phố"
            value={addressForm.province}
            onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
          />
          <Input
            label="Quận / Huyện"
            value={addressForm.district}
            onChange={(e) => setAddressForm({ ...addressForm, district: e.target.value })}
          />
          <Input
            label="Phường / Xã"
            value={addressForm.ward}
            onChange={(e) => setAddressForm({ ...addressForm, ward: e.target.value })}
          />
          <Input
            label="Số nhà, Tên đường"
            required
            value={addressForm.address}
            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
          />

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>Đặt làm địa chỉ giao hàng mặc định</span>
          </label>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Lưu Địa Chỉ
          </Button>
        </form>
      </Modal>
    </div>
  );
};
