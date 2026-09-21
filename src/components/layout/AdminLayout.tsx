import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  ArrowLeft,
  Leaf,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { label: 'Tổng quan', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Sản phẩm', path: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Đơn hàng', path: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Khách hàng', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-64 bg-slate-900 text-white shrink-0 flex flex-col">
        {/* Header Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wide">
                Fresh<span className="text-purple-400">Admin</span>
              </span>
              <span className="text-[10px] text-purple-300 font-semibold uppercase">
                Quản trị hệ thống
              </span>
            </div>
          </Link>
        </div>

        {/* Admin User Info */}
        <div className="p-4 mx-4 my-4 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-3">
          <img
            src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">{user?.name}</span>
            <span className="text-[10px] text-purple-400 font-semibold">ADMIN</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Return to Main Store Button */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <Link
            to="/"
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400" />
            <span>Về trang bán hàng</span>
          </Link>

          <button
            onClick={logout}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-2xs">
          <h1 className="text-xl font-bold text-slate-800">Bảng Quản Trị FreshFruit</h1>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              ● Hệ thống đang hoạt động
            </span>
          </div>
        </header>

        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
};
