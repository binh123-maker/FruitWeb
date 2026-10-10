import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { User, MapPin, KeyRound, Plus, Trash2 } from 'lucide-react';

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
    if (!addressForm.address.trim() || !addressForm.phone.trim()) {
      showToast('Vui lòng điền địa chỉ và số điện thoại!', 'error');
      return;
    }
    try {
      await addAddress(addressForm);
      showToast('Thêm địa chỉ giao hàng thành công!', 'success');
      setIsAddressModalOpen(false);
      setAddressForm({
        fullName: user?.name || '',
        phone: user?.phone || '',
        address: '',
        province: 'Thành phố Hồ Chí Minh',
        district: 'Quận 1',
        ward: 'Phường Bến Nghé',
        isDefault: false,
      });
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
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tài Khoản Của Tôi
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Quản lý thông tin cá nhân, sổ địa chỉ nhận hàng và bảo mật tài khoản.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Navigation Tabs */}
        <div className="md:col-span-1 bg-white p-3 rounded-3xl border border-slate-100 shadow-xs flex flex-col gap-1.5 h-fit">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Sổ địa chỉ</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'password'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Đổi mật khẩu</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xs">
          {/* TAB 1: Profile Info */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 max-w-md">
              <h2 className="text-base sm:text-lg font-black text-slate-900">Thông Tin Hồ Sơ</h2>

              <div className="flex items-center gap-4">
                <img
                  src={profileForm.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-sm shrink-0"
                />
                <Input
                  label="URL Ảnh Đại Diện"
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

              <Input label="Email đăng nhập" value={user?.email || ''} disabled />

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
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900">Địa Chỉ Giao Hàng</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Địa chỉ mặc định sẽ tự động điền khi bạn đặt hàng.</p>
                </div>
                <Button
                  onClick={() => setIsAddressModalOpen(true)}
                  variant="primary"
                  size="sm"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Thêm Địa Chỉ Mới
                </Button>
              </div>

              <div className="flex flex-col gap-3.5">
                {!user?.addresses || user.addresses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4">Bạn chưa lưu địa chỉ nhận hàng nào.</p>
                ) : (
                  user.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                        addr.isDefault
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 text-sm">{addr.fullName}</span>
                          <span className="text-slate-500 font-semibold">({addr.phone})</span>
                          {addr.isDefault && (
                            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <span className="text-slate-600">
                          {addr.address}, {addr.ward}, {addr.district}, {addr.province}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => updateAddress(addr.id, { isDefault: true })}
                            className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                          >
                            Đặt làm mặc định
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => deleteAddress(addr.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Xóa địa chỉ"
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
              <h2 className="text-base sm:text-lg font-black text-slate-900">Thay Đổi Mật Khẩu</h2>

              <Input
                label="Mật khẩu hiện tại"
                type="password"
                required
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              />

              <Input
                label="Mật khẩu mới (Tối thiểu 6 ký tự)"
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

              <Button type="submit" variant="primary" className="w-fit mt-2">
                Cập Nhật Mật Khẩu
              </Button>
            </form>
          )}
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        title="Thêm Địa Chỉ Nhận Hàng Mới"
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
          </div>
          <Input
            label="Địa chỉ cụ thể (Số nhà, tên đường)"
            required
            value={addressForm.address}
            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
          />

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <span>Đặt làm địa chỉ nhận hàng mặc định</span>
          </label>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Lưu Địa Chỉ
          </Button>
        </form>
      </Modal>
    </div>
  );
};
